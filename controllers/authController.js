import UserModal from "../models/model.js";
import express from 'express';
import bcrypt from 'bcryptjs';
import cookie from "cookie-parser";
import jwt from 'jsonwebtoken';
import transporter from "../config/nodemailer.js";
import dotenv from 'dotenv';
dotenv.config();
export const userRegister = async (req, res) => {
    const { username, email, password } = req.body;
    const jwt_secret=process.env.JWT_SECRET
    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, msg: "All fields should be filled" });
    }

    try {
        // Check if user already exists
        const existUser = await UserModal.findOne({ email });
        if (existUser) {
            return res.status(400).json({ success: false, msg: "Email already exists" });
        }

        // Hash password and save user
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new UserModal({ username, email, password: hashPassword });
        await user.save(); // Awaiting to ensure the user is saved before proceeding

        // Generate JWT token
        const token = jwt.sign({ id: user._id },jwt_secret, { expiresIn: "3d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3 * 24 * 60 * 60 * 1000
        });
        const mailoptions={
            from:process.env.sender_Email,
            to:email,
            subject:"Welcome to User Authentication",
            text:`you are successfully registered into hackers world.You are getting this message from email ${process.env.sender_Email}`
        }
        await transporter.sendMail(mailoptions);
        return res.status(201).json({ success: true, msg: "User registered successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, errormessage: err.message });
    }
};

export const userLogin = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ success: false, msg: "All fields should be filled" });
    }

    try {
        // Check if user exists
        const user = await UserModal.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, msg: "Invalid email" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, msg: "Password mismatch" });
        }
         const jwt_secret=process.env.JWT_SECRET 
        // Generate JWT token
        const token = jwt.sign({ id: user._id },jwt_secret, { expiresIn: "3d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, msg: "Login successful" });
    } catch (err) {
        return res.status(500).json({ success: false, errormessage: err.message });
    }
};
export const userLogout=async(req,res)=>{
    try{
        res.clearCookie('token',{
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        return res.status(200).json({success:true,msg:"logged out successfully"});
    }
    catch(err){
        return res.status(500).json({success:false,errormessage:err.message});
    }
}  
export const sendEmailOtp=async(req,res)=>{
    const {userId}=req.body;
    try{
     const user=await UserModal.findById(userId);
     if(user.isAccountVerified){
        return res.json({success:false,msg:"Account already Verified"});
     }
     const otp=String(Math.floor(100000+Math.random()*900000));
     user.verifyOtp=otp;
     user.verifyOtpExpiry=Date.now()+24*60*60*1000;
     await user.save();
     const mailotp={
        from:process.env.sender_Email,
        to:user.email,
        subject:"Verification of Email",
        text:`Your otp to verify your email is:${otp}`
     }
     await transporter.sendMail(mailotp);
     return res.json({success:true,msg:"Verification Otp sent to email"});
    }
    catch(err){
        return res.status(500).json({success:false,errormessage:err.message});
    }
}
export const verifyEmailOtp=async(req,res)=>{
    const {userId,otp}=req.body;
    if(!userId||!otp){
        return res.json({success:false,msg:"Id or Otp is missing"});
    }
    try{
       const user=await UserModal.findById(userId);
       if(!user){
        return res.json({success:false,msg:"user not found"});
       }
       if(user.verifyOtp===""||user.verifyOtp!==otp){
        return res.json({successfalse,msg:"invalid otp"});
       }
       if(user.verifyOtpExpiry<Date.now()){
        return res.json({success:false,msg:"otp expired"});
       }
       user.isAccountVerified=true;
       user.verifyOtp="";
       user.verifyOtpExpiry=0;
       await user.save();
       return res.json({success:true,msg:"Account Verified Successfully"});
    }
    catch(err){
        return res.json({success:false,errormessage:err.message})
    }
}
export const sendResetOtp=async(req,res)=>{
    const {email}=req.body;
    if(!email){
        return res.json({success:false,msg:"Email is missing"});
    }
    try{
        const user=await UserModal.findOne({email});
        if(!user){
            return res.json({success:false,msg:"user not found"});
        }
        const otp=String(Math.floor(100000+Math.random()*900000));
        user.resetOtp=otp;
        user.resetOtpExpiry=Date.now()+24*60*60*1000;
        await user.save();
        const mail={
            from:process.env.sender_Email,
            to:user.email,
            subject:"Password Reset Otp",
            text:`Your Password reset otp is :${otp}`
        }
        await transporter.sendMail(mail);
        return res.json({success:true,msg:"reset otp sent to email successfully"});
    }catch(err){
        return res.json({success:false,errormessage:err.message})
    }
}
export const verifyResetOtp=async(req,res)=>{
    const {email,otp,newPassword}=req.body;
    if(!email || !otp || !newPassword){
        return res.json({success:false,msg:"all fields should be filled"});
    }
    try{
     const user=await UserModal.findOne({email});
     if(!user){
        return res.json({success:false,msg:"user not found"});
     }
     if(!user.isAccountVerified){
        return res.json({success:false,msg:"First verify your email"});
     }
     if(user.resetOtp===""||user.resetOtp!==otp){
        return res.json({success:false,msg:"otp mismatch"});
     }
     if(user.resetOtpExpiry<Date.now()){
        return res.json({success:false,msg:"otp expired"});
     }
     const hashpassword=await bcrypt.hash(newPassword,10);
     user.password=hashpassword;
     user.resetOtp="";
     user.resetOtpExpiry=0;
     await user.save();
     return res.json({success:true,msg:"password changed successfully"});
    }catch(err){
        return res.json({success:false,errormessage:err.message})
    }
}
export const isAuthenticated=async(req,res)=>{
    try{
        return res.json({success:true,msg:""})
    }catch(err){
        return res.json({errormessage:err.message})
    }
}
