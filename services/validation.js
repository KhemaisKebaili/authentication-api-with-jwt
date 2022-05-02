import joi from "joi";

//Register validation
const RegisterVal= (data)=>{
//The password regex will enforce having at least one uppercase letter, at least one lowercase letter and at least one digit
const RegSchema= joi.object({
    first_name: joi.string().min(3).max(50).pattern(new RegExp("^([a-zA-Zéèêîïôàç]+\s)*[a-zA-Zéèêîïôàç]+$")).required(),
    last_name: joi.string().min(3).max(50).pattern(new RegExp("^([a-zA-Zéèêîïôàç]+\s)*[a-zA-Zéèêîïôàç]+$")).required(),
    email: joi.string().email().required(),
    CIN:joi.string().pattern(new RegExp("^[0-9]{8}$")).required(),
    password: joi.string().pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-zéèêîïôàç])(?=.*?[0-9]).{8,}$")).required(),
    password_repeat:joi.ref("password"),
});
//validating data before making a new User object and saving it in the DB
return RegSchema.validate(data);
}

//Login validation
const LoginVal= (data)=>{
    const LogSchema= joi.object({
        email: joi.string().email().required(),
        password: joi.string().pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-zéèêîïôàç])(?=.*?[0-9]).{8,}$")).required(),
        });
    return LogSchema.validate(data);
    }

const AccRecoveryVal = (data)=>{
    const AccRecoverySchema=joi.object({
        CIN_last_4_digits:joi.string().pattern(new RegExp("^[0-9]{4}$")).required(),
        email:joi.string().email().required(),
    });
    return AccRecoverySchema.validate(data);
}

const PasswordResetVal =(data)=>{
    const PasswordResetSchema=joi.object({
        password:joi.string().pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-zéèêîïôàç])(?=.*?[0-9]).{8,}$")).required(),
        password_repeat:joi.ref("password"),
    });
    return PasswordResetSchema.validate(data);
}

export {RegisterVal as RegisterValidation , LoginVal as LoginValidation, AccRecoveryVal as AccountRecoveryValidation,PasswordResetVal as PasswordResetValidation}