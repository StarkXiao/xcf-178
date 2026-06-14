const CareerState = {
  MAP: 'careerMap',
  EVENT_DETAIL: 'eventDetail',
  UPGRADE: 'careerUpgrade',
  STAGE_CLEAR: 'stageClear',
  RACE_RESULT: 'careerRaceResult'
};

const UpgradeTypes = {
  speed: {
    id: 'speed',
    name: '极速',
    icon: '⚡',
    color: '#ff00ff',
    description: '提升最大速度',
    baseCost: 500,
    costMultiplier: 1.5,
    maxLevel: 10,
    effectPerLevel: 8,
    stat: 'baseMaxSpeed'
  },
  acceleration: {
    id: 'acceleration',
    name: '加速',
    icon: '🚀',
    color: '#00f5ff',
    description: '提升加速度',
    baseCost: 400,
    costMultiplier: 1.5,
    maxLevel: 10,
    effectPerLevel: 10,
    stat: 'baseAcceleration'
  },
  handling: {
    id: 'handling',
    name: '操控',
    icon: '🎯',
    color: '#00ff66',
    description: '提升转向速度',
    baseCost: 450,
    costMultiplier: 1.5,
    maxLevel: 10,
    effectPerLevel: 0.15,
    stat: 'steerSpeed'
  },
  nitro: {
    id: 'nitro',
    name: '氮气',
    icon: '💨',
    color: '#ffff00',
    description: '提升氮气容量和恢复',
    baseCost: 600,
    costMultiplier: 1.5,
    maxLevel: 10,
    effectPerLevel: 15,
    stat: 'nitroMaxEnergy'
  }
};

const UpgradeTypeKeys = Object.keys(UpgradeTypes);

