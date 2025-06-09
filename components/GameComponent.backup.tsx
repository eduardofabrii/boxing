"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
// Áudio removido - import { AudioManager, audioManager } from "./AudioManager"
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

class Player {
  constructor(p5, x, y, type) {
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
    this.isMovingUp = false
    this.isMovingDown = false
    this.isMovingLeft = false
    this.isMovingRight = false
    this.moveSpeed = 3
    this.isHit = false
    this.hitTimer = 0
    this.isKnockedOut = false
    this.knockoutTimer = 0
    this.stunned = false
    this.stunnedTimer = 0

    // Cores do boxeador - Melhoradas
    this.skinColor = type === "player" ? p5.color(255, 220, 177) : p5.color(220, 180, 140)
    this.trunkColor = this.type === "player" ? p5.color(255, 0, 0) : p5.color(0, 0, 255)
    this.gloveColor = this.type === "player" ? p5.color(255, 0, 0) : p5.color(0, 0, 255)
    this.hairColor = p5.color(30, 20, 10)
    this.eyeColor = p5.color(50, 100, 200)

    // Características físicas
    this.hasMustache = type === "enemy" && p5.random() > 0.5
    this.hasBeard = type === "enemy" && p5.random() > 0.7
    this.hairStyle = p5.floor(p5.random(0, 3)) // 0: normal, 1: moicano, 2: careca
    this.muscleTone = type === "player" ? 1.0 : 1.1 // Inimigo um pouco mais musculoso

    // Detalhes do shorts
    this.shortsPattern = p5.floor(p5.random(0, 3)) // 0: normal, 1: listrado, 2: com estrela
    this.shortsSecondaryColor = type === "player" ? p5.color(255, 255, 255) : p5.color(255, 255, 0)

    // Posição dos braços e luvas
    this.leftArm = {
      x: this.type === "player" ? -20 : 20,
      y: 0,
      angle: this.type === "player" ? -0.3 : 0.3,
    }

    this.rightArm = {
      x: this.type === "player" ? 20 : -20,
      y: 0,
      angle: this.type === "player" ? 0.3 : -0.3,
    }

    // Direção que o boxeador está olhando
    this.facingRight = this.type === "player"

    // Estatísticas de combate
    this.totalDamageTaken = 0
    this.consecutiveHits = 0

    // Efeitos visuais
    this.shadowOffset = 0
    this.glowIntensity = 0
    this.breathingOffset = 0
    this.blinkTimer = p5.floor(p5.random(60, 180))
    this.isBlinking = false
    this.sweatDrops = []
  }

