import { Router } from "express";
import { adminLogin, adminLogout } from "./controller.mjs";

//User functions here

const adminRouter = Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/logout", adminLogout);

//register

export default adminRouter;
