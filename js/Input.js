class PlayerInputState {
  constructor() {
    this.left = false;
    this.right = false;
    this.accel = false;
    this.brake = false;
    this.nitro = false;
    this._pending = {};
    this._timers = {};
  }

  set(control, value, debounceDelay) {
    if (!(control in this)) return;
    if (value) {
      if (this[control]) return;
      if (control === 'left' && this.right) return;
      if (control === 'right' && this.left) return;

      this._pending[control] = true;
      if (this._timers[control]) clearTimeout(this._timers[control]);
      this._timers[control] = setTimeout(() => {
        if (this._pending[control]) {
          this[control] = true;
          delete this._pending[control];
        }
      }, debounceDelay);
    } else {
      if (this._timers[control]) {
        clearTimeout(this._timers[control]);
        delete this._timers[control];
      }
      delete this._pending[control];
      this[control] = false;
    }
  }

  clearAll() {
    Object.keys(this._timers).forEach(k => clearTimeout(this._timers[k]));
    this.left = false;
    this.right = false;
    this.accel = false;
    this.brake = false;
    this.nitro = false;
    this._pending = {};
    this._timers = {};
  }

  snapshot() {
    return {
      left: this.left,
      right: this.right,
      accel: this.accel,
      brake: this.brake,
      nitro: this.nitro
    };
  }
}

class Input {
  constructor() {
    this.keys = {};
    this.keysJustPressed = {};
    this._p1State = new PlayerInputState();
    this._p2State = new PlayerInputState();
    this._debounceDelay = 40;

    this._p1JustPressed = {};
    this._p2JustPressed = {};

    this.P1_KEYS = {
      accel: ['KeyW'],
      brake: ['KeyS'],
      left: ['KeyA'],
      right: ['KeyD'],
      nitro: ['ShiftLeft', 'KeyQ'],
      pause: ['Escape', 'KeyP']
    };

    this.P2_KEYS = {
      accel: ['ArrowUp'],
      brake: ['ArrowDown'],
      left: ['ArrowLeft'],
      right: ['ArrowRight'],
      nitro: ['Enter', 'NumpadEnter', 'Slash'],
      pause: ['Numpad0', 'Backspace']
    };

    this.MENU_KEYS = {
      up: ['ArrowUp', 'KeyW'],
      down: ['ArrowDown', 'KeyS'],
      left: ['ArrowLeft', 'KeyA'],
      right: ['ArrowRight', 'KeyD'],
      confirm: ['Space', 'Enter', 'NumpadEnter'],
      pause: ['Escape', 'KeyP']
    };

    this._splitScreenActive = false;

    this._initKeyboard();
    this._initCanvasTouch();
  }

