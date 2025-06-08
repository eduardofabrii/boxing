"use client"

import { useState } from "react"
import GameComponent from "@/components/GameComponent"
import Menu from "@/components/Menu"
import About from "@/components/About"
import Instructions from "@/components/Instructions"
import GameOver from "@/components/GameOver"

export default function Home() {
  const [gameState, setGameState] = useState("menu")
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [winner, setWinner] = useState("")

  const handleGameOver = (result: string, finalScore: number) => {
    setWinner(result)
    setScore(finalScore)
    setGameState("gameOver")
  }

  const startNewGame = () => {
    setGameState("game")
    setScore(0)
    setRound(1)
  }

  const continueGame = () => {
    setGameState("game")
    setRound((prev) => prev + 1)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400 tracking-wider">Boxing Clash: Final Round</h1>

      {gameState === "menu" && (
        <Menu
          onStartGame={startNewGame}
          onAbout={() => setGameState("about")}
          onInstructions={() => setGameState("instructions")}
        />
      )}

      {gameState === "about" && <About onBack={() => setGameState("menu")} />}

      {gameState === "instructions" && <Instructions onBack={() => setGameState("menu")} />}

      {gameState === "game" && <GameComponent onGameOver={handleGameOver} round={round} initialScore={score} />}

      {gameState === "gameOver" && (
        <GameOver
          winner={winner}
          score={score}
          round={round}
          onRestart={startNewGame}
          onContinue={winner === "player" ? continueGame : undefined}
          onMainMenu={() => setGameState("menu")}
        />
      )}
    </main>
  )
}
