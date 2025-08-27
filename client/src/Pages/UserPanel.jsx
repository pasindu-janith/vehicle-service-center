import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import NavbarUserPanel from "../Components/NavbarUserPanel";
import Dashboard from "../Components/Dashboard";
import MyVehicle from "../Components/MyVehicles";
import Reservations from "../Components/Reservations";
import VehicleRegister from "../Components/VehicleRegister";
import NewReservation from "../Components/NewReservation";
import UserPanelFooter from "../Components/UserPanelFooter";
import ProfileSettings from "../Components/ProfileSettings";
import { UserProvider } from "../Context/UserContext";
import { Payments } from "../Components/Payments";
import VehicleInfo from "../Components/VehicleInfo";
import ReservationInfo from "../Components/ReservationInfo";
import PaymentProceed from "../Components/PaymentProceed";
import PaymentInvoice from "../Components/PaymentInvoice";
import BASE_URL from "../config.js";

const UserPanel = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const verifyLoginStatus = async () => {
      try {
        const response = await fetch(`${BASE_URL}/authUser`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          navigate("/login");
        }
      } catch (error) {
        console.log(error);
      }
    };
    verifyLoginStatus();
  }, []);

  return (
    <div
      className="pt-2"
      style={{
        background: `radial-gradient(circle at 20% 30%, rgba(255, 0, 0, 0.3) 0%, transparent 40%),
                 radial-gradient(circle at 90% 60%, rgba(211, 211, 211, 0.6) 0%, transparent 50%),
                 radial-gradient(circle at 50% 80%, rgba(0, 98, 245, 0.3) 0%, transparent 50%)`,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backgroundRepeat: "repeat-y",
        backgroundSize: "cover",
      }}
    >
      <UserProvider>
        <NavbarUserPanel />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/myvehicle" element={<MyVehicle />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/add-vehicle" element={<VehicleRegister />} />
          <Route path="/add-reservation" element={<NewReservation />} />
          <Route path="/settings" element={<ProfileSettings />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="vehicle-info/:id" element={<VehicleInfo />} />
          <Route path="reservation-info/:resid" element={<ReservationInfo />} />
          <Route path="proceed-payment" element={<PaymentProceed />} />
          <Route path="payment-invoice/:resid" element={<PaymentInvoice />} />
        </Routes>
        <UserPanelFooter />
      </UserProvider>
    </div>
  );
};

export default UserPanel;
