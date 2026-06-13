const PoliceBehavior = {
  CHASE: 'chase',
  INTERCEPT: 'intercept',
  FLANK: 'flank',
  BLOCK: 'block',
  PATROL: 'patrol'
};

class PoliceBike extends Bike {
  constructor(x, y, angle, difficulty = 'medium') {
    super(x, y, angle, '#ff0044', false);

    this._isPolice = true;
    this.difficulty = difficulty;
    this.behavior = PoliceBehavior.CHASE;
    this.behaviorTimer = 0;

    this.steerSmooth = 0;
    this.targetPoint = null;
    this.progressDistance = 0;
    this.correctionTimer = 0;

    this.sirenPhase = 0;
    this.sirenSpeed = 8;

    this.playerLastSeenPos = null;
    this.playerLastSeenTime = 0;
    this.lostPlayerTimer = 0;

    this._forcedBrake = 0;
    this._shouldDespawn = false;
    this._despawnTimer = 5;

    this.collisionCooldown = 0;

    this._setDifficultyParams();

    this.wheelBase = 28;
    this.width = 18;
  }

  _setDifficultyParams() {
    switch (this.difficulty) {
      case 'easy':
        this.maxSpeed = 250;
        this.baseMaxSpeed = 250;
        this.acceleration = 160;
        this.steerSpeed = 2.2;
        this.aggression = 0.4;
        this.lookAheadMin = 80;
        this.lookAheadMax = 200;
        this.reactionTime = 0.3;
        break;
      case 'medium':
        this.maxSpeed = 290;
        this.baseMaxSpeed = 290;
        this.acceleration = 200;
        this.steerSpeed = 2.8;
        this.aggression = 0.7;
        this.lookAheadMin = 100;
        this.lookAheadMax = 280;
        this.reactionTime = 0.2;
        break;
      case 'hard':
        this.maxSpeed = 320;
        this.baseMaxSpeed = 320;
        this.acceleration = 240;
        this.steerSpeed = 3.2;
        this.aggression = 0.9;
        this.lookAheadMin = 120;
        this.lookAheadMax = 350;
        this.reactionTime = 0.1;
        break;
      case 'hell':
        this.maxSpeed = 350;
        this.baseMaxSpeed = 350;
        this.acceleration = 280;
        this.steerSpeed = 3.6;
        this.aggression = 1.0;
        this.lookAheadMin = 140;
        this.lookAheadMax = 420;
        this.reactionTime = 0.05;
        break;
      default:
        this.maxSpeed = 280;
        this.baseMaxSpeed = 280;
        this.acceleration = 190;
        this.steerSpeed = 2.6;
        this.aggression = 0.6;
        this.lookAheadMin = 100;
        this.lookAheadMax = 260;
        this.reactionTime = 0.2;
    }
  }

  update(dt, track, player, allPolice = []) {
    if (this.finished) {
      super.update(dt, { accel: false, brake: false, left: false, right: false }, track);
      return;
    }

    if (this._shouldDespawn) {
      this._despawnTimer -= dt;
    }

    if (this.collisionCooldown > 0) {
      this.collisionCooldown -= dt;
    }

    if (this._forcedBrake > 0) {
      this._forcedBrake -= dt;
    }

    if (this.behaviorTimer > 0) {
      this.behaviorTimer -= dt;
    }

    this.sirenPhase += dt * this.sirenSpeed;

    this._updateProgress(track);
    this._determineBehavior(dt, track, player, allPolice);

    const input = this._calculateInput(track, player, allPolice);
    super.update(dt, input, track);

    this._checkStuck(dt, track);
    this._updateSirenParticles();
  }

  _updateProgress(track) {
    const route = track.getRoute(this.currentRouteId || 'main');
    if (!route) return;

    const result = route.getDistanceAlongTrack(this.x, this.y);
    if (result.distance > this.progressDistance - route.totalLength * 0.5) {
      this.progressDistance = result.distance;
    } else if (result.distance > this.progressDistance + route.totalLength * 0.5) {
      this.progressDistance = result.distance;
    }
  }

