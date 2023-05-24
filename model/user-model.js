const mongoose = require('mongoose');
const bcrypt =require('bcrypt')

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    
  },
  lastName: {
    type: String,
    
  },
  createdAt: {
    type: Date,
    default: new Date()
},
  email: {
    type: String,
    required: true,
    
  },

  contact: {
    type: String,
    required: true,
    unique: true,
  },
  
  password: {
    type: String,
    required: true,
    unique: true,
  },
  // dob:{
  //   type :[
  //     {
  //       type :mongoose.Types.ObjectId
  //     }
  //   ],
  //   ref : 'Addresses',
  //   default :[]
  // },
   status:{
    type:Boolean,
    required:true,
   },
   status: {
    type:Boolean,
    required:true,
   },
 

});

UserSchema.pre("save", async function (next){
try{
    const salt =await bcrypt.genSalt(10);
    const hashpPassword = await bcrypt.hash(this.password,salt);
    this.password= hashpPassword;
    next();
} catch (error){
    next(error);
}

});

const User = mongoose.model("User", UserSchema);

module.exports = User;