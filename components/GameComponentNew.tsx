"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { ParticleSystem } from "./ParticleSystem"
import { BackgroundRenderer } from "./BackgroundRenderer"
import { HUD } from "./HUD"
import { Play, Square, Pause } from "lucide-react"

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
})

interface GameComponentProps {
  onGameOver: (result: string, score: number) => void
  round: number
  initialScore: number
}

// Classe do jogador melhorada
class Player {  public position: any
  public velocity: any
  public health: number
  public maxHealth: number
  public isPunching: boolean
  public punchType: string
  public punchCooldown: number
  public punchFrame: number
  public maxPunchFrames: number
  public isHit: boolean
  public hitTimer: number
  public isKnockedOut: boolean
  public knockoutTimer: number
  public stunned: boolean
  public stunnedTimer: number
  public size: number
  public type: string
  public facingRight: boolean
  public moveSpeed: number
  public leftArm: any
  public rightArm: any
  public skinColor: any
  public trunkColor: any
  public gloveColor: any
  public hairColor: any
  public eyeColor: any
  public breathingOffset: number
  public blinkTimer: number
  public isBlinking: boolean
  public sweatDrops: any[]
  public p5: any
  public leftGloveImg: any
  public rightGloveImg: any
  public headImg: any
  
  constructor(p5: any, x: number, y: number, type: string) {
    this.p5 = p5
    this.position = p5.createVector(x, y)
    this.velocity = p5.createVector(0, 0)
    this.size = 70 // Aumentado para personagem mais realista
    this.health = 500
    this.maxHealth = 500
    this.type = type
    this.isPunching = false
    this.punchType = "jab"
    this.punchCooldown = 0
    this.punchFrame = 0
    this.maxPunchFrames = 20 // Animação mais longa
    this.moveSpeed = 3.5
    this.isHit = false
    this.hitTimer = 0
    this.isKnockedOut = false
    this.knockoutTimer = 0
    this.stunned = false
    this.stunnedTimer = 0
    this.facingRight = type === "player"
    this.breathingOffset = 0
    this.blinkTimer = p5.floor(p5.random(60, 180))
    this.isBlinking = false
    this.sweatDrops = []

    // Cores mais realistas
    this.skinColor = type === "player" ? p5.color(255, 220, 185) : p5.color(205, 170, 125)
    this.trunkColor = type === "player" ? p5.color(200, 0, 0) : p5.color(0, 0, 200)
    this.gloveColor = type === "player" ? p5.color(220, 20, 20) : p5.color(20, 20, 220)
    this.hairColor = type === "player" ? p5.color(40, 25, 15) : p5.color(20, 15, 10)
    this.eyeColor = p5.color(60, 120, 200)    // Carregar imagens das luvas e cabeça
    this.leftGloveImg = null
    this.rightGloveImg = null
    this.headImg = null
    this.loadImages()

    this.initializeArms()
  }
  loadImages() {
    // Carrega as imagens das luvas baseado no tipo de jogador
    const gloveImagePath = this.type === "player" ? "/vermelha.png" : "/azul.png"
    
    // Carrega a mesma imagem para ambos os lados das luvas
    this.leftGloveImg = this.p5.loadImage(gloveImagePath)
    this.rightGloveImg = this.p5.loadImage(gloveImagePath)
    
    // Carrega a imagem da cabeça baseado no tipo de jogador
    const headImagePath = this.type === "player" ? "/lutador.png" : "/lutador (1).png"
    this.headImg = this.p5.loadImage(headImagePath)
  }

  initializeArms() {
    this.leftArm = { x: -20, y: 0, angle: -0.3 }
    this.rightArm = { x: 20, y: 0, angle: 0.3 }
  }  update() {
    if (this.isKnockedOut) {
      this.knockoutTimer--
      if (this.knockoutTimer <= 0) {
        this.isKnockedOut = false
        this.health = Math.max(1, this.health) // Evita ficar com 0 de vida
      }
      return
    }

    if (this.stunned) {
      this.stunnedTimer--
      if (this.stunnedTimer <= 0) {
        this.stunned = false
      }
    }

    // Atualiza animações de soco
    if (this.isPunching) {
      this.punchFrame++
      this.animatePunch()

      if (this.punchFrame >= this.maxPunchFrames) {
        this.isPunching = false
        this.punchFrame = 0
        this.resetArmPosition()
      }
    }

    // Atualiza cooldowns
    if (this.punchCooldown > 0) {
      this.punchCooldown--
    }

    if (this.isHit) {
      this.hitTimer--
      if (this.hitTimer <= 0) {
        this.isHit = false
      }
    }

    // Efeitos visuais
    this.updateVisualEffects()

    // Constrain to canvas
    this.position.x = this.p5.constrain(this.position.x, 100, 700)
    this.position.y = this.p5.constrain(this.position.y, 200, 450)
  }
  updateVisualEffects() {
    this.breathingOffset = Math.sin(this.p5.frameCount * 0.05) * 2
    
    // Subtle arm breathing animation when not punching
    if (!this.isPunching) {
      const armBreathing = Math.sin(this.p5.frameCount * 0.03) * 2
      this.leftArm.y = armBreathing
      this.rightArm.y = armBreathing
      
      // Slight arm sway for natural movement
      const armSway = Math.sin(this.p5.frameCount * 0.02) * 1
      this.leftArm.x = -20 + armSway
      this.rightArm.x = 20 - armSway
    }
    
    this.blinkTimer--
    if (this.blinkTimer <= 0) {
      this.isBlinking = !this.isBlinking
      this.blinkTimer = this.isBlinking ? 5 : this.p5.floor(this.p5.random(60, 180))
    }

    // Adiciona gotas de suor
    if ((this.isPunching || this.isHit) && this.p5.random() < 0.3) {
      this.sweatDrops.push({
        x: this.p5.random(-20, 20),
        y: this.p5.random(-50, -30),
        vx: this.p5.random(-1, 1),
        vy: this.p5.random(1, 3),
        size: this.p5.random(2, 4),
        life: this.p5.floor(this.p5.random(20, 40)),
      })
    }

    // Atualiza gotas de suor
    for (let i = this.sweatDrops.length - 1; i >= 0; i--) {
      const drop = this.sweatDrops[i]
      drop.x += drop.vx
      drop.y += drop.vy
      drop.life--
      
      if (drop.life <= 0) {
        this.sweatDrops.splice(i, 1)
      }
    }
  }

  animatePunch() {
    const progress = this.punchFrame / this.maxPunchFrames
      switch (this.punchType) {
      case "jab":
        this.animateJab(progress)
        break
      case "uppercut":
        this.animateUppercut(progress)
        break
      case "hook":
        this.animateHook(progress)
        break
      case "cross":
        this.animateCross(progress)
        break
    }
  }

  animateJab(progress: number) {
    // Movimento mais realista com aceleração e desaceleração
    const easeInOut = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    
    // Efeito de recuo do corpo para poder
    const bodyRecoil = Math.sin(progress * this.p5.PI) * 3
    
    if (progress <= 0.5) {
      // Fase de extensão - rápida e direta
      const extendFactor = easeInOut * 2
      if (this.facingRight) {
        this.leftArm.x = -20 + 65 * extendFactor
        this.leftArm.y = -8 * extendFactor
        this.leftArm.angle = -0.1 - 0.3 * extendFactor
        // Braço de apoio recua ligeiramente
        this.rightArm.x = 20 - 12 * extendFactor
        this.rightArm.angle = 0.3 + 0.3 * extendFactor
        
        // Rotação sutil do corpo
        this.position.x -= bodyRecoil * 0.5
      } else {
        this.rightArm.x = 20 - 65 * extendFactor
        this.rightArm.y = -8 * extendFactor
        this.rightArm.angle = 0.1 + 0.3 * extendFactor
        // Braço de apoio recua ligeiramente
        this.leftArm.x = -20 + 12 * extendFactor
        this.leftArm.angle = -0.3 - 0.3 * extendFactor
        
        // Rotação sutil do corpo
        this.position.x += bodyRecoil * 0.5
      }
    } else {
      // Fase de retração - mais lenta e controlada
      const retractFactor = 1 - ((progress - 0.5) * 2)
      if (this.facingRight) {
        this.leftArm.x = -20 + 65 * retractFactor
        this.leftArm.y = -8 * retractFactor
        this.leftArm.angle = -0.1 - 0.3 * retractFactor
        this.rightArm.x = 20 - 12 * retractFactor
        this.rightArm.angle = 0.3 + 0.3 * retractFactor
        
        this.position.x -= bodyRecoil * 0.5
      } else {
        this.rightArm.x = 20 - 65 * retractFactor
        this.rightArm.y = -8 * retractFactor
        this.rightArm.angle = 0.1 + 0.3 * retractFactor
        this.leftArm.x = -20 + 12 * retractFactor
        this.leftArm.angle = -0.3 - 0.3 * retractFactor
        
        this.position.x += bodyRecoil * 0.5
      }
    }
      // Efeito de head movement sutil
    if (progress > 0.3 && progress < 0.7) {
      this.position.y += Math.sin(progress * this.p5.PI * 3) * 1
    }
  }

