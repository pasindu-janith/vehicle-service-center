import React, { useRef } from "react";
import "./styles/Aboutus.css";
import images from "./../assets/assets";
import LogoSlider from "./LogoSlider";
import { FaCarAlt } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { GiAutoRepair } from "react-icons/gi";
import { VscWorkspaceTrusted } from "react-icons/vsc";
import MainHeaderText from "./Headers";
import { motion, useInView } from "framer-motion";

const AboutUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <React.Fragment>
      <div className="container-fluid bg-about" id="aboutus">
        <div className="container pt-4">
          <div className="row">
            <div className="col-md-6 p-1 overlapping-images-container d-md-block d-none">
              <motion.div
                ref={ref}
                className={`circle-image circle-one`}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.25, duration: 0.5, ease: "easeIn" }}
                style={{ display: "inline-block" }}
              ></motion.div>
              <motion.div
                className={`circle-image circle-two`}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.25, duration: 0.5, ease: "easeIn" }}
                style={{ display: "inline-block" }}
              ></motion.div>
              <motion.div
                className={`circle-image circle-three`}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.25, duration: 0.5, ease: "easeIn" }}
                style={{ display: "inline-block" }}
              ></motion.div>
            </div>
            <div className="col-md-6 text-white">
              <MainHeaderText text="About us" color="white" />
              <p className="paragraph">
                At Shan Automobile and Hybrid Workshop, we are committed to
                providing top-notch automotive repair and maintenance services
                with a focus on both conventional and hybrid vehicles. With
                years of experience and a team of highly skilled technicians, we
                pride ourselves on delivering reliable, efficient, and
                affordable solutions to keep your vehicle running smoothly.
                Whether it’s routine servicing, engine diagnostics, or advanced
                hybrid system repairs, we use the latest tools and technology to
                ensure quality and precision. At Shan, customer satisfaction is
                our top priority — we aim to build lasting relationships through
                honest service and expert care.
              </p>
              <p className="paragraph">
                Driven by a passion for innovation and sustainability, our
                workshop invests continuously in cutting-edge diagnostics and
                rigorous technician training. This ensures that every
                repair—from a standard oil change to complex hybrid battery
                servicing—is performed with uncompromising precision and respect
                for the environment.
              </p>
              <div className="d-flex align-content-center">
                <button className="btn btn-danger rounded-pill ps-4 pe-4 pt-2 pb-2">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <img
        src={images.tiretread}
        alt=""
        className="w-100 mb-5"
        style={{ transform: "rotateX(180deg)" }}
      />
      <div className="container-fluid mb-5">
        <div className="row">
          <div className="col-md-5 d-flex justify-content-center">
            <img src={images.vector1} className="w-75" alt="Vector" />
          </div>
          <div className="col-md-7">
            <div className="premium-banner mb-4">
              <h2 className="text-center">
                We are <span className="highlight">PREMIUM</span> auto care
                service provider
              </h2>
              <div className="ps-2 ps-md-5 pt-3">
                <p className="paragraph">
                  Whether you need a simple checkup or complex repairs, we’re
                  here to ensure your car is in perfect condition. Trust us for
                  a smooth, hassle-free experience every time.
                </p>
                <table className="mb-4">
                  <tbody>
                    <tr>
                      <td>
                        <FaCarAlt size={24} className="me-2" /> High-Quality
                        Service Standards
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <IoIosSettings size={24} className="me-2" />{" "}
                        Comprehensive Auto Care Solutions
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <GiAutoRepair size={24} className="me-2" />{" "}
                        State-of-the-Art Facilities
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <VscWorkspaceTrusted size={24} className="me-2" />{" "}
                        Convenient and Reliable
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LogoSlider />
    </React.Fragment>
  );
};

export default AboutUs;
