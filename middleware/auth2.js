const cookieParser= require("cookie-parser");
const User= require("../usermodels/userSchema.js");

const auth2= async (req,res,next)=>{
try {
    const email= await req.cookies.mail;
    req.email=email;
    // console.log(email);
    // const user=await User.findOne({email:email});
    // req.user=user;
    
    next();

} catch (error) {
    console.log(error);
}
}

module.exports=auth2;