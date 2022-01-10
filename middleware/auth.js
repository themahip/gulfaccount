const jwt= require("jsonwebtoken");
const User= require("../usermodels/userSchema.js");
const dotenv= require("dotenv");

dotenv.config({path:"../config.env"});

const auth= async (req,res,next)=>{

try {
    const token= req.cookies.jwt;
    const sec=process.env.SECRET_KEY;
    const verifyUser= jwt.verify(token,sec);
    console.log(verifyUser);
    const user= await User.findOne({_id:verifyUser._id});
    console.log(user);
    next();
} catch (error) {
    res.redirect("/register")
}
   

}

module.exports=auth;
   
