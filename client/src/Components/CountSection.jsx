import React, { useRef, useEffect, useState } from 'react';
import CountUp from 'react-countup';

const StatsSection = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const currentRef = sectionRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect(); // Stop observing after it becomes visible
        }
      },
      { threshold: 0.5 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className="container-fluid py-5 bg-light text-center">
      <div className="row">
        <div className="col-md-4">
          <h1 className="display-4">
            {visible ? <CountUp end={100} duration={2} /> : '0'}+
          </h1>
          <p className="lead">Registered customers</p>
        </div>
        <div className="col-md-4">
          <h1 className="display-4">
            {visible ? <CountUp end={500} duration={2} /> : '0'}+
          </h1>
          <p className="lead">Successful Services</p>
        </div>
        <div className="col-md-4">
          <h1 className="display-4">
            {visible ? <CountUp end={600} duration={2} /> : '0'}+
          </h1>
          <p className="lead">Top brands</p>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
