const WeatherType = {
  CLEAR: 'clear',
  CLOUDY: 'cloudy',
  LIGHT_RAIN: 'light_rain',
  MODERATE_RAIN: 'moderate_rain',
  HEAVY_RAIN: 'heavy_rain',
  FOGGY: 'foggy',
  THUNDERSTORM: 'thunderstorm'
};

const WeatherTypeKeys = Object.keys(WeatherType);

const SeasonType = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter'
};

const WeatherConfig = {
  clear: {
    id: 'clear',
    name: '晴天',
    icon: '☀',
    color: '#ffff00',
    description: '阳光明媚，完美的比赛条件',
    gripMultiplier: 1.0,
    frictionMultiplier: 1.0,
    driftResistance: 1.0,
    visibility: 1.0,
    aiSpeedMultiplier: 1.0,
    aiAggressionMultiplier: 1.0,
    aiBrakeThreshold: 1.0,
    baseSpeedMultiplier: 1.0,
    scoreMultiplier: 1.0,
    lapTimeMultiplier: 1.0,
    rainIntensity: 0,
    fogDensity: 0,
    windSpeed: 0,
    wetness: 0,
    particlesPerSecond: 0,
    lightningChance: 0,
    ambientColor: '#ffffff',
    skyBrightness: 1.0
  },
  cloudy: {
    id: 'cloudy',
    name: '多云',
    icon: '☁',
    color: '#8888ff',
    description: '云层覆盖，路面略滑',
    gripMultiplier: 0.95,
    frictionMultiplier: 1.02,
    driftResistance: 0.95,
    visibility: 0.95,
    aiSpeedMultiplier: 0.98,
    aiAggressionMultiplier: 0.95,
    aiBrakeThreshold: 1.02,
    baseSpeedMultiplier: 0.98,
    scoreMultiplier: 1.05,
    lapTimeMultiplier: 1.02,
    rainIntensity: 0,
    fogDensity: 0.1,
    windSpeed: 0.2,
    wetness: 0,
    particlesPerSecond: 0,
    lightningChance: 0,
    ambientColor: '#ddddff',
    skyBrightness: 0.85
  },
  light_rain: {
    id: 'light_rain',
    name: '小雨',
    icon: '🌧',
    color: '#4488ff',
    description: '小雨绵绵，路面开始湿滑',
    gripMultiplier: 0.85,
    frictionMultiplier: 1.1,
    driftResistance: 0.8,
    visibility: 0.85,
    aiSpeedMultiplier: 0.92,
    aiAggressionMultiplier: 0.8,
    aiBrakeThreshold: 1.1,
    baseSpeedMultiplier: 0.92,
    scoreMultiplier: 1.15,
    lapTimeMultiplier: 1.08,
    rainIntensity: 0.3,
    fogDensity: 0.2,
    windSpeed: 0.3,
    wetness: 0.4,
    particlesPerSecond: 30,
    lightningChance: 0,
    ambientColor: '#aaccff',
    skyBrightness: 0.7
  },
  moderate_rain: {
    id: 'moderate_rain',
    name: '中雨',
    icon: '🌧',
    color: '#2266dd',
    description: '中等降雨，抓地力显著下降',
    gripMultiplier: 0.7,
    frictionMultiplier: 1.2,
    driftResistance: 0.6,
    visibility: 0.7,
    aiSpeedMultiplier: 0.85,
    aiAggressionMultiplier: 0.65,
    aiBrakeThreshold: 1.2,
    baseSpeedMultiplier: 0.85,
    scoreMultiplier: 1.3,
    lapTimeMultiplier: 1.15,
    rainIntensity: 0.6,
    fogDensity: 0.35,
    windSpeed: 0.5,
    wetness: 0.7,
    particlesPerSecond: 60,
    lightningChance: 0.05,
    ambientColor: '#88bbff',
    skyBrightness: 0.55
  },
  heavy_rain: {
    id: 'heavy_rain',
    name: '大雨',
    icon: '🌧',
    color: '#1144aa',
    description: '倾盆大雨，驾驶极其困难',
    gripMultiplier: 0.55,
    frictionMultiplier: 1.35,
    driftResistance: 0.4,
    visibility: 0.55,
    aiSpeedMultiplier: 0.78,
    aiAggressionMultiplier: 0.5,
    aiBrakeThreshold: 1.35,
    baseSpeedMultiplier: 0.75,
    scoreMultiplier: 1.5,
    lapTimeMultiplier: 1.25,
    rainIntensity: 0.85,
    fogDensity: 0.5,
    windSpeed: 0.7,
    wetness: 0.9,
    particlesPerSecond: 100,
    lightningChance: 0.1,
    ambientColor: '#6699ff',
    skyBrightness: 0.4
  },
  foggy: {
    id: 'foggy',
    name: '雾天',
    icon: '🌫',
    color: '#aaaaaa',
    description: '大雾弥漫，能见度极低',
    gripMultiplier: 0.9,
    frictionMultiplier: 1.05,
    driftResistance: 0.9,
    visibility: 0.35,
    aiSpeedMultiplier: 0.82,
    aiAggressionMultiplier: 0.4,
    aiBrakeThreshold: 1.25,
    baseSpeedMultiplier: 0.85,
    scoreMultiplier: 1.4,
    lapTimeMultiplier: 1.18,
    rainIntensity: 0,
    fogDensity: 0.85,
    windSpeed: 0.1,
    wetness: 0.2,
    particlesPerSecond: 0,
    lightningChance: 0,
    ambientColor: '#cccccc',
    skyBrightness: 0.6
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: '雷暴',
    icon: '⛈',
    color: '#442288',
    description: '雷电交加，极端天气挑战',
    gripMultiplier: 0.45,
    frictionMultiplier: 1.5,
    driftResistance: 0.3,
    visibility: 0.45,
    aiSpeedMultiplier: 0.7,
    aiAggressionMultiplier: 0.35,
    aiBrakeThreshold: 1.5,
    baseSpeedMultiplier: 0.7,
    scoreMultiplier: 1.8,
    lapTimeMultiplier: 1.35,
    rainIntensity: 0.95,
    fogDensity: 0.6,
    windSpeed: 0.9,
    wetness: 1.0,
    particlesPerSecond: 150,
    lightningChance: 0.25,
    ambientColor: '#8888ff',
    skyBrightness: 0.25
  }
};

