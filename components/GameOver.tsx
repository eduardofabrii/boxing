"use client"

import { Button } from "@/components/ui/button"
import { Trophy, Skull, Rocket, RotateCcw, Home, HandHeart, Crown, Shield, Zap, Sword } from "lucide-react"
import Image from "next/image"
import { DifficultyLevel } from "./DifficultySelector"

interface GameOverProps {
  winner: string
  score: number
  round: number
  difficulty?: DifficultyLevel
  playerNickname?: string
  onRestart: () => void
  onContinue?: () => void
  onMainMenu: () => void
}

export default function GameOver({ winner, score, round, difficulty, playerNickname, onRestart, onContinue, onMainMenu }: GameOverProps) {
  const isVictory = winner === "player"
  const isDraw = winner === "draw"
  
  const getIcon = () => {
    if (isVictory) return <Trophy className="w-7 h-7 text-white" />
    if (isDraw) return <HandHeart className="w-7 h-7 text-white" />
    return <Skull className="w-7 h-7 text-white" />
  }

  const getTitle = () => {
    if (isVictory) return "VICTORY!"
    if (isDraw) return "DRAW!"
    return "DEFEAT!"
  }

  const getColorClasses = () => {
    if (isVictory) return {
      iconBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      titleGradient: 'from-green-500 via-emerald-500 to-green-500',
      textColor: 'text-green-400'
    }
    if (isDraw) return {
      iconBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      titleGradient: 'from-yellow-500 via-orange-500 to-yellow-500',
      textColor: 'text-yellow-400'
    }
    return {
      iconBg: 'bg-gradient-to-r from-red-500 to-rose-500',
      titleGradient: 'from-red-500 via-rose-500 to-red-500',
      textColor: 'text-red-400'
    }
  }
  const getMessage = () => {
    if (isVictory) return "Congratulations! You are the Boxing Champion!"
    if (isDraw) return "Great fight! It's a tie!"
  }

  const getDifficultyInfo = () => {
    if (!difficulty) return null;
    
    const difficultyData: { [key in DifficultyLevel]: { name: string, icon: any, color: string, multiplier: string } } = {
      easy: { name: 'Iniciante', icon: Shield, color: 'text-green-400', multiplier: 'x1.0' },
      medium: { name: 'Intermediário', icon: Zap, color: 'text-yellow-400', multiplier: 'x1.5' },
      hard: { name: 'Difícil', icon: Sword, color: 'text-orange-400', multiplier: 'x2.0' },
      legendary: { name: 'Lendário', icon: Crown, color: 'text-purple-400', multiplier: 'x3.0' }
    };
    
    return difficultyData[difficulty];
  };

  const colors = getColorClasses()
    return (
    <div className="relative flex flex-col items-center gap-8 p-12 bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 max-w-md w-full mx-4">
    
      <div className="text-center space-y-4 mt-8">        
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
            {getIcon()}
          </div>
          <h1 className={`text-4xl font-black bg-gradient-to-r ${colors.titleGradient} bg-clip-text text-transparent`}>
            {getTitle()}
          </h1>
        </div>
        
        {isVictory && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold text-yellow-400 mb-2">🏆 CHAMPION! 🏆</h2>
            <p className="text-yellow-200 text-sm">You are the Boxing Champion!</p>
          </div>
        )}        {/* Stats */}
        <div className="space-y-3 p-4 bg-gray-800/50 rounded-xl border border-gray-600/30">
          {playerNickname && (
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Lutador:</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400">👤</span>
                <span className="text-white font-bold">{playerNickname}</span>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-medium">Round:</span>
            <span className="text-white font-bold text-xl">{round}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-medium">Final Score:</span>
            <span className="text-yellow-400 font-bold text-xl">{score}</span>
          </div>
          {difficulty && (
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Dificuldade:</span>
              <div className="flex items-center gap-2">
                {(() => {
                  const diffInfo = getDifficultyInfo();
                  if (!diffInfo) return null;
                  const IconComponent = diffInfo.icon;
                  return (
                    <>
                      <IconComponent className={`w-4 h-4 ${diffInfo.color}`} />
                      <span className={`font-bold ${diffInfo.color}`}>
                        {diffInfo.name}
                      </span>
                      <span className="text-gray-400 text-sm">
                        ({diffInfo.multiplier})
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
          <p className={`text-lg font-medium ${colors.textColor}`}>
          {getMessage()}
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
      </div>      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-2">
        <p>{isVictory ? "You are the champion!" : isDraw ? "Well matched fighters!" : "Get back in the ring!"}</p>
      </div>
    </div>
  )
}
