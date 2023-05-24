const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String
    },
    validity: {
        type: Date,
        default : new Date
     },
     minAmount : { type : Number },
     minDiscountPercentage : { type : Number },
     maxDiscountValue : { type : Number},
     description : { type : String},
     createdAt : {
        type : Date,
        default : new Date
     },
     status: {
        type:Boolean,
        required:true,
       },

})
const coupon = mongoose.model('coupon', couponSchema);
module.exports = coupon;