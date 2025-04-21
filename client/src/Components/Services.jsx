import React from "react";
import images from "./../Assets/assets";
import "./styles/Services.css";
import MainHeaderText from "./Headers";
import ServiceCard from "./ServiceCard";
import services from "./shared/data";

const Services = () => {
  return (
    <div className="container-fluid bg-service p-0" id="services">
      <div className="container text-center pt-5">
        <MainHeaderText text="Our Services" />
        <div className="row justify-content-center mb-5">
          {services.map((service, index) => (
            <ServiceCard {...service} key={service.id}/>
          ))}
        </div>
      </div>
      <img src={images.tiretread} alt="" className="w-100" />
    </div>
  );
};

export default Services;