  update() {
    const p5 = this.p5

    // Se está nocauteado, não pode se mover
    if (this.isKnockedOut) {
      this.knockoutTimer--
      if (this.knockoutTimer <= 0) {
        this.isKnockedOut = false
      }
      return
    }

    // Se está atordoado, movimento reduzido
    if (this.stunned) {
      this.stunnedTimer--
      if (this.stunnedTimer <= 0) {
        this.stunned = false
      }
    }

    // Movement
    this.velocity.set(0, 0)
    const currentSpeed = this.stunned ? this.moveSpeed * 0.5 : this.moveSpeed

    if (this.isMovingUp) this.velocity.y -= currentSpeed
    if (this.isMovingDown) this.velocity.y += currentSpeed
    if (this.isMovingLeft) {
      this.velocity.x -= currentSpeed
      if (this.type === "player") this.facingRight = false
    }
    if (this.isMovingRight) {
      this.velocity.x += currentSpeed
      if (this.type === "player") this.facingRight = true
    }

    // Apply velocity
    this.position.add(this.velocity)

    // Constrain to canvas
    this.position.x = this.p5.constrain(this.position.x, 50, 750)
    this.position.y = this.p5.constrain(this.position.y, 150, 500)

    // Update punch cooldown
    if (this.punchCooldown > 0) {
      this.punchCooldown--
    }

    // Update punch animation
    if (this.isPunching) {
      this.punchFrame++
      this.animatePunch()

      // Termina o soco
      if (this.punchFrame >= this.maxPunchFrames) {
        this.isPunching = false
        this.punchFrame = 0
        this.resetArmPosition()
      }
    }

    // Update hit animation
    if (this.isHit) {
      this.hitTimer--
      if (this.hitTimer <= 0) {
        this.isHit = false
      }
    }

    // Atualiza a posição dos braços em repouso (quando não está socando)
    if (!this.isPunching) {
      this.updateIdleArms()
    }

    // Atualiza efeitos visuais
    this.shadowOffset = Math.sin(this.p5.frameCount * 0.1) * 3
    this.glowIntensity = this.isPunching ? 255 : Math.sin(this.p5.frameCount * 0.05) * 50 + 100
    this.breathingOffset = Math.sin(this.p5.frameCount * 0.05) * 2

    // Atualiza piscada
    this.blinkTimer--
    if (this.blinkTimer <= 0) {
      this.isBlinking = !this.isBlinking
      this.blinkTimer = this.isBlinking ? 5 : p5.floor(p5.random(60, 180))
    }

    // Adiciona gotas de suor quando está socando ou foi atingido
    if ((this.isPunching || this.isHit) && p5.random() < 0.2) {
      this.sweatDrops.push({
        x: p5.random(-20, 20),
        y: p5.random(-50, -30),
        vx: p5.random(-1, 1),
        vy: p5.random(1, 3),
        size: p5.random(2, 4),
        life: p5.floor(p5.random(20, 40)),
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
    const punchProgress = this.punchFrame / this.maxPunchFrames

    switch (this.punchType) {
      case "jab":
        this.animateJab(punchProgress)
        break
      case "uppercut":
        this.animateUppercut(punchProgress)
        break
      case "hook":
        this.animateHook(punchProgress)
        break
      case "cross":
        this.animateCross(punchProgress)
        break
    }
  }

  animateJab(progress) {
    if (this.punchFrame <= this.maxPunchFrames / 2) {
      const extendFactor = progress * 2

      if (this.facingRight) {
        this.leftArm.x = -20 + 50 * extendFactor
        this.leftArm.angle = -0.1
      } else {
        this.rightArm.x = 20 - 50 * extendFactor
        this.rightArm.angle = 0.1
      }
    } else {
      const retractFactor = (progress - 0.5) * 2

      if (this.facingRight) {
        this.leftArm.x = 30 - 50 * retractFactor
        this.leftArm.angle = -0.3 * retractFactor
      } else {
        this.rightArm.x = -30 + 50 * retractFactor
        this.rightArm.angle = 0.3 * retractFactor
      }
    }
  }

  animateUppercut(progress) {
    if (this.punchFrame <= this.maxPunchFrames / 2) {
      const extendFactor = progress * 2

      if (this.facingRight) {
        this.rightArm.x = 20 + 30 * extendFactor
        this.rightArm.y = 30 * extendFactor - 40 * extendFactor
        this.rightArm.angle = -1.2 * extendFactor
      } else {
        this.leftArm.x = -20 - 30 * extendFactor
        this.leftArm.y = 30 * extendFactor - 40 * extendFactor
        this.leftArm.angle = 1.2 * extendFactor
      }
    } else {
      const retractFactor = (progress - 0.5) * 2

      if (this.facingRight) {
        this.rightArm.x = 50 - 30 * retractFactor
        this.rightArm.y = -10 + 10 * retractFactor
        this.rightArm.angle = -1.2 + 1.5 * retractFactor
      } else {
        this.leftArm.x = -50 + 30 * retractFactor
        this.leftArm.y = -10 + 10 * retractFactor
        this.leftArm.angle = 1.2 - 1.5 * retractFactor
      }
    }
  }

  animateHook(progress) {
    if (this.punchFrame <= this.maxPunchFrames / 2) {
      const extendFactor = progress * 2

      if (this.facingRight) {
        this.leftArm.x = -20 + 60 * extendFactor
        this.leftArm.y = -10 * extendFactor
        this.leftArm.angle = -0.3 - 1.0 * extendFactor
      } else {
        this.rightArm.x = 20 - 60 * extendFactor
        this.rightArm.y = -10 * extendFactor
        this.rightArm.angle = 0.3 + 1.0 * extendFactor
      }
    } else {
      const retractFactor = (progress - 0.5) * 2

      if (this.facingRight) {
        this.leftArm.x = 40 - 60 * retractFactor
        this.leftArm.y = -10 + 10 * retractFactor
        this.leftArm.angle = -1.3 + 1.0 * retractFactor
      } else {
        this.rightArm.x = -40 + 60 * retractFactor
        this.rightArm.y = -10 + 10 * retractFactor
        this.rightArm.angle = 1.3 - 1.0 * retractFactor
      }
    }
  }

  animateCross(progress) {
    if (this.punchFrame <= this.maxPunchFrames / 2) {
      const extendFactor = progress * 2

      if (this.facingRight) {
        this.rightArm.x = 20 + 70 * extendFactor
        this.rightArm.y = -5 * extendFactor
        this.rightArm.angle = 0.3 - 0.8 * extendFactor
      } else {
        this.leftArm.x = -20 - 70 * extendFactor
        this.leftArm.y = -5 * extendFactor
        this.leftArm.angle = -0.3 + 0.8 * extendFactor
      }
    } else {
      const retractFactor = (progress - 0.5) * 2

      if (this.facingRight) {
        this.rightArm.x = 90 - 70 * retractFactor
        this.rightArm.y = -5 + 5 * retractFactor
        this.rightArm.angle = -0.5 + 0.8 * retractFactor
      } else {
        this.leftArm.x = -90 + 70 * retractFactor
        this.leftArm.y = -5 + 5 * retractFactor
        this.leftArm.angle = 0.5 - 0.8 * retractFactor
      }
    }
  }

  resetArmPosition() {
    if (this.facingRight) {
      this.rightArm.x = 20
      this.rightArm.y = 0
      this.rightArm.angle = 0.3
      this.leftArm.x = -20
      this.leftArm.y = 0
      this.leftArm.angle = -0.3
    } else {
      this.leftArm.x = -20
      this.leftArm.y = 0
      this.leftArm.angle = -0.3
      this.rightArm.x = 20
      this.rightArm.y = 0
      this.rightArm.angle = 0.3
    }
  }

  updateIdleArms() {
    const breathingOffset = Math.sin(this.p5.frameCount * 0.05) * 2

    if (this.facingRight) {
      this.leftArm = {
        x: -20,
        y: breathingOffset,
        angle: -0.3,
      }

      this.rightArm = {
        x: 20,
        y: breathingOffset,
        angle: 0.3,
      }
    } else {
      this.leftArm = {
        x: -20,
        y: breathingOffset,
        angle: -0.3,
      }

      this.rightArm = {
        x: 20,
        y: breathingOffset,
        angle: 0.3,
      }
    }
  }

  draw() {
    const p5 = this.p5

    if (this.isKnockedOut) {
      this.drawKnockedOut()
      return
    }

    // Desenha sombra
    this.drawShadow()

    // Draw boxer com glow effect
    p5.push()
    p5.translate(this.position.x, this.position.y)

    // Efeito de brilho quando socando
    if (this.isPunching) {
      p5.drawingContext.shadowColor = this.type === "player" ? "red" : "blue"
      p5.drawingContext.shadowBlur = 20
    }

    // Efeito de tremor quando é atingido ou atordoado
    if (this.isHit || this.stunned) {
      p5.translate(p5.random(-3, 3), p5.random(-3, 3))
    }

    // Desenha as pernas
    this.drawLegs(p5)

    // Desenha o tronco (shorts)
    this.drawShorts(p5)

    // Desenha o torso
    this.drawTorso(p5)

    // Desenha a cabeça
    this.drawHead(p5)

    // Desenha os braços e luvas
    this.drawArmsAndGloves(p5)

    // Desenha gotas de suor
    this.drawSweat(p5)

    p5.pop()

    // Desenha indicador de tipo de soco
    if (this.type === "player" && this.isPunching) {
      this.drawPunchIndicator()
    }
  }

  drawLegs(p5) {
    // Desenha as pernas com mais detalhes
    const legColor = this.skinColor
    p5.fill(legColor)
    p5.stroke(0)
    p5.strokeWeight(1)

    // Perna esquerda
    p5.beginShape()
    p5.vertex(-15, 30)
    p5.vertex(-15, 70)
    p5.vertex(-5, 70)
    p5.vertex(-5, 30)
    p5.endShape(p5.CLOSE)

    // Perna direita
    p5.beginShape()
    p5.vertex(5, 30)
    p5.vertex(5, 70)
    p5.vertex(15, 70)
    p5.vertex(15, 30)
    p5.endShape(p5.CLOSE)

    // Sapatos de boxe
    p5.fill(0)
    p5.rect(-18, 65, 16, 10, 3)
    p5.rect(2, 65, 16, 10, 3)

    // Detalhes dos sapatos
    p5.stroke(100)
    p5.line(-15, 68, -5, 68)
    p5.line(5, 68, 15, 68)
  }

  drawShorts(p5) {
    // Desenha o shorts com padrões
    p5.fill(this.trunkColor)
    p5.stroke(0)
    p5.strokeWeight(1)

    // Shorts base
    p5.rect(-20, 0, 40, 35, 5)

    // Adiciona padrões ao shorts
    p5.fill(this.shortsSecondaryColor)
    p5.noStroke()

    switch (this.shortsPattern) {
      case 1: // Listrado
        for (let i = 0; i < 4; i++) {
          p5.rect(-20, 5 + i * 8, 40, 3)
        }
        break
      case 2: // Com estrela
        p5.push()
        p5.translate(0, 15)
        p5.beginShape()
        for (let i = 0; i < 5; i++) {
          const angle = -p5.PI / 2 + (i * p5.TWO_PI) / 5
          const x1 = p5.cos(angle) * 8
          const y1 = p5.sin(angle) * 8
          p5.vertex(x1, y1)

          const angle2 = angle + p5.TWO_PI / 10
          const x2 = p5.cos(angle2) * 4
          const y2 = p5.sin(angle2) * 4
          p5.vertex(x2, y2)
        }
        p5.endShape(p5.CLOSE)
        p5.pop()
        break
    }

    // Adiciona elástico do shorts
    p5.fill(this.shortsSecondaryColor)
    p5.rect(-20, 0, 40, 5)
  }

  drawTorso(p5) {
    // Desenha o torso com músculos
    let torsoColor = this.skinColor
    if (this.isHit) {
      torsoColor = p5.color(255, 150, 150)
    } else if (this.stunned) {
      torsoColor = p5.color(200, 200, 255)
    }

    p5.fill(torsoColor)
    p5.stroke(0)
    p5.strokeWeight(1)

    // Torso principal
    p5.ellipse(0, -10, this.size, this.size * 0.8)

    // Músculos peitorais
    p5.noStroke()
    p5.fill(p5.lerpColor(torsoColor, p5.color(0, 0, 0, 50), 0.3))
    p5.arc(-10, -15, 25 * this.muscleTone, 20, p5.PI * 0.1, p5.PI * 0.9)
    p5.arc(10, -15, 25 * this.muscleTone, 20, p5.PI * 0.1, p5.PI * 0.9)

    // Abdômen
    p5.stroke(0)
    p5.strokeWeight(0.5)
    p5.line(0, -25, 0, 0)
    p5.line(-5, -20, 5, -20)
    p5.line(-5, -10, 5, -10)

    // Ombros
    p5.noStroke()
    p5.fill(torsoColor)
    p5.ellipse(-20, -10, 15 * this.muscleTone, 15)
    p5.ellipse(20, -10, 15 * this.muscleTone, 15)
  }

  drawHead(p5) {
    // Desenha a cabeça com mais detalhes
    let headColor = this.skinColor
    if (this.isHit) {
      headColor = p5.color(255, 150, 150)
    } else if (this.stunned) {
      headColor = p5.color(200, 200, 255)
    }

    p5.fill(headColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(0, -45, this.size * 0.7, this.size * 0.7)

    // Cabelo
    this.drawHair(p5)

    // Olhos
    this.drawEyes(p5)

    // Boca
    this.drawMouth(p5)

    // Barba e bigode
    if (this.hasMustache) {
      p5.fill(this.hairColor)
      p5.noStroke()
      p5.rect(-10, -35, 20, 3, 2)
    }

    if (this.hasBeard) {
      p5.fill(this.hairColor)
      p5.noStroke()
      p5.arc(0, -30, 25, 20, 0, p5.PI)
    }

    // Sobrancelhas
    p5.fill(this.hairColor)
    p5.noStroke()
    p5.rect(-15, -55, 10, 2, 1)
    p5.rect(5, -55, 10, 2, 1)

    // Orelhas
    p5.fill(headColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(-21, -45, 10, 15)
    p5.ellipse(21, -45, 10, 15)

    // Detalhes das orelhas
    p5.noFill()
    p5.arc(-21, -45, 5, 10, p5.PI * 0.2, p5.PI * 1.3)
    p5.arc(21, -45, 5, 10, p5.PI * 0.7, p5.PI * 1.8)
  }

  drawHair(p5) {
    p5.fill(this.hairColor)
    p5.noStroke()

    switch (this.hairStyle) {
      case 0: // Normal
        p5.arc(0, -45, this.size * 0.7, this.size * 0.7, p5.PI, p5.TWO_PI)
        break
      case 1: // Moicano
        p5.arc(0, -45, this.size * 0.7, this.size * 0.7, p5.PI, p5.TWO_PI)
        p5.rect(-5, -75, 10, 30, 3)
        break
      case 2: // Careca
        // Apenas uma linha fina de cabelo
        p5.arc(0, -45, this.size * 0.7, 10, p5.PI, p5.TWO_PI)
        break
    }
  }

  drawEyes(p5) {
    if (this.stunned) {
      // Olhos de atordoado (X X)
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.line(-13, -48, -7, -42)
      p5.line(-7, -48, -13, -42)
      p5.line(7, -48, 13, -42)
      p5.line(13, -48, 7, -42)
    } else {
      // Branco dos olhos
      p5.fill(255)
      p5.noStroke()
      p5.ellipse(-10, -45, 12, 12)
      p5.ellipse(10, -45, 12, 12)

      // Íris
      const eyeOffset = this.facingRight ? 2 : -2
      p5.fill(this.eyeColor)
      p5.ellipse(-10 + eyeOffset, -45, 8, 8)
      p5.ellipse(10 + eyeOffset, -45, 8, 8)

      // Pupila
      p5.fill(0)
      p5.ellipse(-10 + eyeOffset, -45, 4, 4)
      p5.ellipse(10 + eyeOffset, -45, 4, 4)

      // Reflexo nos olhos
      p5.fill(255)
      p5.ellipse(-12 + eyeOffset, -47, 3, 3)
      p5.ellipse(8 + eyeOffset, -47, 3, 3)

      // Pálpebras
      if (this.isBlinking) {
        p5.fill(this.skinColor)
        p5.noStroke()
        p5.rect(-16, -45, 12, 6, 2)
        p5.rect(4, -45, 12, 6, 2)
      }
    }
  }

  drawMouth(p5) {
    if (this.isHit) {
      // Boca aberta de dor
      p5.fill(0)
      p5.noStroke()
      p5.ellipse(0, -35, 10, 8)

      // Dentes
      p5.fill(255)
      p5.rect(-4, -37, 8, 3)
    } else if (this.isPunching) {
      // Boca determinada
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.line(-7, -32, 7, -32)
    } else {
      // Boca normal
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.noFill()
      p5.arc(0, -35, 14, 5, 0, p5.PI)
    }
  }

  drawSweat(p5) {
    p5.fill(200, 230, 255, 200)
    p5.noStroke()

    for (const drop of this.sweatDrops) {
      p5.ellipse(drop.x, drop.y, drop.size, drop.size * 1.5)
    }
  }

  drawShadow() {
    const p5 = this.p5

    // Sombra do boxeador
    p5.push()
    p5.translate(this.position.x + this.shadowOffset, this.position.y + 70)
    p5.fill(0, 0, 0, 100)
    p5.noStroke()
    p5.ellipse(0, 0, this.size * 1.5, this.size * 0.3)
    p5.pop()
  }

  drawKnockedOut() {
    const p5 = this.p5

    p5.push()
    p5.translate(this.position.x, this.position.y + 40)

    // Desenha o boxeador deitado
    p5.fill(this.skinColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(0, 0, this.size * 1.5, this.size * 0.8)

    // Cabeça
    p5.ellipse(-30, 0, this.size * 0.7, this.size * 0.7)

    // Olhos em espiral (nocauteado)
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

  drawPunchIndicator() {
    const p5 = this.p5

    p5.push()
    p5.translate(this.position.x, this.position.y - 80)

    // Efeito de brilho
    p5.drawingContext.shadowColor = "yellow"
    p5.drawingContext.shadowBlur = 15

    p5.fill(255, 255, 0)
    p5.stroke(0)
    p5.strokeWeight(2)
    p5.rect(-30, -15, 60, 20, 5)

    p5.fill(0)
    p5.noStroke()
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.textSize(12)
    p5.text(this.punchType.toUpperCase(), 0, -5)

    p5.drawingContext.shadowBlur = 0

    p5.pop()
  }

  drawArmsAndGloves(p5) {
    // Desenha o braço esquerdo
    p5.push()
    p5.translate(0, -10)

    // Braço esquerdo
    p5.push()
    p5.rotate(this.leftArm.angle)
    p5.fill(this.skinColor)
    if (this.isHit) {
      p5.fill(255, 150, 150)
    } else if (this.stunned) {
      p5.fill(200, 200, 255)
    }

    // Braço com músculos
    p5.beginShape()
    p5.vertex(-14, 0)
    p5.vertex(-6, 0)
    p5.vertex(-4, 30)
    p5.vertex(-12, 30)
    p5.endShape(p5.CLOSE)

    // Sombreamento do músculo
    p5.noStroke()
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0, 0, 0, 50), 0.3))
    p5.ellipse(-10, 15, 8, 20)

    // Luva esquerda com brilho
    p5.translate(this.leftArm.x, this.leftArm.y + 30)

    if (this.isPunching && this.punchType !== "jab" && this.facingRight) {
      p5.drawingContext.shadowColor = "red"
      p5.drawingContext.shadowBlur = 10
    }

    // Luva mais detalhada
    p5.fill(this.gloveColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(0, 0, 20, 18)

    // Punho da luva
    p5.rect(-12, -5, 8, 10, 3)

    // Detalhes da luva
    p5.stroke(p5.lerpColor(this.gloveColor, p5.color(0), 0.3))
    p5.arc(0, 0, 15, 13, p5.PI * 0.2, p5.PI * 1.8)

    // Marca da luva
    p5.fill(255)
    p5.noStroke()
    p5.textSize(5)
    p5.textAlign(p5.CENTER)
    p5.text("BOX", 0, 2)

    p5.drawingContext.shadowBlur = 0
    p5.pop()

    // Braço direito
    p5.push()
    p5.rotate(this.rightArm.angle)
    p5.fill(this.skinColor)
    if (this.isHit) {
      p5.fill(255, 150, 150)
    } else if (this.stunned) {
      p5.fill(200, 200, 255)
    }

    // Braço com músculos
    p5.beginShape()
    p5.vertex(6, 0)
    p5.vertex(14, 0)
    p5.vertex(12, 30)
    p5.vertex(4, 30)
    p5.endShape(p5.CLOSE)

    // Sombreamento do músculo
    p5.noStroke()
    p5.fill(p5.lerpColor(this.skinColor, p5.color(0, 0, 0, 50), 0.3))
    p5.ellipse(10, 15, 8, 20)

    // Luva direita com brilho
    p5.translate(this.rightArm.x, this.rightArm.y + 30)

    if (this.isPunching && this.punchType !== "jab" && this.facingRight) {
      p5.drawingContext.shadowColor = "red"
      p5.drawingContext.shadowBlur = 10
    }

    // Luva mais detalhada
    p5.fill(this.gloveColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.ellipse(0, 0, 20, 18)

    // Punho da luva
    p5.rect(4, -5, 8, 10, 3)

    // Detalhes da luva
    p5.stroke(p5.lerpColor(this.gloveColor, p5.color(0), 0.3))
    p5.arc(0, 0, 15, 13, p5.PI * 0.2, p5.PI * 1.8)

    // Marca da luva
    p5.fill(255)
    p5.noStroke()
    p5.textSize(5)
    p5.textAlign(p5.CENTER)
    p5.text("BOX", 0, 2)

    p5.drawingContext.shadowBlur = 0
    p5.pop()

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
          break
      }

      return true
    }
    return false
  }

  takeDamage(amount, punchType) {
    if (this.isKnockedOut) return

    this.health -= amount
    this.health = Math.max(0, this.health)
    this.totalDamageTaken += amount
    this.consecutiveHits++
    this.isHit = true
    this.hitTimer = 10

    const healthPercentage = this.health / this.maxHealth
    let knockoutChance = 0

    if (healthPercentage < 0.05) {
      knockoutChance = 0.008
    } else if (healthPercentage < 0.1) {
      knockoutChance = 0.004
    } else if (healthPercentage < 0.2) {
      knockoutChance = 0.002
    } else {
      knockoutChance = 0.0005
    }

    switch (punchType) {
      case "uppercut":
        knockoutChance *= 1.5
        break
      case "cross":
        knockoutChance *= 1.3
        break
      case "hook":
        knockoutChance *= 1.2
        break
      case "jab":
        knockoutChance *= 0.3
        break
    }

    if (this.consecutiveHits > 5) {
      knockoutChance *= 1.2
    }

    if (this.p5.random() < knockoutChance) {
      this.isKnockedOut = true
      this.knockoutTimer = 180
      this.health = 0
    } else if (this.p5.random() < knockoutChance * 3) {
      this.stunned = true
      this.stunnedTimer = 60
    }

    setTimeout(() => {
      this.consecutiveHits = Math.max(0, this.consecutiveHits - 1)
    }, 2000)
  }

  getHealth() {
    return this.health
  }

  getPunchPosition() {
    let punchX, punchY

    if (this.facingRight) {
      if (this.punchType === "jab") {
        punchX = this.position.x + this.leftArm.x
        punchY = this.position.y - 10 + 30 + this.leftArm.y
      } else {
        punchX = this.position.x + this.rightArm.x
        punchY = this.position.y - 10 + 30 + this.rightArm.y
      }
    } else {
      if (this.punchType === "jab") {
        punchX = this.position.x + this.rightArm.x
        punchY = this.position.y - 10 + 30 + this.rightArm.y
      } else {
        punchX = this.position.x + this.leftArm.x
        punchY = this.position.y - 10 + 30 + this.leftArm.y
      }
    }

    return this.p5.createVector(punchX, punchY)
  }

  isPunchActive() {
    return this.isPunching && this.punchFrame >= 5 && this.punchFrame <= 10
  }

  getPunchHitbox() {
    const punchPos = this.getPunchPosition()
    return {
      x: punchPos.x,
      y: punchPos.y,
      radius: 15,
    }
  }

  getPunchDamage() {
    let baseDamage
    switch (this.punchType) {
      case "jab":
        baseDamage = this.p5.random(1, 3)
        break
      case "uppercut":
        baseDamage = this.p5.random(4, 8)
        break
      case "hook":
        baseDamage = this.p5.random(3, 6)
        break
      case "cross":
        baseDamage = this.p5.random(5, 10)
        break
      default:
        baseDamage = this.p5.random(1, 3)
    }

    return Math.floor(baseDamage)
  }
}

class Enemy extends Player {
  constructor(p5, x, y, type, round) {
    super(p5, x, y, type)
    this.attackTimer = 0
    this.moveTimer = 0
    this.targetPosition = p5.createVector(x, y)
    this.difficulty = round
    this.moveSpeed = 3 + round * 0.5 // Aumentado para ser mais rápido
    this.health = 500 + (round - 1) * 30
    this.maxHealth = this.health
    this.facingRight = false
    this.punchTypes = ["jab", "uppercut", "hook", "cross"]
    this.preferredPunch = p5.random(this.punchTypes)
    this.attackTimer = 0 // Começa pronto para atacar
    this.lastPlayerPos = p5.createVector(0, 0)
    this.playerInRange = false
    this.aggressiveness = 0.7 + round * 0.1 // Aumenta com a dificuldade
    this.attackRange = 100 // Aumentado para atacar de mais longe
    this.attackCooldown = Math.max(5, 20 - round * 2) // Reduz com a dificuldade - MUITO REDUZIDO
    this.comboProbability = 0.5 + round * 0.1 // Chance de fazer combo
    this.comboCounter = 0
    this.maxComboLength = 2 + Math.floor(round / 2) // Aumenta com a dificuldade
  }

  update(playerPosition) {
    if (this.isKnockedOut) {
      this.knockoutTimer--
      if (this.knockoutTimer <= 0) {
        this.isKnockedOut = false
      }
      return
    }

    // Guarda a última posição do jogador
    this.lastPlayerPos.set(playerPosition.x, playerPosition.y)

    // Calcula a distância para o jogador
    const distToPlayer = this.p5.dist(this.position.x, this.position.y, playerPosition.x, playerPosition.y)

    // Verifica se o jogador está no alcance de ataque
    this.playerInRange = distToPlayer < this.attackRange

    // Atualiza timers
    this.attackTimer--
    this.moveTimer--

    // COMPORTAMENTO ULTRA AGRESSIVO: Ataca CONSTANTEMENTE quando próximo
    if (this.playerInRange && !this.stunned && !this.isKnockedOut) {
      // Vira para o jogador antes de socar
      this.facingRight = playerPosition.x > this.position.x

      // ATACA SEMPRE - remove todas as verificações de timer e cooldown
      if (!this.isPunching) {
        const punchType = this.choosePunchType()

        // Force o soco mesmo com cooldown
        this.isPunching = true
        this.punchType = punchType
        this.punchFrame = 0
        this.punchCooldown = 0 // Zera o cooldown para atacar imediatamente

        // Chance muito alta de fazer combo
        if (this.p5.random() < 0.9) {
          this.comboCounter = Math.min(this.comboCounter + 1, this.maxComboLength)
        } else {
          this.comboCounter = 0
        }
      }
    } else if (this.moveTimer <= 0 && !this.isPunching) {
      // Se não está atacando, move-se agressivamente em direção ao jogador
      this.chooseMovementStrategy(playerPosition)
    }

    // Movimento em direção ao alvo
    if (!this.isPunching) {
      const direction = this.p5.createVector(
        this.targetPosition.x - this.position.x,
        this.targetPosition.y - this.position.y,
      )

      if (direction.mag() > 5) {
        direction.normalize()
        const currentSpeed = this.stunned ? this.moveSpeed * 0.5 : this.moveSpeed
        direction.mult(currentSpeed)
        this.position.add(direction)

        if (direction.x > 0) {
          this.facingRight = true
        } else if (direction.x < 0) {
          this.facingRight = false
        }
      }
    }

    // Constrain to canvas
    this.position.x = this.p5.constrain(this.position.x, 50, 750)
    this.position.y = this.p5.constrain(this.position.y, 150, 500)

    // Atualiza animação de soco
    if (this.isPunching) {
      this.punchFrame++
      this.animatePunch()

      if (this.punchFrame >= this.maxPunchFrames) {
        this.isPunching = false
        this.punchFrame = 0
        this.resetArmPosition()

        // Se ainda está próximo do jogador, ataca novamente IMEDIATAMENTE
        if (this.playerInRange && !this.stunned && !this.isKnockedOut) {
          // Pequeno delay de apenas 1 frame para evitar travamento
          this.attackTimer = 1
        }
      }
    }

    // Atualiza animação de hit
    if (this.isHit) {
      this.hitTimer--
      if (this.hitTimer <= 0) {
        this.isHit = false
      }
    }

    // Atualiza atordoamento
    if (this.stunned) {
      this.stunnedTimer--
      if (this.stunnedTimer <= 0) {
        this.stunned = false
      }
    }

    // Atualiza braços em repouso
    if (!this.isPunching) {
      this.updateIdleArms()
    }

    // Atualiza efeitos visuais
    this.shadowOffset = Math.sin(this.p5.frameCount * 0.1) * 3
    this.glowIntensity = this.isPunching ? 255 : Math.sin(this.p5.frameCount * 0.05) * 50 + 100
  }

  choosePunchType() {
    const p5 = this.p5
    const rand = p5.random()

    // Se está fazendo um combo, varia os golpes
    if (this.comboCounter > 0) {
      if (rand < 0.4) return "jab"
      else if (rand < 0.7) return "hook"
      else if (rand < 0.9) return "cross"
      else return "uppercut"
    }

    // Escolha normal baseada na dificuldade - MAIS AGRESSIVA
    if (this.difficulty >= 3) {
      if (rand < 0.4) return "cross"
      else if (rand < 0.6) return "uppercut"
      else if (rand < 0.8) return "hook"
      else return "jab"
    } else if (this.difficulty >= 2) {
      if (rand < 0.3) return "uppercut"
      else if (rand < 0.6) return "hook"
      else if (rand < 0.8) return "cross"
      else return "jab"
    } else {
      if (rand < 0.5) return "jab"
      else if (rand < 0.7) return "hook"
      else if (rand < 0.9) return "cross"
      else return "uppercut"
    }
  }

  chooseMovementStrategy(playerPosition) {
    const p5 = this.p5
    const distToPlayer = p5.dist(this.position.x, this.position.y, playerPosition.x, playerPosition.y)

    // SEMPRE se aproxima do jogador de forma agressiva
    if (distToPlayer > this.attackRange) {
      // Vai direto para o jogador
      this.targetPosition.set(
        p5.constrain(playerPosition.x + p5.random(-20, 20), 100, 700),
        p5.constrain(playerPosition.y + p5.random(-20, 20), 150, 500),
      )
    } else {
      // Mantém distância ideal para atacar
      const angle = p5.atan2(playerPosition.y - this.position.y, playerPosition.x - this.position.x)
      const idealDist = this.attackRange * 0.8
      this.targetPosition.set(
        p5.constrain(playerPosition.x - p5.cos(angle) * idealDist, 100, 700),
        p5.constrain(playerPosition.y - p5.sin(angle) * idealDist, 150, 500),
      )
    }

    this.moveTimer = p5.floor(p5.random(10, 20)) // Movimento mais frequente
  }
}

class HealthBar {
  constructor(p5, x, y, width, height, color) {
    this.p5 = p5
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color
    this.value = 100
  }

  update(health, maxHealth = 500) {
    this.value = (health / maxHealth) * 100
  }

  draw() {
    const p5 = this.p5

    // Efeito de brilho na barra de vida
    p5.drawingContext.shadowColor = "white"
    p5.drawingContext.shadowBlur = 5

    // Draw background
    p5.fill(50)
    p5.noStroke()
    p5.rect(this.x, this.y, this.width, this.height, 5)

    // Draw health
    const healthWidth = (this.value / 100) * this.width

    let healthColor
    if (this.value > 60) {
      healthColor = p5.color(0, 200, 0)
    } else if (this.value > 30) {
      healthColor = p5.color(255, 165, 0)
    } else {
      healthColor = p5.color(200, 0, 0)
    }

    p5.fill(healthColor)
    p5.rect(this.x, this.y, healthWidth, this.height, 5)

    // Draw border
    p5.stroke(255)
    p5.strokeWeight(2)
    p5.noFill()
    p5.rect(this.x, this.y, this.width, this.height, 5)

    p5.drawingContext.shadowBlur = 0

    // Draw health text
    p5.fill(255)
    p5.noStroke()
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.textSize(16)
    p5.text(Math.ceil(this.value) + "%", this.x + this.width / 2, this.y + this.height / 2)
  }
}

class HitEffect {
  constructor(p5, x, y, punchType) {
    this.p5 = p5
    this.x = x
    this.y = y
    this.frame = 0
    this.maxFrames = 15
    this.size = 30
    this.punchType = punchType
    this.particles = []

    // Cria partículas
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: 0,
        y: 0,
        vx: p5.random(-5, 5),
        vy: p5.random(-5, 5),
        life: 15,
      })
    }
  }

  update() {
    this.frame++

    // Atualiza partículas
    this.particles.forEach((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life--
      particle.vx *= 0.95
      particle.vy *= 0.95
    })

    return this.frame < this.maxFrames
  }

  draw() {
    const p5 = this.p5
    const progress = this.frame / this.maxFrames
    const size = this.size * (1 - progress)
    const alpha = 255 * (1 - progress)

    p5.push()
    p5.translate(this.x, this.y)

    // Efeito de brilho
    p5.drawingContext.shadowBlur = 20

    let effectColor
    switch (this.punchType) {
      case "jab":
        effectColor = p5.color(255, 255, 0, alpha)
        p5.drawingContext.shadowColor = "yellow"
        break
      case "uppercut":
        effectColor = p5.color(255, 100, 0, alpha)
        p5.drawingContext.shadowColor = "orange"
        break
      case "hook":
        effectColor = p5.color(255, 0, 100, alpha)
        p5.drawingContext.shadowColor = "magenta"
        break
      case "cross":
        effectColor = p5.color(255, 0, 0, alpha)
        p5.drawingContext.shadowColor = "red"
        break
      default:
        effectColor = p5.color(255, 255, 0, alpha)
        p5.drawingContext.shadowColor = "yellow"
    }

    // Desenha estrela de impacto
    p5.noStroke()
    p5.fill(effectColor)

    p5.beginShape()
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? size : size * 0.5
      const angle = (p5.TWO_PI * i) / 10 - p5.PI / 2
      const px = radius * p5.cos(angle)
      const py = radius * p5.sin(angle)
      p5.vertex(px, py)
    }
    p5.endShape(p5.CLOSE)

    // Desenha partículas
    this.particles.forEach((particle) => {
      if (particle.life > 0) {
        p5.fill(255, 255, 255, (particle.life / 15) * 255)
        p5.ellipse(particle.x, particle.y, 4, 4)
      }
    })

    p5.drawingContext.shadowBlur = 0

    // Texto do tipo de soco
    p5.fill(255, 255, 255, alpha)
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.textSize(8)
    p5.text(this.punchType.toUpperCase(), 0, size + 10)

    p5.pop()
  }
}

