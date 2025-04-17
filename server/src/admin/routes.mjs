import { Router } from "express";
import { adminLogin } from "./controller.mjs";


const adminRouter = Router();

adminRouter.post("/login", adminLogin);



export default adminRouter;