  _determineBehavior(dt, track, player, allPolice) {
    const distToPlayer = Utils.distance(this.x, this.y, player.x, player.y);
    const route = track.getRoute(this.currentRouteId || 'main');
    const playerDist = route.getDistanceAlongTrack(player.x, player.y).distance;
    const myDist = this.progressDistance;

    let relativePos = playerDist - myDist;
    if (relativePos > route.totalLength / 2) relativePos -= route.totalLength;
    if (relativePos < -route.totalLength / 2) relativePos += route.totalLength;

    const playerAhead = relativePos > 0;
    const playerBehind = relativePos < 0;

    const policeIndex = allPolice.indexOf(this);
    const isLeadPolice = policeIndex === 0;

    if (distToPlayer < 60) {
      this.behavior = PoliceBehavior.BLOCK;
      this.behaviorTimer = 0.5;
    } else if (distToPlayer < 150 && this.behaviorTimer <= 0) {
      if (playerAhead && isLeadPolice) {
        this.behavior = PoliceBehavior.CHASE;
      } else if (playerBehind && !isLeadPolice) {
        this.behavior = PoliceBehavior.FLANK;
      } else {
        this.behavior = PoliceBehavior.CHASE;
      }
      this.behaviorTimer = 1 + Math.random() * 1.5;
    } else if (distToPlayer < 300 && this.behaviorTimer <= 0) {
      if (playerAhead) {
        this.behavior = PoliceBehavior.INTERCEPT;
      } else {
        this.behavior = PoliceBehavior.CHASE;
      }
      this.behaviorTimer = 1.5 + Math.random() * 2;
    } else if (this.behaviorTimer <= 0) {
      this.behavior = PoliceBehavior.CHASE;
      this.behaviorTimer = 2;
    }

    if (distToPlayer < 500) {
      this.playerLastSeenPos = { x: player.x, y: player.y };
      this.playerLastSeenTime = 0;
      this.lostPlayerTimer = 0;
    } else {
      this.playerLastSeenTime += dt;
    }
  }

  _calculateInput(track, player, allPolice) {
    const input = { accel: true, brake: false, left: false, right: false };
    const route = track.getRoute(this.currentRouteId || 'main');
    if (!route) return input;

    const speedRatio = Math.abs(this.speed) / this.maxSpeed;
    const distToPlayer = Utils.distance(this.x, this.y, player.x, player.y);

    let targetPoint;
    let lookAhead;

    switch (this.behavior) {
      case PoliceBehavior.INTERCEPT:
        targetPoint = this._calcInterceptPoint(track, player, route);
        lookAhead = this.lookAheadMin + (this.lookAheadMax - this.lookAheadMin) * speedRatio * 0.5;
        break;
      case PoliceBehavior.FLANK:
        targetPoint = this._calcFlankPoint(track, player, route, allPolice);
        lookAhead = this.lookAheadMin + (this.lookAheadMax - this.lookAheadMin) * speedRatio * 0.7;
        break;
      case PoliceBehavior.BLOCK:
        targetPoint = this._calcBlockPoint(track, player, route);
        lookAhead = this.lookAheadMin * 0.5;
        break;
      case PoliceBehavior.CHASE:
      default:
        targetPoint = this._calcChasePoint(track, player, route);
        lookAhead = this.lookAheadMin + (this.lookAheadMax - this.lookAheadMin) * speedRatio;
        break;
    }

    this.targetPoint = targetPoint;

    const dx = targetPoint.x - this.x;
    const dy = targetPoint.y - this.y;
    const targetAngle = Math.atan2(dy, dx);

    let angleDiff = Utils.angleDifference(targetAngle, this.angle);

    const trackOffset = track.getTrackOffset(this.x, this.y, this.currentRouteId);
    const halfWidth = track.width / 2;
    const offsetRatio = trackOffset.offset / halfWidth;

    const trackPoint = route.getPointAtDistance(this.progressDistance);
    const parallelToTrack = Math.abs(Utils.angleDifference(this.angle, trackPoint.angle));
    const correctionStrength = parallelToTrack > 1.0 ? 0.4 : 0.15;

    angleDiff -= offsetRatio * correctionStrength;

    const targetSteer = Utils.clamp(angleDiff * 2.5, -1, 1);

    const steerSmoothing = 0.12;
    this.steerSmooth = Utils.lerp(this.steerSmooth, targetSteer, steerSmoothing);

    if (this.steerSmooth < -0.05) {
      input.left = true;
    }
    if (this.steerSmooth > 0.05) {
      input.right = true;
    }

    const cornerSharpness = Math.abs(angleDiff);
    const futureDist = this.progressDistance + lookAhead * 1.5;
    const futurePoint = route.getPointAtDistance(futureDist);
    const futureAngle = Math.atan2(futurePoint.y - this.y, futurePoint.x - this.x);
    const futureAngleDiff = Math.abs(Utils.angleDifference(futureAngle, this.angle));

    const brakeThreshold = 0.5 + (1 - this.aggression) * 0.2;

    if (futureAngleDiff > brakeThreshold && speedRatio > 0.5) {
      input.brake = true;
    }

    if (cornerSharpness > brakeThreshold * 1.3 && speedRatio > 0.6) {
      input.brake = true;
    }

    if (distToPlayer < 80 && speedRatio > 0.3) {
      input.brake = false;
      input.accel = true;
    }

    if (Math.abs(trackOffset.offset) > halfWidth * 0.7) {
      if (speedRatio > 0.4) {
        input.brake = true;
      }
    }

    if (this._forcedBrake > 0) {
      input.brake = true;
    }

    input.accel = !input.brake;

    return input;
  }