const CareerStages = [
  {
    id: 'stage1',
    name: '新手训练营',
    subtitle: '第一阶段',
    color: '#00f5ff',
    bgColor: '#004455',
    description: '欢迎来到极速霓虹！在这里学习基础驾驶技巧。',
    reward: 1000,
    season: 'spring',
    dynamicWeather: true,
    defaultWeather: 'clear',
    events: [
      {
        id: 'event1_1',
        name: '入门练习',
        difficulty: 'easy',
        laps: 1,
        reward: 200,
        description: '熟悉赛道和操控',
        unlockRequirement: null,
        weather: 'clear',
        dynamicWeather: false
      },
      {
        id: 'event1_2',
        name: '弯道挑战',
        difficulty: 'easy',
        laps: 2,
        reward: 300,
        description: '学习弯道技巧',
        unlockRequirement: 'event1_1',
        weather: 'cloudy',
        dynamicWeather: false
      },
      {
        id: 'event1_3',
        name: '新手杯',
        difficulty: 'easy',
        laps: 3,
        reward: 500,
        description: '第一个正式比赛',
        unlockRequirement: 'event1_2',
        weather: null,
        dynamicWeather: true
      }
    ]
  },
  {
    id: 'stage2',
    name: '城市街道',
    subtitle: '第二阶段',
    color: '#ff00ff',
    bgColor: '#440044',
    description: '霓虹都市的街道竞速，考验你的反应力。',
    reward: 2000,
    season: 'summer',
    dynamicWeather: true,
    defaultWeather: 'clear',
    events: [
      {
        id: 'event2_1',
        name: '街道热身',
        difficulty: 'normal',
        laps: 2,
        reward: 400,
        description: '适应城市赛道',
        unlockRequirement: 'event1_3',
        weather: 'clear',
        dynamicWeather: false
      },
      {
        id: 'event2_2',
        name: '夜间追逐',
        difficulty: 'normal',
        laps: 3,
        reward: 500,
        description: '与AI对手竞速',
        unlockRequirement: 'event2_1',
        weather: 'cloudy',
        dynamicWeather: true
      },
      {
        id: 'event2_3',
        name: '漂移大师',
        difficulty: 'normal',
        laps: 3,
        reward: 600,
        description: '考验漂移技巧',
        unlockRequirement: 'event2_2',
        weather: 'light_rain',
        dynamicWeather: true
      },
      {
        id: 'event2_4',
        name: '城市大奖赛',
        difficulty: 'normal',
        laps: 5,
        reward: 1000,
        description: '城市阶段最终赛',
        unlockRequirement: 'event2_3',
        weather: 'thunderstorm',
        dynamicWeather: true
      }
    ]
  },
  {
    id: 'stage3',
    name: '高速公路',
    subtitle: '第三阶段',
    color: '#ffff00',
    bgColor: '#444400',
    description: '高速赛道上的极速对决，速度就是一切！',
    reward: 3500,
    season: 'autumn',
    dynamicWeather: true,
    defaultWeather: 'cloudy',
    events: [
      {
        id: 'event3_1',
        name: '高速入口',
        difficulty: 'hard',
        laps: 3,
        reward: 700,
        description: '进入高速领域',
        unlockRequirement: 'event2_4',
        weather: 'foggy',
        dynamicWeather: false
      },
      {
        id: 'event3_2',
        name: '极速狂飙',
        difficulty: 'hard',
        laps: 4,
        reward: 800,
        description: '考验极速性能',
        unlockRequirement: 'event3_1',
        weather: 'cloudy',
        dynamicWeather: true
      },
      {
        id: 'event3_3',
        name: '氮气对决',
        difficulty: 'hard',
        laps: 4,
        reward: 900,
        description: '氮气使用技巧',
        unlockRequirement: 'event3_2',
        weather: 'light_rain',
        dynamicWeather: true
      },
      {
        id: 'event3_4',
        name: '高速锦标赛',
        difficulty: 'hard',
        laps: 7,
        reward: 1500,
        description: '高速阶段最终赛',
        unlockRequirement: 'event3_3',
        weather: 'moderate_rain',
        dynamicWeather: true
      }
    ]
  },
  {
    id: 'stage4',
    name: '传奇之路',
    subtitle: '最终阶段',
    color: '#ff6600',
    bgColor: '#442200',
    description: '成为传奇车神的最终考验，你准备好了吗？',
    reward: 5000,
    season: 'winter',
    dynamicWeather: true,
    defaultWeather: 'heavy_rain',
    events: [
      {
        id: 'event4_1',
        name: '传奇入门',
        difficulty: 'hell',
        laps: 3,
        reward: 1000,
        description: '地狱难度开始',
        unlockRequirement: 'event3_4',
        weather: 'foggy',
        dynamicWeather: true
      },
      {
        id: 'event4_2',
        name: '极限挑战',
        difficulty: 'hell',
        laps: 5,
        reward: 1200,
        description: '突破极限',
        unlockRequirement: 'event4_1',
        weather: 'heavy_rain',
        dynamicWeather: true
      },
      {
        id: 'event4_3',
        name: '冠军之路',
        difficulty: 'hell',
        laps: 7,
        reward: 1500,
        description: '向冠军进发',
        unlockRequirement: 'event4_2',
        weather: 'moderate_rain',
        dynamicWeather: true
      },
      {
        id: 'event4_4',
        name: '传奇决战',
        difficulty: 'hell',
        laps: 10,
        reward: 3000,
        description: '最终决战！成为传奇！',
        unlockRequirement: 'event4_3',
        weather: 'thunderstorm',
        dynamicWeather: true
      }
    ]
  }
];

const PrizeMultipliers = {
  1: 1.0,
  2: 0.6,
  3: 0.4,
  4: 0.25,
  5: 0.15
};

const SponsorConditionType = {
  RANK_FIRST: 'rankFirst',
  RANK_TOP3: 'rankTop3',
  DRIFT_DISTANCE: 'driftDistance',
  ZERO_COLLISION: 'zeroCollision',
  ZERO_OBSTACLE: 'zeroObstacle',
  COMPLETE_STAGE: 'completeStage',
  WIN_STREAK: 'winStreak',
  DRIFT_PER_LAP: 'driftPerLap'
};

