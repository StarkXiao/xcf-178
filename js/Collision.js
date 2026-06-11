class Collision {
  constructor(track) {
    this.track = track;
  }

  checkTrackCollision(bike) {
    const trackOffset = this.track.getTrackOffset(bike.x, bike.y);
    const halfWidth = this.track.width / 2;

    if (Math.abs(trackOffset.offset) > halfWidth) {
      const pushDirection = trackOffset.offset > 0 ? 1 : -1;
      const pushDistance = Math.abs(trackOffset.offset) - halfWidth + 2;

      const perpAngle = trackOffset.centerPoint.angle + Math.PI / 2;
      bike.x -= Math.cos(perpAngle) * pushDirection * pushDistance;
      bike.y -= Math.sin(perpAngle) * pushDirection * pushDistance;

      bike.speed *= 0.6;
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
      bike1.speed = avgSpeed * 0.7;
      bike2.speed = avgSpeed * 0.7;

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
    const checkpoints = this.track.checkpoints;
    const nextCheckpoint = checkpoints[bike.checkpoint];

    const dist = Utils.distance(bike.x, bike.y, nextCheckpoint.x, nextCheckpoint.y);

    if (dist < 60) {
      bike.checkpoint = (bike.checkpoint + 1) % checkpoints.length;

      if (bike.checkpoint === 0) {
        this._completeLap(bike);
      }
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
  }

  getRankings(bikes) {
    const ranked = [...bikes].sort((a, b) => {
      if (a.finished && b.finished) return a.raceTime - b.raceTime;
      if (a.finished) return -1;
      if (b.finished) return 1;

      if (a.lap !== b.lap) return b.lap - a.lap;

      const distA = a.getDistanceAlongTrack(this.track);
      const distB = b.getDistanceAlongTrack(this.track);
      return distB - distA;
    });

    return ranked.map((bike, index) => ({
      bike,
      rank: index + 1
    }));
  }

  getPlayerRank(bikes) {
    const rankings = this.getRankings(bikes);
    const playerRank = rankings.find(r => r.bike.isPlayer);
    return playerRank ? playerRank.rank : -1;
  }
}
