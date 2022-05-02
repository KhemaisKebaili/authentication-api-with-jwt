import Router from "express";
const router= Router();
import VerifyAuthToken from "../middlewares/VerifyAuthToken.js"
import User from "../models/User.js";

//the /home routes are protected or private routes
//Only logged in users are able to make requests to these routes
router.get("/",VerifyAuthToken,async(req,res)=>{
    const user= await User.findById(req.user._id);
    res.send(`Welcome ${user.first_name}!`);
});

export default router;