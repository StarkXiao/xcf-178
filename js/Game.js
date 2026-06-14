const GameState = {
  MENU: 'menu',
  VEHICLE_SELECT: 'vehicleSelect',
  VEHICLE_SELECT_P2: 'vehicleSelectP2',
  GARAGE: 'garage',
  ACHIEVEMENTS: 'achievements',
  CLUB_QUEST: 'clubQuest',
  CAREER_MAP: 'careerMap',
  CAREER_EVENT: 'careerEvent',
  CAREER_UPGRADE: 'careerUpgrade',
  CAREER_STAGE_CLEAR: 'careerStageClear',
  CAREER_RACE_RESULT: 'careerRaceResult',
  SPONSOR: 'sponsor',
  COUNTDOWN: 'countdown',
  RACING: 'racing',
  WANTED_CHASE: 'wantedChase',
  WANTED_RESULT: 'wantedResult',
  PAUSED: 'paused',
  FINISHED: 'finished',
  SPLITSCREEN_FINISHED: 'splitscreenFinished',
  RACE_EDITOR: 'raceEditor',
  LEADERBOARD: 'leaderboard',
  NICKNAME_REQUIRED: 'nicknameRequired'
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
    this.menuItemCount = 14;
    this.selectedVehicle = this._loadVehicleSelection();
    this.vehicleSelectCursor = VehicleTypeKeys.indexOf(this.selectedVehicle);
    this.achievementCursor = 0;
    this.achievementScrollY = 0;
    this.achievements = new AchievementManager();

    this.clubQuest = new ClubQuestManager();
    this.clubQuestCursor = 0;
    this.clubQuestTab = 'daily';
    this._clubQuestClaimFlash = 0;

    this.career = new CareerManager();
    if (!this.career.isVehicleUnlocked(this.selectedVehicle)) {
      this.selectedVehicle = 'phantom';
      this.vehicleSelectCursor = VehicleTypeKeys.indexOf('phantom');
    }
    this.selectedVehicleP2 = 'phantom';
    this.vehicleSelectCursorP2 = VehicleTypeKeys.indexOf(this.selectedVehicleP2);
    this.garage = new GarageManager(this.career);
    this.careerStageCursor = 0;
    this.careerEventCursor = 0;
    this.careerUpgradeCursor = 0;
    this.careerRaceResultData = null;
    this._isCareerMode = false;
    this.garageCategoryCursor = 0;
    this.garageItemCursor = 0;

    this.sponsorCursor = 0;
    this.sponsorTab = 'active';
    this._sponsorDetailId = null;

    this.leaderboard = new SeasonLeaderboardManager();
    this.leaderboardTab = 'nickname';
    this.leaderboardTrackFilter = 'all';
    this.leaderboardSortKey = 'bestTime';
    this.leaderboardSeasonFilter = 'all';
    this.leaderboardCursor = 0;
    this.leaderboardScrollY = 0;
    this._leaderboardNicknameBuffer = '';
    this._leaderboardResetConfirm = false;
    this._leaderboardDetailNickname = null;
    this._nicknameReturnState = null;
    this._nicknameSkipAllowed = true;

    this.track = null;
    this.player = null;
    this.player2 = null;
    this.aiBikes = [];
    this.collision = null;
    this.bestLapRecords = this._loadBestLapRecords();
    this.isHistoricalRecord = false;
    this._isSplitScreen = false;
    this._splitscreenResultData = null;

    this.raceEditor = null;
    this.replaySystem = null;
    this.ghostReplay = null;
    this._editorConfig = null;
    this._isEditorMode = false;
    this._ghostReplayMode = false;
    this._replayBtnHover = false;

    this.wantedSystem = null;
    this._isWantedMode = false;
    this._wantedResultData = null;

    this.weatherSystem = null;

    this.lastTime = 0;
    this.running = false;
    this._prevPlayerLap = 0;
    this._prevPlayer2Lap = 0;
    this._prevCollisionCount = 0;
    this._prevWasOffTrack = false;
    this._prevWasDrifting = false;
    this._prevObstacleCollisions = 0;
    this._prevObstaclesDestroyed = 0;
    this._prevPoliceCollisions = 0;
    this._nitroVibTimerP2 = 0;
    this._prevDuelCollisions = 0;
    this._prevDuelTakedowns = 0;
    this._splitscreenGraceTimer = 0;
    this._splitscreenGraceActive = false;
    this._splitscreenGraceDuration = 30000;
    this._splitscreenMenuCursor = 0;

    this._init();
  }

  _init() {
    this.track = new Track(200);
    this.collision = new Collision(this.track);
    this.wantedSystem = new WantedSystem(this.track);
    this.weatherSystem = new WeatherSystem();

    if (!this.raceEditor) {
      this.raceEditor = new RaceEditor(this.canvas, this);
    }
    if (!this.replaySystem) {
      this.replaySystem = new ReplaySystem(this);
    }
    if (!this.ghostReplay) {
      this.ghostReplay = new GhostReplay(this);
    }

    this._setupRace();

    this._setupTouchControls();
  }

  _setupRace() {
    const cfg = DifficultySettings[this.difficulty];
    const vehicle = VehicleTypes[this.selectedVehicle];
    const baseBikeCount = this._isSplitScreen ? 2 : 1;
    const totalBikes = cfg.aiCount + baseBikeCount;
    const startPositions = this.track.getStartPositions(totalBikes, 60);

    this.player = new Bike(
      startPositions[0].x,
      startPositions[0].y,
      startPositions[0].angle,
      vehicle.color,
      true
    );
    this.player.playerIndex = 1;
    this._applyVehicleAndDifficulty(this.player, vehicle, cfg);

    if (this._isSplitScreen) {
      const vehicleP2 = VehicleTypes[this.selectedVehicleP2];
      this.player2 = new Bike(
        startPositions[1].x,
        startPositions[1].y,
        startPositions[1].angle,
        vehicleP2.color,
        true
      );
      this.player2.playerIndex = 2;
      this._applyVehicleAndDifficulty(this.player2, vehicleP2, cfg);
      this.garage.applyUpgradesToBike(this.player2, this.selectedVehicleP2);
    } else {
      this.player2 = null;
    }

    this.collision.damageMultiplier = cfg.collisionDamage;
    this.garage.applyUpgradesToBike(this.player, this.selectedVehicle);

    this.aiBikes = [];
    this._createAIBikes(startPositions, cfg);

    this.aiBikes.forEach(ai => {
      ai.offTrackFriction = vehicle.baseOffTrackFriction + cfg.offTrackFrictionBonus;
    });

    this.renderer.camera.x = this.player.x;
    this.renderer.camera.y = this.player.y;
    if (this.renderer.camera2) {
      this.renderer.camera2.x = this.player2 ? this.player2.x : this.player.x;
      this.renderer.camera2.y = this.player2 ? this.player2.y : this.player.y;
    }
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
    const aiColors = ['#ff00ff', '#ff6600', '#00ff66', '#ffff00', '#ff0066', '#ff66ff', '#66ff00', '#00ffff'];
    this.aiBikes = [];

    const skipCount = this._isSplitScreen ? 2 : 1;
    let aiSlot = 0;

    for (let i = 0; i < startPositions.length; i++) {
      if (i < skipCount) continue;
      if (aiSlot >= cfg.aiCount) break;

      const pos = startPositions[i];
      const diffIdx = aiSlot % (cfg.aiDifficulties ? cfg.aiDifficulties.length : 1);
      const ai = new AIBike(
        pos.x,
        pos.y,
        pos.angle,
        aiColors[aiSlot % aiColors.length],
        cfg.aiDifficulties ? cfg.aiDifficulties[diffIdx] : 'medium'
      );
      this.aiBikes.push(ai);
      aiSlot++;
    }
  }

  _setupTouchControls() {
    this.touchManager.applyLayout();

    this._bindPlayerTouchControls(1);
    this._bindPlayerTouchControls(2);

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
      } else if (this.state === GameState.CLUB_QUEST) {
        this._handleClubQuestClick(e);
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
      } else if (this.state === GameState.SPONSOR) {
        this._handleSponsorClick(e);
      } else if (this.state === GameState.LEADERBOARD) {
        this._handleLeaderboardClick(e);
      } else if (this.state === GameState.NICKNAME_REQUIRED) {
        this._handleNicknameRequiredClick(e);
      } else if (this.state === GameState.GARAGE) {
        this._handleGarageClick(e);
      } else if (this.state === GameState.PAUSED) {
        this._handlePauseClick(e);
      } else if (this.state === GameState.FINISHED) {
        this._handleFinishedClick(e);
      } else if (this.state === GameState.SPLITSCREEN_FINISHED) {
        this.state = GameState.MENU;
        this.menuCursor = 10;
        this._isSplitScreen = false;
        this.input.enableSplitScreen(false);
        this.touchManager.setSplitScreenMode(false);
        this._splitscreenResultData = null;
        this.touchManager.vibrate('menuSelect');
      } else if (this.state === GameState.VEHICLE_SELECT_P2) {
        this._handleVehicleSelectP2Click(e);
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state === GameState.FINISHED) {
        this._handleFinishedMouseMove(e);
      }
    });
  }

  _bindPlayerTouchControls(playerIndex) {
    const suffix = playerIndex === 1 ? '' : '-p2';
    const controls = {
      left: document.getElementById(`btn-left${suffix}`),
      right: document.getElementById(`btn-right${suffix}`),
      accel: document.getElementById(`btn-accel${suffix}`),
      brake: document.getElementById(`btn-brake${suffix}`),
      nitro: document.getElementById(`btn-nitro${suffix}`)
    };

    Object.keys(controls).forEach(key => {
      const btn = controls[key];
      if (!btn) return;

      const handleStart = (e) => {
        e.preventDefault();

        if (this.state === GameState.PAUSED) return;

        const touch = e.touches ? e.touches[0] : e;
        if (!this.touchManager.validateTouch(key, touch)) return;

        const touchId = `${playerIndex}-${touch.identifier !== undefined ? touch.identifier : 'mouse'}`;
        this.touchManager.shouldActivate(`${playerIndex}-${key}`, touchId, e);
        this.input.setTouchControl(key, true, playerIndex);
        this.touchManager.registerActiveTouch(`${playerIndex}-${key}`, true);

        btn.classList.add('touch-active');

        this.touchManager.vibrate(key === 'brake' ? 'brake' : 'press');
      };

      const handleEnd = (e) => {
        e.preventDefault();
        this.input.setTouchControl(key, false, playerIndex);
        this.touchManager.registerActiveTouch(`${playerIndex}-${key}`, false);
        btn.classList.remove('touch-active');
      };

      btn.addEventListener('touchstart', handleStart, { passive: false });
      btn.addEventListener('touchend', handleEnd, { passive: false });
      btn.addEventListener('touchcancel', handleEnd, { passive: false });

      btn.addEventListener('mousedown', handleStart);
      btn.addEventListener('mouseup', handleEnd);
      btn.addEventListener('mouseleave', handleEnd);
    });
  }

  _setupPauseButton() {
    const btn = document.getElementById('btn-pause');
    if (!btn) return;

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (this.state === GameState.RACING || this.state === GameState.COUNTDOWN) {
        if (this._isSplitScreen) {
          const touch = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e);
          const playerIndex = this._getPlayerFromTouchPosition(touch);
          if (playerIndex === 1) {
            this.pauseGame();
            this.input.clearP1JustPressed();
          } else {
            this.pauseGame();
            this.input.clearP2JustPressed();
          }
        } else {
          this.pauseGame();
        }
      } else if (this.state === GameState.PAUSED) {
        this.resumeGame();
      }

      this.touchManager.vibrate('menuSelect');
    };

    btn.addEventListener('touchstart', handleClick, { passive: false });
    btn.addEventListener('mousedown', handleClick);
  }

  _getPlayerFromTouchPosition(touch) {
    if (!touch || touch.clientX === undefined) {
      return 1;
    }
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const isPortrait = window.innerHeight > window.innerWidth;

    if (isPortrait) {
      return x < rect.width / 2 ? 1 : 2;
    } else {
      return y < rect.height / 2 ? 1 : 2;
    }
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
    const itemY6 = itemY5 + itemSpacing;
    const itemY7 = itemY6 + itemSpacing + 8 * uiScale;
    const itemY8 = itemY7 + itemSpacing;
    const itemY9 = itemY8 + itemSpacing;
    const itemY10 = itemY9 + itemSpacing;
    const itemY11 = itemY10 + itemSpacing;
    const itemY12 = itemY11 + itemSpacing;
    const itemY13 = itemY12 + itemSpacing;

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
        this._openClubQuest();
        this.touchManager.vibrate('menuSelect');
      } else if (y >= itemY7 && y < itemY7 + 45) {
        this.menuCursor = 7;
        this._openSettingsPanel();
        this.touchManager.vibrate('menuSelect');
      } else if (y >= itemY8 && y < itemY8 + 45) {
        this.menuCursor = 8;
        this._openRaceEditor();
        this.touchManager.vibrate('menuSelect');
      } else if (y >= itemY9 && y < itemY9 + 45) {
        this.menuCursor = 9;
        this.startWantedChase();
      } else if (y >= itemY10 && y < itemY10 + 45) {
        this.menuCursor = 10;
        this.startSplitScreen();
      } else if (y >= itemY11 && y < itemY11 + 45) {
        this.menuCursor = 11;
        this._openSponsor();
      } else if (y >= itemY12 && y < itemY12 + 45) {
        this.menuCursor = 12;
        this._openLeaderboard();
      } else if (y >= itemY13 && y < itemY13 + 45) {
        this.menuCursor = 13;
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

    if (this._ghostReplayMode) {
      this._updateGhostReplay(dt);
      return;
    }

    switch (this.state) {
      case GameState.MENU:
        this._updateMenu();
        break;
      case GameState.VEHICLE_SELECT:
        this._updateVehicleSelect();
        break;
      case GameState.VEHICLE_SELECT_P2:
        this._updateVehicleSelectP2();
        break;
      case GameState.GARAGE:
        this._updateGarage();
        break;
      case GameState.ACHIEVEMENTS:
        this._updateAchievements();
        break;
      case GameState.CLUB_QUEST:
        this._updateClubQuest(dt);
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
      case GameState.SPONSOR:
        this._updateSponsor();
        break;
      case GameState.LEADERBOARD:
        this._updateLeaderboard();
        break;
      case GameState.NICKNAME_REQUIRED:
        this._updateNicknameRequired();
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
      case GameState.SPLITSCREEN_FINISHED:
        this._updateSplitscreenFinished();
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
        this._openClubQuest();
        this.touchManager.vibrate('menuSelect');
      }
    } else if (this.menuCursor === 7) {
      if (this.input.isMenuConfirm()) {
        this._openSettingsPanel();
        this.touchManager.vibrate('menuSelect');
      }
    } else if (this.menuCursor === 8) {
      if (this.input.isMenuConfirm()) {
        this._openRaceEditor();
        this.touchManager.vibrate('menuSelect');
      }
    } else if (this.menuCursor === 9) {
      if (this.input.isMenuConfirm()) {
        this.startWantedChase();
      }
    } else if (this.menuCursor === 10) {
      if (this.input.isMenuConfirm()) {
        this.startSplitScreen();
      }
    } else if (this.menuCursor === 11) {
      if (this.input.isMenuConfirm()) {
        this._openSponsor();
      }
    } else if (this.menuCursor === 12) {
      if (this.input.isMenuConfirm()) {
        this._openLeaderboard();
      }
    } else if (this.menuCursor === 13) {
      if (this.input.isMenuConfirm()) {
        this.startGame();
      }
    }

    this.input.clearJustPressed();
  }

  _openVehicleSelect() {
    if (!this.career.isVehicleUnlocked(this.selectedVehicle)) {
      this.selectedVehicle = 'phantom';
    }
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

  _openClubQuest() {
    this.clubQuestCursor = 0;
    this.clubQuestTab = 'daily';
    this.state = GameState.CLUB_QUEST;
    this.touchManager.vibrate('menuSelect');
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

    if (!this.leaderboard.hasNickname()) {
      this._nicknameReturnState = GameState.CAREER_EVENT;
      this._nicknameSkipAllowed = false;
      this.state = GameState.NICKNAME_REQUIRED;
      this.touchManager.vibrate('menuSelect');
      return;
    }

    const event = selected.event;
    const stage = selected.stage;
    this.difficulty = event.difficulty;
    const laps = event.laps;

    this._applySettings();
    this._resetRace();

    this.totalLaps = laps;
    this.lapIndex = LapOptions.indexOf(laps);
    if (this.lapIndex < 0) this.lapIndex = 1;

    const seasonId = stage.season || 'spring';
    const forceWeather = event.weather || null;
    const dynamicEnabled = event.dynamicWeather !== false;
    this.weatherSystem.startRaceWeatherSetup(seasonId, forceWeather, dynamicEnabled);

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

  _updateClubQuest(dt) {
    const dailyQuests = this.clubQuest.getDailyQuests();
    const streakMilestones = this.clubQuest.getStreakMilestones();
    const itemCount = this.clubQuestTab === 'daily' ? dailyQuests.length + 1 : streakMilestones.length;

    if (this.input.isMenuUp()) {
      this.clubQuestCursor = (this.clubQuestCursor - 1 + itemCount) % itemCount;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuDown()) {
      this.clubQuestCursor = (this.clubQuestCursor + 1) % itemCount;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuLeft() || this.input.isMenuRight()) {
      this.clubQuestTab = this.clubQuestTab === 'daily' ? 'streak' : 'daily';
      this.clubQuestCursor = 0;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuConfirm()) {
      if (this.clubQuestTab === 'daily') {
        if (this.clubQuestCursor < dailyQuests.length) {
          const quest = dailyQuests[this.clubQuestCursor];
          if (quest.completed && !quest.claimed) {
            const reward = this.clubQuest.claimQuestReward(quest.id);
            if (reward) {
              this.career.addCoins(reward.coins);
              this._clubQuestClaimFlash = 0.5;
              this.touchManager.vibrate('menuSelect');
            }
          }
        } else {
          const rewards = this.clubQuest.claimAllRewards();
          if (rewards.coins > 0) {
            this.career.addCoins(rewards.coins);
            this._clubQuestClaimFlash = 0.5;
            this.touchManager.vibrate('menuSelect');
          }
        }
      } else {
        const milestone = streakMilestones[this.clubQuestCursor];
        if (milestone && milestone.achieved && !milestone.claimed) {
          const reward = this.clubQuest.claimStreakReward(milestone.days);
          if (reward) {
            this.career.addCoins(reward.coins);
            this._clubQuestClaimFlash = 0.5;
            this.touchManager.vibrate('menuSelect');
          }
        }
      }
    }
    if (this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this.state = GameState.MENU;
      this.menuCursor = 6;
      this.touchManager.vibrate('menuSelect');
    }

    if (this._clubQuestClaimFlash > 0) {
      this._clubQuestClaimFlash -= dt;
    }

    this.input.clearJustPressed();
  }

  _handleClubQuestClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = this.canvas.width / 2;
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const isPortrait = this.renderer.isPortrait();
    const uiScale = this.renderer._getUIScale();

    const titleY = isPortrait ? 28 * uiScale : 35;
    const subTitleY = titleY + (isPortrait ? 18 * uiScale : 22);
    const xpBarY = subTitleY + (isPortrait ? 14 : 16);

    const panelW = isPortrait ? Math.min(360 * uiScale, canvasW * 0.92) : 480;
    const panelX = centerX - panelW / 2;
    const panelY = xpBarY + (isPortrait ? 18 * uiScale : 22);
    const panelH = canvasH - panelY - (isPortrait ? 35 : 45);

    const tabH = 36 * uiScale;
    const tabY = panelY + 8 * uiScale;
    const tabW = (panelW - 20 * uiScale) / 2;

    if (y >= tabY && y < tabY + tabH) {
      if (x >= panelX + 10 * uiScale && x < panelX + 10 * uiScale + tabW) {
        this.clubQuestTab = 'daily';
        this.clubQuestCursor = 0;
        this.touchManager.vibrate('menuSelect');
        return;
      } else if (x >= panelX + 10 * uiScale + tabW && x < panelX + panelW - 10 * uiScale) {
        this.clubQuestTab = 'streak';
        this.clubQuestCursor = 0;
        this.touchManager.vibrate('menuSelect');
        return;
      }
    }

    const contentY = tabY + tabH + 10 * uiScale;
    const itemH = 72 * uiScale;
    const dailyQuests = this.clubQuest.getDailyQuests();
    const streakMilestones = this.clubQuest.getStreakMilestones();

    if (this.clubQuestTab === 'daily') {
      for (let i = 0; i < dailyQuests.length; i++) {
        const itemY = contentY + i * itemH;
        if (y >= itemY && y < itemY + itemH - 8 * uiScale) {
          this.clubQuestCursor = i;
          const quest = dailyQuests[i];
          if (quest.completed && !quest.claimed) {
            const reward = this.clubQuest.claimQuestReward(quest.id);
            if (reward) {
              this.career.addCoins(reward.coins);
              this._clubQuestClaimFlash = 0.5;
            }
          }
          this.touchManager.vibrate('menuSelect');
          return;
        }
      }
      const claimAllY = contentY + dailyQuests.length * itemH;
      if (y >= claimAllY && y < claimAllY + 44 * uiScale) {
        this.clubQuestCursor = dailyQuests.length;
        const rewards = this.clubQuest.claimAllRewards();
        if (rewards.coins > 0) {
          this.career.addCoins(rewards.coins);
          this._clubQuestClaimFlash = 0.5;
        }
        this.touchManager.vibrate('menuSelect');
        return;
      }
    } else {
      for (let i = 0; i < streakMilestones.length; i++) {
        const itemY = contentY + i * itemH;
        if (y >= itemY && y < itemY + itemH - 8 * uiScale) {
          this.clubQuestCursor = i;
          const milestone = streakMilestones[i];
          if (milestone.achieved && !milestone.claimed) {
            const reward = this.clubQuest.claimStreakReward(milestone.days);
            if (reward) {
              this.career.addCoins(reward.coins);
              this._clubQuestClaimFlash = 0.5;
            }
          }
          this.touchManager.vibrate('menuSelect');
          return;
        }
      }
    }

    this.state = GameState.MENU;
    this.menuCursor = 6;
    this.touchManager.vibrate('menuSelect');
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

  _openSponsor() {
    this.sponsorCursor = 0;
    this.sponsorTab = 'active';
    this._sponsorDetailId = null;
    this._sponsorReturnState = this.state;
    this.state = GameState.SPONSOR;
    this.touchManager.vibrate('menuSelect');
  }

  _updateSponsor() {
    if (this._sponsorDetailId) {
      if (this.input.isMenuConfirm() || this.input.keys['Escape']) {
        this.input.keys['Escape'] = false;
        this._sponsorDetailId = null;
        this.touchManager.vibrate('menuSelect');
      }
      this.input.clearJustPressed();
      return;
    }

    const activeSponsors = this.career.activeSponsors;
    const availableSponsors = SponsorContracts.filter(s => this.career.isSponsorAvailable(s.id));
    const currentList = this.sponsorTab === 'active' ? activeSponsors : availableSponsors.map(s => s.id);
    const maxCursor = Math.max(0, currentList.length - 1);

    if (this.input.isMenuUp()) {
      this.sponsorCursor = Math.max(0, this.sponsorCursor - 1);
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuDown()) {
      this.sponsorCursor = Math.min(maxCursor, this.sponsorCursor + 1);
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuLeft() || this.input.isMenuRight()) {
      this.sponsorTab = this.sponsorTab === 'active' ? 'available' : 'active';
      this.sponsorCursor = 0;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuConfirm()) {
      if (currentList.length > 0 && this.sponsorCursor < currentList.length) {
        const sponsorId = currentList[this.sponsorCursor];
        if (this.sponsorTab === 'available') {
          this.career.activateSponsor(sponsorId);
          this.touchManager.vibrate('menuSelect');
        } else {
          this._sponsorDetailId = sponsorId;
          this.touchManager.vibrate('menuSelect');
        }
      }
    }
    if (this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this.state = this._sponsorReturnState || GameState.CAREER_MAP;
      this.touchManager.vibrate('menuSelect');
    }
    this.input.clearJustPressed();
  }

  _handleSponsorClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this._sponsorDetailId) {
      this._sponsorDetailId = null;
      this.touchManager.vibrate('menuSelect');
      return;
    }

    const uiScale = this.renderer._getUIScale();
    const isPortrait = this.renderer.isPortrait();
    const centerX = this.canvas.width / 2;

    const panelW = isPortrait ? Math.min(350 * uiScale, this.canvas.width * 0.92) : 460;
    const panelX = centerX - panelW / 2;
    const tabY = isPortrait ? 70 * uiScale : 80;
    const tabH = isPortrait ? 36 * uiScale : 40;
    const tabW = panelW / 2;

    if (y >= tabY && y <= tabY + tabH) {
      if (x >= panelX && x <= panelX + tabW) {
        this.sponsorTab = 'active';
        this.sponsorCursor = 0;
        this.touchManager.vibrate('menuSelect');
        return;
      }
      if (x >= panelX + tabW && x <= panelX + tabW * 2) {
        this.sponsorTab = 'available';
        this.sponsorCursor = 0;
        this.touchManager.vibrate('menuSelect');
        return;
      }
    }

    const activeSponsors = this.career.activeSponsors;
    const availableSponsors = SponsorContracts.filter(s => this.career.isSponsorAvailable(s.id));
    const currentList = this.sponsorTab === 'active' ? activeSponsors : availableSponsors.map(s => s.id);

    const listY = tabY + tabH + 10 * uiScale;
    const itemH = isPortrait ? 72 * uiScale : 80;
    const itemGap = isPortrait ? 8 * uiScale : 10;

    for (let i = 0; i < currentList.length; i++) {
      const iy = listY + i * (itemH + itemGap);
      if (y >= iy && y <= iy + itemH) {
        this.sponsorCursor = i;
        const sponsorId = currentList[i];
        if (this.sponsorTab === 'available') {
          this.career.activateSponsor(sponsorId);
        } else {
          this._sponsorDetailId = sponsorId;
        }
        this.touchManager.vibrate('menuSelect');
        return;
      }
    }

    this.state = this._sponsorReturnState || GameState.CAREER_MAP;
    this.touchManager.vibrate('menuSelect');
  }

  _openLeaderboard() {
    this.leaderboardTab = 'nickname';
    this.leaderboardTrackFilter = 'all';
    this.leaderboardSortKey = 'bestTime';
    this.leaderboardSeasonFilter = 'all';
    this.leaderboardCursor = 0;
    this.leaderboardScrollY = 0;
    this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
    this._leaderboardResetConfirm = false;
    this._leaderboardDetailNickname = null;
    this.state = GameState.LEADERBOARD;
    this.touchManager.vibrate('menuSelect');
  }

  _updateNicknameRequired() {
    if (this.leaderboard.hasNickname()) {
      this._proceedAfterNicknameSet();
      return;
    }

    if (this.input.isMenuConfirm()) {
      this.leaderboardTab = 'nickname';
      this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
      this._leaderboardResetConfirm = false;
      this._leaderboardDetailNickname = null;
      this.state = GameState.LEADERBOARD;
      this.touchManager.vibrate('menuSelect');
      return;
    }

    if (this._nicknameSkipAllowed && this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this.state = this._nicknameReturnState || GameState.MENU;
      this.touchManager.vibrate('menuSelect');
      return;
    }

    this.input.clearJustPressed();
  }

  _proceedAfterNicknameSet() {
    const returnState = this._nicknameReturnState;
    this._nicknameReturnState = null;
    this._nicknameSkipAllowed = false;
    if (returnState === GameState.CAREER_EVENT) {
      this._startCareerRace();
    } else {
      this.startGame();
    }
  }

  _handleNicknameRequiredClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const uiScale = this.renderer._getUIScale();
    const isPortrait = this.renderer.isPortrait();
    const centerX = this.canvas.width / 2;

    const panelW = isPortrait ? Math.min(360 * uiScale, this.canvas.width * 0.92) : 520;
    const btnW = isPortrait ? 220 * uiScale : 260;
    const btnH = isPortrait ? 52 * uiScale : 56;

    const setBtnY = this.canvas.height / 2 + (isPortrait ? 30 * uiScale : 30);
    const setBtnX = centerX - btnW / 2;

    if (x >= setBtnX && x <= setBtnX + btnW && y >= setBtnY && y <= setBtnY + btnH) {
      this.leaderboardTab = 'nickname';
      this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
      this._leaderboardResetConfirm = false;
      this._leaderboardDetailNickname = null;
      this.state = GameState.LEADERBOARD;
      this.touchManager.vibrate('menuSelect');
      return;
    }

    if (this._nicknameSkipAllowed) {
      const skipBtnY = setBtnY + btnH + (isPortrait ? 12 * uiScale : 14);
      const skipBtnW = isPortrait ? 160 * uiScale : 180;
      const skipBtnX = centerX - skipBtnW / 2;
      if (x >= skipBtnX && x <= skipBtnX + skipBtnW && y >= skipBtnY && y <= skipBtnY + btnH * 0.75) {
        this.state = this._nicknameReturnState || GameState.MENU;
        this.touchManager.vibrate('menuSelect');
        return;
      }
    }

    this.touchManager.vibrate('menuSelect');
  }

  _updateLeaderboard() {
    if (this._leaderboardDetailNickname) {
      if (this.input.isMenuConfirm() || this.input.keys['Escape']) {
        this.input.keys['Escape'] = false;
        this._leaderboardDetailNickname = null;
        this.touchManager.vibrate('menuSelect');
      }
      this.input.clearJustPressed();
      return;
    }

    if (this.leaderboardTab === 'nickname') {
      this._updateLeaderboardNickname();
      return;
    }

    const getCurrentEntries = () => this.leaderboard.getLeaderboard({
      trackFilter: this.leaderboardTrackFilter,
      sortKey: this.leaderboardSortKey,
      seasonFilter: this.leaderboardSeasonFilter
    });

    if (this.input.isMenuUp()) {
      const entries = getCurrentEntries();
      this.leaderboardCursor = Math.max(0, Math.min(entries.length - 1, this.leaderboardCursor - 1));
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuDown()) {
      const entries = getCurrentEntries();
      this.leaderboardCursor = Math.max(0, Math.min(entries.length - 1, this.leaderboardCursor + 1));
      this.touchManager.vibrate('menuSelect');
    }

    if (this.input.isMenuLeft()) {
      const filterIdx = LeaderboardTrackKeys.indexOf(this.leaderboardTrackFilter);
      this.leaderboardTrackFilter = LeaderboardTrackKeys[(filterIdx - 1 + LeaderboardTrackKeys.length) % LeaderboardTrackKeys.length];
      this.leaderboardCursor = 0;
      this.leaderboardScrollY = 0;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuRight()) {
      const filterIdx = LeaderboardTrackKeys.indexOf(this.leaderboardTrackFilter);
      this.leaderboardTrackFilter = LeaderboardTrackKeys[(filterIdx + 1) % LeaderboardTrackKeys.length];
      this.leaderboardCursor = 0;
      this.leaderboardScrollY = 0;
      this.touchManager.vibrate('menuSelect');
    }

    if (this.input.keys['KeyS']) {
      this.input.keys['KeyS'] = false;
      const sortIdx = LeaderboardFilterKeys.indexOf(this.leaderboardSortKey);
      this.leaderboardSortKey = LeaderboardFilterKeys[(sortIdx + 1) % LeaderboardFilterKeys.length];
      this.leaderboardCursor = 0;
      this.touchManager.vibrate('menuSelect');
    }

    if (this.input.keys['KeyW']) {
      this.input.keys['KeyW'] = false;
      const seasonIdx = LeaderboardSeasonKeys.indexOf(this.leaderboardSeasonFilter);
      this.leaderboardSeasonFilter = LeaderboardSeasonKeys[(seasonIdx + 1) % LeaderboardSeasonKeys.length];
      this.leaderboardCursor = 0;
      this.touchManager.vibrate('menuSelect');
    }

    if (this.input.isMenuConfirm()) {
      const entries = getCurrentEntries();
      if (this.leaderboardCursor < entries.length) {
        this._leaderboardDetailNickname = entries[this.leaderboardCursor].nickname;
        this.touchManager.vibrate('menuSelect');
      }
    }

    if (this.input.keys['KeyR']) {
      this.input.keys['KeyR'] = false;
      if (this._leaderboardResetConfirm) {
        this._leaderboardResetConfirm = false;
        this.touchManager.vibrate('menuSelect');
      } else if (this.leaderboard.canReset()) {
        this._leaderboardResetConfirm = true;
        this.touchManager.vibrate('menuSelect');
      }
    }

    if (this._leaderboardResetConfirm && this.input.isMenuConfirm()) {
      this.leaderboard.resetLeaderboard();
      this._leaderboardResetConfirm = false;
      this.leaderboardCursor = 0;
      this.touchManager.vibrate('menuSelect');
    }

    if (this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this._leaderboardResetConfirm = false;
      if (this._nicknameReturnState && this.leaderboard.hasNickname()) {
        this._proceedAfterNicknameSet();
        this._nicknameReturnState = null;
      } else {
        this.state = GameState.MENU;
        this.menuCursor = 12;
        this._nicknameReturnState = null;
      }
      this.touchManager.vibrate('menuSelect');
    }

    this.input.clearJustPressed();
  }

  _updateLeaderboardNickname() {
    if (this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      if (this._nicknameReturnState) {
        if (this.leaderboard.hasNickname()) {
          this._proceedAfterNicknameSet();
        } else if (this._nicknameSkipAllowed) {
          this.state = this._nicknameReturnState;
          this._nicknameReturnState = null;
        } else {
          this.state = GameState.MENU;
          this._nicknameReturnState = null;
          this.menuCursor = 12;
        }
      } else {
        this.state = GameState.MENU;
        this.menuCursor = 12;
      }
      this.touchManager.vibrate('menuSelect');
      return;
    }

    if (this.input.keys['Backspace']) {
      this.input.keys['Backspace'] = false;
      this.leaderboard.removeNicknameChar();
      this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
      return;
    }

    if (this.input.isMenuConfirm()) {
      if (this.leaderboard.hasNickname()) {
        this.touchManager.vibrate('menuSelect');
        if (this._nicknameReturnState) {
          this._proceedAfterNicknameSet();
          this._nicknameReturnState = null;
        } else {
          this.leaderboardTab = 'leaderboard';
          this.leaderboardCursor = 0;
        }
      }
      return;
    }

    if (this.input.keys['Tab']) {
      this.input.keys['Tab'] = false;
      if (this._nicknameReturnState && this.leaderboard.hasNickname()) {
        this._proceedAfterNicknameSet();
        this._nicknameReturnState = null;
      } else {
        this.leaderboardTab = 'leaderboard';
        this.leaderboardCursor = 0;
      }
      this.touchManager.vibrate('menuSelect');
      return;
    }

    for (const key of Object.keys(this.input.keys)) {
      if (this.input.keys[key] && key.startsWith('Key')) {
        this.input.keys[key] = false;
        const charCode = key.replace('Key', '');
        if (charCode.length === 1) {
          const shiftHeld = this.input.keys['ShiftLeft'] || this.input.keys['ShiftRight'];
          const ch = shiftHeld ? charCode : charCode.toLowerCase();
          this.leaderboard.addNicknameChar(ch);
          this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
        }
      }
    }

    for (let i = 0; i <= 9; i++) {
      const keyName = `Digit${i}`;
      if (this.input.keys[keyName]) {
        this.input.keys[keyName] = false;
        this.leaderboard.addNicknameChar(String(i));
        this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
      }
    }

    if (this.input.keys['Minus']) {
      this.input.keys['Minus'] = false;
      this.leaderboard.addNicknameChar('-');
      this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
    }
    if (this.input.keys['Period']) {
      this.input.keys['Period'] = false;
      this.leaderboard.addNicknameChar('.');
      this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
    }
    if (this.input.keys['Underscore'] || (this.input.keys['ShiftLeft'] && this.input.keys['Minus'])) {
      this.input.keys['Underscore'] = false;
      this.leaderboard.addNicknameChar('_');
      this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
    }

    this.input.clearJustPressed();
  }

  _handleLeaderboardClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const uiScale = this.renderer._getUIScale();
    const isPortrait = this.renderer.isPortrait();
    const centerX = this.canvas.width / 2;

    if (this._leaderboardDetailNickname) {
      this._leaderboardDetailNickname = null;
      this.touchManager.vibrate('menuSelect');
      return;
    }

    const panelW = isPortrait ? Math.min(360 * uiScale, this.canvas.width * 0.92) : 520;
    const panelX = centerX - panelW / 2;

    const backBtnW = isPortrait ? 80 * uiScale : 90;
    const backBtnH = isPortrait ? 32 * uiScale : 36;
    const backBtnX = isPortrait ? 15 * uiScale : 20;
    const backBtnY = isPortrait ? 20 * uiScale : 20;

    if (x >= backBtnX && x <= backBtnX + backBtnW &&
        y >= backBtnY && y <= backBtnY + backBtnH) {
      this.state = GameState.MENU;
      this.menuCursor = 12;
      this.touchManager.vibrate('menuSelect');
      return;
    }

    const tabY = isPortrait ? 60 * uiScale : 70;
    const tabH = isPortrait ? 32 * uiScale : 36;
    const tabW = panelW / 2;

    if (y >= tabY && y <= tabY + tabH) {
      if (x >= panelX && x <= panelX + tabW) {
        this.leaderboardTab = 'nickname';
        this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
        this.touchManager.vibrate('menuSelect');
        return;
      }
      if (x >= panelX + tabW && x <= panelX + tabW * 2) {
        this.leaderboardTab = 'leaderboard';
        this.touchManager.vibrate('menuSelect');
        return;
      }
    }

    if (this.leaderboardTab === 'nickname') {
      this._handleLeaderboardNicknameClick(x, y, uiScale, isPortrait, panelX, panelW);
      return;
    }

    const filterY = tabY + tabH + (isPortrait ? 8 * uiScale : 10);
    const filterH = isPortrait ? 28 * uiScale : 32;
    const filterW = panelW / 3;

    if (y >= filterY && y <= filterY + filterH) {
      if (x >= panelX && x <= panelX + filterW) {
        const idx = LeaderboardTrackKeys.indexOf(this.leaderboardTrackFilter);
        this.leaderboardTrackFilter = LeaderboardTrackKeys[(idx + 1) % LeaderboardTrackKeys.length];
        this.leaderboardCursor = 0;
        this.touchManager.vibrate('menuSelect');
        return;
      }
      if (x >= panelX + filterW && x <= panelX + filterW * 2) {
        const idx = LeaderboardFilterKeys.indexOf(this.leaderboardSortKey);
        this.leaderboardSortKey = LeaderboardFilterKeys[(idx + 1) % LeaderboardFilterKeys.length];
        this.leaderboardCursor = 0;
        this.touchManager.vibrate('menuSelect');
        return;
      }
      if (x >= panelX + filterW * 2 && x <= panelX + filterW * 3) {
        const idx = LeaderboardSeasonKeys.indexOf(this.leaderboardSeasonFilter);
        this.leaderboardSeasonFilter = LeaderboardSeasonKeys[(idx + 1) % LeaderboardSeasonKeys.length];
        this.leaderboardCursor = 0;
        this.touchManager.vibrate('menuSelect');
        return;
      }
    }

    const entries = this.leaderboard.getLeaderboard({
      trackFilter: this.leaderboardTrackFilter,
      sortKey: this.leaderboardSortKey,
      seasonFilter: this.leaderboardSeasonFilter
    });

    const listY = filterY + filterH + (isPortrait ? 8 * uiScale : 10);
    const itemH = isPortrait ? 44 * uiScale : 52;
    const itemGap = isPortrait ? 4 * uiScale : 6;

    for (let i = 0; i < entries.length; i++) {
      const iy = listY + i * (itemH + itemGap);
      if (y >= iy && y <= iy + itemH) {
        this.leaderboardCursor = i;
        this._leaderboardDetailNickname = entries[i].nickname;
        this.touchManager.vibrate('menuSelect');
        return;
      }
    }
  }

  _handleLeaderboardNicknameClick(x, y, uiScale, isPortrait, panelX, panelW) {
    const centerX = this.canvas.width / 2;
    const inputY = isPortrait ? 160 * uiScale : 180;
    const inputW = isPortrait ? 280 * uiScale : 340;
    const inputH = isPortrait ? 48 * uiScale : 56;
    const inputX = centerX - inputW / 2;

    if (y >= inputY && y <= inputY + inputH) {
      this.touchManager.vibrate('menuSelect');
      return;
    }

    const charGridY = inputY + inputH + (isPortrait ? 16 * uiScale : 20);
    const charSize = isPortrait ? 32 * uiScale : 36;
    const charGap = isPortrait ? 4 * uiScale : 5;
    const charsPerRow = isPortrait ? 10 : 14;
    const rows = Math.ceil(LeaderboardNicknameChars.length / charsPerRow);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < charsPerRow; c++) {
        const charIdx = r * charsPerRow + c;
        if (charIdx >= LeaderboardNicknameChars.length) break;
        const cx = inputX + c * (charSize + charGap);
        const cy = charGridY + r * (charSize + charGap);
        if (x >= cx && x <= cx + charSize && y >= cy && y <= cy + charSize) {
          this.leaderboard.addNicknameChar(LeaderboardNicknameChars[charIdx]);
          this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
          this.touchManager.vibrate('menuSelect');
          return;
        }
      }
    }

    const delBtnY = charGridY + rows * (charSize + charGap) + (isPortrait ? 8 * uiScale : 10);
    const delBtnW = isPortrait ? 100 * uiScale : 120;
    const delBtnH = isPortrait ? 36 * uiScale : 40;
    const delBtnX = centerX - delBtnW / 2;

    if (x >= delBtnX && x <= delBtnX + delBtnW &&
        y >= delBtnY && y <= delBtnY + delBtnH) {
      this.leaderboard.removeNicknameChar();
      this._leaderboardNicknameBuffer = this.leaderboard.getNickname();
      this.touchManager.vibrate('menuSelect');
      return;
    }

    const confirmBtnY = delBtnY + delBtnH + (isPortrait ? 10 * uiScale : 12);
    const confirmBtnW = isPortrait ? 140 * uiScale : 160;
    const confirmBtnH = isPortrait ? 40 * uiScale : 44;
    const confirmBtnX = centerX - confirmBtnW / 2;

    if (x >= confirmBtnX && x <= confirmBtnX + confirmBtnW &&
        y >= confirmBtnY && y <= confirmBtnY + confirmBtnH) {
      if (this.leaderboard.hasNickname()) {
        if (this._nicknameReturnState) {
          this._proceedAfterNicknameSet();
        } else {
          this.leaderboardTab = 'leaderboard';
          this.leaderboardCursor = 0;
        }
        this.touchManager.vibrate('menuSelect');
      }
      return;
    }
  }

  _updateVehicleSelect() {
    if (this.input.isMenuUp()) {
      this._advanceVehicleCursor(-1, false);
    }
    if (this.input.isMenuDown()) {
      this._advanceVehicleCursor(1, false);
    }
    if (this.input.isMenuLeft()) {
      this._advanceVehicleCursor(-1, false);
    }
    if (this.input.isMenuRight()) {
      this._advanceVehicleCursor(1, false);
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

  _advanceVehicleCursor(direction, isP2) {
    const total = VehicleTypeKeys.length;
    const cursorField = isP2 ? 'vehicleSelectCursorP2' : 'vehicleSelectCursor';
    let idx = this[cursorField];
    for (let i = 0; i < total; i++) {
      idx = (idx + direction + total) % total;
      if (this.career.isVehicleUnlocked(VehicleTypeKeys[idx])) {
        this[cursorField] = idx;
        this.touchManager.vibrate('menuSelect');
        return;
      }
    }
    this.touchManager.vibrate('error');
  }

  _confirmVehicleSelection() {
    const selectedKey = VehicleTypeKeys[this.vehicleSelectCursor];
    if (!this.career.isVehicleUnlocked(selectedKey)) {
      this.touchManager.vibrate('error');
      return;
    }
    this.selectedVehicle = selectedKey;
    this._saveVehicleSelection(this.selectedVehicle);
    this.state = GameState.MENU;
    this.touchManager.vibrate('menuSelect');
  }

  _updateVehicleSelectP2() {
    if (this.input.isMenuUp()) {
      this._advanceVehicleCursor(-1, true);
    }
    if (this.input.isMenuDown()) {
      this._advanceVehicleCursor(1, true);
    }
    if (this.input.isMenuLeft()) {
      this._advanceVehicleCursor(-1, true);
    }
    if (this.input.isMenuRight()) {
      this._advanceVehicleCursor(1, true);
    }
    if (this.input.isMenuConfirm()) {
      this._confirmVehicleSelectionP2();
    }
    if (this.input.keys['Escape']) {
      this.input.keys['Escape'] = false;
      this.state = GameState.MENU;
      this.menuCursor = 10;
      this._isSplitScreen = false;
      this.input.enableSplitScreen(false);
      this.touchManager.setSplitScreenMode(false);
      this.touchManager.vibrate('menuSelect');
    }
    this.input.clearJustPressed();
  }

  _confirmVehicleSelectionP2() {
    const selectedKey = VehicleTypeKeys[this.vehicleSelectCursorP2];
    if (!this.career.isVehicleUnlocked(selectedKey)) {
      this.touchManager.vibrate('error');
      return;
    }
    this.selectedVehicleP2 = selectedKey;
    this._isSplitScreen = true;
    this.input.enableSplitScreen(true);
    this.touchManager.setSplitScreenMode(true);
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
        const selectedKey = VehicleTypeKeys[i];
        if (!this.career.isVehicleUnlocked(selectedKey)) {
          this.touchManager.vibrate('error');
          return true;
        }
        this.vehicleSelectCursor = i;
        this.touchManager.vibrate('menuSelect');
        return true;
      }
    }

    return false;
  }

  _handleVehicleSelectP2Click(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = this.canvas.width / 2;
    const isPortrait = this.renderer.isPortrait();
    const uiScale = this.renderer._getUIScale();

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
        this.menuCursor = 10;
        this._isSplitScreen = false;
        this.input.enableSplitScreen(false);
        this.touchManager.setSplitScreenMode(false);
        this.touchManager.vibrate('menuSelect');
        return;
      }
      if (x >= confirmX && x <= confirmX + btnW) {
        this._confirmVehicleSelectionP2();
        return;
      }
    }

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

    if (x >= listX && x <= listX + listW && y >= listY && y <= listY + listH) {
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
          const selectedKey = VehicleTypeKeys[i];
          if (!this.career.isVehicleUnlocked(selectedKey)) {
            this.touchManager.vibrate('error');
            return;
          }
          this.vehicleSelectCursorP2 = i;
          this.touchManager.vibrate('menuSelect');
          return;
        }
      }
    }

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
      this._confirmVehicleSelectionP2();
    }
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

    if (this._checkCareerMapSponsorClick(x, y, isPortrait, uiScale)) {
      return;
    }

    if (this._checkCareerMapStageNavClick(x, y, isPortrait, uiScale, centerX)) {
      return;
    }

    if (this._checkCareerMapEventClick(x, y, isPortrait, uiScale, centerX)) {
      return;
    }
  }

  _checkCareerMapSponsorClick(x, y, isPortrait, uiScale) {
    const btnW = isPortrait ? 100 * uiScale : 110;
    const btnH = isPortrait ? 36 * uiScale : 40;
    const btnX = this.canvas.width - (isPortrait ? 15 * uiScale : 20) - btnW;
    const btnY = isPortrait ? 60 * uiScale : 65;

    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      this._openSponsor();
      return true;
    }
    return false;
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
    if (!this.leaderboard.hasNickname()) {
      this._nicknameReturnState = GameState.MENU;
      this._nicknameSkipAllowed = true;
      this.state = GameState.NICKNAME_REQUIRED;
      this.touchManager.vibrate('menuSelect');
      return;
    }

    this._isWantedMode = false;
    this._isSplitScreen = false;
    this.input.enableSplitScreen(false);
    this.touchManager.setSplitScreenMode(false);
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

    if (this.ghostReplay) {
      this.ghostReplay.startRaceRecording();
    }

    this._prevStateBeforePause = null;
    this.state = GameState.COUNTDOWN;
    this.countdown = 3;
    this.countdownTimer = 0;
  }

  startSplitScreen() {
    this._isWantedMode = false;
    this._isSplitScreen = true;
    if (!this.career.isVehicleUnlocked(this.selectedVehicleP2)) {
      this.selectedVehicleP2 = 'phantom';
    }
    this.vehicleSelectCursorP2 = VehicleTypeKeys.indexOf(this.selectedVehicleP2);
    this.state = GameState.VEHICLE_SELECT_P2;
    this.touchManager.vibrate('menuSelect');
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
    const baseBikeCount = this._isSplitScreen ? 2 : 1;
    const totalBikes = cfg.aiCount + baseBikeCount;
    const startPositions = this.track.getStartPositions(totalBikes, 60);

    this.player.reset(
      startPositions[0].x,
      startPositions[0].y,
      startPositions[0].angle
    );
    this.player.color = vehicle.color;
    this.player.playerIndex = 1;
    this._applyVehicleAndDifficulty(this.player, vehicle, cfg);
    this.garage.applyUpgradesToBike(this.player, this.selectedVehicle);
    this.collision.damageMultiplier = cfg.collisionDamage;

    if (this._isSplitScreen) {
      const vehicleP2 = VehicleTypes[this.selectedVehicleP2];
      if (!this.player2) {
        this.player2 = new Bike(
          startPositions[1].x,
          startPositions[1].y,
          startPositions[1].angle,
          vehicleP2.color,
          true
        );
      } else {
        this.player2.reset(
          startPositions[1].x,
          startPositions[1].y,
          startPositions[1].angle
        );
        this.player2.color = vehicleP2.color;
      }
      this.player2.playerIndex = 2;
      this._applyVehicleAndDifficulty(this.player2, vehicleP2, cfg);
      this.garage.applyUpgradesToBike(this.player2, this.selectedVehicleP2);
    } else {
      this.player2 = null;
    }

    this.aiBikes = [];
    this._createAIBikes(startPositions, cfg);

    this.aiBikes.forEach(ai => {
      ai.offTrackFriction = vehicle.baseOffTrackFriction + cfg.offTrackFrictionBonus;
    });

    this.raceTime = 0;
    this.isHistoricalRecord = false;
    this._prevPlayerLap = 0;
    this._prevPlayer2Lap = 0;
    this._prevCollisionCount = 0;
    this._prevWasOffTrack = false;
    this._prevWasDrifting = false;
    this._prevObstacleCollisions = 0;
    this._prevObstaclesDestroyed = 0;
    this._prevPoliceCollisions = 0;
    this._prevBikeCollisionCount = 0;
    this._nitroVibTimer = 0;
    this._nitroVibTimerP2 = 0;
    this._prevDuelCollisions = 0;
    this._prevDuelTakedowns = 0;
    this._splitscreenGraceTimer = 0;
    this._splitscreenGraceActive = false;
    this.track.resetObstacles();
    this.collision.resetObstacleStats();
    this.renderer.camera.x = this.player.x;
    this.renderer.camera.y = this.player.y;
    if (this._isSplitScreen && this.player2) {
      this.renderer.camera2.x = this.player2.x;
      this.renderer.camera2.y = this.player2.y;
    }
    this.input.reset();
    this.touchManager.reset();

    this._updateSeason();
    this.weatherSystem.reset();
  }

  _updateCountdown(dt) {
    if (this._checkPauseInput()) {
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

  _checkPauseInput() {
    if (this._isSplitScreen) {
      if (this.input.isP1Pause()) {
        this.pauseGame();
        this.input.clearP1JustPressed();
        return true;
      }
      if (this.input.isP2Pause()) {
        this.pauseGame();
        this.input.clearP2JustPressed();
        return true;
      }
    } else {
      if (this.input.isPause()) {
        this.pauseGame();
        this.input.clearJustPressed();
        return true;
      }
    }
    return false;
  }

  _updateRacing(dt) {
    if (this._checkPauseInput()) {
      return;
    }

    this.raceTime += dt * 1000;

    this.weatherSystem.update(dt, 'racing');

    for (let playerIndex = 1; playerIndex <= (this._isSplitScreen ? 2 : 1); playerIndex++) {
      const player = playerIndex === 1 ? this.player : this.player2;
      if (!player) continue;
      const playerInput = this.input.getPlayerInput(playerIndex);
      this._updatePlayerBike(dt, player, playerInput, playerIndex);

      if (this.ghostReplay && playerIndex === 1 && !player.finished) {
        this.ghostReplay.recordFrame(dt, player);
      }
    }

    if (this.ghostReplay && this.player && !this.player.finished) {
      const ghostState = this.ghostReplay.updateGhost(dt, this.player.lap, this.player.raceTime);
      this._currentGhostState = ghostState;
    }

    this.aiBikes.forEach(ai => {
      if (!ai.finished) {
        ai.raceTime = this.raceTime;
      }
      ai.update(dt, this.track, this.getAllBikes(), this.weatherSystem);
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

    this._updatePlayerCollisionFeedback();

    this.collision.checkAllBikeCollisions(this.getAllBikes());

    this._checkRaceFinish();

    if (this._isSplitScreen && this.player2) {
      this.renderer.updateCameraSplit(this.player, this.player2, dt);
    } else {
      this.renderer.updateCamera(this.player, dt);
    }

    this.achievements.updateNotificationTimer(dt);
  }

  _updatePlayerBike(dt, player, input, playerIndex) {
    if (!player || player.finished) return;

    player.raceTime = this.raceTime;

    if (player.newRecordTimer > 0) {
      player.newRecordTimer -= dt;
      if (player.newRecordTimer <= 0) {
        player.isNewLapRecord = false;
      }
    }

    const prevLapKey = playerIndex === 1 ? '_prevPlayerLap' : '_prevPlayer2Lap';
    if (this[prevLapKey] < player.lap) {
      this[prevLapKey] = player.lap;
      
      if (playerIndex === 1 && this.ghostReplay && player.lapTimes.length > 0) {
        const lastLapTime = player.lapTimes[player.lapTimes.length - 1];
        this.ghostReplay.onLapComplete(lastLapTime, player.lap);
        this.ghostReplay.resetGhostForNewLap();
      }
      
      if (player.isNewLapRecord) {
        this.touchManager.vibrate('newRecord');
      } else {
        this.touchManager.vibrate('lapComplete');
      }
    }

    const nitroVibKey = playerIndex === 1 ? '_nitroVibTimer' : '_nitroVibTimerP2';
    if (!player.prevNitroActive && player.nitroActive) {
      this.touchManager.vibrate('nitroBurst');
    }
    if (player.nitroActive) {
      if (!this[nitroVibKey] || this[nitroVibKey] <= 0) {
        this.touchManager.vibrate('nitroActive');
        this[nitroVibKey] = 0.15;
      } else {
        this[nitroVibKey] -= dt;
      }
    } else {
      this[nitroVibKey] = 0;
    }

    if (this.input.isPlayerNitroJustPressed(playerIndex) && player.nitroEnergy >= player.nitroMaxEnergy && !player.nitroActive) {
      player.nitroActive = true;
      player.nitroDuration = 0;
      player.nitroBurstTimer = 0.4;
    }

    player.update(dt, input, this.track, this.weatherSystem);
    this.collision.checkTrackCollision(player);
    this.collision.checkObstacleCollision(player);
    this.collision.updateRouteTracking(player);
    this.collision.updateCheckpoints(player);
    this.collision.updateBranchHints(player);

    if (player.lap >= this.totalLaps && !player.finished) {
      player.finished = true;
      player.raceTime = this.raceTime;
    }
  }

  _updatePlayerCollisionFeedback() {
    const p1ObsCollisions = this.player.obstacleCollisions || 0;
    const p2ObsCollisions = this.player2 ? (this.player2.obstacleCollisions || 0) : 0;
    const totalObsCollisions = p1ObsCollisions + p2ObsCollisions;

    if (this._isSplitScreen) {
      const p1BikeCollisions = this.player.bikeCollisions || 0;
      const p2BikeCollisions = this.player2 ? (this.player2.bikeCollisions || 0) : 0;
      const p1DuelCollisions = this.player.duelCollisions || 0;
      const p2DuelCollisions = this.player2 ? (this.player2.duelCollisions || 0) : 0;
      const totalDuelCollisions = p1DuelCollisions + p2DuelCollisions;

      if (totalDuelCollisions > (this._prevDuelCollisions || 0)) {
        this.touchManager.vibrate('collision');
      }
      this._prevDuelCollisions = totalDuelCollisions;

      const p1Takedowns = this.player.duelTakedowns || 0;
      const p2Takedowns = this.player2 ? (this.player2.duelTakedowns || 0) : 0;
      const totalTakedowns = p1Takedowns + p2Takedowns;
      if (totalTakedowns > (this._prevDuelTakedowns || 0)) {
        this.touchManager.vibrate('newRecord');
      }
      this._prevDuelTakedowns = totalTakedowns;
    }

    if (totalObsCollisions > (this._prevObstacleCollisions || 0)) {
      this.touchManager.vibrate('collision');
    }
    this._prevObstacleCollisions = totalObsCollisions;

    const p1ObsDestroyed = this.player.obstaclesDestroyed || 0;
    const p2ObsDestroyed = this.player2 ? (this.player2.obstaclesDestroyed || 0) : 0;
    const totalObsDestroyed = p1ObsDestroyed + p2ObsDestroyed;

    if (totalObsDestroyed > (this._prevObstaclesDestroyed || 0)) {
      this.touchManager.vibrate('newRecord');
    }
    this._prevObstaclesDestroyed = totalObsDestroyed;

    const p1OffTrack = !this.player.isOnTrack;
    const p2OffTrack = this.player2 ? !this.player2.isOnTrack : false;
    const anyOffTrack = p1OffTrack || p2OffTrack;

    if (anyOffTrack && !this._prevWasOffTrack) {
      this.touchManager.vibrate('offTrack');
    }
    this._prevWasOffTrack = anyOffTrack;

    const p1Drifting = this.player.driftFactor > 0.5;
    const p2Drifting = this.player2 ? (this.player2.driftFactor > 0.5) : false;
    const anyDrifting = p1Drifting || p2Drifting;

    if (anyDrifting && !this._prevWasDrifting) {
      this.touchManager.vibrate('drift');
    }
    this._prevWasDrifting = anyDrifting;
  }

  _checkRaceFinish() {
    const allBikes = this.getAllBikes();
    const allFinished = allBikes.every(b => b.finished);

    if (this._isSplitScreen) {
      const p1Finished = this.player.finished;
      const p2Finished = this.player2 && this.player2.finished;
      const anyPlayerFinished = p1Finished || p2Finished;
      const bothPlayersFinished = p1Finished && p2Finished;

      if (anyPlayerFinished && !this._splitscreenGraceActive && !bothPlayersFinished) {
        this._splitscreenGraceActive = true;
        this._splitscreenGraceTimer = this._splitscreenGraceDuration;
        this._splitscreenFirstFinisher = p1Finished ? 1 : 2;
      }

      if (this._splitscreenGraceActive) {
        this._splitscreenGraceTimer -= 16.67;
        if (bothPlayersFinished || this._splitscreenGraceTimer <= 0 || allFinished) {
          this._finalizeSplitscreenRace();
        }
        return;
      }

      if (bothPlayersFinished || allFinished) {
        this._finalizeSplitscreenRace();
      }
      return;
    }

    if (allFinished || this.player.finished) {
      if (this.replaySystem && this.replaySystem.getState() === ReplayState.RECORDING) {
        this.replaySystem.stopRecording();
      }

      this._saveBestLapRecord();
      this._processAchievements();

      const rankings = this.getRankings();

      const playerRanking = rankings.find(r => r.bike.isPlayer && r.bike.playerIndex === 1);
      const finalRank = playerRanking ? playerRanking.rank : rankings.length + 1;
      const finalTime = this.player.raceTime;
      const finalBestLap = this.player.bestLapTime;

      this.garage.addRaceResult({
        rank: finalRank,
        time: finalTime,
        bestLap: finalBestLap,
        totalLaps: this.totalLaps,
        difficulty: this.difficulty,
        vehicleType: this.selectedVehicle,
        weatherType: this.weatherSystem.getCurrentWeather(),
        weatherScoreMultiplier: this.weatherSystem.getScoreMultiplier()
      });

      if (this._isCareerMode && this.career.selectedEventId) {
        const weatherSummary = this.weatherSystem.finishRaceWeatherRecording();

        const raceStats = {
          driftDistance: this.player.totalDriftDistance || 0,
          bikeCollisions: this.player.bikeCollisions || 0,
          obstacleCollisions: this.player.obstacleCollisions || 0,
          totalLaps: this.totalLaps
        };

        const result = this.career.processRaceResult(
          this.career.selectedEventId,
          finalRank,
          finalTime,
          finalBestLap,
          this.totalLaps,
          weatherSummary,
          raceStats
        );

        this.careerRaceResultData = {
          rank: finalRank,
          time: finalTime,
          bestLap: finalBestLap,
          correctedTime: result.correctedTime || finalTime,
          adjustedBestLap: result.adjustedBestLap || finalBestLap,
          coinsEarned: result.coinsEarned,
          sponsorBonusCoins: result.sponsorBonusCoins || 0,
          sponsorDetails: result.sponsorDetails || [],
          isNewBest: result.isNewBest,
          totalLaps: this.totalLaps,
          eventId: this.career.selectedEventId,
          weatherBonus: 0,
          weatherName: this.weatherSystem.getWeatherName(),
          weatherInfo: result.weatherInfo || null,
          weatherSummary: weatherSummary
        };

        this.state = GameState.CAREER_RACE_RESULT;

        this._recordLeaderboardResult(finalRank, finalTime, finalBestLap);
      } else {
        this.weatherSystem.finishRaceWeatherRecording();
        this.state = GameState.FINISHED;

        this._recordLeaderboardResult(finalRank, finalTime, finalBestLap);
      }
    }
  }

  _recordLeaderboardResult(rank, time, bestLap) {
    let eventId = null;
    let stageId = null;
    let season = null;

    if (this._isCareerMode && this.career.selectedEventId) {
      eventId = this.career.selectedEventId;
      const eventInfo = this.career.getEventById(eventId);
      if (eventInfo) {
        stageId = eventInfo.stage.id;
        season = eventInfo.stage.season || 'spring';
      }
    } else {
      eventId = `quick_${this.difficulty}_${this.totalLaps}`;
      stageId = 'all';
      const month = new Date().getMonth() + 1;
      if (month >= 3 && month <= 5) {
        season = 'spring';
      } else if (month >= 6 && month <= 8) {
        season = 'summer';
      } else if (month >= 9 && month <= 11) {
        season = 'autumn';
      } else {
        season = 'winter';
      }
    }

    this.leaderboard.recordRace({
      eventId,
      stageId,
      season,
      rank,
      time,
      bestLap,
      vehicleType: this.selectedVehicle,
      difficulty: this.difficulty,
      weatherType: this.weatherSystem.getCurrentWeather()
    });
  }

  _finalizeSplitscreenRace() {
    if (this.replaySystem && this.replaySystem.getState() === ReplayState.RECORDING) {
      this.replaySystem.stopRecording();
    }

    this._saveBestLapRecord();
    this._processAchievements();

    const rankings = this.getRankings();
    this._splitscreenResultData = this._prepareSplitscreenResult(rankings);
    this.state = GameState.SPLITSCREEN_FINISHED;
  }

  _prepareSplitscreenResult(rankings) {
    const p1Info = rankings.find(r => r.bike.playerIndex === 1);
    const p2Info = rankings.find(r => r.bike.playerIndex === 2);
    const duelStats = this.collision.getDuelStats();

    const p1 = this.player;
    const p2 = this.player2;

    const p1Time = p1 ? p1.raceTime : 0;
    const p2Time = p2 ? p2.raceTime : 0;
    const timeDelta = Math.abs(p1Time - p2Time);

    const p1BestLap = p1 && p1.bestLapTime < Infinity ? p1.bestLapTime : 0;
    const p2BestLap = p2 && p2.bestLapTime < Infinity ? p2.bestLapTime : 0;

    const p1Score = this._calculatePlayerScore(p1, p1Info);
    const p2Score = this._calculatePlayerScore(p2, p2Info);

    const categoryWins = this._calculateCategoryWins(p1, p2, p1Info, p2Info);

    return {
      player1: {
        rank: p1Info ? p1Info.rank : -1,
        time: p1Time,
        timeFormatted: p1 && p1.finished ? Utils.formatTime(p1Time) : '未完成',
        bestLap: p1BestLap,
        bestLapFormatted: p1BestLap > 0 ? Utils.formatTime(p1BestLap) : '--:--:--',
        vehicle: this.selectedVehicle,
        vehicleName: VehicleTypes[this.selectedVehicle].name,
        collisions: p1 ? (p1.bikeCollisions || 0) : 0,
        obstaclesDestroyed: p1 ? (p1.obstaclesDestroyed || 0) : 0,
        driftDistance: p1 ? (p1.totalDriftDistance || 0) : 0,
        nitroTime: p1 ? (p1.totalNitroTime || 0) : 0,
        duelCollisions: p1 ? (p1.duelCollisions || 0) : 0,
        duelTakedowns: p1 ? (p1.duelTakedowns || 0) : 0,
        lapsCompleted: p1 ? Math.min(p1.lap, this.totalLaps) : 0,
        finished: p1 ? p1.finished : false,
        score: p1Score
      },
      player2: {
        rank: p2Info ? p2Info.rank : -1,
        time: p2Time,
        timeFormatted: p2 && p2.finished ? Utils.formatTime(p2Time) : '未完成',
        bestLap: p2BestLap,
        bestLapFormatted: p2BestLap > 0 ? Utils.formatTime(p2BestLap) : '--:--:--',
        vehicle: this.selectedVehicleP2,
        vehicleName: VehicleTypes[this.selectedVehicleP2].name,
        collisions: p2 ? (p2.bikeCollisions || 0) : 0,
        obstaclesDestroyed: p2 ? (p2.obstaclesDestroyed || 0) : 0,
        driftDistance: p2 ? (p2.totalDriftDistance || 0) : 0,
        nitroTime: p2 ? (p2.totalNitroTime || 0) : 0,
        duelCollisions: p2 ? (p2.duelCollisions || 0) : 0,
        duelTakedowns: p2 ? (p2.duelTakedowns || 0) : 0,
        lapsCompleted: p2 ? Math.min(p2.lap, this.totalLaps) : 0,
        finished: p2 ? p2.finished : false,
        score: p2Score
      },
      rankings: rankings,
      winner: p1Info && p2Info ? (p1Info.rank < p2Info.rank ? 1 : (p2Info.rank < p1Info.rank ? 2 : 0)) : 0,
      timeDelta: timeDelta,
      timeDeltaFormatted: timeDelta > 0 ? Utils.formatTime(timeDelta) : '00:00.000',
      totalLaps: this.totalLaps,
      duelStats: duelStats,
      gracePeriodUsed: this._splitscreenGraceActive,
      firstFinisher: this._splitscreenFirstFinisher || 0,
      categoryWins: categoryWins,
      totalScoreWinner: p1Score > p2Score ? 1 : (p2Score > p1Score ? 2 : 0)
    };
  }

  _calculatePlayerScore(player, rankInfo) {
    if (!player) return 0;
    let score = 0;
    const rank = rankInfo ? rankInfo.rank : 99;

    if (player.finished) {
      score += Math.max(0, (10 - rank) * 100);
      if (player.raceTime > 0) {
        score += Math.max(0, Math.floor(500000 / player.raceTime));
      }
    }

    if (player.bestLapTime && player.bestLapTime < Infinity) {
      score += Math.max(0, Math.floor(300000 / player.bestLapTime));
    }

    score += (player.totalDriftDistance || 0) * 0.5;
    score += (player.totalNitroTime || 0) * 2;
    score += (player.obstaclesDestroyed || 0) * 50;
    score += (player.duelTakedowns || 0) * 200;
    score -= (player.bikeCollisions || 0) * 30;
    score -= (player.duelCollisions || 0) * 10;

    return Math.max(0, Math.floor(score));
  }

  _calculateCategoryWins(p1, p2, p1Info, p2Info) {
    const wins = {
      speed: 0,
      bestLap: 0,
      drift: 0,
      nitro: 0,
      aggression: 0,
      clean: 0
    };

    if (!p1 || !p2) return wins;

    const p1Time = p1.finished ? p1.raceTime : Infinity;
    const p2Time = p2.finished ? p2.raceTime : Infinity;
    if (p1Time < p2Time) wins.speed = 1;
    else if (p2Time < p1Time) wins.speed = 2;

    const p1Best = p1.bestLapTime < Infinity ? p1.bestLapTime : Infinity;
    const p2Best = p2.bestLapTime < Infinity ? p2.bestLapTime : Infinity;
    if (p1Best < p2Best) wins.bestLap = 1;
    else if (p2Best < p1Best) wins.bestLap = 2;

    const p1Drift = p1.totalDriftDistance || 0;
    const p2Drift = p2.totalDriftDistance || 0;
    if (p1Drift > p2Drift) wins.drift = 1;
    else if (p2Drift > p1Drift) wins.drift = 2;

    const p1Nitro = p1.totalNitroTime || 0;
    const p2Nitro = p2.totalNitroTime || 0;
    if (p1Nitro > p2Nitro) wins.nitro = 1;
    else if (p2Nitro > p1Nitro) wins.nitro = 2;

    const p1Aggression = (p1.duelTakedowns || 0) * 2 + (p1.obstaclesDestroyed || 0);
    const p2Aggression = (p2.duelTakedowns || 0) * 2 + (p2.obstaclesDestroyed || 0);
    if (p1Aggression > p2Aggression) wins.aggression = 1;
    else if (p2Aggression > p1Aggression) wins.aggression = 2;

    const p1Penalties = (p1.bikeCollisions || 0) + (p1.duelCollisions || 0) * 0.5;
    const p2Penalties = (p2.bikeCollisions || 0) + (p2.duelCollisions || 0) * 0.5;
    if (p1Penalties < p2Penalties) wins.clean = 1;
    else if (p2Penalties < p1Penalties) wins.clean = 2;

    return wins;
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

    this.weatherSystem.update(dt, 'racing');

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

    this.player.update(dt, playerInput, this.track, this.weatherSystem);
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
      ai.update(dt, this.track, this.getAllBikes(), this.weatherSystem);
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
      this.menuCursor = 9;
      this.input.clearJustPressed();
    }
  }

  _handleFinishedClick(e) {
    if (!this.ghostReplay || !this.ghostReplay.hasBestLapGhost()) {
      this.startGame();
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const replayBtnW = 200;
    const replayBtnH = 40;
    const replayBtnX = (this.canvas.width - replayBtnW) / 2;
    
    const player = this.player;
    const lapListHeight = player.lapTimes.length > 0 ? player.lapTimes.length * 24 + 55 : 0;
    const recordBannerHeight = this.isHistoricalRecord ? 40 : 0;
    const obstacleStatsHeight = 170;
    const achievementHeight = (this.achievements._newlyUnlocked && this.achievements._newlyUnlocked.length > 0)
      ? 55 + this.achievements._newlyUnlocked.length * 28
      : 0;
    const rewardHeight = this.quickRaceReward && this.quickRaceReward.coinsEarned > 0 ? 70 : 0;
    const configHeight = 55;
    const ghostComparisonHeight = this.ghostReplay && this.ghostReplay.hasBestLapGhost() ? 140 : 0;
    const trajectoryCompareHeight = this.ghostReplay && this.ghostReplay.hasBestLapGhost() ? 180 : 0;
    const segmentAnalysisHeight = this.ghostReplay && this.ghostReplay.hasBestLapGhost() ? 180 : 0;
    const suggestionsHeight = this.renderer ? this.renderer._getSuggestionsHeight(this) : 80;
    const replayEntryHeight = 60;
    const panelHeight = 525 + lapListHeight + recordBannerHeight + obstacleStatsHeight + achievementHeight + rewardHeight + configHeight + ghostComparisonHeight + trajectoryCompareHeight + segmentAnalysisHeight + suggestionsHeight + replayEntryHeight;
    const panelY = (this.canvas.height - panelHeight) / 2;
    
    let infoY = panelY + 525 + lapListHeight + recordBannerHeight + obstacleStatsHeight + achievementHeight + rewardHeight + configHeight + ghostComparisonHeight + trajectoryCompareHeight + segmentAnalysisHeight + suggestionsHeight;
    const replayBtnY = infoY + 35;
    
    if (x >= replayBtnX && x <= replayBtnX + replayBtnW &&
        y >= replayBtnY && y <= replayBtnY + replayBtnH) {
      this._startGhostReplay();
      this.touchManager.vibrate('menuSelect');
    } else {
      this.startGame();
    }
  }

  _handleFinishedMouseMove(e) {
    if (!this.ghostReplay || !this.ghostReplay.hasBestLapGhost()) {
      this._replayBtnHover = false;
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const replayBtnW = 200;
    const replayBtnH = 40;
    const replayBtnX = (this.canvas.width - replayBtnW) / 2;
    
    const player = this.player;
    const lapListHeight = player.lapTimes.length > 0 ? player.lapTimes.length * 24 + 55 : 0;
    const recordBannerHeight = this.isHistoricalRecord ? 40 : 0;
    const obstacleStatsHeight = 170;
    const achievementHeight = (this.achievements._newlyUnlocked && this.achievements._newlyUnlocked.length > 0)
      ? 55 + this.achievements._newlyUnlocked.length * 28
      : 0;
    const rewardHeight = this.quickRaceReward && this.quickRaceReward.coinsEarned > 0 ? 70 : 0;
    const configHeight = 55;
    const ghostComparisonHeight = this.ghostReplay && this.ghostReplay.hasBestLapGhost() ? 140 : 0;
    const trajectoryCompareHeight = this.ghostReplay && this.ghostReplay.hasBestLapGhost() ? 180 : 0;
    const segmentAnalysisHeight = this.ghostReplay && this.ghostReplay.hasBestLapGhost() ? 180 : 0;
    const suggestionsHeight = this.renderer ? this.renderer._getSuggestionsHeight(this) : 80;
    const replayEntryHeight = 60;
    const panelHeight = 525 + lapListHeight + recordBannerHeight + obstacleStatsHeight + achievementHeight + rewardHeight + configHeight + ghostComparisonHeight + trajectoryCompareHeight + segmentAnalysisHeight + suggestionsHeight + replayEntryHeight;
    const panelY = (this.canvas.height - panelHeight) / 2;
    
    let infoY = panelY + 525 + lapListHeight + recordBannerHeight + obstacleStatsHeight + achievementHeight + rewardHeight + configHeight + ghostComparisonHeight + trajectoryCompareHeight + segmentAnalysisHeight + suggestionsHeight;
    const replayBtnY = infoY + 35;
    
    const wasHovering = this._replayBtnHover;
    this._replayBtnHover = (x >= replayBtnX && x <= replayBtnX + replayBtnW &&
                            y >= replayBtnY && y <= replayBtnY + replayBtnH);
    
    if (this._replayBtnHover !== wasHovering) {
      this.canvas.style.cursor = this._replayBtnHover ? 'pointer' : 'default';
    }
  }

  _updateFinished() {
    if (this.input.isKeyJustPressed('r') || this.input.isKeyJustPressed('R')) {
      this._startGhostReplay();
      this.input.clearJustPressed();
      return;
    }

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
        this.menuCursor = 8;
      }
      this.input.clearJustPressed();
    }
  }

  _startGhostReplay() {
    if (!this.ghostReplay || !this.ghostReplay.hasBestLapGhost()) return;
    
    this._ghostReplayMode = true;
    this.ghostReplay.startReplay();
    
    this._savedRaceTime = this.raceTime;
    this._savedPlayerState = {
      x: this.player.x,
      y: this.player.y,
      angle: this.player.angle,
      speed: this.player.speed,
      lap: this.player.lap,
      raceTime: this.player.raceTime
    };
  }

  _stopGhostReplay() {
    if (this.ghostReplay) {
      this.ghostReplay.stopReplay();
    }
    this._ghostReplayMode = false;
    
    if (this._savedPlayerState) {
      this.player.x = this._savedPlayerState.x;
      this.player.y = this._savedPlayerState.y;
      this.player.angle = this._savedPlayerState.angle;
      this.player.speed = this._savedPlayerState.speed;
      this.player.lap = this._savedPlayerState.lap;
      this.player.raceTime = this._savedPlayerState.raceTime;
      this.raceTime = this._savedRaceTime;
    }
    
    this._currentGhostState = null;
  }

  _updateGhostReplay(dt) {
    if (!this._ghostReplayMode || !this.ghostReplay) return;
    
    if (this.input.isKeyJustPressed('Escape') || this.input.isKeyJustPressed('esc')) {
      this._stopGhostReplay();
      this.input.clearJustPressed();
      return;
    }
    
    if (this.input.isKeyJustPressed(' ') || this.input.isKeyJustPressed('Space')) {
      this.ghostReplay.toggleReplayPause();
      this.input.clearJustPressed();
      return;
    }
    
    if (this.input.isKeyJustPressed('r') || this.input.isKeyJustPressed('R')) {
      this.ghostReplay.restartReplayGhost();
      this.input.clearJustPressed();
      return;
    }
    
    const ghostState = this.ghostReplay.updateReplay(dt);
    if (ghostState) {
      this._currentGhostState = ghostState;
      
      if (ghostState.finished) {
        this.ghostReplay.pauseReplayGhost();
      }
    }
  }

  _updateSplitscreenFinished() {
    if (this.input.isMenuUp()) {
      this._splitscreenMenuCursor = (this._splitscreenMenuCursor - 1 + 3) % 3;
      this.touchManager.vibrate('menuSelect');
    }
    if (this.input.isMenuDown()) {
      this._splitscreenMenuCursor = (this._splitscreenMenuCursor + 1) % 3;
      this.touchManager.vibrate('menuSelect');
    }

    if (this.input.isMenuConfirm()) {
      this._executeSplitscreenMenuAction();
      this.input.clearJustPressed();
    }
  }

  _executeSplitscreenMenuAction() {
    switch (this._splitscreenMenuCursor || 0) {
      case 0:
        this._startSplitscreenRematch();
        break;
      case 1:
        this._changeSplitscreenVehicle();
        break;
      case 2:
        this.state = GameState.MENU;
        this.menuCursor = 10;
        this._isSplitScreen = false;
        this.input.enableSplitScreen(false);
        this.touchManager.setSplitScreenMode(false);
        this._splitscreenResultData = null;
        this.touchManager.vibrate('menuSelect');
        break;
    }
  }

  _startSplitscreenRematch() {
    this._isSplitScreen = true;
    this.input.enableSplitScreen(true);
    this.touchManager.setSplitScreenMode(true);
    this._splitscreenResultData = null;
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

  _changeSplitscreenVehicle() {
    this._splitscreenResultData = null;
    if (!this.career.isVehicleUnlocked(this.selectedVehicleP2)) {
      this.selectedVehicleP2 = 'phantom';
    }
    this.vehicleSelectCursorP2 = VehicleTypeKeys.indexOf(this.selectedVehicleP2);
    this.state = GameState.VEHICLE_SELECT_P2;
    this.touchManager.vibrate('menuSelect');
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
    this.menuCursor = 8;
    this._prevStateBeforePause = null;
    this.input.reset();
    this.touchManager.reset();
  }

  getAllBikes() {
    if (this._isSplitScreen && this.player2) {
      return [this.player, this.player2, ...this.aiBikes];
    }
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

    if (this.state === GameState.VEHICLE_SELECT_P2) {
      this.renderer.drawVehicleSelectP2(this);
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

    if (this.state === GameState.CLUB_QUEST) {
      this.renderer.drawClubQuest(this);
      return;
    }

    if (this.state === GameState.CAREER_MAP) {
      this.renderer.drawCareerMap(this);
      return;
    }

    if (this.state === GameState.CAREER_EVENT) {
      this.renderer.drawCareerEventDetail(this);
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

    if (this.state === GameState.SPONSOR) {
      this.renderer.drawSponsor(this);
      return;
    }

    if (this.state === GameState.LEADERBOARD) {
      this.renderer.drawLeaderboard(this);
      return;
    }

    if (this.state === GameState.NICKNAME_REQUIRED) {
      this.renderer.drawNicknameRequired(this);
      return;
    }

    if (this._ghostReplayMode) {
      this._renderGhostReplay();
      return;
    }

    if (this._isSplitScreen && this.player2) {
      this._renderSplitScreen();
    } else {
      this._renderSingleScreen();
    }

    if (this.state === GameState.SPLITSCREEN_FINISHED) {
      this.renderer.drawSplitscreenFinished(this);
    }
  }

  _renderSingleScreen() {
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

    this.renderer.drawWeatherEffects(this.weatherSystem, this.player);

    if (this.ghostReplay && this._currentGhostState && this.state === GameState.RACING) {
      this.renderer.drawGhostBike(this._currentGhostState, 0.55);
    }

    if (this.ghostReplay && this.ghostReplay.isGhostTrailVisible() && this.state === GameState.RACING) {
      const bestTrajectory = this.ghostReplay.getBestLapTrajectory();
      this.renderer.drawGhostTrail(bestTrajectory, '#ff00ff', 0.3);
      
      const currentTrajectory = this.ghostReplay.getCurrentLapTrajectory();
      if (currentTrajectory.length > 1) {
        this.renderer.drawCurrentLapTrail(currentTrajectory, 0.5);
      }
    }

    this.renderer.endTransform();

    if (this.state === GameState.COUNTDOWN) {
      this.renderer.drawHUD(this);
      this.renderer.drawWeatherHUD(this);
      this.renderer.drawCountdown(this.countdown);
    } else if (this.state === GameState.RACING) {
      this.renderer.drawHUD(this);
      this.renderer.drawWeatherHUD(this);
    } else if (this.state === GameState.WANTED_CHASE) {
      this.renderer.drawHUD(this);
      this.renderer.drawWeatherHUD(this);
    } else if (this.state === GameState.WANTED_RESULT) {
      this.renderer.drawWantedResult(this);
    } else if (this.state === GameState.PAUSED) {
      this.renderer.drawHUD(this);
      this.renderer.drawWeatherHUD(this);
      this.renderer.drawPauseOverlay(this);
    } else if (this.state === GameState.FINISHED) {
      this.renderer.drawFinished(this);
    }
  }

  _renderGhostReplay() {
    if (!this.ghostReplay || !this._currentGhostState) {
      this.renderer.beginTransform();
      this.renderer.drawTrack(this.track);
      this.renderer.endTransform();
      this.renderer.drawGhostReplayOverlay(this);
      return;
    }

    const ghostState = this._currentGhostState;
    const cameraTarget = {
      x: ghostState.x,
      y: ghostState.y,
      speed: ghostState.speed || 0,
      maxSpeed: this.player ? this.player.baseMaxSpeed : 320,
      nitroActive: ghostState.nitro || false
    };

    this.renderer.updateCamera(cameraTarget, 0.016);

    this.renderer.beginTransform();

    this.renderer.drawTrack(this.track);

    if (this.ghostReplay.isGhostTrailVisible()) {
      const bestTrajectory = this.ghostReplay.getBestLapTrajectory();
      this.renderer.drawGhostTrail(bestTrajectory, '#ff00ff', 0.4);
    }

    this.renderer.drawGhostBike(ghostState, 0.7);

    if (this.weatherSystem) {
      this.renderer.drawWeatherEffects(this.weatherSystem, cameraTarget);
    }

    if (ghostState.nitro) {
      this.renderer.drawSpeedLines(cameraTarget);
    }

    this.renderer.endTransform();

    this.renderer.drawGhostReplayOverlay(this);

    if (ghostState.nitro) {
      this.renderer.drawNitroScreenOverlay(cameraTarget);
    }
  }

  _renderSplitScreen() {
    const allBikes = this.getAllBikes();
    const rankings = this.collision.getRankings(allBikes);
    const policeBikes = (this.wantedSystem && this.wantedSystem.getPoliceBikes) ? this.wantedSystem.getPoliceBikes() : [];

    for (let playerIndex = 1; playerIndex <= 2; playerIndex++) {
      const player = playerIndex === 1 ? this.player : this.player2;
      if (!player) continue;

      this.renderer.beginSplitTransform(playerIndex);

      this.renderer.drawTrack(this.track);
      this.renderer.drawSkidMarks(this.getAllBikes());
      this.renderer.drawParticles(this.getAllBikes());

      rankings.forEach(r => {
        this.renderer.drawBike(r.bike);
      });

      policeBikes.forEach(police => {
        this.renderer.drawPoliceBike(police);
      });
      this.renderer.drawParticles([...policeBikes]);

      this.renderer.drawNitroBurst(player);
      this.renderer.drawSpeedLines(player);

      this.renderer.drawWeatherEffects(this.weatherSystem, player);

      this.renderer.endSplitTransform();
    }

    this._drawSplitScreenDivider();

    if (this.state === GameState.COUNTDOWN) {
      this.renderer.drawSplitScreenHUD(this);
      this.renderer.drawWeatherHUD(this);
      this.renderer.drawCountdown(this.countdown, true);
    } else if (this.state === GameState.RACING) {
      this.renderer.drawSplitScreenHUD(this);
      this.renderer.drawWeatherHUD(this);
    } else if (this.state === GameState.PAUSED) {
      this.renderer.drawSplitScreenHUD(this);
      this.renderer.drawWeatherHUD(this);
      this.renderer.drawPauseOverlay(this);
    }
  }

  _drawSplitScreenDivider() {
    const ctx = this.renderer.ctx;
    const layout = this.renderer.getSplitLayout();
    const isHorizontal = layout.horizontal;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const rankings = this.getRankings();
    const p1Rank = rankings.find(r => r.bike.playerIndex === 1);
    const p2Rank = rankings.find(r => r.bike.playerIndex === 2);

    let dividerColor = '#444';
    let accentColor = '#888';
    if (p1Rank && p2Rank) {
      if (p1Rank.rank < p2Rank.rank) {
        dividerColor = '#00f5ff';
        accentColor = '#00f5ff';
      } else if (p2Rank.rank < p1Rank.rank) {
        dividerColor = '#ff00ff';
        accentColor = '#ff00ff';
      } else {
        dividerColor = '#ffff00';
        accentColor = '#ffff00';
      }
    }

    const t = Date.now() * 0.003;
    const pulse = Math.sin(t) * 0.15 + 0.85;

    if (isHorizontal) {
      const y = layout.dividerY;

      const gradient = ctx.createLinearGradient(0, y - 10, 0, y + 10);
      gradient.addColorStop(0, `${dividerColor}00`);
      gradient.addColorStop(0.5, dividerColor);
      gradient.addColorStop(1, `${dividerColor}00`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y - 10, this.renderer.width, 20);

      ctx.shadowBlur = 12 * pulse;
      ctx.shadowColor = dividerColor;
      ctx.fillStyle = accentColor;
      ctx.fillRect(0, y - 2, this.renderer.width, 4);
      ctx.shadowBlur = 0;

      const dashLen = 20;
      const gap = 15;
      const dashOffset = (Date.now() * 0.05) % (dashLen + gap);
      ctx.fillStyle = `${accentColor}88`;
      for (let x = -dashOffset; x < this.renderer.width; x += dashLen + gap) {
        ctx.fillRect(x, y - 1, dashLen, 2);
      }

      ctx.fillStyle = accentColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = dividerColor;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('◄ P1', 10, y - 10);
      ctx.textAlign = 'left';
      ctx.fillText('◄ P2', 10, y + 22);

      ctx.textAlign = 'center';
      const centerTag = p1Rank && p2Rank ?
        (p1Rank.rank < p2Rank.rank ? '▼ P1领先' : (p2Rank.rank < p1Rank.rank ? '▼ P2领先' : '▼ 势均力敌')) :
        '▼ SPLIT SCREEN ▼';
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(centerTag, this.renderer.width / 2, y - 8);
      ctx.shadowBlur = 0;
    } else {
      const x = layout.dividerX;

      const gradient = ctx.createLinearGradient(x - 10, 0, x + 10, 0);
      gradient.addColorStop(0, `${dividerColor}00`);
      gradient.addColorStop(0.5, dividerColor);
      gradient.addColorStop(1, `${dividerColor}00`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x - 10, 0, 20, this.renderer.height);

      ctx.shadowBlur = 12 * pulse;
      ctx.shadowColor = dividerColor;
      ctx.fillStyle = accentColor;
      ctx.fillRect(x - 2, 0, 4, this.renderer.height);
      ctx.shadowBlur = 0;

      const dashLen = 20;
      const gap = 15;
      const dashOffset = (Date.now() * 0.05) % (dashLen + gap);
      ctx.fillStyle = `${accentColor}88`;
      for (let y = -dashOffset; y < this.renderer.height; y += dashLen + gap) {
        ctx.fillRect(x - 1, y, 2, dashLen);
      }

      ctx.save();
      ctx.translate(x - 10, this.renderer.height * 0.25);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = accentColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = dividerColor;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('P1 ►', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(x - 10, this.renderer.height * 0.75);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = accentColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = dividerColor;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('P2 ►', 0, 0);
      ctx.restore();

      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  resize(width, height) {
    this.renderer.resize(width, height);
    if (this.touchManager.updateOrientation()) {
      this.touchManager.applyLayout();
      if (this._isSplitScreen) {
        this.touchManager.setSplitScreenMode(true);
      }
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

    const weatherScoreMult = this.weatherSystem.getScoreMultiplier();
    const weatherLapMult = this.weatherSystem.getLapTimeMultiplier();

    this.achievements.processRaceResults({
      playerRank: rank,
      playerCollisions: totalPlayerCollisions,
      raceDriftDistance: driftDistance,
      bestLapTime: bestLapTime !== Infinity ? bestLapTime / weatherLapMult : bestLapTime,
      obstaclesDestroyed: obstaclesDestroyed,
      nitroTotalTime: nitroTotalTime,
      finished: finished,
      weatherScoreMultiplier: weatherScoreMult,
      weatherDifficultyBonus: weatherScoreMult > 1.2 ? 1 : 0
    });

    this.clubQuest.processRaceResults({
      playerRank: rank,
      playerCollisions: totalPlayerCollisions,
      raceDriftDistance: driftDistance,
      bestLapTime: bestLapTime !== Infinity ? bestLapTime / weatherLapMult : bestLapTime,
      obstaclesDestroyed: obstaclesDestroyed,
      nitroTotalTime: nitroTotalTime,
      finished: finished
    });
  }

  _updateSeason() {
    let season;
    if (this._isCareerMode) {
      const stage = this.career.getStage(this.careerStageCursor);
      if (stage && stage.season) {
        season = stage.season;
      }
    }
    if (!season) {
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) season = SeasonType.SPRING;
      else if (month >= 5 && month <= 7) season = SeasonType.SUMMER;
      else if (month >= 8 && month <= 10) season = SeasonType.AUTUMN;
      else season = SeasonType.WINTER;
    }
    this.weatherSystem.setSeason(season);
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