  animateUppercut(progress: number) {
    // Movimento com impulso desde baixo - mais explosivo
    const easeOut = 1 - Math.pow(1 - progress, 4) // Mais explosivo
    const bodyDip = Math.sin(progress * this.p5.PI) * 8 // Abaixar e subir
    
    if (progress <= 0.6) {
      // Fase principal do uppercut - movimento ascendente explosivo
      const extendFactor = easeOut
      if (this.facingRight) {
        this.rightArm.x = 20 + 30 * extendFactor
        this.rightArm.y = 25 - 70 * extendFactor // Movimento mais amplo
        this.rightArm.angle = -1.8 * extendFactor // Ângulo mais dramático
        // Corpo se inclina significativamente
        this.leftArm.x = -20 - 18 * extendFactor
        this.leftArm.y = 12 * extendFactor
        this.leftArm.angle = -0.3 + 0.6 * extendFactor
        
        // Movimento do corpo - abaixa e depois explode para cima
        this.position.y += bodyDip
        if (progress > 0.3) {
          this.position.y -= bodyDip * 1.5 // Impulso para cima
        }
      } else {
        this.leftArm.x = -20 - 30 * extendFactor
        this.leftArm.y = 25 - 70 * extendFactor
        this.leftArm.angle = 1.8 * extendFactor
        this.rightArm.x = 20 + 18 * extendFactor
        this.rightArm.y = 12 * extendFactor
        this.rightArm.angle = 0.3 - 0.6 * extendFactor
        
        // Movimento do corpo
        this.position.y += bodyDip
        if (progress > 0.3) {
          this.position.y -= bodyDip * 1.5
        }
      }
    } else {
      // Fase de recuperação - mais rápida
      const retractFactor = 1 - ((progress - 0.6) / 0.4)
      if (this.facingRight) {
        this.rightArm.x = 20 + 30 * retractFactor
        this.rightArm.y = 25 - 70 * retractFactor
        this.rightArm.angle = -1.8 * retractFactor
        this.leftArm.x = -20 - 18 * retractFactor
        this.leftArm.y = 12 * retractFactor
        this.leftArm.angle = -0.3 + 0.6 * retractFactor
        
        // Retorno gradual à posição
        this.position.y += bodyDip * retractFactor * 0.3
      } else {
        this.leftArm.x = -20 - 30 * retractFactor
        this.leftArm.y = 25 - 70 * retractFactor
        this.leftArm.angle = 1.8 * retractFactor
        this.rightArm.x = 20 + 18 * retractFactor
        this.rightArm.y = 12 * retractFactor
        this.rightArm.angle = 0.3 - 0.6 * retractFactor
        
        this.position.y += bodyDip * retractFactor * 0.3
      }
    }
      // Efeito de tremor do chão no impacto
    if (progress > 0.4 && progress < 0.7) {
      const groundShake = Math.sin(progress * this.p5.PI * 8) * 1
      this.position.x += groundShake
    }
  }

  animateHook(progress: number) {
    // Movimento circular amplo característico do hook
    const easeInOut = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    
    // Rotação significativa do corpo para poder
    const bodyRotation = Math.sin(progress * this.p5.PI) * 8
    const hipTwist = Math.sin(progress * this.p5.PI) * 0.3
    
    if (progress <= 0.5) {
      // Fase de carga e início do arco
      const chargeProgress = easeInOut * 2
      if (this.facingRight) {
        this.leftArm.x = -20 - 35 * chargeProgress + 100 * chargeProgress
        this.leftArm.y = -18 * chargeProgress
        this.leftArm.angle = -0.3 - 1.4 * chargeProgress
        // Rotação significativa do corpo
        this.rightArm.x = 20 + 25 * chargeProgress
        this.rightArm.angle = 0.3 + 0.6 * chargeProgress
        
        // Movimento do corpo
        this.position.x -= bodyRotation * 0.6
        this.position.y += Math.abs(bodyRotation) * 0.2
      } else {
        this.rightArm.x = 20 + 35 * chargeProgress - 100 * chargeProgress
        this.rightArm.y = -18 * chargeProgress
        this.rightArm.angle = 0.3 + 1.4 * chargeProgress
        this.leftArm.x = -20 - 25 * chargeProgress
        this.leftArm.angle = -0.3 - 0.6 * chargeProgress
        
        // Movimento do corpo
        this.position.x += bodyRotation * 0.6
        this.position.y += Math.abs(bodyRotation) * 0.2
      }
    } else {
      // Fase de finalização do arco e retração
      const finishProgress = 1 - ((progress - 0.5) * 2)
      if (this.facingRight) {
        this.leftArm.x = -20 - 35 * finishProgress + 100 * finishProgress
        this.leftArm.y = -18 * finishProgress
        this.leftArm.angle = -0.3 - 1.4 * finishProgress
        this.rightArm.x = 20 + 25 * finishProgress
        this.rightArm.angle = 0.3 + 0.6 * finishProgress
        
        this.position.x -= bodyRotation * 0.6
        this.position.y += Math.abs(bodyRotation) * 0.2
      } else {
        this.rightArm.x = 20 + 35 * finishProgress - 100 * finishProgress
        this.rightArm.y = -18 * finishProgress
        this.rightArm.angle = 0.3 + 1.4 * finishProgress
        this.leftArm.x = -20 - 25 * finishProgress
        this.leftArm.angle = -0.3 - 0.6 * finishProgress
        
        this.position.x += bodyRotation * 0.6
        this.position.y += Math.abs(bodyRotation) * 0.2
      }
    }
    
    // Efeito de footwork - movimento dos pés
    if (progress > 0.2 && progress < 0.8) {
      const footWork = Math.sin((progress - 0.2) * this.p5.PI * 2) * 2
      this.position.y += footWork
    }
  }
  animateCross(progress: number) {
    // Cross punch: power punch across the body with shoulder rotation
    const easeOut = 1 - Math.pow(1 - progress, 3)
    const easeIn = Math.pow(progress, 2)
    
    // Two-phase animation: acceleration then deceleration
    const extendFactor = progress < 0.3 ? 
      easeIn * (progress / 0.3) : 
      easeOut * Math.max(0, (1 - progress) / 0.7)
    
    // Body rotation for power
    const bodyRotation = Math.sin(progress * Math.PI) * 0.15
    
    if (this.facingRight) {
      // Right cross - extends across body with shoulder pivot
      this.rightArm.x = 20 + 85 * extendFactor
      this.rightArm.y = -10 * extendFactor + Math.sin(progress * Math.PI) * 5
      this.rightArm.angle = 0.3 - 1.0 * extendFactor
      
      // Supporting left arm pulls back
      this.leftArm.x = -20 - 15 * extendFactor
      this.leftArm.y = 5 * extendFactor
      this.leftArm.angle = -0.3 + 0.2 * extendFactor
    } else {
      // Left cross - extends across body with shoulder pivot
      this.leftArm.x = -20 - 85 * extendFactor
      this.leftArm.y = -10 * extendFactor + Math.sin(progress * Math.PI) * 5
      this.leftArm.angle = -0.3 + 1.0 * extendFactor
      
      // Supporting right arm pulls back
      this.rightArm.x = 20 + 15 * extendFactor
      this.rightArm.y = 5 * extendFactor
      this.rightArm.angle = 0.3 - 0.2 * extendFactor
    }
    
    // Add slight body lean for power transfer
    this.position.x += bodyRotation * (this.facingRight ? 1 : -1)
  }

  resetArmPosition() {
    this.leftArm = { x: -20, y: 0, angle: -0.3 }
    this.rightArm = { x: 20, y: 0, angle: 0.3 }
  }

  draw() {
    const p5 = this.p5

    if (this.isKnockedOut) {
      this.drawKnockedOut()
      return
    }

    p5.push()
    p5.translate(this.position.x, this.position.y)

    // Efeito de tremor quando atingido
    if (this.isHit || this.stunned) {
      p5.translate(p5.random(-3, 3), p5.random(-3, 3))
    }

    // Efeito de brilho
    if (this.isPunching) {
      p5.drawingContext.shadowColor = this.type === "player" ? "red" : "blue"
      p5.drawingContext.shadowBlur = 15
    }

    this.drawBody()
    this.drawHead()
    this.drawArms()
    this.drawSweat()

    p5.drawingContext.shadowBlur = 0
    p5.pop()

    this.drawShadow()
  }  drawBody() {
    const p5 = this.p5
    const breathingAdjust = this.breathingOffset * 0.5
    
    // Pernas mais anatômicas e proporcionais
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1.5)
    