const SeasonWeatherWeights = {
  spring: {
    clear: 0.25,
    cloudy: 0.35,
    light_rain: 0.25,
    moderate_rain: 0.1,
    heavy_rain: 0.03,
    foggy: 0.02,
    thunderstorm: 0
  },
  summer: {
    clear: 0.55,
    cloudy: 0.25,
    light_rain: 0.1,
    moderate_rain: 0.05,
    heavy_rain: 0.02,
    foggy: 0.01,
    thunderstorm: 0.02
  },
  autumn: {
    clear: 0.3,
    cloudy: 0.35,
    light_rain: 0.2,
    moderate_rain: 0.1,
    heavy_rain: 0.03,
    foggy: 0.02,
    thunderstorm: 0
  },
  winter: {
    clear: 0.2,
    cloudy: 0.3,
    light_rain: 0.15,
    moderate_rain: 0.1,
    heavy_rain: 0.05,
    foggy: 0.2,
    thunderstorm: 0
  }
};

const WeatherTransitionRules = {
  clear: ['cloudy', 'light_rain'],
  cloudy: ['clear', 'light_rain', 'foggy'],
  light_rain: ['cloudy', 'moderate_rain', 'clear'],
  moderate_rain: ['light_rain', 'heavy_rain', 'cloudy'],
  heavy_rain: ['moderate_rain', 'thunderstorm'],
  foggy: ['cloudy', 'clear'],
  thunderstorm: ['heavy_rain', 'moderate_rain']
};

class WeatherSystem {
  constructor() {
    this.currentWeather = WeatherType.CLEAR;
    this.targetWeather = WeatherType.CLEAR;
    this.currentSeason = SeasonType.SPRING;
    this.transitionProgress = 1;
    this.transitionDuration = 8;
    this.transitionTimer = 0;
    this.weatherChangeCooldown = 0;
    this.weatherChangeInterval = 45;
    this.dynamicWeatherEnabled = true;
    this.raindrops = [];
    this.fogParticles = [];
    this.lightningFlash = 0;
    this.lightningTimer = 0;
    this.wetSurfaceAccumulation = 0;
    this.particleTimer = 0;
    this.currentConfig = { ...WeatherConfig.clear };
    this.targetConfig = { ...WeatherConfig.clear };
    this.blendedConfig = { ...WeatherConfig.clear };
    this.weatherHistory = [];
    this.maxHistoryLength = 10;
  }

