class Bike {
  constructor(x, y, angle, color, isPlayer = false) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 0;
    this.maxSpeed = 320;
    this.baseMaxSpeed = 320;
    this.acceleration = 200;
    this.baseAcceleration = 200;
    this.brakePower = 350;
    this.friction = 0.8;
    this.offTrackFriction = 3.5;
    this.steerSpeed = 2.8;
    this.driftAngle = 0;
    this.driftFactor = 0;
    this.isOnTrack = true;
    this.color = color;
    this.isPlayer = isPlayer;

    this.lap = 0;
    this.checkpoint = 0;
    this.raceTime = 0;
    this.finished = false;
    this.bestLapTime = Infinity;
    this.lastLapTime = 0;
    this.lapTimes = [];
    this.isNewLapRecord = false;
    this.newRecordTimer = 0;
    this.currentRouteId = 'main';
    this.routeCheckpoints = new Map();
    this.routeChangeCooldown = 0;
    this.takenRoutes = [];
    this.activeBranchHint = null;
    this.selectedRouteAtBranch = null;
    this.branchChoiceLocked = false;

    this.wheelBase = 24;
    this.width = 14;

    this.skidMarks = [];
    this.particles = [];

    this.obstacleCollisions = 0;
    this.obstaclesDestroyed = 0;
    this.bikeCollisions = 0;
    this.obstacleHitCooldown = 0;
    this._addExplosionParticles = null;
    this._addHitParticles = null;

    this.nitroEnergy = 0;
    this.nitroMaxEnergy = 100;
    this.nitroActive = false;
    this.nitroDuration = 0;
    this.nitroMaxDuration = 3.0;
    this.nitroCooldown = 0;
    this.nitroSpeedBoost = 1.6;
    this.nitroAccelBoost = 2.5;
    this.nitroChargeRate = 18;
    this.nitroConsumeRate = 40;
    this.nitroBurstTimer = 0;
    this.nitroReadyPulse = 0;
    this.prevNitroActive = false;

