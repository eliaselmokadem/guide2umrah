import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Zorg ervoor dat je deze CSS hebt voor de animatie

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white text-black py-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-4xl font-bold">
          <Link to="/">
            GUIDE <span className="animate-color-change">2</span> UMRAH
          </Link>
        </h1>
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="text-xl hover:text-green-500">
              {" "}
              {/* Vergroot de tekstgrootte van de link */}
              Home
            </Link>
          </li>
          <li>
            <Link to="/umrah" className="text-xl hover:text-green-500">
              {" "}
              {/* Vergroot de tekstgrootte van de link */}
              Umrah
            </Link>
          </li>
          <li>
            <Link to="/aboutus" className="text-xl hover:text-green-500">
              Over ons
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
