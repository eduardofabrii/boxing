"use client"

import { Button } from "@/components/ui/button"

interface InstructionsProps {
  onBack: () => void
}

export default function Instructions({ onBack }: InstructionsProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-800 rounded-lg shadow-lg border-2 border-yellow-500 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Instructions</h2>
      <div className="text-left mb-4 space-y-4">
        <div>
          <h3 className="font-bold text-yellow-400">Controls:</h3>
          <ul className="list-disc pl-5">
            <li>Move: Arrow keys or WASD</li>
            <li>Punch: Space bar</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-yellow-400">Objective:</h3>
          <p>Defeat your opponent by reducing their health to zero before the timer runs out.</p>
        </div>

        <div>
          <h3 className="font-bold text-yellow-400">Progression:</h3>
          <p>Each round you win, your opponent gets stronger and faster. How many rounds can you survive?</p>
        </div>
      </div>
      <Button className="w-32 bg-gray-600 hover:bg-gray-700 text-white" onClick={onBack}>
        Back
      </Button>
    </div>
  )
}
