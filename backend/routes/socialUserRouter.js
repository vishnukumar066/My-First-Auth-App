import express from "express";
import passport from "passport";
import { facebookCallback, googleCallback } from "../controllers/socialUserController.js";



const socialUserRouter = express.Router();

//Google
socialUserRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

socialUserRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }), googleCallback
);

// facebook
socialUserRouter.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] }),
);

socialUserRouter.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  facebookCallback
);



export default socialUserRouter;