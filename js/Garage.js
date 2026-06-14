const EngineUpgrades = [
  {
    id: 'engine_stock',
    name: '原厂引擎',
    level: 0,
    maxSpeedBonus: 0,
    accelerationBonus: 0,
    nitroBoostBonus: 0,
    cost: 0,
    description: '车辆原厂配置的标准引擎'
  },
  {
    id: 'engine_tuned',
    name: '调校引擎',
    level: 1,
    maxSpeedBonus: 15,
    accelerationBonus: 12,
    nitroBoostBonus: 0.05,
    cost: 800,
    description: '经过基础调校，动力小幅提升'
  },
  {
    id: 'engine_sport',
    name: '运动引擎',
    level: 2,
    maxSpeedBonus: 35,
    accelerationBonus: 28,
    nitroBoostBonus: 0.1,
    cost: 2000,
    description: '运动级引擎，性能显著提升'
  },
  {
    id: 'engine_racing',
    name: '赛车引擎',
    level: 3,
    maxSpeedBonus: 60,
    accelerationBonus: 50,
    nitroBoostBonus: 0.18,
    cost: 5000,
    description: '专业赛车引擎，极致动力输出'
  },
  {
    id: 'engine_pro',
    name: '专业级引擎',
    level: 4,
    maxSpeedBonus: 90,
    accelerationBonus: 75,
    nitroBoostBonus: 0.25,
    cost: 12000,
    description: '顶级专业引擎，赛道王者之选'
  }
];

const TireTypes = [
  {
    id: 'tire_street',
    name: '街道胎',
    grip: 1.0,
    driftResistance: 1.0,
    offTrackPenalty: 1.0,
    steerBonus: 0,
    driftAngleBonus: 0,
    cost: 0,
    description: '标准街道轮胎，均衡性能'
  },
  {
    id: 'tire_sport',
    name: '运动胎',
    grip: 1.15,
    driftResistance: 0.9,
    offTrackPenalty: 1.0,
    steerBonus: 0.2,
    driftAngleBonus: -0.05,
    cost: 600,
    description: '运动轮胎，抓地力更强'
  },
  {
    id: 'tire_racing',
    name: '赛车胎',
    grip: 1.3,
    driftResistance: 0.75,
    offTrackPenalty: 1.1,
    steerBonus: 0.35,
    driftAngleBonus: -0.1,
    cost: 1800,
    description: '半热熔赛车胎，极致抓地'
  },
  {
    id: 'tire_drift',
    name: '漂移胎',
    grip: 0.85,
    driftResistance: 1.4,
    offTrackPenalty: 1.0,
    steerBonus: 0.15,
    driftAngleBonus: 0.2,
    cost: 1000,
    description: '专用漂移胎，容易起漂'
  },
  {
    id: 'tire_offroad',
    name: '越野胎',
    grip: 0.95,
    driftResistance: 1.1,
    offTrackPenalty: 0.5,
    steerBonus: 0.05,
    driftAngleBonus: 0.05,
    cost: 1200,
    description: '越野轮胎，非赛道行驶惩罚降低'
  },
  {
    id: 'tire_slick',
    name: '光头胎',
    grip: 1.45,
    driftResistance: 0.6,
    offTrackPenalty: 1.5,
    steerBonus: 0.5,
    driftAngleBonus: -0.15,
    cost: 3500,
    description: '全热熔光头胎，赛道最强抓地'
  }
];

const PaintColors = [
  { id: 'paint_cyan', name: '霓虹青', color: '#00f5ff', accentColor: '#0088aa', cost: 0 },
  { id: 'paint_magenta', name: '霓虹粉', color: '#ff00ff', accentColor: '#aa00aa', cost: 0 },
  { id: 'paint_green', name: '荧光绿', color: '#00ff66', accentColor: '#009933', cost: 0 },
  { id: 'paint_yellow', name: '霓虹黄', color: '#ffff00', accentColor: '#aa8800', cost: 0 },
  { id: 'paint_orange', name: '烈焰橙', color: '#ff6600', accentColor: '#aa4400', cost: 300 },
  { id: 'paint_red', name: '烈焰红', color: '#ff0044', accentColor: '#aa0022', cost: 300 },
  { id: 'paint_purple', name: '神秘紫', color: '#aa00ff', accentColor: '#6600aa', cost: 500 },
  { id: 'paint_white', name: '珍珠白', color: '#ffffff', accentColor: '#aaaaaa', cost: 500 },
  { id: 'paint_gold', name: '黄金色', color: '#ffd700', accentColor: '#b8860b', cost: 800 },
  { id: 'paint_rainbow', name: '彩虹色', color: '#ff00ff', accentColor: '#00f5ff', cost: 2000, special: 'rainbow' }
];

