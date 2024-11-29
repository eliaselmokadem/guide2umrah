import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Importeer je bestaande Navbar-component
import backgroundImage from "../assets/mekkahfullscreen.jpg"; // Importeer je achtergrondafbeelding
import { Link } from "react-router-dom";

interface Package {
  _id: string;
  name: string; // Aangepast van title naar name
  date: string;
  description: string;
  price: number;
  photoPath: string; // Voor de afbeelding
}

const Umrah: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]); // State voor de pakketten
  const [loading, setLoading] = useState(true); // State voor de laadtoestand
  const [error, setError] = useState<string | null>(null); // State voor fouten

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/packages`
        );

        if (!response.ok) {
          throw new Error("Kan de pakketten niet ophalen.");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setPackages(data); // Zet de opgehaalde data in de state
        } else {
          throw new Error("Ongeldige data ontvangen van de server.");
        }
      } catch (err) {
        setError("Er is een fout opgetreden bij het ophalen van de pakketten.");
        console.error(err);
      } finally {
        setLoading(false); // Zet de laadtoestand op false
      }
    };

    fetchPackages();
  }, []);

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

          {/* Laadtoestand of foutmelding weergeven */}
          {loading ? (
            <p className="text-white">Laden...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : packages.length > 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-lg space-y-8 mt-12 md:mt-16 lg:mt-24">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {packages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="bg-gray-100 p-4 rounded-lg shadow-md"
                  >
                    <h2 className="text-lg font-bold mb-2">{pkg.name}</h2>
                    <p className="text-sm text-gray-500">{pkg.date}</p>
                    <p className="text-sm text-gray-500">{pkg.description}</p>

                    {/* Afbeelding weergeven */}
                    <img
                      src={`${pkg.photoPath}`}
                      alt={pkg.name}
                      className="w-full h-48 object-cover rounded-lg mt-4"
                    />

                    <p className="text-xl font-bold text-green-600 mt-4">
                      Vanaf €{pkg.price}
                    </p>
                    <Link to={`/umrah/package/${pkg._id}`}>
                      <button className="mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                        Meer Info
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-white">Geen pakketten beschikbaar.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Umrah;
