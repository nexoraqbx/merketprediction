import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { auth, db } from "./config/firebaseConfig";
import Home from "./components/Home";
import Chat from "./components/Chat";
import Login from "./components/Login";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import { FaMoon, FaSun, FaSignOutAlt, FaBars, FaCopy, FaUserCircle } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState(""); // Dirección de retiro

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Obtención de la dirección de la billetera desde Firestore
        const fetchWalletAddress = async () => {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setWalletAddress(userDoc.data().ethAddress); // Campo ethAddress en Firestore
          }
        };

        fetchWalletAddress();
      } else {
        setUser(null);
        setWalletAddress("");
        setWithdrawAddress("");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setWalletAddress("");
      setWithdrawAddress("");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copiado al portapapeles`);
  };

  const handleSetWithdrawAddress = (event) => {
    setWithdrawAddress(event.target.value);
  };

  if (loading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  return (
    <Router>
      <div
        className={`App ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        } min-h-screen flex flex-col`}
      >
        {user && (
          <header className="p-4 bg-gray-800 text-white dark:bg-gray-900">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Market Predictions</h1>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white text-2xl md:hidden"
              >
                <FaBars />
              </button>
              <nav
                className={`md:flex md:items-center md:gap-4 ${
                  menuOpen ? "block" : "hidden"
                } md:block`}
              >
                <Link to="/" className="text-blue-400 hover:underline block md:inline">
                  Inicio
                </Link>
                <Link to="/chat" className="text-blue-400 hover:underline block md:inline">
                  Chat
                </Link>
                <Link to="/admin-login" className="text-blue-400 hover:underline block md:inline">
                  Admin
                </Link>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 block md:inline"
                >
                  {darkMode ? <FaSun /> : <FaMoon />}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 block md:inline"
                >
                  <FaSignOutAlt />
                </button>
              </nav>

              {/* Submenú de usuario */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="text-white text-2xl"
                >
                  <FaUserCircle />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-8 translate-x-2 mt-4 w- bg-gray-700 text-white p-4 rounded shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p>
                          <strong>ID de Usuario:</strong>
                        </p>
                        <p className="truncate">{user.uid}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(user.uid, "ID de usuario")}
                        className="text-blue-300 hover:text-blue-400"
                        title="Copiar ID de usuario"
                      >
                        <FaCopy />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p>
                          <strong>Dirección de Billetera:</strong>
                        </p>
                        <p className="truncate">{walletAddress}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(walletAddress, "Dirección de billetera")}
                        className="text-blue-300 hover:text-blue-400"
                        title="Copiar dirección de billetera"
                      >
                        <FaCopy />
                      </button>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm">
                        <strong>Dirección de Retiro (Crypto):</strong>
                      </label>
                      <input
                        type="text"
                        value={withdrawAddress}
                        onChange={handleSetWithdrawAddress}
                        placeholder="Introduce tu dirección de retiro"
                        className="mt-1 p-2 rounded w-full bg-gray-900 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}
        <main className="p-4 flex-grow">
          <Routes>
            {!user ? (
              <Route path="*" element={<Login setUser={setUser} />} />
            ) : (
              <>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/chat" element={<Chat user={user} />} />
              </>
            )}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        {/* Contenedor de imágenes */}
        <section className="images-container">
          <img
            src="https://raw.githubusercontent.com/nexoraqbx/merketprediction/refs/heads/main/Dise%C3%B1o%20sin%20t%C3%ADtulo.jpg"
            alt="Imagen 1"
          />
          <img
            src="https://raw.githubusercontent.com/nexoraqbx/merketprediction/refs/heads/main/Dise%C3%B1o%20sin%20t%C3%ADtulo%20(2).jpg"
            alt="Imagen 2"
          />
          <img
            src="https://raw.githubusercontent.com/nexoraqbx/merketprediction/refs/heads/main/Dise%C3%B1o%20sin%20t%C3%ADtulo%20(1).jpg"
            alt="Imagen 3"
          />
          <img
            src="https://raw.githubusercontent.com/nexoraqbx/merketprediction/refs/heads/main/dise%C3%B1osin%20titulo5.jpeg"
            alt="Imagen 4"
          />
        </section>
        {/* Footer */}
        <footer className="footer">
          <p>Síguenos en:</p>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </footer>
      </div>
    </Router>
  );
}

export default App;