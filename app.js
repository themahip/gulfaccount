const express= require("express");
const bodyParser= require("body-parser");
const dotenv=require("dotenv");
const auth=require("./middleware/auth.js");
const home=require("./middleware/home.js");
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
        console.log(username);
      console.log(errors);

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
                }
            })
        }
    }
    

});


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


    app.post("/forgot",(req,res)=>{
        let errors=[];
       const username=req.body.username;
       

       User.findOne({username:username},(err,foundUser)=>{
           if(err){
               console.log(err);
           }
           if(foundUser){
               console.log(foundUser);
           }
           else{
               errors.push({msg:"User not found"})
               res.render("forgot",{
            errors
               })
           }
       })
              
    }  
    )





app.listen(PORT,()=>{
    console.log(`the app is running on port ${PORT}`);
})