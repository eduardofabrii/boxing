import p5 from 'p5';

export class HUD {
  private p5: p5;
  private comboCounter = 0;
  private comboTimer = 0;
  private scorePopups: ScorePopup[] = [];
  private healthBarAnimations = { player: 0, enemy: 0 };
  private roundTimer = 30; 
  private frameCounter = 0;
  private isPaused = false;

  constructor(p5Instance: p5) {
    this.p5 = p5Instance;
  }
  update() {
    if (this.comboTimer > 0) {
      this.comboTimer--;
    } else if (this.comboCounter > 0) {
      this.comboCounter = 0;
    }

    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const popup = this.scorePopups[i];
      popup.y -= popup.speed;
      popup.life--;
      popup.speed *= 0.95;

      if (popup.life <= 0) {
        this.scorePopups.splice(i, 1);
      }
    }

    this.healthBarAnimations.player *= 0.9;
    this.healthBarAnimations.enemy *= 0.9;
    
    if (!this.isPaused && this.roundTimer > 0) {
      this.frameCounter++;
      if (this.frameCounter >= 60) {
        this.roundTimer--;
        this.frameCounter = 0;
      }
    }
  }  draw(playerHealth: number, enemyHealth: number, score: number, round: number, punchType: string, playerNickname?: string) {
    this.drawHealthBars(playerHealth, enemyHealth);
    this.drawTimer();
    this.drawComboMeter();
    this.drawScorePopups();
    this.drawPauseIndicator();
    if (playerNickname) {
      this.drawPlayerNickname(playerNickname);
    }
  }
  private drawHealthBars(playerHealth: number, enemyHealth: number) {
    const p5 = this.p5;
    const barWidth = 250; 
    const barHeight = 20; 
    const margin = 20; 

    p5.push();
    p5.translate(margin, 15); 

    p5.fill(50, 50, 50);
    p5.stroke(255);
    p5.strokeWeight(1); 
    p5.rect(0, 0, barWidth, barHeight, 3);

    const playerHealthPercent = playerHealth / 500;
    const playerBarWidth = barWidth * playerHealthPercent;
    
    let healthColor;
    if (playerHealthPercent > 0.6) {
      healthColor = p5.color(50, 255, 50);
    } else if (playerHealthPercent > 0.3) {
      healthColor = p5.color(255, 255, 50);
    } else {
      healthColor = p5.color(255, 50, 50);
    }

    p5.fill(healthColor);
    p5.noStroke();
    p5.rect(2, 2, playerBarWidth - 4, barHeight - 4, 3);

    p5.fill(255, 255, 255, 100);
    p5.rect(2, 2, playerBarWidth - 4, 8, 3);

    if (this.healthBarAnimations.player > 0) {
      p5.fill(255, 0, 0, this.healthBarAnimations.player);
      p5.rect(0, 0, barWidth, barHeight, 5);
    }    
    p5.fill(255);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.textSize(12); // Reduzido
    p5.textStyle(p5.BOLD);
    p5.text("PLAYER", 5, barHeight / 2);
    
    p5.textAlign(p5.RIGHT, p5.CENTER);
    p5.text(`${Math.ceil(playerHealth)}/500`, barWidth - 5, barHeight / 2);

    p5.pop();

    p5.push();
    p5.translate(p5.width - margin - barWidth, 15); 

    p5.fill(50, 50, 50);
    p5.stroke(255);
    p5.strokeWeight(1); 
    p5.rect(0, 0, barWidth, barHeight, 3); 

    const enemyHealthPercent = enemyHealth / 500;
    const enemyBarWidth = barWidth * enemyHealthPercent;
    
    if (enemyHealthPercent > 0.6) {
      healthColor = p5.color(50, 50, 255);
    } else if (enemyHealthPercent > 0.3) {
      healthColor = p5.color(255, 100, 50);
    } else {
      healthColor = p5.color(255, 50, 50);
    }

    p5.fill(healthColor);
    p5.noStroke();
    p5.rect(barWidth - enemyBarWidth + 2, 2, enemyBarWidth - 4, barHeight - 4, 3);

    p5.fill(255, 255, 255, 100);
    p5.rect(barWidth - enemyBarWidth + 2, 2, enemyBarWidth - 4, 8, 3);

    if (this.healthBarAnimations.enemy > 0) {
      p5.fill(255, 0, 0, this.healthBarAnimations.enemy);
      p5.rect(0, 0, barWidth, barHeight, 5);
    }   
    p5.fill(255);
    p5.textAlign(p5.RIGHT, p5.CENTER);
    p5.textSize(12); 
    p5.textStyle(p5.BOLD);
    p5.text("ENEMY", barWidth - 5, barHeight / 2);
    
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.text(`${Math.ceil(enemyHealth)}/500`, 5, barHeight / 2);

    p5.pop();
  }

  private drawScore(score: number) {
    const p5 = this.p5;

    p5.push();
    p5.translate(p5.width / 2, 80);

    p5.fill(0, 0, 0, 150);
    p5.stroke(255, 255, 0);
    p5.strokeWeight(2);
    p5.rect(-80, -20, 160, 40, 10);
    p5.fill(255, 255, 0);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(24);
    p5.textStyle(p5.BOLD);
    p5.text(`SCORE: ${score}`, 0, 0);

    p5.pop();
  }

  private drawRoundInfo(round: number) {
    const p5 = this.p5;

    p5.push();
    p5.translate(p5.width / 2, 30);

    p5.fill(0, 0, 0, 150);
    p5.stroke(255);
    p5.strokeWeight(2);
    p5.rect(-60, -15, 120, 30, 8);

    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(18);
    p5.textStyle(p5.BOLD);
    p5.text(`ROUND ${round}`, 0, 0);

    p5.pop();
  }
  private drawTimer() {
    const p5 = this.p5;
    const minutes = Math.floor(this.roundTimer / 60);
    const seconds = this.roundTimer % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    p5.push();
    p5.translate(p5.width / 2, 20); // Movido para o topo

    p5.fill(0, 0, 0, 100); 
    p5.stroke(this.roundTimer < 30 ? p5.color(255, 0, 0) : p5.color(255));
    p5.strokeWeight(1); // Mais fino
    p5.rect(-40, -10, 80, 20, 5); // Menor

    p5.fill(this.roundTimer < 30 ? p5.color(255, 0, 0) : p5.color(255));
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(12); // Menor
    p5.textStyle(p5.BOLD);
    p5.text(timeString, 0, 0);

    p5.pop();
  }
  private drawComboMeter() {
    if (this.comboCounter <= 1) return;

    const p5 = this.p5;

    p5.push();
    p5.translate(20, 50); // Posição mais discreta

    p5.fill(0, 0, 0, 150); // Mais transparente
    p5.stroke(255, 100, 0);
    p5.strokeWeight(2); // Mais fino
    p5.rect(0, 0, 80, 40, 5); // Menor

    p5.fill(255, 100, 0);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(10); // Menor
    p5.textStyle(p5.BOLD);
    p5.text("COMBO", 40, 15); // Ajustado
    p5.fill(255, 255, 0);
    p5.textSize(16); // Menor
    p5.text(`x${this.comboCounter}`, 40, 30); // Ajustado

    if (this.comboCounter >= 5) {
      p5.drawingContext.shadowColor = "orange";
      p5.drawingContext.shadowBlur = 10; // Reduzido
      p5.fill(255, 200, 0);
      p5.text(`x${this.comboCounter}`, 40, 30);
      p5.drawingContext.shadowBlur = 0;
    }

    p5.pop();
  }

  private drawScorePopups() {
    const p5 = this.p5;

    for (const popup of this.scorePopups) {
      p5.push();
      p5.translate(popup.x, popup.y);

      const alpha = (popup.life / popup.maxLife) * 255;
      
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(popup.size);
      p5.textStyle(p5.BOLD);
      
      p5.fill(0, 0, 0, alpha);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx !== 0 || dy !== 0) {
            p5.text(popup.text, dx, dy);
          }
        }
      }
      
      p5.fill(p5.red(popup.color), p5.green(popup.color), p5.blue(popup.color), alpha);
      p5.text(popup.text, 0, 0);

      p5.pop();
    }
  }

  private drawPunchIndicator(punchType: string) {
    if (!punchType) return;

    const p5 = this.p5;

    p5.push();
    p5.translate(p5.width - 150, 150);

    p5.fill(0, 0, 0, 180);
    p5.stroke(255, 255, 0);
    p5.strokeWeight(2);
    p5.rect(0, 0, 120, 40, 8);

    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(16);
    p5.textStyle(p5.BOLD);
    p5.text(punchType.toUpperCase(), 60, 20);

    p5.pop();
  }
  private drawMiniMap() {
    const p5 = this.p5;

    p5.push();
    p5.translate(p5.width - 120, p5.height - 120);

    p5.fill(0, 0, 0, 150);
    p5.stroke(255);
    p5.strokeWeight(2);
    p5.rect(0, 0, 100, 80, 5);

    p5.fill(100, 80, 60);
    p5.noStroke();
    p5.rect(10, 20, 80, 40, 3);

    p5.fill(255, 0, 0);
    p5.ellipse(30, 40, 8, 8); // Jogador

    p5.fill(0, 0, 255);
    p5.ellipse(70, 40, 8, 8); // Inimigo

    p5.fill(255);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(10);
    p5.text("RING", 50, 10);

    p5.pop();
  }
  private drawPauseIndicator() {
    const p5 = this.p5;

    p5.push();
    p5.translate(p5.width / 2 - 70, 45);

    p5.fill(30, 30, 30, 220); 
    p5.stroke(200, 200, 200, 150);
    p5.strokeWeight(1);
    p5.rect(0, 0, 140, 32, 16); 

    p5.fill(150, 150, 150);
    p5.noStroke();
    p5.rect(8, 10, 3, 12, 1);
    p5.rect(13, 10, 3, 12, 1);

    p5.fill(200, 200, 200);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.textSize(11);
    p5.textStyle(p5.BOLD);
    p5.text("ESC", 22, 16);

    p5.stroke(120, 120, 120);
    p5.strokeWeight(1);
    p5.line(48, 8, 48, 24);

   
    p5.fill(160, 160, 160);
    p5.noStroke();
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.textSize(10);
    p5.textStyle(p5.NORMAL);
    p5.text("Para pausar", 54, 16);

    
    if (Math.sin(p5.frameCount * 0.05) > 0.5) {
      p5.stroke(100, 150, 255, 100);
      p5.strokeWeight(2);
      p5.noFill();
      p5.rect(-1, -1, 142, 34, 17);
    }

    p5.pop();
  }
  addHit(damage: number) {
    this.comboCounter++;
    this.comboTimer = 120;
  }

  addDamage(isPlayer: boolean) {
    if (isPlayer) {
      this.healthBarAnimations.player = 100;
    } else {
      this.healthBarAnimations.enemy = 100;
    }
  }

  addScorePopup(x: number, y: number, points: number, type: string) {
    const p5 = this.p5;
    
    let color;
    let text;
    
    switch (type) {
      case 'hit':
        color = p5.color(255, 255, 0);
        text = `+${points}`;
        break;
      case 'combo':
        color = p5.color(255, 100, 0);
        text = `COMBO x${this.comboCounter}`;
        break;
      case 'knockout':
        color = p5.color(255, 0, 0);
        text = 'KNOCKOUT!';
        break;
      default:
        color = p5.color(255, 255, 255);
        text = `+${points}`;
    }

    this.scorePopups.push({
      x,
      y,
      text,
      color,
      size: type === 'knockout' ? 32 : 20,
      life: 120,
      maxLife: 120,
      speed: 2
    });
  }  resetTimer() {
    this.roundTimer = 30; 
    this.frameCounter = 0;
  }

  pauseTimer() {
    this.isPaused = true;
  }

  resumeTimer() {
    this.isPaused = false;
  }

  getTimeRemaining(): number {
    return this.roundTimer;
  }

  resetCombo() {
    this.comboCounter = 0;
    this.comboTimer = 0;
  }

  getCombo(): number {
    return this.comboCounter;
  }  private drawPlayerNickname(nickname: string) {
    // Posição logo abaixo da barra de vida do jogador
    const x = 20; // Mesmo x da barra de vida
    const y = 50; // Logo abaixo da barra de vida que termina em y=35 (15 + 20)

    // Fundo do nickname
    this.p5.fill(0, 0, 0, 120);
    this.p5.noStroke();
    this.p5.rect(x, y - 10, 140, 22, 3);

    // Borda colorida mais sutil
    this.p5.stroke(76, 175, 80, 180); // Verde para o jogador, com transparência
    this.p5.strokeWeight(1);
    this.p5.noFill();
    this.p5.rect(x, y - 10, 140, 22, 3);

    // Ícone do jogador
    this.p5.fill(76, 175, 80);
    this.p5.noStroke();
    this.p5.textAlign(this.p5.LEFT, this.p5.CENTER);
    this.p5.textSize(12);
    this.p5.text("👤", x + 8, y);

    // Nome do jogador
    this.p5.fill(255, 255, 255);
    this.p5.textAlign(this.p5.LEFT, this.p5.CENTER);
    this.p5.textSize(11);
    this.p5.textStyle(this.p5.BOLD);
    
    // Truncar o nome se for muito longo
    const displayName = nickname.length > 12 ? nickname.substring(0, 12) + "..." : nickname;
    this.p5.text(displayName, x + 25, y);

    // Label "PLAYER" menor e mais discreto
    this.p5.fill(76, 175, 80, 150);
    this.p5.textSize(7);
    this.p5.textStyle(this.p5.NORMAL);
    this.p5.text("PLAYER", x + 8, y + 8);
  }
}

interface ScorePopup {
  x: number;
  y: number;
  text: string;
  color: p5.Color;
  size: number;
  life: number;
  maxLife: number;
  speed: number;
}