class Spectator {
  constructor(p5, x, y) {
    this.p5 = p5
    this.x = x
    this.y = y
    this.size = p5.random(15, 25)
    this.animationOffset = p5.random(0, p5.TWO_PI)
    this.excitement = 0
    this.armAngle = 0
    this.isClapping = false
    this.clapTimer = 0
    this.skinColor = p5.color(p5.random(150, 255), p5.random(150, 220), p5.random(120, 200))
    this.shirtColor = p5.color(p5.random(50, 255), p5.random(50, 255), p5.random(50, 255))
  }

  update(gameExcitement) {
    this.excitement = gameExcitement

    // Animação de torcida
    if (this.excitement > 0.5) {
      this.armAngle = Math.sin(this.p5.frameCount * 0.2 + this.animationOffset) * 0.5
      this.isClapping = true
      this.clapTimer = 30
    } else {
      this.armAngle = Math.sin(this.p5.frameCount * 0.05 + this.animationOffset) * 0.1
    }

    if (this.clapTimer > 0) {
      this.clapTimer--
      this.isClapping = true
    } else {
      this.isClapping = false
    }
  }

  draw() {
    const p5 = this.p5

    p5.push()
    p5.translate(this.x, this.y)

    // Movimento de torcida
    const bounce = this.excitement > 0.5 ? Math.sin(this.p5.frameCount * 0.3 + this.animationOffset) * 3 : 0
    p5.translate(0, bounce)

    // Corpo
    p5.fill(this.shirtColor)
    p5.stroke(0)
    p5.strokeWeight(1)
    p5.rect(-this.size / 4, this.size / 2, this.size / 2, this.size, 3)

    // Cabeça
    p5.fill(this.skinColor)
    p5.ellipse(0, 0, this.size, this.size)

    // Olhos
    p5.fill(0)
    p5.ellipse(-this.size / 6, -this.size / 8, 3, 3)
    p5.ellipse(this.size / 6, -this.size / 8, 3, 3)

    // Boca (animada baseada na emoção)
    if (this.excitement > 0.7) {
      // Gritando
      p5.fill(0)
      p5.ellipse(0, this.size / 6, 6, 8)
    } else if (this.excitement > 0.3) {
      // Sorrindo
      p5.noFill()
      p5.stroke(0)
      p5.strokeWeight(2)
      p5.arc(0, this.size / 6, 8, 6, 0, p5.PI)
    } else {
      // Neutro
      p5.stroke(0)
      p5.strokeWeight(1)
      p5.line(-3, this.size / 6, 3, this.size / 6)
    }

    // Braços (animados)
    p5.stroke(0)
    p5.strokeWeight(2)

    // Braço esquerdo
    const leftArmX = -this.size / 3 + Math.cos(this.armAngle) * 8
    const leftArmY = this.size / 3 + Math.sin(this.armAngle) * 8
    p5.line(-this.size / 4, this.size / 2, leftArmX, leftArmY)

    // Braço direito
    const rightArmX = this.size / 3 + Math.cos(-this.armAngle) * 8
    const rightArmY = this.size / 3 + Math.sin(-this.armAngle) * 8
    p5.line(this.size / 4, this.size / 2, rightArmX, rightArmY)

    // Efeito de brilho quando muito animado
    if (this.excitement > 0.8) {
      p5.drawingContext.shadowColor = "yellow"
      p5.drawingContext.shadowBlur = 10
      p5.fill(255, 255, 0, 100)
      p5.noStroke()
      p5.ellipse(0, 0, this.size * 1.5, this.size * 1.5)
      p5.drawingContext.shadowBlur = 0
    }

    p5.pop()
  }
}

