// src/pages/Layout.js (Assuming your Layout component is in the 'pages' directory)
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import "../styles/Layout.css";
import logo from "../logo2.png";


const NAV_ITEMS = ["Home", "Learn", "Translator", "Profile"];

const NAV_PATHS = {
  Home: "/home",
  Learn: "/learn",
  Translator: "/translator",
  Profile: "/userProfile", // Make sure this matches your Route path for Profile
};

// No longer need 'currentPage' prop, but keeping 'isLoggedIn' if you use it in Layout for something else.
function Layout({ children, isLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location object

  // Determine the current page for highlighting
  const currentPath = location.pathname;
  let currentPage = '';
  // Loop through NAV_PATHS to find a match for the current URL path
  for (const itemKey in NAV_PATHS) {
    if (NAV_PATHS[itemKey] === currentPath) {
      currentPage = itemKey; // Set currentPage to "Home", "Learn", etc.
      break;
    }
  }

  const handleLogout = () => {
    console.log("User logged out!");
    // You might want to clear local storage/cookies here for actual logout
    navigate("/login");
  };

  return (
    <div className="layout-container">
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="Hands UP Logo" className="logo" />
          <h1 className="site-title">Hands UP</h1>
        </div>
        <nav>
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <Link
                  to={NAV_PATHS[item]}
                  // The class is now determined dynamically based on useLocation
                  className={`nav-link ${
                    currentPage === item ? "nav-link-active" : ""
                  }`}
                  // Ensure no inline styles are overriding here
                >
                  {item}
                </Link>
              </li>
            ))}

            {isLoggedIn && ( // Only show logout if logged in (optional, based on your logic)
              <li>
                <button onClick={handleLogout} className="nav-link logout-button" title="Logout">
                  <i className="fas fa-sign-out-alt logout-icon"></i>
                  <span className="sr-only">Logout</span>
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <p>© 2025 Hands UP - A project by EPI-USE Africa in collaboration with TMKDT</p>
      </footer>
    </div>
  );
}

export default Layout;