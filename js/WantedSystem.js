const WantedState = {
  IDLE: 'idle',
  WANTED: 'wanted',
  ESCAPING: 'escaping',
  ESCAPED: 'escaped',
  BUSTED: 'busted'
};

const WantedLevelConfig = {
  1: {
    stars: 1,
    policeCount: 2,
    policeDifficulty: 'easy',
    heatDecayRate: 1,
    escapeDistance: 300,
    escapeTime: 10,
    rewardBase: 100,
    spawnDelay: 2.5
  },
  2: {
    stars: 2,
    policeCount: 3,
    policeDifficulty: 'medium',
    heatDecayRate: 0.8,
    escapeDistance: 350,
    escapeTime: 12,
    rewardBase: 250,
    spawnDelay: 1.8
  },
  3: {
    stars: 3,
    policeCount: 4,
    policeDifficulty: 'medium',
    heatDecayRate: 0.6,
    escapeDistance: 400,
    escapeTime: 15,
    rewardBase: 500,
    spawnDelay: 1.3
  },
  4: {
    stars: 4,
    policeCount: 5,
    policeDifficulty: 'hard',
    heatDecayRate: 0.5,
    escapeDistance: 450,
    escapeTime: 18,
    rewardBase: 1000,
    spawnDelay: 1
  },
  5: {
    stars: 5,
    policeCount: 6,
    policeDifficulty: 'hell',
    heatDecayRate: 0.3,
    escapeDistance: 550,
    escapeTime: 25,
    rewardBase: 2000,
    spawnDelay: 0.7
  }
};

const HeatSource = {
  SPEEDING: { amount: 1.5, cooldown: 1, label: '超速' },
  HIGH_SPEED_DRIFT: { amount: 4, cooldown: 1.5, label: '高速漂移' },
  OFF_TRACK: { amount: 3, cooldown: 0.5, label: '冲出赛道' },
  BIKE_COLLISION: { amount: 10, cooldown: 1.5, label: '撞击车辆' },
  POLICE_COLLISION: { amount: 15, cooldown: 1, label: '撞击警车' },
  OBSTACLE_DESTROY: { amount: 6, cooldown: 0.8, label: '破坏设施' },
  NITRO_BURST: { amount: 1, cooldown: 1.5, label: '氮气加速' }
};

class WantedSystem {
  constructor(track) {
    this.track = track;
    this.state = WantedState.IDLE;
    this.heatLevel = 0;
    this.maxHeat = 100;
    this.wantedStars = 0;

    this.heatSources = new Map();
    this._initHeatSources();

    this.policeBikes = [];
    this.spawnTimer = 0;
    this.policeSpawnPoints = [];

    this.escapeTimer = 0;
    this.escapeDistanceTimer = 0;
    this.survivalTime = 0;

    this.reward = 0;
    this.maxWantedReached = 0;
    this.maxPoliceCount = 0;
    this.totalPoliceCollisions = 0;
    this.nearMissCount = 0;
    this._resultMultiplier = 0;

    this.flashTimer = 0;
    this.sirenOn = false;
  }

  _initHeatSources() {
    for (const [key, value] of Object.entries(HeatSource)) {
      this.heatSources.set(key, { ...value, currentCooldown: 0 });
    }
  }

  startWanted() {
    if (this.state !== WantedState.IDLE) return;
    this.state = WantedState.WANTED;
    this.heatLevel = 15;
    this.wantedStars = 1;
    this.survivalTime = 0;
    this.maxWantedReached = 1;
    this.spawnTimer = 1;
  }

  addHeat(sourceKey) {
    const source = this.heatSources.get(sourceKey);
    if (!source || source.currentCooldown > 0) return false;

    this.heatLevel = Utils.clamp(this.heatLevel + source.amount, 0, this.maxHeat);
    source.currentCooldown = source.cooldown;

    this._updateWantedStars();

    if (this.state === WantedState.IDLE && this.heatLevel > 10) {
      this.startWanted();
    }

    if (this.state === WantedState.ESCAPING) {
      this.state = WantedState.WANTED;
      this.escapeDistanceTimer = 0;
    }

    return true;
  }

