const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    Address: [
        {
            fname: { type: String },
            lname: { type: String },
            street: { type: String },
            appartment: { type: String },
            city: { type: String },
            state: { type: String },
            zipcode: { type: String },
            phone: { type: String },
            email: { type: String }
        }
    ]

})
const address = mongoose.model('address',addressSchema );
module.exports = address;