  setSeason(season) {
    this.currentSeason = season;
  }

  setWeather(weatherType, transition = true) {
    const newConfig = WeatherConfig[weatherType];
    if (!newConfig) return;

    this.targetWeather = weatherType;
    this.targetConfig = { ...newConfig };
    this.weatherChangeCooldown = this.weatherChangeInterval;

    if (!transition) {
      this.currentWeather = weatherType;
      this.currentConfig = { ...newConfig };
      this.blendedConfig = { ...newConfig };
      this.transitionProgress = 1;
    } else {
      this.transitionProgress = 0;
      this.transitionTimer = 0;
    }

    this._recordWeatherHistory(weatherType);
  }

  setWeatherForEvent(eventWeather) {
    if (eventWeather && WeatherConfig[eventWeather]) {
      this.setWeather(eventWeather, false);
      this.dynamicWeatherEnabled = false;
    } else {
      this.dynamicWeatherEnabled = true;
      this._selectInitialWeather();
    }
  }

  enableDynamicWeather(enabled) {
    this.dynamicWeatherEnabled = enabled;
  }

  update(dt, raceState = 'racing') {
    if (raceState !== 'racing') {
      this._updateVisualParticles(dt);
      return;
    }

    this._updateTransition(dt);
    this._updateWeatherChangeCooldown(dt);

    if (this.dynamicWeatherEnabled && this.weatherChangeCooldown <= 0 && this.transitionProgress >= 1) {
      this._tryWeatherChange();
    }

    this._updateLightning(dt);
    this._updateWetSurface(dt);
    this._updateVisualParticles(dt);
    this._updateParticleSpawning(dt);

    this._snapshotTimer = (this._snapshotTimer || 0) + dt;
    if (this._snapshotTimer >= 10) {
      this._snapshotTimer = 0;
      this._recordRaceWeatherSnapshot();
    }
  }

  _updateTransition(dt) {
    if (this.transitionProgress < 1) {
      this.transitionTimer += dt;
      this.transitionProgress = Math.min(this.transitionTimer / this.transitionDuration, 1);

      if (this.transitionProgress >= 1) {
        this.currentWeather = this.targetWeather;
        this.currentConfig = { ...this.targetConfig };
      }

      this._blendWeatherConfigs();
    }
  }

  _blendWeatherConfigs() {
    const t = this.transitionProgress;
    const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const keys = Object.keys(this.currentConfig);
    for (const key of keys) {
      const current = this.currentConfig[key];
      const target = this.targetConfig[key];

      if (typeof current === 'number' && typeof target === 'number') {
        this.blendedConfig[key] = Utils.lerp(current, target, easeT);
      } else {
        this.blendedConfig[key] = t >= 0.5 ? target : current;
      }
    }
  }

  _updateWeatherChangeCooldown(dt) {
    if (this.weatherChangeCooldown > 0) {
      this.weatherChangeCooldown -= dt;
    }
  }

  _tryWeatherChange() {
    if (Math.random() < 0.3) {
      const possibleTransitions = WeatherTransitionRules[this.currentWeather] || [];
      if (possibleTransitions.length > 0) {
        const seasonWeights = SeasonWeatherWeights[this.currentSeason];
        const eventBias = this.getSeasonalEventBias();
        const weightedTransitions = possibleTransitions.map(w => ({
          weather: w,
          weight: (seasonWeights[w] || 0.1) * (eventBias[w] || 1.0)
        }));

        const totalWeight = weightedTransitions.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;

        for (const wt of weightedTransitions) {
          random -= wt.weight;
          if (random <= 0) {
            this.setWeather(wt.weather, true);
            break;
          }
        }
      }
    }
  }

  _selectInitialWeather() {
    const weights = SeasonWeatherWeights[this.currentSeason];
    const eventBias = this.getSeasonalEventBias();
    const weathers = Object.keys(weights);
    const totalWeight = weathers.reduce((sum, w) => sum + (weights[w] * (eventBias[w] || 1.0)), 0);
    let random = Math.random() * totalWeight;

    for (const weather of weathers) {
      const adjustedWeight = weights[weather] * (eventBias[weather] || 1.0);
      random -= adjustedWeight;
      if (random <= 0) {
        this.setWeather(weather, false);
        return;
      }
    }

    this.setWeather(WeatherType.CLEAR, false);
  }

