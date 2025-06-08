"use client"

import { Button } from "@/components/ui/button"

interface MenuProps {
  onStartGame: () => void
  onAbout: () => void
  onInstructions: () => void
}

export default function Menu({ onStartGame, onAbout, onInstructions }: MenuProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-800 rounded-lg shadow-lg border-2 border-yellow-500">
      <h2 className="text-2xl font-bold mb-4">Main Menu</h2>
      <Button className="w-48 bg-red-600 hover:bg-red-700 text-white font-bold" onClick={onStartGame}>
        Start Game
      </Button>
      <Button className="w-48 bg-blue-600 hover:bg-blue-700 text-white" onClick={onInstructions}>
        Instructions
      </Button>
      <Button className="w-48 bg-green-600 hover:bg-green-700 text-white" onClick={onAbout}>
        About
      </Button>
    </div>
  )
}
