import React from "react";
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  return (
    <div className="container-fluid bg-dark m-0 p-3">
      <div className="container">
        <div className="row">
          <div className="col-md-6 pt-3">
            <div className="row">
              <div className="col-md-6">
                <p className="text-white mb-2">
                  <strong>Address:</strong>
                  <br />
                  No. 227/B, Baker Street, Colombo 07.
                </p>
                <p className="text-white mb-2">
                  <strong>Phone:</strong> +94 77 123 4567
                </p>
                <p className="text-white mb-4">
                  <strong>Email:</strong> info@example.com
                </p>
                <div className="d-flex gap-3 mb-4">
                  <a
                    href="https://wa.me/94771234567"
                    className="text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaWhatsapp size={32} />
                  </a>
                  <a
                    href="https://www.facebook.com/yourpage"
                    className="text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook size={32} />
                  </a>
                  <a
                    href="https://www.instagram.com/yourprofile"
                    className="text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram size={32} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/yourprofile"
                    className="text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin size={32} />
                  </a>
                </div>
              </div>
              <div className="col-md-6">
                <p className="text-white mb-2">
                  <strong>Other Links</strong>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.077493548896!2d80.18938967474932!3d6.0793683939067815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae1714b88f66a7b%3A0x8a7feea89839a01a!2sFaculty%20of%20Engineering%20-%20University%20of%20Ruhuna!5e1!3m2!1sen!2slk!4v1731642245350!5m2!1sen!2slk"
              width="500"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="map"
            ></iframe>
          </div>
        </div>
        <hr className="bg-light" />
        <div className="row">
          <div className="col text-center text-white">
            &copy; 2024 NexOra Ltd. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
