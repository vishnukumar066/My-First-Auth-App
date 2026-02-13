import passport from "passport";
import {Strategy as FacebookStrategy} from "passport-facebook";
import { User } from "../../models/userModel.js";

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: process.env.FB_CALLBACK_URL,
      profileFields: ["id", "displayName", "emails"],
    },
    async (_, __, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        let user = await User.findOne({ email });

        if (user) {
          user.facebookId = profile.id;
          user.provider = "facebook";
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName,
            email,
            provider: "facebook",
            accountVerified: true,
          });
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);