const DriftTuningPresets = [
  {
    id: 'drift_stock',
    name: '原厂设定',
    driftThreshold: 0.4,
    maxDriftAngle: 0.6,
    driftBuildSpeed: 2,
    driftRecoverSpeed: 3,
    driftGripLoss: 0.0,
    cost: 0,
    description: '原厂漂移参数设定'
  },
  {
    id: 'drift_stable',
    name: '稳定取向',
    driftThreshold: 0.55,
    maxDriftAngle: 0.35,
    driftBuildSpeed: 1.2,
    driftRecoverSpeed: 4.5,
    driftGripLoss: -0.1,
    cost: 400,
    description: '降低漂移倾向，行驶更稳定'
  },
  {
    id: 'drift_balanced',
    name: '均衡调校',
    driftThreshold: 0.45,
    maxDriftAngle: 0.5,
    driftBuildSpeed: 1.8,
    driftRecoverSpeed: 3.5,
    driftGripLoss: 0.05,
    cost: 600,
    description: '漂移与抓地的平衡调校'
  },
  {
    id: 'drift_sport',
    name: '运动漂移',
    driftThreshold: 0.35,
    maxDriftAngle: 0.7,
    driftBuildSpeed: 2.5,
    driftRecoverSpeed: 2.8,
    driftGripLoss: 0.1,
    cost: 1000,
    description: '更容易起漂，漂移角度更大'
  },
  {
    id: 'drift_pro',
    name: '专业漂移',
    driftThreshold: 0.25,
    maxDriftAngle: 0.9,
    driftBuildSpeed: 3.5,
    driftRecoverSpeed: 2.0,
    driftGripLoss: 0.15,
    cost: 2500,
    description: '专业漂移调校，极致漂移体验'
  }
];

const GarageCategoryKeys = ['engine', 'tire', 'paint', 'drift'];

class GarageManager {
  constructor(careerManager) {
    this.career = careerManager;
    this.upgrades = {};
    this.selectedCategory = 'engine';
    this.selectedEngineIndex = 0;
    this.selectedTireIndex = 0;
    this.selectedPaintIndex = 0;
    this.selectedDriftIndex = 0;
    this.previewVehicle = null;
    this.raceHistory = [];
    this.maxRaceHistory = 10;

    this._loadUpgrades();
  }

  _loadUpgrades() {
    try {
      const data = localStorage.getItem('neonRacer_garageUpgrades');
      if (data) {
        const saved = JSON.parse(data);
        this.upgrades = saved.upgrades || {};
        this.selectedEngineIndex = saved.selectedEngine || 0;
        this.selectedTireIndex = saved.selectedTire || 0;
        this.selectedPaintIndex = saved.selectedPaint || 0;
        this.selectedDriftIndex = saved.selectedDrift || 0;
      }
    } catch (e) {}

    this._initDefaultUpgrades();
    this._loadRaceHistory();
  }

  _initDefaultUpgrades() {
    if (this.upgrades.engines === undefined) {
      this.upgrades.engines = [0];
    }
    if (this.upgrades.tires === undefined) {
      this.upgrades.tires = [0];
    }
    if (this.upgrades.paints === undefined) {
      this.upgrades.paints = [0, 1, 2, 3];
    }
    if (this.upgrades.drifts === undefined) {
      this.upgrades.drifts = [0];
    }
  }

  _saveUpgrades() {
    try {
      const data = {
        upgrades: this.upgrades,
        selectedEngine: this.selectedEngineIndex,
        selectedTire: this.selectedTireIndex,
        selectedPaint: this.selectedPaintIndex,
        selectedDrift: this.selectedDriftIndex
      };
      localStorage.setItem('neonRacer_garageUpgrades', JSON.stringify(data));
    } catch (e) {}
  }

  _loadRaceHistory() {
    try {
      const data = localStorage.getItem('neonRacer_raceHistory');
      if (data) {
        this.raceHistory = JSON.parse(data);
      }
    } catch (e) {
      this.raceHistory = [];
    }
  }

