import React from "react";
import { useParams, Link } from "react-router-dom";

interface Package {
  title: string;
  date: string;
  duration: string;
  price: string;
  rating: number;
  button: string;
}

const packageData: Package[] = [
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

const UmrahPackage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();

  // Controleren of packageId niet undefined is
  if (!packageId) {
    return <div>Ongeldige pakket-ID</div>;
  }

  const pkg = packageData[parseInt(packageId)];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{pkg.title}</h1>
        <p className="text-xl text-gray-600 mb-4">{pkg.date}</p>
        <p className="text-lg text-gray-500">{pkg.duration}</p>
        <p className="text-2xl font-bold text-green-600 mt-4">{pkg.price}</p>
        <p className="text-gray-700 mt-4">
          {/* Voer hier extra beschrijving of details van het pakket in */}
          Dit pakket biedt alles wat je nodig hebt voor een perfecte Umrah-reis
          naar Mekka en Medina.
        </p>

        <div className="flex justify-center mt-6">
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300">
            Boek nu
          </button>
        </div>

        <div className="mt-6">
          <Link to="/umrah" className="text-green-500 hover:text-green-600">
            Terug naar pakketten
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UmrahPackage;
