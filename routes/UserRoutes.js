import express from "express";
import UserId from "../middlewares/userId.js";
import { getUser } from "../controllers/userController.js";
const userRouter=express.Router();
userRouter.get('/userdata',UserId,getUser);
export default userRouter;