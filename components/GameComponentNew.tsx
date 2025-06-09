"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
// Áudio removido - import { audioManager } from "./AudioManager"
import { ParticleSystem } from "./ParticleSystem"
import { BackgroundRenderer } from "./BackgroundRenderer"
import { HUD } from "./HUD"

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
})

interface GameComponentProps {
  onGameOver: (result: string, score: number) => void
  round: number
  initialScore: number
}

// Classe do jogador melhorada
class Player {
  public position: any
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

  constructor(p5: any, x: number, y: number, type: string) {
    this.p5 = p5
    this.position = p5.createVector(x, y)
    this.velocity = p5.createVector(0, 0)
    this.size = 60
    this.health = 500
    this.maxHealth = 500
    this.type = type
    this.isPunching = false
    this.punchType = "jab"
    this.punchCooldown = 0
    this.punchFrame = 0
    this.maxPunchFrames = 15
    this.moveSpeed = 4
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

    // Cores melhoradas
    this.skinColor = type === "player" ? p5.color(255, 220, 177) : p5.color(220, 180, 140)
    this.trunkColor = type === "player" ? p5.color(255, 0, 0) : p5.color(0, 0, 255)
    this.gloveColor = type === "player" ? p5.color(255, 0, 0) : p5.color(0, 0, 255)
    this.hairColor = p5.color(30, 20, 10)
    this.eyeColor = p5.color(50, 100, 200)

    this.initializeArms()
  }

