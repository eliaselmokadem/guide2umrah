import React from "react";
import { Link } from "react-router-dom"; // Importeer de Link voor navigatie
import Navbar from "../components/Navbar";
import backgroundImage from "../assets/mekkahfullscreen.jpg";

const packages = [
  {
    title: "Ramadan / Krokusvakantie",
    date: "27/02 - 08/03",
    duration: "10 DAGEN",
    price: "2299,-",
    rating: 5,
    button: "Meer Info",
  },
  {
    title: "November Umrah",
    date: "21/11 - 28/11",
    duration: "7 DAGEN",
    price: "1399,-",
    rating: 5,
    button: "Meer Info",
  },
  {
    title: "December Umrah",
    date: "03/12 - 12/12",
    duration: "9 DAGEN",
    price: "1499,-",
    rating: 5,
    button: "Meer Info",
  },
  {
    title: "Wintervakantie",
    date: "27/12 - 06/01",
    duration: "11 DAGEN",
    price: "2399,-",
    rating: 5,
    button: "Meer Info",
  },
];

const Umrah: React.FC = () => {
  return (
    <div>
      <Navbar />

      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 0,
          }}
        ></div>

        <div className="container mx-auto px-4 py-10 relative z-10 flex flex-col justify-center items-center min-h-screen">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-8 text-white">
            Beschikbare Umrah Pakketten
          </h1>

          <div className="bg-white p-6 rounded-lg shadow-2xl space-y-8 mt-12 md:mt-16 lg:mt-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {packages.map((pkg, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-tl from-white via-gray-100 to-gray-200 p-4 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out"
                >
                  <h2 className="text-xl font-bold mb-2 text-gray-800">
                    {pkg.title}
                  </h2>
                  <p className="text-sm text-gray-500">{pkg.date}</p>
                  <p className="text-sm text-gray-500">{pkg.duration}</p>
                  <p className="text-2xl font-bold text-green-600 mt-4">
                    Vanaf {pkg.price}
                  </p>

                  <div className="flex justify-center mt-4">
                    {Array(pkg.rating)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i} className="text-yellow-500 text-lg">
                          ★
                        </span>
                      ))}
                  </div>

                  {/* Link naar de UmrahPackage-pagina */}
                  <Link
                    to={`/umrah/package/${index}`}
                    className="mt-6 w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300"
                  >
                    {pkg.button}
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
