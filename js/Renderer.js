class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 0, scale: 1, targetScale: 1 };
    this.width = canvas.width;
    this.height = canvas.height;
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
  }

  clear() {
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  updateCamera(player, dt) {
    const targetX = player.x;
    const targetY = player.y;

    this.camera.x = Utils.lerp(this.camera.x, targetX, dt * 5);
    this.camera.y = Utils.lerp(this.camera.y, targetY, dt * 5);

    const speedRatio = Math.abs(player.speed) / player.maxSpeed;
    this.camera.targetScale = 1 - speedRatio * 0.1;
    this.camera.scale = Utils.lerp(this.camera.scale, this.camera.targetScale, dt * 3);
  }

  beginTransform() {
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this.camera.scale, this.camera.scale);
    this.ctx.translate(-this.camera.x, -this.camera.y);
  }

  endTransform() {
    this.ctx.restore();
  }

  drawTrack(track) {
    const ctx = this.ctx;

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f5ff';

    ctx.beginPath();
    ctx.lineWidth = track.width + 8;
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.3)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    track.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.lineWidth = track.width;
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    track.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = track.width * 0.9;
    ctx.strokeStyle = '#252540';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    track.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff00ff';
    ctx.setLineDash([15, 15]);

    track.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    this._drawStartFinish(track);
  }

  _drawStartFinish(track) {
    const ctx = this.ctx;
    const startPoint = track.getPointAtDistance(0);
    const perpAngle = startPoint.angle + Math.PI / 2;
    const halfWidth = track.width / 2;

    const x1 = startPoint.x + Math.cos(perpAngle) * halfWidth;
    const y1 = startPoint.y + Math.sin(perpAngle) * halfWidth;
    const x2 = startPoint.x - Math.cos(perpAngle) * halfWidth;
    const y2 = startPoint.y - Math.sin(perpAngle) * halfWidth;

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  drawSkidMarks(bikes) {
    const ctx = this.ctx;

    bikes.forEach(bike => {
      bike.skidMarks.forEach(mark => {
        ctx.fillStyle = `rgba(50, 50, 50, ${mark.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(mark.x, mark.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  drawBike(bike) {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(bike.x, bike.y);
    ctx.rotate(bike.angle + bike.driftAngle * 0.5);

    ctx.shadowBlur = 15;
    ctx.shadowColor = bike.color;

    const wheelBase = bike.wheelBase;
    const halfWidth = bike.width / 2;

    ctx.fillStyle = bike.color;
    ctx.beginPath();
    ctx.moveTo(wheelBase * 0.6, 0);
    ctx.lineTo(wheelBase * 0.2, -halfWidth);
    ctx.lineTo(-wheelBase * 0.5, -halfWidth * 0.8);
    ctx.lineTo(-wheelBase * 0.7, 0);
    ctx.lineTo(-wheelBase * 0.5, halfWidth * 0.8);
    ctx.lineTo(wheelBase * 0.2, halfWidth);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(wheelBase * 0.1, 0, halfWidth * 0.6, halfWidth * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (bike.speed > 30) {
      const tailLength = Math.min(bike.speed * 0.3, 80);
      const gradient = ctx.createLinearGradient(-wheelBase * 0.7, 0, -wheelBase * 0.7 - tailLength, 0);
      gradient.addColorStop(0, bike.color);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(-wheelBase * 0.5, -halfWidth * 0.5);
      ctx.lineTo(-wheelBase * 0.7 - tailLength, 0);
      ctx.lineTo(-wheelBase * 0.5, halfWidth * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.shadowBlur = 0;

    if (bike.isPlayer) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, wheelBase * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  drawParticles(bikes) {
    const ctx = this.ctx;

    bikes.forEach(bike => {
      bike.particles.forEach(p => {
        ctx.fillStyle = `rgba(100, 100, 100, ${p.life * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  drawSpeedLines(player) {
    const ctx = this.ctx;
    const speedRatio = Math.abs(player.speed) / player.maxSpeed;

    if (speedRatio < 0.5) return;

    const count = Math.floor(speedRatio * 15);
    ctx.strokeStyle = `rgba(255, 255, 255, ${(speedRatio - 0.5) * 0.6})`;
    ctx.lineWidth = 2;

    for (let i = 0; i < count; i++) {
      const angle = player.angle + Utils.randomRange(-0.8, 0.8);
      const dist = Utils.randomRange(100, 300);
      const length = Utils.randomRange(30, 80);

      const x1 = player.x + Math.cos(angle) * dist;
      const y1 = player.y + Math.sin(angle) * dist;
      const x2 = player.x + Math.cos(angle) * (dist + length);
      const y2 = player.y + Math.sin(angle) * (dist + length);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  drawHUD(game) {
    const ctx = this.ctx;
    const padding = 20;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    this._drawSpeedometer(game.player, padding, this.height - 120);
    this._drawLapInfo(game.player, this.width - padding - 180, padding);
    this._drawTimer(game.raceTime, this.width / 2 - 100, padding);
    this._drawRankings(game.getRankings(), padding, padding);

    ctx.restore();
  }

  _drawSpeedometer(player, x, y) {
    const ctx = this.ctx;
    const speed = Math.abs(player.speed);
    const speedRatio = speed / player.maxSpeed;
    const maxSpeed = player.maxSpeed;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, 200, 100, 10);
    ctx.fill();

    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f5ff';
    ctx.beginPath();
    ctx.roundRect(x, y, 200, 100, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#00f5ff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(speed * 3.6)}`, x + 100, y + 50);

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('KM/H', x + 100, y + 72);

    const barWidth = 160;
    const barHeight = 6;
    const barX = x + 20;
    const barY = y + 82;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(0.6, '#ffff00');
    gradient.addColorStop(1, '#ff0000');

    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth * speedRatio, barHeight);
  }

  _drawLapInfo(player, x, y) {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, 180, 70, 10);
    ctx.fill();

    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.roundRect(x, y, 180, 70, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`LAP ${player.lap + 1} / 3`, x + 90, y + 35);

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText(`Checkpoint: ${player.checkpoint + 1}/8`, x + 90, y + 58);
  }

  _drawTimer(time, x, y) {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, 200, 50, 10);
    ctx.fill();

    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.roundRect(x, y, 200, 50, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Utils.formatTime(time), x + 100, y + 35);
  }

  _drawRankings(rankings, x, y) {
    const ctx = this.ctx;
    const width = 180;
    const height = 30 + rankings.length * 28;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.fill();

    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f5ff';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('RANKING', x + 15, y + 25);

    rankings.forEach((r, i) => {
      const bike = r.bike;
      const rankY = y + 50 + i * 28;

      ctx.fillStyle = bike.isPlayer ? '#ffff00' : '#888';
      ctx.font = '14px monospace';
      ctx.fillText(`${i + 1}.`, x + 15, rankY);

      ctx.fillStyle = bike.color;
      ctx.fillRect(x + 45, rankY - 10, 12, 12);

      ctx.fillStyle = bike.isPlayer ? '#ffffff' : '#aaa';
      ctx.fillText(bike.isPlayer ? 'YOU' : `AI${i}`, x + 65, rankY);

      if (bike.finished) {
        ctx.fillStyle = '#00ff00';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(Utils.formatTime(bike.raceTime), x + width - 15, rankY);
        ctx.textAlign = 'left';
      }
    });
  }

  drawMenu() {
    const ctx = this.ctx;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.9)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00f5ff';
    ctx.fillStyle = '#00f5ff';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NEON RACER', this.width / 2, this.height / 2 - 80);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ff00ff';
    ctx.font = '20px monospace';
    ctx.fillText('极速霓虹', this.width / 2, this.height / 2 - 40);

    ctx.fillStyle = '#888';
    ctx.font = '16px monospace';
    ctx.fillText('按 空格键 或 点击 开始游戏', this.width / 2, this.height / 2 + 30);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('WASD / 方向键 - 控制方向', this.width / 2, this.height / 2 + 80);
    ctx.fillText('触屏设备使用虚拟按键', this.width / 2, this.height / 2 + 105);

    ctx.restore();
  }

  drawCountdown(count) {
    const ctx = this.ctx;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.width, this.height);

    const text = count > 0 ? count.toString() : 'GO!';
    const color = count > 0 ? '#ffff00' : '#00ff00';

    ctx.shadowBlur = 40;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.font = 'bold 120px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, this.width / 2, this.height / 2);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawFinished(game) {
    const ctx = this.ctx;
    const rankings = game.getRankings();
    const playerRank = rankings.findIndex(r => r.bike.isPlayer) + 1;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.9)';
    ctx.fillRect(0, 0, this.width, this.height);

    const panelWidth = 350;
    const panelHeight = 380;
    const panelX = (this.width - panelWidth) / 2;
    const panelY = (this.height - panelHeight) / 2;

    ctx.fillStyle = 'rgba(20, 20, 40, 0.95)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 15);
    ctx.fill();

    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 15);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RACE FINISHED!', this.width / 2, panelY + 50);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#00f5ff';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`你的名次: 第 ${playerRank} 名`, this.width / 2, panelY + 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText(`用时: ${Utils.formatTime(game.player.raceTime)}`, this.width / 2, panelY + 125);

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, panelY + 150);
    ctx.lineTo(panelX + panelWidth - 30, panelY + 150);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('最终排名', panelX + 30, panelY + 180);

    rankings.forEach((r, i) => {
      const bike = r.bike;
      const y = panelY + 210 + i * 32;

      ctx.fillStyle = bike.isPlayer ? '#ffff00' : '#888';
      ctx.font = '14px monospace';
      ctx.fillText(`${i + 1}.`, panelX + 30, y);

      ctx.fillStyle = bike.color;
      ctx.fillRect(panelX + 65, y - 10, 10, 10);

      ctx.fillStyle = bike.isPlayer ? '#ffffff' : '#aaa';
      ctx.fillText(bike.isPlayer ? '你' : `AI ${i}`, panelX + 85, y);

      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'right';
      ctx.fillText(Utils.formatTime(bike.raceTime), panelX + panelWidth - 30, y);
      ctx.textAlign = 'left';
    });

    ctx.fillStyle = '#00f5ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f5ff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('按 空格键 或 点击 重新开始', this.width / 2, panelY + panelHeight - 30);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}
