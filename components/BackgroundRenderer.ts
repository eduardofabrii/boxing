import p5 from 'p5';


export class BackgroundRenderer {
  private p5: p5;
  private cameraShake = { x: 0, y: 0, intensity: 0, duration: 0 };
  private animationOffset = 0;
  private ringRopes: RingRope[] = [];
  private cornerPosts: CornerPost[] = [];
  private ringImage: p5.Image | null = null;
  private crowd: CrowdMember[] = [];
  private crowdSections: CrowdSection[] = [];
  private spotlights: Spotlight[] = [];
  private lightBeams: LightBeam[] = [];
  private atmosphereParticles: AtmosphereParticle[] = [];
  private flashEffects: FlashEffect[] = [];

  constructor(p5Instance: p5) {
    this.p5 = p5Instance;
    this.loadRingImage();
    this.initializeRing();
  }  private loadRingImage() {
    try {
      this.ringImage = this.p5.loadImage('/rinque de boxe.jpg');
    } catch (error) {
      console.log('Imagem do ring não encontrada, usando desenho procedural');
    }
  }
  private initializeCrowd() {
    const p5 = this.p5;
    
    this.initializeCrowdSections();
    
    for (let i = 0; i < 16; i++) {
      this.crowd.push({
        x: i * 50 + 10,
        y: 120,
        size: p5.random(18, 28),
        color: p5.color(p5.random(120, 255), p5.random(120, 255), p5.random(120, 255)),
        animationSpeed: p5.random(0.03, 0.1),
        animationOffset: p5.random(0, p5.TWO_PI),
        excitement: 0.8,
        type: p5.random() > 0.3 ? 'excited' : 'normal',
        cheering: p5.random() > 0.5,
        armPosition: p5.random(0, p5.TWO_PI),
        headBob: p5.random(0.02, 0.08)
      });
    }

    for (let i = 0; i < 14; i++) {
      this.crowd.push({
        x: i * 58 + 30,
        y: 90,
        size: p5.random(15, 22),
        color: p5.color(p5.random(100, 220), p5.random(100, 220), p5.random(100, 220)),
        animationSpeed: p5.random(0.02, 0.07),
        animationOffset: p5.random(0, p5.TWO_PI),
        excitement: 0.6,
        type: p5.random() > 0.6 ? 'excited' : 'normal',
        cheering: p5.random() > 0.7,
        armPosition: p5.random(0, p5.TWO_PI),
        headBob: p5.random(0.015, 0.06)
      });
    }

    for (let i = 0; i < 12; i++) {
      this.crowd.push({
        x: i * 67 + 50,
        y: 60,
        size: p5.random(12, 18),
        color: p5.color(p5.random(80, 180), p5.random(80, 180), p5.random(80, 180)),
        animationSpeed: p5.random(0.01, 0.05),
        animationOffset: p5.random(0, p5.TWO_PI),
        excitement: 0.4,
        type: p5.random() > 0.8 ? 'excited' : 'normal',
        cheering: p5.random() > 0.8,
        armPosition: p5.random(0, p5.TWO_PI),
        headBob: p5.random(0.01, 0.04)
      });
    }

    for (let i = 0; i < 10; i++) {
      this.crowd.push({
        x: i * 80 + 70,
        y: 35,
        size: p5.random(8, 14),
        color: p5.color(p5.random(60, 140), p5.random(60, 140), p5.random(60, 140)),
        animationSpeed: p5.random(0.008, 0.03),
        animationOffset: p5.random(0, p5.TWO_PI),
        excitement: 0.3,
        type: 'normal',
        cheering: p5.random() > 0.9,
        armPosition: p5.random(0, p5.TWO_PI),
        headBob: p5.random(0.005, 0.02)
      });
    }

    for (let i = 0; i < 8; i++) {
      this.crowd.push({
        x: 20,
        y: 80 + i * 15,
        size: p5.random(10, 16),
        color: p5.color(p5.random(90, 200), p5.random(90, 200), p5.random(90, 200)),
        animationSpeed: p5.random(0.02, 0.06),
        animationOffset: p5.random(0, p5.TWO_PI),
        excitement: 0.5,
        type: p5.random() > 0.7 ? 'excited' : 'normal',
        cheering: p5.random() > 0.6,
        armPosition: p5.random(0, p5.TWO_PI),
        headBob: p5.random(0.01, 0.05)
      });
    }

    for (let i = 0; i < 8; i++) {
      this.crowd.push({
        x: 780,
        y: 80 + i * 15,
        size: p5.random(10, 16),
        color: p5.color(p5.random(90, 200), p5.random(90, 200), p5.random(90, 200)),
        animationSpeed: p5.random(0.02, 0.06),
        animationOffset: p5.random(0, p5.TWO_PI),
        excitement: 0.5,
        type: p5.random() > 0.7 ? 'excited' : 'normal',
        cheering: p5.random() > 0.6,
        armPosition: p5.random(0, p5.TWO_PI),
        headBob: p5.random(0.01, 0.05)
      });
    }
  }

