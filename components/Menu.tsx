"use client"

import { Button } from "@/components/ui/button"
import { Play, BookOpen, Info, Zap, LogIn, LogOut, User } from "lucide-react"
import type { User as UserType } from "@/lib/authService"

interface MenuProps {
  onStartGame: () => void
  onAbout: () => void
  onInstructions: () => void
  onLogin: () => void
  currentUser: UserType | null
  onLogout: () => void
}

export default function Menu({ onStartGame, onAbout, onInstructions, onLogin, currentUser, onLogout }: MenuProps) {
  return (
    <div className="relative flex flex-col items-center gap-8 p-12 bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 max-w-md w-full mx-4">      <div className="text-center space-y-2">        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-black ">
            BOXING
          </h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-300">Choose your action</h2>
      </div>

      {/* User Section */}
      {currentUser ? (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{currentUser.name}</p>
                <p className="text-gray-400 text-sm">{currentUser.email}</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 w-full">
          <div className="flex items-center justify-center">
            <Button
              onClick={onLogin}
              className="w-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-purple-500/50"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar / Cadastrar
            </Button>
          </div>
        </div>
      )}<div className="flex flex-col gap-4 w-full">
        <Button 
          className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-red-500/50" 
          onClick={onStartGame}
        >
          <span className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Start Game
          </span>
        </Button>
        
        <Button 
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-blue-500/50" 
          onClick={onInstructions}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Instructions
          </span>
        </Button>
        
        <Button 
          className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-green-500/50" 
          onClick={onAbout}
        >
          <span className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            About
          </span>
        </Button>
      </div>

      <div className="text-center text-gray-500 text-sm mt-4">
        <p>Ready to fight? Let's go!</p>
      </div>
    </div>
  )
}