  _calcChasePoint(track, player, route) {
    const playerDist = route.getDistanceAlongTrack(player.x, player.y).distance;
    const targetDist = playerDist + 20;
    const trackPoint = route.getPointAtDistance(targetDist);

    return {
      x: trackPoint.x,
      y: trackPoint.y
    };
  }

  _calcInterceptPoint(track, player, route) {
    const playerDist = route.getDistanceAlongTrack(player.x, player.y).distance;
    const playerSpeedProj = Math.abs(Math.cos(
      Utils.angleDifference(player.angle, route.getPointAtDistance(playerDist).angle)
    )) * player.speed;

    const distDiff = playerDist - this.progressDistance;
    const timeToIntercept = Math.max(1, distDiff / Math.max(1, this.maxSpeed - playerSpeedProj));

    const interceptDist = playerDist + playerSpeedProj * timeToIntercept * 0.5;
    const trackPoint = route.getPointAtDistance(interceptDist);

    return {
      x: trackPoint.x,
      y: trackPoint.y
    };
  }

  _calcFlankPoint(track, player, route, allPolice) {
    const playerDist = route.getDistanceAlongTrack(player.x, player.y).distance;
    const trackPoint = route.getPointAtDistance(playerDist);
    const perpAngle = trackPoint.angle + Math.PI / 2;

    const policeIndex = allPolice.indexOf(this);
    const side = policeIndex % 2 === 0 ? 1 : -1;
    const halfWidth = track.width / 2;
    const offset = halfWidth * 0.6 * side;

    const aheadDist = playerDist + 60;
    const aheadPoint = route.getPointAtDistance(aheadDist);

    return {
      x: aheadPoint.x + Math.cos(perpAngle) * offset,
      y: aheadPoint.y + Math.sin(perpAngle) * offset
    };
  }

  _calcBlockPoint(track, player, route) {
    const playerDist = route.getDistanceAlongTrack(player.x, player.y).distance;
    const blockDist = playerDist + 30;
    const trackPoint = route.getPointAtDistance(blockDist);

    return {
      x: trackPoint.x,
      y: trackPoint.y
    };
  }

  _checkStuck(dt, track) {
    if (Math.abs(this.speed) < 15) {
      this.correctionTimer += dt;
      if (this.correctionTimer > 2) {
        const route = track.getRoute(this.currentRouteId || 'main');
        if (route) {
          const currentDist = route.getDistanceAlongTrack(this.x, this.y).distance;
          const aheadPoint = route.getPointAtDistance(currentDist + 40);
          this.x = Utils.lerp(this.x, aheadPoint.x, 0.3);
          this.y = Utils.lerp(this.y, aheadPoint.y, 0.3);
          this.angle = aheadPoint.angle;
          this.speed = 40;
        }
        this.correctionTimer = 0;
      }
    } else {
      this.correctionTimer = 0;
    }
  }

  _updateSirenParticles() {
    if (Math.random() < 0.3) {
      const sirenColor = Math.sin(this.sirenPhase) > 0 ? '#ff0044' : '#0044ff';
      const sirenX = this.x + Math.cos(this.angle + Math.PI / 2) * 8;
      const sirenY = this.y + Math.sin(this.angle + Math.PI / 2) * 8;

      this.particles.push({
        x: sirenX,
        y: sirenY,
        vx: Math.cos(this.sirenPhase) * 20,
        vy: Math.sin(this.sirenPhase) * 20,
        size: 4,
        life: 1,
        maxLife: 0.2,
        color: sirenColor,
        type: 'siren'
      });
    }
  }

  canHitPlayer() {
    return this.collisionCooldown <= 0;
  }

  onPlayerCollision() {
    this.collisionCooldown = 0.5;
  }

  markForDespawn() {
    this._shouldDespawn = true;
    this._despawnTimer = 3;
  }
}
