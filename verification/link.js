const express = require("express");
const { send } = require("express/lib/response");
const nodemailer= require("nodemailer");

const sendEmail= async(email, subject, text)=>{
    
        const transporter= await nodemailer.createTransport({
        service:'gmail',
       auth:{
           user:"amahip32@gmail.com",
           pass:"Rnbnxmar3@"
       }
        },
        );
        const mailOption= {
            from:'amahip32@gmail.com',
            to:email,
            subject:subject,
            text:text
        }
        await transporter.sendMail(mailOption,(error,info)=>{
            if(error){
                console.log(error);
            }
            else{
                console.log(info);
            }
            
        })

        
  
};

module.exports= sendEmail;