  private initializeCrowdSections() {
    const p5 = this.p5;
    
    this.crowdSections = [
      {
        startIndex: 0,
        endIndex: 16,
        waveOffset: 0,
        waveSpeed: 0.05,
        excitement: 0.8
      },
      {
        startIndex: 16,
        endIndex: 30,
        waveOffset: p5.PI / 4,
        waveSpeed: 0.04,
        excitement: 0.6
      },
      {
        startIndex: 30,
        endIndex: 42,
        waveOffset: p5.PI / 2,
        waveSpeed: 0.03,
        excitement: 0.4
      },
      {
        startIndex: 42,
        endIndex: 52,
        waveOffset: 3 * p5.PI / 4,
        waveSpeed: 0.02,
        excitement: 0.3
      }
    ];
  }  private initializeSpotlights() {
    const p5 = this.p5;
    
    this.spotlights = [
      {
        x: 400,
        y: -50,
        intensity: 1.2,
        color: p5.color(255, 255, 240, 150),
        angle: p5.PI / 3,
        direction: p5.PI / 2,
        oscillation: 0.02,
        type: 'main',
        radius: 400,
        focused: true
      },
      {
        x: 150,
        y: -30,
        intensity: 0.9,
        color: p5.color(255, 240, 200, 120),
        angle: p5.PI / 4,
        direction: p5.PI / 3,
        oscillation: 0.03,
        type: 'side',
        radius: 350,
        focused: false
      },
      {
        x: 650,
        y: -30,
        intensity: 0.9,
        color: p5.color(255, 240, 200, 120),
        angle: p5.PI / 4,
        direction: 2 * p5.PI / 3,
        oscillation: 0.03,
        type: 'side',
        radius: 350,
        focused: false
      },
      // Spotlights secundários
      {
        x: 100,
        y: 20,
        intensity: 0.7,
        color: p5.color(200, 220, 255, 100),
        angle: p5.PI / 5,
        direction: p5.PI / 4,
        oscillation: 0.04,
        type: 'secondary',
        radius: 300,
        focused: false
      },
      {
        x: 700,
        y: 20,
        intensity: 0.7,
        color: p5.color(200, 220, 255, 100),
        angle: p5.PI / 5,
        direction: 3 * p5.PI / 4,
        oscillation: 0.04,
        type: 'secondary',
        radius: 300,
        focused: false
      },
      // Spotlights de ambiente
      {
        x: 50,
        y: 50,
        intensity: 0.5,
        color: p5.color(255, 200, 150, 80),
        angle: p5.PI / 6,
        direction: 0,
        oscillation: 0.05,
        type: 'ambient',
        radius: 250,
        focused: false
      },
      {
        x: 750,
        y: 50,
        intensity: 0.5,
        color: p5.color(255, 200, 150, 80),
        angle: p5.PI / 6,
        direction: p5.PI,
        oscillation: 0.05,
        type: 'ambient',
        radius: 250,
        focused: false
      },
      // Spotlights do teto
      {
        x: 300,
        y: -80,
        intensity: 0.8,
        color: p5.color(255, 255, 255, 110),
        angle: p5.PI / 8,
        direction: p5.PI / 2.2,
        oscillation: 0.01,
        type: 'ceiling',
        radius: 200,
        focused: true
      },
      {
        x: 500,
        y: -80,
        intensity: 0.8,
        color: p5.color(255, 255, 255, 110),
        angle: p5.PI / 8,
        direction: p5.PI / 1.8,
        oscillation: 0.01,
        type: 'ceiling',
        radius: 200,
        focused: true
      }
    ];
  }

  private initializeLightBeams() {
    const p5 = this.p5;
    
    for (let i = 0; i < 12; i++) {
      this.lightBeams.push({
        startX: p5.random(100, 700),
        startY: p5.random(-100, 0),
        endX: p5.random(200, 600),
        endY: p5.random(400, 500),
        intensity: p5.random(0.1, 0.4),
        color: p5.color(255, 255, 240, p5.random(20, 60)),
        width: p5.random(5, 20),
        animationSpeed: p5.random(0.01, 0.03),
        animationOffset: p5.random(0, p5.TWO_PI),
        type: p5.random(['dust', 'smoke', 'pure'])
      });
    }
  }

  private initializeAtmosphere() {
    const p5 = this.p5;
    
    // Partículas atmosféricas
    for (let i = 0; i < 50; i++) {
      this.atmosphereParticles.push({
        x: p5.random(0, 800),
        y: p5.random(100, 500),
        vx: p5.random(-0.5, 0.5),
        vy: p5.random(-0.3, 0.3),
        size: p5.random(1, 4),
        alpha: p5.random(10, 40),
        type: p5.random(['dust', 'smoke', 'spark']),
        life: p5.random(100, 300),
        maxLife: 300
      });
    }
  }