  _saveRaceHistory() {
    try {
      localStorage.setItem('neonRacer_raceHistory', JSON.stringify(this.raceHistory));
    } catch (e) {}
  }

  addRaceResult(result) {
    const entry = {
      timestamp: Date.now(),
      rank: result.rank,
      time: result.time,
      bestLap: result.bestLap,
      totalLaps: result.totalLaps,
      difficulty: result.difficulty,
      vehicleType: result.vehicleType,
      config: {
        engine: this.selectedEngineIndex,
        tire: this.selectedTireIndex,
        paint: this.selectedPaintIndex,
        drift: this.selectedDriftIndex
      }
    };
    this.raceHistory.unshift(entry);
    if (this.raceHistory.length > this.maxRaceHistory) {
      this.raceHistory = this.raceHistory.slice(0, this.maxRaceHistory);
    }
    this._saveRaceHistory();
  }

  getRaceHistory() {
    return this.raceHistory;
  }

  getCurrentConfig() {
    return {
      engine: this.selectedEngineIndex,
      tire: this.selectedTireIndex,
      paint: this.selectedPaintIndex,
      drift: this.selectedDriftIndex,
      engineName: EngineUpgrades[this.selectedEngineIndex].name,
      tireName: TireTypes[this.selectedTireIndex].name,
      paintName: PaintColors[this.selectedPaintIndex].name,
      driftName: DriftTuningPresets[this.selectedDriftIndex].name
    };
  }

  getAverageRank() {
    if (this.raceHistory.length === 0) return 0;
    const sum = this.raceHistory.reduce((acc, r) => acc + r.rank, 0);
    return sum / this.raceHistory.length;
  }

  getWinRate() {
    if (this.raceHistory.length === 0) return 0;
    const wins = this.raceHistory.filter(r => r.rank === 1).length;
    return wins / this.raceHistory.length;
  }

  getBestTime() {
    if (this.raceHistory.length === 0) return 0;
    return Math.min(...this.raceHistory.filter(r => r.time > 0).map(r => r.time));
  }

  calculatePreviewStats(vehicleType, previewCategory, previewIndex) {
    const baseVehicle = VehicleTypes[vehicleType];
    if (!baseVehicle) return null;

    const engine = previewCategory === 'engine' ? EngineUpgrades[previewIndex] : this.getCurrentEngine();
    const tire = previewCategory === 'tire' ? TireTypes[previewIndex] : this.getCurrentTire();
    const drift = previewCategory === 'drift' ? DriftTuningPresets[previewIndex] : this.getCurrentDrift();

    let baseSpeed = baseVehicle.baseMaxSpeed + engine.maxSpeedBonus;
    let baseAccel = baseVehicle.baseAcceleration + engine.accelerationBonus;
    let baseSteer = baseVehicle.steerSpeed + tire.steerBonus;

    const careerBonusSpeed = this.career.getTotalUpgradeBonus('speed');
    const careerBonusAccel = this.career.getTotalUpgradeBonus('acceleration');
    const careerBonusHandling = this.career.getTotalUpgradeBonus('handling');
    const careerBonusNitro = this.career.getTotalUpgradeBonus('nitro');

    baseSpeed += careerBonusSpeed;
    baseAccel += careerBonusAccel;
    baseSteer += careerBonusHandling;

    const nitroCapacity = baseVehicle.nitroMaxEnergy + careerBonusNitro;

    const speedRating = Math.min(5, Math.max(1, Math.round(((baseSpeed - 270) / 90) * 4 + 1)));
    const accelRating = Math.min(5, Math.max(1, Math.round(((baseAccel - 140) / 70) * 4 + 1)));
    const handlingRating = Math.min(5, Math.max(1, Math.round(((baseSteer - 2.2) / 1.0) * 4 + 1)));
    const driftFactor = (drift.maxDriftAngle - 0.25) / 0.65 * 0.6 + (drift.driftBuildSpeed - 1) / 2.5 * 0.4;
    const driftRating = Math.min(5, Math.max(1, Math.round(driftFactor * 4 + 1)));
    const nitroRating = Math.min(5, Math.max(1, Math.round(((nitroCapacity - 60) / 50) * 4 + 1)));

    return {
      maxSpeed: baseSpeed,
      acceleration: baseAccel,
      steerSpeed: baseSteer,
      nitroCapacity: nitroCapacity,
      driftAngle: drift.maxDriftAngle,
      speedRating,
      accelRating,
      handlingRating,
      driftRating,
      nitroRating,
      tireGrip: tire.grip,
      offTrackPenalty: tire.offTrackPenalty
    };
  }

