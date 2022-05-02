//Imports

//Importing express and creating a an app variable that represents our application (Our API).
import express from "express";
const app =express();
//Importing the DataBase module
import mongoose from "mongoose";
//Importing the enviroment variables module
import dotenv from "dotenv";
//Importing Routes
import authRoutes from "./routes/auth.js";
import homeRoutes from "./routes/home.js";
//Accessing the enviroment variables
dotenv.config();
const PORT = process.env.PORT;
const DB_CONNECTION_URL = process.env.DB_CONNECT_LOCALHOST;

//Connecting to the data base
mongoose.connect(DB_CONNECTION_URL,()=>{
    console.log("Connected to the DB");
});

//Middlewares
app.use(express.json());
//Routes middlewares
app.use("/api/user",authRoutes);
app.use("/api/home",homeRoutes);
app.listen(PORT,()=> console.log(`Server is running on port ${PORT}`));