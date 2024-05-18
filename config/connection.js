const mongoose = require('mongoose')
const DbConnection= async()=>{
    try{
const dboption ={
    DbName:process.env.DBNAME,
}
await mongoose.connect(process.env.MONGO_DB_URL,dboption)
console.log("Database Connected!");
    }catch(error){
        console.error("Database Connection Error",error);
        process.exit(1)
    }
}
module.exports=DbConnection