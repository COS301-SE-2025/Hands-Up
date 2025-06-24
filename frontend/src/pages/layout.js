import React from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/authContext.js';
import "../styles/Layout.css";
import logo from "../images/logo2.png";
import {HelpMenu} from './help.js'; 

const BACKEND_BASE_URL = "https://localhost:2000"; 
const NAV_ITEMS = ["Home", "Learn", "Translator"];

const NAV_PATHS = {
  Home: "/home",
  Learn: "/learn",
  Translator: "/translator",
  Profile: "/userProfile", 
  Help: "/help",
};

export function Layout({ children }) {
  const { currentUser, isLoggedIn } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname;
  let currentPage = '';

  for (const itemKey in NAV_PATHS) {
    if (NAV_PATHS[itemKey] === currentPath) {
      currentPage = itemKey;
      break;
    }
  }

  const isProfileActive = currentPath === NAV_PATHS.Profile;
  const displayAvatarUrl = currentUser?.avatarurl 
                           ? `${BACKEND_BASE_URL}/${currentUser.avatarurl}` 
                           : null;

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

            {isLoggedIn && currentUser && (
              <li className="profile-section">
                <Link
                  to={NAV_PATHS.Profile}
                  className={`profile-link ${isProfileActive ? "nav-link-active" : ""}`}
                >
                  <div className="profile-info">
                    <div className="profile-avatar"> 
                      {displayAvatarUrl ? (
                        <img src={displayAvatarUrl} alt="User Avatar" />
                      ) : (
                        `${currentUser.name?.charAt(0)?.toUpperCase()}${currentUser.surname?.charAt(0)?.toUpperCase()}`
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <main className="main-content">{children}</main>
      <HelpMenu /> 

      <footer className="footer">
        <p>© 2025 Hands UP - A project by EPI-USE Africa in collaboration with TMKDT</p>
      </footer>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

