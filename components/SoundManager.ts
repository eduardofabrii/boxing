"use client"

export class SoundManager {
  private audioContext: AudioContext | null = null
  private backgroundMusic: HTMLAudioElement | null = null
  private punchSounds: HTMLAudioElement[] = []
  private hitSounds: HTMLAudioElement[] = []
  private knockoutSound: HTMLAudioElement | null = null
  private bellSound: HTMLAudioElement | null = null
  private victorySounds: HTMLAudioElement[] = []
  
  private musicVolume: number = 0.3
  private effectsVolume: number = 0.5
  
  private isInitialized: boolean = false
  private isMusicPlaying: boolean = false
  private customMusicFile: File | null = null
  private currentMusicBlob: Blob | null = null

  constructor() {
  }
  async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      this.backgroundMusic = this.createAudioElement()
      this.backgroundMusic.loop = true
      this.backgroundMusic.volume = this.musicVolume
      
      for (let i = 0; i < 4; i++) {
        const punchSound = this.createAudioElement()
        punchSound.volume = this.effectsVolume
        this.punchSounds.push(punchSound)
      }
      
      for (let i = 0; i < 3; i++) {
        const hitSound = this.createAudioElement()
        hitSound.volume = this.effectsVolume
        this.hitSounds.push(hitSound)
      }
      
      this.knockoutSound = this.createAudioElement()
      this.knockoutSound.volume = this.effectsVolume
      
      this.bellSound = this.createAudioElement()
      this.bellSound.volume = this.effectsVolume
      
      for (let i = 0; i < 2; i++) {
        const victorySound = this.createAudioElement()
        victorySound.volume = this.effectsVolume
        this.victorySounds.push(victorySound)
      }
      
      await this.loadAudioFiles()
      