  getCategoryDetailStats(category, index) {
    const item = this.getItemByIndex(category, index);
    if (!item) return null;

    switch (category) {
      case 'engine':
        return {
          primary: [
            { label: '极速加成', value: `+${item.maxSpeedBonus}`, raw: item.maxSpeedBonus },
            { label: '加速加成', value: `+${item.accelerationBonus}`, raw: item.accelerationBonus },
            { label: '氮气提升', value: `+${(item.nitroBoostBonus * 100).toFixed(0)}%`, raw: item.nitroBoostBonus }
          ],
          level: item.level
        };
      case 'tire':
        return {
          primary: [
            { label: '抓地力', value: item.grip.toFixed(2), raw: item.grip },
            { label: '漂移阻力', value: item.driftResistance.toFixed(2), raw: item.driftResistance },
            { label: '离道惩罚', value: item.offTrackPenalty.toFixed(2), raw: item.offTrackPenalty },
            { label: '转向加成', value: `+${item.steerBonus.toFixed(2)}`, raw: item.steerBonus },
            { label: '漂移角度', value: `${item.driftAngleBonus > 0 ? '+' : ''}${item.driftAngleBonus.toFixed(2)}`, raw: item.driftAngleBonus }
          ]
        };
      case 'paint':
        return {
          primary: [
            { label: '主色调', value: item.color, isColor: true },
            { label: '辅助色', value: item.accentColor, isColor: true },
            { label: '特殊效果', value: item.special || '无', isSpecial: !!item.special }
          ]
        };
      case 'drift':
        return {
          primary: [
            { label: '起漂阈值', value: item.driftThreshold.toFixed(2), raw: item.driftThreshold, lower: true },
            { label: '最大漂角', value: `${(item.maxDriftAngle * 57.3).toFixed(1)}°`, raw: item.maxDriftAngle },
            { label: '起漂速度', value: item.driftBuildSpeed.toFixed(1), raw: item.driftBuildSpeed },
            { label: '恢复速度', value: item.driftRecoverSpeed.toFixed(1), raw: item.driftRecoverSpeed },
            { label: '抓地损失', value: `${(item.driftGripLoss * 100).toFixed(0)}%`, raw: item.driftGripLoss }
          ]
        };
      default:
        return null;
    }
  }

  getCurrentEngine() {
    return EngineUpgrades[this.selectedEngineIndex];
  }

  getCurrentTire() {
    return TireTypes[this.selectedTireIndex];
  }

  getCurrentPaint() {
    return PaintColors[this.selectedPaintIndex];
  }

  getCurrentDrift() {
    return DriftTuningPresets[this.selectedDriftIndex];
  }

  isEngineUnlocked(index) {
    if (this.upgrades.engines && this.upgrades.engines.includes(index)) return true;
    return this.career.getSponsorUnlockedEngines().includes(index);
  }

  isTireUnlocked(index) {
    if (this.upgrades.tires && this.upgrades.tires.includes(index)) return true;
    return this.career.getSponsorUnlockedTires().includes(index);
  }

  isPaintUnlocked(index) {
    return this.upgrades.paints && this.upgrades.paints.includes(index);
  }

  isDriftUnlocked(index) {
    return this.upgrades.drifts && this.upgrades.drifts.includes(index);
  }

  getEffectiveCost(baseCost) {
    return this.career.getDiscountedPrice(baseCost);
  }

  canBuyEngine(index) {
    if (this.isEngineUnlocked(index)) return false;
    if (index > 0 && !this.isEngineUnlocked(index - 1)) return false;
    const engine = EngineUpgrades[index];
    const cost = this.getEffectiveCost(engine.cost);
    return this.career.coins >= cost;
  }

  canBuyTire(index) {
    if (this.isTireUnlocked(index)) return false;
    const tire = TireTypes[index];
    const cost = this.getEffectiveCost(tire.cost);
    return this.career.coins >= cost;
  }

  canBuyPaint(index) {
    if (this.isPaintUnlocked(index)) return false;
    const paint = PaintColors[index];
    const cost = this.getEffectiveCost(paint.cost);
    return this.career.coins >= cost;
  }