  private initializeRing() {
    const p5 = this.p5;
    
    // Initialize ring ropes
    const ringY = 520;
    const ropeHeights = [ringY + 20, ringY + 40, ringY + 60];
    
    for (const height of ropeHeights) {
      this.ringRopes.push({
        startX: 50,
        startY: height,
        endX: p5.width - 50,
        endY: height,
        tension: p5.random(0.8, 1.2)
      });
    }
    
    // Initialize corner posts
    this.cornerPosts = [
      {
        x: 50,
        y: ringY,
        height: 80,
        color: p5.color(100, 100, 100)
      },
      {
        x: p5.width - 50,
        y: ringY,
        height: 80,
        color: p5.color(100, 100, 100)
      }
    ];
  }
  update() {
    this.animationOffset += 0.02;
    
    // Atualiza multidão
    for (const member of this.crowd) {
      member.animationOffset += member.animationSpeed;
      
      // Atualiza animações individuais
      if (member.type === 'excited') {
        member.armPosition += 0.1;
        member.cheering = this.p5.random() > 0.3;
      } else {
        member.armPosition += 0.05;
        member.cheering = this.p5.random() > 0.8;
      }
    }

    // Atualiza seções da multidão para efeito de onda
    for (const section of this.crowdSections) {
      section.waveOffset += section.waveSpeed;
    }

    // Atualiza camera shake
    if (this.cameraShake.duration > 0) {
      this.cameraShake.duration--;
      this.cameraShake.x = this.p5.random(-this.cameraShake.intensity, this.cameraShake.intensity);
      this.cameraShake.y = this.p5.random(-this.cameraShake.intensity, this.cameraShake.intensity);
    } else {
      this.cameraShake.x = 0;
      this.cameraShake.y = 0;
      this.cameraShake.intensity = 0;
    }

    // Atualiza spotlights
    for (const spotlight of this.spotlights) {
      if (spotlight.type === 'main') {
        spotlight.intensity = 1.0 + Math.sin(this.animationOffset * 2) * 0.2;
      }
      
      // Varia intensidade dos spotlights secundários
      if (spotlight.type === 'secondary') {
        spotlight.intensity = 0.5 + Math.sin(this.animationOffset * 1.5 + spotlight.x * 0.01) * 0.3;
      }
    }

    // Atualiza feixes de luz
    for (const beam of this.lightBeams) {
      beam.animationOffset += beam.animationSpeed;
      
      // Varia intensidade dos feixes
      beam.intensity = Math.max(0.1, beam.intensity + Math.sin(this.animationOffset * 3) * 0.1);
    }

    // Atualiza partículas atmosféricas
    for (let i = this.atmosphereParticles.length - 1; i >= 0; i--) {
      const particle = this.atmosphereParticles[i];
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      // Adiciona deriva pelo vento
      particle.vx += this.p5.random(-0.005, 0.005);
      particle.vy += 0.005; // Gravidade sutil
      
      // Remove partículas que saíram da tela ou morreram
      if (particle.life <= 0 || particle.x < -50 || particle.x > 850 || particle.y > 650) {
        this.atmosphereParticles.splice(i, 1);
      }
    }

    // Atualiza efeitos de flash
    for (let i = this.flashEffects.length - 1; i >= 0; i--) {
      const flash = this.flashEffects[i];
      flash.life--;
      
      if (flash.life <= 0) {
        this.flashEffects.splice(i, 1);
      }
    }

    // Adiciona novas partículas atmosféricas periodicamente
    if (this.p5.frameCount % 15 === 0) {
      this.addAtmosphereParticle();
    }

    // Adiciona flashes de câmera ocasionalmente
    if (this.p5.random() < 0.008) {
      this.addCameraFlash();
    }
  }

  private addAtmosphereParticle() {
    const p5 = this.p5;
    
    this.atmosphereParticles.push({
      x: p5.random(-50, 850),
      y: p5.random(100, 250),
      vx: p5.random(-0.5, 0.5),
      vy: p5.random(0.1, 0.8),
      size: p5.random(1, 4),
      alpha: p5.random(15, 50),
      type: p5.random(['dust', 'smoke', 'spark']),
      life: p5.random(150, 400),
      maxLife: 400
    });
  }

  private addCameraFlash() {
    const p5 = this.p5;
    
    this.flashEffects.push({
      x: p5.random(50, 750),
      y: p5.random(40, 140),
      size: p5.random(15, 35),
      life: p5.random(8, 15),
      maxLife: 15
    });
  }
  draw() {
    const p5 = this.p5;
    
    p5.push();
    p5.translate(this.cameraShake.x, this.cameraShake.y);
    
    this.drawBackground();
    this.drawLightBeams();
    this.drawRing();
    this.drawCrowd();
    this.drawSpotlights();
    this.drawAtmosphere();
    this.drawFlashEffects();
    
    p5.pop();
  }

  private drawBackground() {
    const p5 = this.p5;
    
    // Fundo da arena com gradiente mais dramático
    for (let i = 0; i <= p5.height; i++) {
      const inter = p5.map(i, 0, p5.height, 0, 1);
      const c = p5.lerpColor(
        p5.color(15, 15, 35), 
        p5.color(5, 5, 12), 
        inter
      );
      p5.stroke(c);
      p5.line(0, i, p5.width, i);
    }

    // Arquibancadas com perspectiva
    p5.fill(35, 35, 65);
    p5.noStroke();
    
    // Arquibancada principal
    p5.beginShape();
    p5.vertex(0, 0);
    p5.vertex(p5.width, 0);
    p5.vertex(p5.width - 50, 140);
    p5.vertex(50, 140);
    p5.endShape(p5.CLOSE);
    
    // Seções das arquibancadas
    p5.fill(45, 45, 85);
    for (let i = 0; i < 8; i++) {
      const sectionWidth = p5.width / 8;
      p5.rect(i * sectionWidth, 0, sectionWidth - 2, 140);
    }
    
    // Detalhes estruturais
    p5.fill(60, 60, 100);
    for (let i = 0; i <= 8; i++) {
      const x = i * (p5.width / 8);
      p5.rect(x - 1, 0, 3, 140);
    }
    
    // Fileiras das arquibancadas
    p5.stroke(30, 30, 50);
    p5.strokeWeight(1);
    for (let y = 20; y <= 120; y += 20) {
      p5.line(50, y, p5.width - 50, y);
    }
    
    // Logo da arena no fundo
    p5.push();
    p5.translate(p5.width / 2, 60);
    p5.fill(120, 120, 180, 40);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(32);
    p5.textStyle(p5.BOLD);
    p5.text("BOXING", 0, -8);
    p5.textSize(24);
    p5.text("CHAMPIONSHIP", 0, 12);
    p5.pop();
    
    // Banners laterais
    this.drawBanners();
  }

