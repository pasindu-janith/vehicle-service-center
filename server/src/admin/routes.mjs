import { Router } from "express";
import { adminLogin, adminLogout, authAdmin, loadOngoingServices, loadPendingServices,loadReservationWithFilter } from "./controller.mjs";

//User functions here

const adminRouter = Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/logout", adminLogout);
adminRouter.get("/authAdmin", authAdmin);
adminRouter.get("/loadOngoingServices", loadOngoingServices);
adminRouter.get("/loadPendingServices", loadPendingServices);
adminRouter.get("/filterReservationData", loadReservationWithFilter);
export default adminRouter;
