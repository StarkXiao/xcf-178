class Input {
  constructor() {
    this.keys = {};
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

  setTouchControl(control, value) {
    if (control in this.touchControls) {
      this.touchControls[control] = value;
    }
  }

  reset() {
    this.keys = {};
    this.touchControls = {
      left: false,
      right: false,
      accel: false,
      brake: false
    };
  }
}