  private drawBanners() {
    const p5 = this.p5;
    
    // Banners nas laterais da arena
    const bannerTexts = ["BOXING", "FIGHT", "CHAMPION", "ARENA"];
    
    for (let i = 0; i < bannerTexts.length; i++) {
      // Banner esquerdo
      p5.push();
      p5.translate(30, 100 + i * 60);
      p5.rotate(-p5.PI / 12);
      p5.fill(80 + i * 20, 20, 20, 120);
      p5.rect(-40, -10, 80, 20, 5);
      p5.fill(255, 255, 255, 200);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(8);
      p5.text(bannerTexts[i], 0, 0);
      p5.pop();
      
      // Banner direito
      p5.push();
      p5.translate(p5.width - 30, 100 + i * 60);
      p5.rotate(p5.PI / 12);
      p5.fill(20, 20, 80 + i * 20, 120);
      p5.rect(-40, -10, 80, 20, 5);
      p5.fill(255, 255, 255, 200);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(8);
      p5.text(bannerTexts[i], 0, 0);
      p5.pop();
    }
  }  private drawRing() {
    const p5 = this.p5;
    
    // Se a imagem do ring foi carregada, usar ela como base
    if (this.ringImage && this.ringImage.width > 0) {
      this.drawRingWithImage();
    } else {
      this.drawProceduralRing();
    }
  }

  private drawRingWithImage() {
    const p5 = this.p5;
    
    // Posiciona e escala a imagem do ring
    const ringY = 350;
    const ringScale = 0.8;
    const imageWidth = this.ringImage!.width * ringScale;
    const imageHeight = this.ringImage!.height * ringScale;
    const ringX = (p5.width - imageWidth) / 2;
    
    p5.push();
    
    // Sombra da imagem
    p5.tint(0, 0, 0, 100);
    p5.image(this.ringImage!, ringX + 10, ringY + 10, imageWidth, imageHeight);
    
    // Imagem principal
    p5.tint(255, 255, 255);
    p5.image(this.ringImage!, ringX, ringY, imageWidth, imageHeight);
    
    p5.pop();
    
    // Adiciona efeitos sobre a imagem
    this.addRingEffects(ringX, ringY, imageWidth, imageHeight);
  }

  private drawProceduralRing() {
    const p5 = this.p5;
    
    // Ring procedural melhorado (fallback)
    const ringY = 400;
    const ringHeight = 200;
    const ringWidth = p5.width - 100;
    const ringX = 50;
    
    // Plataforma elevada com perspectiva
    p5.fill(60, 60, 80);
    p5.stroke(40, 40, 60);
    p5.strokeWeight(3);
    
    // Base da plataforma
    p5.beginShape();
    p5.vertex(ringX - 20, ringY + ringHeight);
    p5.vertex(ringX + ringWidth + 20, ringY + ringHeight);
    p5.vertex(ringX + ringWidth - 10, ringY + 20);
    p5.vertex(ringX + 10, ringY + 20);
    p5.endShape(p5.CLOSE);
    
    // Superfície do ring
    const canvasY = ringY + 30;
    const canvasHeight = ringHeight - 60;
    
    p5.fill(240, 230, 210);
    p5.stroke(200, 190, 170);
    p5.strokeWeight(2);
    p5.rect(ringX + 30, canvasY, ringWidth - 60, canvasHeight, 5);
    
    // Padrão da lona
    this.drawCanvasPattern(ringX + 30, canvasY, ringWidth - 60, canvasHeight);
    
    // Logo central
    this.drawCenterLogo(p5.width / 2, canvasY + canvasHeight / 2);
    
    // Cordas e postes
    this.drawRingRopes(canvasY, canvasHeight, ringX, ringWidth);
    
    this.addRingEffects(ringX, ringY, ringWidth, ringHeight);
  }

  private addRingEffects(ringX: number, ringY: number, ringWidth: number, ringHeight: number) {
    const p5 = this.p5;
    
    // Brilho no centro do ring
    p5.push();
    p5.translate(p5.width / 2, ringY + ringHeight / 2);
    
    // Foco principal de luz
    const glowSize = 300 + Math.sin(this.animationOffset * 2) * 30;
    for (let i = 5; i > 0; i--) {
      p5.fill(255, 255, 240, 15 - i * 2);
      p5.noStroke();
      p5.ellipse(0, 0, glowSize * (i / 5), glowSize * (i / 5) * 0.6);
    }
    
    p5.pop();
    
    // Reflexos nos cantos
    p5.fill(255, 255, 255, 40);
    p5.noStroke();
    p5.ellipse(ringX + 50, ringY + 50, 30, 30);
    p5.ellipse(ringX + ringWidth - 50, ringY + 50, 30, 30);
    
    // Poeira no ar sobre o ring
    for (let i = 0; i < 20; i++) {
      const x = ringX + p5.random(ringWidth);
      const y = ringY + p5.random(ringHeight / 2);
      p5.fill(255, 255, 255, p5.random(10, 30));
      p5.ellipse(x, y, p5.random(2, 5), p5.random(2, 5));
    }
  }

  private drawCanvasPattern(x: number, y: number, w: number, h: number) {
    const p5 = this.p5;
    
    // Padrão xadrez sutil
    p5.fill(235, 225, 205, 150);
    p5.noStroke();
    const squareSize = 25;
    
    for (let i = x; i < x + w; i += squareSize * 2) {
      for (let j = y; j < y + h; j += squareSize * 2) {
        p5.rect(i, j, squareSize, squareSize);
        p5.rect(i + squareSize, j + squareSize, squareSize, squareSize);
      }
    }
  }

