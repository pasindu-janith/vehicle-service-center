import { Routes, Route } from "react-router-dom";
import NavbarUserPanel from "../Components/NavbarUserPanel";
import Dashboard from "../Components/Dashboard";
import MyVehicle from "../Components/MyVehicles";
import Reservations from "../Components/Reservations";
import VehicleRegister from "../Components/VehicleRegister";
import NewReservation from "../Components/NewReservation";
import UserPanelFooter from "../Components/UserPanelFooter";
const UserPanel = () => {
  return (
    <div className="pt-2" style={{ backgroundColor: "#f4f4f4" }}>
      <NavbarUserPanel />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/myvehicle" element={<MyVehicle />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/add-vehicle" element={<VehicleRegister />} />
        <Route path="/add-reservation" element={<NewReservation />} />
      </Routes>
      <UserPanelFooter />
    </div>
  );
};

export default UserPanel;
