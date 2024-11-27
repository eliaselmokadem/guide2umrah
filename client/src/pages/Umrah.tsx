import React from "react";
import Navbar from "../components/Navbar"; // Importeer je bestaande Navbar-component
import backgroundImage from "../assets/mekkahfullscreen.jpg"; // Importeer je achtergrondafbeelding
import { Link } from "react-router-dom";
import foto1 from "../assets/fotorecht1.jpg";
import foto2 from "../assets/fotorecht2.jpg";
import foto3 from "../assets/fotorecht3.jpg";
import foto4 from "../assets/fotorecht4.jpg";
import foto5 from "../assets/fotorecht5.jpg";
import foto6 from "../assets/fotorecht6.jpg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const packages = [
  {
    title: "Ramadan / Krokusvakantie",
    date: "27/02 - 08/03",
    duration: "10 DAGEN",
    price: "2299,-",
    rating: 5,
    button: "Meer Info",
    images: [foto1, foto2],
  },
  {
    title: "November Umrah",
    date: "21/11 - 28/11",
    duration: "7 DAGEN",
    price: "1399,-",
    rating: 5,
    button: "Meer Info",
    images: [foto3, foto4],
  },
  {
    title: "December Umrah",
    date: "03/12 - 12/12",
    duration: "9 DAGEN",
    price: "1499,-",
    rating: 5,
    button: "Meer Info",
    images: [foto5, foto6],
  },
  {
    title: "Wintervakantie",
    date: "27/12 - 06/01",
    duration: "11 DAGEN",
    price: "2399,-",
    rating: 5,
    button: "Meer Info",
    images: [foto1, foto2],
  },
];

const Umrah: React.FC = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div>
      {/* Navbar blijft buiten de overlay */}
      <Navbar />

      {/* Container voor de achtergrond en pakketten */}
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {/* Overlay alleen op de achtergrond toepassen */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)", // Transparante overlay
            zIndex: 0, // Overlay onder de inhoud plaatsen
          }}
        ></div>

        {/* Inhoud van de pagina */}
        <div className="container mx-auto px-4 py-10 relative z-10 flex flex-col justify-center items-center min-h-screen">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 text-white">
            Beschikbare Umrah Pakketten
          </h1>

          {/* Platform/container voor de data */}
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-8 mt-12 md:mt-16 lg:mt-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {packages.map((pkg, index) => (
                <div
                  key={index}
                  className="bg-gray-100 p-4 rounded-lg shadow-md"
                >
                  <h2 className="text-lg font-bold mb-2">{pkg.title}</h2>
                  <p className="text-sm text-gray-500">{pkg.date}</p>
                  <p className="text-sm text-gray-500">{pkg.duration}</p>

                  {/* Slider voor pakketafbeeldingen */}
                  <Slider {...sliderSettings} className="mt-4">
                    {pkg.images.map((image, imgIndex) => (
                      <div key={imgIndex}>
                        <img
                          src={image}
                          alt={`${pkg.title} - afbeelding ${imgIndex + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </Slider>

                  <p className="text-xl font-bold text-green-600 mt-4">
                    Vanaf {pkg.price}
                  </p>
                  <Link to={`/umrah/package/${index}`}>
                    <button className="mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                      {pkg.button}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Umrah;
