class AIBike extends Bike {
  constructor(x, y, angle, color, difficulty = 'medium') {
    super(x, y, angle, color, false);

    this.difficulty = difficulty;

    this.steerSmooth = 0;
    this.targetPoint = null;
    this.progressDistance = 0;
    this.correctionTimer = 0;
    this.routeChangeTimer = 0;
    this.preferredRoute = null;
    this.targetRouteId = null;
    this._forcedBrake = 0;

    this._setDifficultyParams();
  }

  _setDifficultyParams() {
    switch (this.difficulty) {
      case 'easy':
        this.maxSpeed = 260;
        this.acceleration = 150;
        this.steerSpeed = 2.0;
        this.aggression = 0.4;
        this.lookAheadMin = 100;
        this.lookAheadMax = 280;
        break;
      case 'medium':
        this.maxSpeed = 295;
        this.acceleration = 185;
        this.steerSpeed = 2.6;
        this.aggression = 0.7;
        this.lookAheadMin = 120;
        this.lookAheadMax = 350;
        break;
      case 'hard':
        this.maxSpeed = 320;
        this.acceleration = 210;
        this.steerSpeed = 3.0;
        this.aggression = 0.9;
        this.lookAheadMin = 140;
        this.lookAheadMax = 400;
        break;
      case 'hell':
        this.maxSpeed = 345;
        this.acceleration = 240;
        this.steerSpeed = 3.3;
        this.aggression = 1.0;
        this.lookAheadMin = 160;
        this.lookAheadMax = 450;
        break;
      default:
        this.maxSpeed = 280;
        this.acceleration = 170;
        this.steerSpeed = 2.5;
        this.aggression = 0.7;
        this.lookAheadMin = 120;
        this.lookAheadMax = 350;
    }
  }

  update(dt, track, bikes = []) {
    if (this.finished) {
      super.update(dt, { accel: false, brake: false, left: false, right: false }, track);
      return;
    }

    if (this.routeChangeTimer > 0) {
      this.routeChangeTimer -= dt;
    }
    if (this._forcedBrake > 0) {
      this._forcedBrake -= dt;
    }

    this._updateProgress(track);
    this._updateRouteDecision(track, bikes);
    const input = this._calculateInput(track, bikes);
    super.update(dt, input, track);

    this._checkStuck(dt, track);
  }

  _updateProgress(track) {
    const result = track.getDistanceAlongTrack(this.x, this.y, this.currentRouteId);
    const route = track.getRoute(this.currentRouteId);
    if (result.distance > this.progressDistance - route.totalLength * 0.5) {
      this.progressDistance = result.distance;
    } else if (result.distance > this.progressDistance + route.totalLength * 0.5) {
      this.progressDistance = result.distance;
    }
  }

