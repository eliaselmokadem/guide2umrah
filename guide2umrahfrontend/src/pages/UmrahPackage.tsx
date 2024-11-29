import React from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import backgroundImage from "../assets/mekkahfullscreen.jpg";
import foto1 from "../assets/fotorecht1.jpg";
import foto2 from "../assets/fotorecht2.jpg";
import foto3 from "../assets/fotorecht3.jpg";
import foto4 from "../assets/fotorecht4.jpg";
import foto5 from "../assets/fotorecht5.jpg";
import foto6 from "../assets/fotorecht6.jpg";

interface Package {
  title: string;
  date: string;
  duration: string;
  price: string;
  rating: number;
  button: string;
  images: string[];
}

const packageData: Package[] = [
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

const UmrahPackage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();

  // Controleer of packageId geldig is en binnen de array-limieten valt
  const pkg = packageId && packageData[parseInt(packageId)];
  if (!pkg) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-2xl text-red-600">
          Ongeldig pakket-ID. Probeer opnieuw.
        </p>
        <Link to="/umrah" className="ml-4 text-green-500 hover:text-green-600">
          Terug naar pakketten
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        color: "#f0f0f0",
      }}
    >
      <Navbar />
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <div className="bg-white p-10 rounded-lg shadow-2xl max-w-3xl w-full">
          <h1 className="text-5xl font-bold text-gray-800 mb-6 text-center">
            {pkg.title}
          </h1>
          <div className="flex flex-col md:flex-row md:justify-between mb-6">
            <p className="text-xl text-gray-600 mb-2 md:mb-0">{pkg.date}</p>
            <p className="text-lg text-gray-500">{pkg.duration}</p>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-4">
            Vanaf {pkg.price}
          </p>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Dit pakket biedt alles wat je nodig hebt voor een perfecte
            Umrah-reis naar Mekka en Medina. Geniet van een comfortabele reis,
            uitstekende begeleiding, en een onvergetelijke spirituele ervaring.
          </p>

          <div className="flex justify-center mb-8">
            <a
              href={`https://wa.me/+32465349779?text=Ik%20ben%20ge%C3%AFnteresseerd%20in%20het%20Umrah-pakket%20${pkg.title}%20en%20wil%20meer%20informatie%20ontvangen.`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-green-500 text-white px-8 py-4 rounded-full hover:bg-green-600 transition-all duration-300 shadow-lg transform hover:scale-105">
                Boek nu via WhatsApp
              </button>
            </a>
          </div>

          <div className="flex justify-center">
            <Link
              to="/umrah"
              className="text-green-500 hover:text-green-600 text-lg font-semibold"
            >
              Terug naar pakketten
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UmrahPackage;
