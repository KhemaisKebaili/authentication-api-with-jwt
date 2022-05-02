//Authentication routes
//Imports
import Router from "express";
const router= Router();
//importing the User model.
import User from "../models/User.js";
//importing the data validators
import {RegisterValidation,LoginValidation, AccountRecoveryValidation, PasswordResetValidation} from "../services/validation.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
//importing the confirmed email verifier 
import EmailVerified from "../services/EmailVerified.js";
//importing the emailtransporter service
import { SendAccountRecoveryEmail, SendConfirmationEmail } from "../services/emailTransporters.js";
const bcrypt = bcryptjs;
const jwt= jsonwebtoken;

//Registration route
router.post("/register", async(req,res)=>{
    //Validating the registration data
    const {error}=RegisterValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let { first_name, last_name,email,CIN,password} = req.body;
    first_name=first_name.trim().replace(/\s\s+/g, ' ');
    last_name=last_name.trim().replace(/\s\s+/g, ' ');
   
    //Check if the user is already registered
    const registered = await User.findOne({email:email});
    if(registered) return res.status(400).send("Email already registered");

    //hashing the password
    const salt = await bcrypt.genSaltSync(10);
    const HashedPassword = await bcrypt.hash(password,salt);
    
    //Creating the new user with the provided data
    const user= new User({
        first_name : first_name,
        last_name : last_name,
        email: email,
        CIN:CIN,
        password: HashedPassword
    });
    try{
        const savedUser = await user.save();
        //Signing a JWT for email confirmation and sending confirmation instructions to the user's email address.
        jwt.sign({_id:savedUser._id},
                 process.env.EMAIL_CONFIRMATION_SECRET,
                 {expiresIn:"1d"}, //Adding an expiration constraint to the JWT.
                 (err,confirmation_token)=>{
                    SendConfirmationEmail(savedUser.first_name,savedUser.email,confirmation_token);
                 });
        res.send(`Account created, confirmation email has been sent to ${savedUser.email}`);
    }
    catch(err){
        res.status(400).send(err);
    }
});

//Signup confirmation route
router.get("/confirm/:confirmation_token",(req,res)=>{
    try {
        const jwt_playload=jwt.verify(req.params.confirmation_token,process.env.EMAIL_CONFIRMATION_SECRET);
        User.findByIdAndUpdate(jwt_playload._id,{email_verified:true},(err,data)=>{
            if(err){
                res.status(400).send(err);
            }else{
                res.send("Email has been confirmed");
            }
        });
    } catch (error) {
        res.status(400).send("Invalid confirmation token");
    }
});

//Login route
router.post("/login",async(req,res)=>{
    //Validating the login data
    const {error}=LoginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    let {email,password}=req.body;
    //Check if the account exists in the DB
    const user = await User.findOne({email:email});
    //sending an error message , the error message is vague on purpous for security reasons
    if(!user) return res.status(400).send("The email or the password is wrong");
    
    //Checking the login credentials against the DB 
    const LoginPassed= await bcrypt.compare(password,user.password);
    if(!LoginPassed) return res.status(400).send("The email or the password is wrong");

    //Checking if the email is confirmed or not
    if(!EmailVerified(user)) return res.status(401).send("Email not confirmed");

    //Creating a jsonwebtoken and signning it
    //Adding experation constraint to the jwt 
    //Injecting the auth-token into the response headers
    const token=jwt.sign({_id:user.id},process.env.AUTH_TOKEN_SECRET,{expiresIn:"1d"});
    res.header("auth-token",token).send(token);
});


//Account recovery routes
router.post("/recover/identify",async(req,res)=>{
    //Validating the account identification data
    const {error}=AccountRecoveryValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let{CIN_last_4_digits,email}=req.body;
    const Account = await User.findOne({email:email});
    if(Account){
        if (Account.CIN.substring(4,8)!=CIN_last_4_digits){
        return res.status(400).send("No account with the provided information has been found.");
        }else{
            jwt.sign({_id:Account._id},
                process.env.ACCOUNT_RESET_SECRET,
                {expiresIn:"1d"},
                (err,reset_token)=>{
                    if(err) return res.status(400).send(err);
                   SendAccountRecoveryEmail(Account.first_name,Account.email,reset_token);
                   res.send(`Account recovery instructions has been sent to ${Account.email}`);
                });
        }
    }else{
        return res.status(400).send("No account with the provided information has been found.");
    }
});
router.post("/recover/reset/:reset_token",async(req,res)=>{
    try {
        //first of all we verify the validity of the token
        const jwt_payload=jwt.verify(req.params.reset_token,process.env.ACCOUNT_RESET_SECRET);
        //Validating the password reset data
        const{error}=PasswordResetValidation(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        //hashing the new password
        let password=req.body.password;
        const salt = await bcrypt.genSaltSync(10);
        bcrypt.hash(password,salt,(err,NewHashedPassword)=>{
            if(err) return res.status(400).send(err);
            //updating the user's password
            User.findByIdAndUpdate(jwt_payload._id,{password:NewHashedPassword},(err,data)=>{
                if (err) return res.status(400).send(err);
                res.send("Password has been reset.");
            });
        });
    } catch (exp) {
        res.status(400).send(exp);
    }
});

export default router;