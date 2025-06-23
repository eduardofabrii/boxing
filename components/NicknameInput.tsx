"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, User, GamepadIcon } from "lucide-react"

interface NicknameInputProps {
  onBack: () => void
  onContinue: (nickname: string) => void
}

export default function NicknameInput({ onBack, onContinue }: NicknameInputProps) {
  const [nickname, setNickname] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const savedNickname = localStorage.getItem("boxingGameNickname")
    if (savedNickname) {
      setNickname(savedNickname)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      setError("Por favor, digite um nickname!")
      return
    }
    
    if (nickname.trim().length < 2) {
      setError("Nickname deve ter pelo menos 2 caracteres!")
      return
    }
    
    if (nickname.trim().length > 15) {
      setError("Nickname deve ter no máximo 15 caracteres!")
      return
    }

    localStorage.setItem("boxingGameNickname", nickname.trim())
    
    onContinue(nickname.trim())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNickname(value)
    setError("")
  }

  return (
    <div className="relative flex flex-col items-center gap-6 p-12 bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 ">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            SEU NICKNAME
          </h1>
        </div>
        <p className="text-xl text-gray-300">Como você quer ser conhecido no ringue?</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-3">
          <label htmlFor="nickname" className="block text-gray-300 font-medium text-sm">
            Digite seu nickname de lutador:
          </label>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <GamepadIcon className="w-5 h-5 text-gray-400" />
            </div>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={handleInputChange}
              placeholder="Ex: ChampionFighter"
              className="pl-12 h-14 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 text-lg font-medium focus:border-blue-500 focus:ring-blue-500/20"
              maxLength={15}
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm font-medium">{error}</p>
          )}
          
          <div className="text-right">
            <span className="text-gray-400 text-xs">
              {nickname.length}/15 caracteres
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            type="submit"
            disabled={!nickname.trim() || nickname.trim().length < 2}
            className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-200 border border-green-500/50 disabled:border-gray-500/50"
          >
            <span className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Continuar
            </span>
          </Button>
        </div>
      </form>

      <div className="bg-gray-800/30 rounded-xl p-4 w-full border border-gray-600/30">
        <h3 className="text-sm font-bold text-gray-300 mb-2">💡 Dicas para o nickname:</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Use entre 2 e 15 caracteres</li>
          <li>• Seja criativo e único</li>
          <li>• Será exibido durante toda a partida</li>
          <li>• Você pode alterar a cada novo jogo</li>
        </ul>
      </div>

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
