"use client"

import { Button } from "@/components/ui/button"
import { Gamepad2, Target, TrendingUp, Lightbulb, ArrowLeft } from "lucide-react"

interface InstructionsProps {
  onBack: () => void
}

export default function Instructions({ onBack }: InstructionsProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden">        
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center flex items-center justify-center gap-3">
            <Gamepad2 className="w-8 h-8" />
            Como Jogar
          </h2>
        </div>

        <div className="p-8 space-y-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-yellow-400">Controles</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">↑</kbd>
                  <kbd className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">↓</kbd>
                  <kbd className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">←</kbd>
                  <kbd className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">→</kbd>
                  <span className="text-gray-400 text-sm">ou</span>
                  <kbd className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">WASD</kbd>
                </div>
                <span className="text-gray-300">Movimento</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                <kbd className="px-3 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">SPACE</kbd>
                <span className="text-gray-300">Jab</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                <kbd className="px-3 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">WASD</kbd>
                <span className="text-gray-300">Movimento</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                <kbd className="px-3 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">X</kbd>
                <span className="text-gray-300">Uppercut</span>
              </div>
               <div className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                <kbd className="px-3 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">Z</kbd>
                <span className="text-gray-300">Hook</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                <kbd className="px-3 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">C</kbd>
                <span className="text-gray-300">Cruzado</span>
              </div>

            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-red-400">Objetivo</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Derrote seu oponente reduzindo sua vida a zero antes que o tempo acabe. 
              Use estratégia e reflexos rápidos para vencer!
            </p>
          </div>

          {/* Progression Section */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-purple-400">Progressão</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              A cada rodada que você vence, seu oponente fica mais forte e mais rápido. 
              Quantas rodadas você consegue sobreviver?
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-4">              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-blue-400">Dicas</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Mantenha distância e ataque no momento certo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Observe os padrões de movimento do oponente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Use o espaço do ringue a seu favor</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-800/30 border-t border-gray-700/50">
          <Button 
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-gray-900 font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Menu
          </Button>
        </div>
      </div>
    </div>
  )
}
