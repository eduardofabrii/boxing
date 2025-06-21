"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Music, Upload, Download, RotateCcw } from "lucide-react"

interface SoundControlsProps {
  soundManager?: any
}

export default function SoundControls({ soundManager }: SoundControlsProps) {
  const [musicVolume, setMusicVolume] = useState(30)
  const [effectsVolume, setEffectsVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [currentMusicFile, setCurrentMusicFile] = useState<string | null>(null)
  const [currentMusicType, setCurrentMusicType] = useState<string>('real')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (soundManager) {
      soundManager.setMusicVolume(isMuted ? 0 : musicVolume / 100)
      soundManager.setEffectsVolume(isMuted ? 0 : effectsVolume / 100)
      
      if (soundManager.getCurrentMusicName) {
        const musicName = soundManager.getCurrentMusicName()
        const musicType = soundManager.getCurrentMusicType()
        setCurrentMusicFile(musicName)
        setCurrentMusicType(musicType)
      }
    }
  }, [musicVolume, effectsVolume, isMuted, soundManager])

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && soundManager) {
      if (file.type.startsWith('audio/')) {
        try {
          await soundManager.loadCustomMusic(file)
          setCurrentMusicFile(file.name)
          setCurrentMusicType('custom')
        } catch (error) {
          console.error('Erro ao carregar música:', error)
        }
      } else {
        alert('Por favor, selecione um arquivo de áudio válido (MP3, WAV, etc.)')
      }
    }
  }

  const handleDownload = () => {
    if (soundManager) {
      soundManager.downloadCurrentMusic()
    }
  }
  const handleReset = async () => {
    if (soundManager && soundManager.resetToOriginalMusic) {
      try {
        await soundManager.resetToOriginalMusic()
        setCurrentMusicFile('Eye of the Tiger (Original)')
        setCurrentMusicType('real')
      } catch (error) {
        console.error('Erro ao resetar música:', error)
      }
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Controles de Som
        </h3>
        <Button
          onClick={toggleMute}
          className={`p-2 rounded-lg ${
            isMuted 
              ? 'bg-red-600 hover:bg-red-500' 
              : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
      </div>

      <div className="space-y-3">
        {/* Controle de música */}
        <div className="flex items-center gap-3">
          <Music className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300 w-16">Música</span>
          <input
            type="range"
            min="0"
            max="100"
            value={musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isMuted}
          />
          <span className="text-xs text-gray-400 w-8">{musicVolume}%</span>
        </div>

        {/* Controle de efeitos */}
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-orange-400 rounded-sm flex items-center justify-center text-xs font-bold">
            🥊
          </div>
          <span className="text-sm text-gray-300 w-16">Efeitos</span>
          <input
            type="range"
            min="0"
            max="100"
            value={effectsVolume}
            onChange={(e) => setEffectsVolume(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isMuted}
          />
          <span className="text-xs text-gray-400 w-8">{effectsVolume}%</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-600/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Música Personalizada</span>
        </div>
          <div className="flex gap-2">
          <Button
            onClick={triggerFileUpload}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-2"
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload MP3
          </Button>
          
          <Button
            onClick={handleDownload}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs py-2"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
        
        {currentMusicType === 'custom' && (
          <Button
            onClick={handleReset}
            className="w-full mt-2 bg-orange-600 hover:bg-orange-500 text-white text-xs py-2"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Voltar ao Original
          </Button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
          {currentMusicFile && (
          <div className="text-xs text-gray-400 mt-2">
            <p className="truncate">
              🎵 {currentMusicFile}
            </p>
            <p className="text-gray-500 mt-1">
              {currentMusicType === 'real' && '🎤 Arquivo Original'}
              {currentMusicType === 'custom' && '📁 Arquivo Personalizado'}
              {currentMusicType === 'generated' && '🔧 Gerado Proceduralmente'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        🎵 Eye of the Tiger • 🥊 Efeitos de combate
      </div>
    </div>
  )
}
