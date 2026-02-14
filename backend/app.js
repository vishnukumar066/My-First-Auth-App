import "./config/env.js";

import passport from "passport";
import "./config/passport/index.js";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccount.js";
import socialUserRouter from "./routes/socialUserRouter.js";

export const app = express();

app.use(
  cors({
    // origin: [process.env.FRONTEND_URL],
    // methods: ["GET", "POST", "PUT", "DELETE"],
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use("/api/v1/user", userRouter);
app.use("/auth", socialUserRouter);

removeUnverifiedAccounts();
connection();

app.use(errorMiddleware);
