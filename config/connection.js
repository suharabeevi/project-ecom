const mongoose = require("mongoose");

const dbConnect = () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect("mongodb://127.0.0.1:27017/clothes", {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    });
    console.log("database connected");
  } catch (error) {
    console.log("database error");
  }
};

module.exports = dbConnect;