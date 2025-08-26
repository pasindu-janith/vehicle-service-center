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
  registerVehicle,
  loadVehicleTypes,
  loadVehicleBrands,
  loadFuelTypes,
  checkProfileUpdated,
  loadTransmissionTypes,
  loadAllUserData,
  updateUserProfileData,
  updateUserPassword,
  loadAllUserVehicles,
  loadServiceTypes,
  createReservation,
  loadAllUserReservations,
  cancelReservation,
  deleteVehicle,
  fetchVehicleData,
  loadPendingPayment,
  loadPaymentPageData,
  generatePayHash,
  fetchReservationData,
  getReservationMessages,
  loadDashboardNotifications,
  sendReservationMessage,
  updatePaymentDetails,
  loadCompletedPayments,
  loadInvoiceData,
} from "./controller.mjs";
import upload from "../middleware/upload.mjs";


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
userRouter.post("/register-vehicle", upload.single("vehicleImage"), registerVehicle);
userRouter.get("/loadVehicleTypes", loadVehicleTypes);
userRouter.get("/loadVehicleBrands", loadVehicleBrands);
userRouter.get("/loadFuelTypes", loadFuelTypes);
userRouter.get("/loadTransmissionTypes", loadTransmissionTypes);
userRouter.get("/profileUpdated", checkProfileUpdated);
userRouter.get("/getUserData", loadAllUserData);
userRouter.post("/updateUserProfileData", updateUserProfileData);
userRouter.post("/resetUserPassword", updateUserPassword);
userRouter.get("/loadAllUserVehicles", loadAllUserVehicles);
userRouter.get("/loadServiceTypes", loadServiceTypes);
userRouter.post("/createReservation", createReservation);
userRouter.post("/createReservation", createReservation);
userRouter.get("/loadAllUserReservations", loadAllUserReservations);
userRouter.put("/cancelReservation", cancelReservation);
userRouter.put("/deleteVehicle", deleteVehicle);
userRouter.get("/fetchVehicleData", fetchVehicleData);
userRouter.get("/loadServiceRecordPayment", loadPendingPayment);
userRouter.get("/loadPaymentPageData", loadPaymentPageData);
userRouter.post("/pay-hash", generatePayHash);
userRouter.get("/fetchReservationData", fetchReservationData);
userRouter.get("/getReservationMessages", getReservationMessages);
userRouter.get("/loadDashboardNotifications", loadDashboardNotifications);
userRouter.post("/sendReservationMessage", sendReservationMessage);
userRouter.post("/payhere-notify", updatePaymentDetails);
userRouter.get("/loadCompletedPayments", loadCompletedPayments);
userRouter.post("/loadInvoiceData", loadInvoiceData);
export default userRouter;

