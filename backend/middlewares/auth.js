import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decodedData.id);
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token, please login again", 401));
  }
});

