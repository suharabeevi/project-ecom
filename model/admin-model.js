const mongoose= require('mongoose')
const bcrypt = require('bcrypt')

const adminschema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
      },
        password: {
            type: String,
            required: true,
            unique: true,
          },
          status: {
            type:Boolean,
            required:true,
           },
      
});
adminschema.pre("save", async function (next){
    try{
        const salt =await bcrypt.genSalt(10);
        const hashpPassword = await bcrypt.hash(this.password,salt);
        this.password= hashpPassword;
        next();
    } catch (error){
        next(error);
    }
    
    });
    
    const admin = mongoose.model("admin", adminschema); 
    
    module.exports = admin; 