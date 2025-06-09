"use client"

import { Button } from "@/components/ui/button"
import { Trophy, Skull, Rocket, RotateCcw, Home } from "lucide-react"

interface GameOverProps {
  winner: string
  score: number
  round: number
  onRestart: () => void
  onContinue?: () => void
  onMainMenu: () => void
}

export default function GameOver({ winner, score, round, onRestart, onContinue, onMainMenu }: GameOverProps) {
  const isVictory = winner === "player"
  
  return (
    <div className="relative flex flex-col items-center gap-8 p-12 bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 max-w-md w-full mx-4">
      <div className="text-center space-y-4">        
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isVictory 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : 'bg-gradient-to-r from-red-500 to-rose-500'
          }`}>
            {isVictory ? (
              <Trophy className="w-7 h-7 text-white" />
            ) : (
              <Skull className="w-7 h-7 text-white" />
            )}
          </div>
          <h1 className={`text-4xl font-black bg-gradient-to-r ${
            isVictory 
              ? 'from-green-500 via-emerald-500 to-green-500' 
              : 'from-red-500 via-rose-500 to-red-500'
          } bg-clip-text text-transparent`}>
            {isVictory ? "VICTORY!" : "DEFEAT!"}
          </h1>
        </div>
        
        {/* Stats */}
        <div className="space-y-3 p-4 bg-gray-800/50 rounded-xl border border-gray-600/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-medium">Round:</span>
            <span className="text-white font-bold text-xl">{round}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-medium">Final Score:</span>
            <span className="text-yellow-400 font-bold text-xl">{score}</span>
          </div>
        </div>
          <p className={`text-lg font-medium ${
          isVictory ? 'text-green-400' : 'text-red-400'
        }`}>
          {isVictory ? "Congratulations! You won the match!" : "Better luck next time!"}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-4 w-full">
        {onContinue && (
          <Button 
            className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-green-500/50" 
            onClick={onContinue}
          >
            <span className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Continue to Round {round + 1}
            </span>
          </Button>
        )}

        <Button 
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-blue-500/50" 
          onClick={onRestart}
        >
          <span className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            New Game
          </span>
        </Button>

        <Button 
          className="w-full h-14 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-gray-500/50" 
          onClick={onMainMenu}
        >
          <span className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Main Menu
          </span>
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-2">
        <p>{isVictory ? "Champion mindset!" : "Train harder, fight stronger!"}</p>
      </div>
    </div>
  )
}