  _updateRouteDecision(track, bikes) {
    if (this.routeChangeTimer > 0) return;

    const currentRoute = track.getRoute(this.currentRouteId);
    const currentDist = this.progressDistance;

    const nearestBranch = track.getNearestBranchPoint(this.x, this.y, currentDist);

    if (nearestBranch && !this.branchChoiceLocked) {
      const distToBranch = Utils.distance(this.x, this.y, nearestBranch.position.x, nearestBranch.position.y);

      if (distToBranch < 150) {
        this._decideRoute(track, nearestBranch, bikes);
      }
    }

    if (this.targetRouteId && this.targetRouteId !== this.currentRouteId) {
      const targetRoute = track.getRoute(this.targetRouteId);
      const targetDist = targetRoute.getDistanceAlongTrack(this.x, this.y).distance;
      const targetPoint = targetRoute.getPointAtDistance(targetDist + 80);

      const dx = targetPoint.x - this.x;
      const dy = targetPoint.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 60) {
        this.currentRouteId = this.targetRouteId;
        this.targetRouteId = null;
        this.routeChangeTimer = 2.0;
        this.branchChoiceLocked = true;
        if (!this.takenRoutes.includes(this.currentRouteId)) {
          this.takenRoutes.push(this.currentRouteId);
        }
      }
    }
  }

  _decideRoute(track, branchPoint, bikes) {
    const availableOptions = branchPoint.routes;

    let bestOption = null;
    let bestScore = -Infinity;

    for (const option of availableOptions) {
      let score = 0;

      if (option.routeId === this.currentRouteId) {
        score += 10;
      }

      if (option.lengthBonus) {
        const advantage = (1 - option.lengthBonus) * 100;
        score += advantage * this.aggression;
      }

      const route = track.getRoute(option.routeId);
      if (route.isShortcut) {
        if (this.aggression > 0.6) {
          score += 30;
        } else if (this.aggression < 0.4) {
          score -= 20;
        }
      }

      const myRank = this._getMyRank(bikes);
      if (myRank > 2 && route.isShortcut) {
        score += 40;
      }

      const randomFactor = Utils.randomRange(-10, 10);
      score += randomFactor;

      if (score > bestScore) {
        bestScore = score;
        bestOption = option;
      }
    }

    if (bestOption && bestOption.routeId !== this.currentRouteId) {
      this.targetRouteId = bestOption.routeId;
      this.preferredRoute = bestOption;
    } else {
      this.targetRouteId = null;
      this.preferredRoute = null;
    }
  }

  _getMyRank(bikes) {
    const sorted = [...bikes].sort((a, b) => {
      const progressA = a.lap + a.checkpoint / 8;
      const progressB = b.lap + b.checkpoint / 8;
      return progressB - progressA;
    });
    return sorted.findIndex(b => b === this) + 1;
  }

  _calculateInput(track, bikes) {
    const input = { accel: true, brake: false, left: false, right: false };

    const speedRatio = Math.abs(this.speed) / this.maxSpeed;

    const lookAhead = Utils.lerp(
      this.lookAheadMin,
      this.lookAheadMax,
      speedRatio * this.aggression
    );

    let targetPoint;
    let trackAngle;

    if (this.targetRouteId && this.targetRouteId !== this.currentRouteId) {
      const targetRoute = track.getRoute(this.targetRouteId);
      const targetDist = targetRoute.getDistanceAlongTrack(this.x, this.y).distance;
      targetPoint = targetRoute.getPointAtDistance(targetDist + lookAhead * 0.6);
      trackAngle = targetRoute.getPointAtDistance(targetDist).angle;
    } else {
      const currentDist = track.getDistanceAlongTrack(this.x, this.y, this.currentRouteId).distance;
      const targetDist = currentDist + lookAhead;
      targetPoint = track.getPointAtDistance(targetDist, this.currentRouteId);
      trackAngle = track.getPointAtDistance(currentDist, this.currentRouteId).angle;
    }

    targetPoint = this._applyObstacleAvoidance(targetPoint, track, lookAhead);

    this.targetPoint = targetPoint;

    const dx = this.targetPoint.x - this.x;
    const dy = this.targetPoint.y - this.y;
    const targetAngle = Math.atan2(dy, dx);

    let angleDiff = Utils.angleDifference(targetAngle, this.angle);

    const activeRouteId = this.targetRouteId || this.currentRouteId;
    const trackOffset = track.getTrackOffset(this.x, this.y, activeRouteId);
    const halfWidth = track.width / 2;
    const offsetRatio = trackOffset.offset / halfWidth;

    const parallelToTrack = Math.abs(Utils.angleDifference(this.angle, trackAngle));
    const correctionStrength = parallelToTrack > 1.0 ? 0.5 : 0.15;

    angleDiff -= offsetRatio * correctionStrength;

    const targetSteer = Utils.clamp(angleDiff * 2.5, -1, 1);

    this.steerSmooth = Utils.lerp(this.steerSmooth, targetSteer, 0.15);

    if (this.steerSmooth < -0.05) {
      input.left = true;
    }
    if (this.steerSmooth > 0.05) {
      input.right = true;
    }

    const cornerSharpness = Math.abs(angleDiff);
    const lookFarDist = (this.targetRouteId ? 
      track.getRoute(this.targetRouteId).getDistanceAlongTrack(this.x, this.y).distance :
      track.getDistanceAlongTrack(this.x, this.y, this.currentRouteId).distance);
    const lookFarPoint = track.getPointAtDistance(lookFarDist + lookAhead * 1.8, activeRouteId);
    const futureAngle = Math.atan2(lookFarPoint.y - this.y, lookFarPoint.x - this.x);
    const futureAngleDiff = Math.abs(Utils.angleDifference(futureAngle, this.angle));

    let brakeThreshold = 0.6 + (1 - this.aggression) * 0.25;

    if (this.targetRouteId && this.targetRouteId !== this.currentRouteId) {
      brakeThreshold *= 0.8;
    }

    if (futureAngleDiff > brakeThreshold && speedRatio > 0.45) {
      input.brake = true;
    }

    if (cornerSharpness > brakeThreshold * 1.2 && speedRatio > 0.55) {
      input.brake = true;
    }

    if (Math.abs(trackOffset.offset) > halfWidth * 0.65) {
      if (speedRatio > 0.35) {
        input.brake = true;
      }
      if (cornerSharpness < 0.2) {
        const recoverySteer = Utils.clamp(-offsetRatio * 1.5, -1, 1);
        if (recoverySteer < -0.1) input.left = true;
        if (recoverySteer > 0.1) input.right = true;
      }
    }

    if (speedRatio < 0.1) {
      input.brake = false;
      input.accel = true;
    }

    if (this._forcedBrake > 0) {
      input.brake = true;
    }

    input.accel = !input.brake;

    return input;
  }

  _checkStuck(dt, track) {
    if (Math.abs(this.speed) < 15) {
      this.correctionTimer += dt;
      if (this.correctionTimer > 1.5) {
        const activeRouteId = this.targetRouteId || this.currentRouteId;
        const currentDist = track.getDistanceAlongTrack(this.x, this.y, activeRouteId).distance;
        const aheadPoint = track.getPointAtDistance(currentDist + 30, activeRouteId);
        this.x = Utils.lerp(this.x, aheadPoint.x, 0.3);
        this.y = Utils.lerp(this.y, aheadPoint.y, 0.3);
        this.angle = aheadPoint.angle;
        this.speed = 50;
        this.correctionTimer = 0;
      }
    } else {
      this.correctionTimer = 0;
    }
  }

  _applyObstacleAvoidance(targetPoint, track, lookAhead) {
    const activeRouteId = this.targetRouteId || this.currentRouteId;
    const scanDist = lookAhead * 0.7;
    const currentDist = track.getDistanceAlongTrack(this.x, this.y, activeRouteId).distance;
    const localSpeedRatio = Math.abs(this.speed) / this.maxSpeed;

    let nearestObstacle = null;
    let nearestDist = Infinity;

    for (let d = 20; d < scanDist; d += 25) {
      const checkPoint = track.getPointAtDistance(currentDist + d, activeRouteId);
      const obstacles = track.getObstaclesNearPoint(
        checkPoint.x, checkPoint.y, 50, activeRouteId
      );
      for (const obs of obstacles) {
        const distToObs = Utils.distance(this.x, this.y, obs.x, obs.y);
        if (distToObs < nearestDist) {
          nearestDist = distToObs;
          nearestObstacle = obs;
        }
      }
    }

    if (!nearestObstacle || nearestDist > scanDist) {
      return targetPoint;
    }

    const avoidStrength = 1 - nearestDist / scanDist;
    const aggressionFactor = this.aggression;

    if (avoidStrength < 0.15 && aggressionFactor > 0.7) {
      return targetPoint;
    }

    const trackPoint = track.getPointAtDistance(currentDist + nearestDist * 0.5, activeRouteId);
    const perpAngle = trackPoint.angle + Math.PI / 2;

    const route = track.getRoute(activeRouteId);
    const trackOffset = route.getTrackOffset(this.x, this.y);
    const halfWidth = track.width / 2;
    const bikeSide = trackOffset.offset >= 0 ? 1 : -1;

    let avoidSide;
    if (Math.abs(trackOffset.offset) < halfWidth * 0.3) {
      avoidSide = bikeSide >= 0 ? -1 : 1;
    } else {
      avoidSide = -bikeSide;
    }

    if (aggressionFactor < 0.5 && Math.random() < 0.3) {
      avoidSide *= -1;
    }

    const avoidOffset = (halfWidth * 0.55 + nearestObstacle.radius) * avoidSide * avoidStrength;
    const adjustedTarget = {
      x: targetPoint.x + Math.cos(perpAngle) * avoidOffset,
      y: targetPoint.y + Math.sin(perpAngle) * avoidOffset,
      angle: targetPoint.angle
    };

    if (avoidStrength > 0.5 && localSpeedRatio > 0.5) {
      this._forcedBrake = 0.3;
    }

    return adjustedTarget;
  }
}
