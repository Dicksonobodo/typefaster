import React, { useState, useEffect, useCallback, useRef } from "react";
import Word from "./Word";
import "./TypingGame.css";


const wordBank = {
  1: ["cat", "dog", "sun", "cup", "pen", "box"],
  2: ["water", "mouse", "phone", "sharp", "black", "green"],
  3: ["reactor", "battery", "fantasy", "monitor", "charger"],
  4: ["javascript", "developer", "processor", "algorithm"],
  5: ["application", "integration", "synchronization", "architecture"]
};

// Paths to audio in public/assets
const correctSoundFile = "/typefast/assets/mixkit-bubble-pop-up-alert-notification-2357.wav";
const gameoverSoundFile = "/typefast/assets/mixkit-sad-game-over-trombone-471.wav";
const backgroundMusicFile = "/typefast/assets/mixkit-game-level-music-689.wav";


function TypingGame() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem("highScore")) || 0);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(0.8); // initial slower speed
  const [activeWords, setActiveWords] = useState([]);
  const [gameRunning, setGameRunning] = useState(false);
  const [typed, setTyped] = useState("");

  const speedRef = useRef(speed);

  // Background music
  const backgroundAudio = useRef(null);

  // Initialize background audio once
  useEffect(() => {
    if (!backgroundAudio.current) {
      backgroundAudio.current = new Audio(backgroundMusicFile);
      backgroundAudio.current.loop = true;
      backgroundAudio.current.volume = 0.3;
    }
  }, []);

  // Play/pause background music based on game state
  useEffect(() => {
    if (gameRunning) {
      backgroundAudio.current.play().catch((e) => console.log("Background audio error:", e));
    } else {
      if (backgroundAudio.current) {
        backgroundAudio.current.pause();
        backgroundAudio.current.currentTime = 0;
      }
    }
  }, [gameRunning]);

  // End game
  const endGame = useCallback(() => {
    setGameRunning(false);
    setActiveWords([]);
    // Play game-over sound
    new Audio(gameoverSoundFile).play().catch((e) => console.log("Game-over audio error:", e));

    setHighScore((prev) => {
      if (score > prev) {
        localStorage.setItem("highScore", score);
        return score;
      }
      return prev;
    });
  }, [score]);

  // Level up and increase speed
  useEffect(() => {
    if (score > 0 && score % 5 === 0) {
      setLevel((prev) => prev + 1);
      setSpeed((prev) => prev + 0.2);
      speedRef.current += 0.2;
    }
  }, [score]);

  // Spawn words
  useEffect(() => {
    if (!gameRunning) return;

    const spawnInterval = setInterval(() => {
      const difficulty = Math.min(level, 5);
      const list = wordBank[difficulty];
      const word = list[Math.floor(Math.random() * list.length)];
      const x = Math.random() * (window.innerWidth - 200);

      setActiveWords((prev) => [
        ...prev,
        { word, x, y: 0, id: Date.now() + Math.random(), correct: false }
      ]);
    }, Math.max(400, 1500 - level * 200));

    return () => clearInterval(spawnInterval);
  }, [gameRunning, level]);

  // Game loop (falling words)
  useEffect(() => {
    if (!gameRunning) return;

    let animationFrameId;
    const animate = () => {
      setActiveWords((prev) =>
        prev.map((w) => {
          const newY = w.y + speedRef.current;
          if (newY > window.innerHeight - 80) endGame();
          return { ...w, y: newY };
        })
      );
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameRunning, endGame]);

  // Start / Restart game
  const startGame = () => {
    setScore(0);
    setLevel(1);
    setSpeed(0.8);
    speedRef.current = 0.8;
    setActiveWords([]);
    setTyped("");
    setGameRunning(true);
  };
  const restartGame = () => startGame();

  // Handle typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setTyped(value);

    for (let i = 0; i < activeWords.length; i++) {
      if (value === activeWords[i].word) {
        // Mark correct for animation
        setActiveWords((prev) =>
          prev.map((w, idx) => (idx === i ? { ...w, correct: true } : w))
        );

        // Play correct-word sound
        new Audio(correctSoundFile).play().catch((e) => console.log("Correct audio error:", e));

        // Remove word after short animation
        setTimeout(() => {
          setActiveWords((prev) => prev.filter((_, idx) => idx !== i));
        }, 300);

        setScore((prev) => prev + 1);
        setTyped("");
        break;
      }
    }
  };

  return (
    <div className="game-area">
      {/* Start Screen */}
      {!gameRunning && score === 0 && (
        <div className="overlay" id="start-screen">
          <h1>Typing Drop Game</h1>
          <p>Type the words before they hit the ground!</p>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {/* Game Over Screen */}
      {!gameRunning && score > 0 && (
        <div className="overlay" id="game-over-screen">
          <h1>GAME OVER</h1>
          <h2>
            Your Score: {score} | High Score: {highScore}
          </h2>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}

      {/* Scoreboard & Level */}
      <div className="scoreboard">Score: {score} | High Score: {highScore}</div>
      <div className="level">Level: {level}</div>

      {/* Falling Words */}
      {activeWords.map((w) => (
        <Word
          key={w.id}
          word={w.word}
          x={w.x}
          y={w.y}
          level={level}
          correct={w.correct}
        />
      ))}

      {/* Input Box */}
      {gameRunning && (
        <input
          className="input-box"
          value={typed}
          onChange={handleInputChange}
          placeholder="Type here..."
          autoFocus
        />
      )}
    </div>
  );
}

export default TypingGame;
