const GameState = {
  MENU: 'menu',
  VEHICLE_SELECT: 'vehicleSelect',
  GARAGE: 'garage',
  ACHIEVEMENTS: 'achievements',
  CAREER_MAP: 'careerMap',
  CAREER_EVENT: 'careerEvent',
  CAREER_UPGRADE: 'careerUpgrade',
  CAREER_STAGE_CLEAR: 'careerStageClear',
  CAREER_RACE_RESULT: 'careerRaceResult',
  COUNTDOWN: 'countdown',
  RACING: 'racing',
  WANTED_CHASE: 'wantedChase',
  WANTED_RESULT: 'wantedResult',
  PAUSED: 'paused',
  FINISHED: 'finished',
  RACE_EDITOR: 'raceEditor'
};

const VehicleTypes = {
  phantom: {
    id: 'phantom',
    name: '幻影',
    subtitle: '均衡型',
    color: '#00f5ff',
    accentColor: '#0088aa',
    baseMaxSpeed: 320,
    baseAcceleration: 200,
    steerSpeed: 2.8,
    brakePower: 350,
    baseOffTrackFriction: 3.5,
    nitroMaxEnergy: 100,
    nitroChargeRate: 18,
    nitroSpeedBoost: 1.6,
    nitroAccelBoost: 2.5,
    wheelBase: 24,
    bikeWidth: 14,
    description: '各项属性均衡，适合新手入门',
    stats: { speed: 3, accel: 3, handling: 3, nitro: 3 }
  },
  thunder: {
    id: 'thunder',
    name: '雷霆',
    subtitle: '极速型',
    color: '#ff00ff',
    accentColor: '#aa00aa',
    baseMaxSpeed: 360,
    baseAcceleration: 165,
    steerSpeed: 2.3,
    brakePower: 290,
    baseOffTrackFriction: 4.5,
    nitroMaxEnergy: 80,
    nitroChargeRate: 14,
    nitroSpeedBoost: 1.5,
    nitroAccelBoost: 2.2,
    wheelBase: 28,
    bikeWidth: 16,
    description: '极致速度，操控偏弱',
    stats: { speed: 5, accel: 2, handling: 2, nitro: 2 }
  },
  gale: {
    id: 'gale',
    name: '疾风',
    subtitle: '操控型',
    color: '#00ff66',
    accentColor: '#009933',
    baseMaxSpeed: 295,
    baseAcceleration: 235,
    steerSpeed: 3.5,
    brakePower: 410,
    baseOffTrackFriction: 2.8,
    nitroMaxEnergy: 100,
    nitroChargeRate: 20,
    nitroSpeedBoost: 1.6,
    nitroAccelBoost: 2.5,
    wheelBase: 22,
    bikeWidth: 12,
    description: '灵活操控，弯道之王',
    stats: { speed: 2, accel: 4, handling: 5, nitro: 3 }
  },
  shark: {
    id: 'shark',
    name: '狂鲨',
    subtitle: '氮气型',
    color: '#ffff00',
    accentColor: '#aa8800',
    baseMaxSpeed: 305,
    baseAcceleration: 190,
    steerSpeed: 2.5,
    brakePower: 320,
    baseOffTrackFriction: 3.8,
    nitroMaxEnergy: 150,
    nitroChargeRate: 28,
    nitroSpeedBoost: 1.8,
    nitroAccelBoost: 3.0,
    wheelBase: 26,
    bikeWidth: 15,
    description: '氮气强劲，爆发力十足',
    stats: { speed: 2, accel: 3, handling: 2, nitro: 5 }
  }
};

const VehicleTypeKeys = Object.keys(VehicleTypes);

const DifficultySettings = {
  easy: {
    label: '简单',
    color: '#00ff66',
    aiCount: 2,
    aiDifficulties: ['easy', 'easy'],
    playerGridIndex: 0,
    speedMultiplier: 1.0625,
    accelMultiplier: 1.15,
    offTrackFrictionBonus: -1.0,
    collisionDamage: 0.8
  },
  normal: {
    label: '普通',
    color: '#00f5ff',
    aiCount: 3,
    aiDifficulties: ['medium', 'medium', 'easy'],
    playerGridIndex: 1,
    speedMultiplier: 1.0,
    accelMultiplier: 1.0,
    offTrackFrictionBonus: 0,
    collisionDamage: 0.7
  },
  hard: {
    label: '困难',
    color: '#ff6600',
    aiCount: 3,
    aiDifficulties: ['hard', 'medium', 'medium'],
    playerGridIndex: 2,
    speedMultiplier: 0.96875,
    accelMultiplier: 0.95,
    offTrackFrictionBonus: 1.0,
    collisionDamage: 0.6
  },
  hell: {
    label: '地狱',
    color: '#ff0044',
    aiCount: 4,
    aiDifficulties: ['hell', 'hard', 'hard', 'medium'],
    playerGridIndex: 4,
    speedMultiplier: 0.9375,
    accelMultiplier: 0.9,
    offTrackFrictionBonus: 2.0,
    collisionDamage: 0.5
  }
};