  _updateWantedStars() {
    let newStars = 1;
    if (this.heatLevel >= 90) newStars = 5;
    else if (this.heatLevel >= 70) newStars = 4;
    else if (this.heatLevel >= 50) newStars = 3;
    else if (this.heatLevel >= 30) newStars = 2;

    if (newStars > this.wantedStars) {
      this.wantedStars = newStars;
      this.maxWantedReached = Math.max(this.maxWantedReached, newStars);
      this._onWantedLevelUp();
    }
  }

  _onWantedLevelUp() {
    this.flashTimer = 0.5;
  }

  update(dt, player, allBikes = []) {
    this._updateHeatCooldowns(dt);
    this._updateHeatDecay(dt);
    this._updateSiren(dt);

    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
    }

    if (this.state === WantedState.IDLE) return;

    this.survivalTime += dt;

    if (this.state === WantedState.WANTED || this.state === WantedState.ESCAPING) {
      this._updatePoliceSpawning(dt, player);
      this._updatePoliceBikes(dt, player, allBikes);
      this._updateEscapeStatus(dt, player);
      this._checkBusted(player);
    }

    this.maxPoliceCount = Math.max(this.maxPoliceCount, this.policeBikes.length);
  }

  _updateHeatCooldowns(dt) {
    for (const source of this.heatSources.values()) {
      if (source.currentCooldown > 0) {
        source.currentCooldown -= dt;
      }
    }
  }

  _updateHeatDecay(dt) {
    if (this.state === WantedState.IDLE) return;

    const config = WantedLevelConfig[Math.max(1, this.wantedStars)];
    const decayRate = config.heatDecayRate;

    if (this.state === WantedState.ESCAPING) {
      this.heatLevel = Math.max(0, this.heatLevel - decayRate * 2 * dt);
    } else if (this.state === WantedState.WANTED) {
      this.heatLevel = Math.max(0, this.heatLevel - decayRate * dt);
    }

    if (this.heatLevel < 5 && this.wantedStars > 1) {
      const oldStars = this.wantedStars;
      this.wantedStars = Math.max(1, this.wantedStars - 1);
      this.heatLevel = this.wantedStars * 20 + 10;
    }

    if (this.heatLevel <= 0 && this.wantedStars <= 1 && this.state === WantedState.ESCAPING) {
      this._completeEscape();
    }
  }

  _updateSiren(dt) {
    if (this.state === WantedState.WANTED || this.state === WantedState.ESCAPING) {
      this.sirenOn = true;
    } else {
      this.sirenOn = false;
    }
  }

  _updatePoliceSpawning(dt, player) {
    if (this.wantedStars < 1) return;

    const config = WantedLevelConfig[this.wantedStars];
    const targetCount = config.policeCount;

    if (this.policeBikes.length < targetCount) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this._spawnPolice(player);
        this.spawnTimer = config.spawnDelay;
      }
    }
  }

  _spawnPolice(player) {
    const spawnPoint = this._findSpawnPoint(player);
    if (!spawnPoint) return;

    const config = WantedLevelConfig[this.wantedStars];
    const police = new PoliceBike(
      spawnPoint.x,
      spawnPoint.y,
      spawnPoint.angle,
      config.policeDifficulty
    );

    police.currentRouteId = player.currentRouteId || 'main';
    police.progressDistance = spawnPoint.distance;

    this.policeBikes.push(police);
  }

  _findSpawnPoint(player) {
    const route = this.track.getRoute(player.currentRouteId || 'main');
    if (!route) return null;

    const playerDist = route.getDistanceAlongTrack(player.x, player.y).distance;
    const spawnBehind = playerDist - 300 - Math.random() * 200;
    const wrappedDist = spawnBehind < 0 ? spawnBehind + route.totalLength : spawnBehind;

    const point = route.getPointAtDistance(wrappedDist);
    return {
      x: point.x,
      y: point.y,
      angle: point.angle,
      distance: wrappedDist
    };
  }

  _updatePoliceBikes(dt, player, allBikes) {
    const allOtherBikes = [...allBikes, ...this.policeBikes.filter(p => !p._isPolice)];

    for (let i = this.policeBikes.length - 1; i >= 0; i--) {
      const police = this.policeBikes[i];
      police.update(dt, this.track, player, this.policeBikes);

      if (police._shouldDespawn && police._despawnTimer <= 0) {
        this.policeBikes.splice(i, 1);
      }
    }
  }

  _updateEscapeStatus(dt, player) {
    if (this.policeBikes.length === 0) return;

    const config = WantedLevelConfig[this.wantedStars];
    let allFarEnough = true;
    let minDist = Infinity;

    for (const police of this.policeBikes) {
      const dist = Utils.distance(player.x, player.y, police.x, police.y);
      minDist = Math.min(minDist, dist);
      if (dist < config.escapeDistance) {
        allFarEnough = false;
        break;
      }
    }

    if (allFarEnough) {
      if (this.state !== WantedState.ESCAPING) {
        this.state = WantedState.ESCAPING;
        this.escapeDistanceTimer = 0;
      }
      this.escapeDistanceTimer += dt;

      if (this.escapeDistanceTimer >= config.escapeTime) {
        this._completeEscape();
      }
    } else {
      if (this.state === WantedState.ESCAPING) {
        this.state = WantedState.WANTED;
      }
      this.escapeDistanceTimer = 0;
    }
  }

  _checkBusted(player) {
    if (player.speed < 5 && this.policeBikes.length > 0) {
      let nearbyPolice = 0;
      for (const police of this.policeBikes) {
        const dist = Utils.distance(player.x, player.y, police.x, police.y);
        if (dist < 40) {
          nearbyPolice++;
        }
      }
      if (nearbyPolice >= 3) {
        this._busted();
      }
    }
  }

  _completeEscape() {
    this.state = WantedState.ESCAPED;
    this._resultMultiplier = 1.0;
    this._calculateReward(1.0);
  }

  _busted() {
    this.state = WantedState.BUSTED;
    this._resultMultiplier = 0.3;
    this._calculateReward(0.3);
  }

  _calculateReward(multiplier = 1.0) {
    const config = WantedLevelConfig[this.maxWantedReached];
    let reward = config.rewardBase;

    reward += Math.floor(this.survivalTime * 10);
    reward += this.nearMissCount * 20;
    reward -= this.totalPoliceCollisions * 30;

    reward = Math.max(0, reward);

    const bonusMultiplier = 1 + (this.maxWantedReached - 1) * 0.2;
    reward = Math.floor(reward * bonusMultiplier * multiplier);

    this.reward = reward;
  }

  onPoliceCollision() {
    this.totalPoliceCollisions++;
    this.addHeat('POLICE_COLLISION');
  }

  onNearMiss() {
    this.nearMissCount++;
  }

  getPoliceBikes() {
    return this.policeBikes;
  }

  getWantedStars() {
    return this.wantedStars;
  }

  getState() {
    return this.state;
  }

  getEscapeProgress() {
    if (this.state !== WantedState.ESCAPING) return 0;
    const config = WantedLevelConfig[this.wantedStars];
    return Utils.clamp(this.escapeDistanceTimer / config.escapeTime, 0, 1);
  }

  getSurvivalTime() {
    return this.survivalTime;
  }

  getReward() {
    return this.reward;
  }

  getRewardBreakdown() {
    const config = WantedLevelConfig[this.maxWantedReached];
    const bonusMultiplier = 1 + (this.maxWantedReached - 1) * 0.2;
    const resultMult = this._resultMultiplier || 1;

    const baseReward = Math.floor(config.rewardBase * bonusMultiplier * resultMult);
    const survivalReward = Math.floor(Math.floor(this.survivalTime * 10) * bonusMultiplier * resultMult);
    const nearMissReward = Math.floor(this.nearMissCount * 20 * bonusMultiplier * resultMult);
    const collisionPenalty = Math.floor(this.totalPoliceCollisions * 30 * bonusMultiplier * resultMult);

    return {
      base: baseReward,
      survival: survivalReward,
      nearMiss: nearMissReward,
      collision: collisionPenalty,
      bonusMultiplier: bonusMultiplier
    };
  }

  getMaxPoliceCount() {
    return this.maxPoliceCount;
  }

  reset() {
    this.state = WantedState.IDLE;
    this.heatLevel = 0;
    this.wantedStars = 0;
    this.policeBikes = [];
    this.spawnTimer = 0;
    this.escapeTimer = 0;
    this.escapeDistanceTimer = 0;
    this.survivalTime = 0;
    this.reward = 0;
    this.maxWantedReached = 0;
    this.maxPoliceCount = 0;
    this.totalPoliceCollisions = 0;
    this.nearMissCount = 0;
    this._resultMultiplier = 0;
    this.flashTimer = 0;
    this.sirenOn = false;

    this._initHeatSources();
  }
}
