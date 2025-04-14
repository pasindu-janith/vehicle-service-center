import React, { useRef } from "react";
import { FaLinkedin, FaFacebook } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { motion, useInView } from "framer-motion";

const StaffCard = ({ name, position, image, linkedin, facebook }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      className="col-10 col-md-3 d-flex justify-content-center"
      initial={{ scale: 0.4, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ delay: 0.25, duration: 0.5, ease: "easeIn" } }
    >
      <div className="card h-100">
        <img src={image} className="card-img-top" alt={`${name}`} />
        <div className="card-body text-center">
          <h5 className="card-title">{name}</h5>
          <p className="card-text">{position}</p>
          {/* Social Links */}
          <div className="social-links mt-3">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-primary btn-sm xm-1"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={24} />
              </a>
            )}
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-danger btn-sm mx-1"
                aria-label="Facebook"
              >
                <SiGmail size={24} />
              </a>
            )}
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-primary btn-sm mx-1"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StaffCard;
