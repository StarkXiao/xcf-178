class TouchControlManager {
  constructor() {
    this.layoutPresets = {
      classic: {
        label: '经典',
        description: '左右方向键 + 加速刹车',
        btnSize: 70,
        accelW: 80,
        accelH: 90,
        brakeW: 80,
        brakeH: 70,
        gap: 15,
        bottom: 20,
        padding: 30,
        iconSize: 18,
        labelSize: 10,
        dPadPosition: 'left',
        actionPadPosition: 'right'
      },
      compact: {
        label: '紧凑',
        description: '小巧布局，节省屏幕空间',
        btnSize: 55,
        accelW: 65,
        accelH: 70,
        brakeW: 65,
        brakeH: 55,
        gap: 10,
        bottom: 12,
        padding: 20,
        iconSize: 15,
        labelSize: 9,
        dPadPosition: 'left',
        actionPadPosition: 'right'
      },
      large: {
        label: '宽大',
        description: '大按键，便于操作',
        btnSize: 85,
        accelW: 95,
        accelH: 110,
        brakeW: 95,
        brakeH: 85,
        gap: 18,
        bottom: 25,
        padding: 35,
        iconSize: 22,
        labelSize: 11,
        dPadPosition: 'left',
        actionPadPosition: 'right'
      },
      leftHanded: {
        label: '左手',
        description: '左撇子专用布局',
        btnSize: 70,
        accelW: 80,
        accelH: 90,
        brakeW: 80,
        brakeH: 70,
        gap: 15,
        bottom: 20,
        padding: 30,
        iconSize: 18,
        labelSize: 10,
        dPadPosition: 'right',
        actionPadPosition: 'left'
      },
      symmetric: {
        label: '对称',
        description: '两侧对称分布',
        btnSize: 65,
        accelW: 75,
        accelH: 85,
        brakeW: 75,
        brakeH: 65,
        gap: 12,
        bottom: 20,
        padding: 25,
        iconSize: 17,
        labelSize: 10,
        dPadPosition: 'left',
        actionPadPosition: 'right'
      }
    };

    this.vibrationLevels = {
      off: { label: '关闭', multiplier: 0 },
      low: { label: '弱', multiplier: 0.4 },
      medium: { label: '中', multiplier: 0.7 },
      high: { label: '强', multiplier: 1.0 }
    };

    this.antiMistouchLevels = {
      off: { label: '关闭', deadZone: 0, minDuration: 0, maxRadius: 999, maxTouches: 10 },
      low: { label: '低', deadZone: 4, minDuration: 20, maxRadius: 35, maxTouches: 5 },
      medium: { label: '中', deadZone: 8, minDuration: 40, maxRadius: 25, maxTouches: 3 },
      high: { label: '高', deadZone: 15, minDuration: 80, maxRadius: 18, maxTouches: 2 }
    };

    this.currentLayout = 'classic';
    this.vibrationLevel = 'medium';
    this.antiMistouchLevel = 'medium';
    this.orientation = 'landscape';
    this.showSettingsPanel = false;
    this.autoRotateHint = true;

    this._activeTouches = new Map();
    this._touchStartTimes = new Map();
    this._touchStartPositions = new Map();
    this._conflictPairs = [['left', 'right']];

    this._portraitScale = 0.85;
    this._portraitBottomOffset = 10;

    this._loadSettings();
    this._detectOrientation();
  }

  _loadSettings() {
    try {
      const data = localStorage.getItem('neonRacer_touchSettings');
      if (data) {
        const settings = JSON.parse(data);
        if (settings.layout && this.layoutPresets[settings.layout]) {
          this.currentLayout = settings.layout;
        }
        if (settings.vibrationLevel && this.vibrationLevels[settings.vibrationLevel]) {
          this.vibrationLevel = settings.vibrationLevel;
        } else if (typeof settings.vibration === 'boolean') {
          this.vibrationLevel = settings.vibration ? 'medium' : 'off';
        }
        if (settings.antiMistouchLevel && this.antiMistouchLevels[settings.antiMistouchLevel]) {
          this.antiMistouchLevel = settings.antiMistouchLevel;
        } else if (typeof settings.antiMistouch === 'boolean') {
          this.antiMistouchLevel = settings.antiMistouch ? 'medium' : 'off';
        }
        if (typeof settings.autoRotateHint === 'boolean') {
          this.autoRotateHint = settings.autoRotateHint;
        }
      }
    } catch (e) {}
  }

  _saveSettings() {
    try {
      localStorage.setItem('neonRacer_touchSettings', JSON.stringify({
        layout: this.currentLayout,
        vibrationLevel: this.vibrationLevel,
        antiMistouchLevel: this.antiMistouchLevel,
        autoRotateHint: this.autoRotateHint
      }));
    } catch (e) {}
  }

  _detectOrientation() {
    this.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  updateOrientation() {
    const prev = this.orientation;
    this._detectOrientation();
    return prev !== this.orientation;
  }

  isPortrait() {
    return this.orientation === 'portrait';
  }

  setLayout(layoutName) {
    if (this.layoutPresets[layoutName]) {
      this.currentLayout = layoutName;
      this._saveSettings();
      this.applyLayout();
    }
  }

  setVibrationLevel(level) {
    if (this.vibrationLevels[level]) {
      this.vibrationLevel = level;
      this._saveSettings();
      if (level !== 'off') {
        this.vibrate('menuSelect');
      }
    }
  }

  cycleVibrationLevel() {
    const levels = Object.keys(this.vibrationLevels);
    const idx = levels.indexOf(this.vibrationLevel);
    const next = levels[(idx + 1) % levels.length];
    this.setVibrationLevel(next);
  }

  setAntiMistouchLevel(level) {
    if (this.antiMistouchLevels[level]) {
      this.antiMistouchLevel = level;
      this._saveSettings();
      this.vibrate('menuSelect');
    }
  }

  cycleAntiMistouchLevel() {
    const levels = Object.keys(this.antiMistouchLevels);
    const idx = levels.indexOf(this.antiMistouchLevel);
    const next = levels[(idx + 1) % levels.length];
    this.setAntiMistouchLevel(next);
  }

  toggleAutoRotateHint() {
    this.autoRotateHint = !this.autoRotateHint;
    this._saveSettings();
    this._updateOrientationHint();
  }

  _updateOrientationHint() {
    const hint = document.getElementById('orientationHint');
    if (!hint) return;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isPortrait = this.isPortrait();
    if (isTouchDevice && isPortrait && this.autoRotateHint) {
      hint.classList.add('visible');
    } else {
      hint.classList.remove('visible');
    }
  }

  getVibrationEnabled() {
    return this.vibrationLevel !== 'off';
  }

  getAntiMistouchEnabled() {
    return this.antiMistouchLevel !== 'off';
  }

  applyLayout() {
    const container = document.getElementById('touchControls');
    if (!container) return;

    const preset = this.layoutPresets[this.currentLayout];
    const isPortrait = this.isPortrait();
    const scale = isPortrait ? this._portraitScale : 1;

    container.className = 'touch-controls';
    container.classList.add(`layout-${this.currentLayout}`);
    container.classList.add(`orientation-${this.orientation}`);
    if (preset.dPadPosition === 'right') {
      container.classList.add('left-handed');
    }

    const buttons = {
      left: document.getElementById('btn-left'),
      right: document.getElementById('btn-right'),
      accel: document.getElementById('btn-accel'),
      brake: document.getElementById('btn-brake')
    };

    Object.keys(buttons).forEach(key => {
      const btn = buttons[key];
      if (!btn) return;

      let w, h;
      if (key === 'left' || key === 'right') {
        w = preset.btnSize * scale;
        h = preset.btnSize * scale;
      } else if (key === 'accel') {
        w = preset.accelW * scale;
        h = preset.accelH * scale;
      } else if (key === 'brake') {
        w = preset.brakeW * scale;
        h = preset.brakeH * scale;
      }

      btn.style.width = w + 'px';
      btn.style.height = h + 'px';
      btn.style.borderRadius = (Math.min(w, h) * 0.5) + 'px';

      const icon = btn.querySelector('.btn-icon');
      const label = btn.querySelector('.btn-label');
      if (icon) icon.style.fontSize = (preset.iconSize * scale) + 'px';
      if (label) label.style.fontSize = (preset.labelSize * scale) + 'px';
    });

    const dPad = container.querySelector('.d-pad');
    const actionPad = container.querySelector('.action-pad');
    const gap = preset.gap * scale;
    if (dPad) dPad.style.gap = gap + 'px';
    if (actionPad) actionPad.style.gap = gap + 'px';

    const bottom = (isPortrait ? this._portraitBottomOffset : preset.bottom) * scale;
    const padding = preset.padding * scale;
    container.style.bottom = bottom + 'px';
    container.style.padding = `0 ${padding}px`;

    this._updateOrientationHint();
  }

  vibrate(type) {
    if (!this.getVibrationEnabled()) return;
    if (!navigator.vibrate) return;

    const multiplier = this.vibrationLevels[this.vibrationLevel].multiplier;

    const basePatterns = {
      press: 12,
      release: 0,
      brake: [8, 30, 8],
      collision: [20, 40, 30, 40, 20],
      lapComplete: [30, 50, 30, 50, 60],
      countdown: 25,
      go: [15, 30, 40],
      newRecord: [40, 60, 40, 60, 80],
      menuSelect: 8,
      drift: [5, 20, 5],
      offTrack: [15, 25, 15],
      boost: [10, 20, 10, 20, 10]
    };

    const base = basePatterns[type] || basePatterns.press;

    let pattern;
    if (Array.isArray(base)) {
      pattern = base.map(v => Math.max(1, Math.round(v * multiplier)));
    } else {
      pattern = Math.max(1, Math.round(base * multiplier));
    }

    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }

  _getAntiMistouchConfig() {
    return this.antiMistouchLevels[this.antiMistouchLevel];
  }

  validateTouch(control, touchEvent) {
    if (!this.getAntiMistouchEnabled()) return true;

    const config = this._getAntiMistouchConfig();
    const touch = touchEvent.touches ? touchEvent.touches[0] : touchEvent;

    if (touch) {
      if (touch.clientX <= config.deadZone ||
          touch.clientX >= window.innerWidth - config.deadZone ||
          touch.clientY <= config.deadZone ||
          touch.clientY >= window.innerHeight - config.deadZone) {
        return false;
      }

      if (touch.radiusX && touch.radiusY) {
        const avgRadius = (touch.radiusX + touch.radiusY) / 2;
        if (avgRadius > config.maxRadius) {
          return false;
        }
      }

      if (touch.force !== undefined && touch.force < 0.05) {
        return false;
      }
    }

    if (this._activeTouches.size >= config.maxTouches) {
      if (!this._activeTouches.has(control)) {
        return false;
      }
    }

    for (const pair of this._conflictPairs) {
      if (pair.includes(control)) {
        const other = pair[0] === control ? pair[1] : pair[0];
        if (this._activeTouches.has(other) && this._activeTouches.get(other)) {
          return false;
        }
      }
    }

    return true;
  }

  shouldActivate(control, touchId, touchEvent) {
    if (!this.getAntiMistouchEnabled()) return true;

    if (touchId !== undefined) {
      this._touchStartTimes.set(touchId, performance.now());

      if (touchEvent && touchEvent.touches && touchEvent.touches[0]) {
        const t = touchEvent.touches[0];
        this._touchStartPositions.set(touchId, { x: t.clientX, y: t.clientY });
      }
    }
    return true;
  }

  confirmActivation(control, touchId, touchEvent) {
    if (!this.getAntiMistouchEnabled()) return true;

    const config = this._getAntiMistouchConfig();

    if (touchId !== undefined && this._touchStartTimes.has(touchId)) {
      const elapsed = performance.now() - this._touchStartTimes.get(touchId);
      this._touchStartTimes.delete(touchId);

      if (elapsed < config.minDuration) {
        this._touchStartPositions.delete(touchId);
        return true;
      }

      if (touchEvent && touchEvent.changedTouches && touchEvent.changedTouches[0]) {
        const t = touchEvent.changedTouches[0];
        const startPos = this._touchStartPositions.get(touchId);
        if (startPos) {
          const dx = t.clientX - startPos.x;
          const dy = t.clientY - startPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > config.maxRadius * 0.5) {
            this._touchStartPositions.delete(touchId);
            return false;
          }
        }
        this._touchStartPositions.delete(touchId);
      }
    }
    return true;
  }

  registerActiveTouch(control, active) {
    this._activeTouches.set(control, active);
    if (!active) {
      this._touchStartTimes.forEach((_, id) => {
        this._touchStartTimes.delete(id);
      });
      this._touchStartPositions.forEach((_, id) => {
        this._touchStartPositions.delete(id);
      });
    }
  }

  reset() {
    this._activeTouches.clear();
    this._touchStartTimes.clear();
    this._touchStartPositions.clear();
  }

  getSettingsSummary() {
    return {
      layout: this.currentLayout,
      layoutLabel: this.layoutPresets[this.currentLayout].label,
      vibration: this.getVibrationEnabled(),
      vibrationLevel: this.vibrationLevel,
      vibrationLabel: this.vibrationLevels[this.vibrationLevel].label,
      antiMistouch: this.getAntiMistouchEnabled(),
      antiMistouchLevel: this.antiMistouchLevel,
      antiMistouchLabel: this.antiMistouchLevels[this.antiMistouchLevel].label,
      orientation: this.orientation
    };
  }

  getLayoutNames() {
    return Object.keys(this.layoutPresets).map(key => ({
      key,
      label: this.layoutPresets[key].label,
      description: this.layoutPresets[key].description,
      active: key === this.currentLayout
    }));
  }

  getVibrationLevels() {
    return Object.keys(this.vibrationLevels).map(key => ({
      key,
      label: this.vibrationLevels[key].label,
      active: key === this.vibrationLevel
    }));
  }

  getAntiMistouchLevels() {
    return Object.keys(this.antiMistouchLevels).map(key => ({
      key,
      label: this.antiMistouchLevels[key].label,
      active: key === this.antiMistouchLevel
    }));
  }

  cycleLayout() {
    const names = Object.keys(this.layoutPresets);
    const idx = names.indexOf(this.currentLayout);
    const next = names[(idx + 1) % names.length];
    this.setLayout(next);
  }

  getLayoutPreset() {
    return this.layoutPresets[this.currentLayout];
  }
}