    this.totalDriftDistance = 0;
    this.totalNitroTime = 0;
  }

  update(dt, input, track) {
    if (this.finished) return;

    if (this.routeChangeCooldown > 0) {
      this.routeChangeCooldown -= dt;
    }
    if (this.obstacleHitCooldown > 0) {
      this.obstacleHitCooldown -= dt;
    }

    this.prevNitroActive = this.nitroActive;
    this._updateNitro(dt, input);

    const currentAccel = this.acceleration * (this.nitroActive ? this.nitroAccelBoost : 1);
    const currentMaxSpeed = this.baseMaxSpeed * (this.nitroActive ? this.nitroSpeedBoost : 1);

    if (input.accel) {
      this.speed = Math.min(this.speed + currentAccel * dt, currentMaxSpeed);
    }
    if (input.brake) {
      this.speed = Math.max(this.speed - this.brakePower * dt, -this.baseMaxSpeed * 0.3);
    }

    const trackOffset = track.getTrackOffset(this.x, this.y, this.currentRouteId);
    this.isOnTrack = Math.abs(trackOffset.offset) <= track.width / 2;

    const friction = this.isOnTrack ? this.friction : this.offTrackFriction;
    this.speed *= 1 - friction * dt;

    const displayMaxSpeed = this.nitroActive ? currentMaxSpeed : this.baseMaxSpeed;
    const speedRatio = Math.abs(this.speed) / displayMaxSpeed;
    this.maxSpeed = displayMaxSpeed;

    let steerInput = 0;
    if (input.left) steerInput -= 1;
    if (input.right) steerInput += 1;

    const steerAmount = this.steerSpeed * steerInput * speedRatio * dt;
    this.angle += steerAmount;

    this._updateDrift(steerInput, speedRatio, dt, this.isOnTrack);

    const moveAngle = this.angle + this.driftAngle;
    this.x += Math.cos(moveAngle) * this.speed * dt;
    this.y += Math.sin(moveAngle) * this.speed * dt;

    if (this.driftFactor > 0.5 && Math.abs(this.speed) > 50) {
      this.totalDriftDistance += Math.abs(this.speed) * this.driftFactor * dt;
    }

    this._addSkidMarks(this.isOnTrack, speedRatio, steerInput);

    if (this.nitroActive) {
      this._addNitroParticles();
    }

    if (this._addExplosionParticles) {
      this._spawnExplosion(this._addExplosionParticles.x, this._addExplosionParticles.y, this._addExplosionParticles.color);
      this._addExplosionParticles = null;
    }
    if (this._addHitParticles) {
      this._spawnHitSparks(this._addHitParticles.x, this._addHitParticles.y, this._addHitParticles.color);
      this._addHitParticles = null;
    }

    this._updateParticles(dt);
  }

  _updateNitro(dt, input) {
    if (this.nitroCooldown > 0) {
      this.nitroCooldown -= dt;
    }
    if (this.nitroBurstTimer > 0) {
      this.nitroBurstTimer -= dt;
    }

    const speedRatioForCharge = Math.abs(this.speed) / this.baseMaxSpeed;
    if (!this.nitroActive && speedRatioForCharge > 0.2 && this.isOnTrack) {
      const chargeAmount = this.nitroChargeRate * dt * (0.5 + speedRatioForCharge * 0.5 + this.driftFactor * 0.8);
      this.nitroEnergy = Math.min(this.nitroEnergy + chargeAmount, this.nitroMaxEnergy);
    }

    if (this.nitroEnergy >= this.nitroMaxEnergy) {
      this.nitroReadyPulse += dt * 4;
    } else {
      this.nitroReadyPulse = 0;
    }

    const wantNitro = input.nitro && this.nitroEnergy >= 25 && this.nitroCooldown <= 0;
    if (wantNitro && !this.nitroActive) {
      this.nitroActive = true;
      this.nitroDuration = 0;
      this.nitroBurstTimer = 0.4;
    }

    if (this.nitroActive) {
      this.nitroDuration += dt;
      this.totalNitroTime += dt;
      this.nitroEnergy -= this.nitroConsumeRate * dt;

      if (this.nitroEnergy <= 0 || !input.nitro) {
        this.nitroActive = false;
        this.nitroEnergy = Math.max(0, this.nitroEnergy);
        this.nitroCooldown = 0.5;
      }
    }
  }

  _addNitroParticles() {
    const rearX = this.x - Math.cos(this.angle) * this.wheelBase * 0.75;
    const rearY = this.y - Math.sin(this.angle) * this.wheelBase * 0.75;

    for (let i = 0; i < 3; i++) {
      const spreadAngle = this.angle + Math.PI + Utils.randomRange(-0.4, 0.4);
      const speed = Utils.randomRange(120, 220);
      const nitroColors = ['#00f5ff', '#00ffff', '#66ffff', '#ffffff'];
      const color = nitroColors[Math.floor(Math.random() * nitroColors.length)];

      this.particles.push({
        x: rearX + Utils.randomRange(-5, 5),
        y: rearY + Utils.randomRange(-5, 5),
        vx: Math.cos(spreadAngle) * speed,
        vy: Math.sin(spreadAngle) * speed,
        size: Utils.randomRange(6, 14),
        life: 1,
        maxLife: Utils.randomRange(0.25, 0.5),
        color: color,
        type: 'nitro'
      });
    }

    if (Math.random() < 0.4) {
      const smokeAngle = this.angle + Math.PI + Utils.randomRange(-0.2, 0.2);
      const smokeSpeed = Utils.randomRange(40, 90);
      this.particles.push({
        x: rearX,
        y: rearY,
        vx: Math.cos(smokeAngle) * smokeSpeed,
        vy: Math.sin(smokeAngle) * smokeSpeed,
        size: Utils.randomRange(12, 25),
        life: 1,
        maxLife: Utils.randomRange(0.5, 1.0),
        color: 'rgba(150, 200, 255, 0.4)',
        type: 'nitroSmoke'
      });
    }
  }

  _updateDrift(steerInput, speedRatio, dt, isOnTrack) {
    const driftThreshold = 0.4;
    const targetDrift = steerInput * speedRatio * 0.6;

    if (speedRatio > driftThreshold && Math.abs(steerInput) > 0.1 && isOnTrack) {
      this.driftFactor = Math.min(this.driftFactor + dt * 2, 1);
    } else {
      this.driftFactor = Math.max(this.driftFactor - dt * 3, 0);
    }

    this.driftAngle = Utils.lerp(this.driftAngle, targetDrift * this.driftFactor, dt * 8);
  }

  _addSkidMarks(isOnTrack, speedRatio, steerInput) {
    if (!isOnTrack || speedRatio < 0.3) return;

    const driftAmount = Math.abs(this.driftAngle);
    if (driftAmount > 0.1 || Math.abs(steerInput) > 0.5) {
      const rearX = this.x - Math.cos(this.angle) * this.wheelBase * 0.6;
      const rearY = this.y - Math.sin(this.angle) * this.wheelBase * 0.6;

      this.skidMarks.push({
        x: rearX,
        y: rearY,
        alpha: Math.min(driftAmount * 2, 0.6),
        life: 1
      });

      if (this.skidMarks.length > 200) {
        this.skidMarks.splice(0, this.skidMarks.length - 200);
      }

      if (Math.random() < driftAmount * 0.3) {
        this._addDriftParticle(rearX, rearY);
      }
    }
  }

  _addDriftParticle(x, y) {
    const angle = this.angle + Math.PI + Utils.randomRange(-0.5, 0.5);
    const speed = Utils.randomRange(20, 60);
    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Utils.randomRange(3, 8),
      life: 1,
      maxLife: Utils.randomRange(0.3, 0.8),
      color: null,
      type: 'drift'
    });
  }

  _spawnExplosion(x, y, color = '#ff6600') {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Utils.randomRange(-0.2, 0.2);
      const speed = Utils.randomRange(60, 180);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Utils.randomRange(4, 12),
        life: 1,
        maxLife: Utils.randomRange(0.5, 1.2),
        color,
        type: 'explosion'
      });
    }
    for (let i = 0; i < 10; i++) {
      const angle = Utils.randomRange(0, Math.PI * 2);
      const speed = Utils.randomRange(20, 80);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: Utils.randomRange(6, 16),
        life: 1,
        maxLife: Utils.randomRange(0.8, 1.5),
        color: '#ffff00',
        type: 'smoke'
      });
    }
  }

  _spawnHitSparks(x, y, color = '#ffffff') {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = Utils.randomRange(0, Math.PI * 2);
      const speed = Utils.randomRange(80, 200);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Utils.randomRange(2, 5),
        life: 1,
        maxLife: Utils.randomRange(0.2, 0.5),
        color,
        type: 'spark'
      });
    }
  }

  _updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.type === 'smoke') {
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy -= 20 * dt;
        p.size += 10 * dt;
      } else if (p.type === 'explosion') {
        p.vx *= 0.92;
        p.vy *= 0.92;
      } else if (p.type === 'spark') {
        p.vx *= 0.9;
        p.vy *= 0.9;
      } else if (p.type === 'nitro') {
        p.vx *= 0.9;
        p.vy *= 0.9;
        p.size += 5 * dt;
      } else if (p.type === 'nitroSmoke') {
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.size += 25 * dt;
      } else {
        p.vx *= 0.95;
        p.vy *= 0.95;
      }

      p.life -= dt / p.maxLife;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  getDistanceAlongTrack(track) {
    return track.getDistanceAlongTrack(this.x, this.y).distance;
  }

  reset(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 0;
    this.maxSpeed = this.baseMaxSpeed;
    this.acceleration = this.baseAcceleration;
    this.driftAngle = 0;
    this.driftFactor = 0;
    this.lap = 0;
    this.checkpoint = 0;
    this.raceTime = 0;
    this.finished = false;
    this.bestLapTime = Infinity;
    this.lastLapTime = 0;
    this.lapTimes = [];
    this.isNewLapRecord = false;
    this.newRecordTimer = 0;
    this.currentRouteId = 'main';
    this.routeCheckpoints = new Map();
    this.routeChangeCooldown = 0;
    this.takenRoutes = [];
    this.activeBranchHint = null;
    this.selectedRouteAtBranch = null;
    this.branchChoiceLocked = false;
    this.skidMarks = [];
    this.particles = [];
    this.obstacleCollisions = 0;
    this.obstaclesDestroyed = 0;
    this.bikeCollisions = 0;
    this.obstacleHitCooldown = 0;
    this._addExplosionParticles = null;
    this._addHitParticles = null;
    this.nitroEnergy = 0;
    this.nitroActive = false;
    this.nitroDuration = 0;
    this.nitroCooldown = 0;
    this.nitroBurstTimer = 0;
    this.nitroReadyPulse = 0;
    this.prevNitroActive = false;
    this.totalDriftDistance = 0;
    this.totalNitroTime = 0;
  }
}