const LapOptions = [1, 3, 5, 7, 10];

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new Input();
    this.touchManager = new TouchControlManager();

    this.state = GameState.MENU;
    this.countdown = 3;
    this.countdownTimer = 0;
    this.raceTime = 0;

    this._prevStateBeforePause = null;
    this._savedCountdown = 3;
    this._savedCountdownTimer = 0;
    this._savedRaceTime = 0;
    this.pauseMenuCursor = 0;
    this.pauseMenuItemCount = 2;

    this.difficulty = 'normal';
    this.totalLaps = 3;
    this.lapIndex = 1;
    this.menuCursor = 0;
    this.menuItemCount = 10;
    this.selectedVehicle = this._loadVehicleSelection();
    this.vehicleSelectCursor = VehicleTypeKeys.indexOf(this.selectedVehicle);
    this.achievementCursor = 0;
    this.achievementScrollY = 0;
    this.achievements = new AchievementManager();

    this.career = new CareerManager();
    this.garage = new GarageManager(this.career);
    this.careerStageCursor = 0;
    this.careerEventCursor = 0;
    this.careerUpgradeCursor = 0;
    this.careerRaceResultData = null;
    this._isCareerMode = false;
    this.garageCategoryCursor = 0;
    this.garageItemCursor = 0;

    this.track = null;
    this.player = null;
    this.aiBikes = [];
    this.collision = null;
    this.bestLapRecords = this._loadBestLapRecords();
    this.isHistoricalRecord = false;

    this.raceEditor = null;
    this.replaySystem = null;
    this._editorConfig = null;
    this._isEditorMode = false;

    this.wantedSystem = null;
    this._isWantedMode = false;
    this._wantedResultData = null;

    this.lastTime = 0;
    this.running = false;
    this._prevPlayerLap = 0;
    this._prevCollisionCount = 0;
    this._prevWasOffTrack = false;
    this._prevWasDrifting = false;
    this._prevObstacleCollisions = 0;
    this._prevObstaclesDestroyed = 0;
    this._prevPoliceCollisions = 0;

    this._init();
  }

  _init() {
    this.track = new Track(200);
    this.collision = new Collision(this.track);
    this.wantedSystem = new WantedSystem(this.track);

    if (!this.raceEditor) {
      this.raceEditor = new RaceEditor(this.canvas, this);
    }
    if (!this.replaySystem) {
      this.replaySystem = new ReplaySystem(this);
    }

    const cfg = DifficultySettings[this.difficulty];
    const vehicle = VehicleTypes[this.selectedVehicle];
    const totalBikes = cfg.aiCount + 1;
    const startPositions = this.track.getStartPositions(totalBikes, 60);

    this.player = new Bike(
      startPositions[cfg.playerGridIndex].x,
      startPositions[cfg.playerGridIndex].y,
      startPositions[cfg.playerGridIndex].angle,
      vehicle.color,
      true
    );
    this._applyVehicleAndDifficulty(this.player, vehicle, cfg);
    this.collision.damageMultiplier = cfg.collisionDamage;

    this.aiBikes = [];
    this._createAIBikes(startPositions, cfg);

    this.aiBikes.forEach(ai => {
      ai.offTrackFriction = vehicle.baseOffTrackFriction + cfg.offTrackFrictionBonus;
    });

    this.renderer.camera.x = this.player.x;
    this.renderer.camera.y = this.player.y;

    this._setupTouchControls();
  }

  _applyVehicleAndDifficulty(player, vehicle, cfg) {
    player.maxSpeed = vehicle.baseMaxSpeed * cfg.speedMultiplier;
    player.baseMaxSpeed = player.maxSpeed;
    player.acceleration = vehicle.baseAcceleration * cfg.accelMultiplier;
    player.baseAcceleration = player.acceleration;
    player.offTrackFriction = vehicle.baseOffTrackFriction + cfg.offTrackFrictionBonus;
    player.steerSpeed = vehicle.steerSpeed;
    player.brakePower = vehicle.brakePower;
    player.nitroMaxEnergy = vehicle.nitroMaxEnergy;
    player.nitroChargeRate = vehicle.nitroChargeRate;
    player.nitroSpeedBoost = vehicle.nitroSpeedBoost;
    player.nitroAccelBoost = vehicle.nitroAccelBoost;
    player.wheelBase = vehicle.wheelBase;
    player.width = vehicle.bikeWidth;
  }

  _createAIBikes(startPositions, cfg) {
    const aiColors = ['#ff00ff', '#ff6600', '#00ff66', '#ffff00', '#ff0066'];
    this.aiBikes = [];

    const playerIdx = cfg.playerGridIndex;
    let aiSlot = 0;

    for (let i = 0; i < startPositions.length; i++) {
      if (i === playerIdx) continue;
      if (aiSlot >= cfg.aiCount) break;

      const pos = startPositions[i];
      const ai = new AIBike(
        pos.x,
        pos.y,
        pos.angle,
        aiColors[aiSlot % aiColors.length],
        cfg.aiDifficulties[aiSlot]
      );
      this.aiBikes.push(ai);
      aiSlot++;
    }
  }

  _setupTouchControls() {
    this.touchManager.applyLayout();

    const controls = {
      left: document.getElementById('btn-left'),
      right: document.getElementById('btn-right'),
      accel: document.getElementById('btn-accel'),
      brake: document.getElementById('btn-brake'),
      nitro: document.getElementById('btn-nitro')
    };

    Object.keys(controls).forEach(key => {
      const btn = controls[key];
      if (!btn) return;

      const handleStart = (e) => {
        e.preventDefault();

        if (this.state === GameState.PAUSED) return;

        const touch = e.touches ? e.touches[0] : e;
        if (!this.touchManager.validateTouch(key, touch)) return;

        const touchId = touch.identifier !== undefined ? touch.identifier : 'mouse';
        this.touchManager.shouldActivate(key, touchId, e);
        this.input.setTouchControl(key, true);
        this.touchManager.registerActiveTouch(key, true);

        btn.classList.add('touch-active');

        this.touchManager.vibrate(key === 'brake' ? 'brake' : 'press');
      };

      const handleEnd = (e) => {
        e.preventDefault();
        this.input.setTouchControl(key, false);
        this.touchManager.registerActiveTouch(key, false);
        btn.classList.remove('touch-active');
      };

      btn.addEventListener('touchstart', handleStart, { passive: false });
      btn.addEventListener('touchend', handleEnd, { passive: false });
      btn.addEventListener('touchcancel', handleEnd, { passive: false });

      btn.addEventListener('mousedown', handleStart);
      btn.addEventListener('mouseup', handleEnd);
      btn.addEventListener('mouseleave', handleEnd);
    });

    this._setupPauseButton();

    this._createSettingsPanel();
    this._setupOrientationHint();

    this.canvas.addEventListener('click', (e) => {
      if (this.state === GameState.MENU) {
        this._handleMenuClick(e);
      } else if (this.state === GameState.VEHICLE_SELECT) {
        this._handleVehicleSelectClick(e);
      } else if (this.state === GameState.ACHIEVEMENTS) {
        this.state = GameState.MENU;
        this.menuCursor = 3;
        this.touchManager.vibrate('menuSelect');
      } else if (this.state === GameState.CAREER_MAP) {
        this._handleCareerMapClick(e);
      } else if (this.state === GameState.CAREER_EVENT) {
        this._handleCareerEventClick(e);
      } else if (this.state === GameState.CAREER_UPGRADE) {
        this._handleCareerUpgradeClick(e);
      } else if (this.state === GameState.CAREER_STAGE_CLEAR) {
        this.career.showingStageClear = false;
        this.state = GameState.CAREER_MAP;
        this.touchManager.vibrate('menuSelect');
      } else if (this.state === GameState.CAREER_RACE_RESULT) {
        if (this.career.showingStageClear) {
          this.career.showingStageClear = false;
          this.state = GameState.CAREER_STAGE_CLEAR;
        } else {
          this.state = GameState.CAREER_MAP;
        }
        this.touchManager.vibrate('menuSelect');
      } else if (this.state === GameState.GARAGE) {
        this._handleGarageClick(e);
      } else if (this.state === GameState.PAUSED) {
        this._handlePauseClick(e);
      } else if (this.state === GameState.FINISHED) {
        this.startGame();
      }
    });
  }

  _setupPauseButton() {
    const btn = document.getElementById('btn-pause');
    if (!btn) return;

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (this.state === GameState.RACING || this.state === GameState.COUNTDOWN) {
        this.pauseGame();
      } else if (this.state === GameState.PAUSED) {
        this.resumeGame();
      }

      this.touchManager.vibrate('menuSelect');
    };

    btn.addEventListener('touchstart', handleClick, { passive: false });
    btn.addEventListener('mousedown', handleClick);
  }

  _handlePauseClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isPortrait = this.renderer.isPortrait();
    const uiScale = this.renderer._getUIScale();
    const centerX = this.canvas.width / 2;

    const panelW = isPortrait ? Math.min(300 * uiScale, this.canvas.width * 0.8) : 360;
    const panelH = isPortrait ? (200 + this.pauseMenuItemCount * 50) * uiScale : 220 + this.pauseMenuItemCount * 55;
    const panelX = centerX - panelW / 2;
    const panelY = (this.canvas.height - panelH) / 2;

    const itemSpacing = isPortrait ? 48 * uiScale : 52;
    const itemStartY = panelY + (isPortrait ? 100 : 110) * uiScale;
    const itemH = isPortrait ? 40 * uiScale : 44;

    for (let i = 0; i < this.pauseMenuItemCount; i++) {
      const itemY = itemStartY + i * itemSpacing;
      const itemX = panelX + 20 * uiScale;
      const itemW = panelW - 40 * uiScale;

      if (x >= itemX && x <= itemX + itemW &&
          y >= itemY - itemH / 2 && y <= itemY + itemH / 2) {
        this.pauseMenuCursor = i;
        this.touchManager.vibrate('menuSelect');

        if (i === 0) {
          this.resumeGame();
        } else if (i === 1) {
          this.quitToMenu();
        }
        return;
      }
    }
  }

  _setupOrientationHint() {
    const hint = document.getElementById('orientationHint');
    if (!hint) return;

    const content = hint.querySelector('.orientation-hint-content');
    if (content) {
      content.addEventListener('click', (e) => {
        e.stopPropagation();
        this.touchManager.toggleAutoRotateHint();
      });
    }
  }

  _createSettingsPanel() {
    const container = document.querySelector('.game-container');
    const overlay = document.createElement('div');
    overlay.className = 'touch-settings-overlay';
    overlay.id = 'touchSettingsOverlay';

    const panel = document.createElement('div');
    panel.className = 'touch-settings-panel';

    const layouts = this.touchManager.getLayoutNames();
    const layoutOptions = layouts.map(l =>
      `<div class="touch-settings-option ${l.active ? 'active' : ''}" data-layout="${l.key}">
        ${l.label}
        <span class="option-desc">${l.description}</span>
      </div>`
    ).join('');

    const vibLevels = this.touchManager.getVibrationLevels();
    const vibOptions = vibLevels.map(l =>
      `<div class="touch-settings-option ${l.active ? 'active' : ''}" data-vibration="${l.key}">${l.label}</div>`
    ).join('');

    const antiLevels = this.touchManager.getAntiMistouchLevels();
    const antiOptions = antiLevels.map(l =>
      `<div class="touch-settings-option ${l.active ? 'active' : ''}" data-antimistouch="${l.key}">${l.label}</div>`
    ).join('');

    panel.innerHTML = `
      <h2>操控设置</h2>

      <div class="touch-settings-section-title">按键布局</div>
      <div class="touch-settings-group">
        <div class="touch-settings-options" id="layoutOptions">
          ${layoutOptions}
        </div>
      </div>

      <div class="touch-settings-section-title">震动反馈</div>
      <div class="touch-settings-group">
        <div class="touch-settings-options" id="vibrationOptions">
          ${vibOptions}
        </div>
      </div>

      <div class="touch-settings-section-title">防误触</div>
      <div class="touch-settings-group">
        <div class="touch-settings-options" id="antiMistouchOptions">
          ${antiOptions}
        </div>
      </div>

      <div class="touch-settings-toggle">
        <div>
          <div class="toggle-label">横屏提示</div>
          <div class="toggle-desc">竖屏时显示旋转提示</div>
        </div>
        <div class="toggle-switch ${this.touchManager.autoRotateHint ? 'on' : ''}" id="rotateHintToggle"></div>
      </div>

      <button class="touch-settings-close" id="settingsClose">确定</button>
    `;

    overlay.appendChild(panel);
    container.appendChild(overlay);

    panel.querySelectorAll('[data-layout]').forEach(el => {
      el.addEventListener('click', () => {
        const layout = el.dataset.layout;
        this.touchManager.setLayout(layout);
        this.touchManager.vibrate('menuSelect');
        panel.querySelectorAll('[data-layout]').forEach(opt => opt.classList.remove('active'));
        el.classList.add('active');
      });
    });

    panel.querySelectorAll('[data-vibration]').forEach(el => {
      el.addEventListener('click', () => {
        const level = el.dataset.vibration;
        this.touchManager.setVibrationLevel(level);
        panel.querySelectorAll('[data-vibration]').forEach(opt => opt.classList.remove('active'));
        el.classList.add('active');
      });
    });

    panel.querySelectorAll('[data-antimistouch]').forEach(el => {
      el.addEventListener('click', () => {
        const level = el.dataset.antimistouch;
        this.touchManager.setAntiMistouchLevel(level);
        panel.querySelectorAll('[data-antimistouch]').forEach(opt => opt.classList.remove('active'));
        el.classList.add('active');
      });
    });

    const rotateToggle = panel.querySelector('#rotateHintToggle');
    rotateToggle.addEventListener('click', () => {
      this.touchManager.toggleAutoRotateHint();
      rotateToggle.classList.toggle('on');
      this.touchManager.vibrate('menuSelect');
    });

    panel.querySelector('#settingsClose').addEventListener('click', () => {
      this._closeSettingsPanel();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this._closeSettingsPanel();
    });
  }

  _openSettingsPanel() {
    const overlay = document.getElementById('touchSettingsOverlay');
    if (overlay) overlay.classList.add('visible');
  }

  _closeSettingsPanel() {
    const overlay = document.getElementById('touchSettingsOverlay');
    if (overlay) overlay.classList.remove('visible');
  }

  _handleMenuClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = this.canvas.width / 2;
    const isPortrait = this.renderer.isPortrait();
    const uiScale = this.renderer._getUIScale();

    const panelW = isPortrait ? Math.min(320 * uiScale, this.canvas.width * 0.85) : 400;
    const panelX = centerX - panelW / 2;
    const titleY = isPortrait ? this.canvas.height / 2 * 0.5 : this.canvas.height / 2 - 130;
    const panelY = isPortrait ? titleY + 80 * uiScale : this.canvas.height / 2 - 20;

    const itemSpacing = isPortrait ? 48 * uiScale : 52;
    const btnOffset0 = isPortrait ? 55 * uiScale : 68;
    const itemY0 = panelY + btnOffset0;
    const itemY1 = itemY0 + itemSpacing;
    const itemY2 = itemY1 + itemSpacing;
    const itemY3 = itemY2 + itemSpacing;
    const itemY4 = itemY3 + itemSpacing;
    const itemY5 = itemY4 + itemSpacing;
    const itemY6 = itemY5 + itemSpacing + 8 * uiScale;
    const itemY7 = itemY6 + itemSpacing;
    const itemY8 = itemY7 + itemSpacing;
    const itemY9 = itemY8 + itemSpacing;

    if (x >= panelX && x <= panelX + panelW) {
      if (y >= itemY0 && y < itemY0 + 45) {
        this.menuCursor = 0;
        if (x < centerX - 20) this._changeDifficulty(-1);
        else if (x > centerX + 20) this._changeDifficulty(1);
      } else if (y >= itemY1 && y < itemY1 + 45) {
        this.menuCursor = 1;
        if (x < centerX - 20) this._changeLaps(-1);
        else if (x > centerX + 20) this._changeLaps(1);
      } else if (y >= itemY2 && y < itemY2 + 45) {
        this.menuCursor = 2;
        this._openVehicleSelect();
      } else if (y >= itemY3 && y < itemY3 + 45) {
        this.menuCursor = 3;
        this._openGarage();
        this.touchManager.vibrate('menuSelect');
      } else if (y >= itemY4 && y < itemY4 + 45) {
        this.menuCursor = 4;
        this._openCareerMap();
        this.touchManager.vibrate('menuSelect');
      } else if (y >= itemY5 && y < itemY5 + 45) {
        this.menuCursor = 5;
        this._openAchievements();
        this.touchManager.vibrate('menuSelect');
      } else if (y >= itemY6 && y < itemY6 + 45) {
        this.menuCursor = 6;
        this._openSettingsPanel();
        this.touchManager.vibrate('menuSelect');
      } else if (y >= itemY7 && y < itemY7 + 45) {
        this.menuCursor = 7;
        this._openRaceEditor();
        this.touchManager.vibrate('menuSelect');
      } else if (y >= itemY8 && y < itemY8 + 45) {
        this.menuCursor = 8;
        this.startWantedChase();
      } else if (y >= itemY9 && y < itemY9 + 45) {
        this.menuCursor = 9;
        this.startGame();
      }
    }
  }

  _changeDifficulty(dir) {
    const keys = Object.keys(DifficultySettings);
    let idx = keys.indexOf(this.difficulty) + dir;
    idx = Utils.clamp(idx, 0, keys.length - 1);
    this.difficulty = keys[idx];
  }

  _changeLaps(dir) {
    this.lapIndex = Utils.clamp(this.lapIndex + dir, 0, LapOptions.length - 1);
    this.totalLaps = LapOptions[this.lapIndex];
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this._loop.bind(this));
  }

  _loop(timestamp) {
    if (!this.running) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this._update(dt);
    this._render();

    requestAnimationFrame(this._loop.bind(this));
  }

  _update(dt) {
    if (this.replaySystem && (this.replaySystem.getState() === ReplayState.RECORDING ||
        this.replaySystem.getState() === ReplayState.PLAYING ||
        this.replaySystem.getState() === ReplayState.PAUSED)) {
      this.replaySystem.update(dt);
    }

    if (this.state === GameState.RACE_EDITOR) {
      return;
    }

    if (this.replaySystem && this.replaySystem.isPlaying()) {
      return;
    }

    switch (this.state) {
      case GameState.MENU:
        this._updateMenu();
        break;
      case GameState.VEHICLE_SELECT:
        this._updateVehicleSelect();
        break;
      case GameState.GARAGE:
        this._updateGarage();
        break;
      case GameState.ACHIEVEMENTS:
        this._updateAchievements();
        break;
      case GameState.CAREER_MAP:
        this._updateCareerMap();
        break;
      case GameState.CAREER_EVENT:
        this._updateCareerEvent();
        break;
      case GameState.CAREER_UPGRADE:
        this._updateCareerUpgrade();
        break;
      case GameState.CAREER_STAGE_CLEAR:
        this._updateCareerStageClear();
        break;
      case GameState.CAREER_RACE_RESULT:
        this._updateCareerRaceResult();
        break;
      case GameState.COUNTDOWN:
        this._updateCountdown(dt);
        break;
      case GameState.RACING:
        this._updateRacing(dt);
        break;
      case GameState.WANTED_CHASE:
        this._updateWantedChase(dt);
        break;
      case GameState.WANTED_RESULT:
        this._updateWantedResult();
        break;
      case GameState.PAUSED:
        this._updatePaused();
        break;
      case GameState.FINISHED:
        this._updateFinished();
        break;
    }
  }

  _updateMenu() {
    if (this.input.isMenuUp()) {
      this.menuCursor = (this.menuCursor - 1 + this.menuItemCount) % this.menuItemCount;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuDown()) {
      this.menuCursor = (this.menuCursor + 1) % this.menuItemCount;
      this.touchManager.vibrate('menuSelect');
    }

    if (this.menuCursor === 0) {
      if (this.input.isMenuLeft()) this._changeDifficulty(-1);
      if (this.input.isMenuRight()) this._changeDifficulty(1);
    } else if (this.menuCursor === 1) {
      if (this.input.isMenuLeft()) this._changeLaps(-1);
      if (this.input.isMenuRight()) this._changeLaps(1);
    } else if (this.menuCursor === 2) {
      if (this.input.isMenuConfirm()) {
        this._openVehicleSelect();
      }
    } else if (this.menuCursor === 3) {
      if (this.input.isMenuConfirm()) {
        this._openGarage();
        this.touchManager.vibrate('menuSelect');
      }
    } else if (this.menuCursor === 4) {
      if (this.input.isMenuConfirm()) {
        this._openCareerMap();
        this.touchManager.vibrate('menuSelect');
      }
    } else if (this.menuCursor === 5) {
      if (this.input.isMenuConfirm()) {
        this._openAchievements();
        this.touchManager.vibrate('menuSelect');
      }
    } else if (this.menuCursor === 6) {
      if (this.input.isMenuConfirm()) {
        this._openSettingsPanel();
        this.touchManager.vibrate('menuSelect');
      }
    } else if (this.menuCursor === 7) {
      if (this.input.isMenuConfirm()) {
        this._openRaceEditor();
        this.touchManager.vibrate('menuSelect');
      }
    } else if (this.menuCursor === 8) {
      if (this.input.isMenuConfirm()) {
        this.startWantedChase();
      }
    } else if (this.menuCursor === 9) {
      if (this.input.isMenuConfirm()) {
        this.startGame();
      }
    }

    this.input.clearJustPressed();
  }

  _openVehicleSelect() {
    this.vehicleSelectCursor = VehicleTypeKeys.indexOf(this.selectedVehicle);
    this.state = GameState.VEHICLE_SELECT;
    this.touchManager.vibrate('menuSelect');
  }

  _openGarage() {
    this.garageCategoryCursor = 0;
    this.garageItemCursor = this.garage.getSelectedIndex('engine');
    this.state = GameState.GARAGE;
    this.touchManager.vibrate('menuSelect');
  }

  _openAchievements() {
    this.achievementCursor = 0;
    this.achievementScrollY = 0;
    this.state = GameState.ACHIEVEMENTS;
  }

  _openCareerMap() {
    this._isCareerMode = true;
    this.careerStageCursor = 0;
    this.careerEventCursor = 0;
    this.state = GameState.CAREER_MAP;
    this.touchManager.vibrate('menuSelect');
  }

  _openCareerEventDetail() {
    const stage = this.career.getStage(this.careerStageCursor);
    if (!stage) return;
    const event = stage.events[this.careerEventCursor];
    if (!event) return;
    if (!this.career.isEventUnlocked(event.id)) return;

    this.career.selectEvent(event.id);
    this.state = GameState.CAREER_EVENT;
    this.touchManager.vibrate('menuSelect');
  }

  _openCareerUpgrade() {
    this.careerUpgradeCursor = 0;
    this.state = GameState.CAREER_UPGRADE;
    this.touchManager.vibrate('menuSelect');
  }

  _openRaceEditor() {
    this.state = GameState.RACE_EDITOR;
    this._isEditorMode = true;
    if (this.raceEditor) {
      this.raceEditor.show();
    }
    this.touchManager.vibrate('menuSelect');
  }

  loadEditorTrack(config) {
    this._editorConfig = config;
    this._isEditorMode = true;
    this.totalLaps = config.laps;
    this.difficulty = config.aiDifficulty;

    const trackData = {
      width: config.trackWidth,
      routes: [{
        id: 'main',
        name: config.name,
        points: [...(config.nodes || config.routes[0].points)],
        color: '#00f5ff',
        isShortcut: false,
        lengthBonus: 1.0,
        checkpoints: config.checkpoints || config.routes[0].checkpoints || []
      }]
    };

    this.track = new Track(config.trackWidth);
    this.track.loadFromConfig(trackData);
    this.collision = new Collision(this.track);

    const vehicle = VehicleTypes[this.selectedVehicle];
    const totalBikes = config.aiCount + 1;
    const startPositions = this.track.getStartPositions(totalBikes, 60);
    const playerGridIndex = Math.min(0, config.aiCount);

    this.player = new Bike(
      startPositions[playerGridIndex].x,
      startPositions[playerGridIndex].y,
      startPositions[playerGridIndex].angle,
      vehicle.color,
      true
    );
    this._applyVehicleAndDifficulty(this.player, vehicle, DifficultySettings[this.difficulty]);
    this.garage.applyUpgradesToBike(this.player, this.selectedVehicle);
    this.collision.damageMultiplier = DifficultySettings[this.difficulty].collisionDamage;

    this.aiBikes = [];
    const aiColors = ['#ff00ff', '#ff6600', '#00ff66', '#ffff00', '#ff0066', '#ff66ff', '#66ff00', '#00ffff'];

    for (let i = 0; i < config.aiCount; i++) {
      const posIndex = i < playerGridIndex ? i : i + 1;
      if (posIndex >= startPositions.length) break;

      const pos = startPositions[posIndex];
      const ai = new AIBike(
        pos.x,
        pos.y,
        pos.angle,
        aiColors[i % aiColors.length],
        config.aiDifficulty
      );
      ai.offTrackFriction = vehicle.baseOffTrackFriction + DifficultySettings[this.difficulty].offTrackFrictionBonus;
      this.aiBikes.push(ai);
    }

    this.renderer.camera.x = this.player.x;
    this.renderer.camera.y = this.player.y;
    this.input.reset();
    this.touchManager.reset();
  }

  _startCareerRace() {
    const selected = this.career.getSelectedEvent();
    if (!selected) return;

    const event = selected.event;
    this.difficulty = event.difficulty;
    const laps = event.laps;

    this._applySettings();
    this._resetRace();

    this.totalLaps = laps;
    this.lapIndex = LapOptions.indexOf(laps);
    if (this.lapIndex < 0) this.lapIndex = 1;

    const touchControls = document.getElementById('touchControls');
    if (touchControls) {
      touchControls.classList.remove('paused');
    }

    this._prevStateBeforePause = null;
    this.state = GameState.COUNTDOWN;
    this.countdown = 3;
    this.countdownTimer = 0;
  }

  _updateAchievements() {
    if (this.input.isMenuUp()) {
      this.achievementCursor = (this.achievementCursor - 1 + AchievementLineKeys.length) % AchievementLineKeys.length;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuDown()) {
      this.achievementCursor = (this.achievementCursor + 1) % AchievementLineKeys.length;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuConfirm() || this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this.state = GameState.MENU;
      this.menuCursor = 3;
      this.touchManager.vibrate('menuSelect');
    }
    this.input.clearJustPressed();
  }

  _updateCareerMap() {
    const stages = this.career.getStages();
    const currentStage = stages[this.careerStageCursor];
    const eventCount = currentStage ? currentStage.events.length : 0;

    if (this.input.isMenuLeft()) {
      this.careerStageCursor = (this.careerStageCursor - 1 + stages.length) % stages.length;
      this.careerEventCursor = 0;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuRight()) {
      this.careerStageCursor = (this.careerStageCursor + 1) % stages.length;
      this.careerEventCursor = 0;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuUp()) {
      if (this.careerEventCursor > 0) {
        this.careerEventCursor--;
        this.touchManager.vibrate('menuSelect');
      }
    }
    if (this.input.isMenuDown()) {
      if (this.careerEventCursor < eventCount - 1) {
        this.careerEventCursor++;
        this.touchManager.vibrate('menuSelect');
      }
    }

    if (this.input.isMenuConfirm()) {
      if (currentStage && this.career.isStageUnlocked(this.careerStageCursor)) {
        const event = currentStage.events[this.careerEventCursor];
        if (event && this.career.isEventUnlocked(event.id)) {
          this._openCareerEventDetail();
        }
      }
    }

    if (this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this.state = GameState.MENU;
      this.menuCursor = 3;
      this._isCareerMode = false;
      this.touchManager.vibrate('menuSelect');
    }

    if (this.input.keys['KeyU']) {
      this.input.keys['KeyU'] = false;
      this._openCareerUpgrade();
      this.touchManager.vibrate('menuSelect');
    }

    this.input.clearJustPressed();
  }

  _updateCareerEvent() {
    if (this.input.isMenuConfirm()) {
      this._startCareerRace();
    }

    if (this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this.state = GameState.CAREER_MAP;
      this.touchManager.vibrate('menuSelect');
    }

    this.input.clearJustPressed();
  }

  _updateCareerUpgrade() {
    const upgradeCount = UpgradeTypeKeys.length;

    if (this.input.isMenuUp()) {
      this.careerUpgradeCursor = (this.careerUpgradeCursor - 1 + upgradeCount) % upgradeCount;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuDown()) {
      this.careerUpgradeCursor = (this.careerUpgradeCursor + 1) % upgradeCount;
      this.touchManager.vibrate('menuSelect');
    }

    if (this.input.isMenuConfirm()) {
      const upgradeId = UpgradeTypeKeys[this.careerUpgradeCursor];
      if (this.career.canUpgrade(upgradeId)) {
        this.career.upgradeVehicle(upgradeId);
        this.touchManager.vibrate('newRecord');
      } else {
        this.touchManager.vibrate('menuSelect');
      }
    }

    if (this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this.state = GameState.CAREER_MAP;
      this.touchManager.vibrate('menuSelect');
    }

    this.input.clearJustPressed();
  }

  _updateCareerStageClear() {
    if (this.input.isMenuConfirm()) {
      this.career.showingStageClear = false;
      this.state = GameState.CAREER_MAP;
      this.touchManager.vibrate('menuSelect');
    }
    this.input.clearJustPressed();
  }

  _updateCareerRaceResult() {
    if (this.input.isMenuConfirm()) {
      if (this.career.showingStageClear) {
        this.career.showingStageClear = false;
        this.state = GameState.CAREER_STAGE_CLEAR;
      } else {
        this.state = GameState.CAREER_MAP;
      }
      this.touchManager.vibrate('menuSelect');
    }
    this.input.clearJustPressed();
  }

  _updateVehicleSelect() {
    if (this.input.isMenuUp()) {
      this.vehicleSelectCursor = (this.vehicleSelectCursor - 1 + VehicleTypeKeys.length) % VehicleTypeKeys.length;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuDown()) {
      this.vehicleSelectCursor = (this.vehicleSelectCursor + 1) % VehicleTypeKeys.length;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuLeft()) {
      this.vehicleSelectCursor = (this.vehicleSelectCursor - 1 + VehicleTypeKeys.length) % VehicleTypeKeys.length;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuRight()) {
      this.vehicleSelectCursor = (this.vehicleSelectCursor + 1) % VehicleTypeKeys.length;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuConfirm()) {
      this._confirmVehicleSelection();
    }
    if (this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this.state = GameState.MENU;
      this.touchManager.vibrate('menuSelect');
    }
    this.input.clearJustPressed();
  }

  _confirmVehicleSelection() {
    this.selectedVehicle = VehicleTypeKeys[this.vehicleSelectCursor];
    this._saveVehicleSelection(this.selectedVehicle);
    this.state = GameState.MENU;
    this.touchManager.vibrate('menuSelect');
  }

  _updateGarage() {
    const category = GarageCategoryKeys[this.garageCategoryCursor];
    const itemCount = this.garage.getCategoryItemCount(category);

    if (this.input.isMenuUp()) {
      this.garageItemCursor = (this.garageItemCursor - 1 + itemCount) % itemCount;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuDown()) {
      this.garageItemCursor = (this.garageItemCursor + 1) % itemCount;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuLeft()) {
      this.garageCategoryCursor = (this.garageCategoryCursor - 1 + GarageCategoryKeys.length) % GarageCategoryKeys.length;
      this.garageItemCursor = this.garage.getSelectedIndex(GarageCategoryKeys[this.garageCategoryCursor]);
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuRight()) {
      this.garageCategoryCursor = (this.garageCategoryCursor + 1) % GarageCategoryKeys.length;
      this.garageItemCursor = this.garage.getSelectedIndex(GarageCategoryKeys[this.garageCategoryCursor]);
      this.touchManager.vibrate('menuSelect');
    }

    if (this.input.isMenuConfirm()) {
      const cat = GarageCategoryKeys[this.garageCategoryCursor];
      const idx = this.garageItemCursor;
      if (this.garage.isItemUnlocked(cat, idx)) {
        this.garage.selectItem(cat, idx);
        this.touchManager.vibrate('menuSelect');
      } else if (this.garage.canBuyItem(cat, idx)) {
        this.garage.buyItem(cat, idx);
        this.touchManager.vibrate('newRecord');
      } else {
        this.touchManager.vibrate('menuSelect');
      }
    }

    if (this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this.state = GameState.MENU;
      this.menuCursor = 3;
      this.touchManager.vibrate('menuSelect');
    }

    this.input.clearJustPressed();
  }

  _handleVehicleSelectClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = this.canvas.width / 2;
    const isPortrait = this.renderer.isPortrait();
    const uiScale = this.renderer._getUIScale();

    if (this._checkVehicleButtonClick(x, y, isPortrait, uiScale, centerX)) {
      return;
    }

    if (this._checkVehiclePreviewClick(x, y, isPortrait, uiScale, centerX)) {
      return;
    }

    if (this._checkVehicleListClick(x, y, isPortrait, uiScale, centerX)) {
      return;
    }
  }

  _checkVehiclePreviewClick(x, y, isPortrait, uiScale, centerX) {
    let previewX, previewY, previewW, previewH;

    if (isPortrait) {
      previewH = 200 * uiScale;
      previewY = 70 * uiScale;
      previewW = Math.min(340 * uiScale, this.canvas.width * 0.9);
      previewX = centerX - previewW / 2;
    } else {
      previewX = 60;
      previewY = 100;
      previewW = 380;
      previewH = this.canvas.height - 200;
    }

    if (x >= previewX && x <= previewX + previewW && y >= previewY && y <= previewY + previewH) {
      this._confirmVehicleSelection();
      return true;
    }
    return false;
  }

  _checkVehicleButtonClick(x, y, isPortrait, uiScale, centerX) {
    const btnH = isPortrait ? 40 * uiScale : 44;
    const btnY = isPortrait ? this.canvas.height - 75 * uiScale : this.canvas.height - 65;
    const totalBtnW = isPortrait ? 280 * uiScale : 320;
    const btnGap = isPortrait ? 12 * uiScale : 16;
    const btnW = (totalBtnW - btnGap) / 2;
    const btnX = centerX - totalBtnW / 2;

    const cancelX = btnX;
    const confirmX = btnX + btnW + btnGap;

    if (y >= btnY && y <= btnY + btnH) {
      if (x >= cancelX && x <= cancelX + btnW) {
        this.state = GameState.MENU;
        this.touchManager.vibrate('menuSelect');
        return true;
      }
      if (x >= confirmX && x <= confirmX + btnW) {
        this._confirmVehicleSelection();
        return true;
      }
    }
    return false;
  }

  _checkVehicleListClick(x, y, isPortrait, uiScale, centerX) {
    let listX, listY, listW, listH;

    if (isPortrait) {
      const previewH = 200 * uiScale;
      const previewY = 70 * uiScale;
      const previewW = Math.min(340 * uiScale, this.canvas.width * 0.9);
      listY = previewY + previewH + 15 * uiScale;
      listH = this.canvas.height - listY - 100 * uiScale;
      listW = Math.min(360 * uiScale, this.canvas.width * 0.92);
      listX = centerX - listW / 2;
    } else {
      const previewPanelX = 60;
      const previewPanelW = 380;
      listX = previewPanelX + previewPanelW + 30;
      listY = 100;
      listW = this.canvas.width - listX - 60;
      listH = this.canvas.height - 180;
    }

    if (x < listX || x > listX + listW || y < listY || y > listY + listH) {
      return false;
    }

    const itemCount = VehicleTypeKeys.length;
    const itemGap = isPortrait ? 8 * uiScale : 10;
    const itemH = isPortrait ? 58 * uiScale : 65;
    const totalItemH = itemCount * itemH + (itemCount - 1) * itemGap;
    const startY = listY + 50 + (listH - 60 - totalItemH) / 2;

    for (let i = 0; i < VehicleTypeKeys.length; i++) {
      const iy = startY + i * (itemH + itemGap);
      const itemX = listX + 12;
      const itemW = listW - 24;

      if (x >= itemX && x <= itemX + itemW && y >= iy && y <= iy + itemH) {
        this.vehicleSelectCursor = i;
        this.touchManager.vibrate('menuSelect');
        return true;
      }
    }

    return false;
  }

  _handleCareerMapClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = this.canvas.width / 2;
    const isPortrait = this.renderer.isPortrait();
    const uiScale = this.renderer._getUIScale();

    if (this._checkCareerMapBackClick(x, y, isPortrait, uiScale)) {
      return;
    }

    if (this._checkCareerMapUpgradeClick(x, y, isPortrait, uiScale)) {
      return;
    }

    if (this._checkCareerMapStageNavClick(x, y, isPortrait, uiScale, centerX)) {
      return;
    }

    if (this._checkCareerMapEventClick(x, y, isPortrait, uiScale, centerX)) {
      return;
    }
  }

  _checkCareerMapBackClick(x, y, isPortrait, uiScale) {
    const btnW = isPortrait ? 80 * uiScale : 90;
    const btnH = isPortrait ? 36 * uiScale : 40;
    const btnX = isPortrait ? 15 * uiScale : 20;
    const btnY = isPortrait ? 20 * uiScale : 20;

    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      this.state = GameState.MENU;
      this.menuCursor = 3;
      this._isCareerMode = false;
      this.touchManager.vibrate('menuSelect');
      return true;
    }
    return false;
  }

  _checkCareerMapUpgradeClick(x, y, isPortrait, uiScale) {
    const btnW = isPortrait ? 100 * uiScale : 110;
    const btnH = isPortrait ? 36 * uiScale : 40;
    const btnX = this.canvas.width - (isPortrait ? 15 * uiScale : 20) - btnW;
    const btnY = isPortrait ? 20 * uiScale : 20;

    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      this._openCareerUpgrade();
      return true;
    }
    return false;
  }

  _checkCareerMapStageNavClick(x, y, isPortrait, uiScale, centerX) {
    const stages = this.career.getStages();
    const navY = isPortrait ? 90 * uiScale : 90;
    const navBtnSize = isPortrait ? 40 * uiScale : 45;
    const stageTitleW = isPortrait ? 220 * uiScale : 280;

    const leftBtnX = centerX - stageTitleW / 2 - navBtnSize - 10;
    const rightBtnX = centerX + stageTitleW / 2 + 10;

    if (y >= navY - navBtnSize / 2 && y <= navY + navBtnSize / 2) {
      if (x >= leftBtnX && x <= leftBtnX + navBtnSize) {
        this.careerStageCursor = (this.careerStageCursor - 1 + stages.length) % stages.length;
        this.careerEventCursor = 0;
        this.touchManager.vibrate('menuSelect');
        return true;
      }
      if (x >= rightBtnX && x <= rightBtnX + navBtnSize) {
        this.careerStageCursor = (this.careerStageCursor + 1) % stages.length;
        this.careerEventCursor = 0;
        this.touchManager.vibrate('menuSelect');
        return true;
      }
    }
    return false;
  }

  _checkCareerMapEventClick(x, y, isPortrait, uiScale, centerX) {
    const stage = this.career.getStage(this.careerStageCursor);
    if (!stage) return false;
    if (!this.career.isStageUnlocked(this.careerStageCursor)) return false;

    const listTop = isPortrait ? 160 * uiScale : 150;
    const listBottom = isPortrait ? this.canvas.height - 120 * uiScale : this.canvas.height - 100;
    const listW = isPortrait ? Math.min(360 * uiScale, this.canvas.width * 0.9) : 500;
    const listX = centerX - listW / 2;

    const eventCount = stage.events.length;
    const itemGap = isPortrait ? 10 * uiScale : 12;
    const itemH = isPortrait ? 60 * uiScale : 70;
    const totalItemH = eventCount * itemH + (eventCount - 1) * itemGap;
    const startY = listTop + (listBottom - listTop - totalItemH) / 2;

    for (let i = 0; i < eventCount; i++) {
      const iy = startY + i * (itemH + itemGap);
      const event = stage.events[i];
      const isUnlocked = this.career.isEventUnlocked(event.id);

      if (x >= listX + 10 && x <= listX + listW - 10 &&
          y >= iy && y <= iy + itemH) {
        if (isUnlocked) {
          this.careerEventCursor = i;
          this.touchManager.vibrate('menuSelect');
          this._openCareerEventDetail();
        }
        return true;
      }
    }
    return false;
  }

  _handleCareerEventClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = this.canvas.width / 2;
    const isPortrait = this.renderer.isPortrait();
    const uiScale = this.renderer._getUIScale();

    const btnH = isPortrait ? 48 * uiScale : 52;
    const btnY = isPortrait ? this.canvas.height - 100 * uiScale : this.canvas.height - 90;
    const totalBtnW = isPortrait ? 280 * uiScale : 320;
    const btnGap = isPortrait ? 12 * uiScale : 16;
    const btnW = (totalBtnW - btnGap) / 2;
    const btnX = centerX - totalBtnW / 2;

    const cancelX = btnX;
    const startX = btnX + btnW + btnGap;

    if (y >= btnY && y <= btnY + btnH) {
      if (x >= cancelX && x <= cancelX + btnW) {
        this.state = GameState.CAREER_MAP;
        this.touchManager.vibrate('menuSelect');
        return;
      }
      if (x >= startX && x <= startX + btnW) {
        this._startCareerRace();
        return;
      }
    }
  }

  _handleCareerUpgradeClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = this.canvas.width / 2;
    const isPortrait = this.renderer.isPortrait();
    const uiScale = this.renderer._getUIScale();

    const backBtnW = isPortrait ? 80 * uiScale : 90;
    const backBtnH = isPortrait ? 36 * uiScale : 40;
    const backBtnX = isPortrait ? 15 * uiScale : 20;
    const backBtnY = isPortrait ? 20 * uiScale : 20;

    if (x >= backBtnX && x <= backBtnX + backBtnW &&
        y >= backBtnY && y <= backBtnY + backBtnH) {
      this.state = GameState.CAREER_MAP;
      this.touchManager.vibrate('menuSelect');
      return;
    }

    const listTop = isPortrait ? 100 * uiScale : 90;
    const listBottom = isPortrait ? this.canvas.height - 80 * uiScale : this.canvas.height - 70;
    const listW = isPortrait ? Math.min(380 * uiScale, this.canvas.width * 0.92) : 550;
    const listX = centerX - listW / 2;

    const itemCount = UpgradeTypeKeys.length;
    const itemGap = isPortrait ? 10 * uiScale : 12;
    const itemH = isPortrait ? 70 * uiScale : 80;
    const totalItemH = itemCount * itemH + (itemCount - 1) * itemGap;
    const startY = listTop + (listBottom - listTop - totalItemH) / 2;

    for (let i = 0; i < itemCount; i++) {
      const iy = startY + i * (itemH + itemGap);
      const upgradeId = UpgradeTypeKeys[i];

      if (x >= listX + 10 && x <= listX + listW - 10 &&
          y >= iy && y <= iy + itemH) {
        this.careerUpgradeCursor = i;
        this.touchManager.vibrate('menuSelect');

        if (this.career.canUpgrade(upgradeId)) {
          this.career.upgradeVehicle(upgradeId);
          this.touchManager.vibrate('newRecord');
        }
        return;
      }
    }
  }

  _handleGarageClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = this.canvas.width / 2;
    const isPortrait = this.renderer.isPortrait();
    const uiScale = this.renderer._getUIScale();
    const garage = this.garage;

    const backBtnW = isPortrait ? 80 * uiScale : 90;
    const backBtnH = isPortrait ? 32 * uiScale : 36;
    const backBtnX = isPortrait ? 15 * uiScale : 20;
    const backBtnY = isPortrait ? 20 * uiScale : 20;

    if (x >= backBtnX && x <= backBtnX + backBtnW &&
        y >= backBtnY && y <= backBtnY + backBtnH) {
      this.state = GameState.MENU;
      this.menuCursor = 3;
      this.touchManager.vibrate('menuSelect');
      return;
    }

    const categoryY = isPortrait ? 55 * uiScale : 65;
    const categoryCount = GarageCategoryKeys.length;
    const categoryTabW = isPortrait ? (this.canvas.width * 0.9) / categoryCount : 120;
    const categoryTabH = isPortrait ? 32 * uiScale : 38;
    const categoryTotalW = categoryTabW * categoryCount;
    const categoryStartX = centerX - categoryTotalW / 2;

    for (let i = 0; i < categoryCount; i++) {
      const tabX = categoryStartX + i * categoryTabW;
      if (x >= tabX + 2 && x <= tabX + categoryTabW - 2 &&
          y >= categoryY && y <= categoryY + categoryTabH) {
        this.garageCategoryCursor = i;
        this.garageItemCursor = garage.getSelectedIndex(GarageCategoryKeys[i]);
        this.touchManager.vibrate('menuSelect');
        return;
      }
    }

    const contentY = categoryY + categoryTabH + (isPortrait ? 10 * uiScale : 15);
    const category = GarageCategoryKeys[this.garageCategoryCursor];
    const itemCount = garage.getCategoryItemCount(category);

    let listX, listY, listW, listH;
    let previewX, previewY, previewW, previewH;

    if (isPortrait) {
      const panelW = Math.min(360 * uiScale, this.canvas.width * 0.92);
      const panelX = centerX - panelW / 2;
      const previewHP = 220 * uiScale;
      const raceHP = 90 * uiScale;

      previewX = panelX;
      previewY = contentY;
      previewW = panelW;
      previewH = previewHP;

      listX = panelX;
      listY = contentY + previewHP + 6 * uiScale;
      listW = panelW;
      listH = this.canvas.height - contentY - previewHP - raceHP - 30 * uiScale;
    } else {
      const leftPanelX = 40;
      const leftPanelW = 340;
      const leftPanelH = this.canvas.height - contentY - 50;

      const rightPanelX = leftPanelX + leftPanelW + 20;
      const rightPanelW = this.canvas.width - rightPanelX - 40;
      const rightPanelH = this.canvas.height - contentY - 50;
      const previewHR = rightPanelH - 130;

      listX = leftPanelX;
      listY = contentY;
      listW = leftPanelW;
      listH = leftPanelH;

      previewX = rightPanelX;
      previewY = contentY;
      previewW = rightPanelW;
      previewH = previewHR;
    }

    const listTop = listY + 40 * uiScale;
    const listBottom = listY + listH - 15 * uiScale;
    const listAreaH = listBottom - listTop;

    const itemGap = isPortrait ? 6 * uiScale : 8;
    const itemH = isPortrait ? 50 * uiScale : 56;
    const totalItemH = itemCount * itemH + (itemCount - 1) * itemGap;
    const startY = listTop + Math.max(0, (listAreaH - totalItemH) / 2);

    for (let i = 0; i < itemCount; i++) {
      const iy = startY + i * (itemH + itemGap);
      const itemAreaX = listX + 8 * uiScale;
      const itemAreaW = listW - 16 * uiScale;

      if (x >= itemAreaX && x <= itemAreaX + itemAreaW &&
          y >= iy && y <= iy + itemH) {
        this.garageItemCursor = i;
        const cat = GarageCategoryKeys[this.garageCategoryCursor];
        const idx = this.garageItemCursor;

        if (garage.isItemUnlocked(cat, idx)) {
          garage.selectItem(cat, idx);
          this.touchManager.vibrate('menuSelect');
        } else if (garage.canBuyItem(cat, idx)) {
          garage.buyItem(cat, idx);
          this.touchManager.vibrate('newRecord');
        } else {
          this.touchManager.vibrate('menuSelect');
        }
        return;
      }
    }

    const currentItem = garage.getItemByIndex(category, this.garageItemCursor);
    const isUnlocked = garage.isItemUnlocked(category, this.garageItemCursor);
    const canBuy = garage.canBuyItem(category, this.garageItemCursor);
    const isSelected = this.garageItemCursor === garage.getSelectedIndex(category);

    let btnX, btnY, btnW, btnH;
    if (isPortrait) {
      btnW = 160 * uiScale;
      btnH = 30 * uiScale;
      btnX = previewX + previewW / 2 - btnW / 2;
      btnY = previewY + previewH - 38 * uiScale;
    } else {
      btnW = 200;
      btnH = 40;
      btnX = previewX + previewW / 2 - btnW / 2;
      btnY = previewY + previewH - 50;
    }

    if (x >= btnX && x <= btnX + btnW &&
        y >= btnY && y <= btnY + btnH) {
      const cat = GarageCategoryKeys[this.garageCategoryCursor];
      const idx = this.garageItemCursor;

      if (isUnlocked && !isSelected) {
        garage.selectItem(cat, idx);
        this.touchManager.vibrate('menuSelect');
      } else if (canBuy) {
        garage.buyItem(cat, idx);
        this.touchManager.vibrate('newRecord');
      }
    }
  }

  startGame() {
    this._isWantedMode = false;
    this._applySettings();
    this._resetRace();

    this.wantedSystem.reset();

    const touchControls = document.getElementById('touchControls');
    if (touchControls) {
      touchControls.classList.remove('paused');
    }

    if (this._isEditorMode && this.replaySystem) {
      this.replaySystem.startRecording();
    }

    this._prevStateBeforePause = null;
    this.state = GameState.COUNTDOWN;
    this.countdown = 3;
    this.countdownTimer = 0;
  }

  _applySettings() {
    const cfg = DifficultySettings[this.difficulty];
    const vehicle = VehicleTypes[this.selectedVehicle];
    this._applyVehicleAndDifficulty(this.player, vehicle, cfg);
    this.totalLaps = LapOptions[this.lapIndex];
  }

  _resetRace() {
    const cfg = DifficultySettings[this.difficulty];
    const vehicle = VehicleTypes[this.selectedVehicle];
    const totalBikes = cfg.aiCount + 1;
    const startPositions = this.track.getStartPositions(totalBikes, 60);

    this.player.reset(
      startPositions[cfg.playerGridIndex].x,
      startPositions[cfg.playerGridIndex].y,
      startPositions[cfg.playerGridIndex].angle
    );
    this.player.color = vehicle.color;
    this._applyVehicleAndDifficulty(this.player, vehicle, cfg);
    this.garage.applyUpgradesToBike(this.player, this.selectedVehicle);
    this.collision.damageMultiplier = cfg.collisionDamage;

    this.aiBikes = [];
    this._createAIBikes(startPositions, cfg);

    this.aiBikes.forEach(ai => {
      ai.offTrackFriction = vehicle.baseOffTrackFriction + cfg.offTrackFrictionBonus;
    });

    this.raceTime = 0;
    this.isHistoricalRecord = false;
    this._prevPlayerLap = 0;
    this._prevCollisionCount = 0;
    this._prevWasOffTrack = false;
    this._prevWasDrifting = false;
    this._prevObstacleCollisions = 0;
    this._prevObstaclesDestroyed = 0;
    this._prevPoliceCollisions = 0;
    this._prevBikeCollisionCount = 0;
    this._nitroVibTimer = 0;
    this.track.resetObstacles();
    this.collision.resetObstacleStats();
    this.renderer.camera.x = this.player.x;
    this.renderer.camera.y = this.player.y;
    this.input.reset();
    this.touchManager.reset();
  }

  _updateCountdown(dt) {
    if (this.input.isPause()) {
      this.pauseGame();
      this.input.clearJustPressed();
      return;
    }

    this.countdownTimer += dt;

    if (this.countdownTimer >= 1) {
      this.countdownTimer = 0;
      this.countdown--;

      if (this.countdown > 0) {
        this.touchManager.vibrate('countdown');
      } else if (this.countdown === 0) {
        this.touchManager.vibrate('go');
      }

      if (this.countdown < 0) {
        if (this._isWantedMode) {
          this.state = GameState.WANTED_CHASE;
          this.wantedSystem.startWanted();
        } else {
          this.state = GameState.RACING;
        }
      }
    }
  }

  _updateRacing(dt) {
    if (this.input.isPause()) {
      this.pauseGame();
      this.input.clearJustPressed();
      return;
    }

    this.raceTime += dt * 1000;

    if (!this.player.finished) {
      this.player.raceTime = this.raceTime;
    }

    if (this.player.newRecordTimer > 0) {
      this.player.newRecordTimer -= dt;
      if (this.player.newRecordTimer <= 0) {
        this.player.isNewLapRecord = false;
      }
    }

    if (this._prevPlayerLap < this.player.lap) {
      this._prevPlayerLap = this.player.lap;
      if (this.player.isNewLapRecord) {
        this.touchManager.vibrate('newRecord');
      } else {
        this.touchManager.vibrate('lapComplete');
      }
    }

    if (!this.player.prevNitroActive && this.player.nitroActive) {
      this.touchManager.vibrate('nitroBurst');
    }
    if (this.player.nitroActive) {
      if (!this._nitroVibTimer || this._nitroVibTimer <= 0) {
        this.touchManager.vibrate('nitroActive');
        this._nitroVibTimer = 0.15;
      } else {
        this._nitroVibTimer -= dt;
      }
    } else {
      this._nitroVibTimer = 0;
    }

    const playerInput = {
      accel: this.input.isAccel(),
      brake: this.input.isBrake(),
      left: this.input.isLeft(),
      right: this.input.isRight(),
      nitro: this.input.isNitro()
    };

    this.player.update(dt, playerInput, this.track);
    this.collision.checkTrackCollision(this.player);
    this.collision.checkObstacleCollision(this.player);
    this.collision.updateRouteTracking(this.player);
    this.collision.updateCheckpoints(this.player);
    this.collision.updateBranchHints(this.player);

    if (this.player.lap >= this.totalLaps && !this.player.finished) {
      this.player.finished = true;
      this.player.raceTime = this.raceTime;
    }

    this.aiBikes.forEach(ai => {
      if (!ai.finished) {
        ai.raceTime = this.raceTime;
      }
      ai.update(dt, this.track, this.getAllBikes());
      this.collision.checkTrackCollision(ai);
      this.collision.checkObstacleCollision(ai);
      this.collision.updateRouteTracking(ai);
      this.collision.updateCheckpoints(ai);
      this.collision.updateBranchHints(ai);
      if (ai.lap >= this.totalLaps && !ai.finished) {
        ai.finished = true;
        ai.raceTime = this.raceTime;
      }
    });

    this.track.updateObstacles(dt);

    const collisionCount = this.collision._bikeCollisionCount || 0;
    if (collisionCount > this._prevCollisionCount) {
      this.touchManager.vibrate('collision');
    }
    this._prevCollisionCount = collisionCount;

    const playerObsCollisions = this.player.obstacleCollisions || 0;
    if (playerObsCollisions > this._prevObstacleCollisions) {
      this.touchManager.vibrate('collision');
    }
    this._prevObstacleCollisions = playerObsCollisions;

    const playerObsDestroyed = this.player.obstaclesDestroyed || 0;
    if (playerObsDestroyed > this._prevObstaclesDestroyed) {
      this.touchManager.vibrate('newRecord');
    }
    this._prevObstaclesDestroyed = playerObsDestroyed;

    if (!this.player.isOnTrack && !this._prevWasOffTrack) {
      this.touchManager.vibrate('offTrack');
    }
    this._prevWasOffTrack = !this.player.isOnTrack;

    if (this.player.driftFactor > 0.5 && !this._prevWasDrifting) {
      this.touchManager.vibrate('drift');
    }
    this._prevWasDrifting = this.player.driftFactor > 0.5;

    this.collision.checkAllBikeCollisions(this.getAllBikes());

    const allFinished = this.getAllBikes().every(b => b.finished);
    if (allFinished || this.player.finished) {
      if (this.replaySystem && this.replaySystem.getState() === ReplayState.RECORDING) {
        this.replaySystem.stopRecording();
      }

      this._saveBestLapRecord();
      this._processAchievements();

      const rankings = this.getRankings();
      const playerRanking = rankings.find(r => r.bike.isPlayer);
      const finalRank = playerRanking ? playerRanking.rank : rankings.length + 1;
      const finalTime = this.player.raceTime;
      const finalBestLap = this.player.bestLapTime;

      this.garage.addRaceResult({
        rank: finalRank,
        time: finalTime,
        bestLap: finalBestLap,
        totalLaps: this.totalLaps,
        difficulty: this.difficulty,
        vehicleType: this.selectedVehicle
      });

      if (this._isCareerMode && this.career.selectedEventId) {

        const result = this.career.processRaceResult(
          this.career.selectedEventId,
          finalRank,
          finalTime,
          finalBestLap,
          this.totalLaps
        );

        this.careerRaceResultData = {
          rank: finalRank,
          time: finalTime,
          bestLap: finalBestLap,
          coinsEarned: result.coinsEarned,
          isNewBest: result.isNewBest,
          totalLaps: this.totalLaps,
          eventId: this.career.selectedEventId
        };

        this.state = GameState.CAREER_RACE_RESULT;
      } else {
        this.state = GameState.FINISHED;
      }
    }

    this.renderer.updateCamera(this.player, dt);
    this.achievements.updateNotificationTimer(dt);
  }

  startWantedChase() {
    this._isWantedMode = true;
    this._applySettings();
    this._resetRace();

    this.wantedSystem.reset();

    const touchControls = document.getElementById('touchControls');
    if (touchControls) {
      touchControls.classList.remove('paused');
    }

    this._prevStateBeforePause = null;
    this.state = GameState.COUNTDOWN;
    this.countdown = 3;
    this.countdownTimer = 0;

    this.touchManager.vibrate('menuSelect');
  }

  _updateWantedChase(dt) {
    if (this.input.isPause()) {
      this.pauseGame();
      this.input.clearJustPressed();
      return;
    }

    this.raceTime += dt * 1000;
    this.player.raceTime = this.raceTime;

    if (this.player.newRecordTimer > 0) {
      this.player.newRecordTimer -= dt;
      if (this.player.newRecordTimer <= 0) {
        this.player.isNewLapRecord = false;
      }
    }

    if (!this.player.prevNitroActive && this.player.nitroActive) {
      this.touchManager.vibrate('nitroBurst');
    }
    if (this.player.nitroActive) {
      if (!this._nitroVibTimer || this._nitroVibTimer <= 0) {
        this.touchManager.vibrate('nitroActive');
        this._nitroVibTimer = 0.15;
      } else {
        this._nitroVibTimer -= dt;
      }
    } else {
      this._nitroVibTimer = 0;
    }

    const playerInput = {
      accel: this.input.isAccel(),
      brake: this.input.isBrake(),
      left: this.input.isLeft(),
      right: this.input.isRight(),
      nitro: this.input.isNitro()
    };

    this.player.update(dt, playerInput, this.track);
    this.collision.checkTrackCollision(this.player);
    this.collision.checkObstacleCollision(this.player);
    this.collision.updateRouteTracking(this.player);
    this.collision.updateCheckpoints(this.player);
    this.collision.updateBranchHints(this.player);

    this._updateWantedHeatSources();

    this.aiBikes.forEach(ai => {
      if (!ai.finished) {
        ai.raceTime = this.raceTime;
      }
      ai.update(dt, this.track, this.getAllBikes());
      this.collision.checkTrackCollision(ai);
      this.collision.checkObstacleCollision(ai);
      this.collision.updateRouteTracking(ai);
      this.collision.updateCheckpoints(ai);
      this.collision.updateBranchHints(ai);
    });

    this.track.updateObstacles(dt);

    this.wantedSystem.update(dt, this.player, this.getAllBikes());

    const policeBikes = this.wantedSystem.getPoliceBikes();
    const policeCollisionCount = this.collision.checkAllPoliceCollisions(this.player, policeBikes);

    if (policeCollisionCount > 0) {
      this.touchManager.vibrate('collision');
      this.wantedSystem.onPoliceCollision();
    }

    const playerPoliceCollisions = this.player.policeCollisions || 0;
    if (playerPoliceCollisions > this._prevPoliceCollisions) {
      this.touchManager.vibrate('collision');
    }
    this._prevPoliceCollisions = playerPoliceCollisions;

    const nearMissCount = this.collision.checkNearMiss(this.player, policeBikes, 60);
    if (nearMissCount > 0) {
      this.wantedSystem.onNearMiss();
    }

    const collisionCount = this.collision._bikeCollisionCount || 0;
    if (collisionCount > this._prevCollisionCount) {
      this.touchManager.vibrate('collision');
    }
    this._prevCollisionCount = collisionCount;

    const playerObsCollisions = this.player.obstacleCollisions || 0;
    if (playerObsCollisions > this._prevObstacleCollisions) {
      this.touchManager.vibrate('collision');
    }
    this._prevObstacleCollisions = playerObsCollisions;

    const playerObsDestroyed = this.player.obstaclesDestroyed || 0;
    if (playerObsDestroyed > this._prevObstaclesDestroyed) {
      this.touchManager.vibrate('newRecord');
      this.wantedSystem.addHeat('OBSTACLE_DESTROY');
    }
    this._prevObstaclesDestroyed = playerObsDestroyed;

    if (!this.player.isOnTrack && !this._prevWasOffTrack) {
      this.touchManager.vibrate('offTrack');
    }
    this._prevWasOffTrack = !this.player.isOnTrack;

    if (this.player.driftFactor > 0.5 && !this._prevWasDrifting) {
      this.touchManager.vibrate('drift');
    }
    this._prevWasDrifting = this.player.driftFactor > 0.5;

    this.collision.checkAllBikeCollisions(this.getAllBikes());

    const wantedState = this.wantedSystem.getState();
    if (wantedState === WantedState.ESCAPED || wantedState === WantedState.BUSTED) {
      this._finishWantedChase();
    }

    this.renderer.updateCamera(this.player, dt);
    this.achievements.updateNotificationTimer(dt);
  }

  _updateWantedHeatSources() {
    const speedRatio = Math.abs(this.player.speed) / this.player.maxSpeed;

    if (speedRatio > 0.8) {
      this.wantedSystem.addHeat('SPEEDING');
    }

    if (speedRatio > 0.6 && this.player.driftFactor > 0.4) {
      this.wantedSystem.addHeat('HIGH_SPEED_DRIFT');
    }

    if (!this.player.isOnTrack) {
      this.wantedSystem.addHeat('OFF_TRACK');
    }

    if (this.player.nitroActive) {
      this.wantedSystem.addHeat('NITRO_BURST');
    }

    const bikeCollisions = this.player.bikeCollisions || 0;
    if (bikeCollisions > this._prevBikeCollisionCount) {
      this.wantedSystem.addHeat('BIKE_COLLISION');
      this._prevBikeCollisionCount = bikeCollisions;
    }
  }

  _finishWantedChase() {
    const state = this.wantedSystem.getState();
    const escaped = state === WantedState.ESCAPED;
    const rewardBreakdown = this.wantedSystem.getRewardBreakdown();
    const totalReward = this.wantedSystem.getReward();

    const coinsEarned = this.career.addCoins(totalReward);

    this._wantedResultData = {
      escaped: escaped,
      wantedStars: this.wantedSystem.maxWantedReached,
      survivalTime: this.wantedSystem.getSurvivalTime(),
      maxPoliceCount: this.wantedSystem.getMaxPoliceCount(),
      nearMisses: this.wantedSystem.nearMissCount,
      collisions: this.wantedSystem.totalPoliceCollisions,
      totalReward: totalReward,
      rewardBreakdown: rewardBreakdown,
      coinsEarned: coinsEarned
    };

    if (this._isCareerMode) {
    } else {
      this.state = GameState.WANTED_RESULT;
    }

    this.touchManager.vibrate('newRecord');
  }

  _updateWantedResult() {
    if (this.input.isMenuConfirm()) {
      this.state = GameState.MENU;
      this.menuCursor = 8;
      this.input.clearJustPressed();
    }
  }

  _updateFinished() {
    if (this.input.isMenuConfirm()) {
      if (this._isEditorMode) {
        this._isEditorMode = false;
        this._init();
        this.state = GameState.RACE_EDITOR;
        if (this.raceEditor) {
          this.raceEditor.show();
        }
      } else {
        this.state = GameState.MENU;
        this.menuCursor = 7;
      }
      this.input.clearJustPressed();
    }
  }

  _updatePaused() {
    if (this.input.isMenuUp()) {
      this.pauseMenuCursor = (this.pauseMenuCursor - 1 + this.pauseMenuItemCount) % this.pauseMenuItemCount;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuDown()) {
      this.pauseMenuCursor = (this.pauseMenuCursor + 1) % this.pauseMenuItemCount;
      this.touchManager.vibrate('menuSelect');
    }

    if (this.input.isMenuConfirm()) {
      if (this.pauseMenuCursor === 0) {
        this.resumeGame();
      } else if (this.pauseMenuCursor === 1) {
        this.quitToMenu();
      }
      this.input.clearJustPressed();
    }

    if (this.input.isPause()) {
      this.resumeGame();
      this.input.clearJustPressed();
    }

    this.input.clearJustPressed();
  }

  togglePause() {
    if (this.state === GameState.RACING || this.state === GameState.COUNTDOWN) {
      this.pauseGame();
    } else if (this.state === GameState.PAUSED) {
      this.resumeGame();
    }
  }

  pauseGame() {
    if (this.state === GameState.PAUSED) return;

    this._prevStateBeforePause = this.state;
    this._savedCountdown = this.countdown;
    this._savedCountdownTimer = this.countdownTimer;
    this._savedRaceTime = this.raceTime;
    this.pauseMenuCursor = 0;

    const touchControls = document.getElementById('touchControls');
    if (touchControls) {
      touchControls.classList.add('paused');
      const touchBtns = touchControls.querySelectorAll('.touch-btn');
      touchBtns.forEach(btn => btn.classList.remove('touch-active'));
    }

    this.input.reset();
    this.touchManager.reset();

    this.state = GameState.PAUSED;
    this.touchManager.vibrate('menuSelect');
  }

  resumeGame() {
    if (this.state !== GameState.PAUSED) return;
    if (!this._prevStateBeforePause) return;

    this.countdown = this._savedCountdown;
    this.countdownTimer = this._savedCountdownTimer;
    this.raceTime = this._savedRaceTime;

    const touchControls = document.getElementById('touchControls');
    if (touchControls) {
      touchControls.classList.remove('paused');
      const touchBtns = touchControls.querySelectorAll('.touch-btn');
      touchBtns.forEach(btn => btn.classList.remove('touch-active'));
    }

    this.state = this._prevStateBeforePause;
    this._prevStateBeforePause = null;

    this.input.reset();
    this.touchManager.reset();
    this.touchManager.vibrate('menuSelect');
  }

  quitToMenu() {
    const touchControls = document.getElementById('touchControls');
    if (touchControls) {
      touchControls.classList.remove('paused');
    }

    if (this.replaySystem && this.replaySystem.getState() !== ReplayState.IDLE) {
      this.replaySystem.stopReplay();
    }

    if (this._isEditorMode) {
      this._isEditorMode = false;
      this._init();
    }

    this.state = GameState.MENU;
    this.menuCursor = 7;
    this._prevStateBeforePause = null;
    this.input.reset();
    this.touchManager.reset();
  }

  getAllBikes() {
    return [this.player, ...this.aiBikes];
  }

  getRankings() {
    return this.collision.getRankings(this.getAllBikes());
  }

  _render() {
    this.renderer.clear();

    if (this.state === GameState.RACE_EDITOR) {
      if (this.raceEditor) {
        this.raceEditor.render();
      }
      return;
    }

    if (this.replaySystem && this.replaySystem.isPlaying()) {
      const mainBike = this.replaySystem.getMainReplayBike();
      if (mainBike) {
        this.renderer.updateCamera(mainBike, 0.016);
      }
    }

    if (this.state === GameState.MENU) {
      this.renderer.drawMenu(this);
      return;
    }

    if (this.state === GameState.VEHICLE_SELECT) {
      this.renderer.drawVehicleSelect(this);
      return;
    }

    if (this.state === GameState.GARAGE) {
      this.renderer.drawGarage(this);
      return;
    }

    if (this.state === GameState.ACHIEVEMENTS) {
      this.renderer.drawAchievements(this);
      return;
    }

    if (this.state === GameState.CAREER_MAP) {
      this.renderer.drawCareerMap(this);
      return;
    }

    if (this.state === GameState.CAREER_EVENT) {
      this.renderer.drawCareerEvent(this);
      return;
    }

    if (this.state === GameState.CAREER_UPGRADE) {
      this.renderer.drawCareerUpgrade(this);
      return;
    }

    if (this.state === GameState.CAREER_STAGE_CLEAR) {
      this.renderer.drawCareerStageClear(this);
      return;
    }

    if (this.state === GameState.CAREER_RACE_RESULT) {
      this.renderer.drawCareerRaceResult(this);
      return;
    }

    this.renderer.beginTransform();

    this.renderer.drawTrack(this.track);
    this.renderer.drawSkidMarks(this.getAllBikes());
    this.renderer.drawParticles(this.getAllBikes());

    const allBikes = this.getAllBikes();
    const rankings = this.collision.getRankings(allBikes);
    rankings.forEach(r => {
      this.renderer.drawBike(r.bike);
    });

    if (this.wantedSystem && this.wantedSystem.getPoliceBikes) {
      const policeBikes = this.wantedSystem.getPoliceBikes();
      policeBikes.forEach(police => {
        this.renderer.drawPoliceBike(police);
      });
      this.renderer.drawParticles([...policeBikes]);
    }

    this.renderer.drawNitroBurst(this.player);
    this.renderer.drawSpeedLines(this.player);

    this.renderer.endTransform();

    if (this.state === GameState.COUNTDOWN) {
      this.renderer.drawHUD(this);
      this.renderer.drawCountdown(this.countdown);
    } else if (this.state === GameState.RACING) {
      this.renderer.drawHUD(this);
    } else if (this.state === GameState.WANTED_CHASE) {
      this.renderer.drawHUD(this);
    } else if (this.state === GameState.WANTED_RESULT) {
      this.renderer.drawWantedResult(this);
    } else if (this.state === GameState.PAUSED) {
      this.renderer.drawHUD(this);
      this.renderer.drawPauseOverlay(this);
    } else if (this.state === GameState.FINISHED) {
      this.renderer.drawFinished(this);
    }
  }

  resize(width, height) {
    this.renderer.resize(width, height);
    if (this.touchManager.updateOrientation()) {
      this.touchManager.applyLayout();
    }
  }

  _loadVehicleSelection() {
    try {
      const data = localStorage.getItem('neonRacer_selectedVehicle');
      if (data && VehicleTypes[data]) return data;
    } catch (e) {}
    return 'phantom';
  }

  _saveVehicleSelection(vehicleId) {
    try {
      localStorage.setItem('neonRacer_selectedVehicle', vehicleId);
    } catch (e) {}
  }

  _processAchievements() {
    const rankings = this.getRankings();
    const playerRank = rankings.find(r => r.bike.isPlayer);
    const rank = playerRank ? playerRank.rank : rankings.length + 1;
    const playerBikeCollisions = this.player.bikeCollisions || 0;
    const playerObstacleCollisions = this.player.obstacleCollisions || 0;
    const totalPlayerCollisions = playerBikeCollisions + playerObstacleCollisions;
    const driftDistance = this.player.totalDriftDistance || 0;
    const bestLapTime = this.player.bestLapTime;
    const obstaclesDestroyed = this.player.obstaclesDestroyed || 0;
    const nitroTotalTime = this.player.totalNitroTime || 0;
    const finished = this.player.finished;

    this.achievements.processRaceResults({
      playerRank: rank,
      playerCollisions: totalPlayerCollisions,
      raceDriftDistance: driftDistance,
      bestLapTime: bestLapTime,
      obstaclesDestroyed: obstaclesDestroyed,
      nitroTotalTime: nitroTotalTime,
      finished: finished
    });
  }

  _loadBestLapRecords() {
    try {
      const data = localStorage.getItem('neonRacer_bestLapRecords');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  _saveBestLapRecord() {
    const player = this.player;
    if (!player || player.bestLapTime === Infinity) return;

    const key = this.difficulty;
    const currentRecord = this.bestLapRecords[key];
    this.isHistoricalRecord = false;

    const currentBestTime = currentRecord ? currentRecord.time : Infinity;

    if (player.bestLapTime < currentBestTime) {
      this.bestLapRecords[key] = {
        time: player.bestLapTime,
        date: Date.now(),
        totalLaps: this.totalLaps,
        lapIndex: player.lapTimes.indexOf(player.bestLapTime) + 1
      };
      this.isHistoricalRecord = true;
      try {
        localStorage.setItem('neonRacer_bestLapRecords', JSON.stringify(this.bestLapRecords));
      } catch (e) {}
    }
  }

  getBestLapRecord(difficulty) {
    const record = this.bestLapRecords[difficulty];
    if (!record) return null;
    if (typeof record === 'number') return record;
    return record.time && record.time < Infinity ? record.time : null;
  }

  getBestLapRecordDetail(difficulty) {
    const record = this.bestLapRecords[difficulty];
    if (!record) return null;
    if (typeof record === 'number') {
      return { time: record, date: null, totalLaps: null, lapIndex: null };
    }
    return record.time && record.time < Infinity ? record : null;
  }
}
