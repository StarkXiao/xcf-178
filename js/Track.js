class Track {
  constructor(width = 180) {
    this.width = width;
    this.points = [];
    this.totalLength = 0;
    this.segmentLengths = [];
    this.checkpoints = [];
    this._generateTrack();
    this._calculateLengths();
    this._generateCheckpoints();
  }

  _generateTrack() {
    const centerX = 1200;
    const centerY = 1000;
    const numPoints = 24;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const radiusVariation = Math.sin(angle * 3) * 150 + Math.cos(angle * 2) * 100;
      const radius = 600 + radiusVariation;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      this.points.push({ x, y });
    }
  }

  _calculateLengths() {
    this.segmentLengths = [];
    this.totalLength = 0;

    for (let i = 0; i < this.points.length; i++) {
      const p1 = this.points[i];
      const p2 = this.points[(i + 1) % this.points.length];
      const dist = Utils.distance(p1.x, p1.y, p2.x, p2.y);
      this.segmentLengths.push(dist);
      this.totalLength += dist;
    }
  }

  _generateCheckpoints() {
    const numCheckpoints = 8;
    this.checkpoints = [];

    for (let i = 0; i < numCheckpoints; i++) {
      const dist = (i / numCheckpoints) * this.totalLength;
      const point = this.getPointAtDistance(dist);
      this.checkpoints.push({
        ...point,
        distance: dist
      });
    }
  }

  getPointAtDistance(distance) {
    distance = ((distance % this.totalLength) + this.totalLength) % this.totalLength;

    let accumulated = 0;
    for (let i = 0; i < this.points.length; i++) {
      if (accumulated + this.segmentLengths[i] >= distance) {
        const t = (distance - accumulated) / this.segmentLengths[i];
        const p1 = this.points[i];
        const p2 = this.points[(i + 1) % this.points.length];

        return {
          x: Utils.lerp(p1.x, p2.x, t),
          y: Utils.lerp(p1.y, p2.y, t),
          angle: Math.atan2(p2.y - p1.y, p2.x - p1.x)
        };
      }
      accumulated += this.segmentLengths[i];
    }

    return { x: this.points[0].x, y: this.points[0].y, angle: 0 };
  }

  getDistanceAlongTrack(x, y) {
    let minDist = Infinity;
    let nearestDist = 0;
    let nearestT = 0;

    let accumulated = 0;
    for (let i = 0; i < this.points.length; i++) {
      const p1 = this.points[i];
      const p2 = this.points[(i + 1) % this.points.length];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const lenSq = dx * dx + dy * dy;

      let t = ((x - p1.x) * dx + (y - p1.y) * dy) / lenSq;
      t = Utils.clamp(t, 0, 1);

      const closestX = p1.x + t * dx;
      const closestY = p1.y + t * dy;
      const dist = Utils.distance(x, y, closestX, closestY);

      if (dist < minDist) {
        minDist = dist;
        nearestDist = accumulated + t * this.segmentLengths[i];
        nearestT = t;
      }

      accumulated += this.segmentLengths[i];
    }

    return { distance: nearestDist, offset: minDist };
  }

  isInsideTrack(x, y) {
    const { offset } = this.getDistanceAlongTrack(x, y);
    return offset <= this.width / 2;
  }

  getTrackOffset(x, y) {
    const { distance, offset } = this.getDistanceAlongTrack(x, y);
    const centerPoint = this.getPointAtDistance(distance);

    const perpX = x - centerPoint.x;
    const perpY = y - centerPoint.y;

    const perpAngle = centerPoint.angle + Math.PI / 2;
    const dotProduct = perpX * Math.cos(perpAngle) + perpY * Math.sin(perpAngle);

    return {
      distance,
      offset: dotProduct >= 0 ? offset : -offset,
      centerPoint
    };
  }

  getStartPositions(count, spacing = 50) {
    const positions = [];
    const startDist = 0;
    const startPoint = this.getPointAtDistance(startDist);
    const perpAngle = startPoint.angle + Math.PI / 2;

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const offsetX = (col === 0 ? -1 : 1) * (this.width / 4);
      const backDist = row * spacing;

      const pos = this.getPointAtDistance(startDist - backDist);
      const x = pos.x + Math.cos(perpAngle) * offsetX;
      const y = pos.y + Math.sin(perpAngle) * offsetX;

      positions.push({
        x,
        y,
        angle: pos.angle
      });
    }

    return positions;
  }
}
