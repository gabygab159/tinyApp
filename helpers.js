const getUserbyEmail = function(email, database) {

  let user = {};

  for (let userId in database) {

    const userObj = database[userId];

    if (userObj.email === email) {
     
      user = userObj;
      return user;
    }
    
  }

};

module.exports = { getUserbyEmail }