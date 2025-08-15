import React from "react";
import PropTypes from "prop-types";

export function LevelTile({ level, unlocked, onClick, style, className }){
  return (
    <div 
      className={`level-card ${unlocked ? 'unlocked' : 'locked'} ${className || ''}`}
      style={style}
      onClick={unlocked ? onClick : undefined}
    >
      <div className="level-number">{level}</div>
    </div>
  );
};

LevelTile.propTypes = {
    children: PropTypes.node,
    level: PropTypes.node.isRequired,
    unlocked: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    className: PropTypes.string,
};