  _initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) {
        this.keysJustPressed[e.code] = true;
        if (this._isP1Key(e.code)) {
          this._p1JustPressed[e.code] = true;
        }
        if (this._isP2Key(e.code)) {
          this._p2JustPressed[e.code] = true;
        }
      }
      this.keys[e.code] = true;
      const preventKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Space', 'ShiftLeft', 'ShiftRight',
        'Enter', 'NumpadEnter', 'Slash', 'Backspace', 'Numpad0'
      ];
      if (preventKeys.includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  _initCanvasTouch() {
    this._canvasTouchActive = false;
  }

  enableSplitScreen(active) {
    this._splitScreenActive = active;
  }

  _isPortrait() {
    return window.innerHeight > window.innerWidth;
  }

  handleCanvasTouchStart(canvas, touch, controlMap) {
    if (!this._splitScreenActive) return;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const isPortrait = this._isPortrait();

    let playerIndex;
    if (isPortrait) {
      const halfW = rect.width / 2;
      playerIndex = x < halfW ? 1 : 2;
    } else {
      const halfH = rect.height / 2;
      playerIndex = y < halfH ? 1 : 2;
    }

    const control = controlMap(touch, playerIndex);
    if (control) {
      this.setTouchControl(control, true, playerIndex);
    }
    return playerIndex;
  }

  _isP1Key(code) {
    for (const k of Object.values(this.P1_KEYS)) {
      if (k.includes(code)) return true;
    }
    return false;
  }

  _isP2Key(code) {
    for (const k of Object.values(this.P2_KEYS)) {
      if (k.includes(code)) return true;
    }
    return false;
  }

  _isP1PauseKey(code) {
    return this.P1_KEYS.pause.includes(code);
  }

  _isP2PauseKey(code) {
    return this.P2_KEYS.pause.includes(code);
  }

  isLeft() {
    return this.keys['ArrowLeft'] || this.keys['KeyA'] || this._p1State.left;
  }

  isRight() {
    return this.keys['ArrowRight'] || this.keys['KeyD'] || this._p1State.right;
  }

  isAccel() {
    return this.keys['ArrowUp'] || this.keys['KeyW'] || this._p1State.accel;
  }

  isBrake() {
    return this.keys['ArrowDown'] || this.keys['KeyS'] || this._p1State.brake;
  }

  isNitro() {
    return this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyX'] || this._p1State.nitro;
  }

  isStart() {
    return this.keys['Space'] || this.keys['Enter'];
  }

  isMenuUp() {
    return this._consumeJustPressed('ArrowUp') || this._consumeJustPressed('KeyW');
  }

  isMenuDown() {
    return this._consumeJustPressed('ArrowDown') || this._consumeJustPressed('KeyS');
  }

  isMenuLeft() {
    return this._consumeJustPressed('ArrowLeft') || this._consumeJustPressed('KeyA');
  }

  isMenuRight() {
    return this._consumeJustPressed('ArrowRight') || this._consumeJustPressed('KeyD');
  }

  isMenuConfirm() {
    return this._consumeJustPressed('Space') || this._consumeJustPressed('Enter');
  }

  isPause() {
    return this._consumeJustPressed('Escape') || this._consumeJustPressed('KeyP');
  }

  _consumeJustPressed(code) {
    if (this.keysJustPressed[code]) {
      this.keysJustPressed[code] = false;
      return true;
    }
    return false;
  }

  _anyKeyPressed(keyList) {
    for (const k of keyList) {
      if (this.keys[k]) return true;
    }
    return false;
  }

  _anyJustPressedP1(keyList) {
    for (const k of keyList) {
      if (this._consumeP1JustPressed(k)) return true;
    }
    return false;
  }

  _anyJustPressedP2(keyList) {
    for (const k of keyList) {
      if (this._consumeP2JustPressed(k)) return true;
    }
    return false;
  }

  getPlayer1Input() {
    const raw = {
      accel: this._anyKeyPressed(this.P1_KEYS.accel) || this._p1State.accel,
      brake: this._anyKeyPressed(this.P1_KEYS.brake) || this._p1State.brake,
      left: this._anyKeyPressed(this.P1_KEYS.left) || this._p1State.left,
      right: this._anyKeyPressed(this.P1_KEYS.right) || this._p1State.right,
      nitro: this._anyKeyPressed(this.P1_KEYS.nitro) || this._p1State.nitro
    };
    return raw;
  }

  getPlayer2Input() {
    const raw = {
      accel: this._anyKeyPressed(this.P2_KEYS.accel) || this._p2State.accel,
      brake: this._anyKeyPressed(this.P2_KEYS.brake) || this._p2State.brake,
      left: this._anyKeyPressed(this.P2_KEYS.left) || this._p2State.left,
      right: this._anyKeyPressed(this.P2_KEYS.right) || this._p2State.right,
      nitro: this._anyKeyPressed(this.P2_KEYS.nitro) || this._p2State.nitro
    };
    return raw;
  }

  isP1NitroJustPressed() {
    return this._anyJustPressedP1(this.P1_KEYS.nitro);
  }

  isP2NitroJustPressed() {
    return this._anyJustPressedP2(this.P2_KEYS.nitro);
  }

  isP1PauseJustPressed() {
    return this._anyJustPressedP1(this.P1_KEYS.pause);
  }

  isP2PauseJustPressed() {
    if (this.P2_KEYS.pause.length === 0) return false;
    return this._anyJustPressedP2(this.P2_KEYS.pause);
  }

  _consumeP1JustPressed(code) {
    if (this._p1JustPressed[code]) {
      this._p1JustPressed[code] = false;
      return true;
    }
    return false;
  }

  _consumeP2JustPressed(code) {
    if (this._p2JustPressed[code]) {
      this._p2JustPressed[code] = false;
      return true;
    }
    return false;
  }

  isP1Pause() {
    return this._consumeP1JustPressed('Escape') || this._consumeP1JustPressed('KeyP');
  }

  isP2Pause() {
    for (const k of this.P2_KEYS.pause) {
      if (this._consumeP2JustPressed(k)) return true;
    }
    return false;
  }

  setTouchControl(control, value, playerIndex = 1) {
    const state = playerIndex === 1 ? this._p1State : this._p2State;
    state.set(control, value, this._debounceDelay);
  }

  getTouchState(playerIndex) {
    return playerIndex === 1 ? this._p1State : this._p2State;
  }

  reset() {
    this.keys = {};
    this.keysJustPressed = {};
    this._p1State.clearAll();
    this._p2State.clearAll();
    this._p1JustPressed = {};
    this._p2JustPressed = {};
  }

  clearJustPressed() {
    this.keysJustPressed = {};
    this._p1JustPressed = {};
    this._p2JustPressed = {};
  }

  clearP1JustPressed() {
    this._p1JustPressed = {};
  }

  clearP2JustPressed() {
    this._p2JustPressed = {};
  }

  getPlayerInput(playerIndex) {
    return playerIndex === 1 ? this.getPlayer1Input() : this.getPlayer2Input();
  }

  isPlayerNitroJustPressed(playerIndex) {
    return playerIndex === 1 ? this.isP1NitroJustPressed() : this.isP2NitroJustPressed();
  }

  isPlayerPauseJustPressed(playerIndex) {
    return playerIndex === 1 ? this.isP1Pause() : this.isP2Pause();
  }

  setAllTouchControls(value, playerIndex = 1) {
    const state = playerIndex === 1 ? this._p1State : this._p2State;
    ['left', 'right', 'accel', 'brake', 'nitro'].forEach(k => {
      state.set(k, value, 0);
    });
  }
}
