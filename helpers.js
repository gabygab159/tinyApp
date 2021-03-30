const bcrypt = require('bcrypt');

// Finds user given email and database

const getUserByEmail = function(email, database) {
  

  for (let userId in database) {

    const userObj = database[userId];
    
    if (userObj.email === email) {
      
      return userObj;
    }
    
  }
  return false

};

// Function to return urls based on id

const urlsForUser = (userID, database) => {
 
  let urlObject = {};
  
  for (let shortUrl in database) {
   
    let urlInfo = database[shortUrl];
    
    if (urlInfo.userID === userID) {
    urlObject[shortUrl] = urlInfo.longURL;
    }
  }
  
  return urlObject;
};


// function to check if password is good

const authenticateUser = (user, password) => {

  if (bcrypt.compareSync(password, user.hashedPassword)) {

    return true;
 }
  return false;
 };


// I needed to use this as a reference for random genereation
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