  initializeArms() {
    this.leftArm = { x: -20, y: 0, angle: -0.3 }
    this.rightArm = { x: 20, y: 0, angle: 0.3 }
  }
  update() {
    if (this.isKnockedOut) {
      this.knockoutTimer--
      if (this.knockoutTimer <= 0) {
        this.isKnockedOut = false
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
    
    if (progress <= 0.5) {
      // Fase de extensão - rápida e direta
      const extendFactor = easeInOut * 2
      if (this.facingRight) {
        this.leftArm.x = -20 + 60 * extendFactor
        this.leftArm.y = -5 * extendFactor
        this.leftArm.angle = -0.1 - 0.2 * extendFactor
        // Braço de apoio recua ligeiramente
        this.rightArm.x = 20 - 10 * extendFactor
        this.rightArm.angle = 0.3 + 0.2 * extendFactor
      } else {
        this.rightArm.x = 20 - 60 * extendFactor
        this.rightArm.y = -5 * extendFactor
        this.rightArm.angle = 0.1 + 0.2 * extendFactor
        // Braço de apoio recua ligeiramente
        this.leftArm.x = -20 + 10 * extendFactor
        this.leftArm.angle = -0.3 - 0.2 * extendFactor
      }
    } else {
      // Fase de retração - mais lenta e controlada
      const retractFactor = 1 - ((progress - 0.5) * 2)
      if (this.facingRight) {
        this.leftArm.x = -20 + 60 * retractFactor
        this.leftArm.y = -5 * retractFactor
        this.leftArm.angle = -0.1 - 0.2 * retractFactor
        this.rightArm.x = 20 - 10 * retractFactor
        this.rightArm.angle = 0.3 + 0.2 * retractFactor
      } else {
        this.rightArm.x = 20 - 60 * retractFactor
        this.rightArm.y = -5 * retractFactor
        this.rightArm.angle = 0.1 + 0.2 * retractFactor
        this.leftArm.x = -20 + 10 * retractFactor
        this.leftArm.angle = -0.3 - 0.2 * retractFactor
      }
    }
  }
  animateUppercut(progress: number) {
    // Movimento com impulso desde baixo
    const easeOut = 1 - Math.pow(1 - progress, 3)
    
    if (progress <= 0.6) {
      // Fase principal do uppercut - movimento ascendente
      const extendFactor = easeOut
      if (this.facingRight) {
        this.rightArm.x = 20 + 25 * extendFactor
        this.rightArm.y = 20 - 60 * extendFactor
        this.rightArm.angle = -1.5 * extendFactor
        // Corpo se inclina ligeiramente
        this.leftArm.x = -20 - 15 * extendFactor
        this.leftArm.y = 10 * extendFactor
        this.leftArm.angle = -0.3 + 0.4 * extendFactor
      } else {
        this.leftArm.x = -20 - 25 * extendFactor
        this.leftArm.y = 20 - 60 * extendFactor
        this.leftArm.angle = 1.5 * extendFactor
        this.rightArm.x = 20 + 15 * extendFactor
        this.rightArm.y = 10 * extendFactor
        this.rightArm.angle = 0.3 - 0.4 * extendFactor
      }
    } else {
      // Fase de recuperação
      const retractFactor = 1 - ((progress - 0.6) / 0.4)
      if (this.facingRight) {
        this.rightArm.x = 20 + 25 * retractFactor
        this.rightArm.y = 20 - 60 * retractFactor
        this.rightArm.angle = -1.5 * retractFactor
        this.leftArm.x = -20 - 15 * retractFactor
        this.leftArm.y = 10 * retractFactor
        this.leftArm.angle = -0.3 + 0.4 * retractFactor
      } else {
        this.leftArm.x = -20 - 25 * retractFactor
        this.leftArm.y = 20 - 60 * retractFactor
        this.leftArm.angle = 1.5 * retractFactor
        this.rightArm.x = 20 + 15 * retractFactor
        this.rightArm.y = 10 * retractFactor
        this.rightArm.angle = 0.3 - 0.4 * retractFactor
      }
    }
  }
  animateHook(progress: number) {
    // Movimento circular amplo característico do hook
    const easeInOut = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    
    if (progress <= 0.5) {
      // Fase de carga e início do arco
      const chargeProgress = easeInOut * 2
      if (this.facingRight) {
        this.leftArm.x = -20 - 30 * chargeProgress + 90 * chargeProgress
        this.leftArm.y = -15 * chargeProgress
        this.leftArm.angle = -0.3 - 1.2 * chargeProgress
        // Rotação do corpo
        this.rightArm.x = 20 + 20 * chargeProgress
        this.rightArm.angle = 0.3 + 0.5 * chargeProgress
      } else {
        this.rightArm.x = 20 + 30 * chargeProgress - 90 * chargeProgress
        this.rightArm.y = -15 * chargeProgress
        this.rightArm.angle = 0.3 + 1.2 * chargeProgress
        this.leftArm.x = -20 - 20 * chargeProgress
        this.leftArm.angle = -0.3 - 0.5 * chargeProgress
      }
    } else {
      // Fase de finalização do arco e retração
      const finishProgress = 1 - ((progress - 0.5) * 2)
      if (this.facingRight) {
        this.leftArm.x = -20 - 30 * finishProgress + 90 * finishProgress
        this.leftArm.y = -15 * finishProgress
        this.leftArm.angle = -0.3 - 1.2 * finishProgress
        this.rightArm.x = 20 + 20 * finishProgress
        this.rightArm.angle = 0.3 + 0.5 * finishProgress
      } else {
        this.rightArm.x = 20 + 30 * finishProgress - 90 * finishProgress
        this.rightArm.y = -15 * finishProgress
        this.rightArm.angle = 0.3 + 1.2 * finishProgress
        this.leftArm.x = -20 - 20 * finishProgress
        this.leftArm.angle = -0.3 - 0.5 * finishProgress
      }
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
  }

  drawBody() {
    const p5 = this.p5
    
    // Pernas
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.rect(-15, 30, 10, 40, 3)
    p5.rect(5, 30, 10, 40, 3)

    // Sapatos
    p5.fill(0)
    p5.rect(-18, 65, 16, 10, 3)
    p5.rect(2, 65, 16, 10, 3)

    // Shorts
    p5.fill(this.trunkColor)
    p5.rect(-20, 0, 40, 35, 5)

    // Torso
    p5.fill(this.skinColor)
    p5.ellipse(0, -10, this.size, this.size * 0.8)

    // Músculos peitorais
    p5.noStroke()
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0, 0, 0, 50), 0.3))
    p5.arc(-10, -15, 25, 20, this.p5.PI * 0.1, this.p5.PI * 0.9)
    p5.arc(10, -15, 25, 20, this.p5.PI * 0.1, this.p5.PI * 0.9)
  }