      this.isInitialized = true
    } catch (error) {
      console.warn('Failed to initialize audio:', error)
    }
  }

  private createAudioElement(): HTMLAudioElement {
    const audio = new Audio()
    audio.preload = 'auto'
    
    audio.addEventListener('error', (e) => {
      console.warn('Audio loading error:', e)
    })
    
    return audio
  }
  private async loadAudioFiles(): Promise<void> {
    try {
      await this.loadRealMusicFile()
      await this.generateAudioSources()
    } catch (error) {
      console.warn('Failed to load audio files:', error)
    }
  }

  private async loadRealMusicFile(): Promise<void> {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.src = '/Survivor-EyeOfTheTigermp3-codes1.com_64kb.mp3'
        this.backgroundMusic.load()
        console.log('Eye of the Tiger MP3 carregado com sucesso!')
      } catch (error) {
        console.warn('Erro ao carregar Eye of the Tiger MP3, usando versão gerada:', error)
        this.backgroundMusic.src = this.generateMelodyDataURL()
      }
    }
  }  private async generateAudioSources(): Promise<void> {
    if (!this.audioContext) return

    if (this.backgroundMusic && !this.backgroundMusic.src.includes('.mp3')) {
      this.backgroundMusic.src = this.generateMelodyDataURL()
    }

    this.punchSounds.forEach((sound, index) => {
      sound.src = this.generatePunchSoundDataURL(index)
    })

    this.hitSounds.forEach((sound, index) => {
      sound.src = this.generateHitSoundDataURL(index)
    })

    if (this.knockoutSound) {
      this.knockoutSound.src = this.generateKnockoutSoundDataURL()
    }

    if (this.bellSound) {
      this.bellSound.src = this.generateBellSoundDataURL()
    }

    this.victorySounds.forEach((sound, index) => {
      sound.src = this.generateVictorySoundDataURL(index)
    })
  }

  private generateMelodyDataURL(): string {
    if (!this.audioContext) return ''
    
    const duration = 30 
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)
    
    const notes = [
      { freq: 440, start: 0, duration: 0.5 },  
      { freq: 523, start: 0.5, duration: 0.5 },
      { freq: 587, start: 1, duration: 0.5 },  
      { freq: 659, start: 1.5, duration: 1 },  
      { freq: 587, start: 2.5, duration: 0.5 },
      { freq: 523, start: 3, duration: 0.5 },  
      { freq: 440, start: 3.5, duration: 1 },  
    ]
    
    for (const note of notes) {
      const startSample = Math.floor(note.start * sampleRate)
      const endSample = Math.floor((note.start + note.duration) * sampleRate)
      
      for (let i = startSample; i < endSample && i < data.length; i++) {
        const t = (i - startSample) / sampleRate
        const envelope = Math.exp(-t * 2) 
        data[i] += Math.sin(2 * Math.PI * note.freq * t) * envelope * 0.1
      }
    }
    
    return this.bufferToDataURL(buffer)  }

  private generatePunchSoundDataURL(type: number): string {
    if (!this.audioContext) return ''
    
    const duration = 0.3
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)
    
    const baseFreq = [80, 100, 90, 110][type] || 90
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 15) 
      
      let sample = Math.sin(2 * Math.PI * baseFreq * t) * envelope * 0.3
      
      sample += (Math.random() - 0.5) * envelope * 0.4
      
      sample += Math.sin(2 * Math.PI * (baseFreq * 8) * t) * envelope * 0.1
      
      data[i] = sample * 0.6
    }
    
    return this.bufferToDataURL(buffer)
  }

  private generateHitSoundDataURL(type: number): string {
    if (!this.audioContext) return ''
    
    const duration = 0.2
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)
    
    const baseFreq = [150, 180, 200][type] || 150
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 20)
      
      let sample = Math.sin(2 * Math.PI * baseFreq * t) * envelope * 0.2
      sample += (Math.random() - 0.5) * envelope * 0.3
      
      data[i] = sample * 0.7
    }
    
    return this.bufferToDataURL(buffer)
  }

  private generateKnockoutSoundDataURL(): string {
    if (!this.audioContext) return ''
    
    const duration = 2
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      
      const freq = 200 * Math.exp(-t * 2) + 50
      const envelope = Math.exp(-t * 1.5)
      
      let sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4
      
      sample += Math.sin(2 * Math.PI * freq * 0.5 * t) * envelope * 0.3
      
      data[i] = sample * 0.8
    }
    
    return this.bufferToDataURL(buffer)
  }

  private generateBellSoundDataURL(): string {
    if (!this.audioContext) return ''
    
    const duration = 3
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)
    
    const fundamentalFreq = 800
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 1.5)
      
      let sample = 0
      sample += Math.sin(2 * Math.PI * fundamentalFreq * t) * envelope * 0.4
      sample += Math.sin(2 * Math.PI * fundamentalFreq * 2.76 * t) * envelope * 0.2
      sample += Math.sin(2 * Math.PI * fundamentalFreq * 5.4 * t) * envelope * 0.1
      
      data[i] = sample * 0.6
    }
    
    return this.bufferToDataURL(buffer)
  }

  private generateVictorySoundDataURL(type: number): string {
    if (!this.audioContext) return ''
    
    const duration = 3
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)
    
    const notes = type === 0 ? 
      [523, 659, 784, 1047] : 
      [440, 554, 659, 880]    
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const noteIndex = Math.floor(t * 2) % notes.length
      const envelope = Math.exp(-((t % 0.5)) * 3)
      
      let sample = Math.sin(2 * Math.PI * notes[noteIndex] * t) * envelope * 0.3
      
      data[i] = sample * 0.7
    }
    
    return this.bufferToDataURL(buffer)
  }

  private bufferToDataURL(buffer: AudioBuffer): string {
    const length = buffer.length
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    
    const arrayBuffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(arrayBuffer)
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * 2, true)
    
    const channelData = buffer.getChannelData(0)
    let offset = 44
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      view.setInt16(offset, sample * 0x7FFF, true)
      offset += 2
    }
    
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' })
    return URL.createObjectURL(blob)
  }

  async playBackgroundMusic(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
    
    if (this.backgroundMusic && !this.isMusicPlaying) {
      try {
        this.backgroundMusic.currentTime = 0
        await this.backgroundMusic.play()
        this.isMusicPlaying = true
      } catch (error) {
        console.warn('Failed to play background music:', error)
      }
    }
  }

  stopBackgroundMusic(): void {
    if (this.backgroundMusic && this.isMusicPlaying) {      this.backgroundMusic.pause()
      this.backgroundMusic.currentTime = 0
      this.isMusicPlaying = false
    }
  }

  playPunchSound(punchType: string = 'jab'): void {
    if (!this.isInitialized) return
    
    const typeIndex = ['jab', 'cross', 'hook', 'uppercut'].indexOf(punchType)
    const soundIndex = typeIndex >= 0 ? typeIndex : 0
    const sound = this.punchSounds[soundIndex]
    
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(e => console.warn('Punch sound failed:', e))
    }
  }

  playHitSound(): void {
    if (!this.isInitialized) return
    
    const randomIndex = Math.floor(Math.random() * this.hitSounds.length)
    const sound = this.hitSounds[randomIndex]
    
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(e => console.warn('Hit sound failed:', e))
    }
  }

  playKnockoutSound(): void {
    if (!this.isInitialized) return
    
    if (this.knockoutSound) {
      this.knockoutSound.currentTime = 0
      this.knockoutSound.play().catch(e => console.warn('Knockout sound failed:', e))
    }
  }

  playBellSound(): void {
    if (!this.isInitialized) return
    
    if (this.bellSound) {
      this.bellSound.currentTime = 0
      this.bellSound.play().catch(e => console.warn('Bell sound failed:', e))
    }
  }

  playVictorySound(): void {
    if (!this.isInitialized) return
    
    const randomIndex = Math.floor(Math.random() * this.victorySounds.length)
    const sound = this.victorySounds[randomIndex]
    
    if (sound) {      sound.currentTime = 0
      sound.play().catch(e => console.warn('Victory sound failed:', e))
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume
    }
  }

  setEffectsVolume(volume: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, volume))
    
    this.punchSounds.forEach(sound => sound.volume = this.effectsVolume)
    this.hitSounds.forEach(sound => sound.volume = this.effectsVolume)
    this.victorySounds.forEach(sound => sound.volume = this.effectsVolume)
    
    if (this.knockoutSound) this.knockoutSound.volume = this.effectsVolume
    if (this.bellSound) this.bellSound.volume = this.effectsVolume
  }
  async loadCustomMusic(file: File): Promise<void> {
    try {
      if (this.backgroundMusic) {
        if (this.isMusicPlaying) {
          this.backgroundMusic.pause()
        }
        
        if (this.backgroundMusic.src.startsWith('blob:')) {
          URL.revokeObjectURL(this.backgroundMusic.src)
        }
        
        const blobUrl = URL.createObjectURL(file)
        this.backgroundMusic.src = blobUrl
        this.customMusicFile = file
        this.currentMusicBlob = file
        
        if (this.isMusicPlaying) {
          await this.backgroundMusic.play()
        }
        
        console.log('Música personalizada carregada:', file.name)
      }
    } catch (error) {
      console.warn('Erro ao carregar música personalizada:', error)
    }
  }
  downloadCurrentMusic(): void {
    if (this.customMusicFile) {
      const url = URL.createObjectURL(this.customMusicFile)
      const a = document.createElement('a')
      a.href = url
      a.download = this.customMusicFile.name || 'musica-personalizada.mp3'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (this.backgroundMusic?.src.includes('.mp3')) {
      this.downloadRealMusic()
    } else {
      this.downloadGeneratedMusic()
    }
  }

  private downloadRealMusic(): void {
    const a = document.createElement('a')
    a.href = '/Survivor-EyeOfTheTigermp3-codes1.com_64kb.mp3'
    a.download = 'Eye-of-the-Tiger.mp3'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  private downloadGeneratedMusic(): void {
    if (this.backgroundMusic?.src) {
      const a = document.createElement('a')
      a.href = this.backgroundMusic.src
      a.download = 'eye-of-the-tiger-generated.wav'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  cleanup(): void {
    this.stopBackgroundMusic()
    
    if (this.backgroundMusic?.src.startsWith('blob:')) {
      URL.revokeObjectURL(this.backgroundMusic.src)
    }
    
    this.punchSounds.forEach(sound => {
      if (sound.src.startsWith('blob:')) {
        URL.revokeObjectURL(sound.src)
      }
    })
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
  }

  getCurrentMusicType(): 'real' | 'custom' | 'generated' {
    if (this.customMusicFile) {
      return 'custom'
    } else if (this.backgroundMusic?.src.includes('.mp3')) {
      return 'real'
    } else {
      return 'generated'
    }
  }

  getCurrentMusicName(): string {
    const type = this.getCurrentMusicType()
    switch (type) {
      case 'custom':
        return this.customMusicFile?.name || 'Música Personalizada'
      case 'real':
        return 'Eye of the Tiger (Original)'
      case 'generated':
        return 'Eye of the Tiger (Gerado)'
      default:
        return 'Sem música'
    }
  }

  async resetToOriginalMusic(): Promise<void> {
    try {
      if (this.backgroundMusic) {
        const wasPlaying = this.isMusicPlaying
        if (wasPlaying) {
          this.backgroundMusic.pause()
        }
        
        if (this.customMusicFile && this.backgroundMusic.src.startsWith('blob:')) {
          URL.revokeObjectURL(this.backgroundMusic.src)
        }
        this.customMusicFile = null
        this.currentMusicBlob = null
        
        await this.loadRealMusicFile()
        
        if (wasPlaying) {
          await this.playBackgroundMusic()
        }
        
        console.log('Resetado para Eye of the Tiger original')
      }
    } catch (error) {
      console.warn('Erro ao resetar para música original:', error)
    }
  }
}