class GameManager {
  constructor(p5, player, enemy, playerHealthBar, enemyHealthBar, onGameOver, initialScore, round) {
    this.p5 = p5
    this.player = player
    this.enemy = enemy
    this.playerHealthBar = playerHealthBar
    this.enemyHealthBar = enemyHealthBar
    this.onGameOver = onGameOver
    this.score = initialScore
    this.round = round
    this.roundTime = 240
    this.startTime = p5.millis()
    this.gameOver = false

    // Power-ups
    this.powerUps = []
    this.powerUpTimer = p5.floor(p5.random(300, 600))

    // Efeitos de impacto
    this.hitEffects = []

    // Plateia
    this.spectators = []
    this.createSpectators()

    // Efeitos visuais
    this.lightIntensity = 1.0
    this.crowdExcitement = 0
    this.flashEffect = 0
    this.particles = []
  }

  createSpectators() {
    // Plateia superior
    for (let i = 0; i < 25; i++) {
      const x = this.p5.map(i, 0, 24, 80, 720)
      const y = this.p5.random(80, 120)
      this.spectators.push(new Spectator(this.p5, x, y))
    }

    // Plateia inferior
    for (let i = 0; i < 25; i++) {
      const x = this.p5.map(i, 0, 24, 80, 720)
      const y = this.p5.random(520, 560)
      this.spectators.push(new Spectator(this.p5, x, y))
    }

    // Plateia lateral esquerda
    for (let i = 0; i < 15; i++) {
      const x = this.p5.random(10, 40)
      const y = this.p5.map(i, 0, 14, 150, 500)
      this.spectators.push(new Spectator(this.p5, x, y))
    }

    // Plateia lateral direita
    for (let i = 0; i < 15; i++) {
      const x = this.p5.random(760, 790)
      const y = this.p5.map(i, 0, 14, 150, 500)
      this.spectators.push(new Spectator(this.p5, x, y))
    }
  }

