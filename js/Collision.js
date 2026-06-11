class Collision {
  constructor(track) {
    this.track = track;
    this.damageMultiplier = 0.7;
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

      return true;
    }
    return false;
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
      if (lapTime < bike.bestLapTime) {
        bike.bestLapTime = lapTime;
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
}
