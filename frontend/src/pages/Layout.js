import React from "react";
import PropTypes from "prop-types";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/layout.css";
import logo from "../images/logo2.png";


const NAV_ITEMS = ["Home", "Learn", "Translator", "Profile", "Help"];

const NAV_PATHS = {
  Home: "/home",
  Learn: "/learn",
  Translator: "/translator",
  Profile: "/userProfile", 
  Help: "/help",
};

const Layout = ({ children, isLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const currentPath = location.pathname;
  let currentPage = '';
  for (const itemKey in NAV_PATHS) {
    if (NAV_PATHS[itemKey] === currentPath) {
      currentPage = itemKey; 
      break;
    }
  }

  const handleLogout = () => {
    console.log("User logged out!");
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
                  className={`nav-link ${
                    currentPage === item ? "nav-link-active" : ""
                  }`}
                >
                  {item}
                </Link>
              </li>
            ))}

            {isLoggedIn && ( 
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

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  currentPage: PropTypes.node.isRequired,
  isLoggedIn: PropTypes.bool.isRequired, 
};

export default Layout;

