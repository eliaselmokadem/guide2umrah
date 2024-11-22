import React from "react";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="flex items-start justify-center min-h-screen bg-gray-100">
        {/* Hoofdcontainer, breder gemaakt */}
        <div className="w-full max-w-7xl p-8 space-y-6 bg-white shadow-lg rounded-lg flex">
          {/* Hoofdinhoud */}
          <div className="w-2/3 pr-6">
            {/* Titel */}
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
              Welkom op het Dashboard
            </h2>

            {/* Coming Soon Sectie */}
            <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg shadow-lg">
              <div className="text-center">
                <h3 className="text-3xl font-semibold text-gray-700 mb-4">
                  Coming Soon
                </h3>
                <p className="text-xl text-gray-500">
                  We zijn momenteel bezig met het ontwikkelen van nieuwe
                  functies voor je. Blijf op de hoogte!
                </p>
              </div>
            </div>

            {/* Footer sectie */}
            <footer className="text-center text-sm text-gray-500 mt-6">
              &copy; 2024 Mijn Bedrijf. Alle rechten voorbehouden.
            </footer>
          </div>

          {/* Aside met opties */}
          <aside className="w-1/3 bg-gray-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">Pakketten</h3>
            <ul className="space-y-4">
              <li>
                <button className="w-full text-left px-4 py-2 font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Pakketten Beheren
                </button>
              </li>
              <li>
                <button className="w-full text-left px-4 py-2 font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Pakketten Toevoegen/Verwijderen
                </button>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