  drawHead() {
    const p5 = this.p5
    
    // Cabeça
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(0, -45, this.size * 0.7, this.size * 0.7)

    // Cabelo
    p5.fill(this.hairColor)
    p5.noStroke()
    p5.arc(0, -45, this.size * 0.7, this.size * 0.7, this.p5.PI, this.p5.TWO_PI)

    // Olhos
    this.drawEyes()

    // Boca
    this.drawMouth()

    // Orelhas
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(-21, -45, 10, 15)
    p5.ellipse(21, -45, 10, 15)
  }

  drawEyes() {
    const p5 = this.p5
    
    if (this.stunned) {
      // Olhos atordoados (X X)
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.line(-13, -48, -7, -42)
      p5.line(-7, -48, -13, -42)
      p5.line(7, -48, 13, -42)
      p5.line(13, -48, 7, -42)
    } else {
      // Olhos normais
      p5.fill(255)
      p5.noStroke()
      p5.ellipse(-10, -45, 12, 12)
      p5.ellipse(10, -45, 12, 12)

      const eyeOffset = this.facingRight ? 2 : -2
      p5.fill(this.eyeColor)
      p5.ellipse(-10 + eyeOffset, -45, 8, 8)
      p5.ellipse(10 + eyeOffset, -45, 8, 8)

      p5.fill(0)
      p5.ellipse(-10 + eyeOffset, -45, 4, 4)
      p5.ellipse(10 + eyeOffset, -45, 4, 4)

      if (this.isBlinking) {
        p5.fill(this.skinColor)
        p5.rect(-16, -45, 12, 6, 2)
        p5.rect(4, -45, 12, 6, 2)
      }
    }
  }

  drawMouth() {
    const p5 = this.p5
    
    if (this.isHit) {
      p5.fill(0)
      p5.noStroke()
      p5.ellipse(0, -35, 10, 8)
    } else if (this.isPunching) {
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.line(-7, -32, 7, -32)
    } else {
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.noFill()
      p5.arc(0, -35, 14, 5, 0, this.p5.PI)
    }
  }

  drawArms() {
    const p5 = this.p5
    
    p5.push()
    p5.translate(0, -10)

    // Braço esquerdo
    p5.push()
    p5.rotate(this.leftArm.angle)
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.rect(-12, 0, 8, 30, 3)
    
    // Luva esquerda
    p5.translate(this.leftArm.x, this.leftArm.y + 30)
    p5.fill(this.gloveColor)
    p5.ellipse(0, 0, 20, 18)
    p5.fill(255)
    p5.noStroke()
    p5.textSize(5)
    p5.textAlign(p5.CENTER)
    p5.text("BOX", 0, 2)
    p5.pop()

    // Braço direito
    p5.push()
    p5.rotate(this.rightArm.angle)
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.rect(4, 0, 8, 30, 3)
    
    // Luva direita
    p5.translate(this.rightArm.x, this.rightArm.y + 30)
    p5.fill(this.gloveColor)
    p5.ellipse(0, 0, 20, 18)
    p5.fill(255)
    p5.noStroke()
    p5.textSize(5)
    p5.textAlign(p5.CENTER)
    p5.text("BOX", 0, 2)
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
    const armX = this.facingRight ? 
      (this.punchType === "jab" ? this.leftArm.x : this.rightArm.x) :
      (this.punchType === "jab" ? this.rightArm.x : this.leftArm.x)
    
    const armY = this.facingRight ?
      (this.punchType === "jab" ? this.leftArm.y : this.rightArm.y) :
      (this.punchType === "jab" ? this.rightArm.y : this.leftArm.y)

    return this.p5.createVector(
      this.position.x + armX,
      this.position.y - 10 + 30 + armY
    )
  }

  isPunchActive() {
    return this.isPunching && this.punchFrame >= 5 && this.punchFrame <= 10
  }