  update() {
    if (this.gameOver) return

    const currentTime = this.p5.millis()
    const elapsedSeconds = (currentTime - this.startTime) / 1000
    const remainingTime = Math.max(0, this.roundTime - elapsedSeconds)

    this.player.update()
    this.enemy.update(this.player.position)

    this.playerHealthBar.update(this.player.getHealth(), this.player.maxHealth)
    this.enemyHealthBar.update(this.enemy.getHealth(), this.enemy.maxHealth)

    this.checkPunches()
    this.updatePowerUps()
    this.updateHitEffects()
    this.updateVisualEffects()

    // Atualiza emoção da plateia
    const actionLevel = this.player.isPunching || this.enemy.isPunching ? 1.0 : 0.0
    const healthDifference = Math.abs(this.player.getHealth() - this.enemy.getHealth()) / 500
    this.crowdExcitement = this.p5.lerp(this.crowdExcitement, actionLevel + healthDifference, 0.1)

    // Atualiza plateia
    this.spectators.forEach((spectator) => {
      spectator.update(this.crowdExcitement)
    })

    if (this.player.getHealth() <= 0 || this.enemy.getHealth() <= 0 || remainingTime <= 0) {
      this.endGame()
    }

    if (!this.gameOver) {
      this.score += 0.01
    }
  }

