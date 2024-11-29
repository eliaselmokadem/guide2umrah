import React from "react";
import { Link } from "react-router-dom";
import foto5 from "../assets/fotorecht5.jpg";
import safarcom from "../assets/safarcom.png";
import umrah2go from "../assets/umrah2go.png";
import jeddahflights from "../assets/jeddahflights.png";

const Hero: React.FC = () => {
  return (
    <div className="relative w-full h-screen font-tajawal">
      {/* Vaste achtergrond */}
      <div
        style={{
          backgroundImage: `url(${foto5})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      ></div>

      {/* Transparante container */}
      <div className="absolute top-[61%] left-0 w-full h-6/10 bg-black bg-opacity-90 text-white flex flex-col md:flex-row items-start md:items-center justify-between px-10 py-20 border-t-4 border-green-500">
        {/* Tekstgedeelte (links) */}
        <div className="w-full md:w-1/2 space-y-8">
          <h1 className="text-6xl font-extrabold tracking-wide leading-snug">
            Welkom bij Guide2Umrah
          </h1>
          <p className="text-2xl leading-relaxed">
            Uw partner voor een spirituele en onvergetelijke reis naar Mekka en
            Medina. Boek nu uw exclusieve Umrah-pakket en ervaar comfort en
            kwaliteit.
          </p>
          <Link to="/umrah">
            <button className="bg-green-500 px-12 py-4 text-black font-semibold text-2xl rounded-full shadow-md hover:bg-green-600 transition">
              Bekijk pakketten
            </button>
          </Link>
        </div>

        {/* Partnergedeelte (rechts) */}
        <div className="w-full md:w-1/2 flex flex-col items-center space-y-6 mt-10 md:mt-0">
          <h2 className="text-3xl font-semibold text-center">
            Hier zijn onze betrouwbare partners:
          </h2>
          <div className="flex flex-col items-center space-y-6">
            <img src={safarcom} className="h-20" alt="Safarcom" />
            <img src={umrah2go} className="h-20" alt="Umrah2Go" />
            <a href="https://jeddahflights.com/">
              <img src={jeddahflights} className="h-20" alt="Jeddah Flights" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
