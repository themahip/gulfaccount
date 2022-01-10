const express= require("express");
const bodyParser= require("body-parser");
const dotenv=require("dotenv");
const auth=require("./middleware/auth.js");
const mongoose=require("mongoose");
const ejs=require("ejs");
const validator= require("email-validator");
const jwt=require("jsonwebtoken");
const User = require("./usermodels/userSchema");
const cookieParser= require("cookie-parser");
const bcrypt= require("bcrypt");
dotenv.config({path:"./config.env"});

const PORT= 3000;

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

mongoose.connect(process.env.URL);
app.get("/",auth,(req,res)=>{
    res.render("home");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",async(req,res)=>{
    let errors=[];
    const {username,email,password,cpassword}=req.body;
    const hashPassword=await bcrypt.hash(password,10).toString();
    const hashcPassword=await bcrypt.hash(cpassword,10);
    console.log(req.body);
    
    if(password!==cpassword){
        errors.push({msg:"Password didn't match"});
        
    }
    else if(password.length<6){
        errors.push({msg:"password must be grater than 6 character"});
        

    }
    else if(!validator.validate(email)){
        errors.push({msg:"Email invalid!!"});
        
    }
    else{
        User.findOne({email:email},async(err,foundUser)=>{
         if(err){
             console.log(err);
         }
         else if(foundUser){
             errors.push({msg:"user already exist"});
         }
         else{
             if(foundUser.username=usename){
                 errors.push({msg:"username already exist"});
             }
             else{
                 const newUser= new User({
                     username,
                     email,
                     hashPassword
                 });
                 const token= await newUser.generateAuthToken();
                 console.log(token);
                 res.cookie("jwt",token,{
                     expire:new Date(Date.now()+5000000)
                 });
                 const nuser= await newUser.save(()=>{
                     res.send("Welcome!!!");
                 })

             }
         }

        });
    }
    

});


    app.post("/login",async(req,res)=>{
        const {email,password}=req.body;
    
        User.findOne({email:email},async(error,foundUser)=>{
            if(error){
                console.log(error);
            }
            else if(foundUser){
                const isMatch = await bcrypt.compare(password,foundUser.hashPassword);
       
                const token=await foundUser.generateAuthToken();
                console.log(token);
                res.cookie("jwt",token,{
                    expire:new Date(Date.now()+5000000),
                    // httpOnly:true,
                    // secure:true  --only can be used in production version. So uncomment when deploying..
             
                });
             
                if(isMatch){
                   res.send("welcome!")
                }
                else{
                  errors.push({msg:"Email and password didn't match!!"})
                }
                
            }
           
        }); 
    })



app.listen(PORT,()=>{
    console.log(`the app is running on port ${PORT}`);
})