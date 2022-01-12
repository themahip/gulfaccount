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
tokens:[{
    token:{
        type:String,
        require:true
    }
}]

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
const User= mongoose.model("User",userSchema);
module.exports=User;