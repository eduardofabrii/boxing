"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { ParticleSystem } from "./ParticleSystem"
import { BackgroundRenderer } from "./BackgroundRenderer"
import { HUD } from "./HUD"
import { Play, Square, Pause } from "lucide-react"
import { DifficultyLevel } from "./DifficultySelector"

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
})

interface GameComponentProps {
  onGameOver: (result: string, score: number) => void
  round: number
  initialScore: number
  difficulty: DifficultyLevel
  playerNickname: string
}

type PunchType = "jab" | "cross" | "hook" | "uppercut";

class Player {
  public position: any
  public velocity: any
  public health: number
  public maxHealth: number
  public isPunching: boolean
  public punchType: PunchType | ""
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
    this.health = 500
    this.maxHealth = 500
    this.isPunching = false
    this.punchType = ""
    this.punchCooldown = 0
    this.punchFrame = 0
    this.maxPunchFrames = 18
    this.isHit = false
    this.hitTimer = 0
    this.isKnockedOut = false
    this.knockoutTimer = 0
    this.stunned = false
    this.stunnedTimer = 0
    this.size = 40
    this.type = type
    this.facingRight = type === "player"
    this.moveSpeed = 4
    this.breathingOffset = 0
    this.blinkTimer = 60
    this.isBlinking = false
    this.sweatDrops = []

    this.skinColor = type === "player" 
      ? p5.color(255, 220, 177) 
      : p5.color(200, 160, 120)
    this.trunkColor = type === "player" 
      ? p5.color(255, 0, 0) 
      : p5.color(0, 0, 255)
    this.gloveColor = type === "player" 
      ? p5.color(200, 0, 0) 
      : p5.color(0, 0, 200)
    this.hairColor = p5.color(139, 69, 19)
    this.eyeColor = p5.color(0, 100, 200)

