import React, { useEffect } from "react";
import ServiceType from "../Components/ServiceType";
import Footer from "../Components/Footer";
import ServiceNavbar from "../Components/NavbarService";

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page
  }, []);

  return (
    <>
      <ServiceNavbar />
      <ServiceType />
      <Footer />
    </>
  );
};

export default Services;
