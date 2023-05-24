const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  products:{
    type:Array,
    required:true
  }
});
// const User = mongoose.model("User", UserSchema);
const cart = mongoose.model('Cart', cartSchema);
module.exports = cart;
