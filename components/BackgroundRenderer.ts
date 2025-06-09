import p5 from 'p5';

export class BackgroundRenderer {
  private p5: p5;
  private crowd: CrowdMember[] = [];
  private spotlights: Spotlight[] = [];
  private cameraShake = { x: 0, y: 0, intensity: 0, duration: 0 };
  private animationOffset = 0;

  constructor(p5Instance: p5) {
    this.p5 = p5Instance;
    this.initializeCrowd();
    this.initializeSpotlights();
  }

  private initializeCrowd() {
    const p5 = this.p5;
    
    // Primeira fileira
    for (let i = 0; i < 12; i++) {
      this.crowd.push({
        x: i * 70 + 20,
        y: 100,
        size: p5.random(15, 25),
        color: p5.color(p5.random(100, 255), p5.random(100, 255), p5.random(100, 255)),
        animationSpeed: p5.random(0.02, 0.08),
        animationOffset: p5.random(0, p5.TWO_PI),
        excitement: 0.5,
        type: p5.random() > 0.5 ? 'normal' : 'excited'
      });
    }

    // Segunda fileira
    for (let i = 0; i < 10; i++) {
      this.crowd.push({
        x: i * 80 + 60,
        y: 70,
        size: p5.random(12, 20),
        color: p5.color(p5.random(80, 200), p5.random(80, 200), p5.random(80, 200)),
        animationSpeed: p5.random(0.02, 0.06),
        animationOffset: p5.random(0, p5.TWO_PI),
        excitement: 0.3,
        type: 'normal'
      });
    }

    // Terceira fileira
    for (let i = 0; i < 8; i++) {
      this.crowd.push({
        x: i * 100 + 80,
        y: 50,
        size: p5.random(8, 15),
        color: p5.color(p5.random(60, 150), p5.random(60, 150), p5.random(60, 150)),
        animationSpeed: p5.random(0.01, 0.04),
        animationOffset: p5.random(0, p5.TWO_PI),
        excitement: 0.2,
        type: 'normal'
      });
    }
  }

  private initializeSpotlights() {
    const p5 = this.p5;
    
    this.spotlights = [
      {
        x: 200,
        y: 0,
        intensity: 0.8,
        color: p5.color(255, 255, 200, 100),
        angle: p5.PI / 6,
        direction: p5.PI / 3,
        oscillation: 0.1
      },
      {
        x: 600,
        y: 0,
        intensity: 0.8,
        color: p5.color(200, 255, 255, 100),
        angle: p5.PI / 6,
        direction: 2 * p5.PI / 3,
        oscillation: 0.08
      },
      {
        x: 400,
        y: 0,
        intensity: 1.0,
        color: p5.color(255, 255, 255, 120),
        angle: p5.PI / 4,
        direction: p5.PI / 2,
        oscillation: 0.05
      }
    ];
  }

