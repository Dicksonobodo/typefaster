import React from "react";
import "./TypingGame.css";

function Word({ word, x, y, level, correct }) {
  const colors = ["#00f6ff", "#ff00ff", "#00ff00", "#ffff00", "#ff4500"];
  const color = colors[Math.min(level - 1, colors.length - 1)];

  return (
    <div
      className={`falling-word ${correct ? "correct-effect" : ""}`}
      style={{ left: x + "px", top: y + "px", position: "absolute", color }}
    >
      {word}
    </div>
  );
}

export default Word;