const SponsorContracts = [
  {
    id: 'sponsor_nova',
    name: '新星动力',
    icon: '⭐',
    color: '#00f5ff',
    bgColor: '#003344',
    description: '面向新秀车手的入门赞助',
    conditions: [
      { type: SponsorConditionType.RANK_TOP3, description: '进入前三名', target: 1, current: 0 }
    ],
    coinBonus: 0.15,
    shopDiscount: 0.05,
    unlockVehicles: [],
    unlockEngines: [],
    unlockTires: [],
    requiredStage: 'stage1',
    tier: 0
  },
  {
    id: 'sponsor_drift_king',
    name: '漂移之王',
    icon: '🌀',
    color: '#ff00ff',
    bgColor: '#330033',
    description: '为漂移高手提供顶级装备赞助',
    conditions: [
      { type: SponsorConditionType.DRIFT_DISTANCE, description: '单场漂移距离 ≥ 2000', target: 2000, current: 0 }
    ],
    coinBonus: 0.20,
    shopDiscount: 0.10,
    unlockVehicles: [],
    unlockEngines: [],
    unlockTires: [3],
    requiredStage: 'stage2',
    tier: 1
  },
  {
    id: 'sponsor_clean_run',
    name: '纯净赛道',
    icon: '🛡️',
    color: '#00ff66',
    bgColor: '#003311',
    description: '零碰撞车手的守护者赞助',
    conditions: [
      { type: SponsorConditionType.ZERO_COLLISION, description: '零车手碰撞完赛', target: 1, current: 0 },
      { type: SponsorConditionType.ZERO_OBSTACLE, description: '零障碍碰撞完赛', target: 1, current: 0 }
    ],
    coinBonus: 0.25,
    shopDiscount: 0.15,
    unlockVehicles: [],
    unlockEngines: [3],
    unlockTires: [],
    requiredStage: 'stage2',
    tier: 1
  },
  {
    id: 'sponsor_champion',
    name: '冠军荣耀',
    icon: '🏆',
    color: '#ffd700',
    bgColor: '#332800',
    description: '冠军专属高阶赞助合约',
    conditions: [
      { type: SponsorConditionType.RANK_FIRST, description: '获得第一名', target: 1, current: 0 },
      { type: SponsorConditionType.DRIFT_DISTANCE, description: '单场漂移距离 ≥ 1500', target: 1500, current: 0 }
    ],
    coinBonus: 0.30,
    shopDiscount: 0.15,
    unlockVehicles: [],
    unlockEngines: [],
    unlockTires: [5],
    requiredStage: 'stage3',
    tier: 2
  },
  {
    id: 'sponsor_nitro_fuel',
    name: '氮气燃料',
    icon: '🔥',
    color: '#ff6600',
    bgColor: '#331500',
    description: '速度与激情的极致赞助',
    conditions: [
      { type: SponsorConditionType.WIN_STREAK, description: '连胜3场', target: 3, current: 0 }
    ],
    coinBonus: 0.25,
    shopDiscount: 0.10,
    unlockVehicles: [],
    unlockEngines: [4],
    unlockTires: [],
    requiredStage: 'stage3',
    tier: 2
  },
  {
    id: 'sponsor_legend',
    name: '传奇殿堂',
    icon: '👑',
    color: '#ff0044',
    bgColor: '#330011',
    description: '传奇车手的终极赞助，解锁一切',
    conditions: [
      { type: SponsorConditionType.COMPLETE_STAGE, description: '通关所有阶段', target: 4, current: 0 },
      { type: SponsorConditionType.RANK_FIRST, description: '获得第一名 × 5', target: 5, current: 0 },
      { type: SponsorConditionType.DRIFT_PER_LAP, description: '单圈漂移距离 ≥ 800', target: 800, current: 0 }
    ],
    coinBonus: 0.50,
    shopDiscount: 0.25,
    unlockVehicles: [],
    unlockEngines: [],
    unlockTires: [],
    requiredStage: 'stage4',
    tier: 3
  }
];

const SponsorContractKeys = SponsorContracts.map(s => s.id);

class CareerManager {
  constructor() {
    this.coins = 0;
    this.currentStageIndex = 0;
    this.currentEventIndex = 0;
    this.selectedEventId = null;
    this.upgrades = {};
    this.eventResults = {};
    this.completedStages = [];
    this.showingStageClear = false;
    this.lastRaceResult = null;
    this.mapCursor = 0;
    this.mapMode = 'stage';
    this.upgradeCursor = 0;

    this.sponsorProgress = {};
    this.activeSponsors = [];
    this._winStreak = 0;
    this._firstPlaceCount = 0;
    this._sponsorBonusCoins = 0;
    this._newlyActivatedSponsors = [];

    this._loadProgress();
    this._initUpgrades();
  }

  _initUpgrades() {
    UpgradeTypeKeys.forEach(key => {
      if (!this.upgrades[key]) {
        this.upgrades[key] = 0;
      }
    });
  }