  update() {
    this.animationOffset += 0.02;
    
    // Atualiza multidão
    for (const member of this.crowd) {
      member.animationOffset += member.animationSpeed;
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
  }

  draw() {
    const p5 = this.p5;
    
    p5.push();
    p5.translate(this.cameraShake.x, this.cameraShake.y);
    
    this.drawBackground();
    this.drawRing();
    this.drawCrowd();
    this.drawSpotlights();
    this.drawAtmosphere();
    
    p5.pop();
  }

  private drawBackground() {
    const p5 = this.p5;
    
    // Gradiente de fundo da arena
    for (let i = 0; i <= p5.height; i++) {
      const inter = p5.map(i, 0, p5.height, 0, 1);
      const c = p5.lerpColor(p5.color(20, 20, 40), p5.color(5, 5, 15), inter);
      p5.stroke(c);
      p5.line(0, i, p5.width, i);
    }

    // Arquibancadas
    p5.fill(40, 40, 80);
    p5.noStroke();
    p5.rect(0, 0, p5.width, 120);
    
    // Detalhes das arquibancadas
    p5.fill(60, 60, 100);
    for (let i = 0; i < p5.width; i += 50) {
      p5.rect(i, 0, 2, 120);
    }
    
    // Logo da arena no fundo
    p5.push();
    p5.translate(p5.width / 2, 60);
    p5.fill(100, 100, 150, 50);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(24);
    p5.text("BOXING ARENA", 0, 0);
    p5.pop();
  }

  private drawRing() {
    const p5 = this.p5;
    
    // Lona do ringue
    const ringY = 520;
    const ringHeight = 100;
    
    // Sombra do ringue
    p5.fill(0, 0, 0, 100);
    p5.noStroke();
    p5.rect(50, ringY + 5, p5.width - 100, ringHeight);
    
    // Lona principal
    p5.fill(180, 150, 120);
    p5.stroke(100, 80, 60);
    p5.strokeWeight(2);
    p5.rect(50, ringY, p5.width - 100, ringHeight);
    
    // Linhas da lona
    p5.stroke(150, 120, 100);
    p5.strokeWeight(1);
    for (let i = 100; i < p5.width - 100; i += 40) {
      p5.line(i, ringY, i, ringY + ringHeight);
    }
    for (let i = ringY + 20; i < ringY + ringHeight; i += 20) {
      p5.line(50, i, p5.width - 50, i);
    }
    
    // Bordas do ringue
    p5.fill(200, 200, 200);
    p5.stroke(150, 150, 150);
    p5.strokeWeight(3);
    p5.rect(48, ringY - 2, p5.width - 96, 4); // Borda superior
    p5.rect(48, ringY + ringHeight - 2, p5.width - 96, 4); // Borda inferior
    
    // Cantos do ringue
    const cornerSize = 15;
    p5.fill(255, 255, 255);
    p5.noStroke();
    // Canto esquerdo
    p5.ellipse(50, ringY, cornerSize, cornerSize);
    p5.ellipse(50, ringY + ringHeight, cornerSize, cornerSize);
    // Canto direito
    p5.ellipse(p5.width - 50, ringY, cornerSize, cornerSize);
    p5.ellipse(p5.width - 50, ringY + ringHeight, cornerSize, cornerSize);
    
    // Cordas do ringue
    this.drawRopes(ringY, ringHeight);
  }

  private drawRopes(ringY: number, ringHeight: number) {
    const p5 = this.p5;
    
    const ropeHeights = [ringY + 20, ringY + 40, ringY + 60];
    
    for (const height of ropeHeights) {
      // Corda principal
      p5.stroke(255, 255, 255);
      p5.strokeWeight(4);
      p5.line(50, height, p5.width - 50, height);
      
      // Reflexo na corda
      p5.stroke(255, 255, 255, 150);
      p5.strokeWeight(1);
      p5.line(50, height - 1, p5.width - 50, height - 1);
      
      // Postes das cordas
      p5.fill(100, 100, 100);
      p5.noStroke();
      p5.rect(48, height - 2, 4, 4);
      p5.rect(p5.width - 52, height - 2, 4, 4);
    }
  }

  private drawCrowd() {
    const p5 = this.p5;
    
    for (const member of this.crowd) {
      p5.push();
      p5.translate(
        member.x + Math.sin(member.animationOffset) * member.excitement * 5,
        member.y + Math.cos(member.animationOffset * 2) * member.excitement * 3
      );
      
      // Corpo
      p5.fill(member.color);
      p5.noStroke();
      p5.ellipse(0, 0, member.size, member.size * 1.2);
      
      // Cabeça
      const headColor = p5.color(
        p5.red(member.color) * 0.8,
        p5.green(member.color) * 0.8,
        p5.blue(member.color) * 0.8
      );
      p5.fill(headColor);
      p5.ellipse(0, -member.size * 0.7, member.size * 0.6, member.size * 0.6);
      
      // Braços levantados se estiver animado
      if (member.type === 'excited') {
        p5.stroke(headColor);
        p5.strokeWeight(2);
        p5.line(-member.size * 0.3, -member.size * 0.2, -member.size * 0.6, -member.size * 0.8);
        p5.line(member.size * 0.3, -member.size * 0.2, member.size * 0.6, -member.size * 0.8);
      }
      
      p5.pop();
    }
  }

  private drawSpotlights() {
    const p5 = this.p5;
    
    for (const spotlight of this.spotlights) {
      p5.push();
      
      // Movimento oscilante do spotlight
      const oscillation = Math.sin(this.animationOffset * spotlight.oscillation) * 0.2;
      const currentDirection = spotlight.direction + oscillation;
      
      // Cone de luz
      p5.translate(spotlight.x, spotlight.y);
      p5.rotate(currentDirection);
      
      p5.fill(spotlight.color);
      p5.noStroke();
      
      // Desenha o cone de luz
      p5.beginShape();
      p5.vertex(0, 0);
      for (let angle = -spotlight.angle / 2; angle <= spotlight.angle / 2; angle += 0.1) {
        const x = Math.cos(angle) * 300;
        const y = Math.sin(angle) * 300;
        p5.vertex(x, y);
      }
      p5.endShape(p5.CLOSE);
      
      p5.pop();
    }
  }

  private drawAtmosphere() {
    const p5 = this.p5;
    
    // Partículas de poeira no ar
    for (let i = 0; i < 20; i++) {
      const x = (this.animationOffset * 20 + i * 40) % p5.width;
      const y = 150 + Math.sin(this.animationOffset + i) * 50;
      
      p5.fill(255, 255, 255, 30);
      p5.noStroke();
      p5.ellipse(x, y, 3, 3);
    }
    
    // Névoa sutil
    p5.fill(255, 255, 255, 10);
    p5.noStroke();
    for (let y = 400; y < 600; y += 50) {
      p5.ellipse(p5.width / 2, y, p5.width * 2, 100);
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
      } else {
        member.type = 'normal';
      }
    }
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
}

interface Spotlight {
  x: number;
  y: number;
  intensity: number;
  color: p5.Color;
  angle: number;
  direction: number;
  oscillation: number;
}
