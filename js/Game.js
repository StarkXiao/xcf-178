const GameState = {
  MENU: 'menu',
  COUNTDOWN: 'countdown',
  RACING: 'racing',
  FINISHED: 'finished'
};

const DifficultySettings = {
  easy: {
    label: '简单',
    color: '#00ff66',
    aiCount: 2,
    aiDifficulties: ['easy', 'easy'],
    playerMaxSpeed: 340,
    playerAcceleration: 230,
    playerGridIndex: 0,
    collisionDamage: 0.8,
    offTrackFriction: 2.5
  },
  normal: {
    label: '普通',
    color: '#00f5ff',
    aiCount: 3,
    aiDifficulties: ['medium', 'medium', 'easy'],
    playerMaxSpeed: 320,
    playerAcceleration: 200,
    playerGridIndex: 1,
    collisionDamage: 0.7,
    offTrackFriction: 3.5
  },
  hard: {
    label: '困难',
    color: '#ff6600',
    aiCount: 3,
    aiDifficulties: ['hard', 'medium', 'medium'],
    playerMaxSpeed: 310,
    playerAcceleration: 190,
    playerGridIndex: 2,
    collisionDamage: 0.6,
    offTrackFriction: 4.5
  },
  hell: {
    label: '地狱',
    color: '#ff0044',
    aiCount: 4,
    aiDifficulties: ['hell', 'hard', 'hard', 'medium'],
    playerMaxSpeed: 300,
    playerAcceleration: 180,
    playerGridIndex: 4,
    collisionDamage: 0.5,
    offTrackFriction: 5.5
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

    this.difficulty = 'normal';
    this.totalLaps = 3;
    this.lapIndex = 1;
    this.menuCursor = 0;
    this.menuItemCount = 4;

    this.track = null;
    this.player = null;
    this.aiBikes = [];
    this.collision = null;
    this.bestLapRecords = this._loadBestLapRecords();
    this.isHistoricalRecord = false;

    this.lastTime = 0;
    this.running = false;
    this._prevPlayerLap = 0;
    this._prevCollisionCount = 0;
    this._prevWasOffTrack = false;
    this._prevWasDrifting = false;

    this._init();
  }

  _init() {
    this.track = new Track(200);
    this.collision = new Collision(this.track);

    const cfg = DifficultySettings[this.difficulty];
    const totalBikes = cfg.aiCount + 1;
    const startPositions = this.track.getStartPositions(totalBikes, 60);

    this.player = new Bike(
      startPositions[cfg.playerGridIndex].x,
      startPositions[cfg.playerGridIndex].y,
      startPositions[cfg.playerGridIndex].angle,
      '#00f5ff',
      true
    );
    this.player.maxSpeed = cfg.playerMaxSpeed;
    this.player.acceleration = cfg.playerAcceleration;
    this.player.offTrackFriction = cfg.offTrackFriction;
    this.collision.damageMultiplier = cfg.collisionDamage;

    this.aiBikes = [];
    this._createAIBikes(startPositions, cfg);

    this.aiBikes.forEach(ai => {
      ai.offTrackFriction = cfg.offTrackFriction;
    });

    this.renderer.camera.x = this.player.x;
    this.renderer.camera.y = this.player.y;

    this._setupTouchControls();
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
      brake: document.getElementById('btn-brake')
    };

    Object.keys(controls).forEach(key => {
      const btn = controls[key];
      if (!btn) return;

      const handleStart = (e) => {
        e.preventDefault();

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

    this._createSettingsPanel();
    this._setupOrientationHint();

    this.canvas.addEventListener('click', (e) => {
      if (this.state === GameState.MENU) {
        this._handleMenuClick(e);
      } else if (this.state === GameState.FINISHED) {
        this.startGame();
      }
    });
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
    const panelX = centerX - 200;
    const panelY = this.canvas.height / 2 - 20;

    const itemY0 = panelY + 75;
    const itemY1 = panelY + 135;
    const itemY2 = panelY + 195;
    const itemY3 = panelY + 270;

    if (x >= panelX && x <= panelX + 400) {
      if (y >= itemY0 && y < itemY0 + 50) {
        this.menuCursor = 0;
        if (x < centerX - 20) {
          this._changeDifficulty(-1);
        } else if (x > centerX + 20) {
          this._changeDifficulty(1);
        }
      } else if (y >= itemY1 && y < itemY1 + 50) {
        this.menuCursor = 1;
        if (x < centerX - 20) {
          this._changeLaps(-1);
        } else if (x > centerX + 20) {
          this._changeLaps(1);
        }
      } else if (y >= itemY2 && y < itemY2 + 50) {
        this.menuCursor = 2;
        this._openSettingsPanel();
        this.touchManager.vibrate('menuSelect');
      } else if (y >= itemY3 && y < itemY3 + 50) {
        this.menuCursor = 3;
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
    switch (this.state) {
      case GameState.MENU:
        this._updateMenu();
        break;
      case GameState.COUNTDOWN:
        this._updateCountdown(dt);
        break;
      case GameState.RACING:
        this._updateRacing(dt);
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
        this._openSettingsPanel();
        this.touchManager.vibrate('menuSelect');
      }
    } else if (this.menuCursor === 3) {
      if (this.input.isMenuConfirm()) {
        this.startGame();
      }
    }

    this.input.clearJustPressed();
  }

  startGame() {
    this._applySettings();
    this._resetRace();
    this.state = GameState.COUNTDOWN;
    this.countdown = 3;
    this.countdownTimer = 0;
  }

  _applySettings() {
    const cfg = DifficultySettings[this.difficulty];
    this.player.maxSpeed = cfg.playerMaxSpeed;
    this.player.acceleration = cfg.playerAcceleration;
    this.player.offTrackFriction = cfg.offTrackFriction;
    this.collision.damageMultiplier = cfg.collisionDamage;
    this.totalLaps = LapOptions[this.lapIndex];
  }

  _resetRace() {
    const cfg = DifficultySettings[this.difficulty];
    const totalBikes = cfg.aiCount + 1;
    const startPositions = this.track.getStartPositions(totalBikes, 60);

    this.player.reset(
      startPositions[cfg.playerGridIndex].x,
      startPositions[cfg.playerGridIndex].y,
      startPositions[cfg.playerGridIndex].angle
    );
    this.player.maxSpeed = cfg.playerMaxSpeed;
    this.player.acceleration = cfg.playerAcceleration;
    this.player.offTrackFriction = cfg.offTrackFriction;
    this.collision.damageMultiplier = cfg.collisionDamage;

    this.aiBikes = [];
    this._createAIBikes(startPositions, cfg);

    this.aiBikes.forEach(ai => {
      ai.offTrackFriction = cfg.offTrackFriction;
    });

    this.raceTime = 0;
    this.isHistoricalRecord = false;
    this._prevPlayerLap = 0;
    this._prevCollisionCount = 0;
    this._prevWasOffTrack = false;
    this._prevWasDrifting = false;
    this.renderer.camera.x = this.player.x;
    this.renderer.camera.y = this.player.y;
    this.input.reset();
    this.touchManager.reset();
  }

  _updateCountdown(dt) {
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
        this.state = GameState.RACING;
      }
    }
  }

  _updateRacing(dt) {
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

    const playerInput = {
      accel: this.input.isAccel(),
      brake: this.input.isBrake(),
      left: this.input.isLeft(),
      right: this.input.isRight()
    };

    this.player.update(dt, playerInput, this.track);
    this.collision.checkTrackCollision(this.player);
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
      this.collision.updateRouteTracking(ai);
      this.collision.updateCheckpoints(ai);
      this.collision.updateBranchHints(ai);
      if (ai.lap >= this.totalLaps && !ai.finished) {
        ai.finished = true;
        ai.raceTime = this.raceTime;
      }
    });

    const collisionCount = this.collision._bikeCollisionCount || 0;
    if (collisionCount > this._prevCollisionCount) {
      this.touchManager.vibrate('collision');
    }
    this._prevCollisionCount = collisionCount;

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
      this._saveBestLapRecord();
      this.state = GameState.FINISHED;
    }

    this.renderer.updateCamera(this.player, dt);
  }

  _updateFinished() {
    if (this.input.isMenuConfirm()) {
      this.state = GameState.MENU;
      this.menuCursor = 3;
      this.input.clearJustPressed();
    }
  }

  getAllBikes() {
    return [this.player, ...this.aiBikes];
  }

  getRankings() {
    return this.collision.getRankings(this.getAllBikes());
  }

  _render() {
    this.renderer.clear();

    if (this.state === GameState.MENU) {
      this.renderer.drawMenu(this);
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

    this.renderer.drawSpeedLines(this.player);

    this.renderer.endTransform();

    if (this.state === GameState.COUNTDOWN) {
      this.renderer.drawHUD(this);
      this.renderer.drawCountdown(this.countdown);
    } else if (this.state === GameState.RACING) {
      this.renderer.drawHUD(this);
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
