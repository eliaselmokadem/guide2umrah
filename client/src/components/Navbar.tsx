import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Zorg ervoor dat je deze CSS hebt voor de animatie
import logo from "../assets/logotransparent.png";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white text-black py-1 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <img src={logo} style={{ maxHeight: 95 }} alt="" />
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
          <Link to="/login">
            <button className="bg-green-500 px-6 py-1 rounded text-black font-bold hover:bg-blue-300 transition">
              Login
            </button>
          </Link>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
