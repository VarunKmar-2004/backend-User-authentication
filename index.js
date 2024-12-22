import express from "express"
import mongoose from "mongoose"
import authRouter from "./routes/authRoutes.js"
import cookieParser from "cookie-parser"
import userRouter from "./routes/UserRoutes.js"
import cors from "cors"
const app=express()
app.use(express.json())
const corsOptions = {
  origin: ['https://frontend-user-authentication-fawn.vercel.app','http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Authorization', 'X-Custom-Header', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};  
app.use(cors(corsOptions));
app.options('*', cors(corsOptions))
app.use(cookieParser())
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.get("/",(req,res)=>{
    res.send("Hello World");
})

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