const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require("bcrypt");
const saltRounds = 10;
const cookieSession = require("cookie-session");

const {
  getUserByEmail,
  generateRandomString,
  authenticateUser,
  urlsForUser,
} = require("./helpers");

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  user = req.session["user_id"];

  if (!user) {
    res.redirect("/login");

    return;
  }
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b> World</b></body></html>\n");
});

// Display urls

app.get("/urls", (req, res) => {
  let user = users[req.session["user_id"]];
  if (!user) {
    res.redirect("/login");
    return;
  }

  const userURLs = urlsForUser(user.id, urlDatabase);

  const templateVars = {
    urls: userURLs,

    users: users,

    id: user.id,

    user: user,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: users,

    id: req.session["user_id"],
  };

  user = req.session["user_id"];

  if (!user) {
    res.redirect("/login");

    return;
  }

  res.render("urls_new", templateVars);
});

// Display short url page

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  const longURL = urlDatabase[`${shortURL}`].longURL;

  const userID = req.session["user_id"];

  if (!userID) {
    res.status(403).send("Please login first");
    return;
  }

  const templateVars = {
    shortURL: req.params.shortURL,

    longURL,

    user: users[userID],
  };

  res.render("urls_show", templateVars);
});

// Display register page

app.get("/register", (req, res) => {
  const userID = req.session["user_id"];

  const templateVars = {
    id: req.session["user_id"],

    user: users[userID],
  };

  res.render("urls_register", templateVars);
});

// Diplay login page

app.get("/login", (req, res) => {
  const userID = req.session["user_id"];

  const templateVars = {
    id: req.session["user_id"],

    user: users[userID],
  };

  res.render("urls_login", templateVars);
});

// Add a url

app.post("/urls", (req, res) => {
  const newUrl = generateRandomString();

  urlDatabase[newUrl] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"],
  };

  res.redirect(`/urls/${newUrl}`);
});

// Delete a url

app.post("/urls/:shortURL/delete", (req, res) => {
  user = req.session["user_id"];

  if (user) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

// Edit a url

app.post("/urls/:shortURL", (req, res) => {
  user = req.session["user_id"];

  if (user) {
    let longURL = req.body.longURL;
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = longURL;
  }

  res.redirect("/urls");
});

// User login

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email, users);

  if (!user) {
    res.status(403).send("That user was not found");
    return;
  }

  let correctPassword = authenticateUser(user, password);

  if (!correctPassword) {
    res.status(403).send("Wrong password");
    return;
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

// User logout

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

// User registration

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const user = getUserByEmail(email, users);

  if (email === "" || password === "") {
    res
      .status(400)
      .send("Please make sure you have entered your information correctly");
    return;
  }

  if (user) {
    res
      .status(400)
      .send("User already in database, please use another email address.");
    return;
  }

  const id = generateRandomString();

  let newUser = { id, email, hashedPassword };

  users[id] = newUser;

  req.session["user_id"] = id;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const redirect = urlDatabase[req.params.shortURL].longURL;
  res.redirect(redirect);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
