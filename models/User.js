import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: true,
        max: 50,
        min:3
    },
    last_name:{
        type:String,
        required:true,
        min:3,
        max:50
    },
    email:{
        type: String,
        required: true,
        max:255
    },
    password:{
        type: String,
        required:true,
        max:1024,
        min:6
    },
    Registration_Date:{
        type:Date,
        default:Date.now
    },
    email_verified:{
        type: Boolean,
        default: false
    },
    CIN:{
        type:String,
        required:true,
        max:8,
        min:8,
    }
});


export default mongoose.model("User",userSchema);

