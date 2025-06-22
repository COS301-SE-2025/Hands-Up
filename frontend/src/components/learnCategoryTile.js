import React from "react";
import PropTypes from "prop-types";

export const CategoryTile = ({ name, emoji, onClick }) =>{
  return <div className="category-tile" onClick={onClick}>
    <div className="category-emoji">{emoji}</div>
    <div className="category-name">{name}</div>
  </div>
};

CategoryTile.propTypes = {
  children: PropTypes.node.isRequired,
  name: PropTypes.node.isRequired,
  emoji: PropTypes.node.isRequired,
  onClick: PropTypes.node.isRequired,
};