  _loadProgress() {
    try {
      const data = localStorage.getItem('neonRacer_careerProgress');
      if (data) {
        const saved = JSON.parse(data);
        this.coins = saved.coins || 0;
        this.upgrades = saved.upgrades || {};
        this.eventResults = saved.eventResults || {};
        this.completedStages = saved.completedStages || [];
        this.sponsorProgress = saved.sponsorProgress || {};
        this.activeSponsors = saved.activeSponsors || [];
        this._winStreak = saved.winStreak || 0;
        this._firstPlaceCount = saved.firstPlaceCount || 0;
      }
    } catch (e) {}
  }

  _saveProgress() {
    try {
      const data = {
        coins: this.coins,
        upgrades: this.upgrades,
        eventResults: this.eventResults,
        completedStages: this.completedStages,
        sponsorProgress: this.sponsorProgress,
        activeSponsors: this.activeSponsors,
        winStreak: this._winStreak,
        firstPlaceCount: this._firstPlaceCount
      };
      localStorage.setItem('neonRacer_careerProgress', JSON.stringify(data));
    } catch (e) {}
  }

  addCoins(amount) {
    if (amount <= 0) return 0;
    this.coins += amount;
    this._saveProgress();
    return amount;
  }

  getStages() {
    return CareerStages;
  }

  getCurrentStage() {
    return CareerStages[this.currentStageIndex];
  }

  getStage(index) {
    return CareerStages[index] || null;
  }

  getEventById(eventId) {
    for (const stage of CareerStages) {
      const event = stage.events.find(e => e.id === eventId);
      if (event) return { event, stage };
    }
    return null;
  }

  isEventUnlocked(eventId) {
    const result = this.getEventById(eventId);
    if (!result) return false;
    const event = result.event;
    if (!event.unlockRequirement) return true;
    return !!this.eventResults[event.unlockRequirement];
  }

  isEventCompleted(eventId) {
    return !!this.eventResults[eventId];
  }

  getEventBestResult(eventId) {
    return this.eventResults[eventId] || null;
  }

  isStageCompleted(stageId) {
    return this.completedStages.includes(stageId);
  }

  isStageUnlocked(stageIndex) {
    if (stageIndex === 0) return true;
    const prevStage = CareerStages[stageIndex - 1];
    if (!prevStage) return false;
    return prevStage.events.every(e => this.isEventCompleted(e.id));
  }

  calculateUpgradeCost(upgradeId) {
    const upgrade = UpgradeTypes[upgradeId];
    if (!upgrade) return Infinity;
    const level = this.upgrades[upgradeId] || 0;
    if (level >= upgrade.maxLevel) return Infinity;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
  }

  canUpgrade(upgradeId) {
    const upgrade = UpgradeTypes[upgradeId];
    if (!upgrade) return false;
    const level = this.upgrades[upgradeId] || 0;
    if (level >= upgrade.maxLevel) return false;
    return this.coins >= this.getDiscountedPrice(this.calculateUpgradeCost(upgradeId));
  }

  upgradeVehicle(upgradeId) {
    if (!this.canUpgrade(upgradeId)) return false;
    const cost = this.getDiscountedPrice(this.calculateUpgradeCost(upgradeId));
    this.coins -= cost;
    this.upgrades[upgradeId] = (this.upgrades[upgradeId] || 0) + 1;
    this._saveProgress();
    return true;
  }

  getUpgradeLevel(upgradeId) {
    return this.upgrades[upgradeId] || 0;
  }

  getTotalUpgradeBonus(upgradeId) {
    const upgrade = UpgradeTypes[upgradeId];
    if (!upgrade) return 0;
    const level = this.upgrades[upgradeId] || 0;
    return level * upgrade.effectPerLevel;
  }

  applyUpgradesToBike(bike, vehicleType) {
    const baseVehicle = VehicleTypes[vehicleType];
    if (!baseVehicle) return;

    UpgradeTypeKeys.forEach(upgradeId => {
      const upgrade = UpgradeTypes[upgradeId];
      const level = this.upgrades[upgradeId] || 0;
      if (level <= 0) return;

      const bonus = level * upgrade.effectPerLevel;
      const stat = upgrade.stat;

      if (stat === 'baseMaxSpeed') {
        bike.baseMaxSpeed = baseVehicle.baseMaxSpeed + bonus;
        bike.maxSpeed = bike.baseMaxSpeed;
      } else if (stat === 'baseAcceleration') {
        bike.baseAcceleration = baseVehicle.baseAcceleration + bonus;
        bike.acceleration = bike.baseAcceleration;
      } else if (stat === 'steerSpeed') {
        bike.steerSpeed = baseVehicle.steerSpeed + bonus;
      } else if (stat === 'nitroMaxEnergy') {
        bike.nitroMaxEnergy = baseVehicle.nitroMaxEnergy + bonus;
        bike.nitroChargeRate = baseVehicle.nitroChargeRate + bonus * 0.3;
      }
    });
  }

