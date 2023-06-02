const mongoose = require("mongoose");
require('dotenv').config()
const dbConnect = () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    });
    console.log("database connected");
  } catch (error) {
    console.log("database error");
  }
};

module.exports = dbConnect;