  _updateLightning(dt) {
    const config = this.blendedConfig;

    if (config.lightningChance > 0) {
      this.lightningTimer += dt;
      if (this.lightningTimer > 5) {
        this.lightningTimer = 0;
        if (Math.random() < config.lightningChance) {
          this.lightningFlash = 1;
        }
      }
    }

    if (this.lightningFlash > 0) {
      this.lightningFlash -= dt * 3;
      this.lightningFlash = Math.max(0, this.lightningFlash);
    }
  }

  _updateWetSurface(dt) {
    const config = this.blendedConfig;
    const targetWetness = config.wetness;

    if (this.wetSurfaceAccumulation < targetWetness) {
      this.wetSurfaceAccumulation = Math.min(
        this.wetSurfaceAccumulation + dt * 0.05,
        targetWetness
      );
    } else if (this.wetSurfaceAccumulation > targetWetness) {
      this.wetSurfaceAccumulation = Math.max(
        this.wetSurfaceAccumulation - dt * 0.02,
        targetWetness
      );
    }
  }

  _updateVisualParticles(dt) {
    const config = this.blendedConfig;

    for (let i = this.raindrops.length - 1; i >= 0; i--) {
      const drop = this.raindrops[i];
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;
      drop.life -= dt;

      if (drop.life <= 0 || drop.y > drop.maxY) {
        this.raindrops.splice(i, 1);
      }
    }

    for (let i = this.fogParticles.length - 1; i >= 0; i--) {
      const fog = this.fogParticles[i];
      fog.x += fog.vx * dt;
      fog.y += fog.vy * dt;
      fog.life -= dt;
      fog.alpha = Math.sin((1 - fog.life / fog.maxLife) * Math.PI) * 0.3;

      if (fog.life <= 0) {
        this.fogParticles.splice(i, 1);
      }
    }
  }

  _updateParticleSpawning(dt) {
    const config = this.blendedConfig;
    this.particleTimer += dt;

    const spawnInterval = config.particlesPerSecond > 0 ? 1 / config.particlesPerSecond : 1;

    while (this.particleTimer >= spawnInterval && config.particlesPerSecond > 0) {
      this.particleTimer -= spawnInterval;
      this._spawnRaindrop();
    }

    if (config.fogDensity > 0.3 && this.fogParticles.length < 50) {
      if (Math.random() < dt * 2) {
        this._spawnFogParticle();
      }
    }
  }

  _spawnRaindrop() {
    const config = this.blendedConfig;
    const angle = -Math.PI / 2 + config.windSpeed * 0.5;
    const speed = 400 + config.rainIntensity * 200;

    this.raindrops.push({
      x: Utils.randomRange(-400, 400),
      y: Utils.randomRange(-400, 0),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: Utils.randomRange(8, 15) * config.rainIntensity,
      alpha: Utils.randomRange(0.3, 0.6),
      life: 2,
      maxY: 600
    });
  }

  _spawnFogParticle() {
    const config = this.blendedConfig;

    this.fogParticles.push({
      x: Utils.randomRange(-500, 500),
      y: Utils.randomRange(-500, 500),
      vx: Utils.randomRange(-5, 5) * config.windSpeed,
      vy: Utils.randomRange(-2, 2),
      size: Utils.randomRange(50, 150),
      alpha: 0,
      life: Utils.randomRange(5, 10),
      maxLife: 10
    });
  }

  _recordWeatherHistory(weatherType) {
    this.weatherHistory.push({
      weather: weatherType,
      timestamp: Date.now(),
      config: { ...WeatherConfig[weatherType] }
    });

    if (this.weatherHistory.length > this.maxHistoryLength) {
      this.weatherHistory.shift();
    }
  }

  getConfig() {
    return this.blendedConfig;
  }

  getCurrentWeather() {
    return this.currentWeather;
  }

  getTargetWeather() {
    return this.targetWeather;
  }

  isTransitioning() {
    return this.transitionProgress < 1;
  }

  getTransitionProgress() {
    return this.transitionProgress;
  }

  getWetness() {
    return this.wetSurfaceAccumulation;
  }

  getLightningFlash() {
    return this.lightningFlash;
  }

  getRaindrops() {
    return this.raindrops;
  }

  getFogParticles() {
    return this.fogParticles;
  }

  getVisibility() {
    return this.blendedConfig.visibility;
  }

