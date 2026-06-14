class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 0, scale: 1, targetScale: 1 };
    this.camera2 = { x: 0, y: 0, scale: 1, targetScale: 1 };
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

  updateCameraSplit(player1, player2, dt) {
    const targetX1 = player1.x;
    const targetY1 = player1.y;

    this.camera.x = Utils.lerp(this.camera.x, targetX1, dt * 5);
    this.camera.y = Utils.lerp(this.camera.y, targetY1, dt * 5);

    const speedRatio1 = Math.abs(player1.speed) / player1.maxSpeed;
    const baseScale = this.isPortrait() ? 0.85 : 0.9;
    this.camera.targetScale = baseScale - speedRatio1 * 0.08;
    this.camera.scale = Utils.lerp(this.camera.scale, this.camera.targetScale, dt * 3);

    if (player2) {
      const targetX2 = player2.x;
      const targetY2 = player2.y;

      this.camera2.x = Utils.lerp(this.camera2.x, targetX2, dt * 5);
      this.camera2.y = Utils.lerp(this.camera2.y, targetY2, dt * 5);

      const speedRatio2 = Math.abs(player2.speed) / player2.maxSpeed;
      this.camera2.targetScale = baseScale - speedRatio2 * 0.08;
      this.camera2.scale = Utils.lerp(this.camera2.scale, this.camera2.targetScale, dt * 3);
    }
  }

  beginTransform() {
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this.camera.scale, this.camera.scale);
    this.ctx.translate(-this.camera.x, -this.camera.y);
  }

  getSplitLayout() {
    const isPortrait = this.isPortrait();
    return {
      horizontal: !isPortrait,
      viewportW: isPortrait ? this.width / 2 : this.width,
      viewportH: isPortrait ? this.height : this.height / 2,
      p1OffsetX: 0,
      p1OffsetY: 0,
      p2OffsetX: isPortrait ? this.width / 2 : 0,
      p2OffsetY: isPortrait ? 0 : this.height / 2,
      dividerX: isPortrait ? this.width / 2 : 0,
      dividerY: isPortrait ? 0 : this.height / 2,
      dividerLength: isPortrait ? this.height : this.width
    };
  }

  beginSplitTransform(playerIndex) {
    const camera = playerIndex === 1 ? this.camera : this.camera2;
    const layout = this.getSplitLayout();

    const viewportX = playerIndex === 1 ? layout.p1OffsetX : layout.p2OffsetX;
    const viewportY = playerIndex === 1 ? layout.p1OffsetY : layout.p2OffsetY;
    const viewportW = layout.viewportW;
    const viewportH = layout.viewportH;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(viewportX, viewportY, viewportW, viewportH);
    this.ctx.clip();

    this.ctx.save();
    this.ctx.translate(viewportX + viewportW / 2, viewportY + viewportH / 2);
    this.ctx.scale(camera.scale, camera.scale);
    this.ctx.translate(-camera.x, -camera.y);
  }

  endSplitTransform() {
    this.ctx.restore();
    this.ctx.restore();
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

  drawGhostBike(ghostState, alpha = 0.5) {
    if (!ghostState) return;
    
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(ghostState.x, ghostState.y);
    ctx.rotate(ghostState.angle + (ghostState.drift || 0) * 0.3);
    
    const wheelBase = 24;
    const halfWidth = 7;
    
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    
    ctx.beginPath();
    ctx.moveTo(wheelBase * 0.6, 0);
    ctx.lineTo(wheelBase * 0.2, -halfWidth);
    ctx.lineTo(-wheelBase * 0.5, -halfWidth * 0.8);
    ctx.lineTo(-wheelBase * 0.7, 0);
    ctx.lineTo(-wheelBase * 0.5, halfWidth * 0.8);
    ctx.lineTo(wheelBase * 0.2, halfWidth);
    ctx.closePath();
    ctx.fill();
    
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(wheelBase * 0.1, 0, halfWidth * 0.5, halfWidth * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    if (ghostState.nitro) {
      ctx.globalAlpha = alpha * 0.9;
      const tailLength = 80;
      const gradient = ctx.createLinearGradient(-wheelBase * 0.7, 0, -wheelBase * 0.7 - tailLength, 0);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.2, '#ff00ff');
      gradient.addColorStop(0.6, 'rgba(255, 0, 255, 0.4)');
      gradient.addColorStop(1, 'transparent');
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff00ff';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-wheelBase * 0.5, -halfWidth * 0.6);
      ctx.lineTo(-wheelBase * 0.7 - tailLength, 0);
      ctx.lineTo(-wheelBase * 0.5, halfWidth * 0.6);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawGhostTrail(trajectoryFrames, color = '#ff00ff', alpha = 0.35) {
    if (!trajectoryFrames || trajectoryFrames.length < 2) return;
    
    const ctx = this.ctx;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    
    ctx.beginPath();
    ctx.moveTo(trajectoryFrames[0].x, trajectoryFrames[0].y);
    for (let i = 1; i < trajectoryFrames.length; i++) {
      ctx.lineTo(trajectoryFrames[i].x, trajectoryFrames[i].y);
    }
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawSpeedHeatmapTrail(trajectoryFrames, alpha = 0.6) {
    if (!trajectoryFrames || trajectoryFrames.length < 3) return;

    const ctx = this.ctx;
    
    ctx.save();
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 8;

    let maxSpeed = 0;
    let minSpeed = Infinity;
    for (let i = 0; i < trajectoryFrames.length; i++) {
      const speed = trajectoryFrames[i].speed || 0;
      if (speed > maxSpeed) maxSpeed = speed;
      if (speed < minSpeed && speed > 10) minSpeed = speed;
    }
    if (maxSpeed === 0) maxSpeed = 1;
    if (minSpeed === Infinity || minSpeed >= maxSpeed) minSpeed = maxSpeed * 0.3;

    for (let i = 1; i < trajectoryFrames.length; i++) {
      const prev = trajectoryFrames[i - 1];
      const curr = trajectoryFrames[i];
      const speed = curr.speed || 0;
      const speedRatio = Math.max(0, Math.min(1, (speed - minSpeed) / (maxSpeed - minSpeed)));

      let color;
      if (speedRatio < 0.33) {
        const t = speedRatio / 0.33;
        color = `rgba(255, ${Math.floor(100 + t * 155)}, 0, ${alpha})`;
      } else if (speedRatio < 0.66) {
        const t = (speedRatio - 0.33) / 0.33;
        color = `rgba(${Math.floor(255 - t * 255)}, 255, 0, ${alpha})`;
      } else {
        const t = (speedRatio - 0.66) / 0.34;
        color = `rgba(0, 255, ${Math.floor(t * 255)}, ${alpha})`;
      }

      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  drawDualTrajectoryComparison(bestTrajectory, currentTrajectory, centerX, centerY, size = 200) {
    if (!bestTrajectory || bestTrajectory.length < 2) return;

    const ctx = this.ctx;
    
    ctx.save();
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < bestTrajectory.length; i++) {
      minX = Math.min(minX, bestTrajectory[i].x);
      minY = Math.min(minY, bestTrajectory[i].y);
      maxX = Math.max(maxX, bestTrajectory[i].x);
      maxY = Math.max(maxY, bestTrajectory[i].y);
    }

    const trackWidth = maxX - minX;
    const trackHeight = maxY - minY;
    const scale = Math.min(size / trackWidth, size / trackHeight) * 0.9;
    const offsetX = centerX - (trackWidth * scale) / 2 - minX * scale;
    const offsetY = centerY - (trackHeight * scale) / 2 - minY * scale;

    ctx.fillStyle = 'rgba(10, 10, 30, 0.8)';
    ctx.beginPath();
    ctx.roundRect(centerX - size / 2 - 10, centerY - size / 2 - 10, size + 20, size + 20, 8);
    ctx.fill();

    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff00ff';
    ctx.strokeRect(centerX - size / 2 - 10, centerY - size / 2 - 10, size + 20, size + 20);
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.moveTo(bestTrajectory[0].x * scale + offsetX, bestTrajectory[0].y * scale + offsetY);
    for (let i = 1; i < bestTrajectory.length; i++) {
      ctx.lineTo(bestTrajectory[i].x * scale + offsetX, bestTrajectory[i].y * scale + offsetY);
    }
    ctx.stroke();

    if (currentTrajectory && currentTrajectory.length > 1) {
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = '#00f5ff';
      ctx.shadowColor = '#00f5ff';
      ctx.beginPath();
      ctx.moveTo(currentTrajectory[0].x * scale + offsetX, currentTrajectory[0].y * scale + offsetY);
      for (let i = 1; i < currentTrajectory.length; i++) {
        ctx.lineTo(currentTrajectory[i].x * scale + offsetX, currentTrajectory[i].y * scale + offsetY);
      }
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('● 最佳路线', centerX - size / 2 + 5, centerY - size / 2 + 15);
    
    if (currentTrajectory && currentTrajectory.length > 1) {
      ctx.fillStyle = '#00f5ff';
      ctx.fillText('● 当前路线', centerX - size / 2 + 5, centerY - size / 2 + 28);
    }

    ctx.fillStyle = '#888';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('路线对比', centerX, centerY + size / 2 + 5);

    ctx.restore();
  }

  drawCurrentLapTrail(trajectoryFrames, alpha = 0.5) {
    if (!trajectoryFrames || trajectoryFrames.length < 2) return;
    
    const ctx = this.ctx;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    const gradient = ctx.createLinearGradient(
      trajectoryFrames[0].x, trajectoryFrames[0].y,
      trajectoryFrames[trajectoryFrames.length - 1].x, trajectoryFrames[trajectoryFrames.length - 1].y
    );
    gradient.addColorStop(0, 'rgba(0, 245, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 245, 255, 0.6)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00f5ff';
    
    ctx.beginPath();
    ctx.moveTo(trajectoryFrames[0].x, trajectoryFrames[0].y);
    for (let i = 1; i < trajectoryFrames.length; i++) {
      ctx.lineTo(trajectoryFrames[i].x, trajectoryFrames[i].y);
    }
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawGhostHUD(game) {
    if (!game.ghostReplay || !game.ghostReplay.hasBestLapGhost()) return;
    
    const ctx = this.ctx;
    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();
    const padding = isPortrait ? 12 : 20;
    
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    const ghostVisible = game.ghostReplay.isGhostVisible();
    const trailVisible = game.ghostReplay.isGhostTrailVisible();
    const bestLapTime = game.ghostReplay.getBestLapTime();
    
    const panelX = isPortrait ? padding : this.width - padding - 200;
    const panelY = isPortrait ? padding + 180 * uiScale : padding + 120;
    const panelW = isPortrait ? 140 * uiScale : 180;
    const panelH = isPortrait ? 70 * uiScale : 65;
    
    ctx.fillStyle = 'rgba(10, 10, 30, 0.7)';
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    const titleSize = isPortrait ? 12 * uiScale : 13;
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ff00ff';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('👻 最佳圈速', panelX + 12, panelY + 20);
    ctx.shadowBlur = 0;
    
    const timeSize = isPortrait ? 18 * uiScale : 18;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${timeSize}px monospace`;
    ctx.fillText(Utils.formatTime(bestLapTime), panelX + 12, panelY + 45);
    
    const statusSize = isPortrait ? 10 * uiScale : 11;
    ctx.font = `${statusSize}px monospace`;
    ctx.fillStyle = ghostVisible ? '#00ff66' : '#666';
    ctx.textAlign = 'right';
    ctx.fillText(ghostVisible ? '幽灵: 开' : '幽灵: 关', panelX + panelW - 12, panelY + 20);
    
    ctx.fillStyle = trailVisible ? '#00ff66' : '#666';
    ctx.fillText(trailVisible ? '轨迹: 开' : '轨迹: 关', panelX + panelW - 12, panelY + 38);
    
    if (game.player && game.player.lap > 0) {
      const timeDelta = game.ghostReplay.getTimeDelta(game.player.raceTime);
      const deltaSize = isPortrait ? 12 * uiScale : 12;
      ctx.font = `bold ${deltaSize}px monospace`;
      ctx.textAlign = 'right';
      
      if (timeDelta > 0) {
        ctx.fillStyle = '#ff6600';
        ctx.fillText(`+${(timeDelta / 1000).toFixed(2)}s`, panelX + panelW - 12, panelY + panelH - 10);
      } else if (timeDelta < 0) {
        ctx.fillStyle = '#00ff66';
        ctx.fillText(`${(timeDelta / 1000).toFixed(2)}s`, panelX + panelW - 12, panelY + panelH - 10);
      }
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

  drawNitroScreenOverlay(player, viewportXOrOffsetY = 0, viewportYOrHeight = 0, viewportW = 0, viewportH = 0) {
    if (!player.nitroActive && player.nitroBurstTimer <= 0) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    let vpX, vpY, vpW, vpH;
    if (viewportW > 0 || viewportH > 0) {
      vpX = viewportXOrOffsetY;
      vpY = viewportYOrHeight;
      vpW = viewportW;
      vpH = viewportH;
    } else if (viewportYOrHeight > 0) {
      vpX = 0;
      vpY = viewportXOrOffsetY;
      vpW = this.width;
      vpH = viewportYOrHeight;
    } else {
      vpX = 0;
      vpY = 0;
      vpW = this.width;
      vpH = this.height;
    }

    ctx.beginPath();
    ctx.rect(vpX, vpY, vpW, vpH);
    ctx.clip();

    const nitroIntensity = player.nitroActive ? 1 : Math.max(0, player.nitroBurstTimer / 0.4);

    if (player.nitroBurstTimer > 0) {
      const burstAlpha = (player.nitroBurstTimer / 0.4) * 0.35;
      ctx.fillStyle = `rgba(0, 245, 255, ${burstAlpha})`;
      ctx.fillRect(vpX, vpY, vpW, vpH);
    }

    if (player.nitroActive) {
      const pulse = Math.sin(Date.now() * 0.012) * 0.02 + 0.06;
      const edgeAlpha = nitroIntensity * pulse;

      const gradient = ctx.createRadialGradient(
        vpX + vpW / 2, vpY + vpH / 2, Math.min(vpW, vpH) * 0.2,
        vpX + vpW / 2, vpY + vpH / 2, Math.max(vpW, vpH) * 0.75
      );
      gradient.addColorStop(0, 'rgba(0, 245, 255, 0)');
      gradient.addColorStop(0.7, `rgba(0, 245, 255, ${edgeAlpha * 0.5})`);
      gradient.addColorStop(1, `rgba(0, 245, 255, ${edgeAlpha * 1.5})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(vpX, vpY, vpW, vpH);
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

    if (game.ghostReplay && game.ghostReplay.hasBestLapGhost() && !game._ghostReplayMode) {
      this.drawGhostHUD(game);
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

  _drawNewRecordOverlay(player, viewportXOrOffsetY = 0, viewportYOrHeight = 0, viewportW = 0, viewportH = 0) {
    const ctx = this.ctx;
    const elapsed = 3.0 - player.newRecordTimer;
    const alpha = Math.max(0, 1 - elapsed * 0.33);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    let vpX, vpY, vpW, vpH;
    if (viewportW > 0 || viewportH > 0) {
      vpX = viewportXOrOffsetY;
      vpY = viewportYOrHeight;
      vpW = viewportW;
      vpH = viewportH;
    } else if (viewportYOrHeight > 0) {
      vpX = 0;
      vpY = viewportXOrOffsetY;
      vpW = this.width;
      vpH = viewportYOrHeight;
    } else {
      vpX = 0;
      vpY = 0;
      vpW = this.width;
      vpH = this.height;
    }

    const isSplit = (viewportW > 0 || viewportH > 0 || viewportYOrHeight > 0);
    const centerX = vpX + vpW / 2;
    const centerY = isSplit ? (vpY + vpH * 0.28) : (this.height * 0.28);

    const scaleBase = (vpW < this.width || vpH < this.height) ? 0.65 : 1.0;
    const pulseScale = (1 + Math.sin(elapsed * 6) * 0.08) * scaleBase;
    const floatY = Math.sin(elapsed * 3) * 5 * scaleBase;

    ctx.translate(centerX, centerY + floatY);
    ctx.scale(pulseScale, pulseScale);

    const glowSize = (80 + Math.sin(elapsed * 8) * 20) * scaleBase;
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
    const panelH = isPortrait ? 570 * uiScale : 570;
    const panelX = centerX - panelW / 2;
    const panelY = isPortrait ? titleY + 50 * uiScale : centerY - 140;

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
    const btnOffset6 = btnOffset5 + itemSpacing;
    const btnOffset7 = btnOffset6 + itemSpacing + 6 * uiScale;
    const btnOffset8 = btnOffset7 + itemSpacing;
    const btnOffset9 = btnOffset8 + itemSpacing;
    const btnOffset10 = btnOffset9 + itemSpacing;
    const btnOffset11 = btnOffset10 + itemSpacing;

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
      '🏅 俱乐部任务',
      game.menuCursor === 6, uiScale,
      '#ff00ff'
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset7, panelW,
      '操控设置',
      game.menuCursor === 7, uiScale
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset8, panelW,
      '🏁 赛事编辑器',
      game.menuCursor === 8, uiScale,
      '#ff6600'
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset9, panelW,
      '🚓 悬赏追逐',
      game.menuCursor === 9, uiScale,
      '#ff0044'
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset10, panelW,
      '👥 双人对战',
      game.menuCursor === 10, uiScale,
      '#ff00ff'
    );

    this._drawMenuButton(
      panelX, panelY + btnOffset11, panelW,
      '🏁 开始游戏',
      game.menuCursor === 11, uiScale,
      '#00ff66'
    );

    this._drawTouchSettingsSummary(game, panelX + 10 * uiScale, panelY + btnOffset11 + 30 * uiScale, panelW - 20 * uiScale, uiScale);

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
    const ghostComparisonHeight = game.ghostReplay && game.ghostReplay.hasBestLapGhost() ? 140 : 0;
    const trajectoryCompareHeight = game.ghostReplay && game.ghostReplay.hasBestLapGhost() ? 180 : 0;
    const segmentAnalysisHeight = game.ghostReplay && game.ghostReplay.hasBestLapGhost() ? 180 : 0;
    const suggestionsHeight = this._getSuggestionsHeight(game);
    const replayEntryHeight = 60;
    const panelHeight = 525 + lapListHeight + recordBannerHeight + obstacleStatsHeight + achievementHeight + rewardHeight + configHeight + ghostComparisonHeight + trajectoryCompareHeight + segmentAnalysisHeight + suggestionsHeight + replayEntryHeight;
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

    if (game.ghostReplay && game.ghostReplay.hasBestLapGhost()) {
      infoY += 20;
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelX + 30, infoY);
      ctx.lineTo(panelX + panelWidth - 30, infoY);
      ctx.stroke();
      infoY += 20;

      ctx.fillStyle = '#ff00ff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff00ff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('👻 幽灵对比', panelX + 30, infoY);
      ctx.shadowBlur = 0;
      infoY += 25;

      const bestLapTime = game.ghostReplay.getBestLapTime();
      const playerBestLap = player.bestLapTime < Infinity ? player.bestLapTime : bestLapTime;
      const timeDiff = playerBestLap - bestLapTime;

      ctx.fillStyle = '#888';
      ctx.font = '13px monospace';
      ctx.fillText('历史最佳圈速:', panelX + 45, infoY);
      ctx.fillStyle = '#ff00ff';
      ctx.textAlign = 'right';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#ff00ff';
      ctx.fillText(Utils.formatTime(bestLapTime), panelX + panelWidth - 30, infoY);
      ctx.shadowBlur = 0;
      infoY += 22;

      ctx.fillStyle = '#888';
      ctx.textAlign = 'left';
      ctx.fillText('本次最佳圈速:', panelX + 45, infoY);
      ctx.fillStyle = playerBestLap <= bestLapTime ? '#00ff66' : '#ffffff';
      ctx.textAlign = 'right';
      if (playerBestLap <= bestLapTime) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#00ff66';
      }
      ctx.fillText(Utils.formatTime(playerBestLap), panelX + panelWidth - 30, infoY);
      ctx.shadowBlur = 0;
      infoY += 22;

      ctx.fillStyle = '#888';
      ctx.textAlign = 'left';
      ctx.fillText('差距:', panelX + 45, infoY);
      if (timeDiff > 0) {
        ctx.fillStyle = '#ff6600';
        ctx.textAlign = 'right';
        ctx.fillText(`+${Utils.formatTime(timeDiff)}`, panelX + panelWidth - 30, infoY);
      } else if (timeDiff < 0) {
        ctx.fillStyle = '#00ff66';
        ctx.textAlign = 'right';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#00ff66';
        ctx.fillText(`-${Utils.formatTime(Math.abs(timeDiff))} (新纪录!)`, panelX + panelWidth - 30, infoY);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'right';
        ctx.fillText('持平', panelX + panelWidth - 30, infoY);
      }
      infoY += 25;
    }

    if (game.ghostReplay && game.ghostReplay.hasBestLapGhost()) {
      infoY += 15;
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelX + 30, infoY);
      ctx.lineTo(panelX + panelWidth - 30, infoY);
      ctx.stroke();
      infoY += 20;

      ctx.fillStyle = '#ff00ff';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#ff00ff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🗺️ 最佳路线对照', panelX + panelWidth / 2, infoY);
      ctx.shadowBlur = 0;
      infoY += 20;

      const bestTrajectory = game.ghostReplay.getBestLapTrajectory();
      const currentTrajectory = game.ghostReplay.getCurrentRaceLine();
      if (bestTrajectory && bestTrajectory.length > 2) {
        const mapSize = 130;
        const mapX = panelX + panelWidth / 2;
        const mapY = infoY + mapSize / 2 + 5;
        this.drawDualTrajectoryComparison(bestTrajectory, currentTrajectory, mapX, mapY, mapSize);
      }
      infoY += 150;
    }

    if (game.ghostReplay && game.ghostReplay.hasBestLapGhost()) {
      infoY += 15;
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelX + 30, infoY);
      ctx.lineTo(panelX + panelWidth - 30, infoY);
      ctx.stroke();
      infoY += 20;

      infoY = this._drawSegmentAnalysis(game, panelX, infoY);
    }

    if (game.ghostReplay && game.ghostReplay.hasBestLapGhost()) {
      infoY += 10;
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelX + 30, infoY);
      ctx.lineTo(panelX + panelWidth - 30, infoY);
      ctx.stroke();
      infoY += 15;

      infoY = this._drawSuggestions(game, panelX, infoY);
    }

    infoY += 10;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, infoY);
    ctx.lineTo(panelX + panelWidth - 30, infoY);
    ctx.stroke();
    infoY += 15;

    const replayBtnY = infoY + 10;
    const replayBtnW = 200;
    const replayBtnH = 40;
    const replayBtnX = (this.width - replayBtnW) / 2;

    const btnHover = game._replayBtnHover || false;
    const btnGlow = btnHover ? 15 : 8;
    ctx.shadowBlur = btnGlow;
    ctx.shadowColor = '#ff00ff';
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.fillStyle = btnHover ? 'rgba(255, 0, 255, 0.2)' : 'rgba(20, 20, 40, 0.8)';
    ctx.beginPath();
    ctx.roundRect(replayBtnX, replayBtnY, replayBtnW, replayBtnH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff00ff';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🎬 观看最佳圈速回放', this.width / 2, replayBtnY + 26);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.fillText('按 R 键回放', this.width / 2, replayBtnY + replayBtnH + 15);

    ctx.fillStyle = '#00f5ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f5ff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('按 空格键 返回菜单', this.width / 2, panelY + panelHeight - 25);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawGhostReplayOverlay(game) {
    const ctx = this.ctx;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const ghostReplay = game.ghostReplay;
    if (!ghostReplay) {
      ctx.restore();
      return;
    }

    const panelW = isPortrait ? Math.min(320 * uiScale, this.width * 0.85) : 400;
    const panelH = isPortrait ? 180 * uiScale : 160;
    const panelX = (this.width - panelW) / 2;
    const panelY = isPortrait ? 20 * uiScale : 20;

    ctx.fillStyle = 'rgba(10, 10, 30, 0.9)';
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 12);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    const titleSize = isPortrait ? 18 * uiScale : 20;
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff00ff';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('👻 最佳圈速回放', this.width / 2, panelY + 35);
    ctx.shadowBlur = 0;

    const bestLapTime = ghostReplay.getBestLapTime();
    const progress = ghostReplay.getReplayProgress();
    const currentTime = bestLapTime * progress;

    const timeSize = isPortrait ? 24 * uiScale : 28;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${timeSize}px monospace`;
    ctx.fillText(Utils.formatTime(currentTime), this.width / 2, panelY + 75);

    const totalTimeY = panelY + 95;
    ctx.fillStyle = '#888';
    ctx.font = `12px monospace`;
    ctx.fillText(`/ ${Utils.formatTime(bestLapTime)}`, this.width / 2, totalTimeY);

    const barX = panelX + 20;
    const barW = panelW - 40;
    const barH = 6;
    const barY = panelY + 110;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 3);
    ctx.fill();

    const progressW = barW * progress;
    const progressGrad = ctx.createLinearGradient(barX, barY, barX + progressW, barY);
    progressGrad.addColorStop(0, '#ff00ff');
    progressGrad.addColorStop(1, '#ff66ff');
    ctx.fillStyle = progressGrad;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.roundRect(barX, barY, progressW, barH, 3);
    ctx.fill();
    ctx.shadowBlur = 0;

    const controlsY = panelY + 135;
    ctx.fillStyle = '#888';
    ctx.font = `11px monospace`;
    ctx.fillText('R 重新播放  |  空格 暂停/继续  |  ESC 退出', this.width / 2, controlsY);

    if (ghostReplay.isReplayPaused) {
      ctx.fillStyle = '#ffff00';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffff00';
      ctx.font = `bold ${14}px monospace`;
      ctx.fillText('⏸ 已暂停', this.width / 2, panelY + 155);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  _getSuggestionsHeight(game) {
    if (!game.ghostReplay || !game.ghostReplay.hasBestLapGhost()) return 0;
    const analysis = game.ghostReplay.getAnalysisSummary();
    if (!analysis || !analysis.suggestions || analysis.suggestions.length === 0) return 0;
    return 60 + analysis.suggestions.length * 28;
  }

  _drawSegmentAnalysis(game, panelX, infoY) {
    if (!game.ghostReplay || !game.ghostReplay.hasBestLapGhost()) return infoY;

    const ctx = this.ctx;
    const detailed = game.ghostReplay.getDetailedComparison();
    if (!detailed || !detailed.segments || detailed.segments.length === 0) return infoY;

    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff00ff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('📊 赛段分析', panelX + 30, infoY);
    ctx.shadowBlur = 0;
    infoY += 22;

    detailed.segments.forEach((seg, i) => {
      const segY = infoY + i * 28;
      
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(seg.segmentName, panelX + 45, segY);

      const statusColor = seg.status === 'fast' ? '#00ff66' : (seg.status === 'slow' ? '#ff6600' : '#ffff00');
      const statusText = seg.status === 'fast' ? '快' : (seg.status === 'slow' ? '慢' : '平');
      ctx.fillStyle = statusColor;
      ctx.textAlign = 'center';
      ctx.fillText(statusText, panelX + 150, segY);

      const diffText = seg.timeDiff > 0 
        ? `+${Utils.formatTime(seg.timeDiff)}` 
        : (seg.timeDiff < 0 ? Utils.formatTime(seg.timeDiff) : '0.00');
      ctx.fillStyle = seg.timeDiff > 0 ? '#ff6600' : (seg.timeDiff < 0 ? '#00ff66' : '#aaa');
      ctx.textAlign = 'right';
      ctx.fillText(diffText, panelX + 330, segY);
    });

    return infoY + detailed.segments.length * 28 + 10;
  }

  _drawSuggestions(game, panelX, infoY) {
    if (!game.ghostReplay || !game.ghostReplay.hasBestLapGhost()) return infoY;

    const ctx = this.ctx;
    const analysis = game.ghostReplay.getAnalysisSummary();
    if (!analysis || !analysis.suggestions || analysis.suggestions.length === 0) return infoY;

    ctx.fillStyle = '#00f5ff';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#00f5ff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('💡 改进建议', panelX + 30, infoY);
    ctx.shadowBlur = 0;
    infoY += 22;

    analysis.suggestions.forEach((sug, i) => {
      const sugY = infoY + i * 28;
      
      let icon = '•';
      let color = '#888';
      if (sug.priority === 'high') {
        icon = '🔴';
        color = '#ff6600';
      } else if (sug.priority === 'medium') {
        icon = '🟡';
        color = '#ffff00';
      } else if (sug.priority === 'low') {
        icon = '🟢';
        color = '#00ff66';
      } else if (sug.type === 'positive') {
        icon = '✨';
        color = '#00ff66';
      }

      ctx.fillStyle = color;
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      
      const text = sug.text;
      const maxChars = 38;
      if (text.length <= maxChars) {
        ctx.fillText(`${icon} ${text}`, panelX + 45, sugY);
      } else {
        const line1 = text.substring(0, maxChars);
        const line2 = text.substring(maxChars);
        ctx.fillText(`${icon} ${line1}`, panelX + 45, sugY);
        ctx.fillStyle = '#aaa';
        ctx.fillText(`  ${line2}`, panelX + 45, sugY + 18);
      }
    });

    return infoY + analysis.suggestions.length * 28 + 10;
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

  drawClubQuest(game) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const uiScale = this._getUIScale();
    const isPortrait = this.isPortrait();
    const clubQuest = game.clubQuest;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.97)';
    ctx.fillRect(0, 0, this.width, this.height);

    const bgGrad = ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.3, 0,
      this.width * 0.5, this.height * 0.3, this.width * 0.6
    );
    bgGrad.addColorStop(0, 'rgba(255, 0, 255, 0.05)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    const titleY = isPortrait ? 28 * uiScale : 35;
    const titleSize = isPortrait ? 22 * uiScale : 28;

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('🏅 俱乐部任务', centerX, titleY);
    ctx.shadowBlur = 0;

    const streakDays = clubQuest.getStreakDays();
    const clubLevel = clubQuest.getClubLevel();
    const subTitleY = titleY + (isPortrait ? 18 * uiScale : 22);
    ctx.fillStyle = '#888';
    ctx.font = `${(isPortrait ? 10 : 12) * uiScale}px monospace`;
    ctx.fillText(`🔥 连胜 ${streakDays} 天  |  ⭐ 俱乐部 Lv.${clubLevel}`, centerX, subTitleY);

    const xpProgress = clubQuest.getLevelProgress();
    const xpForNext = clubQuest.getXpForNextLevel();
    const totalXp = clubQuest.getTotalXp();
    const xpBarY = subTitleY + (isPortrait ? 14 : 16);
    const xpBarW = isPortrait ? 200 * uiScale : 240;
    const xpBarH = isPortrait ? 6 * uiScale : 7;
    const xpBarX = centerX - xpBarW / 2;

    ctx.fillStyle = 'rgba(50, 50, 80, 0.5)';
    ctx.beginPath();
    ctx.roundRect(xpBarX, xpBarY, xpBarW, xpBarH, xpBarH / 2);
    ctx.fill();

    const xpGrad = ctx.createLinearGradient(xpBarX, 0, xpBarX + xpBarW, 0);
    xpGrad.addColorStop(0, '#ffd700');
    xpGrad.addColorStop(1, '#ff8800');
    ctx.fillStyle = xpGrad;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffd700';
    ctx.beginPath();
    ctx.roundRect(xpBarX, xpBarY, xpBarW * xpProgress, xpBarH, xpBarH / 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    const panelW = isPortrait ? Math.min(360 * uiScale, this.width * 0.92) : 480;
    const panelX = centerX - panelW / 2;
    const panelY = xpBarY + (isPortrait ? 18 * uiScale : 22);
    const panelH = this.height - panelY - (isPortrait ? 35 : 45);

    ctx.fillStyle = 'rgba(15, 15, 30, 0.7)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 12 * uiScale);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 12 * uiScale);
    ctx.stroke();

    const tabH = 36 * uiScale;
    const tabY = panelY + 8 * uiScale;
    const tabW = (panelW - 20 * uiScale) / 2;

    const dailySelected = game.clubQuestTab === 'daily';
    const streakSelected = game.clubQuestTab === 'streak';

    ctx.fillStyle = dailySelected ? 'rgba(255, 0, 255, 0.2)' : 'rgba(40, 40, 60, 0.5)';
    ctx.beginPath();
    ctx.roundRect(panelX + 10 * uiScale, tabY, tabW, tabH, 8 * uiScale);
    ctx.fill();

    ctx.strokeStyle = dailySelected ? '#ff00ff' : 'rgba(100, 100, 130, 0.3)';
    ctx.lineWidth = dailySelected ? 2 * uiScale : 1;
    if (dailySelected) {
      ctx.shadowBlur = 8 * uiScale;
      ctx.shadowColor = '#ff00ff';
    }
    ctx.beginPath();
    ctx.roundRect(panelX + 10 * uiScale, tabY, tabW, tabH, 8 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = dailySelected ? '#ff00ff' : '#888';
    ctx.shadowBlur = dailySelected ? 6 : 0;
    ctx.shadowColor = '#ff00ff';
    ctx.font = `bold ${(isPortrait ? 11 : 13) * uiScale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('📅 每日挑战', panelX + 10 * uiScale + tabW / 2, tabY + tabH * 0.62);
    ctx.shadowBlur = 0;

    ctx.fillStyle = streakSelected ? 'rgba(255, 215, 0, 0.2)' : 'rgba(40, 40, 60, 0.5)';
    ctx.beginPath();
    ctx.roundRect(panelX + 10 * uiScale + tabW, tabY, tabW, tabH, 8 * uiScale);
    ctx.fill();

    ctx.strokeStyle = streakSelected ? '#ffd700' : 'rgba(100, 100, 130, 0.3)';
    ctx.lineWidth = streakSelected ? 2 * uiScale : 1;
    if (streakSelected) {
      ctx.shadowBlur = 8 * uiScale;
      ctx.shadowColor = '#ffd700';
    }
    ctx.beginPath();
    ctx.roundRect(panelX + 10 * uiScale + tabW, tabY, tabW, tabH, 8 * uiScale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = streakSelected ? '#ffd700' : '#888';
    ctx.shadowBlur = streakSelected ? 6 : 0;
    ctx.shadowColor = '#ffd700';
    ctx.font = `bold ${(isPortrait ? 11 : 13) * uiScale}px monospace`;
    ctx.fillText('🔥 连胜奖励', panelX + 10 * uiScale + tabW + tabW / 2, tabY + tabH * 0.62);
    ctx.shadowBlur = 0;

    const contentY = tabY + tabH + 10 * uiScale;
    const contentH = panelH - (tabY - panelY) - tabH - 20 * uiScale;

    ctx.save();
    ctx.beginPath();
    ctx.rect(panelX + 4, contentY - 2, panelW - 8, contentH + 4);
    ctx.clip();

    if (game.clubQuestTab === 'daily') {
      this._drawDailyQuests(game, panelX, contentY, panelW, contentH, uiScale, isPortrait);
    } else {
      this._drawStreakRewards(game, panelX, contentY, panelW, contentH, uiScale, isPortrait);
    }

    ctx.restore();

    const timeText = clubQuest.formatTimeUntilReset();
    ctx.fillStyle = '#666';
    ctx.font = `${(isPortrait ? 9 : 10) * uiScale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`⏰ 刷新倒计时: ${timeText}`, centerX, panelY + panelH - (isPortrait ? 12 : 15));

    const hintSize = isPortrait ? 9 * uiScale : 11;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.fillText('↑↓ 选择  ←→ 切换  空格领取  |  ESC 返回', centerX, this.height - (isPortrait ? 16 : 22));

    ctx.restore();
  }

  _drawDailyQuests(game, panelX, contentY, panelW, contentH, uiScale, isPortrait) {
    const ctx = this.ctx;
    const clubQuest = game.clubQuest;
    const dailyQuests = clubQuest.getDailyQuests();
    const itemH = 72 * uiScale;

    dailyQuests.forEach((quest, idx) => {
      const isSelected = game.clubQuestCursor === idx;
      const itemY = contentY + idx * itemH;

      if (itemY + itemH < contentY || itemY > contentY + contentH) return;

      const itemX = panelX + 10 * uiScale;
      const itemW = panelW - 20 * uiScale;

      if (isSelected) {
        ctx.fillStyle = quest.completed ? 'rgba(0, 255, 102, 0.06)' : 'rgba(255, 0, 255, 0.06)';
        ctx.beginPath();
        ctx.roundRect(itemX, itemY, itemW, itemH - 8 * uiScale, 8 * uiScale);
        ctx.fill();

        const borderColor = quest.claimed ? '#00ff66' : (quest.completed ? '#ffd700' : quest.rarityInfo.color);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2 * uiScale;
        ctx.shadowBlur = 10 * uiScale;
        ctx.shadowColor = borderColor;
        ctx.beginPath();
        ctx.roundRect(itemX, itemY, itemW, itemH - 8 * uiScale, 8 * uiScale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const iconSize = isPortrait ? 20 * uiScale : 24;
      ctx.font = `${iconSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(quest.icon, itemX + 12 * uiScale, itemY + 22 * uiScale);

      const nameSize = isPortrait ? 11 * uiScale : 13;
      ctx.fillStyle = quest.claimed ? '#00ff66' : quest.rarityInfo.color;
      ctx.shadowBlur = isSelected ? 8 : 4;
      ctx.shadowColor = quest.rarityInfo.color;
      ctx.font = `bold ${nameSize}px monospace`;
      ctx.fillText(quest.name, itemX + 38 * uiScale, itemY + 20 * uiScale);
      ctx.shadowBlur = 0;

      const raritySize = isPortrait ? 8 * uiScale : 9;
      ctx.fillStyle = quest.rarityInfo.color;
      ctx.font = `${raritySize}px monospace`;
      ctx.fillText(`[${quest.rarityInfo.name}]`, itemX + 38 * uiScale, itemY + 34 * uiScale);

      const descSize = isPortrait ? 9 * uiScale : 10;
      ctx.fillStyle = '#aaa';
      ctx.font = `${descSize}px monospace`;
      ctx.fillText(quest.description, itemX + 12 * uiScale, itemY + 48 * uiScale);

      const progressBarY = itemY + 54 * uiScale;
      const progressBarW = itemW - 100 * uiScale;
      const progressBarH = isPortrait ? 5 * uiScale : 6;
      const progressBarX = itemX + 12 * uiScale;

      ctx.fillStyle = 'rgba(50, 50, 80, 0.5)';
      ctx.beginPath();
      ctx.roundRect(progressBarX, progressBarY, progressBarW, progressBarH, progressBarH / 2);
      ctx.fill();

      let progressPct = 0;
      if (quest.isLowerBetter) {
        progressPct = quest.progress > 0 ? Math.min(100, (quest.target / quest.progress) * 100) : 0;
      } else {
        progressPct = Math.min(100, (quest.progress / quest.target) * 100);
      }
      const progressRatio = Math.min(1, progressPct / 100);

      const progressColor = quest.completed ? '#00ff66' : quest.rarityInfo.color;
      ctx.fillStyle = progressColor;
      ctx.shadowBlur = 3;
      ctx.shadowColor = progressColor;
      ctx.beginPath();
      ctx.roundRect(progressBarX, progressBarY, progressBarW * progressRatio, progressBarH, progressBarH / 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const progressTextSize = isPortrait ? 8 * uiScale : 9;
      ctx.fillStyle = '#888';
      ctx.font = `${progressTextSize}px monospace`;
      ctx.textAlign = 'right';
      const progressDisplay = quest.isLowerBetter
        ? (quest.progress > 0 ? `${quest.progress.toFixed(1)}${quest.unit} / ${quest.target}${quest.unit}` : `0${quest.unit} / ${quest.target}${quest.unit}`)
        : `${Math.floor(quest.progress)}${quest.unit} / ${quest.target}${quest.unit}`;
      ctx.fillText(progressDisplay, itemX + itemW - 12 * uiScale, itemY + 48 * uiScale);

      const rewardX = itemX + itemW - 12 * uiScale;
      const rewardY = itemY + 22 * uiScale;
      ctx.fillStyle = '#ffd700';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#ffd700';
      ctx.font = `bold ${descSize}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`💰 ${quest.reward.coins}`, rewardX, rewardY);
      ctx.shadowBlur = 0;

      if (quest.claimed) {
        ctx.fillStyle = '#00ff66';
        ctx.font = `bold ${descSize}px monospace`;
        ctx.fillText('✓ 已领取', rewardX, itemY + 36 * uiScale);
      } else if (quest.completed) {
        const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
        ctx.shadowBlur = 6 * pulse;
        ctx.shadowColor = '#ffd700';
        ctx.font = `bold ${descSize}px monospace`;
        ctx.fillText('🎁 可领取', rewardX, itemY + 36 * uiScale);
        ctx.shadowBlur = 0;
      }
    });

    const claimAllIdx = dailyQuests.length;
    const isClaimAllSelected = game.clubQuestCursor === claimAllIdx;
    const claimAllY = contentY + dailyQuests.length * itemH;
    const claimAllH = 44 * uiScale;
    const unclaimedCount = clubQuest.getUnclaimedCount();

    if (claimAllY + claimAllH < contentY + contentH) {
      const claimAllX = panelX + 10 * uiScale;
      const claimAllW = panelW - 20 * uiScale;

      if (isClaimAllSelected) {
        ctx.fillStyle = unclaimedCount > 0 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(50, 50, 70, 0.3)';
        ctx.beginPath();
        ctx.roundRect(claimAllX, claimAllY, claimAllW, claimAllH - 8 * uiScale, 8 * uiScale);
        ctx.fill();

        ctx.strokeStyle = unclaimedCount > 0 ? '#ffd700' : '#444';
        ctx.lineWidth = 2 * uiScale;
        if (unclaimedCount > 0) {
          ctx.shadowBlur = 10 * uiScale;
          ctx.shadowColor = '#ffd700';
        }
        ctx.beginPath();
        ctx.roundRect(claimAllX, claimAllY, claimAllW, claimAllH - 8 * uiScale, 8 * uiScale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const btnText = unclaimedCount > 0 ? `🎁 一键领取 (${unclaimedCount})` : '✅ 全部已领取';
      const textColor = unclaimedCount > 0 ? '#ffd700' : '#555';
      ctx.fillStyle = textColor;
      if (unclaimedCount > 0) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffd700';
      }
      ctx.font = `bold ${(isPortrait ? 12 : 14) * uiScale}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(btnText, panelX + panelW / 2, claimAllY + (claimAllH - 8 * uiScale) * 0.62);
      ctx.shadowBlur = 0;
    }
  }

  _drawStreakRewards(game, panelX, contentY, panelW, contentH, uiScale, isPortrait) {
    const ctx = this.ctx;
    const clubQuest = game.clubQuest;
    const streakMilestones = clubQuest.getStreakMilestones();
    const streakDays = clubQuest.getStreakDays();
    const itemH = 72 * uiScale;

    streakMilestones.forEach((milestone, idx) => {
      const isSelected = game.clubQuestCursor === idx;
      const itemY = contentY + idx * itemH;

      if (itemY + itemH < contentY || itemY > contentY + contentH) return;

      const itemX = panelX + 10 * uiScale;
      const itemW = panelW - 20 * uiScale;

      if (isSelected) {
        ctx.fillStyle = milestone.achieved ? 'rgba(255, 215, 0, 0.08)' : 'rgba(50, 50, 70, 0.2)';
        ctx.beginPath();
        ctx.roundRect(itemX, itemY, itemW, itemH - 8 * uiScale, 8 * uiScale);
        ctx.fill();

        const borderColor = milestone.claimed ? '#00ff66' : (milestone.achieved ? '#ffd700' : '#444');
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2 * uiScale;
        if (milestone.achieved) {
          ctx.shadowBlur = 10 * uiScale;
          ctx.shadowColor = borderColor;
        }
        ctx.beginPath();
        ctx.roundRect(itemX, itemY, itemW, itemH - 8 * uiScale, 8 * uiScale);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const iconSize = isPortrait ? 22 * uiScale : 26;
      ctx.font = `${iconSize}px monospace`;
      ctx.textAlign = 'left';
      const iconAlpha = milestone.achieved ? 1 : 0.4;
      ctx.globalAlpha = iconAlpha;
      ctx.fillText(milestone.icon, itemX + 14 * uiScale, itemY + 26 * uiScale);
      ctx.globalAlpha = 1;

      const nameSize = isPortrait ? 12 * uiScale : 14;
      const nameColor = milestone.achieved ? '#ffd700' : '#666';
      ctx.fillStyle = nameColor;
      ctx.shadowBlur = milestone.achieved && isSelected ? 8 : 0;
      ctx.shadowColor = '#ffd700';
      ctx.font = `bold ${nameSize}px monospace`;
      ctx.fillText(milestone.name, itemX + 48 * uiScale, itemY + 22 * uiScale);
      ctx.shadowBlur = 0;

      const daysSize = isPortrait ? 9 * uiScale : 10;
      ctx.fillStyle = milestone.achieved ? '#ffd700' : '#555';
      ctx.font = `${daysSize}px monospace`;
      ctx.fillText(`连续 ${milestone.days} 天`, itemX + 48 * uiScale, itemY + 38 * uiScale);

      const rewardY = itemY + 52 * uiScale;
      const rewardSize = isPortrait ? 10 * uiScale : 11;
      ctx.fillStyle = milestone.achieved ? '#ffd700' : '#555';
      ctx.font = `bold ${rewardSize}px monospace`;
      ctx.fillText(`💰 ${milestone.reward.coins}  ⭐ ${milestone.reward.xp} XP`, itemX + 48 * uiScale, rewardY);

      const progressPct = Math.min(100, (streakDays / milestone.days) * 100);
      const progressBarY = itemY + 58 * uiScale;
      const progressBarW = itemW - 60 * uiScale;
      const progressBarH = isPortrait ? 4 * uiScale : 5;
      const progressBarX = itemX + 48 * uiScale;

      ctx.fillStyle = 'rgba(50, 50, 80, 0.3)';
      ctx.beginPath();
      ctx.roundRect(progressBarX, progressBarY, progressBarW, progressBarH, progressBarH / 2);
      ctx.fill();

      const progressColor = milestone.achieved ? '#ffd700' : '#666';
      ctx.fillStyle = progressColor;
      const progressRatio = Math.min(1, progressPct / 100);
      ctx.beginPath();
      ctx.roundRect(progressBarX, progressBarY, progressBarW * progressRatio, progressBarH, progressBarH / 2);
      ctx.fill();

      const statusX = itemX + itemW - 12 * uiScale;
      ctx.textAlign = 'right';
      const statusSize = isPortrait ? 9 * uiScale : 10;
      ctx.font = `bold ${statusSize}px monospace`;

      if (milestone.claimed) {
        ctx.fillStyle = '#00ff66';
        ctx.fillText('✓ 已领取', statusX, itemY + 24 * uiScale);
      } else if (milestone.achieved) {
        const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
        ctx.shadowBlur = 6 * pulse;
        ctx.shadowColor = '#ffd700';
        ctx.fillText('🎁 可领取', statusX, itemY + 24 * uiScale);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#555';
        ctx.fillText(`${streakDays}/${milestone.days}天`, statusX, itemY + 24 * uiScale);
      }
    });
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

  drawSplitScreenHUD(game) {
    const ctx = this.ctx;
    const layout = this.getSplitLayout();
    const isHorizontal = layout.horizontal;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.track = game.track;

    const splitPadding = 8;
    const splitUiScale = isHorizontal ? 0.55 : 0.48;
    const splitSpeedW = 140 * splitUiScale;
    const splitSpeedH = 55 * splitUiScale;
    const bestLapW = 120 * splitUiScale;
    const bestLapH = 45 * splitUiScale;

    const rankings = game.getRankings();
    const p1RankInfo = rankings.find(r => r.bike.playerIndex === 1);
    const p2RankInfo = rankings.find(r => r.bike.playerIndex === 2);

    const p1 = { x: layout.p1OffsetX, y: layout.p1OffsetY, w: layout.viewportW, h: layout.viewportH };
    const p2 = { x: layout.p2OffsetX, y: layout.p2OffsetY, w: layout.viewportW, h: layout.viewportH };

    ctx.save();
    ctx.beginPath();
    ctx.rect(p1.x, p1.y, p1.w, p1.h);
    ctx.clip();
    this._drawSpeedometer(game.player, p1.x + splitPadding, p1.y + p1.h - splitSpeedH - splitPadding, splitUiScale);
    this.drawNitroHUD(game.player, p1.x + splitPadding, p1.y + p1.h - splitSpeedH - 38 * splitUiScale - splitPadding, splitUiScale);
    this._drawSplitLapInfo(game.player, game.totalLaps, p1.x + p1.w - 130 * splitUiScale - splitPadding, p1.y + splitPadding, splitUiScale);
    this._drawSplitTimer(game.raceTime, p1.x + p1.w / 2 - 60 * splitUiScale, p1.y + splitPadding, splitUiScale);
    this._drawSplitBestLap(game.player, game.raceTime, p1.x + p1.w / 2 - bestLapW / 2, p1.y + splitPadding + 36 * splitUiScale, splitUiScale);
    this._drawSplitPlayerLabel(1, game.player, p1.x + splitPadding, p1.y + splitPadding, splitUiScale);
    this._drawSplitRankBadge(p1RankInfo ? p1RankInfo.rank : -1, 1, p1.x + splitPadding + 56 * splitUiScale, p1.y + splitPadding, splitUiScale);
    this._drawSplitDriftIndicator(game.player, p1.x + p1.w - 130 * splitUiScale - splitPadding, p1.y + splitPadding + 56 * splitUiScale, splitUiScale, 1);
    this._drawSplitRouteIndicator(game.player, p1.y + p1.h - splitPadding - 30 * splitUiScale, splitUiScale, 1);
    this._drawSplitCollisionCounter(game.player, 1, p1.x + p1.w - 130 * splitUiScale - splitPadding, p1.y + splitPadding + 80 * splitUiScale, splitUiScale);
    if (game._isSplitScreen && game.player2) {
      this._drawSplitDistanceToOpponent(game.player, game.player2, p1RankInfo, p2RankInfo,
        p1.x + splitPadding, p1.y + p1.h - splitSpeedH - 90 * splitUiScale - splitPadding, splitUiScale, 1);
    }
    if (game.player.isNewLapRecord) {
      this._drawNewRecordOverlay(game.player, p1.x, p1.y, p1.w, p1.h);
    }
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(p2.x, p2.y, p2.w, p2.h);
    ctx.clip();
    if (game.player2) {
      this._drawSpeedometer(game.player2, p2.x + splitPadding, p2.y + p2.h - splitSpeedH - splitPadding, splitUiScale);
      this.drawNitroHUD(game.player2, p2.x + splitPadding, p2.y + p2.h - splitSpeedH - 38 * splitUiScale - splitPadding, splitUiScale);
      this._drawSplitLapInfo(game.player2, game.totalLaps, p2.x + p2.w - 130 * splitUiScale - splitPadding, p2.y + splitPadding, splitUiScale);
      this._drawSplitTimer(game.raceTime, p2.x + p2.w / 2 - 60 * splitUiScale, p2.y + splitPadding, splitUiScale);
      this._drawSplitBestLap(game.player2, game.raceTime, p2.x + p2.w / 2 - bestLapW / 2, p2.y + splitPadding + 36 * splitUiScale, splitUiScale);
      this._drawSplitPlayerLabel(2, game.player2, p2.x + splitPadding, p2.y + splitPadding, splitUiScale);
      this._drawSplitRankBadge(p2RankInfo ? p2RankInfo.rank : -1, 2, p2.x + splitPadding + 56 * splitUiScale, p2.y + splitPadding, splitUiScale);
      this._drawSplitDriftIndicator(game.player2, p2.x + p2.w - 130 * splitUiScale - splitPadding, p2.y + splitPadding + 56 * splitUiScale, splitUiScale, 2);
      this._drawSplitRouteIndicator(game.player2, p2.y + p2.h - splitPadding - 30 * splitUiScale, splitUiScale, 2);
      this._drawSplitCollisionCounter(game.player2, 2, p2.x + p2.w - 130 * splitUiScale - splitPadding, p2.y + splitPadding + 80 * splitUiScale, splitUiScale);
      this._drawSplitDistanceToOpponent(game.player2, game.player, p2RankInfo, p1RankInfo,
        p2.x + splitPadding, p2.y + p2.h - splitSpeedH - 90 * splitUiScale - splitPadding, splitUiScale, 2);
      if (game.player2.isNewLapRecord) {
        this._drawNewRecordOverlay(game.player2, p2.x, p2.y, p2.w, p2.h);
      }
    }
    ctx.restore();

    this._drawSplitRankings(rankings, game.player2 ? 2 : 1);

    if (game.player && game.player2) {
      this._drawDuelProximityWarning(game.player, game.player2, layout);
      this._drawLiveDuelStanding(game.player, game.player2, p1RankInfo, p2RankInfo, layout);
    }

    if (game._splitscreenGraceActive) {
      this._drawGracePeriodTimer(game, layout);
    }

    ctx.restore();

    if (game.player) this.drawNitroScreenOverlay(game.player, p1.x, p1.y, p1.w, p1.h);
    if (game.player2) this.drawNitroScreenOverlay(game.player2, p2.x, p2.y, p2.w, p2.h);
  }

  _drawSplitRankBadge(rank, playerIndex, x, y, scale) {
    const ctx = this.ctx;
    if (rank <= 0) return;

    const w = 42 * scale;
    const h = 22 * scale;
    const color = rank === 1 ? '#ffff00' : rank === 2 ? '#c0c0c0' : rank === 3 ? '#cd7f32' : '#888';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4 * scale);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 * scale;
    ctx.shadowBlur = 6 * scale;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = color;
    ctx.shadowBlur = 4 * scale;
    ctx.shadowColor = color;
    ctx.font = `bold ${11 * scale}px monospace`;
    ctx.textAlign = 'center';
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    ctx.fillText(`${medal}#${rank}`, x + w / 2, y + h * 0.72);
    ctx.shadowBlur = 0;
  }

  _drawSplitDistanceToOpponent(player, opponent, playerRank, opponentRank, x, y, scale, playerIndex) {
    const ctx = this.ctx;
    if (!opponent) return;

    const dist = Utils.distance(player.x, player.y, opponent.x, opponent.y);
    const isAhead = playerRank && opponentRank ? playerRank.rank < opponentRank.rank : false;
    const isTied = playerRank && opponentRank ? playerRank.rank === opponentRank.rank : false;

    const w = 140 * scale;
    const h = 28 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 5 * scale);
    ctx.fill();

    let statusColor = '#888';
    let statusText = '';
    if (isTied) {
      statusColor = '#ffff00';
      statusText = '⬌ 并驾齐驱';
    } else if (isAhead) {
      statusColor = '#00ff66';
      statusText = `▲ 领先 ${Math.floor(dist)}m`;
    } else {
      statusColor = '#ff6666';
      statusText = `▼ 落后 ${Math.floor(dist)}m`;
    }

    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1.2 * scale;
    ctx.shadowBlur = 4 * scale;
    ctx.shadowColor = statusColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 5 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = statusColor;
    ctx.shadowBlur = 3 * scale;
    ctx.shadowColor = statusColor;
    ctx.font = `bold ${10 * scale}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(statusText, x + 8 * scale, y + h * 0.68);
    ctx.shadowBlur = 0;

    const p1Progress = this.track ? this.track.getRouteProgress(player).distance / this.track.totalLength : 0;
    const p2Progress = this.track ? this.track.getRouteProgress(opponent).distance / this.track.totalLength : 0;
    const progressDelta = (p1Progress - p2Progress) * 100;
    const deltaText = progressDelta >= 0 ? `+${progressDelta.toFixed(1)}%` : `${progressDelta.toFixed(1)}%`;
    const deltaColor = progressDelta >= 0 ? '#00ff66' : '#ff6666';

    ctx.fillStyle = deltaColor;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(deltaText, x + w - 8 * scale, y + h * 0.68);
  }

  _drawLiveDuelStanding(p1, p2, p1Rank, p2Rank, layout) {
    const ctx = this.ctx;
    const isHorizontal = layout.horizontal;

    let barW, barH, barX, barY;
    if (isHorizontal) {
      barW = 120;
      barH = 10;
      barX = this.width / 2 - barW / 2;
      barY = layout.dividerY - barH / 2;
    } else {
      barW = 10;
      barH = 120;
      barX = layout.dividerX - barW / 2;
      barY = this.height / 2 - barH / 2;
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    if (isHorizontal) {
      ctx.roundRect(barX - 4, barY - 18, barW + 8, barH + 28, 6);
    } else {
      ctx.roundRect(barX - 18, barY - 4, barW + 28, barH + 8, 6);
    }
    ctx.fill();

    const p1Progress = this.track ? ((p1.lap + this.track.getRouteProgress(p1).distance / this.track.totalLength) / (p1.lap + 1)) : 0.5;
    const p2Progress = this.track ? ((p2.lap + this.track.getRouteProgress(p2).distance / this.track.totalLength) / (p2.lap + 1)) : 0.5;

    const avgProgress = (p1Progress + p2Progress) / 2;
    const balance = avgProgress > 0 ? ((p1Progress - avgProgress) / avgProgress) * 0.5 + 0.5 : 0.5;
    const clampedBalance = Utils.clamp(balance, 0.05, 0.95);

    if (isHorizontal) {
      ctx.fillStyle = 'rgba(0, 245, 255, 0.15)';
      ctx.fillRect(barX, barY, barW / 2, barH);
      ctx.fillStyle = 'rgba(255, 0, 255, 0.15)';
      ctx.fillRect(barX + barW / 2, barY, barW / 2, barH);
    } else {
      ctx.fillStyle = 'rgba(0, 245, 255, 0.15)';
      ctx.fillRect(barX, barY, barW, barH / 2);
      ctx.fillStyle = 'rgba(255, 0, 255, 0.15)';
      ctx.fillRect(barX, barY + barH / 2, barW, barH / 2);
    }

    ctx.fillStyle = '#333';
    if (isHorizontal) ctx.fillRect(barX, barY, barW, barH);
    else ctx.fillRect(barX, barY, barW, barH);

    if (isHorizontal) {
      if (clampedBalance < 0.5) {
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff00ff';
        ctx.fillRect(barX + barW * clampedBalance, barY, barW * (0.5 - clampedBalance) + barW / 2, barH);
      } else {
        ctx.fillStyle = '#00f5ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00f5ff';
        ctx.fillRect(barX, barY, barW * clampedBalance, barH);
      }
    } else {
      if (clampedBalance < 0.5) {
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff00ff';
        ctx.fillRect(barX, barY + barH * clampedBalance, barW, barH * (0.5 - clampedBalance) + barH / 2);
      } else {
        ctx.fillStyle = '#00f5ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00f5ff';
        ctx.fillRect(barX, barY, barW, barH * clampedBalance);
      }
    }
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(barX + barW / 2, barY);
      ctx.lineTo(barX + barW / 2, barY + barH);
    } else {
      ctx.moveTo(barX, barY + barH / 2);
      ctx.lineTo(barX + barW, barY + barH / 2);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#00f5ff';
    ctx.font = 'bold 10px monospace';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#00f5ff';
    if (isHorizontal) {
      ctx.textAlign = 'left';
      ctx.fillText('◄ P1', barX - 4, barY - 5);
    } else {
      ctx.textAlign = 'center';
      ctx.fillText('▲', barX + barW / 2, barY - 5);
      ctx.font = 'bold 9px monospace';
      ctx.fillText('P1', barX + barW / 2, barY - 16);
    }
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 10px monospace';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ff00ff';
    if (isHorizontal) {
      ctx.textAlign = 'right';
      ctx.fillText('P2 ►', barX + barW + 4, barY - 5);
    } else {
      ctx.textAlign = 'center';
      ctx.fillText('▼', barX + barW / 2, barY + barH + 12);
      ctx.font = 'bold 9px monospace';
      ctx.fillText('P2', barX + barW / 2, barY + barH + 25);
    }
    ctx.shadowBlur = 0;

    const rank1 = p1Rank ? p1Rank.rank : -1;
    const rank2 = p2Rank ? p2Rank.rank : -1;
    if (rank1 > 0 && rank2 > 0) {
      ctx.fillStyle = rank1 < rank2 ? '#ffff00' : (rank1 === rank2 ? '#ffff00' : '#888');
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      const text = rank1 < rank2 ? 'P1 LEADS' : (rank2 < rank1 ? 'P2 LEADS' : 'TIED');
      if (isHorizontal) {
        ctx.fillText(text, barX + barW / 2, barY + barH + 12);
      } else {
        ctx.fillText(text, barX + barW + 22, barY + barH / 2);
      }
    }

    ctx.restore();
  }

  _drawGracePeriodTimer(game, layout) {
    const ctx = this.ctx;
    const remaining = Math.max(0, game._splitscreenGraceTimer);
    const duration = game._splitscreenGraceDuration || 30000;
    const progress = remaining / duration;
    const finisher = game._splitscreenFirstFinisher || 0;
    const color = finisher === 1 ? '#00f5ff' : '#ff00ff';
    const isHorizontal = layout.horizontal;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    let timerW, timerH, timerX, timerY;
    if (isHorizontal) {
      timerW = 280;
      timerH = 52;
      timerX = this.width / 2 - timerW / 2;
      timerY = layout.dividerY - timerH / 2;
    } else {
      timerW = 52;
      timerH = 280;
      timerX = layout.dividerX - timerW / 2;
      timerY = this.height / 2 - timerH / 2;
    }

    const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;

    ctx.fillStyle = `rgba(10, 10, 26, ${0.85 + pulse * 0.1})`;
    ctx.beginPath();
    ctx.roundRect(timerX - 4, timerY - 4, timerW + 8, timerH + 8, 10);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 20 * pulse;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.roundRect(timerX - 4, timerY - 4, timerW + 8, timerH + 8, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const seconds = Math.ceil(remaining / 1000);
    ctx.fillStyle = color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.textAlign = 'center';
    if (isHorizontal) {
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`⏱ ${seconds}s`, this.width / 2, timerY + 28);
    } else {
      ctx.save();
      ctx.translate(layout.dividerX, this.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`⏱ ${seconds}s`, 0, 10);
      ctx.restore();
    }
    ctx.shadowBlur = 0;

    if (isHorizontal) {
      const barPadX = 12;
      const barY = timerY + 34;
      const barH2 = 6;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(timerX + barPadX, barY, timerW - barPadX * 2, barH2);

      ctx.fillStyle = color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;
      ctx.fillRect(timerX + barPadX, barY, (timerW - barPadX * 2) * progress, barH2);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ccc';
      ctx.font = '10px monospace';
      ctx.fillText(`P${finisher} 已冲线 · 等待对手完成`, this.width / 2, timerY - 10);
    } else {
      const barPadY = 12;
      const barX = timerX + 22;
      const barW2 = 8;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(barX, timerY + barPadY, barW2, timerH - barPadY * 2);

      ctx.fillStyle = color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;
      const barStart = timerY + barPadY;
      ctx.fillRect(barX, barStart + (1 - progress) * (timerH - barPadY * 2), barW2, (timerH - barPadY * 2) * progress);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ccc';
      ctx.font = '10px monospace';
      ctx.save();
      ctx.translate(layout.dividerX + 38, this.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(`P${finisher} 已冲线 · 等待对手完成`, 0, -6);
      ctx.restore();
    }
    ctx.restore();
  }

  _drawSplitCollisionCounter(player, playerIndex, x, y, scale) {
    const ctx = this.ctx;
    const collisions = player.bikeCollisions || 0;
    const w = 80 * scale;
    const h = 20 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3 * scale);
    ctx.fill();

    const color = collisions === 0 ? '#00ff66' : collisions < 3 ? '#ffaa00' : '#ff3300';
    ctx.fillStyle = color;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('⚡', x + 4 * scale, y + h * 0.75);
    ctx.fillText(`${collisions}`, x + 16 * scale, y + h * 0.75);
  }

  _drawDuelProximityWarning(player1, player2, layout) {
    const ctx = this.ctx;
    const dist = Utils.distance(player1.x, player1.y, player2.x, player2.y);

    if (dist < 200) {
      const intensity = 1 - (dist / 200);
      const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
      const alpha = intensity * 0.25 * pulse;
      const isHorizontal = layout.horizontal;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      ctx.fillStyle = `rgba(255, 0, 100, ${alpha})`;
      if (isHorizontal) {
        ctx.fillRect(0, 0, this.width, 3);
        ctx.fillRect(0, this.height - 3, this.width, 3);
      } else {
        ctx.fillRect(0, 0, 3, this.height);
        ctx.fillRect(this.width - 3, 0, 3, this.height);
      }

      if (dist < 80) {
        ctx.fillStyle = `rgba(255, 0, 100, ${alpha * 1.5})`;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff0066';
        const labelY = isHorizontal ? (this.height / 2 + 30) : (layout.dividerX + 40);
        const labelX = isHorizontal ? this.width / 2 : (this.width / 2);
        if (!isHorizontal) {
          ctx.save();
          ctx.translate(labelX, layout.dividerX + 30);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText('DUEL!', 0, 0);
          ctx.restore();
        } else {
          ctx.fillText('DUEL!', labelX, labelY);
        }
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }
  }

  _drawSplitPlayerLabel(playerIndex, player, x, y, scale) {
    const ctx = this.ctx;
    const label = playerIndex === 1 ? 'P1' : 'P2';
    const color = playerIndex === 1 ? '#00f5ff' : '#ff00ff';
    const w = 48 * scale;
    const h = 22 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4 * scale);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * scale;
    ctx.shadowBlur = 8 * scale;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = color;
    ctx.shadowBlur = 4 * scale;
    ctx.shadowColor = color;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h * 0.75);
    ctx.shadowBlur = 0;
  }

  _drawSplitLapInfo(player, totalLaps, x, y, scale) {
    const ctx = this.ctx;
    const displayLap = Math.min(player.lap + 1, totalLaps);
    const currentRoute = this.track ? this.track.getRoute(player.currentRouteId) : null;
    const numCheckpoints = currentRoute ? currentRoute.checkpoints.length : 6;

    const w = 120 * scale;
    const h = 48 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * scale);
    ctx.fill();

    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1.5 * scale;
    ctx.shadowBlur = 6 * scale;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${13 * scale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`LAP ${displayLap}/${totalLaps}`, x + w / 2, y + h * 0.45);

    ctx.fillStyle = '#888';
    ctx.font = `${9 * scale}px monospace`;
    ctx.fillText(`CP:${player.checkpoint + 1}/${numCheckpoints}`, x + w / 2, y + h * 0.72);
  }

  _drawSplitTimer(time, x, y, scale) {
    const ctx = this.ctx;
    const w = 120 * scale;
    const h = 30 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * scale);
    ctx.fill();

    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1.5 * scale;
    ctx.shadowBlur = 6 * scale;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffff00';
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(Utils.formatTime(time), x + w / 2, y + h * 0.72);
  }

  _drawSplitBestLap(player, raceTime, x, y, scale) {
    const ctx = this.ctx;
    const w = 120 * scale;
    const h = 28 * scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * scale);
    ctx.fill();

    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 1.5 * scale;
    ctx.shadowBlur = 6 * scale;
    ctx.shadowColor = '#00ff66';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#00ff66';
    ctx.font = `${8 * scale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('BEST', x + w / 2, y + h * 0.38);

    const bestTime = player.bestLapTime < Infinity ? Utils.formatTime(player.bestLapTime) : '--:--:--';
    ctx.fillStyle = '#00ff66';
    ctx.font = `bold ${10 * scale}px monospace`;
    ctx.fillText(bestTime, x + w / 2, y + h * 0.78);
  }

  _drawSplitRankings(rankings, playerCount) {
    const ctx = this.ctx;
    const halfH = this.height / 2;
    const scale = 0.5;
    const x = this.width - 110 * scale - 8;
    const w = 110 * scale;
    const itemH = 18 * scale;

    for (let pi = 0; pi < playerCount; pi++) {
      const baseY = pi === 0 ? 8 : halfH + 8;
      const h = 24 * scale + Math.min(rankings.length, 5) * itemH;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(x, baseY, w, h, 6 * scale);
      ctx.fill();

      ctx.strokeStyle = pi === 0 ? '#00f5ff' : '#ff00ff';
      ctx.lineWidth = 1.5 * scale;
      ctx.shadowBlur = 6 * scale;
      ctx.shadowColor = pi === 0 ? '#00f5ff' : '#ff00ff';
      ctx.beginPath();
      ctx.roundRect(x, baseY, w, h, 6 * scale);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${10 * scale}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('排名', x + 8 * scale, baseY + 16 * scale);

      const visible = rankings.slice(0, 5);
      visible.forEach((r, i) => {
        const bike = r.bike;
        const ry = baseY + 24 * scale + i * itemH;
        const isP1 = bike.isPlayer && bike.playerIndex === 1;
        const isP2 = bike.isPlayer && bike.playerIndex === 2;

        ctx.fillStyle = isP1 ? '#00f5ff' : isP2 ? '#ff00ff' : '#888';
        ctx.font = `${9 * scale}px monospace`;
        ctx.fillText(`${i + 1}.`, x + 8 * scale, ry);

        ctx.fillStyle = bike.color;
        ctx.fillRect(x + 26 * scale, ry - 6 * scale, 6 * scale, 6 * scale);

        ctx.fillStyle = isP1 ? 'P1' : isP2 ? 'P2' : '#aaa';
        ctx.font = `${8 * scale}px monospace`;
        ctx.fillText(isP1 ? 'P1' : isP2 ? 'P2' : `AI`, x + 38 * scale, ry);
      });
    }
  }

  drawSplitscreenFinished(game) {
    const ctx = this.ctx;
    const data = game._splitscreenResultData;
    if (!data) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'rgba(10, 10, 26, 0.96)';
    ctx.fillRect(0, 0, this.width, this.height);

    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();

    const panelW = isPortrait ? Math.min(380 * uiScale, this.width * 0.94) : Math.min(780, this.width * 0.94);
    const panelH = isPortrait ? 680 * uiScale : 600;
    const panelX = (this.width - panelW) / 2;
    const panelY = Math.max(10, (this.height - panelH) / 2);

    const p1Color = '#00f5ff';
    const p2Color = '#ff00ff';
    const winBorderColor = data.winner === 1 ? p1Color : data.winner === 2 ? p2Color : '#ffff00';

    ctx.fillStyle = 'rgba(15, 15, 30, 0.96)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 16);
    ctx.fill();

    ctx.strokeStyle = winBorderColor;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 30;
    ctx.shadowColor = winBorderColor;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 16);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const grad = ctx.createLinearGradient(panelX, panelY, panelX + panelW, panelY);
    grad.addColorStop(0, `${p1Color}25`);
    grad.addColorStop(0.5, 'transparent');
    grad.addColorStop(1, `${p2Color}25`);
    ctx.fillStyle = grad;
    ctx.fillRect(panelX, panelY, panelW, isPortrait ? 90 * uiScale : 80);

    const titleSize = isPortrait ? 24 * uiScale : 30;
    ctx.fillStyle = winBorderColor;
    ctx.shadowBlur = 20;
    ctx.shadowColor = winBorderColor;
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('DUEL RESULT', this.width / 2, panelY + (isPortrait ? 38 * uiScale : 42));
    ctx.shadowBlur = 0;

    const subtitleSize = isPortrait ? 16 * uiScale : 20;
    if (data.winner === 0) {
      ctx.fillStyle = '#ffff00';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffff00';
      ctx.font = `bold ${subtitleSize}px monospace`;
      ctx.fillText('⚡ DRAW ⚡', this.width / 2, panelY + (isPortrait ? 68 * uiScale : 70));
      ctx.shadowBlur = 0;
    } else {
      const winColor = data.winner === 1 ? p1Color : p2Color;
      ctx.fillStyle = winColor;
      ctx.shadowBlur = 12;
      ctx.shadowColor = winColor;
      ctx.font = `bold ${subtitleSize}px monospace`;
      ctx.fillText(`🏆 PLAYER ${data.winner} WINS! 🏆`, this.width / 2, panelY + (isPortrait ? 68 * uiScale : 70));
      ctx.shadowBlur = 0;
    }

    if (data.gracePeriodUsed) {
      const hintSize = isPortrait ? 10 * uiScale : 11;
      ctx.fillStyle = '#ffaa00';
      ctx.font = `${hintSize}px monospace`;
      const firstFinisherText = data.firstFinisher ? ` P${data.firstFinisher}率先冲线` : '';
      ctx.fillText(`[宽限模式]${firstFinisherText} | 差距: ${data.timeDeltaFormatted}`, this.width / 2, panelY + (isPortrait ? 86 * uiScale : 88));
    }

    const contentStartY = panelY + (isPortrait ? 100 * uiScale : 95);
    const menuHeight = isPortrait ? 130 * uiScale : 110;
    const contentEndY = panelY + panelH - menuHeight;

    if (isPortrait) {
      this._drawSplitResultVertical(ctx, panelX + 16 * uiScale, contentStartY, panelW - 32 * uiScale, contentEndY - contentStartY, data, p1Color, p2Color);
    } else {
      this._drawSplitResultHorizontal(ctx, panelX + 20, contentStartY, panelW - 40, contentEndY - contentStartY, data, p1Color, p2Color);
    }

    const menuY = contentEndY + (isPortrait ? 10 * uiScale : 10);
    this._drawSplitscreenFinishedMenu(ctx, panelX + 20, menuY, panelW - 40, menuHeight - 20, game);

    ctx.restore();
  }

  _drawSplitResultHorizontal(ctx, x, y, w, h, data, p1Color, p2Color) {
    const colW = (w - 50) / 2;
    const p1ColX = x;
    const p2ColX = x + w - colW;

    this._drawPlayerResultCard(ctx, p1ColX, y, colW, h, 'P1', data.player1, p1Color, 1, data);

    const dividerX = x + w / 2;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(dividerX, y);
    ctx.lineTo(dividerX, y + h - 50);
    ctx.stroke();
    ctx.setLineDash([]);

    const vsY = y + 30;
    ctx.fillStyle = '#555';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff0066';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VS', dividerX, vsY);
    ctx.shadowBlur = 0;

    this._drawPlayerResultCard(ctx, p2ColX, y, colW, h, 'P2', data.player2, p2Color, 2, data);

    const duelY = y + h - 40;
    this._drawDuelSummary(ctx, x, duelY, w, 40, data, p1Color, p2Color);
  }

  _drawSplitResultVertical(ctx, x, y, w, h, data, p1Color, p2Color) {
    const cardH = (h - 80) / 2;

    this._drawPlayerResultCard(ctx, x, y, w, cardH, 'P1', data.player1, p1Color, 1, data);

    const vsY = y + cardH + 15;
    ctx.fillStyle = '#555';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0066';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('═ VS ═', x + w / 2, vsY);
    ctx.shadowBlur = 0;

    this._drawPlayerResultCard(ctx, x, vsY + 25, w, cardH, 'P2', data.player2, p2Color, 2, data);

    const duelY = y + cardH * 2 + 60;
    this._drawDuelSummary(ctx, x, duelY, w, h - (cardH * 2 + 80), data, p1Color, p2Color);
  }

  _drawPlayerResultCard(ctx, x, y, w, h, label, pd, color, playerIndex, data) {
    const vehicle = VehicleTypes[pd.vehicle];
    const catWins = data.categoryWins || {};

    const isWinner = data.winner === playerIndex;
    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();
    const scale = isPortrait ? uiScale : 1;

    ctx.fillStyle = color;
    ctx.shadowBlur = isWinner ? 15 : 8;
    ctx.shadowColor = color;
    ctx.font = `bold ${16 * scale}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`${label} - ${pd.vehicleName}`, x + 10, y + 20 * scale);
    ctx.shadowBlur = 0;

    if (isWinner) {
      ctx.fillStyle = '#ffff00';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffff00';
      ctx.font = `bold ${12 * scale}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('👑 WINNER', x + w - 10, y + 20 * scale);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#888';
      ctx.font = `bold ${12 * scale}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`#${pd.rank}`, x + w - 10, y + 20 * scale);
    }

    const bgColor = isWinner ? `${color}18` : 'rgba(25, 25, 45, 0.6)';
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y + 28 * scale, w, h - 30 * scale, 8);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.shadowBlur = isWinner ? 6 : 3;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.roundRect(x, y + 28 * scale, w, h - 30 * scale, 8);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const statRows = [
      { label: '总用时', pd: pd.timeFormatted, p1Cat: 'speed', vColor: '#ffff00' },
      { label: '最佳圈', pd: pd.bestLapFormatted, p1Cat: 'bestLap', vColor: '#00ff66' },
      { label: '完成圈', pd: `${pd.lapsCompleted}/${data.totalLaps}`, p1Cat: null, vColor: '#fff' },
      { label: '碰撞', pd: `${pd.collisions}次`, p1Cat: 'clean', vColor: pd.collisions === 0 ? '#00ff66' : '#ff6600' },
      { label: '对抗碰撞', pd: `${pd.duelCollisions}次`, p1Cat: null, vColor: pd.duelCollisions === 0 ? '#888' : '#ff00aa' },
      { label: '撞飞对手', pd: `${pd.duelTakedowns}次`, p1Cat: 'aggression', vColor: '#ff6600' },
      { label: '摧毁障碍', pd: `${pd.obstaclesDestroyed}`, p1Cat: 'aggression', vColor: '#ffaa00' },
      { label: '漂移距离', pd: `${Math.floor(pd.driftDistance)}m`, p1Cat: 'drift', vColor: '#ff00ff' },
      { label: '氮气时长', pd: `${pd.nitroTime.toFixed(1)}s`, p1Cat: 'nitro', vColor: '#00f5ff' },
      { label: '综合得分', pd: `${pd.score.toLocaleString()}`, p1Cat: null, vColor: data.totalScoreWinner === playerIndex ? '#ffff00' : '#ffffff', isBold: true }
    ];

    const rows = Math.min(statRows.length, Math.floor((h - 40 * scale) / (18 * scale)));
    const rowH = (h - 40 * scale) / rows;
    let infoY = y + 48 * scale;

    for (let i = 0; i < rows; i++) {
      const row = statRows[i];
      if (!row) break;

      ctx.fillStyle = '#777';
      ctx.font = `${10 * scale}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(row.label, x + 12, infoY + 6 * scale);

      let suffix = '';
      if (row.p1Cat && catWins[row.p1Cat] === playerIndex) suffix = ' ★';
      else if (row.p1Cat && catWins[row.p1Cat] !== 0 && catWins[row.p1Cat] !== undefined) suffix = '';
      else if (row.p1Cat && catWins[row.p1Cat] === 0) suffix = ' =';

      ctx.fillStyle = row.vColor;
      ctx.font = `bold ${row.isBold ? 13 : 11}${' '}${scale}px monospace`;
      ctx.shadowBlur = row.isBold ? 6 : 0;
      ctx.shadowColor = row.vColor;
      ctx.textAlign = 'right';
      ctx.fillText(row.pd + suffix, x + w - 12, infoY + 6 * scale);
      ctx.shadowBlur = 0;

      infoY += rowH;
    }
  }

  _drawDuelSummary(ctx, x, y, w, h, data, p1Color, p2Color) {
    const duelStats = data.duelStats || {};
    const totalDuel = duelStats.totalDuelCollisions || 0;
    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();
    const scale = isPortrait ? uiScale : 1;

    ctx.fillStyle = 'rgba(255, 100, 50, 0.06)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h - 5 * scale, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 100, 50, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h - 5 * scale, 6);
    ctx.stroke();

    const summaryText = [];
    summaryText.push(`🔥 对抗碰撞: ${totalDuel}`);

    const p1Wins = Object.values(data.categoryWins || {}).filter(v => v === 1).length;
    const p2Wins = Object.values(data.categoryWins || {}).filter(v => v === 2).length;
    summaryText.push(`📊 数据维度 P1:${p1Wins}胜 / P2:${p2Wins}胜`);

    if (data.totalScoreWinner !== 0) {
      summaryText.push(`⭐ 综合评分 P${data.totalScoreWinner}领先`);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = `${11 * scale}px monospace`;
    ctx.textAlign = 'center';
    summaryText.forEach((txt, i) => {
      const lineY = y + (i + 1) * (h / (summaryText.length + 0.5));
      ctx.fillText(txt, x + w / 2, lineY);
    });
  }

  _drawSplitscreenFinishedMenu(ctx, x, y, w, h, game) {
    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();
    const scale = isPortrait ? uiScale : 1;
    const cursor = game._splitscreenMenuCursor || 0;

    const items = [
      { label: '🔄 再来一局', color: '#00ff66' },
      { label: '🚗 更换车型', color: '#ffff00' },
      { label: '🏠 返回菜单', color: '#ff6666' }
    ];

    const itemCount = items.length;
    const spacing = isPortrait ? 8 * uiScale : 12;
    const itemW = isPortrait ? w : (w - spacing * (itemCount - 1)) / itemCount;
    const itemH = isPortrait ? (h - spacing * (itemCount - 1)) / itemCount : h;
    const layoutHorizontal = !isPortrait;

    for (let i = 0; i < itemCount; i++) {
      const item = items[i];
      const ix = layoutHorizontal ? x + i * (itemW + spacing) : x;
      const iy = layoutHorizontal ? y : y + i * (itemH + spacing);
      const isSelected = i === cursor;

      ctx.fillStyle = isSelected ? `${item.color}20` : 'rgba(40, 40, 60, 0.6)';
      ctx.beginPath();
      ctx.roundRect(ix, iy, itemW, itemH, 8);
      ctx.fill();

      ctx.strokeStyle = isSelected ? item.color : 'rgba(100, 100, 150, 0.3)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.shadowBlur = isSelected ? 12 : 0;
      ctx.shadowColor = item.color;
      ctx.beginPath();
      ctx.roundRect(ix, iy, itemW, itemH, 8);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = isSelected ? item.color : '#ccc';
      ctx.shadowBlur = isSelected ? 6 : 0;
      ctx.shadowColor = item.color;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, ix + itemW / 2, iy + itemH / 2);
      ctx.shadowBlur = 0;
      ctx.textBaseline = 'alphabetic';

      if (isSelected) {
        ctx.fillStyle = item.color;
        ctx.font = `${11 * scale}px monospace`;
        ctx.fillText('◀ 确认 ▶', ix + itemW / 2, iy + itemH + (layoutHorizontal ? 0 : -4));
      }
    }

    const hintY = layoutHorizontal ? y + h + 18 : y + h + 8;
    const blink = Math.sin(Date.now() * 0.004) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(136, 136, 136, ${blink})`;
    ctx.font = `${11 * scale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('↑↓选择  空格/回车确认  ESC返回', x + w / 2, hintY);
  }

  drawVehicleSelectP2(game) {
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
    ctx.fillText('P2 车辆选择', centerX, titleY);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#888';
    ctx.font = `${subtitleSize}px monospace`;
    ctx.fillText('← → 切换  空格/回车 确认  ESC 返回', centerX, titleY + (isPortrait ? 22 * uiScale : 28));

    ctx.fillStyle = '#00f5ff';
    ctx.font = `${subtitleSize}px monospace`;
    ctx.fillText('P1: WASD+Shift/Q  |  P2: 方向键+Enter//', centerX, titleY + (isPortrait ? 38 * uiScale : 48));

    const selectedKey = VehicleTypeKeys[game.vehicleSelectCursorP2];
    const selectedVehicle = VehicleTypes[selectedKey];
    const isCurrentVehicle = selectedKey === game.selectedVehicleP2;

    if (isPortrait) {
      this._drawVehicleSelectPortraitP2(game, selectedKey, selectedVehicle, isCurrentVehicle, uiScale, centerX, centerY);
    } else {
      this._drawVehicleSelectLandscapeP2(game, selectedKey, selectedVehicle, isCurrentVehicle, uiScale, centerX, centerY);
    }

    ctx.restore();
  }

  _drawVehicleSelectLandscapeP2(game, selectedKey, selectedVehicle, isCurrentVehicle, uiScale, centerX, centerY) {
    const previewPanelX = 60;
    const previewPanelY = 100;
    const previewPanelW = 380;
    const previewPanelH = this.height - 180;

    const listPanelX = previewPanelX + previewPanelW + 30;
    const listPanelY = 100;
    const listPanelW = this.width - listPanelX - 60;
    const listPanelH = this.height - 180;

    this._drawPreviewPanel(previewPanelX, previewPanelY, previewPanelW, previewPanelH, selectedVehicle, isCurrentVehicle);
    this._drawVehicleListPanelP2(listPanelX, listPanelY, listPanelW, listPanelH, game, selectedKey);
    this._drawActionButtonsP2(this.width / 2 - 160, this.height - 65, 320, game, selectedVehicle, selectedKey);
  }

  _drawVehicleSelectPortraitP2(game, selectedKey, selectedVehicle, isCurrentVehicle, uiScale, centerX, centerY) {
    const previewH = 200 * uiScale;
    const previewY = 70 * uiScale;
    const previewW = Math.min(340 * uiScale, this.width * 0.9);
    const previewX = centerX - previewW / 2;

    const listY = previewY + previewH + 15 * uiScale;
    const listH = this.height - listY - 100 * uiScale;
    const listW = Math.min(360 * uiScale, this.width * 0.92);
    const listX = centerX - listW / 2;

    this._drawPreviewPanel(previewX, previewY, previewW, previewH, selectedVehicle, isCurrentVehicle);
    this._drawVehicleListPanelP2(listX, listY, listW, listH, game, selectedKey);
    this._drawActionButtonsP2(centerX - 140 * uiScale, this.height - 75 * uiScale, 280 * uiScale, game, selectedVehicle, selectedKey);
  }

  _drawVehicleListPanelP2(x, y, w, h, game, selectedKey) {
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
    ctx.fillStyle = '#ff00ff';
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('P2 车型列表', x + 18, y + 30);

    const itemCount = VehicleTypeKeys.length;
    const itemGap = isPortrait ? 8 * uiScale : 10;
    const itemH = isPortrait ? 58 * uiScale : 65;
    const totalItemH = itemCount * itemH + (itemCount - 1) * itemGap;
    const startY = y + 50 + (h - 60 - totalItemH) / 2;

    VehicleTypeKeys.forEach((key, idx) => {
      const vehicle = VehicleTypes[key];
      const iy = startY + idx * (itemH + itemGap);
      const isSelected = key === selectedKey;
      const isCurrent = key === game.selectedVehicleP2;

      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 0, 255, 0.08)';
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
        ctx.fillStyle = 'rgba(255, 0, 255, 0.15)';
        ctx.beginPath();
        ctx.roundRect(x + w - badgeW - 20, iy + itemH / 2 - badgeH / 2, badgeW, badgeH, 4);
        ctx.fill();
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x + w - badgeW - 20, iy + itemH / 2 - badgeH / 2, badgeW, badgeH, 4);
        ctx.stroke();
        ctx.fillStyle = '#ff00ff';
        ctx.font = `bold 9px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('P2', x + w - badgeW / 2 - 20, iy + itemH / 2 + 3);
      }
    });

    const hintSize = isPortrait ? 9 * uiScale : 10;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ 或 点击选择P2车辆', x + w / 2, y + h - 15);
  }

  _drawActionButtonsP2(x, y, w, game, selectedVehicle, selectedKey) {
    const ctx = this.ctx;
    const isPortrait = this.isPortrait();
    const uiScale = this._getUIScale();
    const btnH = isPortrait ? 40 * uiScale : 44;
    const btnGap = isPortrait ? 12 * uiScale : 16;
    const btnW = (w - btnGap) / 2;

    const cancelX = x;
    const confirmX = x + btnW + btnGap;

    this._drawVehicleButton(cancelX, y, btnW, btnH, '返回', '#666', '#444', false);
    this._drawVehicleButton(confirmX, y, btnW, btnH, 'P2确认', selectedVehicle.color, selectedVehicle.accentColor, true);

    const hintSize = isPortrait ? 10 * uiScale : 11;
    ctx.fillStyle = '#555';
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('ESC 返回  |  空格/回车 P2确认', x + w / 2, y + btnH + 18);
  }
}