  updateVisualEffects() {
    // Efeito de flash quando há impacto
    if (this.flashEffect > 0) {
      this.flashEffect -= 5
    }

    // Intensidade da luz baseada na ação
    const targetIntensity = this.player.isPunching || this.enemy.isPunching ? 1.5 : 1.0
    this.lightIntensity = this.p5.lerp(this.lightIntensity, targetIntensity, 0.1)

    // Atualiza partículas ambientes
    if (this.p5.random() < 0.1) {
      this.particles.push({
        x: this.p5.random(50, 750),
        y: this.p5.random(150, 500),
        vx: this.p5.random(-1, 1),
        vy: this.p5.random(-1, 1),
        life: 60,
        size: this.p5.random(2, 5),
      })
    }

    this.particles = this.particles.filter((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life--
      return particle.life > 0
    })
  }

  draw() {
    const p5 = this.p5

    // Background com gradiente
    this.drawBackground()

    // Efeito de flash
    if (this.flashEffect > 0) {
      p5.fill(255, 255, 255, this.flashEffect)
      p5.noStroke()
      p5.rect(0, 0, p5.width, p5.height)
    }

    // Draw ring
    this.drawRing()

    // Desenha plateia
    this.drawSpectators()

    // Desenha partículas ambientes
    this.drawAmbientParticles()

    // Draw power-ups
    this.drawPowerUps()

    // Draw hit effects
    this.drawHitEffects()

    // Draw players
    this.player.draw()
    this.enemy.draw()

    // Efeitos de iluminação
    this.drawLighting()

    // Draw UI
    this.drawUI()

    // Draw controls
    this.drawControls()
  }