  private drawCenterLogo(x: number, y: number) {
    const p5 = this.p5;
    
    p5.push();
    p5.translate(x, y);
    
    // Logo circular
    p5.fill(200, 180, 160, 100);
    p5.stroke(180, 160, 140);
    p5.strokeWeight(3);
    p5.ellipse(0, 0, 120, 120);
    
    // Texto do logo
    p5.fill(160, 140, 120, 180);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(16);
    p5.textStyle(p5.BOLD);
    p5.text("CHAMPIONSHIP", 0, -8);
    p5.textSize(12);
    p5.text("BOXING", 0, 8);
    
    p5.pop();
  }
  private drawRopes(ringY: number, ringHeight: number) {
    const p5 = this.p5;
    
    // Cordas do ring em três níveis com postes metálicos
    const ropeHeights = [ringY + 15, ringY + 35, ringY + 55];
    const postWidth = 6;
    const postHeight = 60;
    
    // Postes dos cantos
    p5.fill(80, 80, 90);
    p5.stroke(60, 60, 70);
    p5.strokeWeight(1);
    
    // Postes esquerdos
    p5.rect(44, ringY + 5, postWidth, postHeight);
    p5.rect(44, ringY + ringHeight - postHeight - 5, postWidth, postWidth);
    
    // Postes direitos  
    p5.rect(p5.width - 50, ringY + 5, postWidth, postHeight);
    p5.rect(p5.width - 50, ringY + ringHeight - postHeight - 5, postWidth, postWidth);
    
    // Detalhes metálicos dos postes
    p5.fill(100, 100, 110);
    p5.noStroke();
    p5.rect(45, ringY + 5, 4, postHeight);
    p5.rect(p5.width - 49, ringY + 5, 4, postHeight);
    
    // Cordas com efeito 3D
    for (let i = 0; i < ropeHeights.length; i++) {
      const height = ropeHeights[i];
      
      // Sombra da corda
      p5.stroke(180, 180, 180, 100);
      p5.strokeWeight(6);
      p5.line(50, height + 2, p5.width - 50, height + 2);
      
      // Corda principal
      p5.stroke(255, 255, 255);
      p5.strokeWeight(5);
      p5.line(50, height, p5.width - 50, height);
      
      // Brilho na corda
      p5.stroke(255, 255, 255, 200);
      p5.strokeWeight(2);
      p5.line(50, height - 1, p5.width - 50, height - 1);
      
      // Conectores das cordas nos postes
      p5.fill(60, 60, 70);
      p5.noStroke();
      p5.ellipse(47, height, 8, 8);
      p5.ellipse(p5.width - 47, height, 8, 8);
      
      // Detalhes metálicos dos conectores
      p5.fill(80, 80, 90);
      p5.ellipse(47, height, 5, 5);
      p5.ellipse(p5.width - 47, height, 5, 5);
    }
    
    // Turnbuckles (tensores) nas cordas
    for (let i = 0; i < ropeHeights.length; i++) {
      const height = ropeHeights[i];
      
      // Turnbuckles esquerdos
      p5.fill(70, 70, 80);
      p5.stroke(50, 50, 60);
      p5.strokeWeight(1);
      p5.rect(75, height - 3, 12, 6);
      
      // Turnbuckles direitos
      p5.rect(p5.width - 87, height - 3, 12, 6);
      
      // Detalhes dos turnbuckles
      p5.fill(90, 90, 100);
      p5.noStroke();
      p5.rect(76, height - 2, 10, 4);
      p5.rect(p5.width - 86, height - 2, 10, 4);
    }
  }
  private drawCrowd() {
    const p5 = this.p5;
    
    for (let i = 0; i < this.crowd.length; i++) {
      const member = this.crowd[i];
      
      // Animação de seção (onda mexicana)
      let sectionWave = 0;
      for (const section of this.crowdSections) {
        if (i >= section.startIndex && i < section.endIndex) {
          sectionWave = Math.sin(this.animationOffset * section.waveSpeed + section.waveOffset) * section.excitement * 10;
          break;
        }
      }
      
      p5.push();
      p5.translate(
        member.x + Math.sin(member.animationOffset) * member.excitement * 3,
        member.y + Math.cos(member.animationOffset * member.headBob) * member.excitement * 2 + sectionWave
      );
      
      // Sombra da pessoa
      p5.fill(0, 0, 0, 50);
      p5.noStroke();
      p5.ellipse(2, member.size * 0.8, member.size * 0.8, member.size * 0.3);
      
      // Corpo principal
      p5.fill(member.color);
      p5.stroke(p5.lerpColor(member.color, p5.color(0), 0.3));
      p5.strokeWeight(1);
      p5.ellipse(0, 0, member.size, member.size * 1.3);
      
      // Cabeça
      const headColor = p5.color(
        p5.red(member.color) * 0.9 + 30,
        p5.green(member.color) * 0.9 + 20,
        p5.blue(member.color) * 0.9 + 10
      );
      p5.fill(headColor);
      p5.ellipse(0, -member.size * 0.8, member.size * 0.7, member.size * 0.7);
      
      // Cabelo
      p5.fill(p5.random(20, 80), p5.random(10, 40), p5.random(5, 30));
      p5.noStroke();
      p5.arc(0, -member.size * 0.8, member.size * 0.7, member.size * 0.5, p5.PI, p5.TWO_PI);
      
      // Características faciais
      if (member.size > 15) {
        // Olhos
        p5.fill(255);
        p5.ellipse(-member.size * 0.15, -member.size * 0.85, 3, 3);
        p5.ellipse(member.size * 0.15, -member.size * 0.85, 3, 3);
        
        // Pupilas
        p5.fill(0);
        p5.ellipse(-member.size * 0.15, -member.size * 0.85, 1, 1);
        p5.ellipse(member.size * 0.15, -member.size * 0.85, 1, 1);
        
        // Boca
        if (member.cheering) {
          p5.fill(100, 0, 0);
          p5.ellipse(0, -member.size * 0.7, 4, 3);
        } else {
          p5.stroke(0);
          p5.strokeWeight(0.5);
          p5.point(0, -member.size * 0.7);
        }
      }
      
      // Braços animados
      if (member.type === 'excited' || member.cheering) {
        p5.stroke(headColor);
        p5.strokeWeight(3);
        
        const armAnimation = Math.sin(member.animationOffset + member.armPosition) * 0.5 + 0.5;
        const leftArmY = -member.size * 0.3 - armAnimation * member.size * 0.4;
        const rightArmY = -member.size * 0.3 - (1 - armAnimation) * member.size * 0.4;
        
        // Braço esquerdo
        p5.line(-member.size * 0.4, -member.size * 0.2, -member.size * 0.7, leftArmY);
        // Braço direito  
        p5.line(member.size * 0.4, -member.size * 0.2, member.size * 0.7, rightArmY);
        
        // Mãos
        p5.fill(headColor);
        p5.noStroke();
        p5.ellipse(-member.size * 0.7, leftArmY, 4, 4);
        p5.ellipse(member.size * 0.7, rightArmY, 4, 4);
      }
      
      // Roupas/acessórios
      if (p5.random() > 0.7) {
        // Chapéu ou boné
        p5.fill(p5.random(100, 255), p5.random(100, 255), p5.random(100, 255));
        p5.ellipse(0, -member.size * 1.1, member.size * 0.5, member.size * 0.3);
      }
      
      // Itens especiais para torcedores animados
      if (member.type === 'excited') {
        // Cartaz ou bandeira
        if (p5.random() > 0.8) {
          p5.fill(255, 255, 0);
          p5.stroke(150, 150, 0);
          p5.strokeWeight(1);
          p5.rect(-8, -member.size * 1.3, 16, 8);
          p5.fill(0);
          p5.noStroke();
          p5.textAlign(p5.CENTER);
          p5.textSize(3);
          p5.text("GO!", 0, -member.size * 1.26);
        }
      }
      
      p5.pop();
    }
  }