  getScoreMultiplier() {
    return this.blendedConfig.scoreMultiplier;
  }

  getLapTimeMultiplier() {
    return this.blendedConfig.lapTimeMultiplier;
  }

  getGripMultiplier() {
    return this.blendedConfig.gripMultiplier;
  }

  getWeatherIcon() {
    return this.blendedConfig.icon;
  }

  getWeatherName() {
    return this.blendedConfig.name;
  }

  getWeatherColor() {
    return this.blendedConfig.color;
  }

  getRainIntensity() {
    return this.blendedConfig.rainIntensity;
  }

  getFogDensity() {
    return this.blendedConfig.fogDensity;
  }

  getWindSpeed() {
    return this.blendedConfig.windSpeed;
  }

  getAmbientColor() {
    return this.blendedConfig.ambientColor;
  }

  getSkyBrightness() {
    return this.blendedConfig.skyBrightness;
  }

  reset() {
    this.raindrops = [];
    this.fogParticles = [];
    this.lightningFlash = 0;
    this.lightningTimer = 0;
    this.wetSurfaceAccumulation = 0;
    this.particleTimer = 0;
    this.weatherChangeCooldown = 0;
    this.transitionProgress = 1;
    this.transitionTimer = 0;
    this.weatherHistory = [];
    this.dynamicWeatherEnabled = true;
    this._selectInitialWeather();
  }

  getWeatherHistory() {
    return [...this.weatherHistory];
  }

  getAvailableWeathers() {
    return WeatherTypeKeys.map(key => WeatherConfig[key.toLowerCase()]);
  }

  getSeasonName(season) {
    const names = {
      spring: '春季',
      summer: '夏季',
      autumn: '秋季',
      winter: '冬季'
    };
    return names[season] || season;
  }

  getCurrentSeasonName() {
    return this.getSeasonName(this.currentSeason);
  }

  getSeasonConfig(season) {
    const seasonKey = season || this.currentSeason;
    return SeasonConfigs[seasonKey] || SeasonConfigs.spring;
  }

  getCurrentSeasonConfig() {
    return this.getSeasonConfig(this.currentSeason);
  }

  getAverageGripMultiplier() {
    if (this.weatherHistory.length === 0) {
      return this.blendedConfig.gripMultiplier;
    }
    const sum = this.weatherHistory.reduce((s, h) => s + (h.config.gripMultiplier || 1), 0);
    return sum / this.weatherHistory.length;
  }

  getAverageVisibility() {
    if (this.weatherHistory.length === 0) {
      return this.blendedConfig.visibility;
    }
    const sum = this.weatherHistory.reduce((s, h) => s + (h.config.visibility || 1), 0);
    return sum / this.weatherHistory.length;
  }

  getAverageRainIntensity() {
    if (this.weatherHistory.length === 0) {
      return this.blendedConfig.rainIntensity;
    }
    const sum = this.weatherHistory.reduce((s, h) => s + (h.config.rainIntensity || 0), 0);
    return sum / this.weatherHistory.length;
  }

  getDifficultyRating() {
    const config = this.blendedConfig;
    const gripPenalty = (1 - config.gripMultiplier) * 40;
    const visibilityPenalty = (1 - config.visibility) * 30;
    const rainPenalty = config.rainIntensity * 15;
    const fogPenalty = config.fogDensity * 10;
    const lightningPenalty = config.lightningChance * 50;
    return Math.min(100, Math.round(gripPenalty + visibilityPenalty + rainPenalty + fogPenalty + lightningPenalty));
  }

  getScoreMultiplierForSeason() {
    const seasonConfig = this.getCurrentSeasonConfig();
    const weatherScoreMult = this.blendedConfig.scoreMultiplier;
    const seasonBonus = seasonConfig.scoreBonus || 1.0;
    return weatherScoreMult * seasonBonus;
  }

  getLapTimeCorrection() {
    const config = this.blendedConfig;
    const seasonConfig = this.getCurrentSeasonConfig();
    const weatherCorrection = config.lapTimeMultiplier;
    const seasonCorrection = seasonConfig.lapTimeCorrection || 1.0;
    return weatherCorrection * seasonCorrection;
  }

  getCoinMultiplier() {
    const difficultyRating = this.getDifficultyRating();
    const baseMult = 1 + difficultyRating / 100 * 0.5;
    const seasonConfig = this.getCurrentSeasonConfig();
    const seasonBonus = seasonConfig.coinBonus || 1.0;
    return baseMult * seasonBonus;
  }

