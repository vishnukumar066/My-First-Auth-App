import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import { send } from "process";

// Twilio client initialization
//const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
async function sendVerificationCodeBySMS(phoneNumber, verificationCode) {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: `Your verification code is ${verificationCode} please do not share this code with anyone.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });
}

export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, phone, password, verificationMethod } = req.body;
    if (!name || !email || !phone || !password || !verificationMethod) {
      return next(new ErrorHandler("Please fill all the fields", 400));
    }

    function validatePhoneNumber(phone) {
      const phoneRegex = /^\+91\d{10}$/;
      return phoneRegex.test(phone);
    }

    if (!validatePhoneNumber(phone)) {
      return next(
        new ErrorHandler(
          "Invalid phone number format. It should be in the format +91XXXXXXXXXX",
          400,
        ),
      );
    }

    const exitingUser = await User.findOne({
      $or: [
        {
          email: email,
          accountVerified: true,
        },
        {
          phone: phone,
          accountVerified: true,
        },
      ],
    });

    if (exitingUser) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const registrationAttemptsByUser = await User.find({
      $or: [
        {
          email: email,
          accountVerified: false,
        },
        {
          phone: phone,
          accountVerified: false,
        },
      ],
    });

    if (registrationAttemptsByUser.length >= 5) {
      return next(
        new ErrorHandler(
          "You have exceeded the maximum number (5) of registration attempts. Please try again later.",
          429,
        ),
      );
    }

    const userData = {
      name,
      email,
      phone,
      password,
      verificationMethod,
    };

    const user = await User.create(userData);
    const verificationCode = user.generateVerificationCode();
    await user.save();

    sendVerificationCode(
      verificationMethod,
      verificationCode,
      name,
      email,
      phone,
      res,
    );
  } catch (error) {
    console.log("Error while registering: ", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
});

// Sending verification code to user for registration
async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  name,
  email,
  phone,
  res,
) {
  try {
    if (verificationMethod === "email") {
      const message = generateEmailTemplate(verificationCode);
      await sendEmail(email, "Account Verification - Note App", message);
      res.status(200).json({
        success: true,
        message: `Verification code sent to ${name}. Please check your ${verificationMethod} for the verification code.`,
      });
    } else if (verificationMethod === "phone") {
      const verificationCodeWithSpace = verificationCode
        .toString()
        .split("")
        .join("");
      // await client.messages.create({
      //   body: `Your verification code is: ${verificationCodeWithSpace} please do not share this code with anyone.`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phone,
      // });
      await sendVerificationCodeBySMS(phone, verificationCodeWithSpace);
      res.status(200).json({
        success: true,
        message: `Verification code sent to ${name}. Please check your ${verificationMethod} for the verification code.`,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid verification method. Please choose email or phone.",
      });
    }
  } catch (error) {
    console.log("Error while sending verification code: ", error);
    return res.status(500).json({
      success: false,
      message: "Error sending verification code. Please try again later.",
    });
  }
}

function generateEmailTemplate(verificationCode) {
  return `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2 style="color: #333;">Verify Your Account</h2>
            <p style="color: #555;">Thank you for registering! Please use the following verification code to verify your account:</p>
            <div style="font-size: 24px; font-weight: bold; color: #007BFF; margin: 20px 0; border: 2px dashed #007BFF; display: inline-block; padding: 10px 20px; background-color: #f0f8ff;">
                ${verificationCode}
            </div>
            <p style="color: #555;">This code will expire in 10 minutes.</p>
            <p style="color: #555;">If you did not request this verification, please ignore this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <footer style="color: #999; font-size: 12px;">
                <p>NoteYouTube &copy; 2024. All rights reserved.</p>
                <p>Please do not reply to this email. If you have any questions, contact our support team.</p>
            </footer>
        </div>
    `;
}

// OTP validation of registation
export const verifyOTP = catchAsyncError(async (req, res, next) => {
  console.log(req.body);

  try {
    const { email, phone, verifyOTP } = req.body;
    if (!email && !phone) {
      return next(
        new ErrorHandler("Please provide either email or phone", 400),
      );
    }

    function validatePhoneNumber(phone) {
      const phoneRegex = /^\+91\d{10}$/;
      return phoneRegex.test(phone);
    }

    if (!validatePhoneNumber(phone)) {
      return next(
        new ErrorHandler(
          "Invalid phone number format. It should be in the format +91XXXXXXXXXX",
          400,
        ),
      );
    }

    try {
      const userAllEntries = await User.find({
        $or: [
          {
            email: email,
            accountVerified: false,
          },
          {
            phone: phone,
            accountVerified: false,
          },
        ],
      }).sort({ createdAt: -1 });

      if (!userAllEntries || userAllEntries.length === 0) {
        console.log("user not found:", userAllEntries);

        return res.status(404).json({
          success: false,
          message: "User NOT found",
        });
      }

      // for latest entries of user i.e all enteries will delete before this new registation
      let user;

      if (userAllEntries.length > 1) {
        user = userAllEntries[0];
        await User.deleteMany({
          _id: { $ne: user._id },
          $or: [
            { email: email, accountVerified: false },
            { phone: phone, accountVerified: false },
          ],
        });
      } else {
        user = userAllEntries[0];
      }

      if (user.verificationCode !== Number(verifyOTP)) {
        console.log("Invalid OTP entered: ", verifyOTP);
        return res.status(400).json({
          success: false,
          message: "Invalid OTP. Please try again.",
        });
      }

      if (Date.now() > user.verificationCodeExpires.getTime()) {
        console.log(user.verificationCodeExpires);

        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please register again.",
        });
      }

      //finally verified the user
      user.accountVerified = true;
      user.verificationCode = null;
      user.verificationCodeExpires = null;
      await user.save({ validateModifiedOnly: true });

      sendToken(user, 200, "Account verified successfully", res);
    } catch (error) {
      console.log("Error while verifying otp: ", error);

      return res.status(500).json({
        success: false,
        message: "Error verifying OTP. Please try again later.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "viraj",
    });
  }
});

// Login Functionality
export const login = catchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please fill all the fields", 400));
    }

    const user = await User.findOne({
      email: email,
      accountVerified: true,
    }).select("+password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid password", 401));
    }

    sendToken(user, 200, "Login successful", res);
  } catch (error) {
    console.log("Error while logging in: ", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
});

// Logout functionality
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

// get user details
export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// forgot password functionality
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      return next(new ErrorHandler("Please provide your email", 400));
    }
    const user = await User.findOne({ email: email, accountVerified: true });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateModifiedOnly: true });
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message = `You requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail(user.email, "Password Reset - Note App", message);
      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateModifiedOnly: true });
      console.log("Error while sending password reset email: ", error);
      return res.status(500).json({
        success: false,
        message: "Error sending password reset email. Please try again later.",
      });
    }
  } catch (error) {
    console.log("Error in forgot password: ", error);
    return res.status(500).json({
      success: false,
      message: "Error processing forgot password request. Please try again later.",
    });
  }
});

// reset password functionality
export const resetPassword = catchAsyncError(async (req, res, next) => {
  try {
    const resetToken = req.params.token;
    const { password } = req.body;
    if (!password) {
      return next(new ErrorHandler("Please provide a new password", 400));
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorHandler("Invalid or expired password reset token", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password and confirm password do not match", 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendToken(user, 200, "Password reset successful", res);

  } catch (error) {
    console.log("Error in reset password: ", error);
    return res.status(500).json({
      success: false,
      message: "Error processing password reset request. Please try again later.",
    });
  }
});