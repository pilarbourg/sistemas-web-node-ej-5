const express = require("express");
const session = require("express-session");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const sharedsession = require("express-socket.io-session");

const messages = [];

const sessionMiddleware = session({
  secret: "key",
  resave: false,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

io.use(sharedsession(sessionMiddleware, { autoSave: true }));

io.use((socket, next) => {
  if (socket.handshake.session && socket.handshake.session.username) {
    socket.username = socket.handshake.session.username;
    next();
  } else {
    next(new Error("Not authorized"));
  }
});

io.on("connection", (socket) => {
  console.log(`${socket.username} connected`);

  socket.emit("history", messages);

  socket.on("chat message", (msg) => {
    const message = { user: socket.username, text: msg };
    messages.push(message);
    if (messages.length > 50) messages.shift();
    io.emit("chat message", message);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.username} disconnected`);
  });
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 3000 || 3001;
http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});