  processRaceResult(eventId, rank, time, bestLap, totalLaps, weatherSummary = null, raceStats = null) {
    const result = this.getEventById(eventId);
    if (!result) return { coinsEarned: 0, isNewBest: false };

    const event = result.event;
    const multiplier = PrizeMultipliers[rank] || 0.1;
    let coinsEarned = Math.floor(event.reward * multiplier);

    let correctedTime = time;
    let adjustedBestLap = bestLap;
    let weatherBonusInfo = null;

    if (weatherSummary) {
      const lapTimeCorrection = weatherSummary.lapTimeCorrection || 1.0;
      if (lapTimeCorrection > 1.0) {
        correctedTime = time / lapTimeCorrection;
        if (bestLap && bestLap < Infinity) {
          adjustedBestLap = bestLap / lapTimeCorrection;
        }
      }

      const weatherCoinMult = weatherSummary.coinMultiplier || 1.0;
      if (weatherCoinMult > 1.0) {
        coinsEarned = Math.floor(coinsEarned * weatherCoinMult);
      }

      const seasonConfig = SeasonConfigs[weatherSummary.season] || null;
      weatherBonusInfo = {
        difficultyRating: weatherSummary.difficultyRating || 0,
        coinMultiplier: weatherCoinMult,
        scoreMultiplier: weatherSummary.scoreMultiplier || 1.0,
        lapTimeCorrection: lapTimeCorrection,
        xpBonus: weatherSummary.xpBonus || 0,
        seasonName: seasonConfig ? seasonConfig.name : null,
        seasonIcon: seasonConfig ? seasonConfig.icon : null,
        weatherTypes: weatherSummary.weatherTypes || [],
        avgGrip: weatherSummary.avgGrip || 1.0,
        avgVisibility: weatherSummary.avgVisibility || 1.0,
        peakRain: weatherSummary.peakRain || 0,
        peakFog: weatherSummary.peakFog || 0
      };
    }

    this.coins += coinsEarned;

    if (rank === 1) {
      this._winStreak++;
      this._firstPlaceCount++;
    } else {
      this._winStreak = 0;
    }

    let sponsorBonusCoins = 0;
    let sponsorDetails = [];
    if (raceStats) {
      const sponsorResult = this._processSponsorRewards(rank, raceStats);
      sponsorBonusCoins = sponsorResult.bonusCoins;
      sponsorDetails = sponsorResult.details;
      this.coins += sponsorBonusCoins;
      this._sponsorBonusCoins = sponsorBonusCoins;
    }

    const prevResult = this.eventResults[eventId];
    const isNewBest = !prevResult || correctedTime < prevResult.time;

    if (isNewBest) {
      this.eventResults[eventId] = {
        rank: rank,
        time: correctedTime,
        bestLap: adjustedBestLap,
        totalLaps: totalLaps || event.laps,
        date: Date.now(),
        weatherInfo: weatherBonusInfo
      };
    }

    this.lastRaceResult = {
      eventId: eventId,
      rank: rank,
      time: correctedTime,
      rawTime: time,
      bestLap: adjustedBestLap,
      rawBestLap: bestLap,
      coinsEarned: coinsEarned,
      sponsorBonusCoins: sponsorBonusCoins,
      sponsorDetails: sponsorDetails,
      isNewBest: isNewBest,
      totalLaps: totalLaps || event.laps,
      weatherInfo: weatherBonusInfo
    };

    this._checkStageCompletion(result.stage);

    this._saveProgress();

    return { coinsEarned, isNewBest, correctedTime, adjustedBestLap, weatherInfo: weatherBonusInfo, sponsorBonusCoins, sponsorDetails };
  }

  _checkStageCompletion(stage) {
    if (this.completedStages.includes(stage.id)) return;

    const allCompleted = stage.events.every(e =>
      this.isEventCompleted(e.id)
    );

    if (allCompleted) {
      this.completedStages.push(stage.id);
      this.coins += stage.reward;
      this.showingStageClear = true;
    }
  }

