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
    <div className="pt-2" style={{ backgroundColor: "#f4f4f4" }}>
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
        </Routes>
        <UserPanelFooter />
      </UserProvider>
    </div>
  );
};

export default UserPanel;