  private drawLightBeams() {
    const p5 = this.p5;
    
    p5.push();
    p5.blendMode(p5.ADD);
    
    for (const beam of this.lightBeams) {
      const oscillation = Math.sin(this.animationOffset * beam.animationSpeed + beam.animationOffset);
      const currentIntensity = beam.intensity * (0.7 + oscillation * 0.3);
      
      // Calcula posição animada
      const animatedEndX = beam.endX + oscillation * 20;
      const animatedEndY = beam.endY + Math.cos(this.animationOffset * beam.animationSpeed * 0.7) * 10;
      
      // Desenha o feixe com múltiplas camadas
      for (let layer = 0; layer < 3; layer++) {
        const layerWidth = beam.width * (3 - layer) / 3;
        const layerAlpha = currentIntensity * (layer + 1) / 3;
        
        p5.stroke(p5.red(beam.color), p5.green(beam.color), p5.blue(beam.color), layerAlpha * 255);
        p5.strokeWeight(layerWidth);
        
        if (beam.type === 'dust') {
          // Feixe com partículas de poeira
          const steps = 20;
          for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = p5.lerp(beam.startX, animatedEndX, t);
            const y = p5.lerp(beam.startY, animatedEndY, t);
            const dustOffset = Math.sin(t * p5.PI * 4 + this.animationOffset * 2) * 5;
            
            p5.point(x + dustOffset, y);
          }
        } else {
          // Feixe sólido
          p5.line(beam.startX, beam.startY, animatedEndX, animatedEndY);
        }
      }
        // Partículas no feixe
      if (beam.type === 'smoke') {
        for (let i = 0; i < 5; i++) {
          const t = p5.random();
          const x = p5.lerp(beam.startX, animatedEndX, t);
          const y = p5.lerp(beam.startY, animatedEndY, t);
          
          p5.fill(255, 255, 200, 150);
          p5.noStroke();
          p5.ellipse(x, y, 2, 2);
        }
      }
    }
    