  getTotalEventCount() {
    return CareerStages.reduce((total, stage) => total + stage.events.length, 0);
  }

  getCompletedEventCount() {
    return Object.keys(this.eventResults).length;
  }

  selectEvent(eventId) {
    if (this.isEventUnlocked(eventId)) {
      this.selectedEventId = eventId;
      return true;
    }
    return false;
  }

  getSelectedEvent() {
    if (!this.selectedEventId) return null;
    return this.getEventById(this.selectedEventId);
  }

  resetProgress() {
    this.coins = 0;
    this.currentStageIndex = 0;
    this.currentEventIndex = 0;
    this.selectedEventId = null;
    this.upgrades = {};
    this.eventResults = {};
    this.completedStages = [];
    this.showingStageClear = false;
    this.lastRaceResult = null;
    this.sponsorProgress = {};
    this.activeSponsors = [];
    this._winStreak = 0;
    this._firstPlaceCount = 0;
    this._sponsorBonusCoins = 0;
    this._newlyActivatedSponsors = [];
    this._initUpgrades();
    this._saveProgress();
  }

  getSponsorContracts() {
    return SponsorContracts;
  }

  getSponsorById(sponsorId) {
    return SponsorContracts.find(s => s.id === sponsorId) || null;
  }

  isSponsorAvailable(sponsorId) {
    const sponsor = this.getSponsorById(sponsorId);
    if (!sponsor) return false;
    if (this.activeSponsors.includes(sponsorId)) return false;
    return this.isStageCompleted(sponsor.requiredStage) || this._isStageProgressFarEnough(sponsor.requiredStage);
  }

  _isStageProgressFarEnough(stageId) {
    for (let i = 0; i < CareerStages.length; i++) {
      if (CareerStages[i].id === stageId) {
        return this.isStageUnlocked(i);
      }
    }
    return false;
  }

  isSponsorActive(sponsorId) {
    return this.activeSponsors.includes(sponsorId);
  }

  activateSponsor(sponsorId) {
    if (!this.isSponsorAvailable(sponsorId)) return false;
    if (this.activeSponsors.includes(sponsorId)) return false;

    const sponsor = this.getSponsorById(sponsorId);
    if (!sponsor) return false;

    this.activeSponsors.push(sponsorId);

    if (!this.sponsorProgress[sponsorId]) {
      this.sponsorProgress[sponsorId] = {
        conditions: sponsor.conditions.map(c => ({ type: c.type, current: 0 })),
        activatedAt: Date.now()
      };
    }

    this._newlyActivatedSponsors.push(sponsorId);
    this._saveProgress();
    return true;
  }

  deactivateSponsor(sponsorId) {
    const idx = this.activeSponsors.indexOf(sponsorId);
    if (idx === -1) return false;
    this.activeSponsors.splice(idx, 1);
    this._saveProgress();
    return true;
  }

  getSponsorProgress(sponsorId) {
    return this.sponsorProgress[sponsorId] || null;
  }

  getSponsorConditionProgress(sponsorId) {
    const sponsor = this.getSponsorById(sponsorId);
    const progress = this.sponsorProgress[sponsorId];
    if (!sponsor || !progress) return sponsor ? sponsor.conditions.map(c => ({ ...c, current: 0 })) : [];

    return sponsor.conditions.map((c, i) => ({
      ...c,
      current: progress.conditions[i] ? progress.conditions[i].current : 0
    }));
  }

  isSponsorConditionsMet(sponsorId) {
    const conditions = this.getSponsorConditionProgress(sponsorId);
    return conditions.every(c => c.current >= c.target);
  }

