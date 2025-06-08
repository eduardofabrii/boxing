"use client"

import { Button } from "@/components/ui/button"

interface AboutProps {
  onBack: () => void
}

export default function About({ onBack }: AboutProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-800 rounded-lg shadow-lg border-2 border-yellow-500 max-w-md">
      <h2 className="text-2xl font-bold mb-4">About</h2>
      <div className="text-center mb-4">
        <p className="mb-2">Boxing Clash: Final Round</p>
        <p className="mb-4">Created by: Eduardo Henrique Fabri</p>
        <p className="text-sm text-gray-300">
          A cartoon-style boxing game created with React and p5.js. All game assets are either created or sourced from
          free resources.
        </p>
      </div>
      <Button className="w-32 bg-gray-600 hover:bg-gray-700 text-white" onClick={onBack}>
        Back
      </Button>
    </div>
  )
}
