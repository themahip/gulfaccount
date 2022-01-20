const nodemailer= require("nodemailer");

//otp generator
const otp=async(gmail,otp)=>{

    const transport= await nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'amahip32@gmail.com',
            pass:'Rnbnxmar3@'
        }
    })
    
    const mailOptions={
        from:'amahip32@gmail.com',
        to:gmail,
        subject:'OTP',
        text:`your otp for changing password is ${otp}`
    }
    
   await transport.sendMail(mailOptions,(error,info)=>{
        if(error){
            console.log(error);
        }
        else{
            console.log(info);
        }
    })


};
module.exports=otp;



