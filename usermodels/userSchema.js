const { JsonWebTokenError } = require('jsonwebtoken');
const mongoose= require('mongoose');
const jwt= require("jsonwebtoken");


const Schema= mongoose.Schema;
const userSchema= new Schema({
username:{
    type:String,
    required:true,
},
email:{
    type:String, 
    required:true
},
hashPassword:{
    type:String,
    required:true
},
date:{
    type:Date,
    default:Date.now()

},
verified:{
type:Boolean,
default:false,
},
tokens:[{
    token:{
        type:String,
        require:true
    }
}],
OTPs:[
    {
      OTP:{
        type:String,
        expires:Date(Date.now()+30000)
      } 
    }
]

});
userSchema.methods.generateAuthToken= async function(){
    try {
        const sec=process.env.SECRET_KEY;
        const token=jwt.sign({_id:this._id.toString()},sec);
        this.tokens= this.tokens.concat({token});
        this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}
userSchema.methods.generateOtp= async function(){
try {
    const OTP= Math.floor(Math.random()*1000000);
    this.OTPs=this.OTPs.concat({OTP});
    this.save();
    
    return OTP;
} catch (error) {
    console.log(error);
}
}
const User= mongoose.model("User",userSchema);
module.exports=User;