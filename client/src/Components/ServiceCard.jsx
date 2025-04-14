import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

const ServiceCard = ({ title, id, description, image }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className="col-10 col-md-4 d-flex justify-content-center"
      initial={{ scale: 0.4, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ delay: 0.25, duration: 0.5, ease: "easeIn" }}
      
    >
      <div
        className="card service-card m-3 shadow-sm pb-3 pt-2"
        style={{ width: "20rem" }}
      >
        <div className="d-flex justify-content-center">
          <img
            src={image}
            className="rounded-circle mt-4"
            alt={title}
            style={{
              width: "160px",
              height: "160px",
              objectFit: "cover",
            }}
          />
        </div>
        <div className="card-body text-center">
          <h5 className="card-title fw-bold text-dark">{title}</h5>
          <p className="card-text text-secondary">{description}</p>
          <Link to={`/services?id=${id}`} className="text-danger text-decoration-none">Learn more &gt;</Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
