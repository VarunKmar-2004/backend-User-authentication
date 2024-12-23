import UserModal from "../models/model.js";
export const getUser=async(req,res)=>{
    const {email}=req.body;
    try{
    const user=await UserModal.findById(email);
    if(!user){
        return res.json({success:false,msg:'user not found'});
    }
    return res.json({
        success:true,
        userData:{
            name:user.username,
            accountVerificationStatus:user.isAccountVerified
        }
    })
    }catch(err){
        return res.json({success:false,errormessage:err.message});
    }
}