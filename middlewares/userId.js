import jwt from "jsonwebtoken";
const UserId=async(req,res,next)=>{
    const {token}=req.cookies
    if(!token){
        return res.json({success:false,msg:"Not Authorized Login Again"});
    }
    try{
        const jwt_secret=process.env.jwt_secret || "VarunTheDevelopper";
        const tokenDecode=jwt.verify(token,jwt_secret);
        if(tokenDecode.id){
            req.body.userId=tokenDecode.id;
        }else{
            return res.json({success:false,msg:"Not authorized login again"});
        }
        next();
    }catch(err){
        return res.json({success:false,msg:"Not authorized login again"});
    }
}
export default UserId;