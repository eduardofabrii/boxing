"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, BookOpen, Info, Zap, LogIn, LogOut, User } from "lucide-react"
import { SoundManager } from "./SoundManager"

interface MenuProps {
  onStartGame: () => void
  onAbout: () => void
  onInstructions: () => void

}

export default function Menu({ onStartGame, onAbout, onInstructions}: MenuProps) {
  const soundManagerRef = useRef<SoundManager | null>(null)

  useEffect(() => {
    // Inicializar o sistema de som quando o menu carregar
    soundManagerRef.current = new SoundManager()
    
    // Função para iniciar música com interação do usuário
    const startMusic = async () => {
      if (soundManagerRef.current) {
        await soundManagerRef.current.initialize()
        await soundManagerRef.current.playBackgroundMusic()
      }
    }

    // Adicionar listener para primeiro clique/toque
    const handleFirstInteraction = () => {
      startMusic()
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)

    return () => {
      // Cleanup
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
      if (soundManagerRef.current) {
        soundManagerRef.current.cleanup()
      }
    }
  }, [])
  return (
    <div className="relative flex flex-col items-center gap-8 p-12 bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 max-w-md w-full mx-4">      <div className="text-center space-y-2">        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-black ">
            BOXING
          </h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-300">Escolha sua ação</h2>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <Button 
          className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-red-500/50" 
          onClick={onStartGame}
        >
          <span className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Iniciar Jogo
          </span>
        </Button>
        
        <Button 
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-blue-500/50" 
          onClick={onInstructions}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Instruções
          </span>
        </Button>
        
        <Button 
          className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-green-500/50" 
          onClick={onAbout}
        >
          <span className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Sobre
          </span>
        </Button>
      </div>      <div className="text-center text-gray-500 text-sm mt-4">
        <p>Pronto para lutar? Vamos lá!</p>
        <p className="text-xs mt-2 flex items-center justify-center gap-1">
          🎵 <span className="animate-pulse">Eye of the Tiger (Original) tocando...</span>
        </p>
      </div>
    </div>
  )
}
