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


////////// Finds user given email and database

const getUserByEmail = function(email, database) {

  let user = {};

  for (let userId in database) {

    const userObj = database[userId];

    if (userObj.email === email) {
     
      user = userObj;
      return user;
    }
    
  }
  return undefined

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

//////// function to check if password is good
const authenticateUser = (email, password) => {

  const userFound = getUserByEmail(email, users);

  if (userFound && bcrypt.compareSync(password, userFound.hashedPassword)) {
    
    return userFound;
  }

  return false;
};


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



module.exports = { getUserByEmail, generateRandomString, authenticateUser, urlsForUser }