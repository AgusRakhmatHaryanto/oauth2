const express = require("express");
const session = require("express-session");
require("dotenv").config();
const passport = require("passport");
const app = express();
require("./auth");
const port = process.env.port;

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    successRedirect: "/protected",
  })
);

app.get("/protected", isLoggedIn, (req, res) => {
  const displayName = req.user.displayName;
  const profilePictureUrl =
    req.user.photos && req.user.photos.length > 0
      ? req.user.photos[0].value
      : null;
  res.send(`
      <h1>Hello ${displayName}</h1>
      ${
        profilePictureUrl
          ? `<img src="${profilePictureUrl}" alt="Profile Picture" />`
          : ""
      }
      <a href="/logout">Logout</a>
    `);
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.send(
        `Logged out successfully<a href="/">Go back to home page</a>`
      ); // Redirect to the home page or any other desired page
      
    });
  });
});

app.get("/auth/failure", (req, res) => {
  res.send("Failed to authenticate..");
});

app.listen(port, () =>
  console.log(`server berjalan di http://localhost:${port}/`)
);
