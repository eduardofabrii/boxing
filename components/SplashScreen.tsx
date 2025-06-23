"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useResourcePreloader } from "@/hooks/useResourcePreloader"

interface SplashScreenProps {
  onLoadingComplete: () => void
}

export default function SplashScreen({ onLoadingComplete }: SplashScreenProps) {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Preparando o ringue de boxe...")
  
  const resources = [
    '/luvas-de-boxe.png',
    '/lutador.png',
    '/lutador (1).png', 
    '/azul.png',
    '/vermelha.png',
    '/rinque de boxe.jpg',
    '/Survivor-EyeOfTheTigermp3-codes1.com_64kb.mp3'
  ]
  
  const { isLoaded: resourcesLoaded, progress: resourceProgress } = useResourcePreloader(resources)

  useEffect(() => {
    const loadingMessages = [
      "Preparando o ringue de boxe...",
      "Carregando lutadores...",
      "Ajustando as luvas...", 
      "Carregando música...",
      "Aquecendo os motores...",
      "Finalizando preparação..."
    ]
    
    let messageIndex = 0
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const simulatedProgress = Math.min(prev + Math.random() * 8 + 2, 100)
        const combinedProgress = Math.min((resourceProgress * 0.7) + (simulatedProgress * 0.3), 100)
        
        if (combinedProgress >= 100 && resourcesLoaded) {
          clearInterval(interval)
          setLoadingMessage("Carregamento concluído!")
          
          setTimeout(() => {
            onLoadingComplete()
          }, 1500)
          return 100
        }
        
        const newMessageIndex = Math.floor((combinedProgress / 100) * loadingMessages.length)
        if (newMessageIndex !== messageIndex && newMessageIndex < loadingMessages.length) {
          messageIndex = newMessageIndex
          setLoadingMessage(loadingMessages[messageIndex])
        }
        
        return combinedProgress
      })
    }, 100)

    setTimeout(() => setShowContent(true), 200)

    return () => clearInterval(interval)
  }, [onLoadingComplete, resourceProgress, resourcesLoaded])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-5 w-24 h-24 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
      <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-xl animate-pulse delay-700"></div>

      <div 
        className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${
          showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-full border-2 border-gradient-to-r from-red-500 to-yellow-500 shadow-2xl">
            <Image
              src="/luvas-de-boxe128.png"
              alt="Boxing Gloves"
              width={120}
              height={120}
              className="animate-bounce"
              priority
            />
          </div>
        </div>

        {/* Título do jogo */}
        <h1 className="text-4xl md:text-6xl font-black text-center mb-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent animate-pulse">
          BOXING CLASH
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          FINAL ROUND
        </h2>

        {/* Barra de loading */}
        <div className="w-80 max-w-sm mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Carregando...</span>
            <span className="text-sm font-medium text-gray-300">{Math.floor(loadingProgress)}%</span>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div className="relative h-full bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 rounded-full transition-all duration-300 ease-out shadow-lg">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${loadingProgress}%` }}
              >
                {/* Efeito de brilho na barra */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>        {/* Texto de loading */}
        <p className="text-gray-400 text-sm mt-6 animate-pulse">
          {loadingMessage}
        </p>
      </div>

      {/* Partículas de fundo (opcional) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}
