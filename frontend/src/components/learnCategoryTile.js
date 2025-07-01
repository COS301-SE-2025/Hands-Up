import React from "react";
import PropTypes from "prop-types";
import { CiLock } from 'react-icons/ci';
<<<<<<< HEAD
import '../styles/Learn.css';
=======
import '../styles/learn.css';
>>>>>>> d4b3d9b80cc1a7921929b3c508f8ca04f190f480

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
