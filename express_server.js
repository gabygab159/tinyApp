const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())



app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  
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
}

app.get('/', (req, res) => {
  res.send("Hello!");
})


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b> World</b></body></html>\n");
})

app.get('/urls', (req, res) => {
  let hold = req.cookies.user_id;
  const templateVars = {
    urls:urlDatabase, 
    users: users,
    id: req.cookies.user_id,        
  };
    console.log(req.cookies.user_id)
  res.render('urls_index', templateVars)
})

app.get('/urls/new', (req, res) => {
  const templateVars = {
    users: users,
    id: res.cookie.user_id
  }
  res.render('urls_new', templateVars)
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    users:users,
    id: res.cookie.user_id
   };
    res.render("urls_show", templateVars)
  })
  
  //// display register page
  app.get("/register", (req, res) => {
    const templateVars = {
      id: res.cookie.user_id,
      users: users,
    }
    
    res.render("urls_register", templateVars)
  })


  //// diplay login page
  app.get("/login", (req, res) => {

      const templateVars = {
      id: res.cookie.user_id,
      users: users,
    }

    res.render("urls_login", templateVars)
  })

  
app.post('/urls', (req, res) => {
  console.log(req.body);
  const newUrl = generateRandomString();
  urlDatabase[newUrl] = req.body.longURL
  res.redirect(`/urls/${newUrl}`);
})

/////// Delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
    
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls')
})

////// Edit a url
app.post("/urls/:shortURL", (req, res) => {
  
  //console.log(req.body)
  let longURL = req.body.longURL
  let shortURL = req.params.shortURL
  urlDatabase[shortURL] = longURL
  res.redirect('/urls')
  // console.log(res)

})

///////// User login
app.post("/login", (req, res) => {
  
  const email = req.body.email
  const password = req.body.password  

  const user = findUser(email)

  if(!user){
    res.status(403).send("That user was not found")
    return
  }
  
  let correctPassword = authenticateUser(email,password)

  if(!correctPassword) {
    res.status(403).send("Wrong password")
    return
  }
  const id = generateRandomString()
  res.cookie("user_id", id)
  res.redirect('/urls')
})

/////// User logout
app.post("/logout", (req, res) => {
  ///use clearCookie
  
  res.clearCookie("user_id")
  res.redirect('/urls')
})

////// User registration
app.post("/register", (req, res) => {
  //needs to add new user to DB
  // generate random ID with same function as random url
  //set cookie with new ID
  //redirect to /urls page
  
  const email = req.body.email
  const password = req.body.password
  ////check if email already used

  const user = findUser(email)
  if(email === "" || password === "") {
    res.status(400).send('Please make sure you have entered your information correctly')
    return
  }

  if(user) {
    res.status(400).send("User already in database")
    return
  } 
  const id = generateRandomString()
  let newUser = {id, email, password}
  users[id] = newUser

  res.cookie("user_id", id)
  res.redirect('/urls')
})


/////

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})



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

////// Function to check if email already in DB

const findUser = function(email) {  
  for (let userId in users) {

    const userObj = users[userId];

    if(userObj.email === email) {
     
      return userObj
    }
    // console.log("userOBJ-->",userObj)
  }
}

//////// function to check if password is good
const authenticateUser = (email, password) => {

  const userFound = findUser(email);

  if (userFound && userFound.password === password) {
    
    return userFound;
  }

  return false;
};