import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import foto1 from "../assets/fotorecht1.jpg";
import foto2 from "../assets/fotorecht2.jpg";
import foto3 from "../assets/fotorecht3.jpg";
import foto4 from "../assets/fotorecht4.jpg";
import foto5 from "../assets/fotorecht5.jpg";
import foto6 from "../assets/fotorecht6.jpg";
import safarcom from "../assets/safarcom.png";
import umrah2go from "../assets/umrah2go.png";
import jeddahflights from "../assets/jeddahflights.png";

const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [foto1, foto2, foto3, foto4, foto5, foto6];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative h-screen">
      {/* Slideshow as background */}
      <div
        style={{
          width: "100%",
          height: "100%", // Full viewport height
          position: "absolute",
          top: 0,
          left: 0,
          backgroundImage: `url(${foto5})`, // Set background image dynamically
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out", // Animation for background image
          zIndex: -1, // Send background image to the back
        }}
      ></div>

      {/* Content Section */}

      <div className="bg-black bg-opacity-55 h-full flex flex-col justify-center items-center text-white">
        <h2 className="text-4xl font-bold mb-4">Umrah België</h2>
        <p className="text-xl mb-6">
          Ervaar een unieke umrah reis naar Mekka en Medina in 2024-2025
        </p>
        <Link to="/umrah">
          <button className="bg-green-500 px-6 py-3 rounded text-black font-bold hover:bg-green-600 transition">
            Pakketten
          </button>
        </Link>

        <div className="bg-white mh-[500px] mw-[750px] mt-4 rounded-3xl text-black">
          <div
            className="flex justify-center items-center flex-wrap gap-4 mt-4"
            style={{ borderRadius: 20, marginBottom: 15, marginTop: 15 }}
          >
            <image href="">
              <img src={safarcom} className="max-h-[150px]" alt="Safarcom" />
            </image>
            <image href="">
              <img src={umrah2go} className="max-h-[150px]" alt="Umrah2Go" />
            </image>
            <image href="https://jeddahflights.com/">
              <img
                src={jeddahflights}
                className="max-h-[150px]"
                alt="Jeddah Flights"
              />
            </image>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
