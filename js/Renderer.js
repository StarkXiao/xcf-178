class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 0, scale: 1, targetScale: 1 };
    this.width = canvas.width;
    this.height = canvas.height;
    this.orientation = 'landscape';
    this._updateOrientation();
  }

  _updateOrientation() {
    this.orientation = this.width > this.height ? 'landscape' : 'portrait';
  }

  isPortrait() {
    return this.orientation === 'portrait';
  }

  _getUIScale() {
    if (!this.isPortrait()) return 1;
    const baseScale = Math.min(this.width / 400, this.height / 700);
    return Math.max(0.7, Math.min(1.1, baseScale));
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this._updateOrientation();
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
    const baseScale = this.isPortrait() ? 0.85 : 1;
    this.camera.targetScale = baseScale - speedRatio * 0.1;
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
    const routes = track.getAllRoutes();

    routes.forEach(route => {
      if (route.id === 'main') return;

      ctx.shadowBlur = 15;
      ctx.shadowColor = route.color;

      ctx.beginPath();
      ctx.lineWidth = track.width * 0.7 + 6;
      ctx.strokeStyle = route.color + '40';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      route.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.lineWidth = track.width * 0.7;
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      route.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = track.width * 0.65;
      ctx.strokeStyle = '#252540';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      route.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.shadowBlur = 8;
      ctx.shadowColor = route.color;

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = route.color;
      ctx.setLineDash(route.isShortcut ? [8, 12] : [12, 12]);

      route.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    });

    const mainRoute = track.getRoute('main');

    ctx.shadowBlur = 20;
    ctx.shadowColor = mainRoute.color;

    ctx.beginPath();
    ctx.lineWidth = track.width + 8;
    ctx.strokeStyle = mainRoute.color + '4D';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    mainRoute.points.forEach((p, i) => {
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

    mainRoute.points.forEach((p, i) => {
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

    mainRoute.points.forEach((p, i) => {
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

    mainRoute.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    this._drawBranchPoints(track);
    this._drawRouteLabels(track);
    this._drawStartFinish(track);
    this.drawObstacles(track);
  }

  _drawBranchPoints(track) {
    const ctx = this.ctx;

    track.branchPoints.forEach(bp => {
      const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;

      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ffff00';

      ctx.beginPath();
      ctx.arc(bp.position.x, bp.position.y, 25 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 0, ${0.2 * pulse})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bp.position.x, bp.position.y, 18, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.shadowBlur = 0;

      bp.routes.forEach((route, idx) => {
        const angle = (idx / bp.routes.length) * Math.PI * 2 - Math.PI / 2;
        const dist = 45;
        const x = bp.position.x + Math.cos(angle) * dist;
        const y = bp.position.y + Math.sin(angle) * dist;

        ctx.shadowBlur = 10;
        ctx.shadowColor = route.color;

        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(idx + 1, x, y);

        ctx.shadowBlur = 0;
      });
    });
  }

  _drawRouteLabels(track) {
    const ctx = this.ctx;
    const routes = track.getAllRoutes();

    routes.forEach(route => {
      if (route.id === 'main') return;

      const midDist = route.totalLength * 0.5;
      const midPoint = route.getPointAtDistance(midDist);

      ctx.save();
      ctx.translate(midPoint.x, midPoint.y);
      ctx.rotate(midPoint.angle);

      ctx.shadowBlur = 15;
      ctx.shadowColor = route.color;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(-60, -18, 120, 36);

      ctx.strokeStyle = route.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(-60, -18, 120, 36);

      ctx.fillStyle = route.color;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(route.name, 0, 0);

      if (route.isShortcut) {
        ctx.fillStyle = '#ffff00';
        ctx.font = '10px monospace';
        ctx.fillText(`-${Math.round((1 - route.lengthBonus) * 100)}%`, 0, 14);
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }

  drawRouteHints(track, player) {
    const ctx = this.ctx;

    if (!player.activeBranchHint) return;

    const bp = player.activeBranchHint;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const centerX = this.width / 2;
    const centerY = isPortrait ? this.height * 0.55 : this.height - 180;

    const panelWidth = isPortrait ? Math.min(280 * uiScale, this.width * 0.9) : 320;
    const panelHeight = isPortrait ? (70 + bp.routes.length * 40) * uiScale : 80 + bp.routes.length * 45;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.roundRect(centerX - panelWidth / 2, centerY - panelHeight / 2, panelWidth, panelHeight, 12 * uiScale);
    ctx.fill();

    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2 * uiScale;
    ctx.shadowBlur = 15 * uiScale;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.roundRect(centerX - panelWidth / 2, centerY - panelHeight / 2, panelWidth, panelHeight, 12 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const titleSize = isPortrait ? 15 * uiScale : 18;
    ctx.fillStyle = '#ffff00';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('⚠ 前方分支路口', centerX, centerY - panelHeight / 2 + 30 * uiScale);

    const routeItemH = isPortrait ? 35 * uiScale : 38;
    const routeItemPad = isPortrait ? 12 * uiScale : 15;
    const dotSize = isPortrait ? 8 * uiScale : 10;
    const nameSize = isPortrait ? 11 * uiScale : 12;
    const hintSize = isPortrait ? 9 * uiScale : 10;

    bp.routes.forEach((route, idx) => {
      const itemY = centerY - panelHeight / 2 + (isPortrait ? 55 : 70) + idx * (isPortrait ? 40 : 45) * uiScale;
      const isCurrentRoute = route.routeId === player.currentRouteId;
      const isRecommended = player.selectedRouteAtBranch &&
                          player.selectedRouteAtBranch.routeId === route.routeId;

      ctx.fillStyle = isCurrentRoute ? 'rgba(0, 245, 255, 0.2)' : 'rgba(40, 40, 60, 0.5)';
      ctx.beginPath();
      ctx.roundRect(centerX - panelWidth / 2 + routeItemPad, itemY - 16 * uiScale, panelWidth - 2 * routeItemPad, routeItemH, 8 * uiScale);
      ctx.fill();

      if (isRecommended) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2 * uiScale;
        ctx.beginPath();
        ctx.roundRect(centerX - panelWidth / 2 + routeItemPad, itemY - 16 * uiScale, panelWidth - 2 * routeItemPad, routeItemH, 8 * uiScale);
        ctx.stroke();
      }

      const dotX = centerX - panelWidth / 2 + 30 * uiScale;
      ctx.fillStyle = route.color;
      ctx.shadowBlur = 8 * uiScale;
      ctx.shadowColor = route.color;
      ctx.beginPath();
      ctx.arc(dotX, itemY, dotSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const nameX = dotX + dotSize + 8 * uiScale;
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${nameSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(route.name, nameX, itemY + 4);

      const hintX = nameX + 65 * uiScale;
      ctx.fillStyle = '#888';
      ctx.font = `${hintSize}px monospace`;
      ctx.fillText(route.hint, hintX, itemY + 4);

      if (route.lengthBonus && route.lengthBonus < 1.0) {
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'right';
        ctx.fillText(`-${Math.round((1 - route.lengthBonus) * 100)}%`, centerX + panelWidth / 2 - 20 * uiScale, itemY + 4);
      }

      if (isRecommended) {
        ctx.fillStyle = '#00ff00';
        ctx.font = `bold ${hintSize}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText('推荐', centerX + panelWidth / 2 - 55 * uiScale, itemY + 4);
      }

      if (isCurrentRoute) {
        ctx.fillStyle = '#00f5ff';
        ctx.font = `bold ${hintSize}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText('当前', centerX + panelWidth / 2 - 85 * uiScale, itemY + 4);
      }
    });

    const footerSize = isPortrait ? 9 * uiScale : 11;
    ctx.fillStyle = '#666';
    ctx.font = `${footerSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('转向选择路线，保持直行则维持当前路线', centerX, centerY + panelHeight / 2 - 15 * uiScale);

    ctx.restore();
  }

  drawCurrentRouteIndicator(player) {
    const ctx = this.ctx;
    const route = player.currentRouteId ? 
      (this.track ? this.track.getRoute(player.currentRouteId) : null) : null;

    if (!route) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const x = this.width - 200;
    const y = this.height - 210;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(x, y, 180, 45, 8);
    ctx.fill();

    ctx.strokeStyle = route.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = route.color;
    ctx.beginPath();
    ctx.roundRect(x, y, 180, 45, 8);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('当前路线', x + 12, y + 16);

    ctx.fillStyle = route.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = route.color;
    ctx.font = 'bold 14px monospace';
    ctx.fillText(route.name, x + 12, y + 34);
    ctx.shadowBlur = 0;

    if (route.isShortcut) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`-${Math.round((1 - route.lengthBonus) * 100)}%`, x + 168, y + 34);
    }

    ctx.restore();
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

  drawObstacles(track) {
    const ctx = this.ctx;

    track.obstacles.forEach(obstacle => {
      if (obstacle.destroyed) {
        if (obstacle.respawnTimer < 3) {
          const pulse = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
          const alpha = (1 - obstacle.respawnTimer / 3) * 0.3 * pulse;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = obstacle.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
        return;
      }

      ctx.save();
      ctx.translate(obstacle.x, obstacle.y);

      ctx.shadowBlur = 15;
      ctx.shadowColor = obstacle.color;

      if (obstacle.type === 'crate') {
        this._drawCrate(obstacle);
      } else if (obstacle.type === 'barrel') {
        this._drawBarrel(obstacle);
      } else if (obstacle.type === 'barrier') {
        this._drawBarrier(obstacle);
      } else if (obstacle.type === 'rock') {
        this._drawRock(obstacle);
      } else {
        ctx.fillStyle = obstacle.color;
        ctx.beginPath();
        ctx.arc(0, 0, obstacle.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      if (obstacle.health < obstacle.maxHealth) {
        const healthRatio = obstacle.health / obstacle.maxHealth;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, obstacle.radius + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * healthRatio);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  _drawCrate(obstacle) {
    const ctx = this.ctx;
    const r = obstacle.radius;
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-r, -r, r * 2, r * 2);
    ctx.beginPath();
    ctx.moveTo(-r, -r);
    ctx.lineTo(r, r);
    ctx.moveTo(r, -r);
    ctx.lineTo(-r, r);
    ctx.stroke();
  }

  _drawBarrel(obstacle) {
    const ctx = this.ctx;
    const r = obstacle.radius;
    ctx.fillStyle = obstacle.color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, 1);
  }

  _drawBarrier(obstacle) {
    const ctx = this.ctx;
    const r = obstacle.radius;
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(-r * 1.3, -r * 0.6, r * 2.6, r * 1.2);
    ctx.fillStyle = '#000000';
    for (let i = -2; i <= 2; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(-r * 1.3 + (i + 2) * r * 0.52, -r * 0.6, r * 0.52, r * 1.2);
      }
    }
    ctx.strokeStyle = obstacle.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(-r * 1.3, -r * 0.6, r * 2.6, r * 1.2);
  }

  _drawRock(obstacle) {
    const ctx = this.ctx;
    const r = obstacle.radius;
    ctx.fillStyle = obstacle.color;
    ctx.beginPath();
    const points = 7;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const rr = r * (0.8 + 0.3 * Math.sin(i * 2.3));
      const x = Math.cos(angle) * rr;
      const y = Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.stroke();
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

    const wheelBase = bike.wheelBase;
    const halfWidth = bike.width / 2;

    if (bike.nitroActive || bike.nitroBurstTimer > 0) {
      const burstScale = bike.nitroBurstTimer > 0
        ? 1 + (0.4 - bike.nitroBurstTimer) / 0.4 * 0.5
        : 1;
      const nitroGlowSize = (bike.nitroActive ? 40 : 20) * burstScale;

      ctx.shadowBlur = nitroGlowSize;
      ctx.shadowColor = '#00f5ff';

      const glowGradient = ctx.createRadialGradient(-wheelBase * 0.3, 0, 0, -wheelBase * 0.3, 0, wheelBase * 1.5 * burstScale);
      glowGradient.addColorStop(0, 'rgba(0, 245, 255, 0.4)');
      glowGradient.addColorStop(0.5, 'rgba(0, 245, 255, 0.15)');
      glowGradient.addColorStop(1, 'rgba(0, 245, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(-wheelBase * 0.3, 0, wheelBase * 1.5 * burstScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.shadowBlur = bike.nitroActive ? 30 : 15;

    let bodyColor = bike.color;
    let bodyShadowColor = bike.color;

    if (bike.paintSpecial === 'rainbow') {
      const hue = (Date.now() * 0.15) % 360;
      bodyColor = `hsl(${hue}, 100%, 60%)`;
      bodyShadowColor = `hsl(${hue}, 100%, 55%)`;
    }

    ctx.shadowColor = bike.nitroActive ? '#00ffff' : bodyShadowColor;
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(wheelBase * 0.6, 0);
    ctx.lineTo(wheelBase * 0.2, -halfWidth);
    ctx.lineTo(-wheelBase * 0.5, -halfWidth * 0.8);
    ctx.lineTo(-wheelBase * 0.7, 0);
    ctx.lineTo(-wheelBase * 0.5, halfWidth * 0.8);
    ctx.lineTo(wheelBase * 0.2, halfWidth);
    ctx.closePath();
    ctx.fill();

    if (bike.nitroActive) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(wheelBase * 0.1, 0, halfWidth * 0.6, halfWidth * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (bike.speed > 20) {
      const baseTail = bike.speed * 0.35;
      const nitroMultiplier = bike.nitroActive ? 3.5 : 1;
      const tailLength = Math.min(baseTail * nitroMultiplier, bike.nitroActive ? 300 : 90);

      const tailStartAlpha = bike.nitroActive ? 0.9 : 0.6;
      const tailWidth = bike.nitroActive ? halfWidth * 0.9 : halfWidth * 0.5;

      const gradient = ctx.createLinearGradient(-wheelBase * 0.7, 0, -wheelBase * 0.7 - tailLength, 0);
      if (bike.nitroActive) {
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.15, '#00ffff');
        gradient.addColorStop(0.4, '#00f5ff');
        gradient.addColorStop(0.7, 'rgba(0, 245, 255, 0.4)');
        gradient.addColorStop(1, 'transparent');
      } else if (bike.paintSpecial === 'rainbow') {
        const tailHue = (Date.now() * 0.15) % 360;
        gradient.addColorStop(0, `hsl(${tailHue}, 100%, 65%)`);
        gradient.addColorStop(1, 'transparent');
      } else {
        gradient.addColorStop(0, bike.color);
        gradient.addColorStop(1, 'transparent');
      }

      ctx.shadowBlur = bike.nitroActive ? 25 : 0;
      ctx.shadowColor = '#00ffff';
      ctx.fillStyle = gradient;
      ctx.globalAlpha = tailStartAlpha;
      ctx.beginPath();
      ctx.moveTo(-wheelBase * 0.5, -tailWidth);
      ctx.lineTo(-wheelBase * 0.7 - tailLength, 0);
      ctx.lineTo(-wheelBase * 0.5, tailWidth);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      if (bike.nitroActive) {
        for (let flame = 0; flame < 3; flame++) {
          const flameOffset = (Date.now() * 0.05 + flame * 50) % tailLength;
          const flameAlpha = 1 - flameOffset / tailLength;
          const flameSize = (8 + flame * 3) * flameAlpha;
          const flameX = -wheelBase * 0.7 - flameOffset;
          const flameY = Math.sin(Date.now() * 0.01 + flame * 2) * 5;

          ctx.shadowBlur = 20;
          ctx.shadowColor = flame % 2 === 0 ? '#ffffff' : '#00ffff';
          ctx.fillStyle = flame % 2 === 0 ? '#ffffff' : '#00ffff';
          ctx.globalAlpha = flameAlpha * 0.8;
          ctx.beginPath();
          ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    ctx.shadowBlur = 0;

    if (bike.isPlayer) {
      const ringColor = bike.nitroActive ? '#00ffff' : '#ffffff';
      const ringPulse = bike.nitroActive
        ? 0.7 + Math.sin(Date.now() * 0.02) * 0.3
        : 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
      const ringScale = bike.nitroBurstTimer > 0
        ? 1 + (0.4 - bike.nitroBurstTimer) / 0.4 * 0.3
        : 1;

      ctx.strokeStyle = ringColor;
      ctx.lineWidth = bike.nitroActive ? 3 : 2;
      ctx.globalAlpha = ringPulse;
      ctx.shadowBlur = bike.nitroActive ? 20 : 0;
      ctx.shadowColor = ringColor;
      ctx.beginPath();
      ctx.arc(0, 0, wheelBase * 0.8 * ringScale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  drawPoliceBike(police) {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(police.x, police.y);
    ctx.rotate(police.angle + police.driftAngle * 0.5);

    const wheelBase = police.wheelBase;
    const halfWidth = police.width / 2;

    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ff0044';
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(wheelBase * 0.6, 0);
    ctx.lineTo(wheelBase * 0.2, -halfWidth);
    ctx.lineTo(-wheelBase * 0.5, -halfWidth * 0.8);
    ctx.lineTo(-wheelBase * 0.7, 0);
    ctx.lineTo(-wheelBase * 0.5, halfWidth * 0.8);
    ctx.lineTo(wheelBase * 0.2, halfWidth);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff0044';
    ctx.beginPath();
    ctx.moveTo(wheelBase * 0.2, -halfWidth * 0.3);
    ctx.lineTo(-wheelBase * 0.3, -halfWidth * 0.9);
    ctx.lineTo(-wheelBase * 0.5, -halfWidth * 0.6);
    ctx.lineTo(wheelBase * 0.05, -halfWidth * 0.1);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0044ff';
    ctx.beginPath();
    ctx.moveTo(wheelBase * 0.2, halfWidth * 0.3);
    ctx.lineTo(-wheelBase * 0.3, halfWidth * 0.9);
    ctx.lineTo(-wheelBase * 0.5, halfWidth * 0.6);
    ctx.lineTo(wheelBase * 0.05, halfWidth * 0.1);
    ctx.closePath();
    ctx.fill();

    const sirenPhase = police.sirenPhase || 0;
    const sirenIntensity = (Math.sin(sirenPhase) + 1) / 2;

    ctx.shadowBlur = 20 + sirenIntensity * 20;
    ctx.shadowColor = sirenIntensity > 0.5 ? '#ff0044' : '#0044ff';
    ctx.fillStyle = sirenIntensity > 0.5 ? '#ff0044' : '#0044ff';
    ctx.beginPath();
    ctx.arc(wheelBase * 0.1, 0, 5 + sirenIntensity * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 10 + (1 - sirenIntensity) * 15;
    ctx.shadowColor = sirenIntensity > 0.5 ? '#0044ff' : '#ff0044';
    ctx.fillStyle = sirenIntensity > 0.5 ? '#0044ff' : '#ff0044';
    ctx.beginPath();
    ctx.arc(wheelBase * -0.1, 0, 4 + (1 - sirenIntensity) * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    if (police.speed > 20) {
      const tailLength = Math.min(police.speed * 0.25, 60);
      const gradient = ctx.createLinearGradient(-wheelBase * 0.7, 0, -wheelBase * 0.7 - tailLength, 0);
      gradient.addColorStop(0, '#ff0044');
      gradient.addColorStop(1, 'transparent');

      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0044';
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(-wheelBase * 0.5, -halfWidth * 0.5);
      ctx.lineTo(-wheelBase * 0.7 - tailLength, 0);
      ctx.lineTo(-wheelBase * 0.5, halfWidth * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  drawParticles(bikes) {
    const ctx = this.ctx;

    bikes.forEach(bike => {
      bike.particles.forEach(p => {
        if (p.type === 'explosion') {
          const color = p.color || '#ff6600';
          const alpha = Math.min(1, p.life * 1.5);
          ctx.shadowBlur = 20 * p.life;
          ctx.shadowColor = color;
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        } else if (p.type === 'spark') {
          const color = p.color || '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.fillStyle = color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        } else if (p.type === 'smoke') {
          const alpha = Math.min(0.5, p.life * 0.6);
          ctx.fillStyle = `rgba(100, 100, 100, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'nitro') {
          const color = p.color || '#00f5ff';
          const alpha = Math.min(1, p.life * 1.2);
          ctx.shadowBlur = 25 * p.life;
          ctx.shadowColor = color;
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        } else if (p.type === 'nitroSmoke') {
          ctx.globalAlpha = Math.min(0.4, p.life * 0.5);
          ctx.fillStyle = p.color || 'rgba(150, 200, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = `rgba(100, 100, 100, ${p.life * 0.5})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    });
  }

  drawSpeedLines(player) {
    const ctx = this.ctx;
    const displayMaxSpeed = player.nitroActive ? player.baseMaxSpeed * player.nitroSpeedBoost : player.baseMaxSpeed;
    const speedRatio = Math.abs(player.speed) / displayMaxSpeed;
    const nitroBoost = player.nitroActive ? 1 : 0;

    if (speedRatio < 0.4 && nitroBoost === 0) return;

    const baseCount = nitroBoost > 0 ? 20 : 12;
    const count = Math.floor(Math.max(nitroBoost > 0 ? 5 : 0, speedRatio * baseCount) + nitroBoost * 25);
    const baseAlpha = nitroBoost > 0 ? 0.7 : (speedRatio - 0.4) * 0.9;
    const baseLength = nitroBoost > 0 ? 120 : 60;
    const baseDist = nitroBoost > 0 ? 120 : 80;

    ctx.lineCap = 'round';

    for (let i = 0; i < count; i++) {
      const angleSpread = nitroBoost > 0 ? 1.2 : 0.8;
      const angle = player.angle + Utils.randomRange(-angleSpread, angleSpread);
      const dist = Utils.randomRange(baseDist, baseDist + (nitroBoost > 0 ? 350 : 220));
      const length = Utils.randomRange(baseLength, baseLength + (nitroBoost > 0 ? 100 : 50));

      const x1 = player.x + Math.cos(angle) * dist;
      const y1 = player.y + Math.sin(angle) * dist;
      const x2 = player.x + Math.cos(angle) * (dist + length);
      const y2 = player.y + Math.sin(angle) * (dist + length);

      if (nitroBoost > 0) {
        const nitroColors = ['#00f5ff', '#00ffff', '#ffffff', '#66ffff'];
        const lineColor = nitroColors[Math.floor(Math.random() * nitroColors.length)];
        ctx.strokeStyle = lineColor;
        ctx.shadowBlur = 15;
        ctx.shadowColor = lineColor;
        ctx.globalAlpha = baseAlpha * Utils.randomRange(0.6, 1.0);
        ctx.lineWidth = Utils.randomRange(2, 5);
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * Utils.randomRange(0.7, 1.0)})`;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  drawNitroBurst(player) {
    if (!player.nitroActive && player.nitroBurstTimer <= 0) return;

    const ctx = this.ctx;
    const burstProgress = player.nitroBurstTimer > 0
      ? (0.4 - player.nitroBurstTimer) / 0.4
      : 0;

    if (player.nitroBurstTimer > 0) {
      const shockwaveRadius = 30 + burstProgress * 120;
      const shockwaveAlpha = (1 - burstProgress) * 0.8;

      ctx.shadowBlur = 40;
      ctx.shadowColor = '#00f5ff';
      ctx.strokeStyle = `rgba(0, 245, 255, ${shockwaveAlpha})`;
      ctx.lineWidth = 6 * (1 - burstProgress * 0.5);
      ctx.beginPath();
      ctx.arc(player.x, player.y, shockwaveRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowColor = '#ffffff';
      ctx.strokeStyle = `rgba(255, 255, 255, ${shockwaveAlpha * 0.6})`;
      ctx.lineWidth = 3 * (1 - burstProgress * 0.5);
      ctx.beginPath();
      ctx.arc(player.x, player.y, shockwaveRadius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  drawNitroScreenOverlay(player) {
    if (!player.nitroActive && player.nitroBurstTimer <= 0) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const nitroIntensity = player.nitroActive ? 1 : Math.max(0, player.nitroBurstTimer / 0.4);

    if (player.nitroBurstTimer > 0) {
      const burstAlpha = (player.nitroBurstTimer / 0.4) * 0.35;
      ctx.fillStyle = `rgba(0, 245, 255, ${burstAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    if (player.nitroActive) {
      const pulse = Math.sin(Date.now() * 0.012) * 0.02 + 0.06;
      const edgeAlpha = nitroIntensity * pulse;

      const gradient = ctx.createRadialGradient(
        this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.2,
        this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.75
      );
      gradient.addColorStop(0, 'rgba(0, 245, 255, 0)');
      gradient.addColorStop(0.7, `rgba(0, 245, 255, ${edgeAlpha * 0.5})`);
      gradient.addColorStop(1, `rgba(0, 245, 255, ${edgeAlpha * 1.5})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  }

  drawHUD(game) {
    const ctx = this.ctx;
    const padding = this.isPortrait() ? 12 : 20;
    const uiScale = this._getUIScale();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.track = game.track;

    if (this.isPortrait()) {
      this._drawSpeedometer(game.player, padding, this.height - 100 * uiScale, uiScale);
      this.drawNitroHUD(game.player, padding, this.height - 150 * uiScale, uiScale);
      this._drawLapInfoPortrait(game.player, game.totalLaps, padding, padding, uiScale);
      this._drawTimerPortrait(game.raceTime, this.width / 2 - 90 * uiScale, padding, uiScale);
      this._drawBestLapPortrait(game.player, game.raceTime, this.width / 2 - 90 * uiScale, padding + 50 * uiScale, uiScale);
      this._drawRankingsPortrait(game.getRankings(), this.width - padding - 130 * uiScale, padding, uiScale);
      this._drawDifficultyBadgePortrait(game.difficulty, padding, padding + 95 * uiScale, uiScale);
      this.drawCurrentRouteIndicatorPortrait(game.player, uiScale);
    } else {
      this._drawSpeedometer(game.player, padding, this.height - 120, 1);
      this.drawNitroHUD(game.player, padding, this.height - 170, 1);
      this._drawLapInfo(game.player, game.totalLaps, this.width - padding - 180, padding);
      this._drawTimer(game.raceTime, this.width / 2 - 100, padding);
      this._drawBestLap(game.player, game.raceTime, this.width / 2 - 100, padding + 60);
      this._drawRankings(game.getRankings(), padding, padding);
      this._drawDifficultyBadge(game.difficulty, this.width - padding - 180, padding + 95);
      this.drawCurrentRouteIndicator(game.player);
    }

    if (game.player.isNewLapRecord) {
      this._drawNewRecordOverlay(game.player);
    }

    if (game._isWantedMode && game.wantedSystem && game.wantedSystem.getState() !== WantedState.IDLE) {
      this.drawWantedHUD(game);
    }

    ctx.restore();

    this.drawNitroScreenOverlay(game.player);
    this.drawRouteHints(game.track, game.player);
    this.drawAchievementNotification(game);
  }

  drawWantedHUD(game) {
    const ctx = this.ctx;
    const wanted = game.wantedSystem;
    const stars = wanted.getWantedStars();
    const state = wanted.getState();
    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();

    const padding = isPortrait ? 12 : 20;
    const rightX = this.width - padding;
    const topY = isPortrait ? 120 * uiScale : 140;

    const starSize = isPortrait ? 20 * uiScale : 22;
    const starSpacing = isPortrait ? 4 * uiScale : 5;
    const totalW = stars * starSize + (stars - 1) * starSpacing;
    const startX = rightX - totalW;

    const flashIntensity = wanted.flashTimer > 0 ? (wanted.flashTimer / 0.5) : 0;
    const isEscaping = state === WantedState.ESCAPING;

    for (let i = 0; i < stars; i++) {
      const starX = startX + i * (starSize + starSpacing);
      const starY = topY;

      const glowColor = isEscaping ? '#00ff66' : '#ff0044';
      const starColor = '#ffff00';

      ctx.shadowBlur = 12 + flashIntensity * 15;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = starColor;
      ctx.font = `bold ${starSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('★', starX, starY);
    }
    ctx.shadowBlur = 0;

    const labelY = topY + starSize + (isPortrait ? 4 * uiScale : 6);
    const labelSize = isPortrait ? 11 * uiScale : 12;
    let labelText = 'WANTED';
    let labelColor = '#ff0044';

    if (state === WantedState.ESCAPING) {
      labelText = 'ESCAPING...';
      labelColor = '#00ff66';
    } else if (state === WantedState.ESCAPED) {
      labelText = 'ESCAPED!';
      labelColor = '#00ff66';
    } else if (state === WantedState.BUSTED) {
      labelText = 'BUSTED!';
      labelColor = '#ff0044';
    }

    ctx.shadowBlur = 8;
    ctx.shadowColor = labelColor;
    ctx.fillStyle = labelColor;
    ctx.font = `bold ${labelSize}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(labelText, rightX, labelY);
    ctx.shadowBlur = 0;

    if (state === WantedState.ESCAPING || state === WantedState.WANTED) {
      const barW = isPortrait ? 100 * uiScale : 120;
      const barH = isPortrait ? 6 * uiScale : 7;
      const barX = rightX - barW;
      const barY = labelY + labelSize + (isPortrait ? 8 * uiScale : 10);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 3 * uiScale);
      ctx.fill();

      const progress = wanted.getEscapeProgress();
      const progressColor = state === WantedState.ESCAPING ? '#00ff66' : '#ff0044';

      ctx.shadowBlur = 6;
      ctx.shadowColor = progressColor;
      ctx.fillStyle = progressColor;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * progress, barH, 3 * uiScale);
      ctx.fill();
      ctx.shadowBlur = 0;

      const timeText = state === WantedState.ESCAPING
        ? `逃脱: ${Math.ceil((1 - progress) * WantedLevelConfig[stars].escapeTime)}s`
        : `存活: ${Math.floor(wanted.getSurvivalTime())}s`;

      ctx.fillStyle = '#aaa';
      ctx.font = `${labelSize - 1}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(timeText, rightX, barY + barH + (isPortrait ? 12 * uiScale : 14));
    }

    const policeCount = wanted.getPoliceBikes().length;
    const countY = isPortrait ? 95 * uiScale : 90;

    ctx.fillStyle = '#ff0044';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ff0044';
    ctx.font = `bold ${labelSize}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`🚓 ×${policeCount}`, rightX, countY);
    ctx.shadowBlur = 0;

    if (state === WantedState.WANTED || state === WantedState.ESCAPING) {
      const heatLevel = wanted.heatLevel;
      const heatMax = wanted.maxHeat;
      const heatRatio = heatLevel / heatMax;

      const heatBarW = isPortrait ? 80 * uiScale : 100;
      const heatBarH = isPortrait ? 4 * uiScale : 5;
      const heatBarX = rightX - heatBarW;
      const heatBarY = countY + 20;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(heatBarX, heatBarY, heatBarW, heatBarH);

      const heatColor = heatRatio > 0.7 ? '#ff0044' : heatRatio > 0.4 ? '#ff6600' : '#ffff00';
      ctx.shadowBlur = 4;
      ctx.shadowColor = heatColor;
      ctx.fillStyle = heatColor;
      ctx.fillRect(heatBarX, heatBarY, heatBarW * heatRatio, heatBarH);
      ctx.shadowBlur = 0;
    }
  }

  _drawSpeedometer(player, x, y, scale = 1) {
    const ctx = this.ctx;
    const speed = Math.abs(player.speed);
    const displayMaxSpeed = player.nitroActive ? player.baseMaxSpeed * player.nitroSpeedBoost : player.maxSpeed;
    const speedRatio = speed / displayMaxSpeed;

    const w = 200 * scale;
    const h = 100 * scale;
    const fontSize = 36 * scale;
    const labelSize = 14 * scale;
    const barW = 160 * scale;
    const barH = 6 * scale;

    const nitroActive = player.nitroActive;
    const nitroBurst = player.nitroBurstTimer > 0;

    const bgColor = nitroBurst
      ? 'rgba(0, 245, 255, 0.25)'
      : nitroActive
        ? 'rgba(0, 245, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.6)';

    const borderColor = nitroActive ? '#00ffff' : '#00f5ff';
    const borderGlow = nitroBurst ? 25 * scale : (nitroActive ? 18 * scale : 10 * scale);

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10 * scale);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = nitroActive ? 3 * scale : 2 * scale;
    ctx.shadowBlur = borderGlow;
    ctx.shadowColor = borderColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const speedColor = nitroActive
      ? (Math.floor(Date.now() / 80) % 2 === 0 ? '#ffffff' : '#00ffff')
      : '#00f5ff';

    ctx.shadowBlur = nitroActive ? 15 * scale : 0;
    ctx.shadowColor = nitroActive ? '#00ffff' : 'transparent';
    ctx.fillStyle = speedColor;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(speed * 3.6)}`, x + w / 2, y + h * 0.5);
    ctx.shadowBlur = 0;

    ctx.fillStyle = nitroActive ? '#00ffff' : '#888';
    ctx.font = `${labelSize}px monospace`;
    ctx.fillText(nitroActive ? 'BOOST KM/H' : 'KM/H', x + w / 2, y + h * 0.72);

    const barX = x + (w - barW) / 2;
    const barY = y + h * 0.82;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);

    const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    if (nitroActive) {
      gradient.addColorStop(0, '#00ffff');
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, '#00f5ff');
    } else {
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(0.6, '#ffff00');
      gradient.addColorStop(1, '#ff0000');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barW * Math.min(speedRatio, 1), barH);
  }

  drawNitroHUD(player, x, y, scale = 1) {
    const ctx = this.ctx;
    const energyRatio = player.nitroEnergy / player.nitroMaxEnergy;
    const isFull = player.nitroEnergy >= player.nitroMaxEnergy;
    const isActive = player.nitroActive;
    const readyPulse = Math.sin(player.nitroReadyPulse) * 0.5 + 0.5;

    const w = 200 * scale;
    const h = 42 * scale;
    const barH = 14 * scale;
    const labelSize = 10 * scale;
    const valueSize = 11 * scale;

    const bgAlpha = isFull ? 0.8 : 0.6;
    ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * scale);
    ctx.fill();

    const borderColor = isActive
      ? '#ffffff'
      : isFull
        ? (readyPulse > 0.5 ? '#00ffff' : '#00f5ff')
        : '#00f5ff';
    const borderWidth = isFull ? 2.5 * scale : 1.5 * scale;
    const glowSize = isFull ? (12 + readyPulse * 15) * scale : 6 * scale;

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.shadowBlur = glowSize;
    ctx.shadowColor = borderColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = isActive ? '#00ffff' : '#888';
    ctx.font = `${labelSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('N₂O 氮气', x + 10 * scale, y + 14 * scale);

    const statusText = isActive
      ? 'BOOST!'
      : isFull
        ? '已就绪 [SHIFT]'
        : player.nitroCooldown > 0
          ? `冷却 ${player.nitroCooldown.toFixed(1)}s`
          : '充能中...';
    const statusColor = isActive
      ? '#ffffff'
      : isFull
        ? '#00ffff'
        : player.nitroEnergy >= 25
          ? '#00f5ff'
          : '#666';
    ctx.fillStyle = statusColor;
    ctx.font = `bold ${valueSize}px monospace`;
    ctx.textAlign = 'right';
    ctx.shadowBlur = isActive ? 10 * scale : (isFull ? readyPulse * 10 * scale : 0);
    ctx.shadowColor = isActive || isFull ? '#00ffff' : 'transparent';
    ctx.fillText(statusText, x + w - 10 * scale, y + 14 * scale);
    ctx.shadowBlur = 0;

    const barX = x + 10 * scale;
    const barY = y + 20 * scale;
    const barW = w - 20 * scale;

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 4 * scale);
    ctx.fill();

    const fillGradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    if (isActive) {
      const flicker = 0.85 + Math.random() * 0.15;
      fillGradient.addColorStop(0, `rgba(0, 255, 255, ${flicker})`);
      fillGradient.addColorStop(0.3, `rgba(255, 255, 255, ${flicker})`);
      fillGradient.addColorStop(0.6, `rgba(0, 245, 255, ${flicker})`);
      fillGradient.addColorStop(1, `rgba(100, 200, 255, ${flicker * 0.8})`);
    } else if (isFull) {
      const pulseAlpha = 0.8 + readyPulse * 0.2;
      fillGradient.addColorStop(0, `rgba(0, 245, 255, ${pulseAlpha})`);
      fillGradient.addColorStop(0.5, `rgba(0, 255, 255, ${pulseAlpha})`);
      fillGradient.addColorStop(1, `rgba(100, 200, 255, ${pulseAlpha})`);
    } else {
      fillGradient.addColorStop(0, 'rgba(0, 150, 200, 0.9)');
      fillGradient.addColorStop(0.5, 'rgba(0, 200, 220, 0.9)');
      fillGradient.addColorStop(1, 'rgba(0, 245, 255, 0.9)');
    }

    const segmentCount = 10;
    const fillW = barW * energyRatio;
    ctx.fillStyle = fillGradient;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillW, barH, 4 * scale);
    ctx.fill();

    if (isFull) {
      for (let i = 0; i < segmentCount; i++) {
        const segX = barX + (barW / segmentCount) * i + 1;
        const segW = barW / segmentCount - 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${readyPulse * 0.3})`;
        ctx.fillRect(segX, barY + 1, segW, barH - 2);
      }
    }

    ctx.strokeStyle = isActive ? 'rgba(255,255,255,0.6)' : 'rgba(0, 245, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 4 * scale);
    ctx.stroke();

    const pct = Math.floor(energyRatio * 100);
    ctx.fillStyle = isActive ? '#ffffff' : (isFull ? '#00ffff' : '#aaa');
    ctx.font = `bold ${valueSize - 1}px monospace`;
    ctx.textAlign = 'center';
    ctx.shadowBlur = isActive || isFull ? 5 * scale : 0;
    ctx.shadowColor = '#00ffff';
    ctx.fillText(`${pct}%`, barX + barW / 2, barY + 11 * scale);
    ctx.shadowBlur = 0;
  }

  _drawLapInfoPortrait(player, totalLaps, x, y, scale = 1) {
    const ctx = this.ctx;
    const displayLap = Math.min(player.lap + 1, totalLaps);
    const currentRoute = this.track ? this.track.getRoute(player.currentRouteId) : null;
    const numCheckpoints = currentRoute ? currentRoute.checkpoints.length : 6;
    const lapProgress = (player.lap + (player.checkpoint + 1) / numCheckpoints) / totalLaps;

    const w = 130 * scale;
    const h = 60 * scale;
    const fontSize = 16 * scale;
    const subSize = 10 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * scale);
    ctx.fill();

    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2 * scale;
    ctx.shadowBlur = 8 * scale;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`LAP ${displayLap}/${totalLaps}`, x + w / 2, y + h * 0.45);

    ctx.fillStyle = '#888';
    ctx.font = `${subSize}px monospace`;
    ctx.fillText(`CP:${player.checkpoint + 1}/${numCheckpoints}`, x + w / 2, y + h * 0.7);

    const barW = w * 0.8;
    const barH = 4 * scale;
    const barX = x + (w - barW) / 2;
    const barY = y + h * 0.82;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);

    const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(1, '#00f5ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barW * Math.min(lapProgress, 1), barH);
  }

  _drawTimerPortrait(time, x, y, scale = 1) {
    const ctx = this.ctx;
    const w = 180 * scale;
    const h = 40 * scale;
    const fontSize = 22 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * scale);
    ctx.fill();

    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2 * scale;
    ctx.shadowBlur = 8 * scale;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffff00';
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(Utils.formatTime(time), x + w / 2, y + h * 0.68);
  }

  _drawBestLapPortrait(player, raceTime, x, y, scale = 1) {
    const ctx = this.ctx;
    const currentLapTime = raceTime - player.lastLapTime;
    const hasBest = player.bestLapTime < Infinity;

    const w = 180 * scale;
    const h = 55 * scale;
    const labelSize = 9 * scale;
    const valueSize = 13 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * scale);
    ctx.fill();

    const bestColor = hasBest ? '#00ff66' : '#444';
    ctx.strokeStyle = bestColor;
    ctx.lineWidth = 1.5 * scale;
    if (hasBest) {
      ctx.shadowBlur = 6 * scale;
      ctx.shadowColor = bestColor;
    }
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = `${labelSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('当前圈', x + 8 * scale, y + h * 0.32);

    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 3 * scale;
    ctx.shadowColor = '#ffff00';
    ctx.font = `bold ${valueSize}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(Utils.formatTime(currentLapTime), x + w - 8 * scale, y + h * 0.32);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8 * scale, y + h * 0.48);
    ctx.lineTo(x + w - 8 * scale, y + h * 0.48);
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.font = `${labelSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('最佳圈', x + 8 * scale, y + h * 0.78);

    ctx.fillStyle = hasBest ? '#00ff66' : '#555';
    ctx.shadowBlur = hasBest ? 3 * scale : 0;
    ctx.shadowColor = bestColor;
    ctx.font = `bold ${valueSize}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(
      hasBest ? Utils.formatTime(player.bestLapTime) : '--:--:--',
      x + w - 8 * scale,
      y + h * 0.78
    );
    ctx.shadowBlur = 0;
  }

  _drawRankingsPortrait(rankings, x, y, scale = 1) {
    const ctx = this.ctx;
    const w = 130 * scale;
    const h = (24 + rankings.length * 22) * scale;
    const titleSize = 13 * scale;
    const itemSize = 11 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * scale);
    ctx.fill();

    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2 * scale;
    ctx.shadowBlur = 8 * scale;
    ctx.shadowColor = '#00f5ff';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('排名', x + 10 * scale, y + 22 * scale);

    const visibleRankings = rankings.slice(0, Math.min(4, rankings.length));
    visibleRankings.forEach((r, i) => {
      const bike = r.bike;
      const rankY = y + (42 + i * 22) * scale;

      ctx.fillStyle = bike.isPlayer ? '#ffff00' : '#888';
      ctx.font = `${itemSize}px monospace`;
      ctx.fillText(`${i + 1}.`, x + 10 * scale, rankY);

      ctx.fillStyle = bike.color;
      ctx.fillRect(x + 30 * scale, rankY - 8 * scale, 8 * scale, 8 * scale);

      ctx.fillStyle = bike.isPlayer ? '#ffffff' : '#aaa';
      ctx.fillText(bike.isPlayer ? '你' : `AI${i}`, x + 45 * scale, rankY);

      if (bike.finished) {
        ctx.fillStyle = '#00ff00';
        ctx.font = `${itemSize - 2}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(Utils.formatTime(bike.raceTime).slice(3), x + w - 8 * scale, rankY);
        ctx.textAlign = 'left';
      }
    });
  }

  _drawDifficultyBadgePortrait(difficulty, x, y, scale = 1) {
    const ctx = this.ctx;
    const cfg = DifficultySettings[difficulty];
    const w = 130 * scale;
    const h = 28 * scale;
    const labelSize = 9 * scale;
    const valueSize = 13 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * scale);
    ctx.fill();

    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 1.5 * scale;
    ctx.shadowBlur = 8 * scale;
    ctx.shadowColor = cfg.color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = `${labelSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('难度', x + 8 * scale, y + h * 0.42);

    ctx.fillStyle = cfg.color;
    ctx.shadowBlur = 5 * scale;
    ctx.shadowColor = cfg.color;
    ctx.font = `bold ${valueSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(cfg.label, x + w / 2, y + h * 0.76);
    ctx.shadowBlur = 0;
  }

  drawCurrentRouteIndicatorPortrait(player, scale = 1) {
    const ctx = this.ctx;
    const route = player.currentRouteId ?
      (this.track ? this.track.getRoute(player.currentRouteId) : null) : null;

    if (!route) return;

    const w = 140 * scale;
    const h = 35 * scale;
    const x = this.width / 2 - w / 2;
    const y = this.height - 180 * scale;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * scale);
    ctx.fill();

    ctx.strokeStyle = route.color;
    ctx.lineWidth = 2 * scale;
    ctx.shadowBlur = 8 * scale;
    ctx.shadowColor = route.color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('当前路线', x + 8 * scale, y + h * 0.4);

    ctx.fillStyle = route.color;
    ctx.shadowBlur = 4 * scale;
    ctx.shadowColor = route.color;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.fillText(route.name, x + 8 * scale, y + h * 0.78);
    ctx.shadowBlur = 0;

    if (route.isShortcut) {
      ctx.fillStyle = '#00ff00';
      ctx.font = `bold ${9 * scale}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`-${Math.round((1 - route.lengthBonus) * 100)}%`, x + w - 8 * scale, y + h * 0.78);
    }

    ctx.restore();
  }

  _drawLapInfo(player, totalLaps, x, y) {
    const ctx = this.ctx;
    const displayLap = Math.min(player.lap + 1, totalLaps);
    const currentRoute = this.track ? this.track.getRoute(player.currentRouteId) : null;
    const numCheckpoints = currentRoute ? currentRoute.checkpoints.length : 6;
    const lapProgress = (player.lap + (player.checkpoint + 1) / numCheckpoints) / totalLaps;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, 180, 80, 10);
    ctx.fill();

    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.roundRect(x, y, 180, 80, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`LAP ${displayLap} / ${totalLaps}`, x + 90, y + 32);

    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText(`Checkpoint: ${player.checkpoint + 1}/${numCheckpoints}`, x + 90, y + 52);

    const barWidth = 150;
    const barHeight = 6;
    const barX = x + 15;
    const barY = y + 62;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(1, '#00f5ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth * Math.min(lapProgress, 1), barHeight);
  }

  _drawDifficultyBadge(difficulty, x, y) {
    const ctx = this.ctx;
    const cfg = DifficultySettings[difficulty];

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, 180, 36, 8);
    ctx.fill();

    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = cfg.color;
    ctx.beginPath();
    ctx.roundRect(x, y, 180, 36, 8);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('难度', x + 12, y + 14);

    ctx.fillStyle = cfg.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = cfg.color;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(cfg.label, x + 90, y + 26);
    ctx.shadowBlur = 0;
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

  _drawBestLap(player, raceTime, x, y) {
    const ctx = this.ctx;
    const currentLapTime = raceTime - player.lastLapTime;
    const hasBest = player.bestLapTime < Infinity;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, 200, 70, 10);
    ctx.fill();

    const bestColor = hasBest ? '#00ff66' : '#444';
    ctx.strokeStyle = bestColor;
    ctx.lineWidth = 2;
    if (hasBest) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = bestColor;
    }
    ctx.beginPath();
    ctx.roundRect(x, y, 200, 70, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CURRENT LAP', x + 12, y + 16);

    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffff00';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(Utils.formatTime(currentLapTime), x + 188, y + 16);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 28);
    ctx.lineTo(x + 190, y + 28);
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BEST LAP', x + 12, y + 48);

    ctx.fillStyle = hasBest ? '#00ff66' : '#555';
    ctx.shadowBlur = hasBest ? 4 : 0;
    ctx.shadowColor = bestColor;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      hasBest ? Utils.formatTime(player.bestLapTime) : '--:--:--',
      x + 188,
      y + 48
    );
    ctx.shadowBlur = 0;

    if (hasBest && currentLapTime > 0 && currentLapTime < player.bestLapTime) {
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('- ' + Utils.formatTime(player.bestLapTime - currentLapTime), x + 188, y + 64);
    }
  }

  _drawNewRecordOverlay(player) {
    const ctx = this.ctx;
    const elapsed = 3.0 - player.newRecordTimer;
    const alpha = Math.max(0, 1 - elapsed * 0.33);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const centerX = this.width / 2;
    const centerY = this.height * 0.28;

    const pulseScale = 1 + Math.sin(elapsed * 6) * 0.08;
    const floatY = Math.sin(elapsed * 3) * 5;

    ctx.translate(centerX, centerY + floatY);
    ctx.scale(pulseScale, pulseScale);

    const glowSize = 80 + Math.sin(elapsed * 8) * 20;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
    gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha * 0.3})`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);

    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ffff00';
    ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 新纪录!', 0, -5);
    ctx.shadowBlur = 0;

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ff66';
    ctx.fillStyle = `rgba(0, 255, 102, ${alpha})`;
    ctx.font = 'bold 26px monospace';
    ctx.fillText(Utils.formatTime(player.bestLapTime), 0, 35);
    ctx.shadowBlur = 0;

    if (elapsed > 0.5) {
      const sparkleAlpha = Math.min(1, (elapsed - 0.5) * 2) * alpha;
      ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha * 0.8})`;
      ctx.font = '14px monospace';
      ctx.fillText('✦ 最佳单圈 ✦', 0, 60);
    }

    ctx.restore();
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

      if (this.track && bike.currentRouteId && bike.currentRouteId !== 'main') {
        const route = this.track.getRoute(bike.currentRouteId);
        if (route) {
          ctx.fillStyle = route.color;
          ctx.fillRect(x + 115, rankY - 10, 8, 12);
        }
      }

      if (bike.finished) {
        ctx.fillStyle = '#00ff00';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(Utils.formatTime(bike.raceTime), x + width - 15, rankY);
        ctx.textAlign = 'left';
      }
    });
  }

  drawVehicleSelect(game) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.97)';
    ctx.fillRect(0, 0, this.width, this.height);

    this._drawVehicleSelectBackground();

    const titleY = isPortrait ? 35 * uiScale : 45;
    const titleSize = isPortrait ? 26 * uiScale : 32;
    const subtitleSize = isPortrait ? 11 * uiScale : 14;

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('车辆选择', centerX, titleY);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = `${subtitleSize}px monospace`;
    ctx.fillText('← → 切换车辆  空格/回车 确认  ESC 返回', centerX, titleY + (isPortrait ? 22 * uiScale : 28));

    const selectedKey = VehicleTypeKeys[game.vehicleSelectCursor];
    const selectedVehicle = VehicleTypes[selectedKey];
    const isCurrentVehicle = selectedKey === game.selectedVehicle;

    if (isPortrait) {
      this._drawVehicleSelectPortrait(game, selectedKey, selectedVehicle, isCurrentVehicle, uiScale, centerX, centerY);
    } else {
      this._drawVehicleSelectLandscape(game, selectedKey, selectedVehicle, isCurrentVehicle, uiScale, centerX, centerY);
    }

    ctx.restore();
  }

  _drawVehicleSelectBackground() {
    const ctx = this.ctx;
    const gradient = ctx.createRadialGradient(
      this.width * 0.3, this.height * 0.4, 0,
      this.width * 0.3, this.height * 0.4, this.width * 0.6
    );
    gradient.addColorStop(0, 'rgba(0, 245, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    const gradient2 = ctx.createRadialGradient(
      this.width * 0.7, this.height * 0.6, 0,
      this.width * 0.7, this.height * 0.6, this.width * 0.5
    );
    gradient2.addColorStop(0, 'rgba(255, 0, 255, 0.05)');
    gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  _drawVehicleSelectLandscape(game, selectedKey, selectedVehicle, isCurrentVehicle, uiScale, centerX, centerY) {
    const ctx = this.ctx;

    const previewPanelX = 60;
    const previewPanelY = 100;
    const previewPanelW = 380;
    const previewPanelH = this.height - 180;

    const listPanelX = previewPanelX + previewPanelW + 30;
    const listPanelY = 100;
    const listPanelW = this.width - listPanelX - 60;
    const listPanelH = this.height - 180;

    this._drawPreviewPanel(previewPanelX, previewPanelY, previewPanelW, previewPanelH, selectedVehicle, isCurrentVehicle);
    this._drawVehicleListPanel(listPanelX, listPanelY, listPanelW, listPanelH, game, selectedKey);
    this._drawActionButtons(this.width / 2 - 160, this.height - 65, 320, game, selectedVehicle, selectedKey);
  }

  _drawVehicleSelectPortrait(game, selectedKey, selectedVehicle, isCurrentVehicle, uiScale, centerX, centerY) {
    const ctx = this.ctx;

    const previewH = 200 * uiScale;
    const previewY = 70 * uiScale;
    const previewW = Math.min(340 * uiScale, this.width * 0.9);
    const previewX = centerX - previewW / 2;

    const listY = previewY + previewH + 15 * uiScale;
    const listH = this.height - listY - 100 * uiScale;
    const listW = Math.min(360 * uiScale, this.width * 0.92);
    const listX = centerX - listW / 2;

    this._drawPreviewPanel(previewX, previewY, previewW, previewH, selectedVehicle, isCurrentVehicle);
    this._drawVehicleListPanel(listX, listY, listW, listH, game, selectedKey);
    this._drawActionButtons(centerX - 140 * uiScale, this.height - 75 * uiScale, 280 * uiScale, game, selectedVehicle, selectedKey);
  }

  _drawPreviewPanel(x, y, w, h, vehicle, isCurrent) {
    const ctx = this.ctx;
    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();

    ctx.fillStyle = 'rgba(20, 20, 45, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();

    ctx.strokeStyle = vehicle.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = vehicle.color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (isCurrent) {
      const badgeW = 70;
      const badgeH = 22;
      ctx.fillStyle = 'rgba(0, 255, 102, 0.2)';
      ctx.beginPath();
      ctx.roundRect(x + w - badgeW - 12, y + 12, badgeW, badgeH, 4);
      ctx.fill();
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#00ff66';
      ctx.beginPath();
      ctx.roundRect(x + w - badgeW - 12, y + 12, badgeW, badgeH, 4);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#00ff66';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✓ 当前使用', x + w - badgeW / 2 - 12, y + 12 + badgeH * 0.72);
    }

    const previewSize = Math.min(w * 0.5, h * 0.4);
    const previewY = y + h * 0.28;
    const scale = previewSize / 50;
    this._drawVehiclePreview(x + w / 2, previewY, vehicle, scale, true);

    const nameSize = isPortrait ? 24 * uiScale : 28;
    const subSize = isPortrait ? 13 * uiScale : 15;
    const nameY = y + h * 0.55;

    ctx.shadowBlur = 12;
    ctx.shadowColor = vehicle.color;
    ctx.fillStyle = vehicle.color;
    ctx.font = `bold ${nameSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(vehicle.name, x + w / 2, nameY);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#aaa';
    ctx.font = `${subSize}px monospace`;
    ctx.fillText(vehicle.subtitle, x + w / 2, nameY + subSize + 6);

    const descSize = isPortrait ? 11 * uiScale : 12;
    ctx.fillStyle = '#888';
    ctx.font = `${descSize}px monospace`;
    ctx.fillText(vehicle.description, x + w / 2, nameY + subSize + descSize + 18);

    const statsStartY = nameY + subSize + descSize + 45;
    this._drawDetailedStats(x + 25, statsStartY, w - 50, vehicle, isPortrait, uiScale);
  }

  _drawDetailedStats(x, y, w, vehicle, isPortrait, uiScale) {
    const ctx = this.ctx;
    const statNames = ['最高速度', '加速能力', '转向操控', '氮气系统'];
    const statKeys = ['speed', 'accel', 'handling', 'nitro'];
    const statValues = [
      `${Math.round(vehicle.baseMaxSpeed * 3.6 / 5)} km/h`,
      `${vehicle.baseAcceleration.toFixed(0)}`,
      `${vehicle.steerSpeed.toFixed(1)}`,
      `${vehicle.nitroMaxEnergy}`
    ];
    const barH = isPortrait ? 10 * uiScale : 12;
    const statSpacing = isPortrait ? 28 * uiScale : 30;
    const labelSize = isPortrait ? 10 * uiScale : 11;
    const valueSize = isPortrait ? 10 * uiScale : 11;

    statKeys.forEach((statKey, si) => {
      const sy = y + si * statSpacing;
      const value = vehicle.stats[statKey];

      ctx.fillStyle = '#999';
      ctx.font = `${labelSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(statNames[si], x, sy);

      ctx.fillStyle = vehicle.color;
      ctx.font = `bold ${valueSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(statValues[si], x + w, sy);

      const barY = sy + 6;
      ctx.fillStyle = 'rgba(30, 30, 60, 0.8)';
      ctx.beginPath();
      ctx.roundRect(x, barY, w, barH, 4);
      ctx.fill();

      const fillW = w * (value / 5);
      const statGrad = ctx.createLinearGradient(x, 0, x + w, 0);
      statGrad.addColorStop(0, vehicle.color);
      statGrad.addColorStop(1, vehicle.accentColor);
      ctx.fillStyle = statGrad;
      ctx.shadowBlur = 6;
      ctx.shadowColor = vehicle.color;
      ctx.beginPath();
      ctx.roundRect(x, barY, fillW, barH, 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let seg = 1; seg < 5; seg++) {
        const segX = x + (w / 5) * seg;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(segX, barY);
        ctx.lineTo(segX, barY + barH);
        ctx.stroke();
      }
    });
  }

  _drawVehicleListPanel(x, y, w, h, game, selectedKey) {
    const ctx = this.ctx;
    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();

    ctx.fillStyle = 'rgba(15, 15, 30, 0.7)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.stroke();

    const titleSize = isPortrait ? 14 * uiScale : 16;
    ctx.fillStyle = '#888';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('车型列表', x + 18, y + 30);

    const itemCount = VehicleTypeKeys.length;
    const itemGap = isPortrait ? 8 * uiScale : 10;
    const itemH = isPortrait ? 58 * uiScale : 65;
    const totalItemH = itemCount * itemH + (itemCount - 1) * itemGap;
    const startY = y + 50 + (h - 60 - totalItemH) / 2;

    VehicleTypeKeys.forEach((key, idx) => {
      const vehicle = VehicleTypes[key];
      const iy = startY + idx * (itemH + itemGap);
      const isSelected = key === selectedKey;
      const isCurrent = key === game.selectedVehicle;

      if (isSelected) {
        ctx.fillStyle = 'rgba(0, 245, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(x + 12, iy, w - 24, itemH, 8);
        ctx.fill();

        ctx.strokeStyle = vehicle.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = vehicle.color;
        ctx.beginPath();
        ctx.roundRect(x + 12, iy, w - 24, itemH, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const thumbSize = itemH * 0.6;
      const thumbX = x + 25 + thumbSize / 2;
      const thumbY = iy + itemH / 2;
      const thumbScale = thumbSize / 50;
      this._drawVehiclePreview(thumbX, thumbY, vehicle, thumbScale * 0.8, isSelected);

      const nameX = x + 50 + thumbSize;
      const nameSize = isPortrait ? 14 * uiScale : 16;
      const subSize = isPortrait ? 10 * uiScale : 11;

      ctx.fillStyle = vehicle.color;
      ctx.shadowBlur = isSelected ? 8 : 0;
      ctx.shadowColor = vehicle.color;
      ctx.font = `bold ${nameSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(vehicle.name, nameX, iy + itemH * 0.4);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#777';
      ctx.font = `${subSize}px monospace`;
      ctx.fillText(vehicle.subtitle, nameX, iy + itemH * 0.7);

      if (isCurrent) {
        const badgeW = 44;
        const badgeH = 16;
        ctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
        ctx.beginPath();
        ctx.roundRect(x + w - badgeW - 20, iy + itemH / 2 - badgeH / 2, badgeW, badgeH, 4);
        ctx.fill();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x + w - badgeW - 20, iy + itemH / 2 - badgeH / 2, badgeW, badgeH, 4);
        ctx.stroke();
        ctx.fillStyle = '#00ff66';
        ctx.font = `bold 9px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('当前', x + w - badgeW / 2 - 20, iy + itemH / 2 + 3);
      }

      const rightPadding = isCurrent ? 75 : 20;
      const miniStatsY = iy + itemH * 0.42;
      const miniStatW = w - (50 + thumbSize) - rightPadding;
      const miniStatH = isPortrait ? 3 * uiScale : 4;
      const miniStatKeys = ['speed', 'accel', 'handling', 'nitro'];
      const miniStatSpacing = isPortrait ? 2 * uiScale : 2;

      miniStatKeys.forEach((statKey, si) => {
        const sy = miniStatsY + si * (miniStatH + miniStatSpacing) + 12;
        const value = vehicle.stats[statKey];
        const fillW = miniStatW * (value / 5);

        ctx.fillStyle = 'rgba(40, 40, 70, 0.6)';
        ctx.fillRect(nameX, sy, miniStatW, miniStatH);

        ctx.fillStyle = vehicle.color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(nameX, sy, fillW, miniStatH);
        ctx.globalAlpha = 1;
      });
    });

    const hintSize = isPortrait ? 9 * uiScale : 10;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ 或 点击选择车辆', x + w / 2, y + h - 15);
  }

  _drawActionButtons(x, y, w, game, selectedVehicle, selectedKey) {
    const ctx = this.ctx;
    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();
    const btnH = isPortrait ? 40 * uiScale : 44;
    const btnGap = isPortrait ? 12 * uiScale : 16;
    const btnW = (w - btnGap) / 2;

    const cancelX = x;
    const confirmX = x + btnW + btnGap;

    this._drawVehicleButton(cancelX, y, btnW, btnH, '返回', '#666', '#444', false);
    this._drawVehicleButton(confirmX, y, btnW, btnH, '确认选择', selectedVehicle.color, selectedVehicle.accentColor, true);

    const hintSize = isPortrait ? 10 * uiScale : 11;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('ESC 返回  |  空格/回车 确认', x + w / 2, y + btnH + 18);
  }

  _drawVehicleButton(x, y, w, h, label, color, accentColor, primary) {
    const ctx = this.ctx;
    const time = Date.now() * 0.003;
    const pulse = Math.sin(time) * 0.1 + 0.9;

    const bgColor = primary ? `rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, 0.15)` : 'rgba(40, 40, 60, 0.8)';
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();

    ctx.strokeStyle = primary ? color : '#555';
    ctx.lineWidth = primary ? 2 : 1;
    if (primary) {
      ctx.shadowBlur = 12 * pulse;
      ctx.shadowColor = color;
    }
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const textSize = h * 0.38;
    ctx.fillStyle = primary ? color : '#aaa';
    ctx.shadowBlur = primary ? 8 : 0;
    ctx.shadowColor = primary ? color : 'transparent';
    ctx.font = `bold ${textSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 2);
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic';
  }

  _drawVehiclePreview(x, y, vehicle, scale, isSelected) {
    const ctx = this.ctx;
    const selectedMultiplier = isSelected ? 1.2 : 1.0;
    const s = scale * selectedMultiplier;
    const wheelBase = vehicle.wheelBase * s;
    const halfWidth = vehicle.bikeWidth / 2 * s;

    ctx.save();
    ctx.translate(x, y);

    let previewColor = vehicle.color;
    let previewShadowColor = vehicle.color;

    if (vehicle.paintSpecial === 'rainbow') {
      const hue = (Date.now() * 0.15) % 360;
      previewColor = `hsl(${hue}, 100%, 60%)`;
      previewShadowColor = `hsl(${hue}, 100%, 55%)`;
    }

    if (isSelected) {
      const pulse = Math.sin(Date.now() * 0.004) * 0.3 + 0.7;
      ctx.shadowBlur = 20 * scale;
      ctx.shadowColor = previewColor;
      ctx.strokeStyle = previewColor;
      ctx.lineWidth = 2 * scale;
      ctx.globalAlpha = pulse * 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, wheelBase * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    ctx.shadowBlur = isSelected ? 18 : 8;
    ctx.shadowColor = previewShadowColor;

    ctx.fillStyle = previewColor;
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
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.ellipse(wheelBase * 0.1, 0, halfWidth * 0.5, halfWidth * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawMenu(game) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.95)';
    ctx.fillRect(0, 0, this.width, this.height);

    const titleY = isPortrait ? centerY * 0.5 : centerY - 130;
    const titleSize = isPortrait ? 36 * uiScale : 48;
    const subtitleSize = isPortrait ? 14 * uiScale : 18;

    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00f5ff';
    ctx.fillStyle = '#00f5ff';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('NEON RACER', centerX, titleY);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ff00ff';
    ctx.font = `${subtitleSize}px monospace`;
    ctx.fillText('极速霓虹', centerX, titleY + (isPortrait ? 30 * uiScale : 38));

    const coins = game.career.coins;
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffff00';
    ctx.font = `bold ${subtitleSize}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`💰 ${coins}`, this.width - (isPortrait ? 15 * uiScale : 20), titleY + 5);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';

    const panelW = isPortrait ? Math.min(320 * uiScale, this.width * 0.85) : 400;
    const panelH = isPortrait ? 480 * uiScale : 480;
    const panelX = centerX - panelW / 2;
    const panelY = isPortrait ? titleY + 60 * uiScale : centerY - 100;

    ctx.fillStyle = 'rgba(20, 20, 40, 0.9)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 12 * uiScale);
    ctx.fill();

    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2 * uiScale;
    ctx.shadowBlur = 12 * uiScale;
    ctx.shadowColor = '#00f5ff';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 12 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const itemSpacing = isPortrait ? 42 * uiScale : 42;
    const btnOffset0 = isPortrait ? 45 * uiScale : 50;
    const btnOffset1 = btnOffset0 + itemSpacing;
    const btnOffset2 = btnOffset1 + itemSpacing;
    const btnOffset3 = btnOffset2 + itemSpacing;
    const btnOffset4 = btnOffset3 + itemSpacing;
    const btnOffset5 = btnOffset4 + itemSpacing;
    const btnOffset6 = btnOffset5 + itemSpacing + 6 * uiScale;
    const btnOffset7 = btnOffset6 + itemSpacing;
    const btnOffset8 = btnOffset7 + itemSpacing;
    const btnOffset9 = btnOffset8 + itemSpacing;

    const vehicle = VehicleTypes[game.selectedVehicle];

    this._drawMenuSelector(
      panelX, panelY + btnOffset0, panelW,
      '难度', DifficultySettings[game.difficulty].label, DifficultySettings[game.difficulty].color,
      game.menuCursor === 0, uiScale
    );

    this._drawMenuSelector(
      panelX, panelY + btnOffset1, panelW,
      '圈数', `${game.totalLaps} 圈`, '#ffff00',
      game.menuCursor === 1, uiScale
    );

    this._drawMenuSelector(
      panelX, panelY + btnOffset2, panelW,
      '车辆', vehicle.name, vehicle.color,
      game.menuCursor === 2, uiScale
    );

    const vehiclePreviewScale = isPortrait ? 0.45 * uiScale : 0.55;
    const vehiclePreviewX = panelX + panelW - 35 * uiScale;
    const vehiclePreviewY = panelY + btnOffset2 + 6 * uiScale;
    this._drawVehiclePreview(vehiclePreviewX, vehiclePreviewY, vehicle, vehiclePreviewScale, game.menuCursor === 2);

    this._drawMenuButton(
      panelX, panelY + btnOffset3, panelW,
      '车库改装',
      game.menuCursor === 3, uiScale
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset4, panelW,
      '职业生涯',
      game.menuCursor === 4, uiScale
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset5, panelW,
      '勋章成就',
      game.menuCursor === 5, uiScale
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset6, panelW,
      '操控设置',
      game.menuCursor === 6, uiScale
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset7, panelW,
      '🏁 赛事编辑器',
      game.menuCursor === 7, uiScale,
      '#ff6600'
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset8, panelW,
      '🚓 悬赏追逐',
      game.menuCursor === 8, uiScale,
      '#ff0044'
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset9, panelW,
      '开始比赛',
      game.menuCursor === 9, uiScale,
      '#00ff66'
    );

    this._drawTouchSettingsSummary(game, panelX + 10 * uiScale, panelY + btnOffset9 + 30 * uiScale, panelW - 20 * uiScale, uiScale);

    const hintSize = isPortrait ? 10 * uiScale : 12;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ 选择  ←→ 调整  空格/回车 确认', centerX, panelY + panelH + (isPortrait ? 15 * uiScale : 25));
    ctx.fillText('点击左右箭头区域可调整选项', centerX, panelY + panelH + (isPortrait ? 30 * uiScale : 45));

    const bestRecord = game.getBestLapRecordDetail(game.difficulty);
    if (bestRecord !== null) {
      const recordY = panelY + panelH + (isPortrait ? 50 * uiScale : 70);
      const recordH = bestRecord.date ? (isPortrait ? 40 * uiScale : 50) : (isPortrait ? 28 * uiScale : 32);
      const recordW = isPortrait ? 260 * uiScale : 280;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(centerX - recordW / 2, recordY - 14, recordW, recordH, 8 * uiScale);
      ctx.fill();

      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#00ff66';
      ctx.beginPath();
      ctx.roundRect(centerX - recordW / 2, recordY - 14, recordW, recordH, 8 * uiScale);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const labelSize = isPortrait ? 10 * uiScale : 11;
      const valueSize = isPortrait ? 12 * uiScale : 14;

      ctx.fillStyle = '#888';
      ctx.font = `${labelSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('🏆 历史最佳单圈', centerX - recordW / 2 + 12, recordY + 4);

      ctx.fillStyle = '#00ff66';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#00ff66';
      ctx.font = `bold ${valueSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(Utils.formatTime(bestRecord.time), centerX + recordW / 2 - 12, recordY + 4);
      ctx.shadowBlur = 0;

      if (bestRecord.date) {
        const date = new Date(bestRecord.date);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        ctx.fillStyle = '#666';
        ctx.font = `${isPortrait ? 9 * uiScale : 10}px monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(dateStr, centerX - recordW / 2 + 12, recordY + (isPortrait ? 20 * uiScale : 24));

        if (bestRecord.totalLaps) {
          ctx.textAlign = 'right';
          ctx.fillText(`${bestRecord.totalLaps}圈·第${bestRecord.lapIndex}圈`, centerX + recordW / 2 - 12, recordY + (isPortrait ? 20 * uiScale : 24));
        }
      }
    }

    ctx.restore();
  }

  _drawTouchSettingsSummary(game, x, y, w, scale = 1) {
    const ctx = this.ctx;
    if (!game.touchManager) return;

    const settings = game.touchManager.getSettingsSummary();
    const summaryText = `布局:${settings.layoutLabel} | 震动:${settings.vibrationLabel} | 防误触:${settings.antiMistouchLabel}`;

    ctx.fillStyle = '#555';
    ctx.font = `${10 * scale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(summaryText, x + w / 2, y);
  }

  _drawMenuSelector(x, y, w, label, value, valueColor, selected, scale = 1) {
    const ctx = this.ctx;
    const padX = 10 * scale;
    const itemH = 50 * scale;
    const labelSize = 16 * scale;
    const valueSize = 22 * scale;
    const arrowSize = 20 * scale;
    const labelPadX = 30 * scale;
    const arrowPadX = 30 * scale;

    if (selected) {
      ctx.fillStyle = 'rgba(0, 245, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(x + padX, y - 18 * scale, w - 2 * padX, itemH, 8 * scale);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 245, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x + padX, y - 18 * scale, w - 2 * padX, itemH, 8 * scale);
      ctx.stroke();
    }

    ctx.fillStyle = '#888';
    ctx.font = `${labelSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(label, x + labelPadX, y + 8 * scale);

    const arrowXLeft = x + w * 0.28;
    ctx.fillStyle = '#666';
    ctx.font = `${arrowSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('◀', arrowXLeft, y + 10 * scale);

    ctx.shadowBlur = selected ? 12 * scale : 0;
    ctx.shadowColor = valueColor;
    ctx.fillStyle = valueColor;
    ctx.font = `bold ${valueSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(value, x + w / 2, y + 10 * scale);
    ctx.shadowBlur = 0;

    const arrowXRight = x + w * 0.72;
    ctx.fillStyle = '#666';
    ctx.font = `${arrowSize}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText('▶', arrowXRight, y + 10 * scale);
  }

  _drawMenuButton(x, y, w, label, selected, scale = 1, customColor = null) {
    const ctx = this.ctx;
    const btnPadding = 60 * scale;
    const btnX = x + btnPadding;
    const btnW = w - 2 * btnPadding;
    const btnH = 40 * scale;
    const textSize = 18 * scale;

    const accentColor = customColor || '#00f5ff';
    const bgColor = selected ? `${accentColor}26` : 'rgba(40, 40, 60, 0.8)';
    const borderColor = selected ? accentColor : '#444';
    const textColor = selected ? accentColor : '#888';

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(btnX, y - 5 * scale, btnW, btnH, 8 * scale);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = selected ? 2 : 1;
    if (selected) {
      ctx.shadowBlur = 12 * scale;
      ctx.shadowColor = borderColor;
    }
    ctx.beginPath();
    ctx.roundRect(btnX, y - 5 * scale, btnW, btnH, 8 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = textColor;
    ctx.font = `bold ${textSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(label, btnX + btnW / 2, y + 20 * scale);
  }

  drawCountdown(count) {
    const ctx = this.ctx;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.width, this.height);

    const text = count > 0 ? count.toString() : 'GO!';
    const color = count > 0 ? '#ffff00' : '#00ff00';
    const fontSize = isPortrait ? 80 * uiScale : 120;

    ctx.shadowBlur = 40 * uiScale;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, this.width / 2, this.height / 2);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawPauseOverlay(game) {
    const ctx = this.ctx;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);

    const panelW = isPortrait ? Math.min(300 * uiScale, this.width * 0.8) : 360;
    const panelH = isPortrait ? (200 + game.pauseMenuItemCount * 50) * uiScale : 220 + game.pauseMenuItemCount * 55;
    const panelX = (this.width - panelW) / 2;
    const panelY = (this.height - panelH) / 2;

    ctx.fillStyle = 'rgba(20, 20, 40, 0.95)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 14 * uiScale);
    ctx.fill();

    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2.5 * uiScale;
    ctx.shadowBlur = 20 * uiScale;
    ctx.shadowColor = '#00f5ff';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 14 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const titleSize = isPortrait ? 28 * uiScale : 32;
    ctx.fillStyle = '#00f5ff';
    ctx.shadowBlur = 15 * uiScale;
    ctx.shadowColor = '#00f5ff';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('⏸ 游戏暂停', this.width / 2, panelY + 50 * uiScale);
    ctx.shadowBlur = 0;

    const itemSpacing = isPortrait ? 48 * uiScale : 52;
    const itemStartY = panelY + (isPortrait ? 100 : 110) * uiScale;
    const itemH = isPortrait ? 40 * uiScale : 44;

    const menuItems = [
      { label: '继续游戏', desc: '返回比赛' },
      { label: '返回主菜单', desc: '退出当前比赛' }
    ];

    menuItems.forEach((item, i) => {
      const itemY = itemStartY + i * itemSpacing;
      const isSelected = game.pauseMenuCursor === i;

      if (isSelected) {
        const bgGradient = ctx.createLinearGradient(panelX + 20, itemY - itemH / 2, panelX + panelW - 20, itemY - itemH / 2);
        bgGradient.addColorStop(0, 'rgba(0, 245, 255, 0.1)');
        bgGradient.addColorStop(0.5, 'rgba(0, 245, 255, 0.25)');
        bgGradient.addColorStop(1, 'rgba(0, 245, 255, 0.1)');
        ctx.fillStyle = bgGradient;
        ctx.beginPath();
        ctx.roundRect(panelX + 20 * uiScale, itemY - itemH / 2, panelW - 40 * uiScale, itemH, 8 * uiScale);
        ctx.fill();

        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2 * uiScale;
        ctx.shadowBlur = 12 * uiScale;
        ctx.shadowColor = '#00f5ff';
        ctx.beginPath();
        ctx.roundRect(panelX + 20 * uiScale, itemY - itemH / 2, panelW - 40 * uiScale, itemH, 8 * uiScale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const labelSize = isPortrait ? 16 * uiScale : 18;
      ctx.fillStyle = isSelected ? '#ffffff' : '#aaa';
      ctx.shadowBlur = isSelected ? 8 * uiScale : 0;
      ctx.shadowColor = isSelected ? '#00f5ff' : 'transparent';
      ctx.font = `bold ${labelSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(item.label, this.width / 2, itemY);
      ctx.shadowBlur = 0;

      if (isSelected) {
        const arrowSize = isPortrait ? 14 * uiScale : 16;
        ctx.fillStyle = '#00f5ff';
        ctx.font = `${arrowSize}px monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('▶', panelX + 30 * uiScale, itemY + 2);
        ctx.textAlign = 'right';
        ctx.fillText('◀', panelX + panelW - 30 * uiScale, itemY + 2);
      }
    });

    const hintSize = isPortrait ? 10 * uiScale : 12;
    ctx.fillStyle = '#666';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('按 ESC / P 继续  |  上下键选择  |  空格确认', this.width / 2, panelY + panelH - 20 * uiScale);

    ctx.restore();
  }

  drawFinished(game) {
    const ctx = this.ctx;
    const rankings = game.getRankings();
    const playerRank = rankings.findIndex(r => r.bike.isPlayer) + 1;
    const cfg = DifficultySettings[game.difficulty];
    const player = game.player;
    const hasBestLap = player.bestLapTime < Infinity;
    const bikes = game.getAllBikes();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.9)';
    ctx.fillRect(0, 0, this.width, this.height);

    const panelWidth = 380;
    const lapListHeight = player.lapTimes.length > 0 ? player.lapTimes.length * 24 + 55 : 0;
    const recordBannerHeight = game.isHistoricalRecord ? 40 : 0;
    const obstacleStatsHeight = 170;
    const achievementHeight = (game.achievements._newlyUnlocked && game.achievements._newlyUnlocked.length > 0)
      ? 55 + game.achievements._newlyUnlocked.length * 28
      : 0;
    const rewardHeight = game.quickRaceReward && game.quickRaceReward.coinsEarned > 0 ? 70 : 0;
    const configHeight = 55;
    const panelHeight = 525 + lapListHeight + recordBannerHeight + obstacleStatsHeight + achievementHeight + rewardHeight + configHeight;
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

    ctx.fillStyle = cfg.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = cfg.color;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`难度: ${cfg.label}`, this.width / 2, panelY + 118);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffff00';
    ctx.font = '16px monospace';
    ctx.fillText(`圈数: ${game.totalLaps} 圈`, this.width / 2, panelY + 142);

    const vehicle = VehicleTypes[game.selectedVehicle];
    ctx.fillStyle = vehicle.color;
    ctx.shadowBlur = 4;
    ctx.shadowColor = vehicle.color;
    ctx.font = '16px monospace';
    ctx.fillText(`车辆: ${vehicle.name}`, this.width / 2, panelY + 166);
    ctx.shadowBlur = 0;

    let infoY = panelY + 194;

    if (game.isHistoricalRecord) {
      const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
      const bannerY = infoY;
      const bannerH = 50;

      const gradient = ctx.createLinearGradient(panelX, bannerY, panelX + panelWidth, bannerY);
      gradient.addColorStop(0, 'rgba(255, 255, 0, 0)');
      gradient.addColorStop(0.2, `rgba(255, 255, 0, ${0.15 * pulse})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 0, ${0.35 * pulse})`);
      gradient.addColorStop(0.8, `rgba(255, 255, 0, ${0.15 * pulse})`);
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(panelX, bannerY, panelWidth, bannerH);

      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ffff00';
      ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 历史最佳单圈新纪录!', this.width / 2, bannerY + 33);
      ctx.shadowBlur = 0;

      infoY += bannerH + 5;
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`总用时: ${Utils.formatTime(game.player.raceTime)}`, this.width / 2, infoY + 15);
    infoY += 35;

    if (hasBestLap) {
      ctx.fillStyle = '#00ff66';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ff66';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`最佳单圈: ${Utils.formatTime(player.bestLapTime)}`, this.width / 2, infoY + 10);
      ctx.shadowBlur = 0;
      infoY += 35;
    }

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, infoY);
    ctx.lineTo(panelX + panelWidth - 30, infoY);
    ctx.stroke();
    infoY += 20;

    if (player.lapTimes.length > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('各圈用时', panelX + 30, infoY);
      infoY += 22;

      const avgLapTime = player.lapTimes.reduce((a, b) => a + b, 0) / player.lapTimes.length;

      player.lapTimes.forEach((lapTime, i) => {
        const isBest = lapTime === player.bestLapTime;
        const diff = lapTime - player.bestLapTime;
        const lapY = infoY + i * 24;

        ctx.fillStyle = isBest ? '#00ff66' : '#aaa';
        ctx.font = isBest ? 'bold 13px monospace' : '13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`LAP ${i + 1}`, panelX + 45, lapY);

        ctx.fillStyle = isBest ? '#00ff66' : '#ddd';
        ctx.textAlign = 'center';
        ctx.fillText(Utils.formatTime(lapTime), panelX + panelWidth / 2, lapY);

        if (isBest) {
          ctx.fillStyle = '#ffff00';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'right';
          ctx.fillText('🏆 BEST', panelX + panelWidth - 30, lapY);
        } else if (diff < 5000) {
          ctx.fillStyle = '#ff9900';
          ctx.font = '11px monospace';
          ctx.textAlign = 'right';
          ctx.fillText('+' + Utils.formatTime(diff), panelX + panelWidth - 30, lapY);
        } else {
          ctx.fillStyle = '#666';
          ctx.font = '11px monospace';
          ctx.textAlign = 'right';
          ctx.fillText('+' + Utils.formatTime(diff), panelX + panelWidth - 30, lapY);
        }
      });

      infoY += player.lapTimes.length * 24 + 10;

      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelX + 45, infoY);
      ctx.lineTo(panelX + panelWidth - 45, infoY);
      ctx.stroke();
      infoY += 8;

      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('平均圈速', panelX + 45, infoY + 12);

      ctx.fillStyle = '#00f5ff';
      ctx.textAlign = 'right';
      ctx.fillText(Utils.formatTime(avgLapTime), panelX + panelWidth - 30, infoY + 12);

      infoY += 25;
    }

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, infoY);
    ctx.lineTo(panelX + panelWidth - 30, infoY);
    ctx.stroke();
    infoY += 25;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('最终排名', panelX + 30, infoY);
    infoY += 25;

    rankings.forEach((r, i) => {
      const bike = r.bike;
      const y = infoY + i * 32;

      ctx.fillStyle = bike.isPlayer ? '#ffff00' : '#888';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
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

    infoY += rankings.length * 32 + 15;

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, infoY);
    ctx.lineTo(panelX + panelWidth - 30, infoY);
    ctx.stroke();
    infoY += 20;

    if (game.quickRaceReward && game.quickRaceReward.coinsEarned > 0) {
      const coinsPulse = Math.sin(Date.now() * 0.006) * 0.2 + 1;
      ctx.save();
      ctx.translate(this.width / 2, infoY + 20);
      ctx.scale(coinsPulse, coinsPulse);

      const coinGrad = ctx.createLinearGradient(-120, -15, 120, 15);
      coinGrad.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
      coinGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.25)');
      coinGrad.addColorStop(1, 'rgba(255, 215, 0, 0.1)');
      ctx.fillStyle = coinGrad;
      ctx.beginPath();
      ctx.roundRect(-130, -22, 260, 44, 8);
      ctx.fill();

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffd700';
      ctx.beginPath();
      ctx.roundRect(-130, -22, 260, 44, 8);
      ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffd700';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`🏆 比赛奖励 +${game.quickRaceReward.coinsEarned} 💰`, 0, 5);
      ctx.shadowBlur = 0;
      ctx.restore();
      infoY += 70;

      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelX + 30, infoY);
      ctx.lineTo(panelX + panelWidth - 30, infoY);
      ctx.stroke();
      infoY += 20;
    }

    const config = game.garage.getCurrentConfig();
    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`改装配置: ${config.engineName} · ${config.tireName} · ${config.paintName} · ${config.driftName}`, this.width / 2, infoY + 15);
    infoY += 35;

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, infoY);
    ctx.lineTo(panelX + panelWidth - 30, infoY);
    ctx.stroke();
    infoY += 20;

    const obsStats = game.collision.getObstacleStatistics();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('障碍物统计', panelX + 30, infoY);
    infoY += 25;

    ctx.fillStyle = '#ff6600';
    ctx.font = '13px monospace';
    ctx.fillText(`你破坏的障碍物:`, panelX + 45, infoY);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`${player.obstaclesDestroyed || 0} 个`, panelX + panelWidth - 30, infoY);
    infoY += 22;
    ctx.textAlign = 'left';

    ctx.fillStyle = '#ff0044';
    ctx.fillText(`你碰撞障碍物:`, panelX + 45, infoY);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff9900';
    ctx.fillText(`${player.obstacleCollisions || 0} 次`, panelX + panelWidth - 30, infoY);
    infoY += 22;
    ctx.textAlign = 'left';

    ctx.fillStyle = '#888888';
    ctx.fillText(`全场总破坏数:`, panelX + 45, infoY);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00f5ff';
    ctx.fillText(`${obsStats.totalDestroyed} / ${obsStats.totalObstacles}`, panelX + panelWidth - 30, infoY);
    infoY += 22;
    ctx.textAlign = 'left';

    const destroyRate = obsStats.totalObstacles > 0
      ? Math.round((obsStats.totalDestroyed / obsStats.totalObstacles) * 100)
      : 0;
    ctx.fillStyle = '#888888';
    ctx.fillText(`破坏率:`, panelX + 45, infoY);
    ctx.textAlign = 'right';
    ctx.fillStyle = destroyRate >= 50 ? '#00ff66' : '#ffff00';
    ctx.fillText(`${destroyRate}%`, panelX + panelWidth - 30, infoY);
    infoY += 25;
    ctx.textAlign = 'left';

    let aiTotalDestroyed = 0;
    bikes.forEach(b => {
      if (!b.isPlayer) aiTotalDestroyed += (b.obstaclesDestroyed || 0);
    });
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.fillText(`AI 总破坏数:`, panelX + 45, infoY);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff00ff';
    ctx.fillText(`${aiTotalDestroyed} 个`, panelX + panelWidth - 30, infoY);
    ctx.textAlign = 'left';

    const newlyUnlocked = game.achievements.getNewlyUnlocked();
    if (newlyUnlocked.length > 0) {
      infoY += 35;
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelX + 30, infoY);
      ctx.lineTo(panelX + panelWidth - 30, infoY);
      ctx.stroke();
      infoY += 20;

      const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
      const bannerY = infoY;
      const bannerH = 30 + newlyUnlocked.length * 28;

      const gradient = ctx.createLinearGradient(panelX, bannerY, panelX + panelWidth, bannerY);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
      gradient.addColorStop(0.2, `rgba(0, 255, 255, ${0.1 * pulse})`);
      gradient.addColorStop(0.5, `rgba(0, 255, 255, ${0.25 * pulse})`);
      gradient.addColorStop(0.8, `rgba(0, 255, 255, ${0.1 * pulse})`);
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(panelX, bannerY, panelWidth, bannerH);

      ctx.fillStyle = '#00ffff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ffff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🎖️ 勋章解锁!', this.width / 2, infoY + 16);
      ctx.shadowBlur = 0;
      infoY += 28;

      newlyUnlocked.forEach(item => {
        ctx.fillStyle = item.tier.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = item.tier.color;
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.tier.icon} ${item.tier.name}`, panelX + 45, infoY);
        ctx.fillStyle = '#888';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`奖励: ${item.tier.reward}`, panelX + panelWidth - 30, infoY);
        ctx.shadowBlur = 0;
        infoY += 28;
      });
      ctx.textAlign = 'left';
    }

    ctx.fillStyle = '#00f5ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f5ff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('按 空格键 返回菜单', this.width / 2, panelY + panelHeight - 25);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawWantedResult(game) {
    const ctx = this.ctx;
    const result = game._wantedResultData;
    if (!result) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.92)';
    ctx.fillRect(0, 0, this.width, this.height);

    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();
    const centerX = this.width / 2;

    const panelWidth = isPortrait ? 320 * uiScale : 380;
    const panelHeight = isPortrait ? 480 * uiScale : 520;
    const panelX = (this.width - panelWidth) / 2;
    const panelY = (this.height - panelHeight) / 2;

    ctx.fillStyle = 'rgba(20, 20, 40, 0.95)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 15);
    ctx.fill();

    const accentColor = result.escaped ? '#00ff66' : '#ff0044';
    const titleText = result.escaped ? 'ESCAPED!' : 'BUSTED!';

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = accentColor;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 15);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const titleSize = isPortrait ? 36 * uiScale : 42;
    ctx.fillStyle = accentColor;
    ctx.shadowBlur = 20;
    ctx.shadowColor = accentColor;
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(titleText, centerX, panelY + 60 * uiScale);
    ctx.shadowBlur = 0;

    const starText = '★'.repeat(result.wantedStars) + '☆'.repeat(5 - result.wantedStars);
    const starSize = isPortrait ? 24 * uiScale : 28;
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0044';
    ctx.font = `${starSize}px monospace`;
    ctx.fillText(starText, centerX, panelY + 100 * uiScale);
    ctx.shadowBlur = 0;

    let infoY = panelY + 130 * uiScale;
    const labelSize = isPortrait ? 13 * uiScale : 14;
    const valueSize = isPortrait ? 16 * uiScale : 18;

    const stats = [
      { label: '生存时间', value: Utils.formatTime(result.survivalTime * 1000), color: '#00f5ff' },
      { label: '最高通缉星级', value: `${result.wantedStars} 星`, color: '#ffff00' },
      { label: '警车数量', value: `${result.maxPoliceCount} 辆`, color: '#ff0044' },
      { label: '惊险躲避', value: `${result.nearMisses} 次`, color: '#ff6600' },
      { label: '碰撞次数', value: `${result.collisions} 次`, color: '#ff9900' }
    ];

    stats.forEach(stat => {
      ctx.fillStyle = '#888';
      ctx.font = `${labelSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(stat.label, panelX + 30 * uiScale, infoY);

      ctx.fillStyle = stat.color;
      ctx.shadowBlur = 5;
      ctx.shadowColor = stat.color;
      ctx.font = `bold ${valueSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(stat.value, panelX + panelWidth - 30 * uiScale, infoY);
      ctx.shadowBlur = 0;

      infoY += 32 * uiScale;
    });

    const dividerY = infoY + 5 * uiScale;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 25 * uiScale, dividerY);
    ctx.lineTo(panelX + panelWidth - 25 * uiScale, dividerY);
    ctx.stroke();
    infoY = dividerY + 20 * uiScale;

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${labelSize + 2}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('奖励明细', panelX + 30 * uiScale, infoY);
    infoY += 28 * uiScale;

    const rewardDetails = [
      { label: '基础奖励', value: result.rewardBreakdown.base, color: '#00ff66' },
      { label: '生存时间奖励', value: result.rewardBreakdown.survival, color: '#00f5ff' },
      { label: '惊险躲避奖励', value: result.rewardBreakdown.nearMiss, color: '#ff6600' },
      { label: '碰撞惩罚', value: -result.rewardBreakdown.collision, color: '#ff0044' }
    ];

    rewardDetails.forEach(detail => {
      ctx.fillStyle = '#888';
      ctx.font = `${labelSize - 1}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(detail.label, panelX + 40 * uiScale, infoY);

      const sign = detail.value >= 0 ? '+' : '';
      ctx.fillStyle = detail.color;
      ctx.shadowBlur = 4;
      ctx.shadowColor = detail.color;
      ctx.font = `bold ${labelSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`${sign}${detail.value}`, panelX + panelWidth - 30 * uiScale, infoY);
      ctx.shadowBlur = 0;

      infoY += 24 * uiScale;
    });

    infoY += 10 * uiScale;
    const totalColor = result.totalReward >= 0 ? '#ffd700' : '#ff0044';
    ctx.fillStyle = totalColor;
    ctx.shadowBlur = 12;
    ctx.shadowColor = totalColor;
    ctx.font = `bold ${valueSize + 4}px monospace`;
    ctx.textAlign = 'center';
    const totalText = result.totalReward >= 0
      ? `总奖励: ${result.totalReward} 💰`
      : `总奖励: ${result.totalReward}`;
    ctx.fillText(totalText, centerX, infoY);
    ctx.shadowBlur = 0;

    const hintSize = isPortrait ? 12 * uiScale : 13;
    ctx.fillStyle = '#00f5ff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00f5ff';
    ctx.font = `bold ${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('按 空格键 返回菜单', centerX, panelY + panelHeight - 25 * uiScale);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawGarage(game) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();
    const garage = game.garage;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.97)';
    ctx.fillRect(0, 0, this.width, this.height);

    const bgGrad = ctx.createRadialGradient(
      this.width * 0.3, this.height * 0.4, 0,
      this.width * 0.3, this.height * 0.4, this.width * 0.6
    );
    bgGrad.addColorStop(0, 'rgba(255, 0, 255, 0.05)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    const titleY = isPortrait ? 28 * uiScale : 35;
    const titleSize = isPortrait ? 24 * uiScale : 30;
    const subtitleSize = isPortrait ? 11 * uiScale : 13;

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('改装车库', centerX, titleY);
    ctx.shadowBlur = 0;

    const coins = game.career.coins;
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffff00';
    ctx.font = `bold ${subtitleSize}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`💰 ${coins}`, this.width - (isPortrait ? 15 * uiScale : 20), titleY + 5);
    ctx.shadowBlur = 0;

    const categoryY = isPortrait ? 55 * uiScale : 65;
    const categoryCount = GarageCategoryKeys.length;
    const categoryTabW = isPortrait ? (this.width * 0.9) / categoryCount : 120;
    const categoryTabH = isPortrait ? 32 * uiScale : 38;
    const categoryTotalW = categoryTabW * categoryCount;
    const categoryStartX = centerX - categoryTotalW / 2;

    const categoryNames = {
      engine: '引擎',
      tire: '轮胎',
      paint: '喷漆',
      drift: '漂移'
    };

    const categoryColors = {
      engine: '#ff6600',
      tire: '#00ff66',
      paint: '#ff00ff',
      drift: '#00f5ff'
    };

    GarageCategoryKeys.forEach((cat, idx) => {
      const tabX = categoryStartX + idx * categoryTabW;
      const isSelected = idx === game.garageCategoryCursor;
      const color = categoryColors[cat];

      ctx.fillStyle = isSelected ? 'rgba(0, 0, 0, 0.6)' : 'rgba(30, 30, 50, 0.5)';
      ctx.beginPath();
      ctx.roundRect(tabX + 2, categoryY, categoryTabW - 4, categoryTabH, 6 * uiScale);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.roundRect(tabX + 2, categoryY, categoryTabW - 4, categoryTabH, 6 * uiScale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = isSelected ? color : '#888';
      ctx.shadowBlur = isSelected ? 6 : 0;
      ctx.shadowColor = color;
      ctx.font = `bold ${isPortrait ? 12 * uiScale : 14}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(categoryNames[cat], tabX + categoryTabW / 2, categoryY + categoryTabH * 0.65);
      ctx.shadowBlur = 0;
    });

    if (isPortrait) {
      this._drawGaragePortrait(game, garage, uiScale, centerX, categoryY + categoryTabH + 10 * uiScale);
    } else {
      this._drawGarageLandscape(game, garage, uiScale, centerX, categoryY + categoryTabH + 15);
    }

    const backBtnW = isPortrait ? 80 * uiScale : 90;
    const backBtnH = isPortrait ? 32 * uiScale : 36;
    const backBtnX = isPortrait ? 15 * uiScale : 20;
    const backBtnY = isPortrait ? 20 * uiScale : 20;

    ctx.fillStyle = 'rgba(40, 40, 60, 0.8)';
    ctx.beginPath();
    ctx.roundRect(backBtnX, backBtnY, backBtnW, backBtnH, 6 * uiScale);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(backBtnX, backBtnY, backBtnW, backBtnH, 6 * uiScale);
    ctx.stroke();
    ctx.fillStyle = '#aaa';
    ctx.font = `bold ${isPortrait ? 12 * uiScale : 13}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('← 返回', backBtnX + backBtnW / 2, backBtnY + backBtnH * 0.68);

    const hintSize = isPortrait ? 10 * uiScale : 11;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('←→ 切换分类  ↑↓ 选择部件  空格 购买/装备  ESC 返回', centerX, this.height - (isPortrait ? 10 * uiScale : 15));

    ctx.restore();
  }

  _drawGarageLandscape(game, garage, uiScale, centerX, contentY) {
    const ctx = this.ctx;
    const category = GarageCategoryKeys[game.garageCategoryCursor];
    const itemCount = garage.getCategoryItemCount(category);
    const selectedVehicle = VehicleTypes[game.selectedVehicle];
    const perfStats = garage.calculatePerformanceStats(game.selectedVehicle);

    const leftPanelX = 40;
    const leftPanelW = 340;
    const leftPanelH = this.height - contentY - 50;

    const rightPanelX = leftPanelX + leftPanelW + 20;
    const rightPanelW = this.width - rightPanelX - 40;
    const rightPanelH = this.height - contentY - 50;
    const previewH = rightPanelH - 130;

    this._drawGarageItemList(leftPanelX, contentY, leftPanelW, leftPanelH, game, garage, category, false);
    this._drawGaragePreview(rightPanelX, contentY, rightPanelW, previewH, game, garage, selectedVehicle, perfStats, false);
    this._drawGarageRacePerformance(rightPanelX, contentY + previewH + 10, rightPanelW, 115, garage, uiScale, false);
  }

  _drawGaragePortrait(game, garage, uiScale, centerX, contentY) {
    const ctx = this.ctx;
    const category = GarageCategoryKeys[game.garageCategoryCursor];
    const selectedVehicle = VehicleTypes[game.selectedVehicle];
    const perfStats = garage.calculatePerformanceStats(game.selectedVehicle);

    const panelW = Math.min(360 * uiScale, this.width * 0.92);
    const panelX = centerX - panelW / 2;

    const previewH = 220 * uiScale;
    const raceH = 90 * uiScale;
    const listH = this.height - contentY - previewH - raceH - 30 * uiScale;

    this._drawGaragePreview(panelX, contentY, panelW, previewH, game, garage, selectedVehicle, perfStats, true);
    this._drawGarageItemList(panelX, contentY + previewH + 6 * uiScale, panelW, listH, game, garage, category, true);
    this._drawGarageRacePerformance(panelX, contentY + previewH + listH + 12 * uiScale, panelW, raceH, garage, uiScale, true);
  }

  _drawGaragePreview(x, y, w, h, game, garage, vehicle, perfStats, isPortrait) {
    const ctx = this.ctx;
    const uiScale = this._getUIScale();
    const category = GarageCategoryKeys[game.garageCategoryCursor];
    const currentItem = garage.getItemByIndex(category, game.garageItemCursor);
    const isUnlocked = garage.isItemUnlocked(category, game.garageItemCursor);
    const canBuy = garage.canBuyItem(category, game.garageItemCursor);
    const isSelected = game.garageItemCursor === garage.getSelectedIndex(category);
    const needsComparison = !isSelected && category !== 'paint';

    const accentColor = category === 'engine' ? '#ff6600' :
                       category === 'tire' ? '#00ff66' :
                       category === 'paint' ? '#ff00ff' : '#00f5ff';

    ctx.fillStyle = 'rgba(15, 15, 30, 0.8)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10 * uiScale);
    ctx.fill();

    ctx.strokeStyle = accentColor + '40';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10 * uiScale);
    ctx.stroke();

    if (isPortrait) {
      const previewSize = Math.min(w * 0.28, h * 0.3);
      const previewX = x + w * 0.18;
      const previewY = y + h * 0.18;
      const scale = previewSize / 50;

      const previewVehicle = { ...vehicle };
      if (category === 'paint' && currentItem) {
        previewVehicle.color = currentItem.color;
        previewVehicle.accentColor = currentItem.accentColor;
        previewVehicle.paintSpecial = currentItem.special || null;
      } else {
        const currentPaint = garage.getCurrentPaint();
        previewVehicle.color = currentPaint.color;
        previewVehicle.accentColor = currentPaint.accentColor;
        previewVehicle.paintSpecial = currentPaint.special || null;
      }

      this._drawVehiclePreview(previewX, previewY, previewVehicle, scale, true);

      const nameSize = 15 * uiScale;
      const nameX = x + w * 0.5;
      const nameY = y + h * 0.18;
      ctx.fillStyle = accentColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = accentColor;
      ctx.font = `bold ${nameSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(currentItem.name, nameX, nameY);
      ctx.shadowBlur = 0;

      const descSize = 9 * uiScale;
      ctx.fillStyle = '#888';
      ctx.font = `${descSize}px monospace`;
      ctx.fillText(currentItem.description || '', nameX, nameY + 16 * uiScale);

      if (currentItem.cost > 0 && !isUnlocked) {
        ctx.fillStyle = canBuy ? '#ffff00' : '#ff4444';
        ctx.font = `bold ${descSize}px monospace`;
        ctx.fillText(`💰 ${currentItem.cost}`, nameX, nameY + 30 * uiScale);
      }

      const statsY = y + h * 0.32;
      const statsH = h * 0.22;

      if (needsComparison) {
        const previewStats = garage.calculatePreviewStats(game.selectedVehicle, category, game.garageItemCursor);
        if (previewStats) {
          this._drawGarageStatsComparison(x + 10, statsY, w - 20, statsH, perfStats, previewStats, accentColor, uiScale, true);
        }
      } else {
        this._drawGarageStatsBar(x + 10, statsY, w - 20, statsH, perfStats, accentColor, uiScale, true);
      }

      const detailY = statsY + statsH + 6 * uiScale;
      const detailH = h * 0.25;
      this._drawGarageCategoryDetails(x + 10, detailY, w - 20, detailH, category, game.garageItemCursor, garage, accentColor, uiScale, true);

      this._drawGarageActionButton(x + w / 2 - 80 * uiScale, y + h - 38 * uiScale, 160 * uiScale, 30 * uiScale, game, garage, category, currentItem, isUnlocked, canBuy, isSelected, accentColor, uiScale);
    } else {
      const previewSize = Math.min(w * 0.2, h * 0.25);
      const previewX = x + w * 0.15;
      const previewY = y + h * 0.15;
      const scale = previewSize / 50;

      const previewVehicle = { ...vehicle };
      if (category === 'paint' && currentItem) {
        previewVehicle.color = currentItem.color;
        previewVehicle.accentColor = currentItem.accentColor;
        previewVehicle.paintSpecial = currentItem.special || null;
      } else {
        const currentPaint = garage.getCurrentPaint();
        previewVehicle.color = currentPaint.color;
        previewVehicle.accentColor = currentPaint.accentColor;
        previewVehicle.paintSpecial = currentPaint.special || null;
      }

      this._drawVehiclePreview(previewX, previewY, previewVehicle, scale, true);

      const nameSize = 20;
      const nameX = x + w * 0.35;
      const nameY = y + 38;
      ctx.fillStyle = accentColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = accentColor;
      ctx.font = `bold ${nameSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(currentItem.name, nameX, nameY);
      ctx.shadowBlur = 0;

      const descSize = 12;
      ctx.fillStyle = '#888';
      ctx.font = `${descSize}px monospace`;
      ctx.fillText(currentItem.description || '', nameX, nameY + 22);

      if (currentItem.cost > 0 && !isUnlocked) {
        ctx.fillStyle = canBuy ? '#ffff00' : '#ff4444';
        ctx.font = `bold ${descSize}px monospace`;
        ctx.fillText(`💰 ${currentItem.cost}`, nameX, nameY + 42);
      }

      if (isSelected && isUnlocked) {
        ctx.fillStyle = '#00ff66';
        ctx.font = `bold ${descSize - 1}px monospace`;
        ctx.fillText('✓ 已装备', nameX + 80, nameY + 42);
      }

      const statsY = y + h * 0.3;
      const statsH = h * 0.2;

      if (needsComparison) {
        const previewStats = garage.calculatePreviewStats(game.selectedVehicle, category, game.garageItemCursor);
        if (previewStats) {
          this._drawGarageStatsComparison(x + 20, statsY, w - 40, statsH, perfStats, previewStats, accentColor, uiScale, false);
        }
      } else {
        this._drawGarageStatsBar(x + 20, statsY, w - 40, statsH, perfStats, accentColor, uiScale, false);
      }

      const detailY = statsY + statsH + 8;
      const detailH = h * 0.25;
      this._drawGarageCategoryDetails(x + 20, detailY, w - 40, detailH, category, game.garageItemCursor, garage, accentColor, uiScale, false);

      this._drawGarageActionButton(x + w / 2 - 100, y + h - 50, 200, 40, game, garage, category, currentItem, isUnlocked, canBuy, isSelected, accentColor, 1);
    }
  }

  _drawGarageStatsBar(x, y, w, h, stats, accentColor, uiScale, isPortrait) {
    const ctx = this.ctx;
    const statLabels = ['最高速度', '加速能力', '转向操控', '漂移性能', '氮气容量'];
    const statKeys = ['speedRating', 'accelRating', 'handlingRating', 'driftRating', 'nitroRating'];
    const statValues = [
      `${Math.round(stats.maxSpeed * 3.6 / 5)} km/h`,
      `${stats.acceleration.toFixed(0)}`,
      `${stats.steerSpeed.toFixed(2)}`,
      `${(stats.driftAngle * 100).toFixed(0)}°`,
      `${stats.nitroCapacity.toFixed(0)}`
    ];

    const count = statKeys.length;
    const barH = isPortrait ? 8 * uiScale : 10;
    const spacing = (h - 50) / count;
    const labelSize = isPortrait ? 9 * uiScale : 11;
    const valueSize = isPortrait ? 9 * uiScale : 11;

    statKeys.forEach((key, i) => {
      const sy = y + i * spacing + spacing * 0.3;
      const value = stats[key];
      const barY = sy + labelSize + 4;

      ctx.fillStyle = '#999';
      ctx.font = `${labelSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(statLabels[i], x, sy);

      ctx.fillStyle = accentColor;
      ctx.font = `bold ${valueSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(statValues[i], x + w, sy);

      ctx.fillStyle = 'rgba(30, 30, 60, 0.8)';
      ctx.beginPath();
      ctx.roundRect(x, barY, w, barH, 3 * uiScale);
      ctx.fill();

      const fillW = w * (value / 5);
      const statGrad = ctx.createLinearGradient(x, 0, x + w, 0);
      statGrad.addColorStop(0, accentColor);
      statGrad.addColorStop(1, accentColor + '80');
      ctx.fillStyle = statGrad;
      ctx.shadowBlur = 4;
      ctx.shadowColor = accentColor;
      ctx.beginPath();
      ctx.roundRect(x, barY, fillW, barH, 3 * uiScale);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    const tireY = y + count * spacing + 20;
    const indicatorW = (w - 8) / 2;
    const gripRatio = Math.min(1, (stats.tireGrip - 0.7) / 0.75);
    const penaltyRatio = Math.min(1, stats.offTrackPenalty / 1.5);

    ctx.fillStyle = '#888';
    ctx.font = `${labelSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('轮胎抓地', x, tireY);
    ctx.textAlign = 'right';
    ctx.fillText(stats.tireGrip.toFixed(2), x + indicatorW - 4, tireY);

    ctx.fillStyle = 'rgba(30, 30, 60, 0.8)';
    ctx.beginPath();
    ctx.roundRect(x, tireY + 4, indicatorW, barH, 3 * uiScale);
    ctx.fill();

    const gripGrad = ctx.createLinearGradient(x, 0, x + indicatorW, 0);
    gripGrad.addColorStop(0, '#00ff66');
    gripGrad.addColorStop(1, '#00ff6680');
    ctx.fillStyle = gripGrad;
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#00ff66';
    ctx.beginPath();
    ctx.roundRect(x, tireY + 4, indicatorW * gripRatio, barH, 3 * uiScale);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.textAlign = 'left';
    ctx.fillText('离道惩罚', x + indicatorW + 8, tireY);
    ctx.textAlign = 'right';
    const penaltyColor = stats.offTrackPenalty > 1.1 ? '#ff4444' : stats.offTrackPenalty < 0.8 ? '#00ff66' : '#ffff00';
    ctx.fillStyle = penaltyColor;
    ctx.fillText(stats.offTrackPenalty.toFixed(2), x + w, tireY);

    ctx.fillStyle = 'rgba(30, 30, 60, 0.8)';
    ctx.beginPath();
    ctx.roundRect(x + indicatorW + 8, tireY + 4, indicatorW, barH, 3 * uiScale);
    ctx.fill();

    const penaltyGrad = ctx.createLinearGradient(x + indicatorW + 8, 0, x + w, 0);
    penaltyGrad.addColorStop(0, penaltyColor);
    penaltyGrad.addColorStop(1, penaltyColor + '80');
    ctx.fillStyle = penaltyGrad;
    ctx.shadowBlur = 3;
    ctx.shadowColor = penaltyColor;
    ctx.beginPath();
    ctx.roundRect(x + indicatorW + 8, tireY + 4, indicatorW * penaltyRatio, barH, 3 * uiScale);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawGarageStatsComparison(x, y, w, h, currentStats, previewStats, accentColor, uiScale, isPortrait) {
    const ctx = this.ctx;
    const statLabels = ['最高速度', '加速能力', '转向操控', '漂移性能', '氮气容量'];
    const statKeys = ['speedRating', 'accelRating', 'handlingRating', 'driftRating', 'nitroRating'];
    const currentValues = [
      `${Math.round(currentStats.maxSpeed * 3.6 / 5)}`,
      `${currentStats.acceleration.toFixed(0)}`,
      `${currentStats.steerSpeed.toFixed(2)}`,
      `${(currentStats.driftAngle * 100).toFixed(0)}°`,
      `${currentStats.nitroCapacity.toFixed(0)}`
    ];
    const previewValues = [
      `${Math.round(previewStats.maxSpeed * 3.6 / 5)}`,
      `${previewStats.acceleration.toFixed(0)}`,
      `${previewStats.steerSpeed.toFixed(2)}`,
      `${(previewStats.driftAngle * 100).toFixed(0)}°`,
      `${previewStats.nitroCapacity.toFixed(0)}`
    ];

    const count = statKeys.length;
    const barH = isPortrait ? 7 * uiScale : 9;
    const spacing = (h - 50) / count;
    const labelSize = isPortrait ? 8 * uiScale : 10;
    const valueSize = isPortrait ? 8 * uiScale : 10;
    const deltaSize = isPortrait ? 9 * uiScale : 11;

    statKeys.forEach((key, i) => {
      const sy = y + i * spacing + spacing * 0.25;
      const currentVal = currentStats[key];
      const previewVal = previewStats[key];
      const delta = previewVal - currentVal;
      const barY = sy + labelSize + 3;

      ctx.fillStyle = '#777';
      ctx.font = `${labelSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(statLabels[i], x, sy);

      ctx.fillStyle = '#666';
      ctx.font = `${valueSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(currentValues[i], x + w * 0.38, sy);

      ctx.fillStyle = accentColor;
      ctx.font = `bold ${valueSize}px monospace`;
      ctx.fillText(previewValues[i], x + w * 0.68, sy);

      if (delta !== 0) {
        const deltaColor = delta > 0 ? '#00ff66' : '#ff4444';
        const deltaSign = delta > 0 ? '▲' : '▼';
        ctx.fillStyle = deltaColor;
        ctx.shadowBlur = 4;
        ctx.shadowColor = deltaColor;
        ctx.font = `bold ${deltaSize}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(`${deltaSign}${Math.abs(delta)}`, x + w, sy);
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = 'rgba(30, 30, 60, 0.6)';
      ctx.beginPath();
      ctx.roundRect(x, barY, w, barH, 2 * uiScale);
      ctx.fill();

      const currentFillW = w * (currentVal / 5);
      ctx.fillStyle = 'rgba(100, 100, 150, 0.4)';
      ctx.beginPath();
      ctx.roundRect(x, barY, currentFillW, barH, 2 * uiScale);
      ctx.fill();

      const previewFillW = w * (previewVal / 5);
      const barGrad = ctx.createLinearGradient(x, 0, x + w, 0);
      barGrad.addColorStop(0, accentColor);
      barGrad.addColorStop(1, accentColor + '60');
      ctx.fillStyle = barGrad;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.roundRect(x, barY, previewFillW, barH, 2 * uiScale);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    const tireY = y + count * spacing + 20;
    const indicatorW = (w - 8) / 2;

    ctx.fillStyle = '#777';
    ctx.font = `${labelSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('轮胎抓地', x, tireY);

    const gripDelta = previewStats.tireGrip - currentStats.tireGrip;
    const gripDeltaColor = gripDelta > 0.01 ? '#00ff66' : gripDelta < -0.01 ? '#ff4444' : '#888';
    const gripDeltaSign = gripDelta > 0.01 ? '▲' : gripDelta < -0.01 ? '▼' : '=';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    ctx.fillText(currentStats.tireGrip.toFixed(2), x + indicatorW - 22, tireY);
    ctx.fillStyle = accentColor;
    ctx.fillText(previewStats.tireGrip.toFixed(2), x + indicatorW - 4, tireY);
    if (gripDeltaSign !== '=') {
      ctx.fillStyle = gripDeltaColor;
      ctx.shadowBlur = 3;
      ctx.shadowColor = gripDeltaColor;
      ctx.font = `bold ${deltaSize}px monospace`;
      ctx.fillText(`${gripDeltaSign}${Math.abs(gripDelta).toFixed(2)}`, x + indicatorW + 4, tireY);
      ctx.shadowBlur = 0;
    }

    const gripBarY = tireY + labelSize + 3;
    ctx.fillStyle = 'rgba(30, 30, 60, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, gripBarY, indicatorW, barH, 2 * uiScale);
    ctx.fill();
    const curGripW = indicatorW * Math.min(1, (currentStats.tireGrip - 0.7) / 0.75);
    const prevGripW = indicatorW * Math.min(1, (previewStats.tireGrip - 0.7) / 0.75);
    ctx.fillStyle = 'rgba(100, 150, 100, 0.4)';
    ctx.beginPath();
    ctx.roundRect(x, gripBarY, curGripW, barH, 2 * uiScale);
    ctx.fill();
    const gripGrad = ctx.createLinearGradient(x, 0, x + indicatorW, 0);
    gripGrad.addColorStop(0, '#00ff66');
    gripGrad.addColorStop(1, '#00ff6660');
    ctx.fillStyle = gripGrad;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.roundRect(x, gripBarY, prevGripW, barH, 2 * uiScale);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#777';
    ctx.font = `${labelSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('离道惩罚', x + indicatorW + 8, tireY);

    const penaltyDelta = previewStats.offTrackPenalty - currentStats.offTrackPenalty;
    const penaltyDeltaColor = penaltyDelta < -0.01 ? '#00ff66' : penaltyDelta > 0.01 ? '#ff4444' : '#888';
    const penaltyDeltaSign = penaltyDelta < -0.01 ? '▲' : penaltyDelta > 0.01 ? '▼' : '=';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    ctx.fillText(currentStats.offTrackPenalty.toFixed(2), x + w - 22, tireY);
    const previewPenaltyColor = previewStats.offTrackPenalty > 1.1 ? '#ff4444' : previewStats.offTrackPenalty < 0.8 ? '#00ff66' : '#ffff00';
    ctx.fillStyle = previewPenaltyColor;
    ctx.fillText(previewStats.offTrackPenalty.toFixed(2), x + w - 4, tireY);
    if (penaltyDeltaSign !== '=') {
      ctx.fillStyle = penaltyDeltaColor;
      ctx.shadowBlur = 3;
      ctx.shadowColor = penaltyDeltaColor;
      ctx.font = `bold ${deltaSize}px monospace`;
      ctx.fillText(`${penaltyDeltaSign}${Math.abs(penaltyDelta).toFixed(2)}`, x + w + 4, tireY);
      ctx.shadowBlur = 0;
    }

    const penaltyBarY = gripBarY;
    ctx.fillStyle = 'rgba(30, 30, 60, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x + indicatorW + 8, penaltyBarY, indicatorW, barH, 2 * uiScale);
    ctx.fill();
    const curPenaltyW = indicatorW * Math.min(1, currentStats.offTrackPenalty / 1.5);
    const prevPenaltyW = indicatorW * Math.min(1, previewStats.offTrackPenalty / 1.5);
    ctx.fillStyle = 'rgba(150, 100, 100, 0.4)';
    ctx.beginPath();
    ctx.roundRect(x + indicatorW + 8, penaltyBarY, curPenaltyW, barH, 2 * uiScale);
    ctx.fill();
    const penaltyGrad = ctx.createLinearGradient(x + indicatorW + 8, 0, x + w, 0);
    penaltyGrad.addColorStop(0, previewPenaltyColor);
    penaltyGrad.addColorStop(1, previewPenaltyColor + '60');
    ctx.fillStyle = penaltyGrad;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.roundRect(x + indicatorW + 8, penaltyBarY, prevPenaltyW, barH, 2 * uiScale);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  _drawGarageCategoryDetails(x, y, w, h, category, itemIndex, garage, accentColor, uiScale, isPortrait) {
    const ctx = this.ctx;
    const details = garage.getCategoryDetailStats(category, itemIndex);
    if (!details || !details.primary) return;

    const isUnlocked = garage.isItemUnlocked(category, itemIndex);
    const statCount = details.primary.length;
    const spacing = Math.min(h / statCount, isPortrait ? 22 * uiScale : 26);
    const labelSize = isPortrait ? 9 * uiScale : 10;
    const valueSize = isPortrait ? 10 * uiScale : 12;

    ctx.fillStyle = 'rgba(20, 20, 40, 0.5)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * uiScale);
    ctx.fill();

    ctx.strokeStyle = accentColor + '30';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * uiScale);
    ctx.stroke();

    const titleSize = isPortrait ? 10 * uiScale : 11;
    ctx.fillStyle = accentColor + '99';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('详细参数', x + 8 * uiScale, y + 14 * uiScale);

    const contentStartY = y + 20 * uiScale;
    details.primary.forEach((stat, i) => {
      const sy = contentStartY + i * spacing;

      if (stat.isColor) {
        ctx.fillStyle = '#888';
        ctx.font = `${labelSize}px monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(stat.label, x + 8 * uiScale, sy);

        const swatchSize = isPortrait ? 12 * uiScale : 14;
        const swatchX = x + w - 8 * uiScale - swatchSize;
        ctx.shadowBlur = 6;
        ctx.shadowColor = stat.value;
        ctx.fillStyle = stat.value;
        ctx.beginPath();
        ctx.arc(swatchX + swatchSize / 2, sy - swatchSize / 3, swatchSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff40';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(swatchX + swatchSize / 2, sy - swatchSize / 3, swatchSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        return;
      }

      ctx.fillStyle = isUnlocked ? '#999' : '#555';
      ctx.font = `${labelSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(stat.label, x + 8 * uiScale, sy);

      ctx.fillStyle = isUnlocked ? accentColor : '#555';
      ctx.font = `bold ${valueSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(stat.value, x + w - 8 * uiScale, sy);

      if (stat.raw !== undefined && isUnlocked) {
        const maxRaw = this._getCategoryStatMax(category, stat.label);
        if (maxRaw > 0) {
          const barW = w * 0.45;
          const barX = x + (w - barW) / 2;
          const barY2 = sy + 2;
          const barH2 = isPortrait ? 3 * uiScale : 4;
          const ratio = Math.abs(stat.raw) / maxRaw;

          ctx.fillStyle = 'rgba(30, 30, 60, 0.6)';
          ctx.fillRect(barX, barY2, barW, barH2);

          const fillColor = stat.lower ? (stat.raw < 0 ? '#00ff66' : '#ff4444') : (stat.raw > 0 ? '#00ff66' : '#ff4444');
          ctx.fillStyle = fillColor + '80';
          ctx.fillRect(barX, barY2, barW * Math.min(ratio, 1), barH2);
        }
      }
    });

    if (details.level !== undefined) {
      const levelY = contentStartY + statCount * spacing + 4 * uiScale;
      const levelW = w - 16 * uiScale;
      const levelX = x + 8 * uiScale;
      const dotSize = isPortrait ? 6 * uiScale : 8;
      const dotGap = isPortrait ? 4 * uiScale : 5;
      const totalDotsW = 5 * dotSize + 4 * dotGap;
      const dotStartX = levelX + (levelW - totalDotsW) / 2;

      for (let lvl = 0; lvl < 5; lvl++) {
        const dx = dotStartX + lvl * (dotSize + dotGap);
        ctx.fillStyle = lvl <= details.level ? accentColor : 'rgba(50, 50, 80, 0.6)';
        if (lvl <= details.level) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = accentColor;
        }
        ctx.beginPath();
        ctx.arc(dx + dotSize / 2, levelY, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  _getCategoryStatMax(category, label) {
    switch (category) {
      case 'engine':
        if (label === '极速加成') return 90;
        if (label === '加速加成') return 75;
        if (label === '氮气提升') return 0.25;
        return 0;
      case 'tire':
        if (label === '抓地力') return 1.45;
        if (label === '漂移阻力') return 1.4;
        if (label === '离道惩罚') return 1.5;
        if (label === '转向加成') return 0.5;
        if (label === '漂移角度') return 0.2;
        return 0;
      case 'drift':
        if (label === '起漂阈值') return 0.55;
        if (label === '最大漂角') return 0.9;
        if (label === '起漂速度') return 3.5;
        if (label === '恢复速度') return 4.5;
        if (label === '抓地损失') return 0.15;
        return 0;
      default:
        return 0;
    }
  }

  _drawGarageRacePerformance(x, y, w, h, garage, uiScale, isPortrait) {
    const ctx = this.ctx;
    const history = garage.getRaceHistory();

    ctx.fillStyle = 'rgba(15, 15, 30, 0.7)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * uiScale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8 * uiScale);
    ctx.stroke();

    const titleSize = isPortrait ? 10 * uiScale : 12;
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffff00';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('📊 比赛表现', x + 10 * uiScale, y + 16 * uiScale);
    ctx.shadowBlur = 0;

    if (history.length === 0) {
      const hintSize = isPortrait ? 9 * uiScale : 10;
      ctx.fillStyle = '#555';
      ctx.font = `${hintSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('暂无比赛记录', x + w / 2, y + h / 2 + 4);
      return;
    }

    const avgRank = garage.getAverageRank();
    const winRate = garage.getWinRate();
    const bestTime = garage.getBestTime();

    const statY = y + 24 * uiScale;
    const statSize = isPortrait ? 9 * uiScale : 10;
    const valueSize = isPortrait ? 11 * uiScale : 13;
    const colW = w / 3;

    ctx.textAlign = 'center';
    const labels = ['平均排名', '胜率', '最佳时间'];
    const values = [
      avgRank > 0 ? avgRank.toFixed(1) : '-',
      winRate > 0 ? `${(winRate * 100).toFixed(0)}%` : '-',
      bestTime > 0 ? Utils.formatTime(bestTime).slice(3) : '-'
    ];
    const colors = ['#00f5ff', '#00ff66', '#ffff00'];

    labels.forEach((label, i) => {
      const cx = x + colW * i + colW / 2;
      ctx.fillStyle = '#888';
      ctx.font = `${statSize}px monospace`;
      ctx.fillText(label, cx, statY);
      ctx.fillStyle = colors[i];
      ctx.shadowBlur = 4;
      ctx.shadowColor = colors[i];
      ctx.font = `bold ${valueSize}px monospace`;
      ctx.fillText(values[i], cx, statY + 16 * uiScale);
      ctx.shadowBlur = 0;
    });

    const recentY = statY + 36 * uiScale;
    const recentCount = Math.min(history.length, 5);
    const barH = isPortrait ? 10 * uiScale : 12;
    const barGap = isPortrait ? 3 * uiScale : 4;
    const barAreaW = w - 20 * uiScale;
    const barAreaX = x + 10 * uiScale;

    ctx.fillStyle = '#666';
    ctx.font = `${isPortrait ? 8 * uiScale : 9}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('近期排名', barAreaX, recentY);

    for (let i = 0; i < recentCount; i++) {
      const r = history[i];
      const by = recentY + 10 * uiScale + i * (barH + barGap);
      const rankColors = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
      const barColor = rankColors[r.rank] || '#666';
      const fillRatio = Math.max(0.15, 1 - (r.rank - 1) / 4);

      ctx.fillStyle = 'rgba(30, 30, 60, 0.5)';
      ctx.beginPath();
      ctx.roundRect(barAreaX, by, barAreaW, barH, 3 * uiScale);
      ctx.fill();

      ctx.fillStyle = barColor;
      ctx.shadowBlur = 3;
      ctx.shadowColor = barColor;
      ctx.beginPath();
      ctx.roundRect(barAreaX, by, barAreaW * fillRatio, barH, 3 * uiScale);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${isPortrait ? 8 * uiScale : 9}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`P${r.rank}`, barAreaX + 4 * uiScale, by + barH * 0.8);

      if (r.bestLap && r.bestLap < Infinity) {
        ctx.fillStyle = '#aaa';
        ctx.font = `${isPortrait ? 7 * uiScale : 8}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(Utils.formatTime(r.bestLap).slice(3), barAreaX + barAreaW - 4 * uiScale, by + barH * 0.8);
      }
    }
  }

  _drawGarageActionButton(x, y, w, h, game, garage, category, item, isUnlocked, canBuy, isSelected, accentColor, uiScale) {
    const ctx = this.ctx;

    let btnLabel = '';
    let btnColor = '';
    let btnEnabled = false;

    if (isUnlocked && isSelected) {
      btnLabel = '✓ 已装备';
      btnColor = '#00ff66';
      btnEnabled = false;
    } else if (isUnlocked) {
      btnLabel = '装备';
      btnColor = accentColor;
      btnEnabled = true;
    } else if (canBuy) {
      btnLabel = `购买 ${item.cost}💰`;
      btnColor = '#ffff00';
      btnEnabled = true;
    } else {
      btnLabel = '金币不足';
      btnColor = '#666';
      btnEnabled = false;
    }

    const bgColor = btnEnabled ? `rgba(${parseInt(btnColor.slice(1,3), 16)}, ${parseInt(btnColor.slice(3,5), 16)}, ${parseInt(btnColor.slice(5,7), 16)}, 0.15)` : 'rgba(30, 30, 50, 0.6)';
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * uiScale);
    ctx.fill();

    ctx.strokeStyle = btnColor;
    ctx.lineWidth = btnEnabled ? 2 : 1;
    if (btnEnabled) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = btnColor;
    }
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = btnColor;
    ctx.shadowBlur = btnEnabled ? 6 : 0;
    ctx.shadowColor = btnColor;
    ctx.font = `bold ${h * 0.38}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(btnLabel, x + w / 2, y + h * 0.65);
    ctx.shadowBlur = 0;
  }

  _drawGarageItemList(x, y, w, h, game, garage, category, isPortrait) {
    const ctx = this.ctx;
    const uiScale = this._getUIScale();
    const itemCount = garage.getCategoryItemCount(category);

    const accentColor = category === 'engine' ? '#ff6600' :
                       category === 'tire' ? '#00ff66' :
                       category === 'paint' ? '#ff00ff' : '#00f5ff';

    ctx.fillStyle = 'rgba(20, 20, 40, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10 * uiScale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10 * uiScale);
    ctx.stroke();

    const titleSize = isPortrait ? 13 * uiScale : 15;
    ctx.fillStyle = '#888';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'left';
    const categoryTitles = { engine: '引擎升级', tire: '轮胎类型', paint: '喷漆颜色', drift: '漂移调校' };
    ctx.fillText(categoryTitles[category], x + 15 * uiScale, y + 25 * uiScale);

    const listTop = y + 40 * uiScale;
    const listBottom = y + h - 15 * uiScale;
    const listH = listBottom - listTop;

    const itemGap = isPortrait ? 6 * uiScale : 8;
    const itemH = isPortrait ? 50 * uiScale : 56;
    const totalItemH = itemCount * itemH + (itemCount - 1) * itemGap;
    const startY = listTop + Math.max(0, (listH - totalItemH) / 2);

    for (let i = 0; i < itemCount; i++) {
      const item = garage.getItemByIndex(category, i);
      const iy = startY + i * (itemH + itemGap);
      const isSelected = i === game.garageItemCursor;
      const isUnlocked = garage.isItemUnlocked(category, i);
      const isEquipped = i === garage.getSelectedIndex(category);

      if (isSelected) {
        ctx.fillStyle = `${accentColor}15`;
        ctx.beginPath();
        ctx.roundRect(x + 8 * uiScale, iy, w - 16 * uiScale, itemH, 6 * uiScale);
        ctx.fill();

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = accentColor;
        ctx.beginPath();
        ctx.roundRect(x + 8 * uiScale, iy, w - 16 * uiScale, itemH, 6 * uiScale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (category === 'paint') {
        const colorSize = isPortrait ? 24 * uiScale : 28;
        const colorX = x + 20 * uiScale;
        const colorY = iy + itemH / 2;

        ctx.shadowBlur = isSelected ? 12 : 6;
        ctx.shadowColor = item.color;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(colorX, colorY, colorSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = isUnlocked ? '#ffffff40' : '#00000060';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(colorX, colorY, colorSize / 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (category === 'engine') {
        const iconX = x + 18 * uiScale;
        const iconY = iy + itemH / 2;
        const level = item.level || 0;
        const iconSize = isPortrait ? 22 * uiScale : 26;

        ctx.fillStyle = isUnlocked ? accentColor : '#444';
        ctx.shadowBlur = isSelected ? 6 : 0;
        ctx.shadowColor = accentColor;
        ctx.font = `bold ${iconSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚙', iconX, iconY);
        ctx.shadowBlur = 0;
        ctx.textBaseline = 'alphabetic';
      } else if (category === 'tire') {
        const iconX = x + 20 * uiScale;
        const iconY = iy + itemH / 2;
        const iconSize = isPortrait ? 20 * uiScale : 24;

        ctx.strokeStyle = isUnlocked ? accentColor : '#444';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = isSelected ? 6 : 0;
        ctx.shadowColor = accentColor;
        ctx.beginPath();
        ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(iconX, iconY, iconSize / 3.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (category === 'drift') {
        const iconX = x + 20 * uiScale;
        const iconY = iy + itemH / 2;
        const iconSize = isPortrait ? 20 * uiScale : 24;

        ctx.strokeStyle = isUnlocked ? accentColor : '#444';
        ctx.lineWidth = 2;
        ctx.shadowBlur = isSelected ? 6 : 0;
        ctx.shadowColor = accentColor;
        ctx.beginPath();
        ctx.moveTo(iconX - iconSize / 2, iconY + iconSize / 3);
        ctx.quadraticCurveTo(iconX, iconY - iconSize / 2, iconX + iconSize / 2, iconY + iconSize / 3);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const nameX = category === 'paint' ? x + 42 * uiScale : x + 45 * uiScale;
      const nameSize = isPortrait ? 13 * uiScale : 14;
      const subSize = isPortrait ? 10 * uiScale : 11;

      const textColor = isUnlocked ? '#fff' : '#666';
      ctx.fillStyle = textColor;
      ctx.shadowBlur = isSelected ? 4 : 0;
      ctx.shadowColor = isUnlocked ? accentColor : 'transparent';
      ctx.font = `bold ${nameSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(item.name, nameX, iy + itemH * 0.42);
      ctx.shadowBlur = 0;

      if (category === 'engine') {
        ctx.fillStyle = isUnlocked ? '#888' : '#444';
        ctx.font = `${subSize}px monospace`;
        ctx.fillText(`速度+${item.maxSpeedBonus} 加速+${item.accelerationBonus}`, nameX, iy + itemH * 0.72);
      } else if (category === 'tire') {
        ctx.fillStyle = isUnlocked ? '#888' : '#444';
        ctx.font = `${subSize}px monospace`;
        ctx.fillText(`抓地力 ${(item.grip * 100).toFixed(0)}%`, nameX, iy + itemH * 0.72);
      } else if (category === 'drift') {
        ctx.fillStyle = isUnlocked ? '#888' : '#444';
        ctx.font = `${subSize}px monospace`;
        ctx.fillText(`最大漂移角度 ${(item.maxDriftAngle * 100).toFixed(0)}°`, nameX, iy + itemH * 0.72);
      }

      if (isEquipped && isUnlocked) {
        const badgeW = isPortrait ? 36 * uiScale : 42;
        const badgeH = isPortrait ? 18 * uiScale : 20;
        const badgeX = x + w - badgeW - 15 * uiScale;
        const badgeY = iy + (itemH - badgeH) / 2;

        ctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4 * uiScale);
        ctx.fill();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4 * uiScale);
        ctx.stroke();
        ctx.fillStyle = '#00ff66';
        ctx.font = `bold ${isPortrait ? 9 * uiScale : 10}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('装备中', badgeX + badgeW / 2, badgeY + badgeH * 0.65);
      } else if (!isUnlocked) {
        const costX = x + w - 70 * uiScale;
        const costY = iy + itemH * 0.6;

        const canAfford = game.career.coins >= item.cost;
        ctx.fillStyle = canAfford ? '#ffff00' : '#ff4444';
        ctx.font = `bold ${subSize}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(`💰 ${item.cost}`, x + w - 15 * uiScale, iy + itemH * 0.58);
      }

      if (!isUnlocked && category === 'engine') {
        const prevUnlocked = garage.isItemUnlocked(category, i - 1);
        if (!prevUnlocked && i > 0) {
          ctx.fillStyle = '#ff4444';
          ctx.font = `${subSize - 1}px monospace`;
          ctx.textAlign = 'right';
          ctx.fillText('需先购买上一级', x + w - 15 * uiScale, iy + itemH * 0.82);
        }
      }
    }
  }

  drawAchievements(game) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.97)';
    ctx.fillRect(0, 0, this.width, this.height);

    const bgGrad = ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.3, 0,
      this.width * 0.5, this.height * 0.3, this.width * 0.6
    );
    bgGrad.addColorStop(0, 'rgba(0, 245, 255, 0.05)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    const titleY = isPortrait ? 28 * uiScale : 35;
    const titleSize = isPortrait ? 22 * uiScale : 28;

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffff00';
    ctx.fillStyle = '#ffff00';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('🎖️ 勋章成就', centerX, titleY);
    ctx.shadowBlur = 0;

    const unlockedCount = game.achievements.getUnlockedCount();
    const totalCount = game.achievements.getTotalCount();
    const totalPoints = game.achievements.getTotalPoints();
    const subTitleY = titleY + (isPortrait ? 18 * uiScale : 22);
    ctx.fillStyle = '#888';
    ctx.font = `${(isPortrait ? 10 : 12) * uiScale}px monospace`;
    ctx.fillText(`已解锁 ${unlockedCount}/${totalCount} 枚勋章`, centerX, subTitleY);

    const pointsY = subTitleY + (isPortrait ? 16 * uiScale : 18);
    const pointsPulse = Math.sin(Date.now() * 0.003) * 0.1 + 0.9;
    ctx.shadowBlur = 8 * pointsPulse;
    ctx.shadowColor = '#ffd700';
    ctx.fillStyle = '#ffd700';
    ctx.font = `bold ${(isPortrait ? 13 : 15) * uiScale}px monospace`;
    ctx.fillText(`⭐ 成就点数: ${totalPoints}`, centerX, pointsY);
    ctx.shadowBlur = 0;

    const panelW = isPortrait ? Math.min(350 * uiScale, this.width * 0.92) : 460;
    const panelX = centerX - panelW / 2;
    const panelY = pointsY + (isPortrait ? 18 * uiScale : 20);
    const panelH = this.height - panelY - (isPortrait ? 35 : 45);

    ctx.fillStyle = 'rgba(15, 15, 30, 0.7)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 12 * uiScale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 12 * uiScale);
    ctx.stroke();

    const lineSpacing = isPortrait ? 110 * uiScale : 115;
    const contentY = panelY + 10 * uiScale;
    const contentH = panelH - 20 * uiScale;

    const scrollOffset = Math.max(0, (game.achievementCursor - 2) * lineSpacing);
    const maxScroll = Math.max(0, AchievementLineKeys.length * lineSpacing - contentH);
    const actualScroll = Math.min(scrollOffset, maxScroll);

    ctx.save();
    ctx.beginPath();
    ctx.rect(panelX + 4, panelY + 4, panelW - 8, panelH - 8);
    ctx.clip();

    AchievementLineKeys.forEach((lineId, idx) => {
      const line = AchievementLines[lineId];
      const status = game.achievements.getLineStatus(lineId);
      const isSelected = game.achievementCursor === idx;

      const itemY = contentY + idx * lineSpacing - actualScroll;

      if (itemY + lineSpacing < contentY || itemY > contentY + contentH) return;

      const itemX = panelX + 10 * uiScale;
      const itemW = panelW - 20 * uiScale;

      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.06)';
        ctx.beginPath();
        ctx.roundRect(itemX, itemY, itemW, lineSpacing - 6 * uiScale, 8 * uiScale);
        ctx.fill();

        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2 * uiScale;
        ctx.shadowBlur = 10 * uiScale;
        ctx.shadowColor = line.color;
        ctx.beginPath();
        ctx.roundRect(itemX, itemY, itemW, lineSpacing - 6 * uiScale, 8 * uiScale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const nameSize = isPortrait ? 13 * uiScale : 15;
      const descSize = isPortrait ? 9 * uiScale : 10;

      ctx.fillStyle = line.color;
      ctx.shadowBlur = isSelected ? 10 : 5;
      ctx.shadowColor = line.color;
      ctx.font = `bold ${nameSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`${line.icon} ${line.name}`, itemX + 10 * uiScale, itemY + 20 * uiScale);
      ctx.shadowBlur = 0;

      const progressSize = isPortrait ? 9 * uiScale : 10;
      const currentValue = status.currentValue;
      const nextTier = status.nextTier;

      let progressPct = 0;
      if (nextTier) {
        if (line.isLowerBetter && currentValue > 0) {
          progressPct = Math.min(100, Math.floor((nextTier.threshold / currentValue) * 100));
        } else {
          progressPct = Math.min(100, Math.floor((currentValue / nextTier.threshold) * 100));
        }
        ctx.fillStyle = '#aaa';
        ctx.font = `${progressSize}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.floor(currentValue)}${line.unit} / ${nextTier.threshold}${line.unit}`, itemX + itemW - 10 * uiScale, itemY + 20 * uiScale);
      } else {
        ctx.fillStyle = '#00ff66';
        ctx.font = `bold ${progressSize}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(`✓ 已满级`, itemX + itemW - 10 * uiScale, itemY + 20 * uiScale);
      }

      const tierY = itemY + 28 * uiScale;
      const tierSize = isPortrait ? 42 * uiScale : 45;
      const tierGap = isPortrait ? 4 * uiScale : 5;
      const totalTierW = line.tiers.length * tierSize + (line.tiers.length - 1) * tierGap;
      const tierStartX = itemX + (itemW - totalTierW) / 2;

      line.tiers.forEach((tier, ti) => {
        const tx = tierStartX + ti * (tierSize + tierGap);
        const isUnlocked = !!game.achievements.getTierStatus(tier.id);

        const tierBgAlpha = isUnlocked ? 0.15 : 0.05;
        const tierBorderColor = isUnlocked ? tier.color : '#333';
        const tierBgColor = isUnlocked
          ? `rgba(${parseInt(tier.color.slice(1,3),16)}, ${parseInt(tier.color.slice(3,5),16)}, ${parseInt(tier.color.slice(5,7),16)}, ${tierBgAlpha})`
          : `rgba(30, 30, 50, ${tierBgAlpha})`;

        ctx.fillStyle = tierBgColor;
        ctx.beginPath();
        ctx.roundRect(tx, tierY, tierSize, tierSize, 6 * uiScale);
        ctx.fill();

        ctx.strokeStyle = tierBorderColor;
        ctx.lineWidth = isUnlocked ? 2 * uiScale : 1;
        if (isUnlocked) {
          ctx.shadowBlur = 8 * uiScale;
          ctx.shadowColor = tier.color;
        }
        ctx.beginPath();
        ctx.roundRect(tx, tierY, tierSize, tierSize, 6 * uiScale);
        ctx.stroke();
        ctx.shadowBlur = 0;

        const iconSize = isPortrait ? 14 * uiScale : 16;
        ctx.font = `${iconSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = isUnlocked ? '#ffffff' : '#444';
        ctx.globalAlpha = isUnlocked ? 1 : 0.4;
        ctx.fillText(tier.icon, tx + tierSize / 2, tierY + tierSize * 0.35);
        ctx.globalAlpha = 1;

        const nameFontSize = isPortrait ? 6.5 * uiScale : 7.5;
        ctx.font = `bold ${nameFontSize}px monospace`;
        ctx.fillStyle = isUnlocked ? tier.color : '#555';
        ctx.fillText(tier.name, tx + tierSize / 2, tierY + tierSize * 0.55);

        if (tier.points) {
          ctx.fillStyle = isUnlocked ? '#ffd700' : '#555';
          ctx.font = `${nameFontSize - 0.5}px monospace`;
          ctx.fillText(`+${tier.points}⭐`, tx + tierSize / 2, tierY + tierSize * 0.72);
        }

        if (tier.reward && isUnlocked) {
          const reward = AchievementRewards[tier.reward];
          if (reward) {
            const rarityColor = RarityColors[reward.rarity] || '#888';
            ctx.fillStyle = rarityColor;
            ctx.font = `bold ${nameFontSize - 0.5}px monospace`;
            ctx.fillText('🎁', tx + tierSize / 2, tierY + tierSize * 0.88);
          }
        } else if (isUnlocked) {
          ctx.fillStyle = '#00ff66';
          ctx.font = `bold ${nameFontSize}px monospace`;
          ctx.fillText('✓', tx + tierSize / 2, tierY + tierSize * 0.88);
        }
      });

      if (nextTier) {
        const barY = tierY + tierSize + 6 * uiScale;
        const barW = itemW - 20 * uiScale;
        const barH = isPortrait ? 4 * uiScale : 5;
        const barX = itemX + 10 * uiScale;

        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 3 * uiScale);
        ctx.fill();

        const progressRatio = Math.min(1, progressPct / 100);
        const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        barGrad.addColorStop(0, line.color);
        barGrad.addColorStop(1, line.color + '88');
        ctx.fillStyle = barGrad;
        ctx.shadowBlur = 4;
        ctx.shadowColor = line.color;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * progressRatio, barH, 3 * uiScale);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    ctx.restore();

    const scrollBarW = 4 * uiScale;
    const scrollBarX = panelX + panelW - scrollBarW - 2;
    const scrollBarY = panelY + 4;
    const scrollBarH = panelH - 8;
    const totalContentH = AchievementLineKeys.length * lineSpacing;
    if (totalContentH > contentH) {
      const thumbH = Math.max(20, (contentH / totalContentH) * scrollBarH);
      const thumbY = scrollBarY + (actualScroll / maxScroll) * (scrollBarH - thumbH);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.roundRect(scrollBarX, thumbY, scrollBarW, thumbH, 2);
      ctx.fill();
    }

    const hintSize = isPortrait ? 9 * uiScale : 11;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ 选择  |  ESC/回车 返回', centerX, this.height - (isPortrait ? 16 : 22));

    ctx.restore();
  }

  drawAchievementNotification(game) {
    const notification = game.achievements.getNextNotification();
    if (!notification) return;

    const ctx = this.ctx;
    const elapsed = 3.5 - game.achievements._notificationTimer;
    let alpha = 1;
    if (elapsed < 0.3) alpha = elapsed / 0.3;
    if (elapsed > 2.8) alpha = Math.max(0, (3.5 - elapsed) / 0.7);

    const { tier, line } = notification;
    const reward = tier.reward ? AchievementRewards[tier.reward] : null;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const hasReward = !!reward;
    const panelW = 320;
    const panelH = hasReward ? 95 : 75;
    const panelX = (this.width - panelW) / 2;
    const panelY = 55;
    const floatY = Math.sin(elapsed * 3) * 3;
    const scale = 0.9 + alpha * 0.1;

    ctx.globalAlpha = alpha;
    ctx.translate(this.width / 2, panelY + panelH / 2 + floatY);
    ctx.scale(scale, scale);
    ctx.translate(-this.width / 2, -(panelY + panelH / 2 + floatY));

    const pulse = Math.sin(elapsed * 6) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(10, 10, 30, 0.95)`;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY + floatY, panelW, panelH, 14);
    ctx.fill();

    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 18 * pulse;
    ctx.shadowColor = tier.color;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY + floatY, panelW, panelH, 14);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffff00';
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 成就解锁!', this.width / 2, panelY + floatY + 22);
    ctx.shadowBlur = 0;

    ctx.fillStyle = tier.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = tier.color;
    ctx.font = 'bold 17px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${tier.icon} ${tier.name}`, this.width / 2, panelY + floatY + 44);
    ctx.shadowBlur = 0;

    if (tier.points) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`+${tier.points} 成就点数 ⭐`, this.width / 2, panelY + floatY + 60);
    }

    if (reward) {
      const rarityColor = RarityColors[reward.rarity] || '#888';
      const rarityName = RarityNames[reward.rarity] || '普通';
      ctx.strokeStyle = rarityColor;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = rarityColor;
      ctx.beginPath();
      ctx.roundRect(panelX + 20, panelY + floatY + 68, panelW - 40, 22, 6);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = rarityColor;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`🎁 奖励: ${reward.name} [${rarityName}]`, this.width / 2, panelY + floatY + 83);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawCareerMap(game) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();
    const career = game.career;
    const stages = career.getStages();
    const stage = stages[game.careerStageCursor];
    const isStageUnlocked = career.isStageUnlocked(game.careerStageCursor);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.97)';
    ctx.fillRect(0, 0, this.width, this.height);

    this._drawCareerBackground();

    const topBarY = isPortrait ? 18 * uiScale : 20;
    const btnW = isPortrait ? 80 * uiScale : 90;
    const btnH = isPortrait ? 36 * uiScale : 40;
    const titleSize = isPortrait ? 22 * uiScale : 28;
    const subtitleSize = isPortrait ? 11 * uiScale : 13;

    this._drawCareerTopButton(
      isPortrait ? 15 * uiScale : 20, topBarY, btnW, btnH,
      '← 返回', '#666', '#444'
    );
    this._drawCareerTopButton(
      this.width - (isPortrait ? 15 * uiScale : 20) - btnW * 1.1, topBarY, btnW * 1.1, btnH,
      '🔧 升级', '#ffff00', '#aa8800'
    );

    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffd700';
    ctx.font = `bold ${subtitleSize + 1}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`💰 ${career.coins}`, this.width - (isPortrait ? 15 * uiScale : 20), topBarY + btnH + 22 * uiScale);
    ctx.shadowBlur = 0;

    const navY = isPortrait ? 90 * uiScale : 90;
    const navBtnSize = isPortrait ? 40 * uiScale : 45;
    const stageTitleW = isPortrait ? 220 * uiScale : 280;
    const leftBtnX = centerX - stageTitleW / 2 - navBtnSize - 10;
    const rightBtnX = centerX + stageTitleW / 2 + 10;

    this._drawNavArrow(leftBtnX, navY, navBtnSize, '◀', isStageUnlocked ? '#00f5ff' : '#444');
    this._drawNavArrow(rightBtnX, navY, navBtnSize, '▶', isStageUnlocked ? '#ff00ff' : '#444');

    ctx.shadowBlur = 18;
    ctx.shadowColor = stage.color;
    ctx.fillStyle = stage.color;
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(stage.name, centerX, navY + 6);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = `${subtitleSize}px monospace`;
    ctx.fillText(stage.subtitle, centerX, navY + 6 + (isPortrait ? 20 * uiScale : 26));

    const completedEvents = stage.events.filter(e => career.isEventCompleted(e.id)).length;
    const progressPct = (completedEvents / stage.events.length) * 100;
    const progressW = isPortrait ? 200 * uiScale : 250;
    const progressH = isPortrait ? 8 * uiScale : 10;
    const progressY = navY + (isPortrait ? 42 * uiScale : 50);

    ctx.fillStyle = 'rgba(40, 40, 70, 0.8)';
    ctx.beginPath();
    ctx.roundRect(centerX - progressW / 2, progressY, progressW, progressH, progressH / 2);
    ctx.fill();

    const stageGrad = ctx.createLinearGradient(centerX - progressW / 2, 0, centerX + progressW / 2, 0);
    stageGrad.addColorStop(0, stage.color);
    stageGrad.addColorStop(1, stage.color + '88');
    ctx.fillStyle = stageGrad;
    ctx.shadowBlur = 6;
    ctx.shadowColor = stage.color;
    ctx.beginPath();
    ctx.roundRect(centerX - progressW / 2, progressY, progressW * (progressPct / 100), progressH, progressH / 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#aaa';
    ctx.font = `${subtitleSize - 1}px monospace`;
    ctx.fillText(`${completedEvents} / ${stage.events.length} 关`, centerX, progressY + progressH + (isPortrait ? 16 * uiScale : 20));

    if (career.isStageCompleted(stage.id)) {
      const badgeW = isPortrait ? 100 * uiScale : 120;
      const badgeH = isPortrait ? 24 * uiScale : 28;
      const badgeY = progressY + progressH + (isPortrait ? 26 * uiScale : 32);
      ctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
      ctx.beginPath();
      ctx.roundRect(centerX - badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2);
      ctx.fill();
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#00ff66';
      ctx.beginPath();
      ctx.roundRect(centerX - badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2);
      ctx.stroke();
      ctx.fillStyle = '#00ff66';
      ctx.font = `bold ${subtitleSize}px monospace`;
      ctx.fillText(`🏆 +${stage.reward}`, centerX, badgeY + badgeH * 0.72);
      ctx.shadowBlur = 0;
    }

    const listTop = isPortrait ? 200 * uiScale : progressY + progressH + 70;
    const listBottom = isPortrait ? this.height - 110 * uiScale : this.height - 90;
    const listW = isPortrait ? Math.min(360 * uiScale, this.width * 0.9) : 520;
    const listX = centerX - listW / 2;

    const eventCount = stage.events.length;
    const itemGap = isPortrait ? 10 * uiScale : 12;
    const itemH = isPortrait ? 62 * uiScale : 72;
    const totalItemH = eventCount * itemH + (eventCount - 1) * itemGap;
    const startY = listTop + Math.max(0, (listBottom - listTop - totalItemH) / 2);

    stage.events.forEach((event, i) => {
      const iy = startY + i * (itemH + itemGap);
      const isUnlocked = isStageUnlocked && career.isEventUnlocked(event.id);
      const isCompleted = career.isEventCompleted(event.id);
      const isSelected = game.careerEventCursor === i;
      const diffCfg = DifficultySettings[event.difficulty];

      if (isSelected && isUnlocked) {
        ctx.fillStyle = `${diffCfg.color}15`;
        ctx.beginPath();
        ctx.roundRect(listX + 6, iy, listW - 12, itemH, 10 * uiScale);
        ctx.fill();
        ctx.strokeStyle = diffCfg.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = diffCfg.color;
        ctx.beginPath();
        ctx.roundRect(listX + 6, iy, listW - 12, itemH, 10 * uiScale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (!isUnlocked) {
        ctx.fillStyle = 'rgba(15, 15, 30, 0.6)';
        ctx.beginPath();
        ctx.roundRect(listX + 10, iy + 4, listW - 20, itemH - 8, 8 * uiScale);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(listX + 10, iy + 4, listW - 20, itemH - 8, 8 * uiScale);
        ctx.stroke();
      }

      const nodeSize = isPortrait ? 36 * uiScale : 42;
      const nodeX = listX + 25 + nodeSize / 2;
      const nodeY = iy + itemH / 2;

      if (!isUnlocked) {
        ctx.fillStyle = '#2a2a3a';
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#555';
        ctx.font = `bold ${nodeSize * 0.45}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', nodeX, nodeY);
        ctx.textBaseline = 'alphabetic';
      } else if (isCompleted) {
        const bestResult = career.getEventBestResult(event.id);
        ctx.fillStyle = 'rgba(0, 255, 102, 0.2)';
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff66';
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#00ff66';
        ctx.font = `bold ${nodeSize * 0.42}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`#${bestResult.rank}`, nodeX, nodeY);
        ctx.textBaseline = 'alphabetic';
      } else {
        const pulse = Math.sin(Date.now() * 0.005 + i) * 0.2 + 0.8;
        ctx.fillStyle = `${diffCfg.color}30`;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeSize / 2 * (isSelected ? 1.05 * pulse : 1), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = diffCfg.color;
        ctx.lineWidth = 2;
        if (isSelected) {
          ctx.shadowBlur = 15 * pulse;
          ctx.shadowColor = diffCfg.color;
        }
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = isUnlocked ? diffCfg.color : '#666';
        ctx.font = `bold ${nodeSize * 0.5}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, nodeX, nodeY);
        ctx.textBaseline = 'alphabetic';
      }

      const nameX = listX + 55 + nodeSize;
      const nameSize = isPortrait ? 14 * uiScale : 16;
      const descSize = isPortrait ? 10 * uiScale : 11;

      ctx.fillStyle = isUnlocked ? '#ffffff' : '#555';
      ctx.shadowBlur = (isSelected && isUnlocked) ? 6 : 0;
      ctx.shadowColor = diffCfg.color;
      ctx.font = `bold ${nameSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(event.name, nameX, iy + itemH * 0.35);
      ctx.shadowBlur = 0;

      ctx.fillStyle = isUnlocked ? '#888' : '#333';
      ctx.font = `${descSize}px monospace`;
      ctx.fillText(event.description, nameX, iy + itemH * 0.6);

      const diffBadgeW = isPortrait ? 48 * uiScale : 55;
      const diffBadgeH = isPortrait ? 20 * uiScale : 22;
      const diffBadgeX = listX + listW - diffBadgeW - 22;
      const diffBadgeY = iy + 8;

      ctx.fillStyle = isUnlocked ? `${diffCfg.color}20` : 'rgba(60,60,60,0.3)';
      ctx.beginPath();
      ctx.roundRect(diffBadgeX, diffBadgeY, diffBadgeW, diffBadgeH, diffBadgeH / 2);
      ctx.fill();
      ctx.strokeStyle = isUnlocked ? diffCfg.color : '#444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(diffBadgeX, diffBadgeY, diffBadgeW, diffBadgeH, diffBadgeH / 2);
      ctx.stroke();
      ctx.fillStyle = isUnlocked ? diffCfg.color : '#555';
      ctx.font = `bold ${descSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(diffCfg.label, diffBadgeX + diffBadgeW / 2, diffBadgeY + diffBadgeH * 0.72);
      ctx.textAlign = 'left';

      const infoSize = descSize;
      const infoY = iy + itemH - 14;
      ctx.fillStyle = isUnlocked ? '#666' : '#333';
      ctx.font = `${infoSize}px monospace`;
      ctx.fillText(`${event.laps}圈`, nameX, infoY);

      ctx.fillStyle = isUnlocked ? '#ffd700' : '#444';
      ctx.textAlign = 'right';
      ctx.fillText(`💰 ${event.reward}`, listX + listW - 22, infoY);
      ctx.textAlign = 'left';
    });

    const totalEvents = career.getTotalEventCount();
    const doneEvents = career.getCompletedEventCount();
    const hintSize = isPortrait ? 9 * uiScale : 11;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`进度: ${doneEvents}/${totalEvents}  |  ←→ 切换阶段  ↑↓ 选择关卡  回车 进入  U 升级`, centerX, this.height - (isPortrait ? 55 : 45));
    ctx.fillText(`ESC 返回主菜单  |  点击卡片进入比赛`, centerX, this.height - (isPortrait ? 38 : 28));

    ctx.restore();
  }

  _drawCareerBackground() {
    const ctx = this.ctx;
    const gradient = ctx.createRadialGradient(
      this.width * 0.3, this.height * 0.3, 0,
      this.width * 0.3, this.height * 0.3, this.width * 0.6
    );
    gradient.addColorStop(0, 'rgba(0, 245, 255, 0.04)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    const gradient2 = ctx.createRadialGradient(
      this.width * 0.7, this.height * 0.7, 0,
      this.width * 0.7, this.height * 0.7, this.width * 0.5
    );
    gradient2.addColorStop(0, 'rgba(255, 0, 255, 0.04)');
    gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  _drawCareerTopButton(x, y, w, h, label, color, accent) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(30, 30, 50, 0.8)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = `bold ${h * 0.36}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }

  _drawNavArrow(x, y, size, label, color) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + size / 2, y, size / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = `bold ${size * 0.45}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + size / 2, y + 1);
    ctx.textBaseline = 'alphabetic';
  }

  drawCareerEvent(game) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();
    const career = game.career;
    const selected = career.getSelectedEvent();
    if (!selected) return;

    const { event, stage } = selected;
    const diffCfg = DifficultySettings[event.difficulty];

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(8, 8, 20, 0.98)';
    ctx.fillRect(0, 0, this.width, this.height);

    this._drawCareerBackground();

    const bgAlpha = 0.08;
    ctx.fillStyle = `${stage.color}${Math.round(bgAlpha * 255).toString(16).padStart(2, '0')}`;
    ctx.fillRect(0, 0, this.width, this.height);

    const panelW = isPortrait ? Math.min(340 * uiScale, this.width * 0.9) : 480;
    const panelH = isPortrait ? 520 * uiScale : 480;
    const panelX = centerX - panelW / 2;
    const panelY = (this.height - panelH) / 2;

    ctx.fillStyle = 'rgba(18, 18, 38, 0.95)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 16 * uiScale);
    ctx.fill();

    ctx.strokeStyle = diffCfg.color;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 20;
    ctx.shadowColor = diffCfg.color;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 16 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const headerH = isPortrait ? 80 * uiScale : 90;
    const headerGrad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + headerH);
    headerGrad.addColorStop(0, `${diffCfg.color}25`);
    headerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = headerGrad;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, headerH, { tl: 16 * uiScale, tr: 16 * uiScale, br: 0, bl: 0 });
    ctx.fill();

    const titleSize = isPortrait ? 24 * uiScale : 30;
    const stageLabelSize = isPortrait ? 11 * uiScale : 13;
    const eventNumSize = isPortrait ? 38 * uiScale : 48;
    const infoLabelSize = isPortrait ? 11 * uiScale : 12;
    const infoValueSize = isPortrait ? 18 * uiScale : 22;

    ctx.fillStyle = stage.color;
    ctx.font = `bold ${stageLabelSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${stage.name} · ${stage.subtitle}`, centerX, panelY + 28 * uiScale);

    ctx.fillStyle = diffCfg.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = diffCfg.color;
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.fillText(event.name, centerX, panelY + (isPortrait ? 58 * uiScale : 62));
    ctx.shadowBlur = 0;

    const badgeY = panelY + headerH + 18 * uiScale;
    const badgeW = isPortrait ? 64 * uiScale : 72;
    const badgeH = isPortrait ? 64 * uiScale : 72;
    const badgeX = centerX - badgeW / 2;

    const badgePulse = Math.sin(Date.now() * 0.004) * 0.15 + 0.85;
    ctx.fillStyle = `${diffCfg.color}20`;
    ctx.beginPath();
    ctx.arc(centerX, badgeY + badgeH / 2, badgeW / 2 * badgePulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = diffCfg.color;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = diffCfg.color;
    ctx.beginPath();
    ctx.arc(centerX, badgeY + badgeH / 2, badgeW / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = diffCfg.color;
    ctx.font = `bold ${eventNumSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${stage.events.indexOf(event) + 1}`, centerX, badgeY + badgeH / 2);
    ctx.textBaseline = 'alphabetic';

    const diffBadgeW = isPortrait ? 70 * uiScale : 80;
    const diffBadgeH = isPortrait ? 22 * uiScale : 26;
    ctx.fillStyle = `${diffCfg.color}25`;
    ctx.beginPath();
    ctx.roundRect(centerX - diffBadgeW / 2, badgeY + badgeH + 8, diffBadgeW, diffBadgeH, diffBadgeH / 2);
    ctx.fill();
    ctx.strokeStyle = diffCfg.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(centerX - diffBadgeW / 2, badgeY + badgeH + 8, diffBadgeW, diffBadgeH, diffBadgeH / 2);
    ctx.stroke();
    ctx.fillStyle = diffCfg.color;
    ctx.font = `bold ${stageLabelSize}px monospace`;
    ctx.fillText(diffCfg.label, centerX, badgeY + badgeH + 8 + diffBadgeH * 0.72);

    const infoStartY = badgeY + badgeH + diffBadgeH + 35 * uiScale;
    const infoItemW = isPortrait ? 130 * uiScale : 180;
    const infoItemH = isPortrait ? 56 * uiScale : 62;
    const infoGap = isPortrait ? 12 * uiScale : 18;
    const infoTotalW = infoItemW * 2 + infoGap;
    const infoStartX = centerX - infoTotalW / 2;

    const infos = [
      { label: '圈数', value: `${event.laps}`, color: '#00f5ff', icon: '🏁' },
      { label: '奖金', value: `${event.reward}`, color: '#ffd700', icon: '💰' },
      { label: '难度', value: diffCfg.label, color: diffCfg.color, icon: '⚔️' },
      { label: '对手', value: `${diffCfg.aiCount}`, color: '#ff00ff', icon: '🏍️' }
    ];

    infos.forEach((info, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ix = infoStartX + col * (infoItemW + infoGap);
      const iy = infoStartY + row * (infoItemH + infoGap * 0.6);

      ctx.fillStyle = `${info.color}12`;
      ctx.beginPath();
      ctx.roundRect(ix, iy, infoItemW, infoItemH, 10 * uiScale);
      ctx.fill();
      ctx.strokeStyle = `${info.color}55`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(ix, iy, infoItemW, infoItemH, 10 * uiScale);
      ctx.stroke();

      ctx.fillStyle = '#666';
      ctx.font = `${infoLabelSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`${info.icon} ${info.label}`, ix + 12 * uiScale, iy + 20 * uiScale);

      ctx.fillStyle = info.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = info.color;
      ctx.font = `bold ${infoValueSize}px monospace`;
      ctx.textAlign = 'right';
      const suffix = info.label === '圈数' ? ' 圈' : (info.label === '奖金' ? '' : (info.label === '对手' ? ' 人' : ''));
      ctx.fillText(info.value + suffix, ix + infoItemW - 12 * uiScale, iy + infoItemH - 14 * uiScale);
      ctx.shadowBlur = 0;
    });

    const descY = infoStartY + 2 * (infoItemH + infoGap * 0.6) + 8 * uiScale;
    ctx.fillStyle = '#888';
    ctx.font = `${stageLabelSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`📝 ${event.description}`, centerX, descY);

    const bestResult = career.getEventBestResult(event.id);
    if (bestResult) {
      const bestY = descY + (isPortrait ? 22 * uiScale : 28);
      ctx.fillStyle = '#00ff66';
      ctx.font = `bold ${stageLabelSize + 1}px monospace`;
      ctx.fillText(`🏆 最佳: #${bestResult.rank}名  ${Utils.formatTime(bestResult.time)}`, centerX, bestY);
    }

    const btnH = isPortrait ? 50 * uiScale : 54;
    const btnY = panelY + panelH - btnH - 22 * uiScale;
    const totalBtnW = isPortrait ? 280 * uiScale : 340;
    const btnGap = isPortrait ? 12 * uiScale : 18;
    const btnW = (totalBtnW - btnGap) / 2;
    const btnX = centerX - totalBtnW / 2;

    this._drawActionButton(btnX, btnY, btnW, btnH, '← 返回', '#666', '#444', false);
    this._drawActionButton(btnX + btnW + btnGap, btnY, btnW, btnH, '开始比赛 🏁', '#00ff66', '#008833', true);

    const hintSize = isPortrait ? 10 * uiScale : 12;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.fillText('回车开始  |  ESC 返回地图', centerX, panelY + panelH - 6 * uiScale);

    ctx.restore();
  }

  _drawActionButton(x, y, w, h, label, color, accent, primary) {
    const ctx = this.ctx;
    const time = Date.now() * 0.003;
    const pulse = primary ? (Math.sin(time) * 0.1 + 0.9) : 1;

    const bgColor = primary ? `${color}18` : 'rgba(40, 40, 60, 0.8)';
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = primary ? 2 : 1.5;
    if (primary) {
      ctx.shadowBlur = 15 * pulse;
      ctx.shadowColor = color;
    }
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = color;
    if (primary) {
      ctx.shadowBlur = 8 * pulse;
      ctx.shadowColor = color;
    }
    ctx.font = `bold ${h * 0.36}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 2);
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic';
  }

  drawCareerUpgrade(game) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();
    const career = game.career;
    const cursor = game.careerUpgradeCursor;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(8, 8, 20, 0.97)';
    ctx.fillRect(0, 0, this.width, this.height);
    this._drawCareerBackground();

    const topBarY = isPortrait ? 18 * uiScale : 20;
    const btnW = isPortrait ? 80 * uiScale : 90;
    const btnH = isPortrait ? 36 * uiScale : 40;
    this._drawCareerTopButton(
      isPortrait ? 15 * uiScale : 20, topBarY, btnW, btnH,
      '← 返回', '#666', '#444'
    );

    const titleSize = isPortrait ? 24 * uiScale : 30;
    const subtitleSize = isPortrait ? 12 * uiScale : 14;

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffff00';
    ctx.fillStyle = '#ffff00';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('🔧 车辆改装厂', centerX, isPortrait ? 52 * uiScale : 55);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = `${subtitleSize}px monospace`;
    ctx.fillText('使用奖金提升车辆性能', centerX, isPortrait ? 75 * uiScale : 80);

    const coinsY = isPortrait ? 105 * uiScale : 110;
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffd700';
    ctx.font = `bold ${titleSize * 0.85}px monospace`;
    ctx.fillText(`💰 ${career.coins} 金币`, centerX, coinsY);
    ctx.shadowBlur = 0;

    const listTop = coinsY + (isPortrait ? 30 * uiScale : 35);
    const listBottom = isPortrait ? this.height - 90 * uiScale : this.height - 70;
    const listW = isPortrait ? Math.min(380 * uiScale, this.width * 0.92) : 560;
    const listX = centerX - listW / 2;

    const itemCount = UpgradeTypeKeys.length;
    const itemGap = isPortrait ? 10 * uiScale : 14;
    const itemH = isPortrait ? 78 * uiScale : 88;
    const totalItemH = itemCount * itemH + (itemCount - 1) * itemGap;
    const startY = listTop + Math.max(0, (listBottom - listTop - totalItemH) / 2);

    UpgradeTypeKeys.forEach((key, i) => {
      const upgrade = UpgradeTypes[key];
      const iy = startY + i * (itemH + itemGap);
      const level = career.getUpgradeLevel(key);
      const maxed = level >= upgrade.maxLevel;
      const cost = maxed ? 'MAX' : career.calculateUpgradeCost(key);
      const canBuy = !maxed && career.canUpgrade(key);
      const isSelected = cursor === i;
      const bonus = career.getTotalUpgradeBonus(key);

      if (isSelected) {
        ctx.fillStyle = `${upgrade.color}12`;
        ctx.beginPath();
        ctx.roundRect(listX + 4, iy - 2, listW - 8, itemH + 4, 12 * uiScale);
        ctx.fill();
        ctx.strokeStyle = upgrade.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 14;
        ctx.shadowColor = upgrade.color;
        ctx.beginPath();
        ctx.roundRect(listX + 4, iy - 2, listW - 8, itemH + 4, 12 * uiScale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = 'rgba(20, 20, 40, 0.7)';
      ctx.beginPath();
      ctx.roundRect(listX + 10, iy, listW - 20, itemH, 10 * uiScale);
      ctx.fill();
      ctx.strokeStyle = isSelected ? upgrade.color : 'rgba(80,80,120,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(listX + 10, iy, listW - 20, itemH, 10 * uiScale);
      ctx.stroke();

      const iconSize = isPortrait ? 38 * uiScale : 44;
      const iconX = listX + 30;
      const iconY = iy + itemH / 2;

      ctx.fillStyle = `${upgrade.color}20`;
      ctx.beginPath();
      ctx.arc(iconX, iconY, iconSize / 2 + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = upgrade.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `${iconSize * 0.55}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(upgrade.icon, iconX, iconY);
      ctx.textBaseline = 'alphabetic';

      const nameX = listX + 30 + iconSize + 16;
      const nameSize = isPortrait ? 15 * uiScale : 17;
      const descSize = isPortrait ? 10 * uiScale : 11;

      ctx.fillStyle = upgrade.color;
      ctx.shadowBlur = isSelected ? 6 : 0;
      ctx.shadowColor = upgrade.color;
      ctx.font = `bold ${nameSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(upgrade.name, nameX, iy + 22 * uiScale);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#777';
      ctx.font = `${descSize}px monospace`;
      ctx.fillText(upgrade.description, nameX, iy + 40 * uiScale);

      const statLabelX = nameX;
      const statLabelY = iy + 58 * uiScale;
      ctx.fillStyle = '#555';
      ctx.font = `${descSize - 1}px monospace`;
      ctx.fillText('当前加成:', statLabelX, statLabelY);
      ctx.fillStyle = upgrade.color;
      ctx.font = `bold ${descSize}px monospace`;
      let bonusStr = '';
      if (key === 'handling') bonusStr = `+${bonus.toFixed(1)}`;
      else bonusStr = `+${bonus}`;
      ctx.fillText(bonusStr, statLabelX + 62 * uiScale, statLabelY);

      const levelBarW = isPortrait ? 110 * uiScale : 130;
      const levelBarH = isPortrait ? 5 * uiScale : 6;
      const levelBarX = listX + listW - levelBarW - 24;
      const levelBarY = iy + 18 * uiScale;

      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.roundRect(levelBarX, levelBarY, levelBarW, levelBarH, levelBarH / 2);
      ctx.fill();

      const fillW = levelBarW * (level / upgrade.maxLevel);
      const levelGrad = ctx.createLinearGradient(levelBarX, 0, levelBarX + levelBarW, 0);
      levelGrad.addColorStop(0, upgrade.color);
      levelGrad.addColorStop(1, upgrade.color + '77');
      ctx.fillStyle = levelGrad;
      ctx.shadowBlur = 4;
      ctx.shadowColor = upgrade.color;
      ctx.beginPath();
      ctx.roundRect(levelBarX, levelBarY, fillW, levelBarH, levelBarH / 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#aaa';
      ctx.font = `bold ${descSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`Lv.${level}/${upgrade.maxLevel}`, levelBarX + levelBarW, levelBarY + levelBarH + 14 * uiScale);

      const costBtnW = isPortrait ? 100 * uiScale : 120;
      const costBtnH = isPortrait ? 30 * uiScale : 34;
      const costBtnX = listX + listW - costBtnW - 24;
      const costBtnY = iy + itemH - costBtnH - 12 * uiScale;

      if (maxed) {
        ctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
        ctx.beginPath();
        ctx.roundRect(costBtnX, costBtnY, costBtnW, costBtnH, costBtnH / 2);
        ctx.fill();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#00ff66';
        ctx.beginPath();
        ctx.roundRect(costBtnX, costBtnY, costBtnW, costBtnH, costBtnH / 2);
        ctx.stroke();
        ctx.fillStyle = '#00ff66';
        ctx.font = `bold ${descSize + 1}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏆 满级', costBtnX + costBtnW / 2, costBtnY + costBtnH / 2 + 1);
        ctx.textBaseline = 'alphabetic';
      } else {
        const buyColor = canBuy ? '#ffd700' : '#555';
        ctx.fillStyle = canBuy ? 'rgba(255, 215, 0, 0.15)' : 'rgba(60,60,60,0.2)';
        ctx.beginPath();
        ctx.roundRect(costBtnX, costBtnY, costBtnW, costBtnH, costBtnH / 2);
        ctx.fill();
        ctx.strokeStyle = buyColor;
        ctx.lineWidth = canBuy ? 1.8 : 1;
        if (canBuy && isSelected) {
          const bp = Math.sin(Date.now() * 0.006) * 0.2 + 0.8;
          ctx.shadowBlur = 10 * bp;
          ctx.shadowColor = buyColor;
        }
        ctx.beginPath();
        ctx.roundRect(costBtnX, costBtnY, costBtnW, costBtnH, costBtnH / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = buyColor;
        ctx.font = `bold ${descSize + 1}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`💰 ${cost}`, costBtnX + costBtnW / 2, costBtnY + costBtnH / 2 + 1);
        ctx.textBaseline = 'alphabetic';
      }
      ctx.textAlign = 'left';
    });

    const hintSize = isPortrait ? 10 * uiScale : 12;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ 选择  |  回车/点击 升级  |  ESC 返回', centerX, this.height - (isPortrait ? 38 : 28));

    ctx.restore();
  }

  drawCareerStageClear(game) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();
    const career = game.career;

    const lastCompleted = career.completedStages[career.completedStages.length - 1];
    const stage = CareerStages.find(s => s.id === lastCompleted) || career.getCurrentStage();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const time = Date.now() * 0.001;
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2 + time;
      const dist = 80 + Math.sin(time * 2 + i) * 30;
      const px = centerX + Math.cos(angle) * dist * (isPortrait ? uiScale : 1.2);
      const py = centerY + Math.sin(angle) * dist * (isPortrait ? uiScale : 1.2);
      const alpha = 0.3 + Math.sin(time * 3 + i) * 0.2;
      ctx.fillStyle = `${stage.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(px, py, 3 + Math.sin(time + i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const pulseGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, isPortrait ? 300 * uiScale : 400);
    pulseGrad.addColorStop(0, `${stage.color}25`);
    pulseGrad.addColorStop(0.5, `${stage.color}10`);
    pulseGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = pulseGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    const panelW = isPortrait ? Math.min(340 * uiScale, this.width * 0.9) : 450;
    const panelH = isPortrait ? 440 * uiScale : 400;
    const panelX = centerX - panelW / 2;
    const panelY = centerY - panelH / 2;
    const panelPulse = Math.sin(time * 2) * 0.05 + 1;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(panelPulse, panelPulse);
    ctx.translate(-centerX, -centerY);

    ctx.fillStyle = 'rgba(12, 12, 30, 0.96)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 20 * uiScale);
    ctx.fill();

    ctx.strokeStyle = stage.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 30;
    ctx.shadowColor = stage.color;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 20 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    const trophySize = isPortrait ? 70 * uiScale : 80;
    const trophyY = panelY + 55 * uiScale;
    const trophyPulse = Math.sin(time * 4) * 0.08 + 1;

    ctx.save();
    ctx.translate(centerX, trophyY);
    ctx.scale(trophyPulse, trophyPulse);
    ctx.font = `${trophySize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ffff00';
    ctx.fillText('🏆', 0, 0);
    ctx.shadowBlur = 0;
    ctx.restore();

    const titleSize = isPortrait ? 28 * uiScale : 36;
    const subTitleSize = isPortrait ? 15 * uiScale : 18;
    const infoSize = isPortrait ? 13 * uiScale : 15;

    ctx.fillStyle = stage.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = stage.color;
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('阶段通关!', centerX, panelY + trophySize + 80 * uiScale);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = stage.color;
    ctx.font = `bold ${subTitleSize}px monospace`;
    ctx.fillText(stage.name, centerX, panelY + trophySize + 80 * uiScale + (isPortrait ? 30 * uiScale : 36));
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = `${infoSize}px monospace`;
    ctx.fillText(stage.subtitle + ' 全部完成', centerX, panelY + trophySize + 80 * uiScale + (isPortrait ? 54 * uiScale : 62));

    const rewardY = panelY + trophySize + 80 * uiScale + (isPortrait ? 95 * uiScale : 105);
    const rewardW = isPortrait ? 200 * uiScale : 240;
    const rewardH = isPortrait ? 60 * uiScale : 68;
    const rewardX = centerX - rewardW / 2;
    const rewardPulse = Math.sin(time * 3) * 0.04 + 1;

    ctx.save();
    ctx.translate(centerX, rewardY + rewardH / 2);
    ctx.scale(rewardPulse, rewardPulse);
    ctx.translate(-centerX, -(rewardY + rewardH / 2));

    ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
    ctx.beginPath();
    ctx.roundRect(rewardX, rewardY, rewardW, rewardH, 14 * uiScale);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ffd700';
    ctx.beginPath();
    ctx.roundRect(rewardX, rewardY, rewardW, rewardH, 14 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.fillStyle = '#ffd700';
    ctx.font = `bold ${infoSize}px monospace`;
    ctx.fillText('🎉 通关奖励', centerX, rewardY + 24 * uiScale);
    ctx.font = `bold ${titleSize * 0.75}px monospace`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffd700';
    ctx.fillText(`💰 +${stage.reward}`, centerX, rewardY + rewardH - 16 * uiScale);
    ctx.shadowBlur = 0;

    const stageIdx = CareerStages.findIndex(s => s.id === stage.id);
    const nextStage = CareerStages[stageIdx + 1];
    const hintY = panelY + panelH - 40 * uiScale;

    if (nextStage) {
      ctx.fillStyle = nextStage.color;
      ctx.font = `${infoSize}px monospace`;
      ctx.fillText(`✨ 已解锁: ${nextStage.name}`, centerX, hintY - 20 * uiScale);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = `${infoSize}px monospace`;
    ctx.fillText('回车 / 点击 继续生涯', centerX, hintY);

    ctx.restore();
  }

  drawCareerRaceResult(game) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();
    const career = game.career;
    const result = game.careerRaceResultData || career.lastRaceResult;

    if (!result) return;

    const selected = career.getEventById(result.eventId || career.selectedEventId);
    const event = selected ? selected.event : null;
    const stage = selected ? selected.stage : null;
    const diffCfg = event ? DifficultySettings[event.difficulty] : DifficultySettings.normal;

    const rank = result.rank;
    const rankColors = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
    const rankColor = rankColors[rank] || '#ff6666';
    const rankEmoji = { 1: '🥇', 2: '🥈', 3: '🥉' };
    const emoji = rankEmoji[rank] || '🏁';

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(6, 6, 18, 0.96)';
    ctx.fillRect(0, 0, this.width, this.height);

    if (rank <= 3) {
      const bgGrad = ctx.createRadialGradient(centerX, this.height * 0.35, 0, centerX, this.height * 0.35, this.width * 0.5);
      bgGrad.addColorStop(0, `${rankColor}18`);
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    const panelW = isPortrait ? Math.min(350 * uiScale, this.width * 0.92) : 460;
    const panelH = isPortrait ? 560 * uiScale : 500;
    const panelX = centerX - panelW / 2;
    const panelY = (this.height - panelH) / 2;

    ctx.fillStyle = 'rgba(14, 14, 34, 0.96)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 18 * uiScale);
    ctx.fill();

    ctx.strokeStyle = rankColor;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 20;
    ctx.shadowColor = rankColor;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 18 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const headerH = isPortrait ? 120 * uiScale : 130;
    const headerGrad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + headerH);
    headerGrad.addColorStop(0, `${rankColor}30`);
    headerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = headerGrad;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, headerH, { tl: 18 * uiScale, tr: 18 * uiScale, br: 0, bl: 0 });
    ctx.fill();

    const titleSize = isPortrait ? 16 * uiScale : 18;
    ctx.fillStyle = event ? diffCfg.color : '#888';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    if (stage && event) {
      ctx.fillText(`${stage.name} · ${event.name}`, centerX, panelY + 30 * uiScale);
    }

    const rankEmojiSize = isPortrait ? 68 * uiScale : 78;
    const rankTextSize = isPortrait ? 38 * uiScale : 46;
    const rankY = panelY + 75 * uiScale;

    ctx.font = `${rankEmojiSize}px monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 15;
    ctx.shadowColor = rankColor;
    ctx.fillText(emoji, centerX - 8 * uiScale, rankY);

    ctx.fillStyle = rankColor;
    ctx.font = `bold ${rankTextSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`第 ${rank} 名`, centerX + 8 * uiScale, rankY);
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic';

    if (result.isNewBest) {
      const nbSize = isPortrait ? 13 * uiScale : 15;
      const nbY = panelY + headerH + 6 * uiScale;
      const nbPulse = Math.sin(Date.now() * 0.006) * 0.15 + 0.85;
      ctx.fillStyle = `rgba(255, 102, 0, ${0.2 * nbPulse})`;
      const nbW = isPortrait ? 180 * uiScale : 200;
      ctx.beginPath();
      ctx.roundRect(centerX - nbW / 2, nbY - 12 * uiScale, nbW, 28 * uiScale, 14);
      ctx.fill();
      ctx.fillStyle = '#ff6600';
      ctx.shadowBlur = 10 * nbPulse;
      ctx.shadowColor = '#ff6600';
      ctx.font = `bold ${nbSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('⭐ 个人最佳纪录! ⭐', centerX, nbY + 6 * uiScale);
      ctx.shadowBlur = 0;
    }

    const infoStartY = panelY + headerH + (result.isNewBest ? 42 : 25) * uiScale;
    const infoItemW = isPortrait ? 135 * uiScale : 170;
    const infoItemH = isPortrait ? 58 * uiScale : 64;
    const infoGap = isPortrait ? 14 * uiScale : 20;
    const infoTotalW = infoItemW * 2 + infoGap;
    const infoStartX = centerX - infoTotalW / 2;

    const infos = [
      { label: '总用时', value: Utils.formatTime(result.time), color: '#00f5ff', icon: '⏱️' },
      { label: '最佳单圈', value: result.bestLap ? Utils.formatTime(result.bestLap) : '--:--:--', color: '#00ff66', icon: '🏁' },
      { label: '比赛圈数', value: `${result.totalLaps || (event ? event.laps : '-')} 圈`, color: '#ff00ff', icon: '🔄' },
      { label: '难度', value: event ? diffCfg.label : '-', color: diffCfg.color, icon: '⚔️' }
    ];

    infos.forEach((info, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ix = infoStartX + col * (infoItemW + infoGap);
      const iy = infoStartY + row * (infoItemH + infoGap * 0.7);

      ctx.fillStyle = `${info.color}14`;
      ctx.beginPath();
      ctx.roundRect(ix, iy, infoItemW, infoItemH, 10 * uiScale);
      ctx.fill();
      ctx.strokeStyle = `${info.color}50`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(ix, iy, infoItemW, infoItemH, 10 * uiScale);
      ctx.stroke();

      const labelSize = isPortrait ? 11 * uiScale : 12;
      const valueSize = isPortrait ? 17 * uiScale : 20;

      ctx.fillStyle = '#666';
      ctx.font = `${labelSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`${info.icon} ${info.label}`, ix + 12 * uiScale, iy + 22 * uiScale);

      ctx.fillStyle = info.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = info.color;
      ctx.font = `bold ${valueSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(info.value, ix + infoItemW - 12 * uiScale, iy + infoItemH - 16 * uiScale);
      ctx.shadowBlur = 0;
    });

    const rewardStartY = infoStartY + 2 * (infoItemH + infoGap * 0.7) + 10 * uiScale;
    const rewardH = isPortrait ? 72 * uiScale : 78;

    const coinsPulse = Math.sin(Date.now() * 0.004) * 0.05 + 1;
    ctx.save();
    ctx.translate(centerX, rewardStartY + rewardH / 2);
    ctx.scale(coinsPulse, coinsPulse);
    ctx.translate(-centerX, -(rewardStartY + rewardH / 2));

    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.beginPath();
    ctx.roundRect(panelX + 20, rewardStartY, panelW - 40, rewardH, 12 * uiScale);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#ffd700';
    ctx.beginPath();
    ctx.roundRect(panelX + 20, rewardStartY, panelW - 40, rewardH, 12 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    const rewardLabelSize = isPortrait ? 12 * uiScale : 13;
    const rewardValueSize = isPortrait ? 22 * uiScale : 26;

    ctx.fillStyle = '#aaa';
    ctx.font = `${rewardLabelSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('💰 获得奖金', panelX + 38 * uiScale, rewardStartY + rewardH * 0.4);

    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffd700';
    ctx.font = `bold ${rewardValueSize}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`+${result.coinsEarned}`, panelX + panelW - 38 * uiScale, rewardStartY + rewardH * 0.45);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = `${rewardLabelSize - 1}px monospace`;
    ctx.fillText(`当前总金币: ${career.coins}`, panelX + panelW - 38 * uiScale, rewardStartY + rewardH * 0.82);
    ctx.textAlign = 'left';

    const btnH = isPortrait ? 48 * uiScale : 52;
    const btnY = panelY + panelH - btnH - 18 * uiScale;
    const btnW = isPortrait ? 260 * uiScale : 300;

    this._drawActionButton(centerX - btnW / 2, btnY, btnW, btnH,
      career.showingStageClear ? '查看阶段奖励 →' : '继续生涯 →',
      stage ? stage.color : '#00f5ff', '#006688', true);

    const hintSize = isPortrait ? 10 * uiScale : 11;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('回车 / 点击 继续  |  ESC 返回地图', centerX, panelY + panelH - 4 * uiScale);

    ctx.restore();
  }

  drawWeatherEffects(weatherSystem, player) {
    if (!weatherSystem) return;

    const config = weatherSystem.getConfig();
    const seasonConfig = weatherSystem.getCurrentSeasonConfig();

    this._drawRaindrops(weatherSystem);
    this._drawFogLayer(weatherSystem, player);
    this._drawSeasonTint(seasonConfig, config);
    this._drawLightningFlash(weatherSystem);
    this._drawWetSurfaceReflections(weatherSystem, player);
  }

  _drawRaindrops(weatherSystem) {
    const ctx = this.ctx;
    const raindrops = weatherSystem.getRaindrops();
    const config = weatherSystem.getConfig();

    if (raindrops.length === 0) return;

    ctx.save();
    ctx.lineCap = 'round';

    raindrops.forEach(drop => {
      const endX = drop.x + Math.cos(Math.atan2(drop.vy, drop.vx)) * drop.length;
      const endY = drop.y + Math.sin(Math.atan2(drop.vy, drop.vx)) * drop.length;

      ctx.strokeStyle = `rgba(150, 200, 255, ${drop.alpha * 0.7})`;
      ctx.lineWidth = 1 + config.rainIntensity * 1.5;
      ctx.shadowBlur = 3;
      ctx.shadowColor = 'rgba(100, 180, 255, 0.5)';

      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  _drawFogLayer(weatherSystem, player) {
    const ctx = this.ctx;
    const fogDensity = weatherSystem.getFogDensity();
    const fogParticles = weatherSystem.getFogParticles();
    const config = weatherSystem.getConfig();

    if (fogDensity <= 0 && fogParticles.length === 0) return;

    ctx.save();

    if (fogParticles.length > 0) {
      fogParticles.forEach(fog => {
        const gradient = ctx.createRadialGradient(fog.x, fog.y, 0, fog.x, fog.y, fog.size);
        gradient.addColorStop(0, `rgba(200, 210, 220, ${fog.alpha * 0.5})`);
        gradient.addColorStop(0.5, `rgba(180, 190, 200, ${fog.alpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(180, 190, 200, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(fog.x, fog.y, fog.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    if (fogDensity > 0.05) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const visibility = weatherSystem.getVisibility();
      const screenW = this.width;
      const screenH = this.height;
      const playerDist = player ? Math.abs(player.speed) / 100 : 0;

      const fogGradient = ctx.createRadialGradient(
        screenW / 2, screenH / 2, Math.min(screenW, screenH) * 0.1 * visibility,
        screenW / 2, screenH / 2, Math.max(screenW, screenH) * 0.6
      );

      const baseAlpha = fogDensity * 0.5;
      const movingAlpha = Math.min(playerDist * 0.05, 0.15);
      const totalAlpha = Math.min(baseAlpha + movingAlpha, 0.6);

      fogGradient.addColorStop(0, `rgba(200, 210, 220, 0)`);
      fogGradient.addColorStop(0.3, `rgba(200, 210, 220, ${totalAlpha * 0.3})`);
      fogGradient.addColorStop(0.6, `rgba(190, 200, 210, ${totalAlpha * 0.7})`);
      fogGradient.addColorStop(1, `rgba(180, 190, 200, ${totalAlpha})`);

      ctx.fillStyle = fogGradient;
      ctx.fillRect(0, 0, screenW, screenH);
      ctx.restore();
    }

    ctx.restore();
  }

  _drawSeasonTint(seasonConfig, weatherConfig) {
    if (!seasonConfig || !seasonConfig.ambientTint) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const skyBrightness = weatherConfig.skyBrightness || 1.0;
    const darknessTint = `rgba(0, 0, 20, ${(1 - skyBrightness) * 0.3})`;

    if (seasonConfig.ambientTint) {
      ctx.fillStyle = seasonConfig.ambientTint;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    if (skyBrightness < 1.0) {
      ctx.fillStyle = darknessTint;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  }

  _drawLightningFlash(weatherSystem) {
    const flash = weatherSystem.getLightningFlash();
    if (flash <= 0) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const intensity = flash;
    const flicker = 0.8 + Math.random() * 0.2;

    ctx.fillStyle = `rgba(200, 220, 255, ${intensity * 0.4 * flicker})`;
    ctx.fillRect(0, 0, this.width, this.height);

    const vignetteGradient = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7
    );
    vignetteGradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
    vignetteGradient.addColorStop(1, `rgba(255, 255, 255, ${intensity * 0.2})`);
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.restore();
  }

  _drawWetSurfaceReflections(weatherSystem, player) {
    const wetness = weatherSystem.getWetness();
    if (wetness < 0.15 || !player) return;

    const ctx = this.ctx;
    const config = weatherSystem.getConfig();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const rearX = player.x - Math.cos(player.angle) * player.wheelBase * 0.7;
    const rearY = player.y - Math.sin(player.angle) * player.wheelBase * 0.7;

    const sprayCount = Math.floor(wetness * Math.abs(player.speed) / 15);
    for (let i = 0; i < sprayCount; i++) {
      const angle = player.angle + Math.PI + Utils.randomRange(-0.7, 0.7);
      const speed = Utils.randomRange(40, 100) * wetness;
      const dist = Utils.randomRange(5, 40);
      const x = rearX + Math.cos(player.angle + Utils.randomRange(-0.4, 0.4)) * dist;
      const y = rearY + Math.sin(player.angle + Utils.randomRange(-0.4, 0.4)) * dist;
      const size = Utils.randomRange(2, 6);
      const alpha = Utils.randomRange(0.1, 0.4) * wetness;

      ctx.fillStyle = `rgba(180, 210, 255, ${alpha})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(150, 200, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  drawWeatherHUD(game) {
    if (!game.weatherSystem) return;

    const ctx = this.ctx;
    const weatherSystem = game.weatherSystem;
    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();
    const padding = isPortrait ? 12 : 18;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const config = weatherSystem.getConfig();
    const seasonConfig = weatherSystem.getCurrentSeasonConfig();
    const diffLabel = weatherSystem.getWeatherDifficultyLabel();
    const transitioning = weatherSystem.isTransitioning();
    const targetConfig = WeatherConfig[weatherSystem.getTargetWeather()];

    const panelW = isPortrait ? 150 * uiScale : 180;
    const panelH = isPortrait ? 110 * uiScale : 130;
    const panelX = isPortrait ? this.width - padding - panelW : this.width - padding - panelW;
    const panelY = isPortrait ? padding + 100 * uiScale : padding + 165;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 10 * uiScale);
    ctx.fill();

    const seasonColor = seasonConfig.color || '#00f5ff';
    ctx.strokeStyle = seasonColor;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = seasonColor;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 10 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const iconSize = isPortrait ? 20 * uiScale : 24;
    ctx.font = `${iconSize}px serif`;
    ctx.textAlign = 'left';
    ctx.fillStyle = seasonColor;
    ctx.shadowBlur = 5;
    ctx.shadowColor = seasonColor;
    ctx.fillText(seasonConfig.icon || '', panelX + 10 * uiScale, panelY + 24 * uiScale);
    ctx.shadowBlur = 0;

    const seasonNameSize = isPortrait ? 11 * uiScale : 12;
    ctx.fillStyle = seasonColor;
    ctx.font = `bold ${seasonNameSize}px monospace`;
    ctx.fillText(seasonConfig.name || '', panelX + 34 * uiScale, panelY + 24 * uiScale);

    const weatherIconSize = isPortrait ? 22 * uiScale : 26;
    ctx.font = `${weatherIconSize}px serif`;
    ctx.fillStyle = config.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = config.color;
    ctx.fillText(config.icon, panelX + 10 * uiScale, panelY + 52 * uiScale);
    ctx.shadowBlur = 0;

    const weatherNameSize = isPortrait ? 12 * uiScale : 13;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${weatherNameSize}px monospace`;
    ctx.fillText(config.name, panelX + 38 * uiScale, panelY + 52 * uiScale);

    const infoSize = isPortrait ? 9 * uiScale : 10;
    ctx.font = `${infoSize}px monospace`;

    const gripPct = Math.round(weatherSystem.getGripMultiplier() * 100);
    const gripColor = gripPct >= 85 ? '#00ff66' : gripPct >= 65 ? '#ffff00' : gripPct >= 45 ? '#ff8800' : '#ff0044';
    ctx.fillStyle = '#888';
    ctx.fillText('抓地力', panelX + 10 * uiScale, panelY + 72 * uiScale);
    ctx.textAlign = 'right';
    ctx.fillStyle = gripColor;
    ctx.fillText(`${gripPct}%`, panelX + panelW - 10 * uiScale, panelY + 72 * uiScale);

    const visPct = Math.round(weatherSystem.getVisibility() * 100);
    const visColor = visPct >= 80 ? '#00ff66' : visPct >= 55 ? '#ffff00' : visPct >= 35 ? '#ff8800' : '#ff0044';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#888';
    ctx.fillText('能见度', panelX + 10 * uiScale, panelY + 88 * uiScale);
    ctx.textAlign = 'right';
    ctx.fillStyle = visColor;
    ctx.fillText(`${visPct}%`, panelX + panelW - 10 * uiScale, panelY + 88 * uiScale);

    const diffSize = isPortrait ? 10 * uiScale : 11;
    ctx.font = `bold ${diffSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#666';
    ctx.fillText('难度', panelX + 10 * uiScale, panelY + 106 * uiScale);
    ctx.textAlign = 'right';
    ctx.fillStyle = diffLabel.color;
    ctx.shadowBlur = 4;
    ctx.shadowColor = diffLabel.color;
    ctx.fillText(diffLabel.label, panelX + panelW - 10 * uiScale, panelY + 106 * uiScale);
    ctx.shadowBlur = 0;

    if (transitioning && targetConfig) {
      const transitionY = panelY + panelH + 6 * uiScale;
      const transitionH = isPortrait ? 22 * uiScale : 26;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(panelX, transitionY, panelW, transitionH, 6 * uiScale);
      ctx.fill();

      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#ff8800';
      ctx.beginPath();
      ctx.roundRect(panelX, transitionY, panelW, transitionH, 6 * uiScale);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const tSize = isPortrait ? 9 * uiScale : 10;
      ctx.font = `${tSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ff8800';
      ctx.fillText(`→ ${targetConfig.name}`, panelX + 8 * uiScale, transitionY + 15 * uiScale);

      const progress = weatherSystem.getTransitionProgress();
      const barX = panelX + panelW * 0.45;
      const barW = panelW * 0.5 - 12 * uiScale;
      const barH = isPortrait ? 4 * uiScale : 5;
      const barY = transitionY + (transitionH - barH) / 2;

      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#ff8800';
      ctx.shadowBlur = 3;
      ctx.shadowColor = '#ff8800';
      ctx.fillRect(barX, barY, barW * progress, barH);
      ctx.shadowBlur = 0;
    }

    const coinMult = weatherSystem.getCoinMultiplier();
    if (coinMult > 1.05) {
      const bonusY = panelY - (isPortrait ? 24 * uiScale : 28);
      const bonusH = isPortrait ? 20 * uiScale : 24;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(panelX, bonusY, panelW, bonusH, 6 * uiScale);
      ctx.fill();

      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#ffff00';
      ctx.beginPath();
      ctx.roundRect(panelX, bonusY, panelW, bonusH, 6 * uiScale);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const bSize = isPortrait ? 10 * uiScale : 11;
      ctx.font = `bold ${bSize}px monospace`;
      ctx.fillStyle = '#ffff00';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#ffff00';
      ctx.fillText(`💰 +${Math.round((coinMult - 1) * 100)}% 金币奖励`, panelX + panelW / 2, bonusY + 15 * uiScale);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  drawCareerEventDetail(game) {
    const ctx = this.ctx;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();
    const centerX = this.width / 2;

    const stage = game.career.getStage(game.careerStageCursor);
    const event = stage ? stage.events[game.careerEventCursor] : null;
    if (!stage || !event) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const panelW = isPortrait ? Math.min(360 * uiScale, this.width * 0.92) : 520;
    const panelH = isPortrait ? 460 * uiScale : 440;
    const panelX = centerX - panelW / 2;
    const panelY = (this.height - panelH) / 2;

    ctx.fillStyle = 'rgba(10, 10, 26, 0.95)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 14 * uiScale);
    ctx.fill();

    const stageColor = stage.color || '#00f5ff';
    ctx.strokeStyle = stageColor;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = stageColor;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 14 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const titleSize = isPortrait ? 20 * uiScale : 22;
    const subSize = isPortrait ? 12 * uiScale : 13;
    const infoSize = isPortrait ? 11 * uiScale : 12;

    ctx.textAlign = 'center';
    ctx.fillStyle = stageColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = stageColor;
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.fillText(event.name, centerX, panelY + 38 * uiScale);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = `${subSize}px monospace`;
    ctx.fillText(event.description, centerX, panelY + 60 * uiScale);

    const seasonConfig = SeasonConfigs[stage.season] || SeasonConfigs.spring;
    const weatherInfo = event.weather;
    const weatherCfg = weatherInfo ? WeatherConfig[weatherInfo] : null;
    const dynWeather = event.dynamicWeather !== false;

    const infoAreaY = panelY + 85 * uiScale;
    const infoH = isPortrait ? 200 * uiScale : 180;

    const sectionTitleSize = isPortrait ? 12 * uiScale : 13;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#aaa';
    ctx.font = `bold ${sectionTitleSize}px monospace`;
    ctx.fillText('赛事信息', panelX + 20 * uiScale, infoAreaY + 10 * uiScale);

    const infoItems = [
      { label: '难度', value: DifficultySettings[event.difficulty].label, color: DifficultySettings[event.difficulty].color },
      { label: '圈数', value: `${event.laps} 圈`, color: '#00f5ff' },
      { label: '基础奖金', value: `💰 ${event.reward}`, color: '#ffff00' },
      { label: '赛季', value: `${seasonConfig.icon || ''} ${seasonConfig.name}`, color: seasonConfig.color },
    ];

    const itemYStart = infoAreaY + 35 * uiScale;
    const itemSpacing = isPortrait ? 24 * uiScale : 26;

    infoItems.forEach((item, i) => {
      const iy = itemYStart + i * itemSpacing;
      ctx.fillStyle = '#666';
      ctx.font = `${infoSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(item.label, panelX + 24 * uiScale, iy);
      ctx.textAlign = 'right';
      ctx.fillStyle = item.color;
      ctx.shadowBlur = 4;
      ctx.shadowColor = item.color;
      ctx.font = `bold ${infoSize}px monospace`;
      ctx.fillText(item.value, panelX + panelW - 24 * uiScale, iy);
      ctx.shadowBlur = 0;
    });

    const weatherSectionY = infoAreaY + infoH - 20 * uiScale;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#aaa';
    ctx.font = `bold ${sectionTitleSize}px monospace`;
    ctx.fillText('天气状况', panelX + 20 * uiScale, weatherSectionY);

    const wItems = [];
    if (weatherCfg) {
      wItems.push({ label: '指定天气', value: `${weatherCfg.icon} ${weatherCfg.name}`, color: weatherCfg.color });
    } else {
      wItems.push({ label: '初始天气', value: `随机 (${seasonConfig.typicalWeathers.map(w => WeatherConfig[w].icon).join('')})`, color: '#888' });
    }
    wItems.push({ label: '动态变化', value: dynWeather ? '✅ 开启' : '❌ 关闭', color: dynWeather ? '#00ff66' : '#ff6600' });

    if (seasonConfig.tireRecommendation) {
      wItems.push({ label: '推荐胎', value: seasonConfig.tireRecommendation, color: '#00f5ff' });
    }

    const wItemStart = weatherSectionY + 25 * uiScale;
    wItems.forEach((item, i) => {
      const iy = wItemStart + i * itemSpacing;
      ctx.fillStyle = '#666';
      ctx.font = `${infoSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(item.label, panelX + 24 * uiScale, iy);
      ctx.textAlign = 'right';
      ctx.fillStyle = item.color;
      ctx.shadowBlur = 3;
      ctx.shadowColor = item.color;
      ctx.font = `bold ${infoSize}px monospace`;
      ctx.fillText(item.value, panelX + panelW - 24 * uiScale, iy);
      ctx.shadowBlur = 0;
    });

    const bonusDesc = [];
    if (seasonConfig.coinBonus > 1.0) bonusDesc.push(`💰+${Math.round((seasonConfig.coinBonus - 1) * 100)}%`);
    if (seasonConfig.scoreBonus > 1.0) bonusDesc.push(`🏆+${Math.round((seasonConfig.scoreBonus - 1) * 100)}%`);
    if (seasonConfig.xpBonus > 0) bonusDesc.push(`⭐+${seasonConfig.xpBonus}`);

    if (bonusDesc.length > 0) {
      const bonusY = panelY + panelH - 80 * uiScale;
      ctx.fillStyle = 'rgba(255, 255, 0, 0.08)';
      ctx.beginPath();
      ctx.roundRect(panelX + 16 * uiScale, bonusY - 18 * uiScale, panelW - 32 * uiScale, 30 * uiScale, 6 * uiScale);
      ctx.fill();

      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(panelX + 16 * uiScale, bonusY - 18 * uiScale, panelW - 32 * uiScale, 30 * uiScale, 6 * uiScale);
      ctx.stroke();

      ctx.fillStyle = '#ffff00';
      ctx.textAlign = 'center';
      ctx.font = `bold ${infoSize}px monospace`;
      ctx.fillText(`赛季加成: ${bonusDesc.join('  ')}`, centerX, bonusY + 2 * uiScale);
    }

    const btnH = isPortrait ? 48 * uiScale : 52;
    const btnY = panelY + panelH - btnH - 16 * uiScale;
    const totalBtnW = isPortrait ? 280 * uiScale : 320;
    const btnGap = isPortrait ? 12 * uiScale : 16;
    const btnW = (totalBtnW - btnGap) / 2;
    const btnX = centerX - totalBtnW / 2;

    const cancelX = btnX;
    const startX = btnX + btnW + btnGap;
    const isUnlocked = game.career.isEventUnlocked(event.id);

    ctx.fillStyle = 'rgba(50, 50, 70, 0.9)';
    ctx.beginPath();
    ctx.roundRect(cancelX, btnY, btnW, btnH, 10 * uiScale);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cancelX, btnY, btnW, btnH, 10 * uiScale);
    ctx.stroke();
    ctx.fillStyle = '#aaa';
    ctx.font = `bold ${btnH * 0.32}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('返回', cancelX + btnW / 2, btnY + btnH * 0.62);

    if (isUnlocked) {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.15)';
      ctx.beginPath();
      ctx.roundRect(startX, btnY, btnW, btnH, 10 * uiScale);
      ctx.fill();
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff66';
      ctx.beginPath();
      ctx.roundRect(startX, btnY, btnW, btnH, 10 * uiScale);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#00ff66';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ff66';
      ctx.font = `bold ${btnH * 0.32}px monospace`;
      ctx.fillText('🏁 开始比赛', startX + btnW / 2, btnY + btnH * 0.62);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = 'rgba(40, 40, 50, 0.9)';
      ctx.beginPath();
      ctx.roundRect(startX, btnY, btnW, btnH, 10 * uiScale);
      ctx.fill();
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(startX, btnY, btnW, btnH, 10 * uiScale);
      ctx.stroke();
      ctx.fillStyle = '#555';
      ctx.font = `bold ${btnH * 0.28}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('🔒 未解锁', startX + btnW / 2, btnY + btnH * 0.62);
    }

    ctx.restore();
  }
}