  _processSponsorRewards(rank, raceStats) {
    let bonusCoins = 0;
    const details = [];

    const driftDistance = raceStats.driftDistance || 0;
    const bikeCollisions = raceStats.bikeCollisions || 0;
    const obstacleCollisions = raceStats.obstacleCollisions || 0;
    const totalLaps = raceStats.totalLaps || 1;
    const driftPerLap = driftDistance / Math.max(1, totalLaps);

    const baseReward = 100 + this.activeSponsors.length * 50;

    for (const sponsorId of this.activeSponsors) {
      const sponsor = this.getSponsorById(sponsorId);
      if (!sponsor) continue;

      const progress = this.sponsorProgress[sponsorId];
      if (!progress) continue;

      let conditionsMet = true;

      for (let i = 0; i < sponsor.conditions.length; i++) {
        const cond = sponsor.conditions[i];
        const prog = progress.conditions[i];
        if (!prog) continue;

        switch (cond.type) {
          case SponsorConditionType.RANK_FIRST:
            if (rank === 1) prog.current = Math.min(prog.current + 1, cond.target);
            if (prog.current < cond.target) conditionsMet = false;
            break;
          case SponsorConditionType.RANK_TOP3:
            if (rank <= 3) prog.current = Math.min(prog.current + 1, cond.target);
            if (prog.current < cond.target) conditionsMet = false;
            break;
          case SponsorConditionType.DRIFT_DISTANCE:
            prog.current = Math.max(prog.current, driftDistance);
            if (prog.current < cond.target) conditionsMet = false;
            break;
          case SponsorConditionType.ZERO_COLLISION:
            if (bikeCollisions === 0) prog.current = cond.target;
            if (prog.current < cond.target) conditionsMet = false;
            break;
          case SponsorConditionType.ZERO_OBSTACLE:
            if (obstacleCollisions === 0) prog.current = cond.target;
            if (prog.current < cond.target) conditionsMet = false;
            break;
          case SponsorConditionType.COMPLETE_STAGE:
            prog.current = this.completedStages.length;
            if (prog.current < cond.target) conditionsMet = false;
            break;
          case SponsorConditionType.WIN_STREAK:
            prog.current = Math.max(prog.current, this._winStreak);
            if (prog.current < cond.target) conditionsMet = false;
            break;
          case SponsorConditionType.DRIFT_PER_LAP:
            prog.current = Math.max(prog.current, driftPerLap);
            if (prog.current < cond.target) conditionsMet = false;
            break;
        }
      }

      const sponsorBonus = Math.floor(baseReward * sponsor.coinBonus);
      bonusCoins += sponsorBonus;
      details.push({
        sponsorId: sponsor.id,
        sponsorName: sponsor.name,
        icon: sponsor.icon,
        color: sponsor.color,
        bonusCoins: sponsorBonus,
        conditionsMet: conditionsMet,
        conditions: this.getSponsorConditionProgress(sponsorId)
      });
    }

    return { bonusCoins, details };
  }

  getTotalShopDiscount() {
    let discount = 0;
    for (const sponsorId of this.activeSponsors) {
      const sponsor = this.getSponsorById(sponsorId);
      if (sponsor) discount += sponsor.shopDiscount;
    }
    return Math.min(discount, 0.5);
  }

  getDiscountedPrice(originalPrice) {
    const discount = this.getTotalShopDiscount();
    return Math.floor(originalPrice * (1 - discount));
  }

  getSponsorUnlockedEngines() {
    const engines = new Set();
    for (const sponsorId of this.activeSponsors) {
      const sponsor = this.getSponsorById(sponsorId);
      if (sponsor && sponsor.unlockEngines) {
        sponsor.unlockEngines.forEach(e => engines.add(e));
      }
    }
    return [...engines];
  }

  getSponsorUnlockedTires() {
    const tires = new Set();
    for (const sponsorId of this.activeSponsors) {
      const sponsor = this.getSponsorById(sponsorId);
      if (sponsor && sponsor.unlockTires) {
        sponsor.unlockTires.forEach(t => tires.add(t));
      }
    }
    return [...tires];
  }

  getSponsorUnlockedVehicles() {
    const vehicles = new Set();
    for (const sponsorId of this.activeSponsors) {
      const sponsor = this.getSponsorById(sponsorId);
      if (sponsor && sponsor.unlockVehicles) {
        sponsor.unlockVehicles.forEach(v => vehicles.add(v));
      }
    }
    return [...vehicles];
  }

  getActiveSponsorInfo() {
    return this.activeSponsors.map(id => {
      const sponsor = this.getSponsorById(id);
      const progress = this.getSponsorConditionProgress(id);
      return { ...sponsor, conditionProgress: progress };
    });
  }

  getAvailableSponsorInfo() {
    return SponsorContracts.filter(s => this.isSponsorAvailable(s.id)).map(s => ({
      ...s,
      conditionProgress: this.getSponsorConditionProgress(s.id)
    }));
  }

  consumeNewlyActivated() {
    const result = [...this._newlyActivatedSponsors];
    this._newlyActivatedSponsors = [];
    return result;
  }

  getLastSponsorBonus() {
    return this._sponsorBonusCoins || 0;
  }
}
