const bcrypt = require("bcrypt");

exports.verifyPin = async (inputPin, hash) => {
  return bcrypt.compare(inputPin, hash);
};
