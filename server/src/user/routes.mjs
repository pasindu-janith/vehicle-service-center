import { Router } from "express";
import {
  registerUser,
  loginUser,
  otpVerify,
  emailVerify,
  authUser,
  logout,
  resendVerifyEmail,
  forgotPassword,
  resetPassword,
  verifyResetPasswordToken,
} from "./controller.mjs";

//User functions here

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/otpverify", otpVerify);
userRouter.get("/emailverify", emailVerify);
userRouter.get("/otpverify", otpVerify);
userRouter.get("/authUser", authUser);
userRouter.get("/logout", logout);
userRouter.post("/resend-verify-email", resendVerifyEmail);
userRouter.post("/forgot-password-process", forgotPassword);
userRouter.get("/verify-password-token", verifyResetPasswordToken);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
