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
    const padding = this.isPortrait() ? 12 : 20;
    const uiScale = this._getUIScale();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.track = game.track;

    if (this.isPortrait()) {
      this._drawSpeedometer(game.player, padding, this.height - 100 * uiScale, uiScale);
      this._drawLapInfoPortrait(game.player, game.totalLaps, padding, padding, uiScale);
      this._drawTimerPortrait(game.raceTime, this.width / 2 - 90 * uiScale, padding, uiScale);
      this._drawBestLapPortrait(game.player, game.raceTime, this.width / 2 - 90 * uiScale, padding + 50 * uiScale, uiScale);
      this._drawRankingsPortrait(game.getRankings(), this.width - padding - 130 * uiScale, padding, uiScale);
      this._drawDifficultyBadgePortrait(game.difficulty, padding, padding + 95 * uiScale, uiScale);
      this.drawCurrentRouteIndicatorPortrait(game.player, uiScale);
    } else {
      this._drawSpeedometer(game.player, padding, this.height - 120, 1);
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

    ctx.restore();

    this.drawRouteHints(game.track, game.player);
  }

  _drawSpeedometer(player, x, y, scale = 1) {
    const ctx = this.ctx;
    const speed = Math.abs(player.speed);
    const speedRatio = speed / player.maxSpeed;

    const w = 200 * scale;
    const h = 100 * scale;
    const fontSize = 36 * scale;
    const labelSize = 14 * scale;
    const barW = 160 * scale;
    const barH = 6 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10 * scale);
    ctx.fill();

    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2 * scale;
    ctx.shadowBlur = 10 * scale;
    ctx.shadowColor = '#00f5ff';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#00f5ff';
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(speed * 3.6)}`, x + w / 2, y + h * 0.5);

    ctx.fillStyle = '#888';
    ctx.font = `${labelSize}px monospace`;
    ctx.fillText('KM/H', x + w / 2, y + h * 0.72);

    const barX = x + (w - barW) / 2;
    const barY = y + h * 0.82;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);

    const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(0.6, '#ffff00');
    gradient.addColorStop(1, '#ff0000');

    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barW * speedRatio, barH);
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

    const panelW = isPortrait ? Math.min(320 * uiScale, this.width * 0.85) : 400;
    const panelH = isPortrait ? 280 * uiScale : 310;
    const panelX = centerX - panelW / 2;
    const panelY = isPortrait ? titleY + 80 * uiScale : centerY - 20;

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

    const itemSpacing = isPortrait ? 55 * uiScale : 60;
    const btnOffset0 = isPortrait ? 60 * uiScale : 75;
    const btnOffset1 = btnOffset0 + itemSpacing;
    const btnOffset2 = btnOffset1 + itemSpacing;
    const btnOffset3 = btnOffset2 + itemSpacing + 10 * uiScale;

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

    this._drawMenuButton(
      panelX, panelY + btnOffset2, panelW,
      '操控设置',
      game.menuCursor === 2, uiScale
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset3, panelW,
      '开始比赛',
      game.menuCursor === 3, uiScale
    );

    this._drawTouchSettingsSummary(game, panelX + 10 * uiScale, panelY + btnOffset2 + 35 * uiScale, panelW - 20 * uiScale, uiScale);

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

  _drawMenuButton(x, y, w, label, selected, scale = 1) {
    const ctx = this.ctx;
    const btnPadding = 60 * scale;
    const btnX = x + btnPadding;
    const btnW = w - 2 * btnPadding;
    const btnH = 40 * scale;
    const textSize = 18 * scale;

    const bgColor = selected ? 'rgba(0, 245, 255, 0.15)' : 'rgba(40, 40, 60, 0.8)';
    const borderColor = selected ? '#00f5ff' : '#444';
    const textColor = selected ? '#00f5ff' : '#888';

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

  drawFinished(game) {
    const ctx = this.ctx;
    const rankings = game.getRankings();
    const playerRank = rankings.findIndex(r => r.bike.isPlayer) + 1;
    const cfg = DifficultySettings[game.difficulty];
    const player = game.player;
    const hasBestLap = player.bestLapTime < Infinity;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.9)';
    ctx.fillRect(0, 0, this.width, this.height);

    const panelWidth = 380;
    const lapListHeight = player.lapTimes.length > 0 ? player.lapTimes.length * 24 + 55 : 0;
    const recordBannerHeight = game.isHistoricalRecord ? 40 : 0;
    const panelHeight = 500 + lapListHeight + recordBannerHeight;
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

    let infoY = panelY + 170;

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

    ctx.fillStyle = '#00f5ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f5ff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('按 空格键 返回菜单', this.width / 2, panelY + panelHeight - 25);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}
