import React from 'react';
import { FaPhoneAlt } from 'react-icons/fa';
import './styles/CallButton.css'; // Custom CSS file for extra styling

const CallButton = () => {
  return (
    <div className="call-button-container">
      <div className="btn-call d-flex">
        <FaPhoneAlt className="phone-icon" />
        <div className="call-info">
          <span className="call-text">Call us on</span>
          <span className="call-number">077 5688944</span>
        </div>
      </div>
    </div>
  );
};

export default CallButton;
