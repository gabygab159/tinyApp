const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  
   
};

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
  const templateVars = {urls:urlDatabase};
  res.render('urls_index', templateVars)
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new')
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: urlDatabase[req.params], longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars)
})

app.post('/urls', (req, res) => {
  console.log(req.body);
  const newUrl = generateRandomString();
  urlDatabase[newUrl] = req.body.longURL
  res.redirect(`/urls/${newUrl}`);
})

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