"use client"

import { useState, useEffect } from "react"
import GameComponentNew from "@/components/GameComponentNew"
import Menu from "@/components/Menu"
import About from "@/components/About"
import Instructions from "@/components/Instructions"
import GameOver from "@/components/GameOver"
import DifficultySelector, { DifficultyLevel } from "@/components/DifficultySelector"
import NicknameInput from "@/components/NicknameInput"

export default function Home() {
  const [gameState, setGameState] = useState("menu")
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [winner, setWinner] = useState("")
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium")
  const [playerNickname, setPlayerNickname] = useState("")
  const handleGameOver = (result: string, finalScore: number) => {
    setWinner(result)
    setScore(finalScore)
    setGameState("gameOver")
  }

  const startNewGame = () => {
    setGameState("nicknameInput")
  }

  const handleNicknameSubmit = (nickname: string) => {
    setPlayerNickname(nickname)
    setGameState("difficultySelect")
  }

  const handleDifficultySelect = (selectedDifficulty: DifficultyLevel) => {
    setDifficulty(selectedDifficulty)
    setGameState("game")
    setScore(0)
    setRound(1)
  }
  const continueGame = () => {
    setGameState("game")
    setRound((prev) => prev + 1)
  }
  const restartFromGameOver = () => {
    setGameState("nicknameInput")
    setScore(0)
    setRound(1)
  }



  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-3xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent mb-6">
            BOXING CLASH: FINAL ROUND
          </h1>        {gameState === "menu" && (
          <Menu
            onStartGame={startNewGame}
            onAbout={() => setGameState("about")}
            onInstructions={() => setGameState("instructions")}
          />
        )}        {gameState === "about" && <About onBack={() => setGameState("menu")} />}        {gameState === "instructions" && <Instructions onBack={() => setGameState("menu")} />}

        {gameState === "nicknameInput" && (
          <NicknameInput
            onBack={() => setGameState("menu")}
            onContinue={handleNicknameSubmit}
          />
        )}

        {gameState === "difficultySelect" && (
          <DifficultySelector
            onBack={() => setGameState("nicknameInput")}
            onSelectDifficulty={handleDifficultySelect}
          />
        )}

        {gameState === "game" && <GameComponentNew onGameOver={handleGameOver} round={round} initialScore={score} difficulty={difficulty} playerNickname={playerNickname} />}        {gameState === "gameOver" && (
          <GameOver
            winner={winner}
            score={score}
            round={round}
            difficulty={difficulty}
            playerNickname={playerNickname}
            onRestart={restartFromGameOver}
            onContinue={winner === "player" ? continueGame : undefined}
            onMainMenu={() => setGameState("menu")}
          />
        )}
      </div>
    </main>
  )
}