  canBuyDrift(index) {
    if (this.isDriftUnlocked(index)) return false;
    if (index > 0 && !this.isDriftUnlocked(index - 1)) return false;
    const drift = DriftTuningPresets[index];
    const cost = this.getEffectiveCost(drift.cost);
    return this.career.coins >= cost;
  }

  buyEngine(index) {
    if (!this.canBuyEngine(index)) return false;
    const engine = EngineUpgrades[index];
    const cost = this.getEffectiveCost(engine.cost);
    this.career.coins -= cost;
    this.upgrades.engines.push(index);
    this.selectedEngineIndex = index;
    this._saveUpgrades();
    this.career._saveProgress();
    return true;
  }

  buyTire(index) {
    if (!this.canBuyTire(index)) return false;
    const tire = TireTypes[index];
    const cost = this.getEffectiveCost(tire.cost);
    this.career.coins -= cost;
    this.upgrades.tires.push(index);
    this.selectedTireIndex = index;
    this._saveUpgrades();
    this.career._saveProgress();
    return true;
  }

  buyPaint(index) {
    if (!this.canBuyPaint(index)) return false;
    const paint = PaintColors[index];
    const cost = this.getEffectiveCost(paint.cost);
    this.career.coins -= cost;
    this.upgrades.paints.push(index);
    this.selectedPaintIndex = index;
    this._saveUpgrades();
    this.career._saveProgress();
    return true;
  }

  buyDrift(index) {
    if (!this.canBuyDrift(index)) return false;
    const drift = DriftTuningPresets[index];
    const cost = this.getEffectiveCost(drift.cost);
    this.career.coins -= cost;
    this.upgrades.drifts.push(index);
    this.selectedDriftIndex = index;
    this._saveUpgrades();
    this.career._saveProgress();
    return true;
  }

  selectEngine(index) {
    if (this.isEngineUnlocked(index)) {
      this.selectedEngineIndex = index;
      this._saveUpgrades();
      return true;
    }
    return false;
  }

  selectTire(index) {
    if (this.isTireUnlocked(index)) {
      this.selectedTireIndex = index;
      this._saveUpgrades();
      return true;
    }
    return false;
  }

  selectPaint(index) {
    if (this.isPaintUnlocked(index)) {
      this.selectedPaintIndex = index;
      this._saveUpgrades();
      return true;
    }
    return false;
  }

  selectDrift(index) {
    if (this.isDriftUnlocked(index)) {
      this.selectedDriftIndex = index;
      this._saveUpgrades();
      return true;
    }
    return false;
  }

  calculatePerformanceStats(vehicleType) {
    const baseVehicle = VehicleTypes[vehicleType];
    if (!baseVehicle) return null;

    const engine = this.getCurrentEngine();
    const tire = this.getCurrentTire();
    const drift = this.getCurrentDrift();

    let baseSpeed = baseVehicle.baseMaxSpeed + engine.maxSpeedBonus;
    let baseAccel = baseVehicle.baseAcceleration + engine.accelerationBonus;
    let baseSteer = baseVehicle.steerSpeed + tire.steerBonus;

    const careerBonusSpeed = this.career.getTotalUpgradeBonus('speed');
    const careerBonusAccel = this.career.getTotalUpgradeBonus('acceleration');
    const careerBonusHandling = this.career.getTotalUpgradeBonus('handling');
    const careerBonusNitro = this.career.getTotalUpgradeBonus('nitro');

    baseSpeed += careerBonusSpeed;
    baseAccel += careerBonusAccel;
    baseSteer += careerBonusHandling;

    const nitroCapacity = baseVehicle.nitroMaxEnergy + careerBonusNitro;

    const speedRating = Math.min(5, Math.max(1, Math.round(((baseSpeed - 270) / 90) * 4 + 1)));
    const accelRating = Math.min(5, Math.max(1, Math.round(((baseAccel - 140) / 70) * 4 + 1)));
    const handlingRating = Math.min(5, Math.max(1, Math.round(((baseSteer - 2.2) / 1.0) * 4 + 1)));
    const driftFactor = (drift.maxDriftAngle - 0.25) / 0.65 * 0.6 + (drift.driftBuildSpeed - 1) / 2.5 * 0.4;
    const driftRating = Math.min(5, Math.max(1, Math.round(driftFactor * 4 + 1)));
    const nitroRating = Math.min(5, Math.max(1, Math.round(((nitroCapacity - 60) / 50) * 4 + 1)));

    return {
      maxSpeed: baseSpeed,
      acceleration: baseAccel,
      steerSpeed: baseSteer,
      nitroCapacity: nitroCapacity,
      driftAngle: drift.maxDriftAngle,
      speedRating,
      accelRating,
      handlingRating,
      driftRating,
      nitroRating,
      tireGrip: tire.grip,
      offTrackPenalty: tire.offTrackPenalty
    };
  }

