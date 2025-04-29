import React from "react";
import services from "./shared/data";
import { useLocation } from "react-router-dom";
const ServiceType = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const value = query.get("id");

  const service = services.find((service) => service.id === parseInt(value));
  return (
    <div 
      className="container"
      style={{ marginTop: "100px", minHeight: "500px" }}
    > 
      <div className="row">
        <div className="col-md-5 d-flex justify-content-center align-items-center">
          <img
            src={service.image}
            className="col-md-10 col-10 mb-3"
            alt="service images"
          />
        </div>
        <div className="col-md-7">
          <h1>{service.title}</h1>
          <p>
            Maintaining a vehicle is crucial for ensuring its longevity,
            performance, and safety. Over time, various components of a vehicle
            undergo wear and tear due to regular usage. To address these,
            different types of vehicle services are designed to target specific
            maintenance needs, ranging from routine checkups to comprehensive
            overhauls. Below is a detailed exploration of the main types of
            vehicle services available. An intermediate service is more detailed
            than a basic service and includes additional checks and replacements
            to maintain vehicle efficiency. <br />
            Includes:
            <br />
            All tasks in basic service Air filter replacement Inspection of the
            exhaust system and fuel system Brake fluid top-up and checking brake
            pads for wear Steering and suspension checks Battery condition check
            and testing
          </p>
          <p>
            A full service is a more comprehensive checkup and is usually
            performed annually. It covers more components and systems than an
            interim service and helps identify potential issues before they
            cause significant problems.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceType;
