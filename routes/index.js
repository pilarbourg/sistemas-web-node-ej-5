var express = require("express");
var router = express.Router();

const images = [
  { url: "/images/red.jpg", title: "Teamwork" },
  { url: "/images/yellow.jpg", title: "Work faster" },
  { url: "/images/blue.jpg", title: "Collaborate" },
];

router.get("/", function (req, res) {
  res.render("index", {
    title: "Company",
    items: images,
  });
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

router.post("/login", (req, res) => {
  const { username } = req.body;

  req.session.username = username;
  res.redirect("/loggedIn");
});

router.get("/loggedIn", (req, res) => {
  if (req.session && req.session.username) {
    res.render("loggedIn", { username: req.session.username });
  } else {
    res.redirect("/login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
});

function authMiddleware(req, res, next) {
  if (req.session && req.session.username) {
    next();
  } else {
    res.redirect("/login");
  }
}

router.get("/chat.html", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login.ejs"));
});

module.exports = router;
