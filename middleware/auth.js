const express=require("express");
const jwt= require("jsonwebtoken");
const User= require("../usermodels/userSchema.js");
const dotenv= require("dotenv");
var cookieParser = require("cookie-parser");
const app= express();
app.use(cookieParser());

// const cookieParser= require("cookie-parser");

dotenv.config({path:"../config.env"});

const auth= async (req,res,next)=>{

try {
    console.log(req.cookies);
    const token= req.cookies.jwt;
    
    const sec=process.env.SECRET_KEY;
    const verifyUser= jwt.verify(token,sec);
    console.log(verifyUser);
    const user= await User.findOne({_id:verifyUser._id});
    console.log(user);
    next();
} catch (error) {
    
    res.redirect("/login")
}
   

}

module.exports=auth;
   