    // Coxa esquerda com músculos definidos
    p5.ellipse(-10, 42, 20, 38)
    // Definição do quadríceps
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.1))
    p5.noStroke()
    p5.ellipse(-12, 38, 14, 25)
    p5.ellipse(-8, 40, 10, 20)
    
    // Coxa direita com músculos definidos  
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1.5)
    p5.ellipse(10, 42, 20, 38)
    // Definição do quadríceps
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.1))
    p5.noStroke()
    p5.ellipse(12, 38, 14, 25)
    p5.ellipse(8, 40, 10, 20)
    
    // Panturrilhas mais musculosas
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1.5)
    p5.ellipse(-10, 62, 16, 28)
    p5.ellipse(10, 62, 16, 28)
    
    // Definição das panturrilhas
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.15))
    p5.noStroke()
    p5.ellipse(-12, 58, 10, 18)
    p5.ellipse(12, 58, 10, 18)

    // Joelhos com definição realista
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.2))
    p5.ellipse(-10, 52, 18, 10)
    p5.ellipse(10, 52, 18, 10)
    
    // Patela (rótula do joelho)
    p5.fill(p5.lerpColor(this.skinColor, p5.color(255), 0.1))
    p5.ellipse(-10, 52, 8, 6)
    p5.ellipse(10, 52, 8, 6)

    // Sapatos de boxe profissionais com mais detalhes
    p5.fill(20, 20, 20) // Preto mais suave
    p5.stroke(60)
    p5.strokeWeight(2)
    p5.rect(-22, 72, 20, 14, 4)
    p5.rect(2, 72, 20, 14, 4)
    
    // Sola dos sapatos
    p5.fill(80, 40, 20) // Marrom da sola
    p5.noStroke()
    p5.rect(-22, 84, 20, 3, 2)
    p5.rect(2, 84, 20, 3, 2)
    
    // Cadarços dos sapatos com mais detalhes
    p5.stroke(255)
    p5.strokeWeight(1.5)
    for (let i = 0; i < 4; i++) {
      const y = 74 + i * 2.5
      p5.line(-20 + i * 3, y, -16 + i * 3, y + 3)
      p5.line(4 + i * 3, y, 8 + i * 3, y + 3)
    }
    
    // Detalhes da marca nos sapatos
    p5.fill(150)
    p5.noStroke()
    p5.ellipse(-12, 76, 4, 2)
    p5.ellipse(12, 76, 4, 2)    // Shorts de boxe mais estreitos e estilosos
    p5.fill(this.trunkColor)
    p5.stroke(p5.lerpColor(this.trunkColor, p5.color(0), 0.4))
    p5.strokeWeight(2.5)
    p5.rect(-20, -2, 40, 38, 8)
      // Faixa superior decorativa
    p5.fill(p5.lerpColor(this.trunkColor, p5.color(255), 0.4))
    p5.noStroke()
    p5.rect(-18, 0, 36, 4, 4)
    
    // Logo/faixa lateral
    p5.rect(-3, 8, 6, 24, 3)
    
    // Detalhes de costura
    p5.stroke(p5.lerpColor(this.trunkColor, p5.color(0), 0.6))
    p5.strokeWeight(0.5)
    p5.line(-18, 6, 18, 6)
    p5.line(-18, 30, 18, 30)

    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(2)
    
    p5.push()
    p5.translate(0, breathingAdjust)
    p5.ellipse(0, -8, this.size * 0.7, this.size * 0.8)
    
    p5.noStroke()
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.2))
    
    // Six-pack superior
    p5.ellipse(-10, -8, 14, 10)
    p5.ellipse(10, -8, 14, 10)
    
    p5.ellipse(-8, 2, 12, 10)
    p5.ellipse(8, 2, 12, 10)
    
    p5.ellipse(-6, 12, 10, 8)
    p5.ellipse(6, 12, 10, 8)
    
    p5.stroke(p5.lerpColor(this.skinColor, p5.color(0), 0.3))
    p5.strokeWeight(1.5)
    p5.line(0, -25, 0, 25)
    
    p5.strokeWeight(1)
    p5.line(-12, -3, 12, -3)
    p5.line(-10, 7, 10, 7)

    p5.noStroke()
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.25))
    p5.ellipse(-18, -20, 32, 26)
    p5.ellipse(18, -20, 32, 26)
    
    p5.fill(p5.lerpColor(this.skinColor, p5.color(255), 0.3))
    p5.ellipse(-18, -25, 22, 12)
    p5.ellipse(18, -25, 22, 12)
    
    p5.stroke(p5.lerpColor(this.skinColor, p5.color(0), 0.2))
    p5.strokeWeight(1)
    p5.line(0, -32, 0, -15)

    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.3))
    p5.noStroke()
    p5.ellipse(-28, -28, 24, 30)
    p5.ellipse(28, -28, 24, 30)
    
    p5.fill(p5.lerpColor(this.skinColor, p5.color(255), 0.2))
    p5.ellipse(-30, -32, 16, 18)
    p5.ellipse(30, -32, 16, 18)
    
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.2))
    p5.triangle(-15, -38, 15, -38, 0, -28)
    
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.15))
    for (let i = 0; i < 3; i++) {
      p5.ellipse(-32, -15 + i * 8, 8, 4)
      p5.ellipse(32, -15 + i * 8, 8, 4)
    }
    
    p5.pop()

    if (this.health < this.maxHealth * 0.8) {
      p5.fill(255, 255, 255, 60)
      p5.noStroke()
      p5.ellipse(-15, -18, 8, 4)
      p5.ellipse(15, -18, 8, 4)
      p5.ellipse(0, -5, 6, 3)
    }

    if (this.health < this.maxHealth * 0.7) {
      p5.stroke(p5.lerpColor(this.skinColor, p5.color(255, 100, 100), 0.4))
      p5.strokeWeight(1.5)
      p5.line(-12, -10, -8, -14) 
      
      if (this.health < this.maxHealth * 0.4) {
        p5.line(10, 0, 14, -4) 
        p5.line(-8, 8, -4, 4)  
      }
    }
    
    if (this.isPunching || this.health < this.maxHealth * 0.3) {
      p5.stroke(p5.lerpColor(this.skinColor, p5.color(0, 100, 200), 0.3))
      p5.strokeWeight(0.8)
      p5.line(-20, -15, -15, -8) 
      p5.line(15, -8, 20, -15)   
      p5.line(-5, 5, 5, 8)       
    }
  }drawHead() {
    const p5 = this.p5
    const headSize = this.size * 0.8
    
    if (this.headImg && this.headImg.width > 0) {
      p5.push()
      p5.translate(0, -50) 
      
      if (this.isHit || this.stunned) {
        p5.translate(p5.random(-2, 2), p5.random(-2, 2))
      }
      
      if (!this.facingRight) {
        p5.scale(-1, 1) 
      }
      
      if (this.health < this.maxHealth * 0.5) {
        p5.tint(255, 200, 200)
      } else if (this.health < this.maxHealth * 0.8) {
        p5.tint(255, 220, 220) 
      } else {
        p5.tint(255) 
      }
      
      p5.imageMode(p5.CENTER)
      p5.image(this.headImg, 0, 0, headSize + 10, headSize + 10)
      
      p5.noTint()
      
      p5.pop()
      
      this.addHeadEffects()
      
    } else {
      this.drawProceduralHead()
    }
  }

  addHeadEffects() {
    const p5 = this.p5
    
    if (this.health < this.maxHealth * 0.8) {
      p5.fill(255, 255, 255, 60)
      p5.noStroke()
      p5.ellipse(-15, -68, 4, 2)
      p5.ellipse(15, -68, 4, 2)
      p5.ellipse(0, -72, 3, 1)
    }
    
    if (this.stunned) {
      for (let i = 0; i < 3; i++) {
        const angle = (p5.TWO_PI * i) / 3 + p5.frameCount * 0.05
        const x = 25 * p5.cos(angle)
        const y = -80 + 15 * p5.sin(angle)

        p5.fill(255, 255, 0)
        p5.noStroke()
        p5.push()
        p5.translate(x, y)
        p5.rotate(p5.frameCount * 0.1)
        
        p5.beginShape()
        for (let j = 0; j < 10; j++) {
          const radius = j % 2 === 0 ? 4 : 2
          const starAngle = (p5.TWO_PI * j) / 10
          const px = radius * p5.cos(starAngle)
          const py = radius * p5.sin(starAngle)
          p5.vertex(px, py)
        }
        p5.endShape(p5.CLOSE)
        p5.pop()
      }
    }
    
    if (this.health < this.maxHealth * 0.8) {
      p5.fill(p5.color(100, 0, 100, 120)) 
      p5.noStroke()
      p5.ellipse(8, -68, 6, 4)
      
      if (this.health < this.maxHealth * 0.6) {
        p5.ellipse(-6, -66, 4, 3)
        
        if (this.health < this.maxHealth * 0.3) {
          p5.ellipse(-4, -59, 3, 2) 
          p5.fill(p5.color(255, 0, 0, 150))
          p5.ellipse(-4, -59, 1, 0.5)
        }
      }
    }
    
    if (this.health < this.maxHealth * 0.3) {
      if (p5.frameCount % 40 < 20) {
        p5.fill(255, 255, 255, 60)
        p5.noStroke()
        p5.ellipse(8, -45, 4, 2) // Vapor da respiração
        p5.ellipse(10, -42, 2, 1)
      }
    }
  }

  drawProceduralHead() {
    const p5 = this.p5
    const headSize = this.size * 0.8
    
    // Cabeça com formato mais realista e angular
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1.5)
    
    // Formato de cabeça mais masculino/quadrado
    p5.beginShape()
    p5.vertex(-headSize * 0.4, -30)
    p5.bezierVertex(-headSize * 0.5, -50, -headSize * 0.3, -65, 0, -70)
    p5.bezierVertex(headSize * 0.3, -65, headSize * 0.5, -50, headSize * 0.4, -30)
    p5.bezierVertex(headSize * 0.3, -20, -headSize * 0.3, -20, -headSize * 0.4, -30)
    p5.endShape(p5.CLOSE)

    // Estrutura facial mais masculina
    // Queixo definido
    p5.noStroke()
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.1))
    p5.triangle(-8, -25, 8, -25, 0, -15)
    
    // Maçãs do rosto mais proeminentes
    p5.fill(p5.lerpColor(this.skinColor, p5.color(255, 150, 150), 0.15))
    p5.ellipse(-14, -42, 10, 8)
    p5.ellipse(14, -42, 10, 8)
    
    // Sombra do queixo e estrutura facial
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.2))
    p5.ellipse(0, -30, 20, 8)

    // Cabelo mais estiloso e variado
    p5.fill(this.hairColor)
    p5.noStroke()
    
    if (this.type === "player") {
      // Cabelo do jogador - estilo moderno undercut
      p5.arc(0, -58, headSize * 0.95, headSize * 0.7, this.p5.PI, this.p5.TWO_PI)
      // Topete estiloso
      p5.push()
      p5.translate(0, -68)
      p5.ellipse(0, 0, 28, 18)
      p5.ellipse(-8, -5, 15, 10)
      p5.ellipse(8, -5, 15, 10)
      p5.pop()
      // Laterais raspadas
      p5.ellipse(-20, -50, 8, 15)
      p5.ellipse(20, -50, 8, 15)
    } else {
      // Cabelo do inimigo - estilo mais agressivo
      p5.arc(0, -58, headSize * 0.9, headSize * 0.6, this.p5.PI, this.p5.TWO_PI)
      // Moicano sutil
      p5.rect(-3, -72, 6, 15, 3)
      // Laterais bem raspadas
      p5.ellipse(-18, -48, 6, 12)
      p5.ellipse(18, -48, 6, 12)
    }

    // Sobrancelhas mais expressivas e masculinas
    p5.fill(this.hairColor)
    p5.noStroke()
    if (this.isPunching || this.isHit) {
      // Sobrancelhas franzidas dramaticamente
      p5.push()
      p5.translate(-12, -54)
      p5.rotate(-0.3)
      p5.ellipse(0, 0, 16, 4)
      p5.pop()
      
      p5.push()
      p5.translate(12, -54)
      p5.rotate(0.3)
      p5.ellipse(0, 0, 16, 4)
      p5.pop()
    } else {
      // Sobrancelhas normais mas definidas
      p5.ellipse(-12, -54, 16, 4)
      p5.ellipse(12, -54, 16, 4)
    }

    // Olhos mais expressivos
    this.drawEyes()

    // Nariz mais definido e masculino
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.15))
    p5.noStroke()
    p5.ellipse(0, -42, 5, 12)
    // Ponte do nariz
    p5.ellipse(0, -48, 3, 8)
    // Narinas
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.4))
    p5.ellipse(-2, -38, 2, 3)
    p5.ellipse(2, -38, 2, 3)

    // Boca mais realista
    this.drawMouth()

    // Orelhas com mais detalhes
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(-26, -45, 14, 20)
    p5.ellipse(26, -45, 14, 20)
    
    // Detalhes internos das orelhas
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.2))
    p5.noStroke()
    p5.ellipse(-26, -45, 8, 12)
    p5.ellipse(26, -45, 8, 12)
    
    // Lóbulos das orelhas
    p5.fill(p5.lerpColor(this.skinColor, p5.color(255, 150, 150), 0.1))
    p5.ellipse(-26, -38, 6, 8)
    p5.ellipse(26, -38, 6, 8)

    // Barba por fazer ou cavanhaque (se apropriado)
    if (this.type === "enemy" || (this.type === "player" && this.health < this.maxHealth * 0.5)) {
      p5.fill(p5.lerpColor(this.hairColor, p5.color(0), 0.3))
      p5.noStroke()
      for (let i = 0; i < 25; i++) {
        const x = p5.random(-18, 18)
        const y = p5.random(-35, -25)
        p5.circle(x, y, p5.random(0.5, 1.5))
      }
      
      // Cavanhaque
      if (this.type === "player") {
        p5.fill(this.hairColor)
        p5.ellipse(0, -25, 8, 6)
      }
    }

    // Marcas de luta e hematomas progressivos
    if (this.health < this.maxHealth * 0.8) {
      p5.fill(p5.color(100, 0, 100, 120)) // Hematoma roxo
      p5.noStroke()
      p5.ellipse(10, -50, 8, 5)
      
      if (this.health < this.maxHealth * 0.6) {
        p5.ellipse(-8, -48, 6, 4)
        
        if (this.health < this.maxHealth * 0.3) {
          p5.ellipse(-6, -41, 4, 3) // Corte no rosto
          p5.fill(p5.color(255, 0, 0, 150))
          p5.ellipse(-6, -41, 2, 1)
        }
      }
    }
  }  drawEyes() {
    const p5 = this.p5
    
    if (this.stunned) {
      // Olhos atordoados (X X) - mais dramáticos
      p5.stroke(0)
      p5.strokeWeight(3)
      p5.line(-15, -50, -8, -42)
      p5.line(-8, -50, -15, -42)
      p5.line(8, -50, 15, -42)
      p5.line(15, -50, 8, -42)
      
      // Círculos ao redor para enfatizar
      p5.noFill()
      p5.strokeWeight(1)
      p5.circle(-11.5, -46, 18)
      p5.circle(11.5, -46, 18)
    } else {
      // Formato dos olhos mais realista e masculino
      p5.fill(255)
      p5.stroke(0)
      p5.strokeWeight(1.5)
      
      // Olhos mais angulares e expressivos
      p5.push()
      p5.translate(-12, -47)
      p5.beginShape()
      p5.vertex(-7, 0)
      p5.bezierVertex(-8, -5, -2, -6, 2, -4)
      p5.bezierVertex(6, -3, 8, 0, 7, 2)
      p5.bezierVertex(6, 5, 0, 6, -4, 4)
      p5.bezierVertex(-7, 3, -8, 1, -7, 0)
      p5.endShape(p5.CLOSE)
      p5.pop()
      
      p5.push()
      p5.translate(12, -47)
      p5.beginShape()
      p5.vertex(7, 0)
      p5.bezierVertex(8, -5, 2, -6, -2, -4)
      p5.bezierVertex(-6, -3, -8, 0, -7, 2)
      p5.bezierVertex(-6, 5, 0, 6, 4, 4)
      p5.bezierVertex(7, 3, 8, 1, 7, 0)
      p5.endShape(p5.CLOSE)
      p5.pop()

      // Íris detalhada com textura
      const eyeOffset = this.facingRight ? 3 : -3
      const focusIntensity = this.isPunching ? 2 : 1
      const eyeFocus = this.isHit ? 0.5 : 1
      
      // Íris base
      p5.fill(this.eyeColor)
      p5.noStroke()
      p5.ellipse(-12 + eyeOffset * focusIntensity * eyeFocus, -47, 10, 10)
      p5.ellipse(12 + eyeOffset * focusIntensity * eyeFocus, -47, 10, 10)
      
      // Padrão da íris
      p5.fill(p5.lerpColor(this.eyeColor, p5.color(0), 0.3))
      for (let i = 0; i < 8; i++) {
        const angle = (p5.TWO_PI * i) / 8
        const x1 = -12 + eyeOffset * focusIntensity * eyeFocus + 2 * p5.cos(angle)
        const y1 = -47 + 2 * p5.sin(angle)
        const x2 = 12 + eyeOffset * focusIntensity * eyeFocus + 2 * p5.cos(angle)
        const y2 = -47 + 2 * p5.sin(angle)
        p5.ellipse(x1, y1, 1, 1)
        p5.ellipse(x2, y2, 1, 1)
      }
      
      // Pupilas
      p5.fill(0)
      const pupilSize = this.isHit ? 8 : this.isPunching ? 3 : 5
      p5.ellipse(-12 + eyeOffset * focusIntensity * eyeFocus, -47, pupilSize, pupilSize)
      p5.ellipse(12 + eyeOffset * focusIntensity * eyeFocus, -47, pupilSize, pupilSize)
      
      // Reflexos múltiplos nos olhos
      p5.fill(255, 255, 255, 200)
      p5.ellipse(-12 + eyeOffset * focusIntensity * eyeFocus - 2, -47 - 2, 4, 4)
      p5.ellipse(12 + eyeOffset * focusIntensity * eyeFocus - 2, -47 - 2, 4, 4)
      
      p5.fill(255, 255, 255, 100)
      p5.ellipse(-12 + eyeOffset * focusIntensity * eyeFocus + 1, -47 + 2, 2, 2)
      p5.ellipse(12 + eyeOffset * focusIntensity * eyeFocus + 1, -47 + 2, 2, 2)

      // Pálpebras superiores para dar profundidade
      p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.15))
      p5.noStroke()
      p5.ellipse(-12, -51, 14, 3)
      p5.ellipse(12, -51, 14, 3)
      
      // Pálpebras inferiores
      p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.08))
      p5.ellipse(-12, -43, 12, 2)
      p5.ellipse(12, -43, 12, 2)

      // Rugas de expressão sutis
      if (this.isPunching || this.health < this.maxHealth * 0.7) {
        p5.stroke(p5.lerpColor(this.skinColor, p5.color(0), 0.2))
        p5.strokeWeight(0.5)
        p5.line(-18, -48, -16, -50) // Pé de galinha esquerdo
        p5.line(16, -50, 18, -48)   // Pé de galinha direito
      }

      // Expressão baseada no estado
      if (this.isHit) {
        // Olhos semicerrados de dor
        p5.fill(this.skinColor)
        p5.noStroke()
        p5.rect(-19, -49, 14, 6, 2)
        p5.rect(5, -49, 14, 6, 2)
      } else if (this.isPunching) {
        // Sobrancelhas mais baixas para concentração
        p5.fill(this.skinColor)
        p5.noStroke()
        p5.rect(-19, -52, 14, 3)
        p5.rect(5, -52, 14, 3)
      }

      // Piscada
      if (this.isBlinking) {
        p5.fill(this.skinColor)
        p5.noStroke()
        p5.rect(-19, -51, 14, 10, 3)
        p5.rect(5, -51, 14, 10, 3)
      }
    }
  }  drawMouth() {
    const p5 = this.p5
    
    if (this.isHit) {
      // Boca aberta de dor/surpresa com mais detalhes
      p5.fill(40, 0, 0) // Interior da boca mais escuro
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.ellipse(0, -33, 14, 12)
      
      // Dentes superiores mais realistas
      p5.fill(255, 250, 240)
      p5.noStroke()
      for (let i = 0; i < 6; i++) {
        const x = -7 + i * 2.5
        p5.rect(x, -37, 2, 4, 1)
      }
      
      // Dentes inferiores
      for (let i = 0; i < 5; i++) {
        const x = -6 + i * 2.5
        p5.rect(x, -31, 2, 3, 1)
      }
      
      // Língua mais detalhada
      p5.fill(200, 100, 120)
      p5.ellipse(0, -31, 8, 5)
      
      // Saliva/baba de impacto
      if (p5.frameCount % 10 < 5) {
        p5.fill(255, 255, 255, 150)
        p5.ellipse(2, -28, 2, 1)
      }
      
    } else if (this.isPunching) {
      // Boca cerrada com determinação
      p5.stroke(0)
      p5.strokeWeight(3)
      p5.noFill()
      p5.line(-10, -33, 10, -33) // Linha firme e decidida
      
      // Cantos da boca ligeiramente para baixo (concentração)
      p5.strokeWeight(2)
      p5.line(-10, -33, -12, -31)
      p5.line(10, -33, 12, -31)
      
      // Protetor bucal profissional quando golpeando
      p5.fill(this.type === "player" ? p5.color(255, 200, 0, 180) : p5.color(0, 150, 255, 180))
      p5.noStroke()
      p5.arc(0, -33, 16, 6, 0, p5.PI)
      
      // Brilho do protetor
      p5.fill(255, 255, 255, 100)
      p5.arc(0, -35, 12, 3, 0, p5.PI)
      
    } else if (this.stunned) {
      // Boca torta/desorientada - mais dramática
      p5.stroke(0)
      p5.strokeWeight(2.5)
      p5.noFill()
      p5.beginShape()
      p5.vertex(-8, -33)
      p5.bezierVertex(-3, -30, 3, -36, 8, -33)
      p5.endShape()
      
      // Baba escorrendo
      p5.fill(255, 255, 255, 120)
      p5.ellipse(-2, -28, 3, 6)
      
    } else if (this.health < this.maxHealth * 0.3) {
      // Boca cansada/exausta com respiração pesada
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.noFill()
      p5.arc(0, -31, 14, 10, 0, p5.PI) // Boca aberta cansada
      
      // Respiração pesada visível
      if (p5.frameCount % 40 < 20) {
        p5.fill(255, 255, 255, 80)
        p5.noStroke()
        p5.ellipse(10, -28, 6, 3) // Vapor da respiração
        p5.ellipse(12, -25, 4, 2)
      }
      
      // Língua cansada
      p5.fill(200, 120, 120)
      p5.ellipse(0, -28, 6, 3)
      
    } else {
      // Boca normal com personalidade
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.noFill()
      
      if (this.type === "player") {
        // Expressão mais confiante/heroica
        p5.arc(0, -35, 12, 8, 0, p5.PI) // Ligeiro sorriso confiante
        
        // Dentes ligeiramente visíveis
        p5.fill(255, 250, 240)
        p5.noStroke()
        p5.arc(0, -35, 10, 4, 0, p5.PI)
        
      } else {
        // Expressão mais séria/intimidante
        p5.line(-6, -33, 6, -33)
        
        // Cantos ligeiramente para baixo
        p5.strokeWeight(1)
        p5.line(-6, -33, -8, -31)
        p5.line(6, -33, 8, -31)
      }
      
      // Protetor bucal quando saudável
      if (this.health > this.maxHealth * 0.8) {
        p5.fill(this.type === "player" ? p5.color(255, 200, 0, 120) : p5.color(0, 200, 255, 120))
        p5.noStroke()
        p5.arc(0, -33, 14, 4, 0, p5.PI)
      }
    }
    
    // Contorno dos lábios mais definido
    p5.noFill()
    p5.stroke(p5.lerpColor(this.skinColor, p5.color(200, 100, 100), 0.4))
    p5.strokeWeight(1.2)
    if (!this.isHit && !this.stunned) {
      // Lábio superior
      p5.arc(0, -35, 14, 4, 0, p5.PI)
      // Lábio inferior
      p5.arc(0, -31, 12, 3, p5.PI, p5.TWO_PI)
    }
    
    // Bigode sutil se for personagem masculino veterano
    if (this.health < this.maxHealth * 0.6 && this.type === "enemy") {
      p5.fill(this.hairColor)
      p5.noStroke()
      p5.rect(-8, -37, 16, 2, 1)
    }
  }drawArms() {
    const p5 = this.p5
    
    p5.push()
    p5.translate(0, -10)

    // Braço esquerdo mais anatômico
    p5.push()
    p5.translate(this.leftArm.x, this.leftArm.y)
    p5.rotate(this.leftArm.angle)
    
    // Antebraço
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(-6, 15, 10, 28)
    
    // Bíceps
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0, 0, 0, 40), 0.3))
    p5.ellipse(-8, -5, 14, 20)
    
    // Definição muscular do braço
    p5.fill(p5.lerpColor(this.skinColor, p5.color(255), 0.1))
    p5.noStroke()
    p5.ellipse(-10, -8, 8, 12)
    
    // Luva esquerda
    p5.push()
    p5.translate(0, 30)
    if (this.leftGloveImg && this.leftGloveImg.width > 0) {
      if (this.facingRight) {
        p5.scale(-1, 1)
      }
      p5.imageMode(p5.CENTER)
      p5.image(this.leftGloveImg, 0, 0, 25, 25)
    } else {
      // Luva 3D melhorada
      p5.fill(this.gloveColor)
      p5.stroke(p5.lerpColor(this.gloveColor, p5.color(0), 0.3))
      p5.strokeWeight(1.5)
      p5.ellipse(0, 0, 22, 20)
      
      // Highlight da luva
      p5.fill(p5.lerpColor(this.gloveColor, p5.color(255), 0.3))
      p5.noStroke()
      p5.ellipse(-3, -3, 12, 10)
      
      // Logo BOX
      p5.fill(255)
      p5.textSize(6)
      p5.textAlign(p5.CENTER)
      p5.text("BOX", 0, 2)
      
      // Dedal da luva
      p5.fill(p5.lerpColor(this.gloveColor, p5.color(0), 0.2))
      p5.ellipse(0, 5, 16, 8)
    }
    p5.pop()
    p5.pop()

    // Braço direito mais anatômico
    p5.push()
    p5.translate(this.rightArm.x, this.rightArm.y)
    p5.rotate(this.rightArm.angle)
    
    // Antebraço
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(6, 15, 10, 28)
    
    // Bíceps
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0, 0, 0, 40), 0.3))
    p5.ellipse(8, -5, 14, 20)
    
    // Definição muscular do braço
    p5.fill(p5.lerpColor(this.skinColor, p5.color(255), 0.1))
    p5.noStroke()
    p5.ellipse(10, -8, 8, 12)
    
    // Luva direita
    p5.push()
    p5.translate(0, 30)
    if (this.rightGloveImg && this.rightGloveImg.width > 0) {
      if (!this.facingRight) {
        p5.scale(-1, 1)
      }
      p5.imageMode(p5.CENTER)
      p5.image(this.rightGloveImg, 0, 0, 25, 25)
    } else {
      // Luva 3D melhorada
      p5.fill(this.gloveColor)
      p5.stroke(p5.lerpColor(this.gloveColor, p5.color(0), 0.3))
      p5.strokeWeight(1.5)
      p5.ellipse(0, 0, 22, 20)
      
      // Highlight da luva
      p5.fill(p5.lerpColor(this.gloveColor, p5.color(255), 0.3))
      p5.noStroke()
      p5.ellipse(3, -3, 12, 10)
      
      // Logo BOX
      p5.fill(255)
      p5.textSize(6)
      p5.textAlign(p5.CENTER)
      p5.text("BOX", 0, 2)
      
      // Dedal da luva
      p5.fill(p5.lerpColor(this.gloveColor, p5.color(0), 0.2))
      p5.ellipse(0, 5, 16, 8)
    }
    p5.pop()
    p5.pop()

    p5.pop()
  }

  drawSweat() {
    const p5 = this.p5
    
    p5.fill(200, 230, 255, 200)
    p5.noStroke()

    for (const drop of this.sweatDrops) {
      p5.ellipse(drop.x, drop.y, drop.size, drop.size * 1.5)
    }
  }

  drawShadow() {
    const p5 = this.p5
    
    p5.push()
    p5.translate(this.position.x, this.position.y + 70)
    p5.fill(0, 0, 0, 100)
    p5.noStroke()
    p5.ellipse(0, 0, this.size * 1.5, this.size * 0.3)
    p5.pop()
  }

  drawKnockedOut() {
    const p5 = this.p5
    
    p5.push()
    p5.translate(this.position.x, this.position.y + 40)

    // Corpo deitado
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(0, 0, this.size * 1.5, this.size * 0.8)

    // Cabeça
    p5.ellipse(-30, 0, this.size * 0.7, this.size * 0.7)

    // Olhos em espiral
    p5.noFill()
    p5.stroke(0)
    p5.strokeWeight(2)
    for (let i = 0; i < 3; i++) {
      p5.circle(-40 + i * 2, -5 + i, 8 - i * 2)
      p5.circle(-20 + i * 2, -5 + i, 8 - i * 2)
    }

    // Estrelas ao redor da cabeça
    for (let i = 0; i < 5; i++) {
      const angle = (p5.TWO_PI * i) / 5 + p5.frameCount * 0.05
      const x = -30 + 50 * p5.cos(angle)
      const y = -20 + 30 * p5.sin(angle)

      p5.fill(255, 255, 0)
      p5.noStroke()
      p5.push()
      p5.translate(x, y)
      p5.rotate(p5.frameCount * 0.1)
      
      // Desenha estrela
      p5.beginShape()
      for (let j = 0; j < 10; j++) {
        const radius = j % 2 === 0 ? 8 : 4
        const starAngle = (p5.TWO_PI * j) / 10
        const px = radius * p5.cos(starAngle)
        const py = radius * p5.sin(starAngle)
        p5.vertex(px, py)
      }
      p5.endShape(p5.CLOSE)
      p5.pop()
    }

    p5.pop()
  }

  punch(type = "jab") {
    if (this.punchCooldown <= 0 && !this.isKnockedOut && !this.stunned) {
      this.isPunching = true
      this.punchType = type
      this.punchFrame = 0

      switch (type) {
        case "jab":
          this.punchCooldown = 20
          break
        case "uppercut":
          this.punchCooldown = 40
          break
        case "hook":
          this.punchCooldown = 35
          break
        case "cross":
          this.punchCooldown = 45
          break      }

      // audioManager.playPunch(type) - áudio removido
      return true
    }
    return false
  }

  takeDamage(amount: number, punchType: string) {
    if (this.isKnockedOut) return

    this.health -= amount
    this.health = Math.max(0, this.health)
    this.isHit = true
    this.hitTimer = 10

    // audioManager.playHit() - áudio removido

    const healthPercentage = this.health / this.maxHealth
    
    if (healthPercentage <= 0) {
      this.isKnockedOut = true
      this.knockoutTimer = 180
      // audioManager.playKnockout() - áudio removido
    } else if (this.p5.random() < 0.1) {
      this.stunned = true
      this.stunnedTimer = 60
    }
  }

  getHealth() {
    return this.health
  }
  getPunchPosition() {
    // Determina qual braço está sendo usado baseado no tipo de soco e direção
    let armX, armY, armAngle
    
    if (this.facingRight) {
      if (this.punchType === "jab") {
        armX = this.leftArm.x
        armY = this.leftArm.y
        armAngle = this.leftArm.angle
      } else {
        armX = this.rightArm.x
        armY = this.rightArm.y
        armAngle = this.rightArm.angle
      }
    } else {
      if (this.punchType === "jab") {
        armX = this.rightArm.x
        armY = this.rightArm.y
        armAngle = this.rightArm.angle
      } else {
        armX = this.leftArm.x
        armY = this.leftArm.y
        armAngle = this.leftArm.angle
      }
    }

    // Calcula extensão da luva baseada no tipo de soco
    let extension = 25
    switch (this.punchType) {
      case "jab": extension = 30; break
      case "cross": extension = 35; break
      case "hook": extension = 25; break
      case "uppercut": extension = 20; break
    }

    // Posição da luva com extensão
    const gloveX = this.position.x + armX + Math.cos(armAngle) * extension
    const gloveY = this.position.y - 10 + 30 + armY + Math.sin(armAngle) * extension

    return this.p5.createVector(gloveX, gloveY)
  }  isPunchActive() {
    if (!this.isPunching) return false
    
    let activeStart = 5
    let activeEnd = 10
    
    switch (this.punchType) {
      case "jab":
        activeStart = 4
        activeEnd = 8
        break
      case "cross":
        activeStart = 6
        activeEnd = 12
        break
      case "hook":
        activeStart = 5
        activeEnd = 11
        break
      case "uppercut":
        activeStart = 7
        activeEnd = 13
        break
    }
    
    const isActive = this.punchFrame >= activeStart && this.punchFrame <= activeEnd
  
    
    return isActive
  }getPunchDamage() {
    let baseDamage
    
    switch (this.punchType) {
      case "jab": 
        baseDamage = this.p5.random(10, 18)
        break
      case "uppercut": 
        baseDamage = this.p5.random(22, 38)
        break
      case "hook": 
        baseDamage = this.p5.random(18, 28)
        break
      case "cross": 
        baseDamage = this.p5.random(28, 45)
        break
      default: 
        baseDamage = this.p5.random(10, 18)
    }
    
    // Fator de precisão baseado no timing do soco
    let precisionFactor = 1.0
    if (this.isPunchActive()) {
      const progress = this.punchFrame / this.maxPunchFrames
      if (progress >= 0.3 && progress <= 0.6) {
        precisionFactor = 1.3 // Sweet spot
      } else if (progress >= 0.2 && progress <= 0.7) {
        precisionFactor = 1.1 // Bom timing
      }
    }
    
    return Math.round(baseDamage * precisionFactor)
  }
}

