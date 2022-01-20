const express= require("express");
const bodyParser= require("body-parser");
const dotenv=require("dotenv");
const auth=require("./middleware/auth.js");
const home=require("./middleware/home.js");
const mongoose=require("mongoose");
const ejs=require("ejs");
const validator= require("email-validator");
const jwt=require("jsonwebtoken");
const otp= require("./verification/otp")
const User = require("./usermodels/userSchema");
const cookieParser= require("cookie-parser");
const bcrypt= require("bcrypt");
const auth2=require("./middleware/auth2")
const { response } = require("express");
const Token = require("./usermodels/token.js");
const crypto= require('crypto');
const sendEmail = require("./verification/link.js");
const token = require("./usermodels/token.js");
const res = require("express/lib/response");

dotenv.config({path:"./config.env"});


const PORT= 3000;

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(cookieParser());
mongoose.connect(process.env.URL);






app.get("/dashboard",auth,(req,res)=>{
  const username=req.user.username;

    res.render("dashboard",{
        username
    });
}); 

app.get("/",home,(req,res)=>{
    res.render("home");
})

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/logout",(req,res)=>{

    
    res.clearCookie("jwt");
    res.redirect("/login");

});
app.get("/forgot",(req,res)=>{
  res.render("forgot");
})


app.post("/register",async(req,res)=>{
      
   let errors=[];
    const {username,email,password,cpassword}=req.body;
    const hashPassword=await bcrypt.hash(password,10);
    
    const hashcPassword=await bcrypt.hash(cpassword,10);

   

    if(!username || !email || !password || !cpassword){
        errors.push({msg:"please fill in all the fields"});
    }
    
    if(password!==cpassword){
   
        errors.push({msg:"Password didn't match"});
    }
     if(password.length<6){
        errors.push({msg:"Password must be at least 6 characters"});
        

    }
     if(!validator.validate(email)){
        errors.push({msg:"Email doesn't exist"});
        
    }
    if(errors.length>0){
        res.render("register",{
            errors
        })
    }
    
    else{
        const people= await User.findOne({email:email});
          if(people){
              errors.push({msg:"email already exist"});
              res.render("register",{
                  errors
              })
          }
       
          
        else{
            const newUser= new User({
                username,
                email,
                hashPassword
            });
            newUser.save((err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    res.render("regSuccess")
                };
               
            })
            const token= await new Token({
                userId:newUser._id,
                token:crypto.randomBytes(32).toString("hex")
            }).save();
            const message=`http://localhost:3000/verify/${token.userId}/${token.token}`;
            await sendEmail(newUser.email,"verify email", message);
        };
       
    }
    

});

app.get("/verify/:userId/:token",async(req,res)=>{
    try {
        
        const user= await User.findOne({_id:req.params.userId});
        if(!user){
            return res.status(400).send("invalid link");
        };
        const token= await Token.findOne({
            userId:user._id,
            token:req.params.token,
        });
        if(!token){
            return res.status(400).send("invalid link");
        };

        
        await User.updateOne({_id:user._id,verified:true});
        await Token.findByIdAndRemove(token._id);
        res.redirect("/login")
        
    } catch (error) {
        console.log(error);
    }
})


app.get("/login",home,(req,res)=>{
res.render("login");
})


    app.post("/login",async(req,res)=>{
        let errors=[];
  
        const {email,password}=req.body;
        
        const hashPassword=await bcrypt.hash(password,10);
        
        User.findOne({email:email},async(error,foundUser)=>{
            if(error){
                console.log(error);
            }
            else if(foundUser){
                console.log(foundUser);

            if(foundUser.verified===false){
                errors.push({msg:"user not verified"});
                res.render("login",{
                    errors
                })
            }
           
            const isMatch = await bcrypt.compare(password,foundUser.hashPassword);
       
               
             
                if(isMatch){

                    const token=await foundUser.generateAuthToken();
                    console.log(token);
                    res.cookie("jwt",token,{
                        expire:new Date(Date.now()+5000000),
                        httpOnly:true,
                        // secure:true  --only can be used in production version. So uncomment when deploying..
                 
                    });
                  res.redirect("/dashboard")
                }
                else{
                    errors.push({msg:"Email and password didn't match"});
                   
                }
                if(errors.length>0){
                    res.render("login",{
                        errors
                    })
                }
                
            }
           
        }); 
    });


    app.post("/forgot",async(req,res)=>{
        let errors=[];
       const username=req.body.username;

       const peopleUser= await User.findOne({username:username});
       if(peopleUser){
           const OTP=peopleUser.generateOtp((error)=>{
               console.log(error);
           });
           console.log(OTP);
           
        res.cookie("mail",peopleUser.email,{
            expire:Date(Date.now()+30000),
            httpOnly:true
        });
        // otp(peopleUser.email,OTP);
        res.redirect("/verification");
        
            
       }
       else{
           const peopleEmail= await User.findOne({username:email});
           
           if(peopleEmail){
              const OTP=peopleEmail.generateOtp();
              console.log(OTP);
               res.cookie("mail",peopleEmail.email,{
                   expire:Date(Date.now()+3000),
                   httpOnly:true
               });
               
            //    otp(peopleEmail.email,OTP.otp)
               res.redirect("/verification");
           }
           else{
               errors.push({msg:"User doesnot exist"});
               res.render("forgot",{
                   errors
               })
           }
       }
       
 
    });

app.get("/verification",auth2,(req,res)=>{
    res.render("verification");
    
    
});

app.post("/verification",auth2,async(req,res)=>{
    const email= req.email;
    const verUser= await User.findOne({email:email});
    const length= verUser.OTPs.length;
    otp(verUser.email,verUser.OTPs[length-1].OTP);


    

})





app.listen(PORT,()=>{
    console.log(`the app is running on port ${PORT}`);
})