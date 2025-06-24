import React from "react";
import PropTypes from "prop-types";
import { CiLock } from 'react-icons/ci';
import '../styles/Learn.css';

export const CategoryTile = ({ name, unlocked, onClick }) =>{
  return ( <div className={`category-tile ${unlocked ? 'unlocked' : 'locked'}`} onClick={unlocked ? onClick : null}>
    <div className="category-name">{name}</div>
    {!unlocked && <CiLock className="lock-icon" />}
  </div> );
};

CategoryTile.propTypes = {
  children: PropTypes.node.isRequired,
  name: PropTypes.node.isRequired,
  unlocked: PropTypes.node.isRequired,
  onClick: PropTypes.node.isRequired,
};