  applyUpgradesToBike(bike, vehicleType) {
    const baseVehicle = VehicleTypes[vehicleType];
    if (!baseVehicle) return;

    const engine = this.getCurrentEngine();
    const tire = this.getCurrentTire();
    const paint = this.getCurrentPaint();
    const drift = this.getCurrentDrift();

    this.career.applyUpgradesToBike(bike, vehicleType);

    bike.baseMaxSpeed += engine.maxSpeedBonus;
    bike.maxSpeed = bike.baseMaxSpeed;
    bike.baseAcceleration += engine.accelerationBonus;
    bike.acceleration = bike.baseAcceleration;

    bike.nitroSpeedBoost = baseVehicle.nitroSpeedBoost + engine.nitroBoostBonus;
    bike.nitroAccelBoost = baseVehicle.nitroAccelBoost + engine.nitroBoostBonus * 1.5;

    bike.steerSpeed += tire.steerBonus;
    bike.offTrackFriction = baseVehicle.baseOffTrackFriction * tire.offTrackPenalty;
    bike.tireGrip = tire.grip;

    bike.color = paint.color;
    bike.accentColor = paint.accentColor;
    bike.paintSpecial = paint.special || null;

    bike.driftThreshold = drift.driftThreshold;
    bike.baseDriftAngleMax = drift.maxDriftAngle;
    bike.driftBuildSpeed = drift.driftBuildSpeed;
    bike.driftRecoverSpeed = drift.driftRecoverSpeed;
    bike.driftGripLoss = drift.driftGripLoss;
    bike.driftTireBonus = tire.driftAngleBonus;
  }

  resetToStock() {
    this.selectedEngineIndex = 0;
    this.selectedTireIndex = 0;
    this.selectedPaintIndex = 0;
    this.selectedDriftIndex = 0;
    this._saveUpgrades();
  }

  getCategoryItemCount(category) {
    switch (category) {
      case 'engine': return EngineUpgrades.length;
      case 'tire': return TireTypes.length;
      case 'paint': return PaintColors.length;
      case 'drift': return DriftTuningPresets.length;
      default: return 0;
    }
  }

  getItemByIndex(category, index) {
    switch (category) {
      case 'engine': return EngineUpgrades[index];
      case 'tire': return TireTypes[index];
      case 'paint': return PaintColors[index];
      case 'drift': return DriftTuningPresets[index];
      default: return null;
    }
  }

  isItemUnlocked(category, index) {
    switch (category) {
      case 'engine': return this.isEngineUnlocked(index);
      case 'tire': return this.isTireUnlocked(index);
      case 'paint': return this.isPaintUnlocked(index);
      case 'drift': return this.isDriftUnlocked(index);
      default: return false;
    }
  }

  canBuyItem(category, index) {
    switch (category) {
      case 'engine': return this.canBuyEngine(index);
      case 'tire': return this.canBuyTire(index);
      case 'paint': return this.canBuyPaint(index);
      case 'drift': return this.canBuyDrift(index);
      default: return false;
    }
  }

  buyItem(category, index) {
    switch (category) {
      case 'engine': return this.buyEngine(index);
      case 'tire': return this.buyTire(index);
      case 'paint': return this.buyPaint(index);
      case 'drift': return this.buyDrift(index);
      default: return false;
    }
  }

  selectItem(category, index) {
    switch (category) {
      case 'engine': return this.selectEngine(index);
      case 'tire': return this.selectTire(index);
      case 'paint': return this.selectPaint(index);
      case 'drift': return this.selectDrift(index);
      default: return false;
    }
  }

  getSelectedIndex(category) {
    switch (category) {
      case 'engine': return this.selectedEngineIndex;
      case 'tire': return this.selectedTireIndex;
      case 'paint': return this.selectedPaintIndex;
      case 'drift': return this.selectedDriftIndex;
      default: return 0;
    }
  }
}
