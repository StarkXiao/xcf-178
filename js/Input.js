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
      this.touchControls[control] = value;
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
  }

  clearJustPressed() {
    this.keysJustPressed = {};
  }
}
