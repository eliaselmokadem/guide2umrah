import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Logo from "../assets/logotransparent.png";

const Login = () => {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    // Haal de API-URL uit de omgevingsvariabele
    const apiUrl = process.env.REACT_APP_API_URL;

    try {
      // Verzoek sturen naar de backend met de juiste API-URL
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Ingelogd:", data.token);

        // Bewaar het token en verwerk de login (bijv. redirect naar dashboard)
        localStorage.setItem("token", data.token); // Opslaan van JWT-token
        setError(null); // Foutmelding resetten bij succes

        // Optioneel: Redirect naar het dashboard of andere pagina
        window.location.href = "/dashboard";
      } else {
        setError(data.message); // Toon foutmelding van backend
      }
    } catch (err) {
      console.error("Fout bij inloggen:", err);
      setError("Er is iets mis gegaan. Probeer het opnieuw.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
          <div className="flex justify-center">
            <img src={Logo} alt="Bedrijfslogo" className="w-400 h-400" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Dashboard
          </h2>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-2 mt-1 text-gray-900 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Vul je e-mailadres in"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Wachtwoord
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-2 mt-1 text-gray-900 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Vul je wachtwoord in"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Inloggen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
