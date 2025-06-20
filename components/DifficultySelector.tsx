"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Zap, Shield, Sword, Crown } from "lucide-react"

export type DifficultyLevel = "easy" | "medium" | "hard" | "legendary"

interface DifficultySelectorProps {
  onBack: () => void
  onSelectDifficulty: (difficulty: DifficultyLevel) => void
}

export default function DifficultySelector({ onBack, onSelectDifficulty }: DifficultySelectorProps) {
  const difficulties = [    {
      id: "easy" as DifficultyLevel,
      name: "Iniciante",
      description: "Perfeito para começar",
      icon: Shield,
      color: "from-green-600 to-green-700 hover:from-green-500 hover:to-green-600",
      borderColor: "border-green-500/50",
      features: ["Oponente mais lento", "Recebe menos dano", "Ataques mais fracos"]
    },
    {
      id: "medium" as DifficultyLevel,
      name: "Intermediário",
      description: "Equilíbrio perfeito",
      icon: Zap,
      color: "from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600",
      borderColor: "border-yellow-500/50",
      features: ["Velocidade normal", "Dano equilibrado", "Dificuldade padrão"]
    },
    {
      id: "hard" as DifficultyLevel,
      name: "Difícil",
      description: "Para lutadores experientes",
      icon: Sword,
      color: "from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600",
      borderColor: "border-orange-500/50",
      features: ["Oponente mais rápido", "Recebe mais dano", "Ataques mais fortes"]
    },
    {
      id: "legendary" as DifficultyLevel,
      name: "Lendário",
      description: "O desafio final",
      icon: Crown,
      color: "from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600",
      borderColor: "border-purple-500/50",
      features: ["Extremamente rápido", "Muito mais dano", "Devastador"]
    }
  ]

  return (
    <div className="relative flex flex-col items-center gap-8 p-8 bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 max-w-4xl w-full mx-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">
          Escolha sua Dificuldade
        </h2>
        <p className="text-xl text-gray-300">Quanto maior a dificuldade, maior a recompensa!</p>
      </div>

      {/* Difficulty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {difficulties.map((difficulty) => {
          const IconComponent = difficulty.icon
          return (
            <Button
              key={difficulty.id}
              className={`h-auto p-6 bg-gradient-to-r ${difficulty.color} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border ${difficulty.borderColor} flex flex-col items-start gap-4`}
              onClick={() => onSelectDifficulty(difficulty.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">{difficulty.name}</h3>
                  <p className="text-sm opacity-90">{difficulty.description}</p>
                </div>
              </div>
              
              <div className="w-full space-y-2">
                {difficulty.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <span className="text-sm opacity-90">{feature}</span>
                  </div>
                ))}
              </div>
            </Button>
          )
        })}
      </div>

      {/* Score Multipliers */}
      <div className="bg-gray-800/50 rounded-xl p-4 w-full">
        <h3 className="text-lg font-bold text-center mb-3 text-yellow-400">Multiplicadores de Pontuação</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="text-green-400">
            <div className="font-bold">x1.0</div>
            <div className="text-xs">Iniciante</div>
          </div>
          <div className="text-yellow-400">
            <div className="font-bold">x1.5</div>
            <div className="text-xs">Intermediário</div>
          </div>
          <div className="text-orange-400">
            <div className="font-bold">x2.0</div>
            <div className="text-xs">Difícil</div>
          </div>
          <div className="text-purple-400">
            <div className="font-bold">x3.0</div>
            <div className="text-xs">Lendário</div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <Button 
        className="w-full md:w-auto px-8 h-12 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-gray-500/50" 
        onClick={onBack}
      >
        <span className="flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </span>
      </Button>
    </div>
  )
}
