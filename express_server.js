const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieSession = require('cookie-session');

const { getUserByEmail } = require('./helpers');

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);

app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get('/', (req, res) => {
  res.send("Hello!");
});


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls.json', (req, res) => {
  res.json(users);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b> World</b></body></html>\n");
});

//// Display urls

app.get('/urls', (req, res) => {
  let userID = req.session["user_id"];
  const userURLs = urlsForUser(userID);
  
  const templateVars = {
    urls: userURLs,

    users: users,

    id: userID,

    user: users[userID]

  };  
  
  res.render('urls_index', templateVars);
});



app.get('/urls/new', (req, res) => {
  const templateVars = {

    users: users,

    id: req.session["user_id"]

  };

  user = req.session["user_id"];

  if (!user) {

    res.redirect('/login');

    return;
  }
  
  res.render('urls_new', templateVars);
});


//// Display short url page

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  const longURL = urlDatabase[`${shortURL}`].longURL;
  
  const userID = req.session["user_id"];

  const templateVars = {

    shortURL: req.params.shortURL,

    longURL,

    user: users[userID]
    
  };

  res.render("urls_show", templateVars);
});
  
//// Display register page

app.get("/register", (req, res) => {
  const userID = req.session["user_id"];

  const templateVars = {

    id: req.session["user_id"],

    user: users[userID]

  };
    
  res.render("urls_register", templateVars);

});


//// Diplay login page

app.get("/login", (req, res) => {
  const userID = req.session["user_id"];

  const templateVars = {

    id: req.session["user_id"],

    user: users[userID]

  };

  res.render("urls_login", templateVars);

});

  
/////Add a url
  
app.post('/urls', (req, res) => {
  const newUrl = generateRandomString();

  urlDatabase[newUrl] = {longURL:req.body.longURL, userID: req.session['user_id']};

  res.redirect(`/urls/${newUrl}`);
  
});

/////// Delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  user = req.session["user_id"];
 
  if (user) {

    delete urlDatabase[req.params.shortURL];
  }
  res.redirect('/urls');

});

////// Edit a url
app.post("/urls/:shortURL", (req, res) => {
  user = req.session["user_id"];
  //console.log(req.body)
  if (user) {
    let longURL = req.body.longURL;
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = longURL;
   
  }

  res.redirect('/urls');  

});

///////// User login

app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email, users);
  
  if (!user) {
    res.status(403).send("That user was not found");
    return;
  }
  
  let correctPassword = authenticateUser(email,password);

  console.log(password);
  if (!correctPassword) {
    res.status(403).send("Wrong password");
    return;
  }
 
  req.session.user_id = "user_id";
  res.redirect('/urls');
});

/////// User logout

app.post("/logout", (req, res) => {
  ///use clearCookie
  
  // res.clearCookie("user_id")
  req.session['user_id'] = null;
  res.redirect('/urls');
});

////// User registration

app.post("/register", (req, res) => {
  //needs to add new user to DB
  // generate random ID with same function as random url
  //set cookie with new ID
  //redirect to /urls page
  
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  //// Check if email already used


  const user = getUserByEmail(email, urlDatabase);
  
  if (email === "" || password === "") {
    res.status(400).send('Please make sure you have entered your information correctly');
    return;
  }

  if (user) {
    res.status(400).send("User already in database");
    return;
  }
  const id = generateRandomString();

  let newUser = {id, email, hashedPassword};

  users[id] = newUser;
  console.log(users);
  req.session["user_id"] = id;
  res.redirect('/urls');
});


/////

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});



//// I needed to use this as a reference for random genereation
//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

function generateRandomString() {

  let alphaNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += alphaNum.charAt(Math.floor(Math.random() * alphaNum.length));
  }
  return randomString;
}

//////// function to check if password is good
const authenticateUser = (email, password) => {

  const userFound = getUserByEmail(email, users);

  if (userFound && bcrypt.compareSync(password, userFound.hashedPassword)) {
    
    return userFound;
  }

  return false;
};


///////////// Function to return urls based on id

const urlsForUser = (userID) => {
 
  const urlObject = {};
  
  for (let id in urlDatabase) {
    
    let urlInfo = urlDatabase[id];
  
    if (urlInfo.userID === userID) {
      urlObject[id] = urlInfo;
    }
  }
  return urlObject;
};

