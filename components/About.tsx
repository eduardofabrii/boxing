"use client"

import { Button } from "@/components/ui/button"
import { Gamepad2 } from "lucide-react"

interface AboutProps {
  onBack: () => void
}

export default function About({ onBack }: AboutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">About</h1>
            <div className="w-20 h-1 bg-white/50 mx-auto rounded-full"></div>
          </div>
          
          {/* Content */}
          <div className="p-8 space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4">
              <Gamepad2 className="w-8 h-8" />
          
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Boxing Clash: Final Round</h2>
              <div className="w-32 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full"></div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                Criadores
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">EH</span>
                  </div>
                  <span className="text-white font-medium">Eduardo Henrique Fabri</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">JV</span>
                  </div>
                  <span className="text-white font-medium">João Vitor Correa Oliveira</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                Sobre o Jogo
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Um jogo de boxe em estilo cartoon criado com React e p5.js. Todos os assets do jogo são 
                criados ou obtidos de recursos gratuitos, proporcionando uma experiência divertida e envolvente 
                para os jogadores.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <span className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                React
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-pink-500/20 text-pink-300 rounded-full text-sm font-medium border border-pink-500/30">
                p5.js
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                TypeScript
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium border border-cyan-500/30">
                Tailwind CSS
              </span>
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                onClick={onBack}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                ← Voltar ao Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
