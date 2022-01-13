const express=require("express");
const jwt= require("jsonwebtoken");
const User= require("../usermodels/userSchema.js");
const dotenv= require("dotenv");
var cookieParser = require("cookie-parser");
const app= express();
app.use(cookieParser());

// const cookieParser= require("cookie-parser");

dotenv.config({path:"../config.env"});

const home= async (req,res,next)=>{

try {
    const token= req.cookies.jwt;
    
    const sec=process.env.SECRET_KEY;
    const verifyUser= jwt.verify(token,sec);
    
    const user= await User.findOne({_id:verifyUser._id});

  

  
  if(verifyUser){
      res.redirect("/dashboard")
  }
 
 
} catch (error) {
    
    next();

}
   

}

module.exports=home;
   
