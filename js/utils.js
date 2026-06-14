const Utils = {
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  },

  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  },

  angleDifference(angle1, angle2) {
    return this.normalizeAngle(angle1 - angle2);
  },

  lerpAngle(a, b, t) {
    const diff = this.angleDifference(b, a);
    return a + diff * t;
  },

  randomRange(min, max) {
    return Math.random() * (max - min) + min;
  },

  randomInt(min, max) {
    return Math.floor(this.randomRange(min, max + 1));
  },

  formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  },

  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};
