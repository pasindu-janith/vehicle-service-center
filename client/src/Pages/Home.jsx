import Navbar from "../Components/Navbar";
import Herocard from "../Components/Herocard";
import Services from "../Components/Services";
import AboutUs from "../Components/Aboutus";
import Resources from "../Components/Resources";
import { useEffect, useState } from "react";
import ContactUs from "../Components/ContactUs";
import Footer from "../Components/Footer";

const Home = () => {
  const [activeSection, setActiveSection] = useState("");

  const sectionIds = ["carouselExampleFade", "services", "aboutus","expertise","contactus"];

  useEffect(() => {
    const options = {
      root: null, // Observe relative to the viewport
      threshold: 0.5, // Trigger when 60% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => {
      observer.disconnect(); // Cleanup on unmount
    };
  }, [sectionIds]);
  
  return (
    <div>
      <Navbar activeSection={activeSection} />
      <Herocard />
      <Services />
      <AboutUs />
      <Resources />
      <ContactUs />
      <Footer/>
    </div>
  );
};

export default Home;