// Classe Enemy melhorada
class Enemy extends Player {
  public attackTimer: number
  public moveTimer: number
  public targetPosition: any
  public difficulty: number
  public attackRange: number
  public aggressiveness: number
  
  constructor(p5: any, x: number, y: number, type: string, round: number) {
    super(p5, x, y, type)
    this.attackTimer = 0
    this.moveTimer = 0
    this.targetPosition = p5.createVector(x, y)
    this.difficulty = round
    this.moveSpeed = 2.0 + round * 0.15 // Ainda mais lento: 2.0 + 0.15 (era 2.5 + 0.3)
    this.health = 500 + (round - 1) * 25 // Menos vida: 25 por round (era 40)
    this.maxHealth = this.health
    this.facingRight = false
    this.attackRange = 60 + round * 2 // Menor alcance: 60 + 2 (era 70 + 3)
    this.aggressiveness = 0.3 + round * 0.05 // Muito menos agressivo: 0.3 + 0.05 (era 0.5 + 0.08)
    
    // Ajustes específicos para o oponente
    this.maxPunchFrames = 20 // Socos mais lentos: 20 frames (era 18)
  }updateAI(playerPosition: any) {
    if (this.isKnockedOut) return

    const distToPlayer = this.p5.dist(
      this.position.x, this.position.y,
      playerPosition.x, playerPosition.y
    )

    // Decrementar timers
    this.attackTimer--
    this.moveTimer--

    // Atualizar direção que está enfrentando
    this.facingRight = playerPosition.x > this.position.x    // IA de combate melhorada - MUITO MAIS AGRESSIVA
    if (distToPlayer < this.attackRange && this.attackTimer <= 0 && !this.isPunching && !this.stunned) {
      const punchType = this.choosePunchType()
      const punchSuccess = this.punch(punchType)
        // Removed debug logs for cleaner gameplay
        if (punchSuccess) {        // Timer ainda mais alto para ataques muito menos frequentes (mais fácil)
        this.attackTimer = Math.max(25, 40 - this.difficulty * 2) // Ainda mais aumentado: 25,40 com redução menor
        

          // Chance ainda mais reduzida de combo em dificuldades altas
        if (this.difficulty >= 3 && this.p5.random() < 0.2) { // Reduzido ainda mais: de 0.5 para 0.2
          this.attackTimer = Math.max(15, this.attackTimer - 2) // Redução menor: de 4 para 2

        }
        
        // Em dificuldade máxima, chance muito menor de combo
        if (this.difficulty >= 4 && this.p5.random() < 0.1) { // Reduzido ainda mais: de 0.3 para 0.1
          this.attackTimer = Math.max(10, this.attackTimer - 3) // Redução menor: de 5 para 3

        }
      }
    }else if (this.moveTimer <= 0 && !this.isPunching) {
      this.chooseMovement(playerPosition)
      this.moveTimer = this.p5.floor(this.p5.random(20, 35)) // Movimento menos frequente: 20-35 (era 10-20)
    }// Movimento melhorado - mais agressivo
    if (!this.isPunching && !this.stunned) {
      const direction = this.p5.createVector(
        this.targetPosition.x - this.position.x,
        this.targetPosition.y - this.position.y
      )
        if (direction.mag() > 3) { // Reduzido para mais responsividade
        direction.normalize()
        direction.mult(this.moveSpeed * (this.isHit ? 0.5 : 0.8)) // Ainda mais lento: 0.8 (era 1.2)
        this.position.add(direction)
        
        // Manter dentro dos limites da arena
        this.position.x = this.p5.constrain(this.position.x, 100, 700)
        this.position.y = this.p5.constrain(this.position.y, 200, 450)
      }
    }
  }  choosePunchType() {
    const rand = this.p5.random()
    const distToPlayer = this.p5.dist(
      this.position.x, this.position.y,
      this.targetPosition.x, this.targetPosition.y
    )    // Escolha de soco baseada na distância e dificuldade - MAIS EQUILIBRADO
    if (distToPlayer < 30) {      // Muito próximo - ainda mais jabs e muito menos ataques poderosos
      if (this.difficulty >= 3) {
        if (rand < 0.6) return "jab" // Ainda mais jabs: 60% (era 40%)
        else if (rand < 0.8) return "hook"
        else if (rand < 0.95) return "uppercut" // Muito menos uppercuts
        else return "cross"
      } else {
        if (rand < 0.8) return "jab" // Muito mais jabs: 80% (era 60%)
        else if (rand < 0.95) return "hook"
        else return "uppercut"
      }
    } else if (distToPlayer < 50) {      // Distância média - mais jabs, menos poder
      if (this.difficulty >= 3) {
        if (rand < 0.7) return "jab" // Muito mais jabs: 70% (era 50%)
        else if (rand < 0.85) return "cross"
        else if (rand < 0.95) return "hook"
        else return "uppercut"
      } else if (this.difficulty >= 2) {
        if (rand < 0.8) return "jab" // Ainda mais jabs: 80% (era 60%)
        else if (rand < 0.95) return "cross"
        else return "hook"
      } else {
        if (rand < 0.9) return "jab" // Quase só jabs: 90% (era 75%)
        else if (rand < 0.98) return "cross"
        else return "hook"
      }
    } else {      // Distância longa - quase exclusivamente jabs
      if (rand < 0.95) return "jab" // Quase só jabs: 95% (era 85%)
      else return "cross"
    }
  }chooseMovement(playerPosition: any) {
    const distToPlayer = this.p5.dist(
      this.position.x, this.position.y,
      playerPosition.x, playerPosition.y
    )

    if (distToPlayer > this.attackRange * 1.2) {
      // Aproxima-se do jogador de forma mais direta e agressiva
      const approachAngle = this.p5.atan2(
        playerPosition.y - this.position.y,
        playerPosition.x - this.position.x
      )
      
      // Reduzir variação angular para aproximação mais direta
      const angleVariation = this.p5.map(this.difficulty, 1, 5, this.p5.PI/6, this.p5.PI/12)
      const finalAngle = approachAngle + this.p5.random(-angleVariation, angleVariation)
      
      // Posicionar-se bem próximo para atacar
      const approachDistance = this.attackRange * 0.7
      this.targetPosition.set(
        this.p5.constrain(playerPosition.x - this.p5.cos(finalAngle) * approachDistance, 100, 700),
        this.p5.constrain(playerPosition.y - this.p5.sin(finalAngle) * approachDistance, 200, 450)
      )
    } else if (distToPlayer < this.attackRange * 0.4) {
      // Muito próximo - recuar um pouco para ter espaço para atacar
      const retreatAngle = this.p5.atan2(
        this.position.y - playerPosition.y,
        this.position.x - playerPosition.x
      )
      
      const retreatDistance = this.attackRange * 0.6
      this.targetPosition.set(
        this.p5.constrain(this.position.x + this.p5.cos(retreatAngle) * retreatDistance, 100, 700),
        this.p5.constrain(this.position.y + this.p5.sin(retreatAngle) * retreatDistance, 200, 450)
      )
    } else {
      // Distância ideal - movimento lateral agressivo
      const baseAngle = this.p5.atan2(
        playerPosition.y - this.position.y,
        playerPosition.x - this.position.x
      )
      
      // Movimento mais agressivo em circles maiores
      const circularOffset = this.difficulty >= 3 ? this.p5.random(-this.p5.PI/1.5, this.p5.PI/1.5) : this.p5.random(-this.p5.PI/2, this.p5.PI/2)
      const finalAngle = baseAngle + circularOffset
      
      const optimalDistance = this.attackRange * this.p5.random(0.6, 0.8)
      this.targetPosition.set(
        this.p5.constrain(playerPosition.x - this.p5.cos(finalAngle) * optimalDistance, 100, 700),
        this.p5.constrain(playerPosition.y - this.p5.sin(finalAngle) * optimalDistance, 200, 450)
      )
    }
  }  getPunchDamage() {
    const baseDamage = super.getPunchDamage()
    const difficultyMultiplier = 0.6 + (this.difficulty * 0.05) // Ainda mais reduzido: 0.6 + 0.05 (era 0.8 + 0.1)
    return Math.round(baseDamage * difficultyMultiplier)
  }
}