  drawBackground() {
    const p5 = this.p5

    // Gradiente de fundo
    for (let i = 0; i <= p5.height; i++) {
      const inter = p5.map(i, 0, p5.height, 0, 1)
      const c = p5.lerpColor(p5.color(20, 20, 40), p5.color(60, 60, 80), inter)
      p5.stroke(c)
      p5.line(0, i, p5.width, i)
    }
  }

  drawRing() {
    const p5 = this.p5

    // Sombra do ringue
    p5.fill(0, 0, 0, 100)
    p5.noStroke()
    p5.rect(55, 155, 700, 350, 10)

    // Desenha o chão do ringue com brilho
    p5.drawingContext.shadowColor = "white"
    p5.drawingContext.shadowBlur = 10

    p5.fill(139, 69, 19)
    p5.stroke(101, 67, 33)
    p5.strokeWeight(8)
    p5.rect(50, 150, 700, 350, 10)

    p5.drawingContext.shadowBlur = 0

    // Desenha as marcações do ringue
    p5.stroke(120, 60, 10)
    p5.strokeWeight(2)
    p5.noFill()
    p5.ellipse(400, 325, 200, 200)
    p5.line(50, 325, 750, 325)
    p5.line(400, 150, 400, 500)

    // Desenha as cordas do ringue com brilho
    p5.drawingContext.shadowColor = "white"
    p5.drawingContext.shadowBlur = 5

    p5.stroke(255, 255, 255)
    p5.strokeWeight(4)
    p5.line(50, 200, 750, 200)
    p5.line(50, 300, 750, 300)
    p5.line(50, 400, 750, 400)

    p5.drawingContext.shadowBlur = 0

    // Desenha os postes dos cantos
    p5.fill(200, 200, 200)
    p5.noStroke()
    p5.rect(45, 145, 10, 360)
    p5.rect(745, 145, 10, 360)

    // Desenha as almofadas dos cantos com brilho
    p5.drawingContext.shadowColor = "red"
    p5.drawingContext.shadowBlur = 8
    p5.fill(255, 0, 0)
    p5.rect(40, 140, 20, 20, 5)

    p5.drawingContext.shadowColor = "blue"
    p5.fill(0, 0, 255)
    p5.rect(740, 140, 20, 20, 5)

    p5.drawingContext.shadowBlur = 0
  }

  drawSpectators() {
    this.spectators.forEach((spectator) => {
      spectator.draw()
    })
  }

  drawAmbientParticles() {
    const p5 = this.p5

    this.particles.forEach((particle) => {
      const alpha = (particle.life / 60) * 100
      p5.fill(255, 255, 255, alpha)
      p5.noStroke()
      p5.ellipse(particle.x, particle.y, particle.size, particle.size)
    })
  }

  drawLighting() {
    const p5 = this.p5

    // Holofotes no ringue
    const spotlights = [
      { x: 200, y: 325 },
      { x: 400, y: 325 },
      { x: 600, y: 325 },
    ]

    spotlights.forEach((light) => {
      p5.drawingContext.shadowColor = "yellow"
      p5.drawingContext.shadowBlur = 50 * this.lightIntensity
      p5.fill(255, 255, 0, 30 * this.lightIntensity)
      p5.noStroke()
      p5.ellipse(light.x, light.y, 150, 150)
    })

    p5.drawingContext.shadowBlur = 0
  }

  drawUI() {
    const p5 = this.p5

    // Background da UI com brilho
    p5.drawingContext.shadowColor = "cyan"
    p5.drawingContext.shadowBlur = 10

    // Draw health bars
    this.playerHealthBar.draw()
    this.enemyHealthBar.draw()

    p5.drawingContext.shadowBlur = 0

    // Draw timer
    const currentTime = p5.millis()
    const elapsedSeconds = (currentTime - this.startTime) / 1000
    const remainingTime = Math.max(0, this.roundTime - elapsedSeconds)

    p5.drawingContext.shadowColor = "white"
    p5.drawingContext.shadowBlur = 5

    p5.fill(0)
    p5.stroke(255)
    p5.strokeWeight(2)
    p5.rect(375, 30, 50, 30, 5)

    p5.fill(255)
    p5.noStroke()
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.textSize(16)
    p5.text(Math.ceil(remainingTime), 400, 45)

    // Draw round and score
    p5.fill(255)
    p5.textAlign(p5.CENTER)
    p5.textSize(20)
    p5.text("Round: " + this.round, 400, 80)
    p5.text("Score: " + Math.floor(this.score), 400, 110)

    p5.drawingContext.shadowBlur = 0

    // Draw player names
    p5.textSize(16)
    p5.textAlign(p5.LEFT)
    p5.text("Player", 50, 20)
    p5.textAlign(p5.RIGHT)
    p5.text("Enemy", 750, 20)
  }

  drawControls() {
    const p5 = this.p5

    // Desenha os controles na parte inferior
    p5.fill(0, 0, 0, 150)
    p5.noStroke()
    p5.rect(0, 520, 800, 80)

    p5.fill(255)
    p5.textAlign(p5.LEFT)
    p5.textSize(12)
    p5.text("Controles:", 10, 540)
    p5.text("Movimento: WASD ou Setas", 10, 555)
    p5.text("Jab: ESPAÇO", 10, 570)
    p5.text("Uppercut: X", 10, 585)

    p5.text("Hook: Z", 200, 570)
    p5.text("Cruzado: C", 200, 585)
  }

