import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: [30, "Name cannot exceed 30 characters"],
      minLength: [2, "Name should have more than 2 characters"],
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: Number,
    verificationCodeExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    googleId: {
      type: String,
    },

    facebookId: {
      type: String,
    },

    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationCode = function () {
  function generateSixDigitNumber() {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, 0);
    return parseInt(firstDigit + remainingDigits);
  }
  const verificationCodeForOtp = generateSixDigitNumber();
  this.verificationCode = verificationCodeForOtp;
  this.verificationCodeExpires = Date.now() + 30 * 60 * 1000;
  return verificationCodeForOtp;
};

userSchema.methods.generateToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  return token;
};

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

export const User = mongoose.model("User", userSchema);