export default function GameComponentNew({
  onGameOver,
  round,
  initialScore,
}: GameComponentProps) {  const [score, setScore] = useState(initialScore)
  const [gameEnded, setGameEnded] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [roundTimer, setRoundTimer] = useState(20) 
  const [isRoundActive, setIsRoundActive] = useState(true)
  const [roundResults, setRoundResults] = useState<string[]>([])
  const [isPaused, setIsPaused] = useState(false)
  
  // Refs para sistemas do jogo
  const playerRef = useRef<Player | null>(null)
  const enemyRef = useRef<Enemy | null>(null)
  const particleSystemRef = useRef<ParticleSystem | null>(null)
  const backgroundRef = useRef<BackgroundRenderer | null>(null)
  const hudRef = useRef<HUD | null>(null)
  const setup = (p5: any, canvasParentRef: any) => {
    p5.createCanvas(800, 600).parent(canvasParentRef)
    
    // Inicializa jogadores
    playerRef.current = new Player(p5, 200, 350, "player")
    enemyRef.current = new Enemy(p5, 600, 350, "enemy", round)
      // Inicializa sistemas
    particleSystemRef.current = new ParticleSystem(p5)
    backgroundRef.current = new BackgroundRenderer(p5)
    hudRef.current = new HUD(p5)
    
    // Sinaliza início do round
    backgroundRef.current.onRoundStart()
    
    // Inicia música do jogo - áudio removido
    // audioManager.playGameMusic()
    // audioManager.playCrowd()
  }
  const handlePlayerMovement = (p5: any, player: Player) => {
    if (gameEnded || isPaused) return

    player.velocity.set(0, 0)

    if (p5.keyIsDown(p5.LEFT_ARROW) || p5.keyIsDown(65)) { // A
      player.velocity.x = -player.moveSpeed
      player.facingRight = false
    }
    if (p5.keyIsDown(p5.RIGHT_ARROW) || p5.keyIsDown(68)) { // D
      player.velocity.x = player.moveSpeed
      player.facingRight = true
    }
    if (p5.keyIsDown(p5.UP_ARROW) || p5.keyIsDown(87)) { // W
      player.velocity.y = -player.moveSpeed
    }
    if (p5.keyIsDown(p5.DOWN_ARROW) || p5.keyIsDown(83)) { // S
      player.velocity.y = player.moveSpeed
    }    player.position.add(player.velocity)
  }

  const endGame = (player: Player, enemy: Player) => {
    if (gameEnded) return
    setGameEnded(true)
    
    backgroundRef.current?.onRoundEnd()
    
    let result: string
    
    // Se alguém foi nocauteado (vida zerou), fim imediato
    if (player.health <= 0) {
      result = "enemy" // Player perdeu por nocaute
      particleSystemRef.current?.addKnockoutEffect(player.position.x, player.position.y)
      backgroundRef.current?.onKnockdown()
    } else if (enemy.health <= 0) {
      result = "player" // Player venceu por nocaute
      particleSystemRef.current?.addKnockoutEffect(enemy.position.x, enemy.position.y)
      backgroundRef.current?.onKnockdown()
      backgroundRef.current?.flashArenaLights()
    } else {
      // Determinar vencedor baseado nos rounds ganhos
      const playerRounds = roundResults.filter(r => r === "player").length
      const enemyRounds = roundResults.filter(r => r === "enemy").length
      
      if (playerRounds > enemyRounds) {
        result = "player" // Player venceu por pontos
        backgroundRef.current?.flashArenaLights()
      } else if (enemyRounds > playerRounds) {
        result = "enemy" // Player perdeu por pontos
      } else {
        // Em caso de empate nos rounds, verificar vida total
        if (player.health > enemy.health) {
          result = "player"
          backgroundRef.current?.flashArenaLights()
        } else if (enemy.health > player.health) {
          result = "enemy"
        } else {
          result = "draw" // Empate total
        }
      }
    }

    setTimeout(() => {
      onGameOver(result, score)
    }, 2000)
  }
    const draw = (p5: any) => {
    if (gameEnded) return

    const player = playerRef.current!
    const enemy = enemyRef.current!
    const particles = particleSystemRef.current!
    const background = backgroundRef.current!
    const hud = hudRef.current!    // Se o jogo estiver pausado, desenhar apenas o fundo estático
    if (isPaused) {
      // Desenhar o jogo pausado no fundo
      background.draw()
      player.draw()
      enemy.draw()
      particles.draw()
      hud.draw(
        player.health,
        enemy.health,
        score,
        currentRound,
        player.isPunching ? player.punchType : ""
      )
      
      p5.push()
      p5.fill(0, 0, 0, 150)
      p5.rect(0, 0, p5.width, p5.height)
      p5.pop()
      return
    }// Sistema de rounds - verificar se o round acabou (não quando pausado)
    if (hud.getTimeRemaining() <= 0 && isRoundActive && !isPaused) {
      setIsRoundActive(false)
      
      // Determinar vencedor do round baseado na vida
      let roundWinner = ""
      if (player.health > enemy.health) {
        roundWinner = "player"
      } else if (enemy.health > player.health) {
        roundWinner = "enemy"
      } else {
        roundWinner = "draw"
      }
      
      setRoundResults(prev => [...prev, roundWinner])
      
      // Verificar se ainda há rounds restantes
      if (currentRound < 3) {
        // Passar para o próximo round
        setTimeout(() => {
          setCurrentRound(prev => prev + 1)
          setIsRoundActive(true)
          
          // Resetar timer e curar parcialmente os lutadores
          hud.resetTimer()
          player.health = Math.min(player.maxHealth, player.health + 100)
          enemy.health = Math.min(enemy.maxHealth, enemy.health + 100)
          
          // Resetar posições
          player.position.set(200, 350)
          enemy.position.set(600, 350)
          
          // Resetar estados
          player.isKnockedOut = false
          enemy.isKnockedOut = false
          player.stunned = false
          enemy.stunned = false
          
          backgroundRef.current?.onRoundStart()
        }, 3000) // 3 segundos entre rounds
      } else {
        // Fim de todos os rounds - determinar vencedor final
        endGame(player, enemy)
        return
      }
    }

    if (player.health <= 0 || enemy.health <= 0) {
      endGame(player, enemy)
      return
    }    // Só atualiza o jogo se o round estiver ativo e não estiver pausado
    if (isRoundActive && !isPaused) {
      handlePlayerMovement(p5, player)

      player.update()
      enemy.update() // CORRIGIDO: Adicionado update do enemy
      enemy.updateAI(player.position)
      particles.update()
      background.update()
      hud.update()

      checkPunchCollisions(player, enemy, particles, hud)
    }

    background.draw()
    player.draw()
    enemy.draw()
    particles.draw()
    hud.draw(
      player.health,
      enemy.health,
      score,
      currentRound, 
      player.isPunching ? player.punchType : ""
    )

    if (!isRoundActive && currentRound < 3) {
      p5.push()
      p5.fill(0, 0, 0, 150)
      p5.rect(0, 0, p5.width, p5.height)
      
      p5.fill(255)
      p5.textAlign(p5.CENTER, p5.CENTER)
      p5.textSize(48)
      p5.text(`ROUND ${currentRound} ENDING`, p5.width / 2, p5.height / 2 - 50)
        p5.textSize(32)
      p5.text(`Next Round Starting...`, p5.width / 2, p5.height / 2 + 20)
      p5.pop()
    }
  }
  
  const checkPunchCollisions = (
    player: Player,
    enemy: Enemy,
    particles: ParticleSystem,
    hud: HUD
  ) => {   
    if (player.isPunchActive()) {
      const punchPos = player.getPunchPosition()
      const distance = player.p5.dist(
        punchPos.x, punchPos.y,
        enemy.position.x, enemy.position.y
      )

      let hitRange = 40
      switch (player.punchType) {
        case "jab": hitRange = 42; break
        case "cross": hitRange = 48; break
        case "hook": hitRange = 36; break
        case "uppercut": hitRange = 32; break
        default: hitRange = 40
      }

      if (distance < hitRange) {
        const damage = player.getPunchDamage()
        enemy.takeDamage(damage, player.punchType)
        
        particles.addHitEffect(enemy.position.x, enemy.position.y, damage)
        particles.addPunchEffect(punchPos.x, punchPos.y, player.punchType)
        
        const points = Math.floor(damage * 10)
        setScore(prev => prev + points)
        hud.addHit(damage)
        hud.addScorePopup(enemy.position.x, enemy.position.y, points, "hit")
        hud.addDamage(false)
        
        backgroundRef.current?.onPunchLanded(damage / 30) 
        if (enemy.isKnockedOut) {
          backgroundRef.current?.onKnockdown()
        }
        
        backgroundRef.current?.addCameraShake(5, 10)
        backgroundRef.current?.setCrowdExcitement(0.8)

        player.isPunching = false
      }
    }    if (enemy.isPunchActive()) {
      
      const punchPos = enemy.getPunchPosition()
      const distance = enemy.p5.dist(
        punchPos.x, punchPos.y,
        player.position.x, player.position.y
      )      
      let hitRange = 40
      switch (enemy.punchType) {
        case "jab": hitRange = 65; break // Reduzido ainda mais: de 75 para 65
        case "cross": hitRange = 70; break // Reduzido ainda mais: de 80 para 70
        case "hook": hitRange = 60; break // Reduzido ainda mais: de 70 para 60
        case "uppercut": hitRange = 55; break // Reduzido ainda mais: de 65 para 55
        default: hitRange = 60 // Reduzido ainda mais: de 70 para 60
      }
      


      if (distance < hitRange) {        const damage = enemy.getPunchDamage()
        player.takeDamage(damage, enemy.punchType)
        
        particles.addHitEffect(player.position.x, player.position.y, damage)
        particles.addPunchEffect(punchPos.x, punchPos.y, enemy.punchType)
        
        hud.addDamage(true)
        hud.resetCombo()
        
        backgroundRef.current?.onPunchLanded(damage / 30)
        if (player.isKnockedOut) {        backgroundRef.current?.onKnockdown()
        }
        
        backgroundRef.current?.addCameraShake(3, 8);        enemy.isPunching = false 
      } else {
        // Attack missed - no debug log needed
      }
    }
  }
    const keyPressed = (p5: any) => {
    const player = playerRef.current
    if (!player || gameEnded) return   
    if (p5.keyCode === 27) { 
      setIsPaused(!isPaused)
      return
    }

    if (isPaused) return

    switch (p5.key.toLowerCase()) {
      case ' ': 
        player.punch("jab")
        break
      case 'c':
        player.punch("cross")
        break
      case 'z':
        player.punch("hook")
        break
      case 'x':        player.punch("uppercut")
        break
    }
  }
  
  useEffect(() => {
    return () => {
    }
  }, [])
  const handleContinueGame = () => {
    setIsPaused(false)
  }

  const handleQuitGame = () => {
    onGameOver("quit", score)
  }

  return (
    <div className="relative">
      <Sketch
        setup={setup}
        draw={draw}
        keyPressed={keyPressed}
      />
        {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden max-w-md w-full mx-4">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Pause className="w-5 h-5 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">JOGO PAUSADO</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-gray-300 text-lg">
                  O que você gostaria de fazer?
                </p>
              </div>
              
              {/* Buttons */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleContinueGame}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-green-500/50"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    Continuar Jogo
                  </span>
                </button>
                
                <button
                  onClick={handleQuitGame}
                  className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-red-500/50"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Square className="w-5 h-5" />
                    Sair do Jogo
                  </span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-800/30 border-t border-gray-700/50">
              <p className="text-center text-gray-500 text-sm">
                Pressione <kbd className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">ESC</kbd> para pausar/continuar
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Controles:</h3>
        <p>WASD/Setas: Mover</p>        <p>SPACE: Jab | C: Cross</p>
        <p>Z: Hook | X: Uppercut</p>
        <p>ESC: Pausar</p>
      </div><div className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-4 rounded">
        <p>Round: {currentRound}/3</p>
        <p>Score: {score}</p>
      </div>
    </div>
  )
}