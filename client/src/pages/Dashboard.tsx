import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

interface Package {
  _id: string;
  name: string;
  date: string;
  description: string;
  price: number;
  photoPath: string;
}

const Dashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [packageData, setPackageData] = useState({
    name: "",
    date: "",
    description: "",
    price: "",
    photo: null as File | null,
  });
  const [packages, setPackages] = useState<Package[]>([]);
  const [editPackageId, setEditPackageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Haal pakketten op uit de backend
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/packages`
        );
        if (!response.ok) {
          throw new Error("Pakketten ophalen mislukt.");
        }
        const data = await response.json();
        setPackages(data);
      } catch (err) {
        console.error("Fout bij het ophalen van pakketten:", err);
        setError("Fout bij het ophalen van pakketten.");
      }
    };

    fetchPackages();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPackageData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPackageData((prevData) => ({
        ...prevData,
        photo: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", packageData.name);
    formData.append("date", packageData.date);
    formData.append("description", packageData.description);
    formData.append("price", packageData.price);
    if (packageData.photo) {
      formData.append("photo", packageData.photo);
    }

    try {
      const response = editPackageId
        ? await fetch(
            `${process.env.REACT_APP_API_URL}/api/packages/${editPackageId}`,
            {
              method: "PUT",
              body: formData,
            }
          )
        : await fetch(`${process.env.REACT_APP_API_URL}/api/packages`, {
            method: "POST",
            body: formData,
          });

      if (!response.ok) {
        throw new Error("Fout bij het opslaan van pakket.");
      }

      alert(
        editPackageId
          ? "Pakket succesvol bijgewerkt!"
          : "Pakket succesvol toegevoegd!"
      );

      setShowModal(false);
      setPackageData({
        name: "",
        date: "",
        description: "",
        price: "",
        photo: null,
      });
      setEditPackageId(null);

      const updatedPackages = await fetch(
        `${process.env.REACT_APP_API_URL}/api/packages`
      ).then((res) => res.json());
      setPackages(updatedPackages);
    } catch (err) {
      console.error("Fout bij het opslaan van pakket:", err);
      alert("Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditPackageId(pkg._id);
    setPackageData({
      name: pkg.name,
      date: pkg.date,
      description: pkg.description,
      price: pkg.price.toString(),
      photo: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Weet je zeker dat je dit pakket wilt verwijderen?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/packages/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Fout bij het verwijderen van pakket.");
      }

      alert("Pakket succesvol verwijderd!");
      setPackages(packages.filter((pkg) => pkg._id !== id));
    } catch (err) {
      console.error("Fout bij het verwijderen van pakket:", err);
      alert("Er is iets misgegaan. Probeer het opnieuw.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-start justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-7xl p-8 space-y-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
            Welkom op het Dashboard
          </h2>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              Beheer Pakketten
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Nieuw Pakket Toevoegen
            </button>
            {loading ? (
              <p className="text-center mt-4">Laden...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="p-4 bg-gray-100 rounded-lg shadow-lg"
                  >
                    <img
                      src={pkg.photoPath}
                      alt={pkg.name}
                      className="w-full h-40 object-cover rounded"
                    />
                    <h4 className="text-xl font-bold mt-4">{pkg.name}</h4>
                    <p className="text-gray-500">{pkg.description}</p>
                    <p className="text-gray-700 mt-2">Prijs: €{pkg.price}</p>
                    <p className="text-gray-500 mt-1">Datum: {pkg.date}</p>
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Bewerken
                      </button>
                      <button
                        onClick={() => handleDelete(pkg._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Verwijderen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal voor toevoegen/bewerken van pakket */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editPackageId ? "Pakket Bewerken" : "Nieuw Pakket"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Naam
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={packageData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Datum
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={packageData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Omschrijving
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={packageData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Prijs
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={packageData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Foto Uploaden
                </label>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 mt-1"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditPackageId(null);
                  }}
                  className="px-4 py-2 text-gray-500 bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
                >
                  Opslaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
