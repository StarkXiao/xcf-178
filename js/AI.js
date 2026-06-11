class AIBike extends Bike {
  constructor(x, y, angle, color, difficulty = 'medium') {
    super(x, y, angle, color, false);

    this.difficulty = difficulty;
    this._setDifficultyParams();

    this.lookAheadMin = 120;
    this.lookAheadMax = 350;
    this.steerSmooth = 0;
    this.targetPoint = null;
    this.progressDistance = 0;
    this.correctionTimer = 0;
  }

  _setDifficultyParams() {
    switch (this.difficulty) {
      case 'easy':
        this.maxSpeed = 250;
        this.acceleration = 150;
        this.steerSpeed = 2.0;
        this.aggression = 0.5;
        break;
      case 'medium':
        this.maxSpeed = 285;
        this.acceleration = 180;
        this.steerSpeed = 2.6;
        this.aggression = 0.75;
        break;
      case 'hard':
        this.maxSpeed = 310;
        this.acceleration = 200;
        this.steerSpeed = 3.0;
        this.aggression = 0.95;
        break;
      default:
        this.maxSpeed = 280;
        this.acceleration = 170;
        this.steerSpeed = 2.5;
        this.aggression = 0.75;
    }
  }

  update(dt, track, bikes = []) {
    if (this.finished) {
      super.update(dt, { accel: false, brake: false, left: false, right: false }, track);
      return;
    }

    this._updateProgress(track);
    const input = this._calculateInput(track, bikes);
    super.update(dt, input, track);

    this._checkStuck(dt, track);
  }

  _updateProgress(track) {
    const result = track.getDistanceAlongTrack(this.x, this.y);
    if (result.distance > this.progressDistance - track.totalLength * 0.5) {
      this.progressDistance = result.distance;
    } else if (result.distance > this.progressDistance + track.totalLength * 0.5) {
      this.progressDistance = result.distance;
    }
  }

  _calculateInput(track, bikes) {
    const input = { accel: true, brake: false, left: false, right: false };

    const speedRatio = Math.abs(this.speed) / this.maxSpeed;

    const lookAhead = Utils.lerp(
      this.lookAheadMin,
      this.lookAheadMax,
      speedRatio * this.aggression
    );

    const currentDist = track.getDistanceAlongTrack(this.x, this.y).distance;
    const targetDist = currentDist + lookAhead;

    this.targetPoint = track.getPointAtDistance(targetDist);

    const dx = this.targetPoint.x - this.x;
    const dy = this.targetPoint.y - this.y;
    const targetAngle = Math.atan2(dy, dx);

    let angleDiff = Utils.angleDifference(targetAngle, this.angle);

    const trackOffset = track.getTrackOffset(this.x, this.y);
    const halfWidth = track.width / 2;
    const offsetRatio = trackOffset.offset / halfWidth;

    const trackAngle = track.getPointAtDistance(currentDist).angle;
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
    const lookFarPoint = track.getPointAtDistance(currentDist + lookAhead * 1.8);
    const futureAngle = Math.atan2(lookFarPoint.y - this.y, lookFarPoint.x - this.x);
    const futureAngleDiff = Math.abs(Utils.angleDifference(futureAngle, this.angle));

    let brakeThreshold = 0.6 + (1 - this.aggression) * 0.25;

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

    input.accel = !input.brake;

    return input;
  }

  _checkStuck(dt, track) {
    if (Math.abs(this.speed) < 15) {
      this.correctionTimer += dt;
      if (this.correctionTimer > 1.5) {
        const currentDist = track.getDistanceAlongTrack(this.x, this.y).distance;
        const aheadPoint = track.getPointAtDistance(currentDist + 30);
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
}
