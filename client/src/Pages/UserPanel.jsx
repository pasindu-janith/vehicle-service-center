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

const UserPanel = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const verifyLoginStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/authUser",
          {
            method: "GET",
            credentials: "include",
          }
        );
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
      background:
        "linear-gradient(135deg, rgba(255, 165, 165, 0.4) 0%, rgba(198, 198, 198, 0.5) 50%, rgba(100, 100, 100, 0.5) 100%)",
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
          <Route path="payment-success" element={<PaymentInvoice />} />
        </Routes>
        <UserPanelFooter />
      </UserProvider>
    </div>
  );
};

export default UserPanel;
