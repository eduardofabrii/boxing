import p5 from 'p5';

export interface Particle {
  position: p5.Vector;
  velocity: p5.Vector;
  acceleration: p5.Vector;
  life: number;
  maxLife: number;
  size: number;
  color: p5.Color;
  type: 'spark' | 'smoke' | 'blood' | 'dust' | 'star' | 'shockwave';
  angle?: number;
  angularVelocity?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private p5: p5;

  constructor(p5Instance: p5) {
    this.p5 = p5Instance;
  }

  addPunchEffect(x: number, y: number, punchType: string) {
    const p5 = this.p5;
    const particleCount = punchType === 'uppercut' ? 15 : 10;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = p5.random(0, p5.TWO_PI);
      const speed = p5.random(2, 8);
      
      this.particles.push({
        position: p5.createVector(x + p5.random(-20, 20), y + p5.random(-20, 20)),
        velocity: p5.createVector(p5.cos(angle) * speed, p5.sin(angle) * speed),
        acceleration: p5.createVector(0, 0.2),
        life: 255,
        maxLife: 255,
        size: p5.random(3, 8),
        color: p5.color(255, 255, 0, 255),
        type: 'spark',
        angle: angle,
        angularVelocity: p5.random(-0.2, 0.2)
      });
    }

    // Adiciona onda de choque
    this.particles.push({
      position: p5.createVector(x, y),
      velocity: p5.createVector(0, 0),
      acceleration: p5.createVector(0, 0),
      life: 30,
      maxLife: 30,
      size: 10,
      color: p5.color(255, 255, 255, 150),
      type: 'shockwave'
    });
  }

  addHitEffect(x: number, y: number, damage: number) {
    const p5 = this.p5;
    const particleCount = Math.floor(damage / 10) + 5;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = p5.random(0, p5.TWO_PI);
      const speed = p5.random(1, 6);
      
      this.particles.push({
        position: p5.createVector(x + p5.random(-15, 15), y + p5.random(-15, 15)),
        velocity: p5.createVector(p5.cos(angle) * speed, p5.sin(angle) * speed),
        acceleration: p5.createVector(0, 0.3),
        life: 200,
        maxLife: 200,
        size: p5.random(2, 6),
        color: p5.color(255, 50, 50, 200),
        type: 'blood'
      });
    }

    // Efeito de impacto
    for (let i = 0; i < 8; i++) {
      const angle = p5.random(0, p5.TWO_PI);
      const speed = p5.random(3, 10);
      
      this.particles.push({
        position: p5.createVector(x, y),
        velocity: p5.createVector(p5.cos(angle) * speed, p5.sin(angle) * speed),
        acceleration: p5.createVector(0, 0.1),
        life: 150,
        maxLife: 150,
        size: p5.random(4, 10),
        color: p5.color(255, 200, 100, 180),
        type: 'dust'
      });
    }
  }

  addKnockoutEffect(x: number, y: number) {
    const p5 = this.p5;
    
    // Estrelas girando
    for (let i = 0; i < 12; i++) {
      const angle = (p5.TWO_PI / 12) * i;
      const radius = 50;
      
      this.particles.push({
        position: p5.createVector(
          x + p5.cos(angle) * radius,
          y + p5.sin(angle) * radius
        ),
        velocity: p5.createVector(p5.cos(angle) * 2, p5.sin(angle) * 2),
        acceleration: p5.createVector(0, 0),
        life: 300,
        maxLife: 300,
        size: p5.random(8, 15),
        color: p5.color(255, 255, 0, 255),
        type: 'star',
        angle: 0,
        angularVelocity: 0.1
      });
    }

    // Explosão de faíscas
    for (let i = 0; i < 25; i++) {
      const angle = p5.random(0, p5.TWO_PI);
      const speed = p5.random(5, 15);
      
      this.particles.push({
        position: p5.createVector(x, y),
        velocity: p5.createVector(p5.cos(angle) * speed, p5.sin(angle) * speed),
        acceleration: p5.createVector(0, 0.4),
        life: 400,
        maxLife: 400,
        size: p5.random(3, 8),
        color: p5.color(255, p5.random(100, 255), 0, 255),
        type: 'spark'
      });
    }
  }

  addSmokeEffect(x: number, y: number) {
    const p5 = this.p5;
    
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        position: p5.createVector(x + p5.random(-20, 20), y + p5.random(-10, 10)),
        velocity: p5.createVector(p5.random(-1, 1), p5.random(-3, -1)),
        acceleration: p5.createVector(0, -0.05),
        life: 180,
        maxLife: 180,
        size: p5.random(8, 15),
        color: p5.color(100, 100, 100, 120),
        type: 'smoke'
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Atualiza posição
      particle.velocity.add(particle.acceleration);
      particle.position.add(particle.velocity);
      
      // Atualiza vida
      particle.life--;
      
      // Atualiza rotação se aplicável
      if (particle.angle !== undefined && particle.angularVelocity !== undefined) {
        particle.angle += particle.angularVelocity;
      }
      
      // Efeitos específicos por tipo
      this.updateParticleByType(particle);
      
      // Remove partículas mortas
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateParticleByType(particle: Particle) {
    const p5 = this.p5;
    
    switch (particle.type) {
      case 'smoke':
        particle.size += 0.2;
        particle.velocity.mult(0.98);
        break;
        
      case 'shockwave':
        particle.size += 3;
        break;
        
      case 'spark':
        particle.velocity.mult(0.95);
        break;
        
      case 'blood':
        particle.velocity.mult(0.92);
        break;
        
      case 'dust':
        particle.velocity.mult(0.94);
        break;
        
      case 'star':
        // Movimento orbital
        const centerDistance = 50;
        const orbitSpeed = 0.05;
        const time = (particle.maxLife - particle.life) * orbitSpeed;
        particle.position.x += Math.cos(time) * 2;
        particle.position.y += Math.sin(time) * 2;
        break;
    }
  }

  draw() {
    const p5 = this.p5;
    
    for (const particle of this.particles) {
      const alpha = (particle.life / particle.maxLife) * 255;
      const currentColor = p5.color(
        p5.red(particle.color),
        p5.green(particle.color),
        p5.blue(particle.color),
        alpha
      );
      
      p5.push();
      p5.translate(particle.position.x, particle.position.y);
      
      if (particle.angle !== undefined) {
        p5.rotate(particle.angle);
      }
      
      this.drawParticleByType(particle, currentColor);
      
      p5.pop();
    }
  }

  private drawParticleByType(particle: Particle, color: p5.Color) {
    const p5 = this.p5;
    
    switch (particle.type) {
      case 'spark':
        p5.fill(color);
        p5.noStroke();
        p5.ellipse(0, 0, particle.size, particle.size);
        
        // Cauda da faísca
        p5.stroke(color);
        p5.strokeWeight(1);
        p5.line(0, 0, -particle.velocity.x * 3, -particle.velocity.y * 3);
        break;
        
      case 'smoke':
        p5.fill(color);
        p5.noStroke();
        p5.ellipse(0, 0, particle.size, particle.size);
        break;
        
      case 'blood':
        p5.fill(color);
        p5.noStroke();
        p5.ellipse(0, 0, particle.size, particle.size);
        break;
        
      case 'dust':
        p5.fill(color);
        p5.noStroke();
        p5.rect(-particle.size/2, -particle.size/2, particle.size, particle.size);
        break;
        
      case 'star':
        p5.fill(color);
        p5.noStroke();
        this.drawStar(0, 0, particle.size * 0.3, particle.size, 5);
        break;
        
      case 'shockwave':
        p5.noFill();
        p5.stroke(color);
        p5.strokeWeight(3);
        p5.ellipse(0, 0, particle.size, particle.size);
        break;
    }
  }

  private drawStar(x: number, y: number, radius1: number, radius2: number, npoints: number) {
    const p5 = this.p5;
    const angle = p5.TWO_PI / npoints;
    const halfAngle = angle / 2.0;
    
    p5.beginShape();
    for (let a = 0; a < p5.TWO_PI; a += angle) {
      let sx = x + p5.cos(a) * radius2;
      let sy = y + p5.sin(a) * radius2;
      p5.vertex(sx, sy);
      sx = x + p5.cos(a + halfAngle) * radius1;
      sy = y + p5.sin(a + halfAngle) * radius1;
      p5.vertex(sx, sy);
    }
    p5.endShape(p5.CLOSE);
  }

  clear() {
    this.particles = [];
  }

  getParticleCount(): number {
    return this.particles.length;
  }
}
