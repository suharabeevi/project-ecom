const mongoose = require('mongoose');

const clothesCategorySchema = new mongoose.Schema({
    name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  numberofstock :{
    type:String,
    required:false
  },
  status: {
    type:Boolean,
    required:true,
   }
});

const ClothesCategory = mongoose.model('ClothesCategory', clothesCategorySchema);

module.exports = ClothesCategory;
