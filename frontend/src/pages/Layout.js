import React from "react";
import { Link } from "react-router-dom"; 
import "../styles/Layout.css";
import logo from "../logo.png";

const NAV_ITEMS = ["Home", "Learn", "Translator", "Profile"];

const NAV_PATHS = {
  Home: "/home",
  Learn: "/learn",
  Translator: "/translator",
  Profile: "/userProfile",
};

function Layout({ children, currentPage }) {
  return (
    <div className="layout-container">
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="site-title">Hands UP</h1>
        </div>
        <nav>
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <Link
                  to={NAV_PATHS[item]}
                  className={`nav-link ${
                    currentPage === item ? "nav-link-active" : ""
                  }`}
                  style={{
                    backgroundColor: currentPage === item ? "yellow" : "transparent",
                    fontWeight: currentPage === item ? "bold" : "normal",
                    padding: "8px 12px",
                    borderRadius: "4px"
                  }}
                >
                  {item}
                </Link>
              </li>
            ))}
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
