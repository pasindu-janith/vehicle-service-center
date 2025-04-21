import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const UserPanelFooter = () => {
  return (
    <div
      className="container-fluid bg-dark shadow-sm mt-4"
      style={{ padding: "15px" }}
    >
      <div className="row text-center py-3">
        <p className="text-white mb-1">
          Contact Auto Lanka services: 0913324433
        </p>
        <a href="#" className="text-white me-3" style={{ textDecoration: "none" }}>
          <FaWhatsapp size={24} className="mb-1" /> WhatsApp
        </a>
      </div>
      <div className="row text-center py-3">
        <div className="col-md-12">
          <p className="text-white mb-0">
            © Nexora software 2025. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserPanelFooter;
