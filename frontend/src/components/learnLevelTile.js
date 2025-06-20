import React from "react";

const LevelTile = ({ level, unlocked, onClick }) => (
  <div className={`level-card ${unlocked ? 'unlocked' : 'locked'}`} onClick={unlocked ? onClick : undefined}>
    <div className="level-number">{level}</div>
    {!unlocked && <div className="lock-icon"></div>}
  </div>
);

export default LevelTile;
