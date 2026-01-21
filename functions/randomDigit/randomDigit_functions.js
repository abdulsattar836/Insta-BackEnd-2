// this will give us the random string by our length
let generateRandomString = (length) => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};

// this will give us the random number by our length
const generateRandomNumber = (max) => {
  const min = Math.pow(10, max - 1);
  const maxExclusive = Math.pow(10, max);
  return Math.floor(Math.random() * (maxExclusive - min)) + min;
};

module.exports = {
  generateRandomString,
  generateRandomNumber,
};