    this.initializeArms()
    this.loadImages()
  }

  loadImages() {
    const gloveImagePath = this.type === "player" ? "/vermelha.png" : "/azul.png"
    this.leftGloveImg = this.p5.loadImage(gloveImagePath)
    this.rightGloveImg = this.p5.loadImage(gloveImagePath)
    
    const headImagePath = this.type === "player" ? "/lutador.png" : "/lutador (1).png"
    this.headImg = this.p5.loadImage(headImagePath)
  }

  initializeArms() {
    // Posição de guarda alta mais realista desde o início
    this.leftArm = { x: -20, y: -8, angle: -0.4 }
    this.rightArm = { x: 20, y: -8, angle: 0.4 }
  }

  update() {
    if (this.isKnockedOut) {
      this.knockoutTimer--
      if (this.knockoutTimer <= 0) {
        this.isKnockedOut = false
        this.health = Math.max(1, this.health)
      }
      return
    }

    if (this.stunned) {
      this.stunnedTimer--
      if (this.stunnedTimer <= 0) {
        this.stunned = false
      }
    }

    if (this.isPunching) {
      this.punchFrame++
      this.animatePunch()

      if (this.punchFrame >= this.maxPunchFrames) {
        this.isPunching = false
        this.punchFrame = 0
        this.resetArmPosition()
      }
    }

    if (this.punchCooldown > 0) {
      this.punchCooldown--
    }

    if (this.isHit) {
      this.hitTimer--
      if (this.hitTimer <= 0) {
        this.isHit = false
      }
    }

    this.updateVisualEffects()
    this.position.x = this.p5.constrain(this.position.x, 100, 700)
    this.position.y = this.p5.constrain(this.position.y, 200, 450)
  }

  updateVisualEffects() {
    this.breathingOffset = Math.sin(this.p5.frameCount * 0.05) * 2
    
    // Mantém a posição de guarda alta quando não está atacando
    if (!this.isPunching) {
      const armBreathing = Math.sin(this.p5.frameCount * 0.03) * 2
      this.leftArm.y = -8 + armBreathing
      this.rightArm.y = -8 + armBreathing
      
      const armSway = Math.sin(this.p5.frameCount * 0.02) * 1
      this.leftArm.x = -20 + armSway
      this.rightArm.x = 20 - armSway
    }
    
    this.blinkTimer--
    if (this.blinkTimer <= 0) {
      this.isBlinking = !this.isBlinking
      this.blinkTimer = this.isBlinking ? 5 : this.p5.floor(this.p5.random(60, 180))
    }

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

  // JAB - Golpe rápido e direto vindo de cima
  animateJab(progress: number) {
    const easeInOut = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    
    const bodyRecoil = Math.sin(progress * this.p5.PI) * 3
    
    if (progress <= 0.5) {
      const extendFactor = easeInOut * 2
      if (this.facingRight) {
        this.leftArm.x = -20 + 65 * extendFactor
        this.leftArm.y = -15 + 8 * extendFactor // Começa alto e desce
        this.leftArm.angle = -0.4 - 0.2 * extendFactor // Ângulo descendente
        this.rightArm.x = 20 - 12 * extendFactor
        this.rightArm.y = -8 + 3 * extendFactor
        this.rightArm.angle = 0.4 + 0.3 * extendFactor
        this.position.x -= bodyRecoil * 0.5
      } else {
        this.rightArm.x = 20 - 65 * extendFactor
        this.rightArm.y = -15 + 8 * extendFactor
        this.rightArm.angle = 0.4 + 0.2 * extendFactor
        this.leftArm.x = -20 + 12 * extendFactor
        this.leftArm.y = -8 + 3 * extendFactor
        this.leftArm.angle = -0.4 - 0.3 * extendFactor
        this.position.x += bodyRecoil * 0.5
      }
    } else {
      const retractFactor = 1 - ((progress - 0.5) * 2)
      if (this.facingRight) {
        this.leftArm.x = -20 + 65 * retractFactor
        this.leftArm.y = -15 + 8 * retractFactor
        this.leftArm.angle = -0.4 - 0.2 * retractFactor
        this.rightArm.x = 20 - 12 * retractFactor
        this.rightArm.y = -8 + 3 * retractFactor
        this.rightArm.angle = 0.4 + 0.3 * retractFactor
        this.position.x -= bodyRecoil * 0.5
      } else {
        this.rightArm.x = 20 - 65 * retractFactor
        this.rightArm.y = -15 + 8 * retractFactor
        this.rightArm.angle = 0.4 + 0.2 * retractFactor
        this.leftArm.x = -20 + 12 * retractFactor
        this.leftArm.y = -8 + 3 * retractFactor
        this.leftArm.angle = -0.4 - 0.3 * retractFactor
        this.position.x += bodyRecoil * 0.5
      }
    }

    if (progress > 0.3 && progress < 0.7) {
      this.position.y += Math.sin(progress * this.p5.PI * 3) * 1
    }
  }

  // UPPERCUT - Golpe ascendente explosivo
  animateUppercut(progress: number) {
    const easeOut = 1 - Math.pow(1 - progress, 4)
    const bodyDip = Math.sin(progress * this.p5.PI) * 8
    
    if (progress <= 0.6) {
      const extendFactor = easeOut
      if (this.facingRight) {
        this.rightArm.x = 20 + 30 * extendFactor
        this.rightArm.y = 25 - 70 * extendFactor
        this.rightArm.angle = -1.8 * extendFactor
        this.leftArm.x = -20 - 18 * extendFactor
        this.leftArm.y = 12 * extendFactor
        this.leftArm.angle = -0.3 + 0.6 * extendFactor
        
        this.position.y += bodyDip
        if (progress > 0.3) {
          this.position.y -= bodyDip * 1.5
        }
      } else {
        this.leftArm.x = -20 - 30 * extendFactor
        this.leftArm.y = 25 - 70 * extendFactor
        this.leftArm.angle = 1.8 * extendFactor
        this.rightArm.x = 20 + 18 * extendFactor
        this.rightArm.y = 12 * extendFactor
        this.rightArm.angle = 0.3 - 0.6 * extendFactor
        
        this.position.y += bodyDip
        if (progress > 0.3) {
          this.position.y -= bodyDip * 1.5
        }
      }
    } else {
      const retractFactor = 1 - ((progress - 0.6) / 0.4)
      if (this.facingRight) {
        this.rightArm.x = 20 + 30 * retractFactor
        this.rightArm.y = 25 - 70 * retractFactor
        this.rightArm.angle = -1.8 * retractFactor
        this.leftArm.x = -20 - 18 * retractFactor
        this.leftArm.y = 12 * retractFactor
        this.leftArm.angle = -0.3 + 0.6 * retractFactor
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

    if (progress > 0.4 && progress < 0.7) {
      const groundShake = Math.sin(progress * this.p5.PI * 8) * 1
      this.position.x += groundShake
    }
  }

  // HOOK - Movimento circular amplo vindo de cima
  animateHook(progress: number) {
    const easeInOut = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    
    const bodyRotation = Math.sin(progress * this.p5.PI) * 8
    
    if (progress <= 0.5) {
      const chargeProgress = easeInOut * 2
      if (this.facingRight) {
        this.leftArm.x = -20 - 35 * chargeProgress + 100 * chargeProgress
        this.leftArm.y = -25 + 15 * chargeProgress // Começa muito alto
        this.leftArm.angle = -0.8 - 1.0 * chargeProgress
        this.rightArm.x = 20 + 25 * chargeProgress
        this.rightArm.y = -10 + 5 * chargeProgress
        this.rightArm.angle = 0.4 + 0.6 * chargeProgress
        
        this.position.x -= bodyRotation * 0.6
        this.position.y += Math.abs(bodyRotation) * 0.2
      } else {
        this.rightArm.x = 20 + 35 * chargeProgress - 100 * chargeProgress
        this.rightArm.y = -25 + 15 * chargeProgress
        this.rightArm.angle = 0.8 + 1.0 * chargeProgress
        this.leftArm.x = -20 - 25 * chargeProgress
        this.leftArm.y = -10 + 5 * chargeProgress
        this.leftArm.angle = -0.4 - 0.6 * chargeProgress
        
        this.position.x += bodyRotation * 0.6
        this.position.y += Math.abs(bodyRotation) * 0.2
      }
    } else {
      const finishProgress = 1 - ((progress - 0.5) * 2)
      if (this.facingRight) {
        this.leftArm.x = -20 - 35 * finishProgress + 100 * finishProgress
        this.leftArm.y = -25 + 15 * finishProgress
        this.leftArm.angle = -0.8 - 1.0 * finishProgress
        this.rightArm.x = 20 + 25 * finishProgress
        this.rightArm.y = -10 + 5 * finishProgress
        this.rightArm.angle = 0.4 + 0.6 * finishProgress
        
        this.position.x -= bodyRotation * 0.6
        this.position.y += Math.abs(bodyRotation) * 0.2
      } else {
        this.rightArm.x = 20 + 35 * finishProgress - 100 * finishProgress
        this.rightArm.y = -25 + 15 * finishProgress
        this.rightArm.angle = 0.8 + 1.0 * finishProgress
        this.leftArm.x = -20 - 25 * finishProgress
        this.leftArm.y = -10 + 5 * finishProgress
        this.leftArm.angle = -0.4 - 0.6 * finishProgress
        
        this.position.x += bodyRotation * 0.6
        this.position.y += Math.abs(bodyRotation) * 0.2
      }
    }
    
    if (progress > 0.2 && progress < 0.8) {
      const footWork = Math.sin((progress - 0.2) * this.p5.PI * 2) * 2
      this.position.y += footWork
    }
  }

  // CROSS - Golpe de poder cruzado vindo de cima
  animateCross(progress: number) {
    const easeOut = 1 - Math.pow(1 - progress, 3)
    const easeIn = Math.pow(progress, 2)
    
    const extendFactor = progress < 0.3 ? 
      easeIn * (progress / 0.3) : 
      easeOut * Math.max(0, (1 - progress) / 0.7)
    
    const bodyRotation = Math.sin(progress * Math.PI) * 0.15
    
    if (this.facingRight) {
      this.rightArm.x = 20 + 85 * extendFactor
      this.rightArm.y = -20 + 15 * extendFactor // Começa bem alto
      this.rightArm.angle = -0.5 - 0.8 * extendFactor
      
      this.leftArm.x = -20 - 15 * extendFactor
      this.leftArm.y = -8 + 8 * extendFactor
      this.leftArm.angle = -0.4 + 0.2 * extendFactor
    } else {
      this.leftArm.x = -20 - 85 * extendFactor
      this.leftArm.y = -20 + 15 * extendFactor
      this.leftArm.angle = 0.5 + 0.8 * extendFactor
      
      this.rightArm.x = 20 + 15 * extendFactor
      this.rightArm.y = -8 + 8 * extendFactor
      this.rightArm.angle = 0.4 - 0.2 * extendFactor
    }
    
    this.position.x += bodyRotation * (this.facingRight ? 1 : -1)
  }

  resetArmPosition() {
    // Volta para a posição de guarda alta
    this.leftArm = { x: -20, y: -8, angle: -0.4 }
    this.rightArm = { x: 20, y: -8, angle: 0.4 }
  }

  draw() {
    const p5 = this.p5

    if (this.isKnockedOut) {
      this.drawKnockedOut()
      return
    }

    p5.push()
    p5.translate(this.position.x, this.position.y)

    if (this.isHit || this.stunned) {
      p5.translate(p5.random(-3, 3), p5.random(-3, 3))
    }

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
    
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.rect(-15, 30, 10, 40, 3)
    p5.rect(5, 30, 10, 40, 3)

    p5.fill(0)
    p5.rect(-18, 65, 16, 10, 3)
    p5.rect(2, 65, 16, 10, 3)

    p5.fill(this.trunkColor)
    p5.rect(-20, 0, 40, 35, 5)

    p5.fill(this.skinColor)
    p5.ellipse(0, -10, this.size, this.size * 0.8)

    p5.noStroke()
    p5.fill(p5.lerpColor(this.skinColor, p5.color(255), 0.2))
    p5.ellipse(-8, -18, 12, 8)
    p5.ellipse(8, -18, 12, 8)
    
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0), 0.1))
    p5.ellipse(0, -5, 16, 10)
    
    if (this.isPunching || this.health < this.maxHealth * 0.3) {
      p5.stroke(p5.lerpColor(this.skinColor, p5.color(0, 100, 200), 0.3))
      p5.strokeWeight(0.8)
      p5.line(-20, -15, -15, -8) 
      p5.line(15, -8, 20, -15)   
      p5.line(-5, 5, 5, 8)       
    }
  }

  drawHead() {
    const p5 = this.p5
    
    if (this.headImg && this.headImg.width > 0) {
      this.addHeadEffects()
      
      p5.push()
      p5.translate(0, -50 + this.breathingOffset)
      if (!this.facingRight) {
        p5.scale(-1, 1)
      }
      p5.imageMode(p5.CENTER)
      p5.image(this.headImg, 0, 0, this.size + 5, this.size + 5)
      p5.pop()
    } else {
      this.drawProceduralHead()
    }
  }

  addHeadEffects() {
    const p5 = this.p5
    
    if (this.isHit) {
      p5.fill(255, 0, 0, 100)
      p5.noStroke()
      p5.ellipse(0, -50 + this.breathingOffset, this.size + 10, this.size + 10)
    }
    
    if (this.stunned) {
      for (let i = 0; i < 3; i++) {
        const angle = (p5.TWO_PI * i) / 3 + p5.frameCount * 0.1
        const x = 25 * p5.cos(angle)
        const y = -70 + 25 * p5.sin(angle) + this.breathingOffset
        
        p5.fill(255, 255, 0)
        p5.noStroke()
        p5.push()
        p5.translate(x, y)
        p5.rotate(p5.frameCount * 0.2)
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
  }

  drawProceduralHead() {
    const p5 = this.p5
    
    p5.push()
    p5.translate(0, -50 + this.breathingOffset)
    
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(0, 0, this.size, this.size)
    
    p5.fill(this.hairColor)
    p5.noStroke()
    p5.arc(0, 0, this.size, this.size * 0.7, p5.PI, p5.TWO_PI)
    
    this.drawEyes()
    this.drawMouth()
    
    p5.pop()
  }

  drawEyes() {
    const p5 = this.p5
    
    if (this.isBlinking) {
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.line(-8, -5, -3, -5)
      p5.line(3, -5, 8, -5)
    } else {
      p5.fill(255)
      p5.stroke(0)
      p5.strokeWeight(1)
      p5.ellipse(-6, -5, 8, 6)
      p5.ellipse(6, -5, 8, 6)
      
      p5.fill(this.eyeColor)
      p5.noStroke()
      p5.ellipse(-6, -5, 4, 4)
      p5.ellipse(6, -5, 4, 4)
      
      p5.fill(0)
      p5.ellipse(-6, -5, 2, 2)
      p5.ellipse(6, -5, 2, 2)
      
      p5.fill(255)
      p5.ellipse(-5, -6, 1, 1)
      p5.ellipse(7, -6, 1, 1)
    }
  }

  drawMouth() {
    const p5 = this.p5
    
    if (this.isHit) {
      p5.fill(0)
      p5.noStroke()
      p5.ellipse(0, 8, 10, 8)
    } else if (this.isPunching) {
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.line(-7, 5, 7, 5)
    } else {
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.noFill()
      p5.arc(0, 8, 14, 5, 0, p5.PI)
    }
  }

  drawArms() {
    const p5 = this.p5
    
    p5.push()
    p5.translate(0, -10)

    // Braço esquerdo
    p5.push()
    p5.translate(this.leftArm.x, this.leftArm.y)
    p5.rotate(this.leftArm.angle)
    
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(-6, 15, 10, 28)
    
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0, 0, 0, 40), 0.3))
    p5.ellipse(-8, -5, 14, 20)
    
    p5.fill(p5.lerpColor(this.skinColor, p5.color(255), 0.1))
    p5.noStroke()
    p5.ellipse(-10, -8, 8, 12)
    
    // Luva esquerda
    p5.push()
    p5.translate(0, 30)
    if (this.leftGloveImg && this.leftGloveImg.width > 0) {
      if (!this.facingRight) {
        p5.scale(-1, 1)
      }
      p5.imageMode(p5.CENTER)
      p5.image(this.leftGloveImg, 0, 0, 25, 25)
    } else {
      p5.fill(this.gloveColor)
      p5.stroke(p5.lerpColor(this.gloveColor, p5.color(0), 0.3))
      p5.strokeWeight(1.5)
      p5.ellipse(0, 0, 22, 20)
      
      p5.fill(p5.lerpColor(this.gloveColor, p5.color(255), 0.3))
      p5.noStroke()
      p5.ellipse(-3, -3, 8, 6)
    }
    p5.pop()
    p5.pop()

    // Braço direito
    p5.push()
    p5.translate(this.rightArm.x, this.rightArm.y)
    p5.rotate(this.rightArm.angle)
    
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(6, 15, 10, 28)
    
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0, 0, 0, 40), 0.3))
    p5.ellipse(8, -5, 14, 20)
    
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
      p5.fill(this.gloveColor)
      p5.stroke(p5.lerpColor(this.gloveColor, p5.color(0), 0.3))
      p5.strokeWeight(1.5)
      p5.ellipse(0, 0, 22, 20)
      
      p5.fill(p5.lerpColor(this.gloveColor, p5.color(255), 0.3))
      p5.noStroke()
      p5.ellipse(3, -3, 8, 6)
    }
    p5.pop()
    p5.pop()

    p5.pop()
  }

  drawSweat() {
    const p5 = this.p5
    
    for (const drop of this.sweatDrops) {
      p5.fill(135, 206, 235, 200)
      p5.noStroke()
      p5.ellipse(
        this.position.x + drop.x,
        this.position.y + drop.y,
        drop.size,
        drop.size
      )
    }
  }

  drawShadow() {
    const p5 = this.p5
    
    p5.fill(0, 0, 0, 50)
    p5.noStroke()
    p5.ellipse(this.position.x, this.position.y + 80, this.size * 1.5, this.size * 0.3)
  }

  drawKnockedOut() {
    const p5 = this.p5
    
    p5.push()
    p5.translate(this.position.x, this.position.y + 40)

    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(0, 0, this.size * 1.5, this.size * 0.8)

    p5.ellipse(-30, 0, this.size * 0.7, this.size * 0.7)

    p5.noFill()
    p5.stroke(0)
    p5.strokeWeight(2)
    for (let i = 0; i < 3; i++) {
      p5.circle(-40 + i * 2, -5 + i, 8 - i * 2)
      p5.circle(-20 + i * 2, -5 + i, 8 - i * 2)
    }

    for (let i = 0; i < 5; i++) {
      const angle = (p5.TWO_PI * i) / 5 + p5.frameCount * 0.05
      const x = -30 + 50 * p5.cos(angle)
      const y = -20 + 30 * p5.sin(angle)

      p5.fill(255, 255, 0)
      p5.noStroke()
      p5.push()
      p5.translate(x, y)
      p5.rotate(p5.frameCount * 0.1)
      
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

  punch(type: PunchType = "jab") {
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
          break
      }

      return true
    }
    return false
  }

  takeDamage(amount: number, punchType: string) {
    this.health -= amount
    this.isHit = true
    this.hitTimer = 15

    if (this.health <= 0) {
      this.health = 0
      this.isKnockedOut = true
      this.knockoutTimer = 180
    } else if (this.health < this.maxHealth * 0.3) {
      this.stunned = true
      this.stunnedTimer = 30
    }
  }

  getHealth() {
    return this.health
  }

  getPunchPosition() {
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
    
    const reach = 25
    const punchX = this.position.x + armX + reach * this.p5.cos(armAngle)
    const punchY = this.position.y - 10 + armY + 30 + reach * this.p5.sin(armAngle)
    
    return this.p5.createVector(punchX, punchY)
  }

  isPunchActive() {
    if (!this.isPunching) return false
    
    const activeStart = 5
    const activeEnd = 12
    const isActive = this.punchFrame >= activeStart && this.punchFrame <= activeEnd
    
    return isActive
  }

  getPunchDamage(): number {
    const baseDamage: Record<PunchType, number> = {
      jab: 15,
      cross: 25,
      hook: 20,
      uppercut: 30
    }

    return this.punchType && baseDamage[this.punchType as PunchType] ? baseDamage[this.punchType as PunchType] : 15
  }
  }


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
    this.moveSpeed = 2.0 + round * 0.15
    this.health = 500
    this.maxHealth = 500
    this.attackRange = 60 + round * 2
    this.aggressiveness = 0.3 + round * 0.05
    this.maxPunchFrames = 20
  }
  update(player?: Player) {
    super.update()
    if (!this.isKnockedOut && !this.stunned && player) {
      this.updateAI(player)
    }
  }updateAI(player: Player) {
    this.attackTimer--
    this.moveTimer--

    if (this.attackTimer <= 0) {
      this.attemptAttack(player)
    }

    if (this.moveTimer <= 0) {
      this.chooseMovement()
      this.moveTimer = this.p5.floor(this.p5.random(20, 35))
    }

    this.moveTowardsTarget()
  }

  attemptAttack(player: Player) {

    const distToPlayer = this.p5.dist(
      this.position.x, this.position.y,
      player.position.x, player.position.y
    )

    if (distToPlayer <= this.attackRange && !this.isPunching && !this.stunned) {
      const punchType = this.choosePunchType(distToPlayer)
      const punchSuccess = this.punch(punchType)
      
      if (punchSuccess) {
        this.attackTimer = Math.max(25, 40 - this.difficulty * 2)
        
        if (this.difficulty >= 3 && this.p5.random() < 0.2) {
          this.attackTimer *= 0.7
        }
        
        if (this.difficulty >= 5 && this.p5.random() < 0.1) {
          this.attackTimer *= 0.6
        }
      }
    }
  }

  choosePunchType(distance: number) {
    const rand = this.p5.random()
    
    if (distance < 70) {
      return rand < 0.8 ? "jab" : (rand < 0.9 ? "hook" : "uppercut")
    } else if (distance < 120) {
      return rand < 0.9 ? "jab" : "cross"
    } else {
      return rand < 0.95 ? "jab" : "cross"
    }
  }

  chooseMovement() {
    const moveDistance = this.p5.random(30, 80)
    const angle = this.p5.random(0, this.p5.TWO_PI)
    
    this.targetPosition.x = this.position.x + moveDistance * this.p5.cos(angle)
    this.targetPosition.y = this.position.y + moveDistance * this.p5.sin(angle)
    
    this.targetPosition.x = this.p5.constrain(this.targetPosition.x, 150, 650)
    this.targetPosition.y = this.p5.constrain(this.targetPosition.y, 200, 450)
  }

  moveTowardsTarget() {
    const distance = this.p5.dist(
      this.position.x, this.position.y,
      this.targetPosition.x, this.targetPosition.y
    )

    if (distance > 10) {
      const direction = this.p5.createVector(
        this.targetPosition.x - this.position.x,
        this.targetPosition.y - this.position.y
      )
      direction.normalize()
      direction.mult(this.moveSpeed * 0.8)

      this.position.add(direction)
    }
  }

  getPunchDamage() {
    const baseDamage = super.getPunchDamage()
    const difficultyMultiplier = 0.6 + (this.difficulty * 0.05)
    return Math.floor(baseDamage * difficultyMultiplier)
  }
}

