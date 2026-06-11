class Input {
  constructor() {
    this.keys = {};
    this.keysJustPressed = {};
    this.touchControls = {
      left: false,
      right: false,
      accel: false,
      brake: false
    };
    this._pendingTouches = {};
    this._touchTimers = {};
    this._debounceDelay = 40;
    this._initKeyboard();
  }

  _initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) {
        this.keysJustPressed[e.code] = true;
      }
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  isLeft() {
    return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchControls.left;
  }

  isRight() {
    return this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchControls.right;
  }

  isAccel() {
    return this.keys['ArrowUp'] || this.keys['KeyW'] || this.touchControls.accel;
  }

  isBrake() {
    return this.keys['ArrowDown'] || this.keys['KeyS'] || this.touchControls.brake;
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

  _consumeJustPressed(code) {
    if (this.keysJustPressed[code]) {
      this.keysJustPressed[code] = false;
      return true;
    }
    return false;
  }

  setTouchControl(control, value) {
    if (control in this.touchControls) {
      if (value) {
        if (this.touchControls[control]) return;

        if (control === 'left' && this.touchControls.right) return;
        if (control === 'right' && this.touchControls.left) return;

        this._pendingTouches[control] = true;
        if (this._touchTimers[control]) clearTimeout(this._touchTimers[control]);
        this._touchTimers[control] = setTimeout(() => {
          if (this._pendingTouches[control]) {
            this.touchControls[control] = true;
            delete this._pendingTouches[control];
          }
        }, this._debounceDelay);
      } else {
        if (this._touchTimers[control]) {
          clearTimeout(this._touchTimers[control]);
          delete this._touchTimers[control];
        }
        delete this._pendingTouches[control];
        this.touchControls[control] = false;
      }
    }
  }

  reset() {
    this.keys = {};
    this.keysJustPressed = {};
    this.touchControls = {
      left: false,
      right: false,
      accel: false,
      brake: false
    };
    Object.keys(this._touchTimers).forEach(k => clearTimeout(this._touchTimers[k]));
    this._touchTimers = {};
    this._pendingTouches = {};
  }

  clearJustPressed() {
    this.keysJustPressed = {};
  }
}
