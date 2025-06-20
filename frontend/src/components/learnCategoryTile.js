import React from "react";

const CategoryTile = ({ name, emoji, onClick }) => (
  <div className="category-tile" onClick={onClick}>
    <div className="category-emoji">{emoji}</div>
    <div className="category-name">{name}</div>
  </div>
);

export default CategoryTile;