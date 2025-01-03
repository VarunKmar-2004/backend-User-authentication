import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import authRouter from "./routes/authRoutes.js"
import cookieParser from "cookie-parser"
import userRouter from "./routes/UserRoutes.js"
const app=express()
app.use(express.json())
app.use(cors({
  origin: ['https://frontend-user-authentication-fawn.vercel.app','http://localhost:3000'],
  credentials: true
})); 
app.use(cookieParser())
app.get("/",(req,res)=>{
    res.send("Hello World");
})
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);

const port=process.env.PORT || 4000
const Mongo_Uri='mongodb+srv://VarunKumar:iEj7K1z34xYINBxB@cluster1.cqnzl.mongodb.net/User_Auth'
mongoose.connect(Mongo_Uri)
  .then(()=>{
      console.log("Database Connected!");
      app.listen(port,()=>{
          console.log(`Server running Successfully on port:${port}`);
      })
    })
  .catch((err)=>{
    console.log(err);
    })
