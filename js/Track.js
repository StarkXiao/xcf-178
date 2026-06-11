class Route {
  constructor(id, name, points, color = '#ffffff', isShortcut = false, lengthBonus = 1.0) {
    this.id = id;
    this.name = name;
    this.points = points;
    this.color = color;
    this.isShortcut = isShortcut;
    this.lengthBonus = lengthBonus;
    this.segmentLengths = [];
    this.totalLength = 0;
    this.checkpoints = [];
    this._calculateLengths();
    this._generateCheckpoints();
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
    const numCheckpoints = 6;
    this.checkpoints = [];
    for (let i = 0; i < numCheckpoints; i++) {
      const dist = (i / numCheckpoints) * this.totalLength;
      const point = this.getPointAtDistance(dist);
      this.checkpoints.push({
        ...point,
        distance: dist,
        routeId: this.id
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
}

class BranchPoint {
  constructor(distance, position, routes, triggerRadius = 100) {
    this.distance = distance;
    this.position = position;
    this.routes = routes;
    this.triggerRadius = triggerRadius;
    this.hintActive = false;
  }

  isNearBranchPoint(x, y) {
    const dist = Utils.distance(x, y, this.position.x, this.position.y);
    return dist < this.triggerRadius;
  }

  getHintDirection(currentRouteId) {
    return this.routes.filter(r => r.routeId !== currentRouteId);
  }
}

class Track {
  constructor(width = 180) {
    this.width = width;
    this.routes = new Map();
    this.branchPoints = [];
    this.currentRouteId = 'main';
    this.totalLength = 0;
    this.segmentLengths = [];
    this.points = [];
    this.checkpoints = [];
    this.routeHints = [];
    this._generateTrackWithBranches();
    this._setupBranchPoints();
    this._syncMainRoute();
  }

  _generateTrackWithBranches() {
    const centerX = 1200;
    const centerY = 1000;
    const numPoints = 24;
    const mainPoints = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const radiusVariation = Math.sin(angle * 3) * 150 + Math.cos(angle * 2) * 100;
      const radius = 600 + radiusVariation;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      mainPoints.push({ x, y });
    }

    const mainRoute = new Route('main', '主赛道', mainPoints, '#00f5ff', false, 1.0);
    this.routes.set('main', mainRoute);

    const shortcut1Points = this._generateShortcut1(mainPoints, centerX, centerY);
    const shortcut1 = new Route('shortcut1', '近道A', shortcut1Points, '#ff6600', true, 0.85);
    this.routes.set('shortcut1', shortcut1);

    const branch1Points = this._generateBranch1(mainPoints, centerX, centerY);
    const branch1 = new Route('branch1', '分支赛道B', branch1Points, '#00ff66', false, 0.92);
    this.routes.set('branch1', branch1);

    this.points = mainPoints;
  }

  _generateShortcut1(mainPoints, centerX, centerY) {
    const points = [...mainPoints];
    const startIdx = 4;
    const endIdx = 10;
    const shortcutPoints = [];

    for (let i = 0; i < startIdx; i++) {
      shortcutPoints.push({ ...points[i] });
    }

    const startAngle = (startIdx / 24) * Math.PI * 2;
    const endAngle = (endIdx / 24) * Math.PI * 2;
    const midAngle = (startAngle + endAngle) / 2;
    const innerRadius = 380;

    const midX = centerX + Math.cos(midAngle) * innerRadius;
    const midY = centerY + Math.sin(midAngle) * innerRadius;

    const startP = points[startIdx];
    const endP = points[endIdx];

    shortcutPoints.push({ ...startP });
    shortcutPoints.push({ x: midX, y: midY });
    shortcutPoints.push({ ...endP });

    for (let i = endIdx + 1; i < points.length; i++) {
      shortcutPoints.push({ ...points[i] });
    }

    return shortcutPoints;
  }

  _generateBranch1(mainPoints, centerX, centerY) {
    const points = [...mainPoints];
    const startIdx = 14;
    const endIdx = 20;
    const branchPoints = [];

    for (let i = 0; i < startIdx; i++) {
      branchPoints.push({ ...points[i] });
    }

    const startAngle = (startIdx / 24) * Math.PI * 2;
    const endAngle = (endIdx / 24) * Math.PI * 2;
    const outerRadius = 780;

    const midAngle1 = startAngle + (endAngle - startAngle) * 0.33;
    const midAngle2 = startAngle + (endAngle - startAngle) * 0.66;

    const midX1 = centerX + Math.cos(midAngle1) * outerRadius;
    const midY1 = centerY + Math.sin(midAngle1) * outerRadius;
    const midX2 = centerX + Math.cos(midAngle2) * outerRadius;
    const midY2 = centerY + Math.sin(midAngle2) * outerRadius;

    const startP = points[startIdx];
    const endP = points[endIdx];

    branchPoints.push({ ...startP });
    branchPoints.push({ x: midX1, y: midY1 });
    branchPoints.push({ x: midX2, y: midY2 });
    branchPoints.push({ ...endP });

    for (let i = endIdx + 1; i < points.length; i++) {
      branchPoints.push({ ...points[i] });
    }

    return branchPoints;
  }

  _setupBranchPoints() {
    const mainRoute = this.routes.get('main');

    const bp1Dist = mainRoute.totalLength * 0.16;
    const bp1Pos = mainRoute.getPointAtDistance(bp1Dist);
    this.branchPoints.push(new BranchPoint(
      bp1Dist,
      { x: bp1Pos.x, y: bp1Pos.y },
      [
        { routeId: 'main', name: '主赛道', color: '#00f5ff', hint: '保持主赛道' },
        { routeId: 'shortcut1', name: '近道A', color: '#ff6600', hint: '更近但更窄！', lengthBonus: 0.85 }
      ],
      120
    ));

    const bp2Dist = mainRoute.totalLength * 0.58;
    const bp2Pos = mainRoute.getPointAtDistance(bp2Dist);
    this.branchPoints.push(new BranchPoint(
      bp2Dist,
      { x: bp2Pos.x, y: bp2Pos.y },
      [
        { routeId: 'main', name: '主赛道', color: '#00f5ff', hint: '保持主赛道' },
        { routeId: 'branch1', name: '分支B', color: '#00ff66', hint: '更快的外弯', lengthBonus: 0.92 }
      ],
      120
    ));
  }

  _syncMainRoute() {
    const mainRoute = this.routes.get('main');
    this.totalLength = mainRoute.totalLength;
    this.segmentLengths = mainRoute.segmentLengths;
    this.checkpoints = mainRoute.checkpoints;
  }

  getRoute(routeId) {
    return this.routes.get(routeId) || this.routes.get('main');
  }

  getAllRoutes() {
    return Array.from(this.routes.values());
  }

  getPointAtDistance(distance, routeId = 'main') {
    return this.getRoute(routeId).getPointAtDistance(distance);
  }

  getDistanceAlongTrack(x, y, routeId = null) {
    if (routeId) {
      return this.getRoute(routeId).getDistanceAlongTrack(x, y);
    }
    let bestResult = null;
    let bestRouteId = 'main';
    let minOffset = Infinity;
    for (const [id, route] of this.routes) {
      const result = route.getDistanceAlongTrack(x, y);
      if (result.offset < minOffset) {
        minOffset = result.offset;
        bestResult = result;
        bestRouteId = id;
      }
    }
    return { ...bestResult, routeId: bestRouteId };
  }

  getTrackOffset(x, y, routeId = 'main') {
    return this.getRoute(routeId).getTrackOffset(x, y);
  }

  isInsideTrack(x, y) {
    const result = this.getDistanceAlongTrack(x, y);
    return result.offset <= this.width / 2;
  }

  getNearestBranchPoint(x, y, currentDistance) {
    let nearest = null;
    let minDist = Infinity;
    for (const bp of this.branchPoints) {
      const dist = Utils.distance(x, y, bp.position.x, bp.position.y);
      if (dist < bp.triggerRadius && dist < minDist) {
        if (bp.distance > currentDistance - 50 && bp.distance < currentDistance + bp.triggerRadius) {
          minDist = dist;
          nearest = bp;
        }
      }
    }
    return nearest;
  }

  detectRouteChange(x, y, currentRouteId) {
    const result = this.getDistanceAlongTrack(x, y);
    if (result.routeId !== currentRouteId && result.offset < this.width / 2) {
      const oldRoute = this.getRoute(currentRouteId);
      const newRoute = this.getRoute(result.routeId);
      const oldResult = oldRoute.getDistanceAlongTrack(x, y);
      if (oldResult.offset > this.width * 0.4) {
        return {
          newRouteId: result.routeId,
          route: newRoute,
          distance: result.distance
        };
      }
    }
    return null;
  }

  getRouteProgress(bike) {
    const route = this.getRoute(bike.currentRouteId || 'main');
    const result = route.getDistanceAlongTrack(bike.x, bike.y);
    const normalizedDistance = result.distance / route.totalLength;
    const routeBonus = route.lengthBonus;
    return {
      distance: result.distance,
      normalizedDistance,
      routeBonus,
      effectiveProgress: normalizedDistance * routeBonus,
      routeId: bike.currentRouteId || 'main',
      routeName: route.name
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
      positions.push({ x, y, angle: pos.angle });
    }
    return positions;
  }

  getCheckpointsForRoute(routeId) {
    return this.getRoute(routeId).checkpoints;
  }

  getEffectiveTotalLength(routeId) {
    const route = this.getRoute(routeId);
    return route.totalLength * route.lengthBonus;
  }
}
