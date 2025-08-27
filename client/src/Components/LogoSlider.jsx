import React, { useEffect, useRef } from 'react';
import './styles/LogoSlider.css';
import images from '../assets/assets';

const logos = [
  { id: 1, src: images.logo1, alt: 'Suzuki' },
  { id: 2, src: images.logo2, alt: 'Nissan' },
  { id: 3, src: images.logo3, alt: 'Toyota' },
  { id: 4, src: images.logo4, alt: 'Yamaha' },
  { id: 5, src: images.logo5, alt: 'Mazda' },
  { id: 6, src: images.logo6, alt: 'Honda' },
  { id: 7, src: images.logo7, alt: 'BMW' },
  { id: 8, src: images.logo8, alt: 'Audi' },
  { id: 9, src: images.logo9, alt: 'Audi' },
  { id: 10, src: images.logo10, alt: 'Audi' },
  { id: 11, src: images.logo11, alt: 'Audi' },
  { id: 12, src: images.logo12, alt: 'Audi' },
];


// Duplicate logos array to create a continuous loop effect
const duplicatedLogos = [...logos, ...logos];

const LogoSlider = () => {
    const sliderRef = useRef(null);
    const currentIndex = useRef(0);

    useEffect(() => {
        const slideLogos = () => {
            if (sliderRef.current) {
                currentIndex.current += 1;
                
                // Reset translation and index to create infinite loop effect
                if (currentIndex.current >= logos.length) {
                    sliderRef.current.style.transition = 'none';
                    sliderRef.current.style.transform = 'translateX(0)';
                    currentIndex.current = 0;
                    
                    // Small delay before restarting the transition effect
                    setTimeout(() => {
                        sliderRef.current.style.transition = 'transform 1s ease';
                    }, 50);
                } else {
                    sliderRef.current.style.transition = 'transform 1s ease';
                    sliderRef.current.style.transform = `translateX(-${currentIndex.current * (100 / 7)}%)`;
                }
            }
        };

        const interval = setInterval(slideLogos, 2000); // Slide every 4 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="logo-slider-container">
            <div className="red-box">
                <h2>Our Brands</h2>
            </div>
            <div className="slider-wrapper" ref={sliderRef}>
                {duplicatedLogos.map((logo, index) => (
                    <div key={index} className="slider-item">
                        <img src={logo.src} alt={logo.alt} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LogoSlider;