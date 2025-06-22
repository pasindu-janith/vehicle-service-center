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
} from "./controller.mjs";

//User functions here

const adminRouter = Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/logout", adminLogout);
adminRouter.get("/authAdmin", authAdmin);
adminRouter.get("/loadOngoingServices", loadOngoingServices);
adminRouter.get("/loadPendingServices", loadPendingServices);
adminRouter.get("/filterReservationData", loadReservationWithFilter);
adminRouter.get("/loadAllReservations", loadAllReservations);
adminRouter.get("/loadDashboardCounts", countReservations);
adminRouter.post("/startReservation", startReservation);
adminRouter.post("/endReservation", completeReservation);
adminRouter.post("/editReservation", editReservation);
export default adminRouter;
