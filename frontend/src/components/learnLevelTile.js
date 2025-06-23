import React from "react";
import PropTypes from "prop-types";

export function LevelTile({ level, unlocked, onClick }){
  return <div className={`level-card ${unlocked ? 'unlocked' : 'locked'}`} onClick={unlocked ? onClick : undefined}>
    <div className="level-number">{level}</div>
  </div>
};

LevelTile.propTypes = {
    children: PropTypes.node.isRequired,
    level: PropTypes.node.isRequired,
    unlocked: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

