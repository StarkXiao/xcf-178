class AIBike extends Bike {
  constructor(x, y, angle, color, difficulty = 'medium') {
    super(x, y, angle, color, false);

    this.difficulty = difficulty;
    this._setDifficultyParams();

    this.lookAheadDist = 200;
    this.steerSmooth = 0;
    this.targetPoint = null;
  }

  _setDifficultyParams() {
    switch (this.difficulty) {
      case 'easy':
        this.maxSpeed = 260;
        this.acceleration = 160;
        this.steerSpeed = 2.2;
        this.aggression = 0.6;
        break;
      case 'medium':
        this.maxSpeed = 290;
        this.acceleration = 180;
        this.steerSpeed = 2.5;
        this.aggression = 0.8;
        break;
      case 'hard':
        this.maxSpeed = 310;
        this.acceleration = 210;
        this.steerSpeed = 2.9;
        this.aggression = 1.0;
        break;
      default:
        this.maxSpeed = 280;
        this.acceleration = 170;
        this.steerSpeed = 2.4;
        this.aggression = 0.75;
    }
  }

  update(dt, track, bikes = []) {
    if (this.finished) {
      super.update(dt, { accel: false, brake: false, left: false, right: false }, track);
      return;
    }

    const input = this._calculateInput(track, bikes);
    super.update(dt, input, track);
  }

  _calculateInput(track, bikes) {
    const input = { accel: true, brake: false, left: false, right: false };

    const distAlong = this.getDistanceAlongTrack(track);
    const lookDist = distAlong.distance + this.lookAheadDist * (1 + this.speed / this.maxSpeed * 0.5);
    this.targetPoint = track.getPointAtDistance(lookDist);

    const targetAngle = Math.atan2(
      this.targetPoint.y - this.y,
      this.targetPoint.x - this.x
    );

    let angleDiff = Utils.angleDifference(targetAngle, this.angle);

    const trackOffset = track.getTrackOffset(this.x, this.y);
    const halfWidth = track.width / 2;
    const offsetRatio = trackOffset.offset / halfWidth;

    angleDiff -= offsetRatio * 0.3;

    const steerSpeed = this.steerSpeed * (Math.abs(this.speed) / this.maxSpeed);
    const targetSteer = Utils.clamp(angleDiff * 2, -1, 1);

    this.steerSmooth = Utils.lerp(this.steerSmooth, targetSteer, 0.1);

    if (this.steerSmooth < -0.05) {
      input.left = true;
    }
    if (this.steerSmooth > 0.05) {
      input.right = true;
    }

    const cornerSharpness = Math.abs(angleDiff);
    const speedRatio = this.speed / this.maxSpeed;

    const brakeThreshold = 0.5 + (1 - this.aggression) * 0.3;
    if (cornerSharpness > brakeThreshold && speedRatio > 0.5) {
      input.brake = true;
      input.accel = false;
    }

    if (Math.abs(trackOffset.offset) > halfWidth * 0.7 && speedRatio > 0.4) {
      input.brake = true;
    }

    input.accel = !input.brake;

    return input;
  }
}