    p5.blendMode(p5.BLEND);
    p5.pop();
  }
  private drawSpotlights() {
    const p5 = this.p5;
    
    p5.push();
    p5.blendMode(p5.ADD);
    
    for (const spotlight of this.spotlights) {
      // Movimento oscilante do spotlight
      const oscillation = Math.sin(this.animationOffset * spotlight.oscillation) * 0.3;
      const currentDirection = spotlight.direction + oscillation;
      
      p5.push();
      p5.translate(spotlight.x, spotlight.y);
      p5.rotate(currentDirection);
      
      // Múltiplas camadas do cone de luz
      const layers = spotlight.focused ? 5 : 3;
      
      for (let layer = 0; layer < layers; layer++) {
        const layerIntensity = spotlight.intensity * (layers - layer) / layers;
        const layerRadius = spotlight.radius * (layer + 1) / layers;
        const layerAngle = spotlight.angle * (1 + layer * 0.1);
        
        const alpha = layerIntensity * 255 / layers;
        p5.fill(p5.red(spotlight.color), p5.green(spotlight.color), p5.blue(spotlight.color), alpha);
        p5.noStroke();
        
        // Desenha o cone de luz
        p5.beginShape();
        p5.vertex(0, 0);
        for (let angle = -layerAngle / 2; angle <= layerAngle / 2; angle += 0.05) {
          const x = Math.cos(angle) * layerRadius;
          const y = Math.sin(angle) * layerRadius;
          p5.vertex(x, y);
        }
        p5.endShape(p5.CLOSE);
      }
      
      // Efeito de "gobo" (padrão na luz)
      if (spotlight.type === 'main') {
        p5.fill(0, 0, 0, 30);
        p5.noStroke();
        for (let i = 0; i < 8; i++) {
          const angle = (p5.TWO_PI * i) / 8;
          const x = Math.cos(angle) * 100;
          const y = Math.sin(angle) * 100;
          p5.ellipse(x, y, 20, 5);
        }
      }
      
      p5.pop();
    }
    
    p5.blendMode(p5.BLEND);
    p5.pop();
  }

  private drawAtmosphere() {
    const p5 = this.p5;
    
    // Atualiza e desenha partículas atmosféricas
    for (let i = this.atmosphereParticles.length - 1; i >= 0; i--) {
      const particle = this.atmosphereParticles[i];
      
      // Atualiza posição
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      // Remove partículas mortas
      if (particle.life <= 0) {
        this.atmosphereParticles.splice(i, 1);
        continue;
      }
      
      // Calcula alpha baseado na vida
      const lifeRatio = particle.life / particle.maxLife;
      const alpha = particle.alpha * lifeRatio;
      
      // Desenha partícula baseada no tipo
      switch (particle.type) {
        case 'dust':
          p5.fill(255, 255, 200, alpha);
          p5.noStroke();
          p5.ellipse(particle.x, particle.y, particle.size, particle.size);
          break;
          
        case 'smoke':
          p5.fill(200, 200, 220, alpha * 0.5);
          p5.noStroke();
          const smokeSize = particle.size * (2 - lifeRatio);
          p5.ellipse(particle.x, particle.y, smokeSize, smokeSize);
          break;
          
        case 'spark':
          p5.stroke(255, 255, 100, alpha);
          p5.strokeWeight(particle.size);
          p5.point(particle.x, particle.y);
          break;
      }
      
      // Adiciona movimento de deriva
      particle.vy += 0.01; // Gravidade sutil
      particle.vx += p5.random(-0.01, 0.01); // Deriva aleatória
    }
    
    // Adiciona novas partículas
    if (p5.frameCount % 10 === 0) {
      this.atmosphereParticles.push({
        x: p5.random(0, 800),
        y: p5.random(100, 200),
        vx: p5.random(-0.3, 0.3),
        vy: p5.random(0.1, 0.5),
        size: p5.random(1, 3),
        alpha: p5.random(20, 60),
        type: p5.random(['dust', 'smoke', 'spark']),
        life: p5.random(200, 400),
        maxLife: 400
      });
    }
    
    // Névoa geral no ambiente
    for (let y = 300; y < 600; y += 80) {
      const fogginess = Math.sin(this.animationOffset * 0.5 + y * 0.01) * 10 + 15;
      p5.fill(255, 255, 255, fogginess);
      p5.noStroke();
      p5.ellipse(p5.width / 2, y, p5.width * 1.5, 60);
    }
  }

  private drawFlashEffects() {
    const p5 = this.p5;
    
    // Efeitos de flash das câmeras
    for (let i = this.flashEffects.length - 1; i >= 0; i--) {
      const flash = this.flashEffects[i];
      
      flash.life--;
      if (flash.life <= 0) {
        this.flashEffects.splice(i, 1);
        continue;
      }
      
      const lifeRatio = flash.life / flash.maxLife;
      const alpha = 255 * lifeRatio;
      
      p5.fill(255, 255, 255, alpha);
      p5.noStroke();
      p5.ellipse(flash.x, flash.y, flash.size * (2 - lifeRatio), flash.size * (2 - lifeRatio));
    }
    
    // Adiciona flashes aleatórios das câmeras
    if (p5.random() < 0.005) {
      this.flashEffects.push({
        x: p5.random(50, 750),
        y: p5.random(50, 120),
        size: p5.random(20, 40),
        life: 10,
        maxLife: 10
      });
    }
  }

  private drawRingRopes(ringY: number, ringHeight: number, ringX: number, ringWidth: number) {
    const p5 = this.p5;
    
    // Cordas do ring em três níveis
    const ropeHeights = [ringY + 15, ringY + 35, ringY + 55];
    const postWidth = 8;
    const postHeight = 70;
    
    // Postes dos cantos com detalhes metálicos
    p5.fill(90, 90, 100);
    p5.stroke(70, 70, 80);
    p5.strokeWeight(2);
    
    // Postes esquerdos
    p5.rect(ringX + 25, ringY, postWidth, postHeight);
    p5.rect(ringX + ringWidth - 33, ringY, postWidth, postHeight);
    
    // Detalhes metálicos
    p5.fill(110, 110, 120);
    p5.noStroke();
    p5.rect(ringX + 26, ringY + 2, 6, postHeight - 4);
    p5.rect(ringX + ringWidth - 32, ringY + 2, 6, postHeight - 4);
    
    // Cordas com efeito 3D
    for (let i = 0; i < ropeHeights.length; i++) {
      const height = ropeHeights[i];
      
      // Sombra da corda
      p5.stroke(200, 200, 200, 80);
      p5.strokeWeight(8);
      p5.line(ringX + 30, height + 3, ringX + ringWidth - 30, height + 3);
      
      // Corda principal
      p5.stroke(255, 255, 255, 200);
      p5.strokeWeight(6);
      p5.line(ringX + 30, height, ringX + ringWidth - 30, height);
      
      // Brilho na corda
      p5.stroke(255, 255, 255, 255);
      p5.strokeWeight(2);
      p5.line(ringX + 30, height - 2, ringX + ringWidth - 30, height - 2);
      
      // Conectores nos postes
      p5.fill(70, 70, 80);
      p5.stroke(50, 50, 60);
      p5.strokeWeight(1);
      p5.ellipse(ringX + 29, height, 10, 10);
      p5.ellipse(ringX + ringWidth - 29, height, 10, 10);
    }
  }
  addCameraShake(intensity: number, duration: number) {
    this.cameraShake.intensity = intensity;
    this.cameraShake.duration = duration;
  }

  setCrowdExcitement(level: number) {
    for (const member of this.crowd) {
      member.excitement = level;
      if (level > 0.7) {
        member.type = 'excited';
        member.cheering = true;
      } else if (level > 0.4) {
        member.type = 'normal';
        member.cheering = this.p5.random() > 0.5;
      } else {
        member.type = 'normal';
        member.cheering = false;
      }
    }
  }

  // Eventos específicos do jogo
  onPunchLanded(intensity: number) {
    this.addCameraShake(intensity * 5, 10);
    this.setCrowdExcitement(0.8 + intensity * 0.2);
    
    // Adiciona flashes de câmera extras para momentos importantes
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.addCameraFlash(), i * 50);
    }
  }

  onKnockdown() {
    this.addCameraShake(15, 30);
    this.setCrowdExcitement(1.0);
    
    // Onda de excitação na multidão
    for (const section of this.crowdSections) {
      section.waveSpeed = 0.1;
      section.excitement = 1.0;
    }
    
    // Múltiplos flashes
    for (let i = 0; i < 8; i++) {
      setTimeout(() => this.addCameraFlash(), i * 100);
    }
  }

  onRoundStart() {
    this.setCrowdExcitement(0.6);
    
    // Reset das ondas da multidão
    for (const section of this.crowdSections) {
      section.waveSpeed = section.waveSpeed * 0.5;
    }
  }

  onRoundEnd() {
    this.setCrowdExcitement(0.3);
  }

  // Efeitos atmosféricos especiais
  addSmokeEffect(x: number, y: number, intensity: number = 1) {
    const p5 = this.p5;
    
    for (let i = 0; i < 10 * intensity; i++) {
      this.atmosphereParticles.push({
        x: x + p5.random(-20, 20),
        y: y + p5.random(-10, 10),
        vx: p5.random(-1, 1),
        vy: p5.random(-2, -0.5),
        size: p5.random(3, 8),
        alpha: p5.random(30, 80),
        type: 'smoke',
        life: p5.random(100, 200),
        maxLife: 200
      });
    }
  }

  addSparkEffect(x: number, y: number, intensity: number = 1) {
    const p5 = this.p5;
    
    for (let i = 0; i < 15 * intensity; i++) {
      this.atmosphereParticles.push({
        x: x + p5.random(-15, 15),
        y: y + p5.random(-10, 10),
        vx: p5.random(-2, 2),
        vy: p5.random(-3, 1),
        size: p5.random(1, 3),
        alpha: p5.random(100, 200),
        type: 'spark',
        life: p5.random(30, 80),
        maxLife: 80
      });
    }
  }

  // Controle de iluminação dinâmica
  setMainLightIntensity(intensity: number) {
    for (const spotlight of this.spotlights) {
      if (spotlight.type === 'main') {
        spotlight.intensity = intensity;
      }
    }
  }

  flashArenaLights() {
    const originalIntensities = this.spotlights.map(s => s.intensity);
    
    // Flash brilhante
    for (const spotlight of this.spotlights) {
      spotlight.intensity = 2.0;
    }
    
    // Volta ao normal após um breve momento
    setTimeout(() => {
      this.spotlights.forEach((spotlight, index) => {
        spotlight.intensity = originalIntensities[index];
      });
    }, 100);
  }
}

interface CrowdMember {
  x: number;
  y: number;
  size: number;
  color: p5.Color;
  animationSpeed: number;
  animationOffset: number;
  excitement: number;
  type: 'normal' | 'excited';
  cheering: boolean;
  armPosition: number;
  headBob: number;
}

interface Spotlight {
  x: number;
  y: number;
  intensity: number;
  color: p5.Color;
  angle: number;
  direction: number;
  oscillation: number;
  type: 'main' | 'side' | 'secondary' | 'ambient' | 'ceiling';
  radius: number;
  focused: boolean;
}

interface RingRope {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  tension: number;
}

interface CornerPost {
  x: number;
  y: number;
  height: number;
  color: p5.Color;
}

interface CrowdSection {
  startIndex: number;
  endIndex: number;
  waveOffset: number;
  waveSpeed: number;
  excitement: number;
}

interface LightBeam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  intensity: number;
  color: p5.Color;
  width: number;
  animationSpeed: number;
  animationOffset: number;
  type: 'dust' | 'smoke' | 'pure';
}

interface AtmosphereParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  type: 'dust' | 'smoke' | 'spark';
  life: number;
  maxLife: number;
}

interface FlashEffect {
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
}
