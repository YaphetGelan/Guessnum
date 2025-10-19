import { useState, useEffect } from "react";

export default function NumberWordle() {
  const [secretNumber, setSecretNumber] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    generateNewGame();
  }, []);

  const generateNewGame = () => {
    let num = "";
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 4; i++) {
      const randIdx = Math.floor(Math.random() * digits.length);
      num += digits[randIdx];
      digits.splice(randIdx, 1);
    }
    setSecretNumber(num);
    setGuesses([]);
    setCurrentGuess("");
    setGameWon(false);
    setGameLost(false);
    setMessage("");
  };

  const calculateFeedback = (guess, secret) => {
    let correctPositions = 0;
    let correctNumbers = 0;
    const secretArr = secret.split("");
    const guessArr = guess.split("");
    const secretUsed = new Array(4).fill(false);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (!secretUsed[j] && guessArr[i] === secretArr[j]) {
          correctNumbers++;
          secretUsed[j] = true;
          break;
        }
      }
    }

    for (let i = 0; i < 4; i++) {
      if (guessArr[i] === secretArr[i]) {
        correctPositions++;
      }
    }

    return { correctNumbers, correctPositions };
  };

  const handleGuess = () => {
    if (currentGuess.length !== 4) {
      setMessage("Please enter 4 digits");
      return;
    }

    const feedback = calculateFeedback(currentGuess, secretNumber);

    const newGuess = {
      number: currentGuess,
      no: feedback.correctNumbers,
      pos: feedback.correctPositions,
    };

    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);

    if (feedback.correctPositions === 4) {
      setGameWon(true);
    } else if (updatedGuesses.length === 6) {
      setGameLost(true);
    }

    setCurrentGuess("");
    setMessage("");
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length <= 4 && /^[1-9]*$/.test(val)) {
      setCurrentGuess(val);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #1e3a8a, #4c1d95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "28rem" }}>
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          GuessNum
        </h1>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            padding: "2rem",
          }}
        >
          <div style={{ marginBottom: "2rem", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #d1d5db" }}>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#374151",
                    }}
                  >
                    Guess
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#374151",
                    }}
                  >
                    No:
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#374151",
                    }}
                  >
                    Pos
                  </th>
                </tr>
              </thead>
              <tbody>
                {guesses.map((guess, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {guess.number}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {guess.no}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {guess.pos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!gameWon && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  textAlign: "center",
                  color: "#374151",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Enter your guess:
              </label>
              <input
                type="text"
                value={currentGuess}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter 4 digits (1-9)"
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem",
                  textAlign: "center",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  border: "2px solid #d1d5db",
                  borderRadius: "0.5rem",
                  outline: "none",
                }}
                maxLength="4"
              />
              {message && (
                <p
                  style={{
                    color: "#ef4444",
                    textAlign: "center",
                    marginTop: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {message}
                </p>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            {!gameWon && (
              <button
                onClick={handleGuess}
                disabled={currentGuess.length !== 4}
                style={{
                  padding: "0.5rem 1.5rem",
                  backgroundColor:
                    currentGuess.length === 4 ? "#3b82f6" : "#9ca3af",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: currentGuess.length === 4 ? "pointer" : "default",
                }}
              >
                Submit Guess
              </button>
            )}
            <button
              onClick={generateNewGame}
              style={{
                padding: "0.5rem 1.5rem",
                backgroundColor: "#22c55e",
                color: "white",
                fontWeight: "bold",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              New Game
            </button>
          </div>

          {gameWon && (
            <div
              style={{
                position: "fixed",
                inset: "0",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  padding: "2rem",
                  textAlign: "center",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#16a34a",
                    marginBottom: "1rem",
                  }}
                >
                  🎉 YOU WON! 🎉
                </h2>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "0.5rem",
                  }}
                >
                  numbers 4 position 4
                </p>
                <p style={{ color: "#4b5563", marginBottom: "1.5rem" }}>
                  You solved it in {guesses.length} guess
                  {guesses.length !== 1 ? "es" : ""}!
                </p>
                <button
                  onClick={generateNewGame}
                  style={{
                    padding: "0.5rem 1.5rem",
                    backgroundColor: "#22c55e",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {gameLost && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                border: "2px solid #ef4444",
                borderRadius: "0.5rem",
                padding: "1rem",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#b91c1c",
                }}
              >
                GAME LOST
              </p>
            </div>
          )}

          <div
            style={{
              textAlign: "center",
              color: "#4b5563",
              fontSize: "0.875rem",
            }}
          >
            Tries: {guesses.length} / 6
          </div>
        </div>
      </div>
    </div>
  );
}
