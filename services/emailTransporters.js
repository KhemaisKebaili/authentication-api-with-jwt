import nodemailer from "nodemailer";

//To send email using a Gmail account we need to define a gmail transporter like demonstrated below
// const transporter= nodemailer.createTransport({
//     host:"smtp.gmail.com",
//     port:465,
//     auth:{
//         user:process.env.YOUR_EMAIL_ADDRESS,
//         pass:process.env.YOUR_EMAIL_PASSWORD,
//     }
// });

//For testing purposes we will generate a test SMTP service account using ethereal.email
const testAccount=await nodemailer.createTestAccount();
const transporter=nodemailer.createTransport({
    host:"smtp.ethereal.email",
    port:587,
    secure:false,
    auth:{
        user:testAccount.user,
        pass:testAccount.pass,
    }
});
async function SendConfirmationEmail(user_first_name,user_email,confirmation_token){
    const url=`http://localhost:${process.env.PORT}/api/user/confirm/${confirmation_token}`
    let info = await transporter.sendMail({
        to:user_email,
        subject:'Email confirmation for your X account',
        html:`Hello ${user_first_name}, please click the following link in order to confirm your email:
        <a href="${url}">${url}</a>
        `
    });
    console.log("Confirmation email link:"+nodemailer.getTestMessageUrl(info));
}

async function SendAccountRecoveryEmail(user_first_name,user_email,reset_token){
    const url=`http://localhost:${process.env.PORT}/api/user/recover/reset/${reset_token}`
    let info = await transporter.sendMail({
        to:user_email,
        subject:'Account recovery instructions',
        html:`Hello ${user_first_name}, please click the following to proceed with resetting your password:
        <a href="${url}">${url}</a>
        `
    });
    console.log("Account recovery email link:"+nodemailer.getTestMessageUrl(info));
}

export {SendConfirmationEmail as SendConfirmationEmail, SendAccountRecoveryEmail as SendAccountRecoveryEmail}