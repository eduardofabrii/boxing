"use client"

import { Button } from "@/components/ui/button"

interface GameOverProps {
  winner: string
  score: number
  round: number
  onRestart: () => void
  onContinue?: () => void
  onMainMenu: () => void
}

export default function GameOver({ winner, score, round, onRestart, onContinue, onMainMenu }: GameOverProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-800 rounded-lg shadow-lg border-2 border-yellow-500">
      <h2 className="text-2xl font-bold mb-2">{winner === "player" ? "Victory!" : "Defeat!"}</h2>

      <div className="text-center mb-4">
        <p className="text-xl mb-2">Round: {round}</p>
        <p className="text-xl mb-4">Final Score: {score}</p>
        <p className="text-lg text-yellow-400">
          {winner === "player" ? "Congratulations! You won the match!" : "Better luck next time!"}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {onContinue && (
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold" onClick={onContinue}>
            Continue to Round {round + 1}
          </Button>
        )}

        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onRestart}>
          New Game
        </Button>

        <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white" onClick={onMainMenu}>
          Main Menu
        </Button>
      </div>
    </div>
  )
}