  getXPBonus() {
    const difficultyRating = this.getDifficultyRating();
    return Math.round(difficultyRating * 0.8);
  }

  getWeatherDifficultyLabel() {
    const rating = this.getDifficultyRating();
    if (rating < 10) return { label: '安逸', color: '#00ff66' };
    if (rating < 25) return { label: '简单', color: '#88ff00' };
    if (rating < 45) return { label: '普通', color: '#ffff00' };
    if (rating < 65) return { label: '困难', color: '#ff8800' };
    if (rating < 85) return { label: '极难', color: '#ff4400' };
    return { label: '地狱', color: '#ff0044' };
  }

  getSeasonalBonusDescription() {
    const config = this.getCurrentSeasonConfig();
    const bonuses = [];
    if (config.coinBonus > 1.0) bonuses.push(`金币 +${Math.round((config.coinBonus - 1) * 100)}%`);
    if (config.scoreBonus > 1.0) bonuses.push(`分数 +${Math.round((config.scoreBonus - 1) * 100)}%`);
    if (config.xpBonus > 0) bonuses.push(`经验 +${config.xpBonus}`);
    if (config.gripModifier !== 1.0) bonuses.push(`抓地力 ${config.gripModifier > 1 ? '+' : ''}${Math.round((config.gripModifier - 1) * 100)}%`);
    return bonuses;
  }

  isRainy() {
    return this.blendedConfig.rainIntensity > 0.1;
  }

  isFoggy() {
    return this.blendedConfig.fogDensity > 0.2;
  }

  isStormy() {
    return this.blendedConfig.lightningChance > 0;
  }

  getWeatherSeverity() {
    const clear = this.blendedConfig.gripMultiplier > 0.9 && this.blendedConfig.visibility > 0.9;
    if (clear) return 0;
    const mild = this.blendedConfig.gripMultiplier > 0.8 && this.blendedConfig.visibility > 0.7;
    if (mild) return 1;
    const moderate = this.blendedConfig.gripMultiplier > 0.65 && this.blendedConfig.visibility > 0.5;
    if (moderate) return 2;
    const severe = this.blendedConfig.gripMultiplier > 0.5 && this.blendedConfig.visibility > 0.35;
    if (severe) return 3;
    return 4;
  }

  getSeasonalEventBias() {
    const seasonConfig = this.getCurrentSeasonConfig();
    return seasonConfig.eventWeatherBias || {};
  }

  forceWeatherBySeasonEvent(eventWeather) {
    if (eventWeather && WeatherConfig[eventWeather]) {
      this.setWeather(eventWeather, false);
      return true;
    }
    return false;
  }

  startRaceWeatherSetup(season, eventWeatherOverride = null, dynamicEnabled = true) {
    this.setSeason(season);

    const hasForcedWeather = eventWeatherOverride && this.forceWeatherBySeasonEvent(eventWeatherOverride);
    this.dynamicWeatherEnabled = dynamicEnabled;

    if (!hasForcedWeather) {
      this._selectInitialWeather();
    }

    this.raceWeatherSnapshots = [];
    this._recordRaceWeatherSnapshot();
  }

  _recordRaceWeatherSnapshot() {
    if (!this.raceWeatherSnapshots) this.raceWeatherSnapshots = [];
    this.raceWeatherSnapshots.push({
      timestamp: Date.now(),
      weather: this.currentWeather,
      grip: this.blendedConfig.gripMultiplier,
      visibility: this.blendedConfig.visibility,
      rainIntensity: this.blendedConfig.rainIntensity,
      fogDensity: this.blendedConfig.fogDensity
    });
  }

  getRaceWeatherSummary() {
    if (!this.raceWeatherSnapshots || this.raceWeatherSnapshots.length === 0) {
      return {
        weatherTypes: [this.currentWeather],
        avgGrip: this.blendedConfig.gripMultiplier,
        avgVisibility: this.blendedConfig.visibility,
        peakRain: this.blendedConfig.rainIntensity,
        peakFog: this.blendedConfig.fogDensity
      };
    }
    const snapshots = this.raceWeatherSnapshots;
    const weatherTypes = [...new Set(snapshots.map(s => s.weather))];
    const avgGrip = snapshots.reduce((s, n) => s + n.grip, 0) / snapshots.length;
    const avgVisibility = snapshots.reduce((s, n) => s + n.visibility, 0) / snapshots.length;
    const peakRain = Math.max(...snapshots.map(s => s.rainIntensity));
    const peakFog = Math.max(...snapshots.map(s => s.fogDensity));
    return { weatherTypes, avgGrip, avgVisibility, peakRain, peakFog };
  }