export default function GameComponentNew({
  onGameOver,
  round,
  initialScore,
  difficulty,
  playerNickname,
}: GameComponentProps) {  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(initialScore)
  const [gameEnded, setGameEnded] = useState(false)// Calcular modificadores baseados na dificuldade
  const getDifficultyModifiers = () => {
    switch (difficulty) {
      case "easy":
        return {
          playerDamageReduction: 0.7, // Jogador recebe 30% menos dano
          enemySpeedMultiplier: 0.7,
          enemyDamageMultiplier: 0.7,
          enemyAggressionMultiplier: 0.8,
          scoreMultiplier: 1.0,
          difficultyLevel: 1
        }
      case "medium":
        return {
          playerDamageReduction: 1.0, // Dano normal
          enemySpeedMultiplier: 1.0,
          enemyDamageMultiplier: 1.0,
          enemyAggressionMultiplier: 1.0,
          scoreMultiplier: 1.5,
          difficultyLevel: 2
        }
      case "hard":
        return {
          playerDamageReduction: 1.3, // Jogador recebe 30% mais dano
          enemySpeedMultiplier: 1.3,
          enemyDamageMultiplier: 1.3,
          enemyAggressionMultiplier: 1.2,
          scoreMultiplier: 2.0,
          difficultyLevel: 3
        }
      case "legendary":
        return {
          playerDamageReduction: 1.6, // Jogador recebe 60% mais dano
          enemySpeedMultiplier: 1.6,
          enemyDamageMultiplier: 1.6,
          enemyAggressionMultiplier: 1.5,
          scoreMultiplier: 3.0,
          difficultyLevel: 4
        }
      default:
        return {
          playerDamageReduction: 1.0,
          enemySpeedMultiplier: 1.0,
          enemyDamageMultiplier: 1.0,
          enemyAggressionMultiplier: 1.0,
          scoreMultiplier: 1.5,
          difficultyLevel: 2      }
    }
  }
  
  // Armazenar modificadores de dificuldade
  const difficultyModifiersRef = useRef(getDifficultyModifiers())
  
  const playerRef = useRef<Player | null>(null)
  const enemyRef = useRef<Enemy | null>(null)
  const particlesRef = useRef<ParticleSystem | null>(null)
  const backgroundRef = useRef<BackgroundRenderer | null>(null)
  const hudRef = useRef<HUD | null>(null)
  
  const setup = (p5: any, canvasParentRef: any) => {
    p5.createCanvas(800, 600).parent(canvasParentRef)
    
    const difficultyMods = getDifficultyModifiers()
      playerRef.current = new Player(p5, 200, 350, "player")
    enemyRef.current = new Enemy(p5, 600, 350, "enemy", round)
    
    // Garantir que ambos tenham vida máxima de 500
    if (playerRef.current) {
      playerRef.current.maxHealth = 500
      playerRef.current.health = 500
    }
    
    if (enemyRef.current) {
      enemyRef.current.maxHealth = 500
      enemyRef.current.health = 500
      enemyRef.current.moveSpeed = enemyRef.current.moveSpeed * difficultyMods.enemySpeedMultiplier
      enemyRef.current.difficulty = difficultyMods.difficultyLevel
      // Aplicar modificador de agressividade (será usado na IA)
      enemyRef.current.aggressiveness = enemyRef.current.aggressiveness * difficultyMods.enemyAggressionMultiplier
    }
    
    particlesRef.current = new ParticleSystem(p5)
    backgroundRef.current = new BackgroundRenderer(p5)
    hudRef.current = new HUD(p5)
    
  
    hudRef.current.resetTimer()
    
    setIsPlaying(true)
  }
    const draw = (p5: any) => {
    if (!isPlaying || isPaused) return

    const player = playerRef.current
    if (player && !gameEnded && !isPaused) {
      // Movimento com WASD + Setas do teclado
      if (p5.keyIsDown(65) || p5.keyIsDown(p5.LEFT_ARROW)) { // A ou ←
        player.position.x -= player.moveSpeed
        player.facingRight = false
      }
      if (p5.keyIsDown(68) || p5.keyIsDown(p5.RIGHT_ARROW)) { // D ou →
        player.position.x += player.moveSpeed
        player.facingRight = true
      }
      if (p5.keyIsDown(87) || p5.keyIsDown(p5.UP_ARROW)) { // W ou ↑
        player.position.y -= player.moveSpeed
      }
      if (p5.keyIsDown(83) || p5.keyIsDown(p5.DOWN_ARROW)) { // S ou ↓
        player.position.y += player.moveSpeed
      }
    }

    const enemy = enemyRef.current
    const particles = particlesRef.current
    const background = backgroundRef.current
    const hud = hudRef.current

    if (!player || !enemy || !particles || !background || !hud) return    p5.background(220)
    background.update()
    background.draw()

    player.update()
    enemy.update(player)
    
    // Atualizar sistemas
    particles.update()
    hud.update()
    
    // Sincronizar pausa do HUD
    if (isPaused) {
      hud.pauseTimer()
    } else {
      hud.resumeTimer()
    }

    if (gameEnded) {      player.draw()
      enemy.draw()
      particles.draw()
      hud.draw(player.health, enemy.health, score, round, "", playerNickname)
      return
    }

    player.draw()
    enemy.draw()

    if (player.isPunchActive()) {
      const punchPos = player.getPunchPosition()
      const distance = p5.dist(
        punchPos.x, punchPos.y,
        enemy.position.x, enemy.position.y
      )

      let hitRange = 40
      switch (player.punchType) {
        case "jab": hitRange = 65; break
        case "cross": hitRange = 70; break
        case "hook": hitRange = 60; break
        case "uppercut": hitRange = 55; break
        default: hitRange = 60
      }

      if (distance < hitRange && !enemy.isHit) {        const damage = player.getPunchDamage()
        enemy.takeDamage(damage, player.punchType)
        
        particles.addHitEffect(enemy.position.x, enemy.position.y, damage)
        particles.addPunchEffect(punchPos.x, punchPos.y, player.punchType)
        
        hud.addHit(damage)
        const difficultyMods = getDifficultyModifiers()
        setScore(prev => prev + Math.floor(damage * 10 * difficultyMods.scoreMultiplier))

        backgroundRef.current?.onPunchLanded(damage / 30)
        if (enemy.isKnockedOut) {
          backgroundRef.current?.onKnockdown()
        }

        backgroundRef.current?.addCameraShake(5, 10)
        backgroundRef.current?.setCrowdExcitement(0.8)

        player.isPunching = false
      }
    }

    // Verificação de colisões do inimigo
    if (enemy.isPunchActive()) {      
      const punchPos = enemy.getPunchPosition()
      const distance = enemy.p5.dist(
        punchPos.x, punchPos.y,
        player.position.x, player.position.y
      )      
      let hitRange = 40
      switch (enemy.punchType) {
        case "jab": hitRange = 65; break
        case "cross": hitRange = 70; break
        case "hook": hitRange = 60; break
        case "uppercut": hitRange = 55; break
        default: hitRange = 60
      }      if (distance < hitRange && !player.isHit) {
        const baseDamage = enemy.getPunchDamage()
        const adjustedDamage = Math.floor(baseDamage * difficultyModifiersRef.current.playerDamageReduction)
        player.takeDamage(adjustedDamage, enemy.punchType)
        
        particles.addHitEffect(player.position.x, player.position.y, adjustedDamage)
        particles.addPunchEffect(punchPos.x, punchPos.y, enemy.punchType)
          hud.addDamage(true)
        hud.resetCombo()
        
        backgroundRef.current?.onPunchLanded(adjustedDamage / 30)
        if (player.isKnockedOut) {
          backgroundRef.current?.onKnockdown()
        }
        
        backgroundRef.current?.addCameraShake(3, 8);
        enemy.isPunching = false 
      } else {
      }
    }    particles.draw()
    hud.draw(player.health, enemy.health, score, round, player.isPunching ? player.punchType : "", playerNickname)

    // Verificação de fim de jogo - CORRIGIDA
    if (player.health <= 0 && !gameEnded) {
      setGameEnded(true)
      setTimeout(() => onGameOver("enemy", score), 2000) // Player perdeu = "enemy" venceu
    } else if (enemy.health <= 0 && !gameEnded) {
      setGameEnded(true)
      setTimeout(() => onGameOver("player", score), 2000) // Player venceu = "player"
    } else if (hud.getTimeRemaining() <= 0 && !gameEnded) {
      // Fim por tempo - quem tem mais vida vence
      setGameEnded(true)
      const result = player.health > enemy.health ? "player" : 
                    enemy.health > player.health ? "enemy" : "draw"
      setTimeout(() => onGameOver(result, score), 2000)
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

    // Verifica se é SPACE (código 32)
    if (p5.keyCode === 32) {
      player.punch("jab")
      return
    }

    switch (p5.key.toLowerCase()) {
      case 'x':
        player.punch("uppercut")
        break
      case 'z':
        player.punch("hook")
        break
      case 'c':
        player.punch("cross")
        break
    }
  }
  const handleContinueGame = () => {
    setIsPaused(false)
  }

  const handleQuitGame = () => {
    setGameEnded(true)
    onGameOver("quit", score)
  }

  return (
    <div className="relative w-full h-full">
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

            <div className="p-4 bg-gray-800/30 border-t border-gray-700/50">
              <p className="text-center text-gray-500 text-sm">
                Pressione <kbd className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs font-mono">ESC</kbd> para pausar/continuar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