  getPunchDamage() {
    switch (this.punchType) {
      case "jab": return this.p5.random(8, 15)
      case "uppercut": return this.p5.random(20, 35)
      case "hook": return this.p5.random(15, 25)
      case "cross": return this.p5.random(25, 40)
      default: return this.p5.random(8, 15)
    }
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
    this.moveSpeed = 3 + round * 0.5
    this.health = 500 + (round - 1) * 50
    this.maxHealth = this.health
    this.facingRight = false
    this.attackRange = 80
    this.aggressiveness = 0.7 + round * 0.1
  }
  updateAI(playerPosition: any) {
    if (this.isKnockedOut) return

    const distToPlayer = this.p5.dist(
      this.position.x, this.position.y,
      playerPosition.x, playerPosition.y
    )

    this.attackTimer--
    this.moveTimer--

    // IA de combate
    if (distToPlayer < this.attackRange && this.attackTimer <= 0 && !this.isPunching) {
      this.facingRight = playerPosition.x > this.position.x
      
      const punchType = this.choosePunchType()
      if (this.punch(punchType)) {
        this.attackTimer = Math.max(5, 30 - this.difficulty * 3)
      }
    } else if (this.moveTimer <= 0 && !this.isPunching) {
      this.chooseMovement(playerPosition)
      this.moveTimer = this.p5.floor(this.p5.random(20, 40))
    }

    // Movimento
    if (!this.isPunching) {
      const direction = this.p5.createVector(
        this.targetPosition.x - this.position.x,
        this.targetPosition.y - this.position.y
      )

      if (direction.mag() > 5) {
        direction.normalize()
        direction.mult(this.moveSpeed)
        this.position.add(direction)
      }
    }
  }

  choosePunchType() {
    const rand = this.p5.random()
    
    if (this.difficulty >= 3) {
      if (rand < 0.3) return "cross"
      else if (rand < 0.5) return "uppercut"
      else if (rand < 0.7) return "hook"
      else return "jab"
    } else if (this.difficulty >= 2) {
      if (rand < 0.4) return "hook"
      else if (rand < 0.6) return "cross"
      else if (rand < 0.8) return "jab"
      else return "uppercut"
    } else {
      if (rand < 0.5) return "jab"
      else if (rand < 0.8) return "hook"
      else return "cross"
    }
  }

  chooseMovement(playerPosition: any) {
    const distToPlayer = this.p5.dist(
      this.position.x, this.position.y,
      playerPosition.x, playerPosition.y
    )

    if (distToPlayer > this.attackRange * 1.5) {
      // Aproxima-se do jogador
      this.targetPosition.set(
        this.p5.constrain(playerPosition.x + this.p5.random(-30, 30), 100, 700),
        this.p5.constrain(playerPosition.y + this.p5.random(-30, 30), 200, 450)
      )
    } else {
      // Movimento circular ao redor do jogador
      const angle = this.p5.atan2(
        playerPosition.y - this.position.y,
        playerPosition.x - this.position.x
      ) + this.p5.random(-this.p5.PI/3, this.p5.PI/3)
      
      const distance = this.attackRange * 0.8
      this.targetPosition.set(
        this.p5.constrain(playerPosition.x - this.p5.cos(angle) * distance, 100, 700),
        this.p5.constrain(playerPosition.y - this.p5.sin(angle) * distance, 200, 450)
      )
    }
  }
}