  finishRaceWeatherRecording() {
    this._recordRaceWeatherSnapshot();
    const summary = this.getRaceWeatherSummary();
    summary.coinMultiplier = this.getCoinMultiplier();
    summary.scoreMultiplier = this.getScoreMultiplierForSeason();
    summary.lapTimeCorrection = this.getLapTimeCorrection();
    summary.difficultyRating = this.getDifficultyRating();
    summary.xpBonus = this.getXPBonus();
    summary.season = this.currentSeason;
    return summary;
  }
}

const SeasonConfigs = {
  spring: {
    id: 'spring',
    name: '春季',
    nameEn: 'Spring',
    description: '春暖花开，雨水渐多，赛道微湿',
    icon: '🌸',
    color: '#ff99cc',
    ambientTint: 'rgba(255, 200, 230, 0.04)',
    gripModifier: 0.98,
    coinBonus: 1.1,
    scoreBonus: 1.05,
    xpBonus: 5,
    lapTimeCorrection: 1.02,
    typicalWeathers: ['clear', 'cloudy', 'light_rain'],
    eventWeatherBias: {
      clear: 1.0,
      cloudy: 1.2,
      light_rain: 1.5,
      moderate_rain: 0.8,
      foggy: 0.6
    },
    hazards: ['occasional_rain'],
    tireRecommendation: '中性胎'
  },
  summer: {
    id: 'summer',
    name: '夏季',
    nameEn: 'Summer',
    description: '烈日炎炎，偶有雷暴，路面温度高',
    icon: '☀',
    color: '#ffdd00',
    ambientTint: 'rgba(255, 220, 100, 0.05)',
    gripModifier: 1.02,
    coinBonus: 1.0,
    scoreBonus: 1.0,
    xpBonus: 0,
    lapTimeCorrection: 0.98,
    typicalWeathers: ['clear', 'cloudy', 'thunderstorm'],
    eventWeatherBias: {
      clear: 1.5,
      cloudy: 1.0,
      light_rain: 0.6,
      thunderstorm: 1.3,
      heavy_rain: 0.5
    },
    hazards: ['sudden_thunderstorm'],
    tireRecommendation: '干地胎'
  },
  autumn: {
    id: 'autumn',
    name: '秋季',
    nameEn: 'Autumn',
    description: '秋高气爽，落叶纷飞，早晚温差大',
    icon: '🍂',
    color: '#ff9944',
    ambientTint: 'rgba(255, 180, 100, 0.04)',
    gripModifier: 0.97,
    coinBonus: 1.15,
    scoreBonus: 1.1,
    xpBonus: 10,
    lapTimeCorrection: 1.03,
    typicalWeathers: ['clear', 'cloudy', 'foggy', 'light_rain'],
    eventWeatherBias: {
      clear: 1.2,
      cloudy: 1.3,
      light_rain: 1.0,
      moderate_rain: 0.7,
      foggy: 1.5
    },
    hazards: ['morning_fog', 'wet_leaves'],
    tireRecommendation: '中性胎'
  },
  winter: {
    id: 'winter',
    name: '冬季',
    nameEn: 'Winter',
    description: '严寒刺骨，浓雾弥漫，路面极度湿滑',
    icon: '❄',
    color: '#aaddff',
    ambientTint: 'rgba(150, 200, 255, 0.06)',
    gripModifier: 0.9,
    coinBonus: 1.25,
    scoreBonus: 1.2,
    xpBonus: 20,
    lapTimeCorrection: 1.08,
    typicalWeathers: ['cloudy', 'foggy', 'light_rain', 'heavy_rain'],
    eventWeatherBias: {
      clear: 0.6,
      cloudy: 1.2,
      light_rain: 1.2,
      moderate_rain: 1.3,
      heavy_rain: 1.5,
      foggy: 2.0
    },
    hazards: ['thick_fog', 'icy_patches', 'heavy_rain'],
    tireRecommendation: '雨胎'
  }
};
