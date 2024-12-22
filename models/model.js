import mongoose from "mongoose"
const user=new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    isAccountVerified:{type:Boolean,default:false},
    verifyOtp:{type:String,default:""},
    verifyOtpExpiry:{type:Number,default:0},
    resetOtp:{type:String,default:0},
    resetOtpExpiry:{type:Number,default:0}
})
const UserModal=mongoose.model('user',user);
export default UserModal;