export default function GameComponent({
  onGameOver,
  round,
  initialScore,
}: GameComponentProps) {
  const [score, setScore] = useState(initialScore)
  const [gameEnded, setGameEnded] = useState(false)
  
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
      // Inicia música do jogo - áudio removido
    // audioManager.playGameMusic()
    // audioManager.playCrowd()
  }

  const handlePlayerMovement = (p5: any, player: Player) => {
    if (gameEnded) return

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
    }

    player.position.add(player.velocity)
  }
  const draw = (p5: any) => {
    if (gameEnded) return

    const player = playerRef.current!
    const enemy = enemyRef.current!
    const particles = particleSystemRef.current!
    const background = backgroundRef.current!
    const hud = hudRef.current!

    // Controles de movimento do jogador
    handlePlayerMovement(p5, player)

    // Atualiza sistemas
    player.update()
    enemy.updateAI(player.position)
    particles.update()
    background.update()
    hud.update()

    // Verificar colisões de soco
    checkPunchCollisions(player, enemy, particles, hud)

    // Verificar fim de jogo
    if (player.health <= 0 || enemy.health <= 0 || hud.getTimeRemaining() <= 0) {
      endGame(player, enemy)
      return
    }

    // Desenhar tudo
    background.draw()
    player.draw()
    enemy.draw()
    particles.draw()
    hud.draw(
      player.health,
      enemy.health,
      score,
      round,
      player.isPunching ? player.punchType : ""
    )
  }

  const checkPunchCollisions = (
    player: Player,
    enemy: Enemy,
    particles: ParticleSystem,
    hud: HUD
  ) => {
    // Verifica soco do jogador no inimigo
    if (player.isPunchActive()) {
      const punchPos = player.getPunchPosition()
      const distance = player.p5.dist(
        punchPos.x, punchPos.y,
        enemy.position.x, enemy.position.y
      )

      if (distance < 40) {
        const damage = player.getPunchDamage()
        enemy.takeDamage(damage, player.punchType)
        
        particles.addHitEffect(enemy.position.x, enemy.position.y, damage)
        particles.addPunchEffect(punchPos.x, punchPos.y, player.punchType)
        
        const points = Math.floor(damage * 10)
        setScore(prev => prev + points)
        hud.addHit(damage)
        hud.addScorePopup(enemy.position.x, enemy.position.y, points, "hit")
        hud.addDamage(false)
        
        backgroundRef.current?.addCameraShake(5, 10)
        backgroundRef.current?.setCrowdExcitement(0.8)

        player.isPunching = false // Evita múltiplos hits
      }
    }

    // Verifica soco do inimigo no jogador
    if (enemy.isPunchActive()) {
      const punchPos = enemy.getPunchPosition()
      const distance = enemy.p5.dist(
        punchPos.x, punchPos.y,
        player.position.x, player.position.y
      )

      if (distance < 40) {
        const damage = enemy.getPunchDamage()
        player.takeDamage(damage, enemy.punchType)
        
        particles.addHitEffect(player.position.x, player.position.y, damage)
        particles.addPunchEffect(punchPos.x, punchPos.y, enemy.punchType)
        
        hud.addDamage(true)
        hud.resetCombo()
        
        backgroundRef.current?.addCameraShake(3, 8)

        enemy.isPunching = false // Evita múltiplos hits
      }
    }
  }

  const endGame = (player: Player, enemy: Player) => {
    if (gameEnded) return
      setGameEnded(true)
    // audioManager.stopAllMusic() - áudio removido
    // audioManager.stopCrowd() - áudio removido

    let result: string
    if (player.health <= 0) {
      result = "Você foi nocauteado!"
      particleSystemRef.current?.addKnockoutEffect(player.position.x, player.position.y)
    } else if (enemy.health <= 0) {
      result = "Vitória por nocaute!"
      particleSystemRef.current?.addKnockoutEffect(enemy.position.x, enemy.position.y)
      // audioManager.playBell() - áudio removido
    } else {
      // Decisão por pontos
      if (player.health > enemy.health) {
        result = "Vitória por pontos!"
      } else if (enemy.health > player.health) {
        result = "Derrota por pontos!"
      } else {
        result = "Empate!"
      }
    }

    setTimeout(() => {
      onGameOver(result, score)
    }, 2000)
  }
  const keyPressed = (p5: any) => {
    const player = playerRef.current
    if (!player || gameEnded) return

    switch (p5.key.toLowerCase()) {
      case 'q':
        player.punch("jab")
        break
      case 'w':
        player.punch("cross")
        break
      case 'e':
        player.punch("hook")
        break
      case 'r':
        player.punch("uppercut")
        break
    }
  }
  useEffect(() => {
    return () => {
      // audioManager.stopAllMusic() - áudio removido
      // audioManager.stopCrowd() - áudio removido
    }
  }, [])

  return (
    <div className="relative">      <Sketch
        setup={setup}
        draw={draw}
        keyPressed={keyPressed}
      />
      
      {/* Controles na tela */}
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Controles:</h3>
        <p>WASD/Setas: Mover</p>
        <p>Q: Jab | W: Cross</p>
        <p>E: Hook | R: Uppercut</p>
      </div>

      {/* HUD adicional */}
      <div className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-4 rounded">
        <p>Round: {round}</p>
        <p>Score: {score}</p>
      </div>
    </div>
  )
}
