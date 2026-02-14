export const googleCallback = (req, res, next) => {
  try {
    const user = req.user;
    const token = user.generateToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(process.env.FRONTEND_URL);
  } catch (error) {
    console.error("Error While signin with google", error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

// facebook signin controller
export const facebookCallback = (req, res, next) => {
  try {
    const user = req.user;
    const token = user.generateToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(process.env.FRONTEND_URL);
  } catch (error) {
    console.error("Error While signin with facebook", error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};