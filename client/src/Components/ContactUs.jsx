import React from "react";
import MainHeaderText from "./Headers";
import "./styles/Contactus.css"

const ContactUs = () => {
  return (
    <div className="container-fluid pb-5 pt-5 mt-0 contact-container" id="contactus">
      <div className="row justify-content-center">
        <div className="col-md-5 col-12">
          <MainHeaderText text="Contact us"/>
          <form>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input type="text" className="form-control" id="name" placeholder="Enter your full name" />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input type="email" className="form-control" id="email" placeholder="Enter your email" />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea className="form-control" id="message" rows="4" placeholder="Your message"></textarea>
            </div>
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="terms" />
              <label className="form-check-label" htmlFor="terms">I agree to the terms and conditions</label>
            </div>
            <button type="submit" className="btn btn-danger w-100">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