  checkPunches() {
    // Check player punch
    if (this.player.isPunchActive()) {
      const playerHitbox = this.player.getPunchHitbox()
      const enemyPos = this.enemy.position
      const distToEnemy = this.p5.dist(playerHitbox.x, playerHitbox.y, enemyPos.x, enemyPos.y)

      if (distToEnemy < 50) {
        const damage = this.player.getPunchDamage()
        this.enemy.takeDamage(damage, this.player.punchType)
        this.score += damage

        // Efeito de flash
        this.flashEffect = 30

        // Adiciona efeito de impacto
        this.hitEffects.push(new HitEffect(this.p5, playerHitbox.x, playerHitbox.y, this.player.punchType))
      }
    }

    // Check enemy punch
    if (this.enemy.isPunchActive()) {
      const enemyHitbox = this.enemy.getPunchHitbox()
      const playerPos = this.player.position
      const distToPlayer = this.p5.dist(enemyHitbox.x, enemyHitbox.y, playerPos.x, playerPos.y)

      if (distToPlayer < 50) {
        const damage = this.enemy.getPunchDamage()
        this.player.takeDamage(damage, this.enemy.punchType)

        // Efeito de flash
        this.flashEffect = 30

        // Adiciona efeito de impacto
        this.hitEffects.push(new HitEffect(this.p5, enemyHitbox.x, enemyHitbox.y, this.enemy.punchType))
      }
    }
  }

  updateHitEffects() {
    this.hitEffects = this.hitEffects.filter((effect) => effect.update())
  }

  drawHitEffects() {
    this.hitEffects.forEach((effect) => effect.draw())
  }

  updatePowerUps() {
    const p5 = this.p5

    this.powerUpTimer--
    if (this.powerUpTimer <= 0) {
      const type = p5.random(["health", "speed", "power"])
      const x = p5.random(100, 700)
      const y = p5.random(200, 450)

      this.powerUps.push({
        type,
        x,
        y,
        size: 30,
        rotation: 0,
        active: true,
        glow: 0,
      })

      this.powerUpTimer = p5.floor(p5.random(300, 600))
    }

    for (let i = 0; i < this.powerUps.length; i++) {
      const powerUp = this.powerUps[i]

      if (powerUp.active) {
        powerUp.rotation += 0.02
        powerUp.glow = Math.sin(p5.frameCount * 0.1) * 20 + 30

        const distToPlayer = p5.dist(powerUp.x, powerUp.y, this.player.position.x, this.player.position.y)

        if (distToPlayer < 40) {
          this.applyPowerUp(powerUp.type)
          powerUp.active = false
        }
      }
    }

    this.powerUps = this.powerUps.filter((p) => p.active)
  }

  drawPowerUps() {
    const p5 = this.p5

    for (const powerUp of this.powerUps) {
      if (powerUp.active) {
        p5.push()
        p5.translate(powerUp.x, powerUp.y)
        p5.rotate(powerUp.rotation)

        // Efeito de brilho
        p5.drawingContext.shadowBlur = powerUp.glow

        if (powerUp.type === "health") {
          p5.drawingContext.shadowColor = "green"
          p5.fill(0, 200, 0)
          p5.stroke(255)
          p5.strokeWeight(2)
          p5.rect(-15, -15, 30, 30)
          p5.fill(255)
          p5.rect(-10, -2, 20, 4)
          p5.rect(-2, -10, 4, 20)
        } else if (powerUp.type === "speed") {
          p5.drawingContext.shadowColor = "blue"
          p5.fill(0, 100, 255)
          p5.stroke(255)
          p5.strokeWeight(2)
          p5.ellipse(0, 0, 30, 30)
          p5.fill(255)
          p5.triangle(0, -10, 10, 5, -10, 5)
        } else if (powerUp.type === "power") {
          p5.drawingContext.shadowColor = "orange"
          p5.fill(255, 100, 0)
          p5.stroke(255)
          p5.strokeWeight(2)
          p5.ellipse(0, 0, 30, 30)
          p5.fill(255)
          p5.rect(-8, -8, 16, 16)
        }

        p5.drawingContext.shadowBlur = 0

        p5.pop()
      }
    }
  }

  applyPowerUp(type) {
    if (type === "health") {
      this.player.health = Math.min(this.player.maxHealth, this.player.health + 80)
    } else if (type === "speed") {
      this.player.moveSpeed += 2
      setTimeout(() => {
        this.player.moveSpeed = Math.max(3, this.player.moveSpeed - 2)
      }, 5000)
    } else if (type === "power") {
      this.player.punchCooldown = 0
    }
  }

  endGame() {
    if (this.gameOver) return

    this.gameOver = true

    let winner
    if (this.player.getHealth() <= 0) {
      winner = "enemy"
    } else if (this.enemy.getHealth() <= 0) {
      winner = "player"
    } else {
      winner = this.player.getHealth() > this.enemy.getHealth() ? "player" : "enemy"
    }

    setTimeout(() => {
      this.onGameOver(winner, Math.floor(this.score))
    }, 1000)
  }

  handleKeyPressed(keyCode) {
    if (keyCode === this.p5.UP_ARROW || keyCode === 87) {
      this.player.isMovingUp = true
    }
    if (keyCode === this.p5.DOWN_ARROW || keyCode === 83) {
      this.player.isMovingDown = true
    }
    if (keyCode === this.p5.LEFT_ARROW || keyCode === 65) {
      this.player.isMovingLeft = true
    }
    if (keyCode === this.p5.RIGHT_ARROW || keyCode === 68) {
      this.player.isMovingRight = true
    }

    if (keyCode === 32) {
      this.player.punch("jab")
    }
    if (keyCode === 88) {
      this.player.punch("uppercut")
    }
    if (keyCode === 90) {
      this.player.punch("hook")
    }
    if (keyCode === 67) {
      this.player.punch("cross")
    }
  }

  handleKeyReleased(keyCode) {
    if (keyCode === this.p5.UP_ARROW || keyCode === 87) {
      this.player.isMovingUp = false
    }
    if (keyCode === this.p5.DOWN_ARROW || keyCode === 83) {
      this.player.isMovingDown = false
    }
    if (keyCode === this.p5.LEFT_ARROW || keyCode === 65) {
      this.player.isMovingLeft = false
    }
    if (keyCode === this.p5.RIGHT_ARROW || keyCode === 68) {
      this.player.isMovingRight = false
    }
  }
}

export default function GameComponent({ onGameOver, round, initialScore }: GameComponentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const gameManagerRef = useRef<any>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const setup = (p5: any, canvasParentRef: Element) => {
    p5.createCanvas(800, 600).parent(canvasParentRef)

    const player = new Player(p5, 200, 300, "player")
    const enemy = new Enemy(p5, 600, 300, "enemy", round)
    const playerHealthBar = new HealthBar(p5, 50, 30, 300, 30, "red")
    const enemyHealthBar = new HealthBar(p5, 450, 30, 300, 30, "blue")

    gameManagerRef.current = new GameManager(
      p5,
      player,
      enemy,
      playerHealthBar,
      enemyHealthBar,
      onGameOver,
      initialScore,
      round,
    )
  }

  const draw = (p5: any) => {
    if (gameManagerRef.current) {
      gameManagerRef.current.update()
      gameManagerRef.current.draw()
    }
  }

  const keyPressed = (p5: any) => {
    if (gameManagerRef.current) {
      gameManagerRef.current.handleKeyPressed(p5.keyCode)
    }
  }

  const keyReleased = (p5: any) => {
    if (gameManagerRef.current) {
      gameManagerRef.current.handleKeyReleased(p5.keyCode)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] w-[800px] bg-gray-800 rounded-lg">
        <div className="text-2xl mb-4">Loading Game...</div>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 animate-pulse rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative border-4 border-yellow-500 rounded-lg overflow-hidden">
      <Sketch setup={setup} draw={draw} keyPressed={keyPressed} keyReleased={keyReleased} />
    </div>
  )
}
