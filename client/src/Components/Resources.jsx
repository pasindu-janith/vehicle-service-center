import React, { useEffect, useRef, useState } from "react";
import { cards, staff } from "./shared/data";
import MainHeaderText from "./Headers";
import StaffCard from "./StaffCard";
import CountSection from "./CountSection";
import "./styles/Resources.css";
import images from "../Assets/assets";
import { FaCheckCircle } from "react-icons/fa";
const Resources = () => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const text = "Your Satisfaction, Our Priority"; // Change this to the text you want

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Disconnect after the first observation
        }
      },
      { threshold: 0.5 } // Adjust threshold as needed
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="section-container mt-4">
        <div ref={containerRef} className="typewriter-container fs-sm-4 mb-4">
          {isVisible && <h1 className="typewriter-text">{text}</h1>}
        </div>
        <div className="container">
          <div className="row">
            {cards.map((card, index) => (
              <div className="col-md-3" key={index}>
                <div className="card h-100 p-2 pt-3 card-desc border-0">
                  <img src={card.image} className="card-img" alt={card.title} />
                  <div className="card-body">
                    <h3 className="card-title">{card.title}</h3>
                    <p className="card-text">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
            ;
          </div>
        </div>
      </div>
      <CountSection />

      <div className="container-fluid text-center pt-5 pb-4" id="expertise">
        <div className="container">
          <MainHeaderText text="Our Expertise" />

          <div className="row justify-content-center mt-3">
            {staff.map((person, index) => (
              <StaffCard
                name={person.name}
                position={person.position}
                image={person.image}
                facebook={person.facebook}
                linkedin={person.linkedin}
                key={person.name}
              />
            ))}
          </div>
          <hr/>
          <div className="row mt-5 pb-3">
            <div className="col-md-5 justify-content-center">
              <img src={images.vector2} alt="vector2" className="w-100" />
            </div>
            <div className="col-md-7 text-start align-content-center">
              <h2 className="fw-bolder mb-3">
                <label className="text-danger">Register</label> and{" "}
                <label className="text-danger">Book appointment</label> today!
              </h2>
              <p>
                You can explore the features that we provide with fun and have
                their own functions each feature.
              </p>
              <ul className="p-0">
                <li>
                  <FaCheckCircle size={20} color="red" />
                  &nbsp; Convenient Online & Mobile Booking
                </li>
                <li>
                  <FaCheckCircle size={20} color="red" />
                  &nbsp; Real-Time Service Tracking
                </li>
                <li>
                  <FaCheckCircle size={20} color="red" />
                  &nbsp; Comprehensive Service History
                </li>
                <li>
                  <FaCheckCircle size={20} color="red" />
                  &nbsp; Timely Reminders & Notifications
                </li>
                <li>
                  <FaCheckCircle size={20} color="red" />
                  &nbsp; Secure Payments & Exclusive Offers
                </li>
              </ul>
              <button className="btn btn-danger rounded-pill ps-4 pe-4 pt-2 pb-2">
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Resources;
