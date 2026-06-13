const AIBehavior = {
  NORMAL: 'normal',
  ATTACK: 'attack',
  DEFEND: 'defend',
  EVADE: 'evade'
};

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

    this.behavior = AIBehavior.NORMAL;
    this.behaviorTimer = 0;
    this.rivalAhead = null;
    this.rivalBehind = null;
    this.overtakeSide = 0;
    this.defendSide = 0;
    this.collisionRiskLevel = 0;
    this.straightness = 1;
    this.myRank = 0;
    this.rankDifference = 0;
    this._overtakeCooldown = 0;
    this._defendCooldown = 0;

    this.weatherAggressionMultiplier = 1.0;
    this.weatherBrakeThreshold = 1.0;
    this.weatherLookAheadMultiplier = 1.0;
    this.weatherSpeedMultiplier = 1.0;

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
        this.overtakeAggression = 0.3;
        this.defendAwareness = 0.2;
        this.rivalScanRange = 250;
        break;
      case 'medium':
        this.maxSpeed = 295;
        this.acceleration = 185;
        this.steerSpeed = 2.6;
        this.aggression = 0.7;
        this.lookAheadMin = 120;
        this.lookAheadMax = 350;
        this.overtakeAggression = 0.6;
        this.defendAwareness = 0.5;
        this.rivalScanRange = 350;
        break;
      case 'hard':
        this.maxSpeed = 320;
        this.acceleration = 210;
        this.steerSpeed = 3.0;
        this.aggression = 0.9;
        this.lookAheadMin = 140;
        this.lookAheadMax = 400;
        this.overtakeAggression = 0.85;
        this.defendAwareness = 0.8;
        this.rivalScanRange = 450;
        break;
      case 'hell':
        this.maxSpeed = 345;
        this.acceleration = 240;
        this.steerSpeed = 3.3;
        this.aggression = 1.0;
        this.lookAheadMin = 160;
        this.lookAheadMax = 450;
        this.overtakeAggression = 1.0;
        this.defendAwareness = 1.0;
        this.rivalScanRange = 550;
        break;
      default:
        this.maxSpeed = 280;
        this.acceleration = 170;
        this.steerSpeed = 2.5;
        this.aggression = 0.7;
        this.lookAheadMin = 120;
        this.lookAheadMax = 350;
        this.overtakeAggression = 0.6;
        this.defendAwareness = 0.5;
        this.rivalScanRange = 350;
    }
  }

  update(dt, track, bikes = [], weatherSystem = null) {
    if (this.finished) {
      super.update(dt, { accel: false, brake: false, left: false, right: false }, track, weatherSystem);
      return;
    }

    if (this.routeChangeTimer > 0) {
      this.routeChangeTimer -= dt;
    }
    if (this._forcedBrake > 0) {
      this._forcedBrake -= dt;
    }
    if (this.behaviorTimer > 0) {
      this.behaviorTimer -= dt;
    }
    if (this._overtakeCooldown > 0) {
      this._overtakeCooldown -= dt;
    }
    if (this._defendCooldown > 0) {
      this._defendCooldown -= dt;
    }

    if (weatherSystem) {
      this._applyWeatherEffects(weatherSystem);
    } else {
      this._resetWeatherEffects();
    }

    this._updateProgress(track);
    this._updateRouteDecision(track, bikes);
    this._updateRivalAwareness(track, bikes);
    this._updateStraightness(track);
    this._determineBehavior(track, bikes);

    const input = this._calculateInput(track, bikes);
    super.update(dt, input, track, weatherSystem);

    this._checkStuck(dt, track);
  }

  _applyWeatherEffects(weatherSystem) {
    const config = weatherSystem.getConfig();
    this.weatherAggressionMultiplier = config.aiAggressionMultiplier;
    this.weatherBrakeThreshold = config.aiBrakeThreshold;
    this.weatherLookAheadMultiplier = 0.6 + config.visibility * 0.4;
    this.weatherSpeedMultiplier = config.aiSpeedMultiplier;
    this.weatherGripMultiplier = config.gripMultiplier;
    this.weatherVisibility = config.visibility;
  }

  _resetWeatherEffects() {
    this.weatherAggressionMultiplier = 1.0;
    this.weatherBrakeThreshold = 1.0;
    this.weatherLookAheadMultiplier = 1.0;
    this.weatherSpeedMultiplier = 1.0;
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

      if (this.behavior === AIBehavior.ATTACK && route.isShortcut) {
        score += 25 * this.overtakeAggression;
      }

      if (this.behavior === AIBehavior.DEFEND && !route.isShortcut) {
        score += 15 * this.defendAwareness;
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

  _updateRivalAwareness(track, bikes) {
    this.rivalAhead = null;
    this.rivalBehind = null;
    this.myRank = this._getMyRank(bikes);

    const activeRouteId = this.targetRouteId || this.currentRouteId;
    const route = track.getRoute(activeRouteId);
    const myDist = route.getDistanceAlongTrack(this.x, this.y).distance;
    const myPerpAngle = route.getPointAtDistance(myDist).angle + Math.PI / 2;
    const mySide = ((this.x - route.getPointAtDistance(myDist).x) * Math.cos(myPerpAngle) +
                    (this.y - route.getPointAtDistance(myDist).y) * Math.sin(myPerpAngle)) >= 0 ? 1 : -1;

    let closestAheadDist = Infinity;
    let closestBehindDist = Infinity;

    for (const bike of bikes) {
      if (bike === this || bike.finished) continue;

      const bikeRouteId = bike.currentRouteId || 'main';
      const bikeRoute = track.getRoute(bikeRouteId);
      const bikeDist = bikeRoute.getDistanceAlongTrack(bike.x, bike.y).distance;
      let relativeDist = bikeDist - myDist;

      const avgTotalLength = (route.totalLength + bikeRoute.totalLength) / 2;
      if (relativeDist > avgTotalLength / 2) relativeDist -= avgTotalLength;
      if (relativeDist < -avgTotalLength / 2) relativeDist += avgTotalLength;

      const spatialDist = Utils.distance(this.x, this.y, bike.x, bike.y);

      if (relativeDist > 0 && relativeDist < this.rivalScanRange) {
        if (spatialDist < closestAheadDist) {
          closestAheadDist = spatialDist;
          this.rivalAhead = {
            bike,
            trackDist: relativeDist,
            spatialDist,
            side: 0
          };

          const rivalPerpAngle = route.getPointAtDistance(myDist).angle + Math.PI / 2;
          const centerPoint = route.getPointAtDistance(myDist);
          const rivalSide = ((bike.x - centerPoint.x) * Math.cos(rivalPerpAngle) +
                             (bike.y - centerPoint.y) * Math.sin(rivalPerpAngle)) >= 0 ? 1 : -1;
          this.rivalAhead.side = rivalSide;
        }
      } else if (relativeDist < 0 && Math.abs(relativeDist) < this.rivalScanRange) {
        if (spatialDist < closestBehindDist) {
          closestBehindDist = spatialDist;
          this.rivalBehind = {
            bike,
            trackDist: relativeDist,
            spatialDist,
            side: 0
          };

          const rivalPerpAngle = route.getPointAtDistance(myDist).angle + Math.PI / 2;
          const centerPoint = route.getPointAtDistance(myDist);
          const rivalSide = ((bike.x - centerPoint.x) * Math.cos(rivalPerpAngle) +
                             (bike.y - centerPoint.y) * Math.sin(rivalPerpAngle)) >= 0 ? 1 : -1;
          this.rivalBehind.side = rivalSide;
        }
      }
    }

    if (this.rivalAhead) {
      this.rankDifference = this.myRank - this._getMyRank([this.rivalAhead.bike]);
    } else if (this.rivalBehind) {
      this.rankDifference = this.myRank - this._getMyRank([this.rivalBehind.bike]);
    } else {
      this.rankDifference = 0;
    }
  }

  _updateStraightness(track) {
    const activeRouteId = this.targetRouteId || this.currentRouteId;
    const route = track.getRoute(activeRouteId);
    const currentDist = route.getDistanceAlongTrack(this.x, this.y).distance;

    const p1 = route.getPointAtDistance(currentDist);
    const p2 = route.getPointAtDistance(currentDist + 100);
    const p3 = route.getPointAtDistance(currentDist + 200);

    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    const curvature = Math.abs(Utils.angleDifference(angle1, angle2));

    this.straightness = 1 - Utils.clamp(curvature / 0.5, 0, 1);
  }

  _isInCorner(track) {
    return this.straightness < 0.6;
  }

  _assessCollisionRisk(bikes) {
    let maxRisk = 0;

    for (const bike of bikes) {
      if (bike === this || bike.finished) continue;

      const dist = Utils.distance(this.x, this.y, bike.x, bike.y);
      if (dist > 80) continue;

      const angleToBike = Math.atan2(bike.y - this.y, bike.x - this.x);
      const relAngle = Math.abs(Utils.angleDifference(angleToBike, this.angle));
      const isInFront = relAngle < Math.PI / 3;
      const isApproaching = bike.speed > this.speed * 0.8 || isInFront;

      if (!isApproaching && relAngle > Math.PI * 2 / 3) continue;

      const distFactor = 1 - dist / 80;
      const angleFactor = isInFront ? 1.2 : 0.8;
      const speedFactor = Math.abs(bike.speed - this.speed) / this.maxSpeed;

      const risk = distFactor * angleFactor * (0.5 + speedFactor * 0.5);
      maxRisk = Math.max(maxRisk, risk);
    }

    this.collisionRiskLevel = Utils.clamp(maxRisk, 0, 1);
    return this.collisionRiskLevel;
  }

  _determineBehavior(track, bikes) {
    if (this.behaviorTimer > 0) return;

    const collisionRisk = this._assessCollisionRisk(bikes);

    if (collisionRisk > 0.7) {
      if (this.behavior !== AIBehavior.EVADE) {
        this.behavior = AIBehavior.EVADE;
        this.behaviorTimer = 0.3;
      }
      return;
    }

    const effectiveScanRange = this.rivalScanRange * this.weatherVisibility;
    const hasRivalAhead = this.rivalAhead && this.rivalAhead.spatialDist < effectiveScanRange;
    const hasRivalBehind = this.rivalBehind && this.rivalBehind.spatialDist < effectiveScanRange * 0.8;

    const weatherCautiousness = 1 - this.weatherAggressionMultiplier;
    const gripPenalty = 1 - this.weatherGripMultiplier;

    let wantAttack = false;
    let wantDefend = false;

    if (hasRivalAhead && this._overtakeCooldown <= 0) {
      let overtakeDesire = this.overtakeAggression * this.weatherAggressionMultiplier;

      if (this.myRank > 1) {
        overtakeDesire *= 1.3;
      }

      const rankBonus = this.rivalAhead && this.rankDifference > 0
        ? this.rankDifference * 0.15
        : 0;

      const straightBonus = this.straightness > 0.7 ? 0.2 : 0;
      const distPenalty = this.rivalAhead
        ? Utils.clamp(this.rivalAhead.spatialDist / effectiveScanRange, 0, 1)
        : 1;

      const weatherOvertakePenalty = gripPenalty * 0.5 + weatherCautiousness * 0.3;
      const attackScore = overtakeDesire + rankBonus + straightBonus - distPenalty * 0.3 - weatherOvertakePenalty;

      const minStraightForOvertake = 0.4 + gripPenalty * 0.4 + weatherCautiousness * 0.2;
      if (attackScore > 0.4 && this.straightness > minStraightForOvertake) {
        wantAttack = true;
      }
    }

    if (hasRivalBehind && this._defendCooldown <= 0) {
      const defendDesire = this.defendAwareness * (1 + weatherCautiousness * 0.8);

      const closeness = this.rivalBehind
        ? 1 - Utils.clamp(Math.abs(this.rivalBehind.spatialDist) / (effectiveScanRange * 0.8), 0, 1)
        : 0;

      const rankThreat = this.rivalBehind && this.rankDifference < 0
        ? Math.abs(this.rankDifference) * 0.2
        : 0;

      const defendScore = defendDesire + closeness * 0.4 + rankThreat;

      if (defendScore > 0.45) {
        wantDefend = true;
      }
    }

    if (wantAttack && wantDefend) {
      if (collisionRisk > 0.25 || this.weatherAggressionMultiplier < 0.7) {
        this.behavior = AIBehavior.DEFEND;
      } else if (this.straightness > 0.6) {
        this.behavior = AIBehavior.ATTACK;
      } else {
        this.behavior = AIBehavior.DEFEND;
      }
    } else if (wantAttack) {
      this.behavior = AIBehavior.ATTACK;
    } else if (wantDefend) {
      this.behavior = AIBehavior.DEFEND;
    } else {
      this.behavior = AIBehavior.NORMAL;
    }

    this.behaviorTimer = 0.15;
  }

  _calculateInput(track, bikes) {
    const input = { accel: true, brake: false, left: false, right: false };

    const effectiveMaxSpeed = this.baseMaxSpeed * this.weatherSpeedMultiplier;
    const speedRatio = Math.abs(this.speed) / effectiveMaxSpeed;

    const adjustedLookAheadMin = this.lookAheadMin * this.weatherLookAheadMultiplier;
    const adjustedLookAheadMax = this.lookAheadMax * this.weatherLookAheadMultiplier;

    const lookAhead = Utils.lerp(
      adjustedLookAheadMin,
      adjustedLookAheadMax,
      speedRatio * this.aggression * this.weatherAggressionMultiplier
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

    if (this.behavior === AIBehavior.ATTACK && this.rivalAhead) {
      targetPoint = this._applyOvertakeStrategy(targetPoint, track, lookAhead);
    } else if (this.behavior === AIBehavior.DEFEND && this.rivalBehind) {
      targetPoint = this._applyDefendStrategy(targetPoint, track, lookAhead);
    } else if (this.behavior === AIBehavior.EVADE) {
      targetPoint = this._applyEvadeStrategy(targetPoint, track, bikes, lookAhead);
    }

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

    const steerSmoothing = this.behavior === AIBehavior.EVADE ? 0.25 : 0.15;
    this.steerSmooth = Utils.lerp(this.steerSmooth, targetSteer, steerSmoothing);

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

    let brakeThreshold = (0.6 + (1 - this.aggression) * 0.25) * this.weatherBrakeThreshold;

    if (this.targetRouteId && this.targetRouteId !== this.currentRouteId) {
      brakeThreshold *= 0.8;
    }

    if (this.behavior === AIBehavior.ATTACK && this.straightness > 0.6) {
      brakeThreshold *= 1.15;
    }

    if (this.behavior === AIBehavior.DEFEND && this.straightness < 0.5) {
      brakeThreshold *= 0.85;
    }

    const effectiveSpeedThreshold = 0.45 * this.weatherSpeedMultiplier;
    if (futureAngleDiff > brakeThreshold && speedRatio > effectiveSpeedThreshold) {
      input.brake = true;
    }

    const cornerSpeedThreshold = 0.55 * this.weatherSpeedMultiplier;
    if (cornerSharpness > brakeThreshold * 1.2 && speedRatio > cornerSpeedThreshold) {
      input.brake = true;
    }

    if (Math.abs(trackOffset.offset) > halfWidth * 0.65) {
      const offTrackSpeedThreshold = 0.35 * this.weatherSpeedMultiplier;
      if (speedRatio > offTrackSpeedThreshold) {
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

    if (this.behavior === AIBehavior.ATTACK && !input.brake) {
      input.accel = true;
    }

    if (this.weatherAggressionMultiplier < 0.6 && speedRatio > 0.8) {
      if (this.straightness < 0.7) {
        input.accel = false;
      }
    }

    input.accel = !input.brake;

    return input;
  }

  _applyOvertakeStrategy(targetPoint, track, lookAhead) {
    if (!this.rivalAhead) return targetPoint;

    const rival = this.rivalAhead.bike;
    const activeRouteId = this.targetRouteId || this.currentRouteId;
    const route = track.getRoute(activeRouteId);
    const currentDist = route.getDistanceAlongTrack(this.x, this.y).distance;
    const halfWidth = track.width / 2;

    if (this.overtakeSide === 0) {
      const trackOffset = route.getTrackOffset(rival.x, rival.y);
      const rivalSide = trackOffset.offset >= 0 ? 1 : -1;

      if (Math.abs(trackOffset.offset) < halfWidth * 0.3) {
        this.overtakeSide = Math.random() > 0.5 ? 1 : -1;
      } else {
        this.overtakeSide = -rivalSide;
      }
    }

    const overtakeProgress = 1 - Utils.clamp(this.rivalAhead.spatialDist / this.rivalScanRange, 0, 1);
    const lateralShift = halfWidth * 0.5 * this.overtakeSide * this.overtakeAggression * overtakeProgress;

    const trackPoint = route.getPointAtDistance(currentDist + lookAhead * 0.5);
    const perpAngle = trackPoint.angle + Math.PI / 2;

    const overtakePoint = {
      x: targetPoint.x + Math.cos(perpAngle) * lateralShift,
      y: targetPoint.y + Math.sin(perpAngle) * lateralShift,
      angle: targetPoint.angle
    };

    if (this.rivalAhead.spatialDist < 60) {
      this._overtakeCooldown = 2.0;
      this.overtakeSide = 0;
      this.behavior = AIBehavior.NORMAL;
      this.behaviorTimer = 0.5;
    }

    return overtakePoint;
  }

  _applyDefendStrategy(targetPoint, track, lookAhead) {
    if (!this.rivalBehind) return targetPoint;

    const rival = this.rivalBehind.bike;
    const activeRouteId = this.targetRouteId || this.currentRouteId;
    const route = track.getRoute(activeRouteId);
    const currentDist = route.getDistanceAlongTrack(this.x, this.y).distance;
    const halfWidth = track.width / 2;

    const rivalTrackOffset = route.getTrackOffset(rival.x, rival.y);
    const rivalSide = rivalTrackOffset.offset >= 0 ? 1 : -1;

    const closeness = 1 - Utils.clamp(Math.abs(this.rivalBehind.spatialDist) / (this.rivalScanRange * 0.8), 0, 1);
    const blockStrength = this.defendAwareness * closeness;

    let defendShift;
    if (this._isInCorner(track)) {
      const trackOffset = route.getTrackOffset(this.x, this.y);
      const innerSide = trackOffset.offset >= 0 ? -1 : 1;
      defendShift = innerSide * halfWidth * 0.35 * blockStrength;
    } else {
      defendShift = rivalSide * halfWidth * 0.4 * blockStrength;
    }

    const trackPoint = route.getPointAtDistance(currentDist + lookAhead * 0.3);
    const perpAngle = trackPoint.angle + Math.PI / 2;

    const defendPoint = {
      x: targetPoint.x + Math.cos(perpAngle) * defendShift,
      y: targetPoint.y + Math.sin(perpAngle) * defendShift,
      angle: targetPoint.angle
    };

    if (this.rivalBehind.spatialDist > this.rivalScanRange * 0.9) {
      this._defendCooldown = 1.5;
      this.behavior = AIBehavior.NORMAL;
      this.behaviorTimer = 0.5;
    }

    return defendPoint;
  }

  _applyEvadeStrategy(targetPoint, track, bikes, lookAhead) {
    const activeRouteId = this.targetRouteId || this.currentRouteId;
    const route = track.getRoute(activeRouteId);
    const currentDist = route.getDistanceAlongTrack(this.x, this.y).distance;
    const halfWidth = track.width / 2;

    let evadeX = 0;
    let evadeY = 0;

    for (const bike of bikes) {
      if (bike === this || bike.finished) continue;

      const dist = Utils.distance(this.x, this.y, bike.x, bike.y);
      if (dist > 80 || dist < 1) continue;

      const pushX = (this.x - bike.x) / dist;
      const pushY = (this.y - bike.y) / dist;
      const urgency = 1 - dist / 80;

      evadeX += pushX * urgency;
      evadeY += pushY * urgency;
    }

    const evadeMagnitude = Math.sqrt(evadeX * evadeX + evadeY * evadeY);
    if (evadeMagnitude > 0.01) {
      const evadeShift = halfWidth * 0.4 * Utils.clamp(evadeMagnitude, 0, 1);
      const evadeAngle = Math.atan2(evadeY, evadeX);

      const evadePoint = {
        x: targetPoint.x + Math.cos(evadeAngle) * evadeShift,
        y: targetPoint.y + Math.sin(evadeAngle) * evadeShift,
        angle: targetPoint.angle
      };

      this._forcedBrake = Math.max(this._forcedBrake, 0.15);
      return evadePoint;
    }

    return targetPoint;
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
    const aggressionFactor = this.behavior === AIBehavior.ATTACK
      ? this.aggression * 0.8
      : this.aggression;

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
    if (this.behavior === AIBehavior.ATTACK && this.overtakeSide !== 0) {
      avoidSide = this.overtakeSide;
    } else if (Math.abs(trackOffset.offset) < halfWidth * 0.3) {
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
