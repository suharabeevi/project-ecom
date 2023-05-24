
const mongoose= require('mongoose')
const bannerSchema = new mongoose.Schema({
    title: {
        type: String
    },
    images: {
        type:Object,
      
       },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date
    }
})

const banner = mongoose.model('banner', bannerSchema);
module.exports = banner;