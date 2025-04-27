import  { useEffect } from "react";
import images from "../assets/assets";
import CallButton from "./CallButton";
import "./styles/Herocard.css";

const Herocard = () => {
  useEffect(() => {
    const initializeCarousel = async () => {
      const bootstrap = await import("bootstrap"); // Dynamically import Bootstrap
      const carouselElement = document.querySelector("#carouselExampleFade");

      if (carouselElement) {
        new bootstrap.Carousel(carouselElement, {
          interval: 10000, // 4 seconds
          ride: "carousel",
        });
      }
    };

    initializeCarousel(); // Call the async function
  }, []);

  const carousel1 = {
    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6),rgba(0, 0, 0, 0)),url(${images.banner1})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  };

  const carousel2 = {
    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6),rgba(0, 0, 0, 0)),url(${images.banner2})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  };

  const carousel3 = {
    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6),rgba(0, 0, 0, 0)),url(${images.banner3})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  };

  return (
    <>
      <div
        id="carouselExampleFade"
        className="carousel slide carousel-fade"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          <div className="carousel-item active vh-100" style={carousel1}>
            <div className="position-absolute text-white ms-md-4 ms-1 header">
              <h1 className="text-white  display-md-3 display-4 fw-bold">
                Welcome to <br />
                Shan Automobile and <br />
                Hybrid Workshop
              </h1>
              <p className="fs-5 col-md-8 col-10">
                Sri Lanka’s leading vehicle service center's official online
                marketplace
                <br />
                Register with us. Get more benefits!
              </p>
              <button className="btn btn-danger rounded-pill ps-3 pe-3 pt-2 pb-2">
                Book now
              </button>
            </div>
            <CallButton />
          </div>
          <div className="carousel-item vh-100" style={carousel2}>
            <div className="position-absolute text-white ms-4 header">
              <h1 className="text-white display-md-3 display-4 fw-bold">
                Shine Bright,
                <br /> Drive Confidently!
              </h1>
              <p className="col-md-8 col-10 fs-5">
                Give your car the love it deserves with our premium exterior and
                interior cleaning. Drive away with a showroom finish.
              </p>
              <button className="btn btn-danger rounded-pill ps-3 pe-3 pt-2 pb-2">
                Book now
              </button>
            </div>
            <CallButton />
          </div>
          <div className="carousel-item vh-100" style={carousel3}>
            <div className="position-absolute text-white ms-4 header">
              <h1 className="text-white display-md-3 display-4 fw-bold">
                Quality You Can
                <br /> Count On
              </h1>
              <p className="col-md-8 col-10 fs-5">
                We use only genuine spare parts to ensure your vehicle’s
                longevity and performance. Drive with confidence and peace of
                mind.
              </p>
              <button className="btn btn-danger rounded-pill ps-3 pe-3 pt-2 pb-2">
                Book now
              </button>
            </div>
            <CallButton />
          </div>
        </div>

        {/* Previous Button */}
        <button
          className="carousel-control-prev position-absolute d-none d-md-block"
          type="button"
          data-bs-target="#carouselExampleFade"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>

        {/* Next Button */}
        <button
          className="carousel-control-next position-absolute d-none d-md-block"
          type="button"
          data-bs-target="#carouselExampleFade"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </>
  );
};

export default Herocard;
