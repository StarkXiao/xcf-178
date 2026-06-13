class Collision {
  constructor(track) {
    this.track = track;
    this.damageMultiplier = 0.7;
    this._bikeCollisionCount = 0;
    this._obstacleCollisionCount = 0;
    this._obstaclesDestroyedTotal = 0;
    this._duelCollisionCount = 0;
    this._lastDuelCollisionTime = 0;
    this._playerDuelStats = new Map();
  }

  checkTrackCollision(bike) {
    const trackOffset = this.track.getTrackOffset(bike.x, bike.y, bike.currentRouteId);
    const halfWidth = this.track.width / 2;

    if (Math.abs(trackOffset.offset) > halfWidth) {
      const pushDirection = trackOffset.offset > 0 ? 1 : -1;
      const pushDistance = Math.abs(trackOffset.offset) - halfWidth + 2;

      const perpAngle = trackOffset.centerPoint.angle + Math.PI / 2;
      bike.x -= Math.cos(perpAngle) * pushDirection * pushDistance;
      bike.y -= Math.sin(perpAngle) * pushDirection * pushDistance;

      bike.speed *= 0.5 + this.damageMultiplier * 0.2;
      bike.driftAngle *= 0.3;

      return true;
    }
    return false;
  }

  checkBikeCollision(bike1, bike2) {
    const minDist = 30;
    const dist = Utils.distance(bike1.x, bike1.y, bike2.x, bike2.y);

    if (dist < minDist) {
      const angle = Math.atan2(bike2.y - bike1.y, bike2.x - bike1.x);
      const overlap = minDist - dist;

      const pushX = Math.cos(angle) * overlap * 0.5;
      const pushY = Math.sin(angle) * overlap * 0.5;

      bike1.x -= pushX;
      bike1.y -= pushY;
      bike2.x += pushX;
      bike2.y += pushY;

      const avgSpeed = (bike1.speed + bike2.speed) * 0.5;
      bike1.speed = avgSpeed * (0.5 + this.damageMultiplier * 0.3);
      bike2.speed = avgSpeed * (0.5 + this.damageMultiplier * 0.3);

      const isDuel = bike1.isPlayer && bike2.isPlayer &&
                     bike1.playerIndex !== bike2.playerIndex;

      if (isDuel) {
        this._duelCollisionCount++;
        this._lastDuelCollisionTime = performance.now();

        if (!bike1.duelCollisions) bike1.duelCollisions = 0;
        if (!bike2.duelCollisions) bike2.duelCollisions = 0;
        bike1.duelCollisions++;
        bike2.duelCollisions++;

        const speedAdvantage = Math.abs(bike1.speed - bike2.speed);
        if (speedAdvantage > 50) {
          const fasterBike = bike1.speed > bike2.speed ? bike1 : bike2;
          const slowerBike = bike1.speed > bike2.speed ? bike2 : bike1;
          fasterBike.speed *= 0.92;
          slowerBike.speed *= 0.75;
          if (!fasterBike.duelTakedowns) fasterBike.duelTakedowns = 0;
          fasterBike.duelTakedowns++;
        }

        this._recordDuelStats(bike1, bike2, speedAdvantage);
      } else {
        if (bike1.isPlayer) {
          if (!bike1.bikeCollisions) bike1.bikeCollisions = 0;
          bike1.bikeCollisions++;
        }
        if (bike2.isPlayer) {
          if (!bike2.bikeCollisions) bike2.bikeCollisions = 0;
          bike2.bikeCollisions++;
        }
      }

      return true;
    }
    return false;
  }

  _recordDuelStats(bike1, bike2, speedDiff) {
    const now = performance.now();
    for (const bike of [bike1, bike2]) {
      const idx = bike.playerIndex;
      if (!this._playerDuelStats.has(idx)) {
        this._playerDuelStats.set(idx, {
          collisions: 0,
          totalSpeedDiff: 0,
          lastCollisionTime: 0,
          maxSpeedImpact: 0
        });
      }
      const stats = this._playerDuelStats.get(idx);
      stats.collisions++;
      stats.totalSpeedDiff += speedDiff;
      stats.lastCollisionTime = now;
      stats.maxSpeedImpact = Math.max(stats.maxSpeedImpact, speedDiff);
    }
  }

  getDuelStats() {
    return {
      totalDuelCollisions: this._duelCollisionCount,
      lastDuelTime: this._lastDuelCollisionTime,
      playerStats: Object.fromEntries(this._playerDuelStats)
    };
  }

  checkAllBikeCollisions(bikes) {
    let collisions = 0;
    for (let i = 0; i < bikes.length; i++) {
      for (let j = i + 1; j < bikes.length; j++) {
        if (this.checkBikeCollision(bikes[i], bikes[j])) {
          collisions++;
        }
      }
    }
    this._bikeCollisionCount += collisions;
    return collisions;
  }

  updateCheckpoints(bike) {
    const track = this.track;
    const currentRoute = track.getRoute(bike.currentRouteId);
    const checkpoints = currentRoute.checkpoints;
    const numCheckpoints = checkpoints.length;

    const bikeTrackDist = currentRoute.getDistanceAlongTrack(bike.x, bike.y).distance;
    const nextIdx = bike.checkpoint % numCheckpoints;
    const nextCpDist = checkpoints[nextIdx].distance;

    let progress = bikeTrackDist - nextCpDist;
    if (progress > currentRoute.totalLength / 2) {
      progress -= currentRoute.totalLength;
    }
    if (progress < -currentRoute.totalLength / 2) {
      progress += currentRoute.totalLength;
    }

    if (progress > 0) {
      if (!bike.routeCheckpoints.has(bike.currentRouteId)) {
        bike.routeCheckpoints.set(bike.currentRouteId, 0);
      }
      bike.routeCheckpoints.set(
        bike.currentRouteId,
        bike.routeCheckpoints.get(bike.currentRouteId) + 1
      );

      if (nextIdx === numCheckpoints - 1) {
        this._completeLap(bike);
      }
      bike.checkpoint = (bike.checkpoint + 1) % numCheckpoints;
    }
  }

  _completeLap(bike) {
    bike.lap++;

    if (bike.lap > 0) {
      const lapTime = bike.raceTime - bike.lastLapTime;
      bike.lapTimes.push(lapTime);
      if (lapTime < bike.bestLapTime) {
        bike.bestLapTime = lapTime;
        bike.isNewLapRecord = true;
        bike.newRecordTimer = 3.0;
      }
      bike.lastLapTime = bike.raceTime;
    }

    bike.routeCheckpoints.clear();
    if (bike.currentRouteId !== 'main') {
      if (!bike.takenRoutes.includes(bike.currentRouteId)) {
        bike.takenRoutes.push(bike.currentRouteId);
      }
    }
  }

  updateRouteTracking(bike) {
    if (bike.routeChangeCooldown > 0) return;

    const routeChange = this.track.detectRouteChange(bike.x, bike.y, bike.currentRouteId);
    if (routeChange) {
      const oldRoute = this.track.getRoute(bike.currentRouteId);
      const newRoute = routeChange.route;

      const oldDist = oldRoute.getDistanceAlongTrack(bike.x, bike.y).distance;
      const newDist = newRoute.getDistanceAlongTrack(bike.x, bike.y).distance;

      const oldProgress = oldDist / oldRoute.totalLength;
      const newCheckpoint = Math.floor(oldProgress * newRoute.checkpoints.length);

      bike.currentRouteId = routeChange.newRouteId;
      bike.checkpoint = newCheckpoint % newRoute.checkpoints.length;
      bike.routeChangeCooldown = 1.5;

      if (!bike.takenRoutes.includes(routeChange.newRouteId)) {
        bike.takenRoutes.push(routeChange.newRouteId);
      }
    }
  }

  updateBranchHints(bike) {
    const currentRoute = this.track.getRoute(bike.currentRouteId);
    const currentDist = currentRoute.getDistanceAlongTrack(bike.x, bike.y).distance;

    const nearestBranch = this.track.getNearestBranchPoint(bike.x, bike.y, currentDist);

    if (nearestBranch) {
      bike.activeBranchHint = nearestBranch;
      if (!bike.branchChoiceLocked) {
        const hintDirections = nearestBranch.getHintDirection(bike.currentRouteId);
        if (hintDirections.length > 0) {
          bike.selectedRouteAtBranch = this._suggestBestRoute(bike, nearestBranch, hintDirections);
        }
      }
    } else {
      bike.activeBranchHint = null;
      bike.selectedRouteAtBranch = null;
      bike.branchChoiceLocked = false;
    }
  }

  _suggestBestRoute(bike, branchPoint, availableRoutes) {
    const currentRoute = this.track.getRoute(bike.currentRouteId);
    const currentProgress = currentRoute.getDistanceAlongTrack(bike.x, bike.y).distance / currentRoute.totalLength;

    let bestRoute = null;
    let bestScore = -Infinity;

    for (const routeOption of availableRoutes) {
      const route = this.track.getRoute(routeOption.routeId);
      const lengthAdvantage = 1 - route.lengthBonus;
      const isShortcut = route.isShortcut;

      let score = lengthAdvantage * 100;

      if (isShortcut) {
        const difficultyFactor = bike.isPlayer ? 1.0 : 0.8;
        score *= difficultyFactor;
      }

      if (score > bestScore) {
        bestScore = score;
        bestRoute = routeOption;
      }
    }

    return bestRoute;
  }

  getRankings(bikes) {
    const track = this.track;
    const mainLength = track.totalLength;

    const getScore = (bike) => {
      if (bike.finished) {
        return Number.MAX_SAFE_INTEGER - bike.raceTime;
      }

      const progress = track.getRouteProgress(bike);
      const currentRoute = track.getRoute(bike.currentRouteId);
      const routeCpProgress = bike.checkpoint / currentRoute.checkpoints.length;

      const lapProgress = bike.lap + routeCpProgress * currentRoute.lengthBonus;
      const distanceScore = progress.distance * currentRoute.lengthBonus;

      const routeBonusScore = this._getRouteBonusScore(bike);

      return lapProgress * mainLength + distanceScore + routeBonusScore;
    };

    const ranked = [...bikes].sort((a, b) => {
      const scoreA = getScore(a);
      const scoreB = getScore(b);
      return scoreB - scoreA;
    });

    return ranked.map((bike, index) => ({
      bike,
      rank: index + 1
    }));
  }

  _getRouteBonusScore(bike) {
    let bonus = 0;
    for (const routeId of bike.takenRoutes) {
      const route = this.track.getRoute(routeId);
      if (route.isShortcut) {
        bonus += 50;
      } else if (routeId !== 'main') {
        bonus += 20;
      }
    }
    return bonus;
  }

  getPlayerRank(bikes) {
    const rankings = this.getRankings(bikes);
    const playerRank = rankings.find(r => r.bike.isPlayer);
    return playerRank ? playerRank.rank : -1;
  }

  getRouteStatistics(bikes) {
    const stats = new Map();

    for (const bike of bikes) {
      const routeId = bike.currentRouteId;
      if (!stats.has(routeId)) {
        stats.set(routeId, { count: 0, players: [] });
      }
      const routeStats = stats.get(routeId);
      routeStats.count++;
      routeStats.players.push(bike);
    }

    return stats;
  }

  checkObstacleCollision(bike) {
    if (bike.obstacleHitCooldown && bike.obstacleHitCooldown > 0) {
      return false;
    }

    const bikeRadius = bike.wheelBase * 0.5;
    const nearbyObstacles = this.track.getObstaclesNearPoint(
      bike.x, bike.y, bikeRadius + 40, bike.currentRouteId
    );

    let hitOccurred = false;

    for (const obstacle of nearbyObstacles) {
      const dist = Utils.distance(bike.x, bike.y, obstacle.x, obstacle.y);
      const minDist = bikeRadius + obstacle.radius;

      if (dist < minDist) {
        hitOccurred = true;
        this._obstacleCollisionCount++;

        const angle = Math.atan2(bike.y - obstacle.y, bike.x - obstacle.x);
        const overlap = minDist - dist;

        bike.x += Math.cos(angle) * overlap;
        bike.y += Math.sin(angle) * overlap;

        const speedPenalty = obstacle.speedPenalty * (1 - this.damageMultiplier * 0.2);
        bike.speed *= Math.max(0.1, 1 - speedPenalty);
        bike.driftAngle *= 0.4;

        const damage = bike.speed > bike.maxSpeed * 0.4 ? 2 : 1;
        const destroyed = obstacle.hit(damage);

        if (destroyed) {
          this._obstaclesDestroyedTotal++;
          if (!bike.obstaclesDestroyed) bike.obstaclesDestroyed = 0;
          bike.obstaclesDestroyed++;
          bike._addExplosionParticles = { x: obstacle.x, y: obstacle.y, color: obstacle.color };
        } else {
          bike._addHitParticles = { x: obstacle.x, y: obstacle.y, color: obstacle.color };
        }

        if (!bike.obstacleCollisions) bike.obstacleCollisions = 0;
        bike.obstacleCollisions++;

        bike.obstacleHitCooldown = 0.25;
        break;
      }
    }

    return hitOccurred;
  }

  checkAllObstacleCollisions(bikes) {
    let totalHits = 0;
    for (const bike of bikes) {
      if (this.checkObstacleCollision(bike)) {
        totalHits++;
      }
    }
    return totalHits;
  }

  getObstacleStatistics() {
    return {
      totalCollisions: this._obstacleCollisionCount,
      totalDestroyed: this._obstaclesDestroyedTotal,
      remainingActive: this.track.getActiveObstacles().length,
      totalObstacles: this.track.obstacles.length
    };
  }

  checkPoliceCollision(bike, policeBike) {
    if (policeBike._isPolice && !policeBike.canHitPlayer()) {
      return false;
    }

    const minDist = 32;
    const dist = Utils.distance(bike.x, bike.y, policeBike.x, policeBike.y);

    if (dist < minDist) {
      const angle = Math.atan2(policeBike.y - bike.y, policeBike.x - bike.x);
      const overlap = minDist - dist;

      const pushX = Math.cos(angle) * overlap * 0.5;
      const pushY = Math.sin(angle) * overlap * 0.5;

      bike.x -= pushX;
      bike.y -= pushY;
      policeBike.x += pushX;
      policeBike.y += pushY;

      const avgSpeed = (bike.speed + policeBike.speed) * 0.5;
      bike.speed = avgSpeed * 0.35;
      policeBike.speed = avgSpeed * 0.6;

      bike.driftAngle *= 0.2;
      policeBike.driftAngle *= 0.5;

      if (bike.isPlayer) {
        if (!bike.policeCollisions) bike.policeCollisions = 0;
        bike.policeCollisions++;
      }

      if (policeBike._isPolice && policeBike.onPlayerCollision) {
        policeBike.onPlayerCollision();
      }

      if (bike._addHitParticles === undefined || bike._addHitParticles === null) {
        bike._addHitParticles = {
          x: (bike.x + policeBike.x) / 2,
          y: (bike.y + policeBike.y) / 2,
          color: '#ff0044'
        };
      }

      return true;
    }
    return false;
  }

  checkAllPoliceCollisions(playerBike, policeBikes) {
    let collisions = 0;

    for (const police of policeBikes) {
      if (this.checkPoliceCollision(playerBike, police)) {
        collisions++;
      }
    }

    for (let i = 0; i < policeBikes.length; i++) {
      for (let j = i + 1; j < policeBikes.length; j++) {
        this._checkPoliceOnPoliceCollision(policeBikes[i], policeBikes[j]);
      }
    }

    return collisions;
  }

  _checkPoliceOnPoliceCollision(police1, police2) {
    const minDist = 28;
    const dist = Utils.distance(police1.x, police1.y, police2.x, police2.y);

    if (dist < minDist) {
      const angle = Math.atan2(police2.y - police1.y, police2.x - police1.x);
      const overlap = minDist - dist;

      const pushX = Math.cos(angle) * overlap * 0.5;
      const pushY = Math.sin(angle) * overlap * 0.5;

      police1.x -= pushX;
      police1.y -= pushY;
      police2.x += pushX;
      police2.y += pushY;

      const avgSpeed = (police1.speed + police2.speed) * 0.5;
      police1.speed = avgSpeed * 0.7;
      police2.speed = avgSpeed * 0.7;

      return true;
    }
    return false;
  }

  checkNearMiss(player, policeBikes, nearMissDist = 50) {
    let nearMisses = 0;

    for (const police of policeBikes) {
      const dist = Utils.distance(player.x, player.y, police.x, police.y);
      if (dist < nearMissDist && dist > 35) {
        const angleToPlayer = Math.atan2(player.y - police.y, player.x - police.x);
        const relAngle = Math.abs(Utils.angleDifference(angleToPlayer, police.angle));

        if (relAngle < Math.PI / 3) {
          nearMisses++;
        }
      }
    }

    return nearMisses;
  }

  resetObstacleStats() {
    this._obstacleCollisionCount = 0;
    this._obstaclesDestroyedTotal = 0;
  }
}
