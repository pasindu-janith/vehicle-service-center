import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  authAdmin,
  loadOngoingServices,
  loadPendingServices,
  loadReservationWithFilter,
  loadAllReservations,
  countReservations,
  startReservation,
  completeReservation,
  editReservation,
  loadAllCustomers,
  loadAllVehicles,
  loadCustomerVehicles,
  loadCompletedServices,
  loadVehicleInfo,
  cancelReservation,
  resetAdminPassword,
  loadServiceTypes,
  proceedCashPayment, 
  addNotification,
  loadNotificationTypes,
  loadCancelledServices,
  getReservationMessages,
  sendReservationMessage,
  restoreCancelledReservation,
  loadPaymentPageData
} from "./controller.mjs";


//User functions here

const adminRouter = Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/logout", adminLogout);
adminRouter.get("/authAdmin", authAdmin);
adminRouter.get("/loadOngoingServices", loadOngoingServices);
adminRouter.get("/loadPendingServices", loadPendingServices);
adminRouter.get("/loadCancelledServices", loadCancelledServices);
adminRouter.get("/loadCompletedServices", loadCompletedServices);
adminRouter.get("/filterReservationData", loadReservationWithFilter);
adminRouter.get("/loadServiceTypes", loadServiceTypes);
adminRouter.get("/loadAllReservations", loadAllReservations);
adminRouter.get("/loadDashboardCounts", countReservations);
adminRouter.post("/startReservation", startReservation);
adminRouter.post("/endReservation", completeReservation);
adminRouter.post("/editReservation", editReservation);
adminRouter.post("/cancelReservation", cancelReservation);
adminRouter.get("/loadAllCustomers", loadAllCustomers);
adminRouter.get("/loadCustomerVehicles", loadCustomerVehicles);
adminRouter.get("/loadAllVehicles", loadAllVehicles);
adminRouter.get("/loadVehicleInfo", loadVehicleInfo);
adminRouter.post("/reset-password", resetAdminPassword);
adminRouter.post("/proceedCashPayment", proceedCashPayment);
adminRouter.post("/addNotification", addNotification);
adminRouter.get("/loadNotificationTypes", loadNotificationTypes);
adminRouter.get("/getReservationMessages", getReservationMessages);
adminRouter.post("/sendReservationMessage", sendReservationMessage);
adminRouter.post("/restoreCancelledReservation", restoreCancelledReservation);
adminRouter.get("/loadPaymentPageData", loadPaymentPageData);
export default adminRouter;
