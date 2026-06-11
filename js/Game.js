const GameState = {
  MENU: 'menu',
  COUNTDOWN: 'countdown',
  RACING: 'racing',
  FINISHED: 'finished'
};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new Input();

    this.state = GameState.MENU;
    this.countdown = 3;
    this.countdownTimer = 0;
    this.raceTime = 0;
    this.totalLaps = 3;

    this.track = null;
    this.player = null;
    this.aiBikes = [];
    this.collision = null;

    this.lastTime = 0;
    this.running = false;

    this._init();
  }

  _init() {
    this.track = new Track(200);
    this.collision = new Collision(this.track);

    const startPositions = this.track.getStartPositions(4, 60);

    this.player = new Bike(
      startPositions[0].x,
      startPositions[0].y,
      startPositions[0].angle,
      '#00f5ff',
      true
    );

    const aiColors = ['#ff00ff', '#ff6600', '#00ff66'];
    const aiDifficulties = ['hard', 'medium', 'easy'];

    this.aiBikes = [];
    for (let i = 0; i < 3; i++) {
      const pos = startPositions[i + 1];
      const ai = new AIBike(
        pos.x,
        pos.y,
        pos.angle,
        aiColors[i],
        aiDifficulties[i]
      );
      this.aiBikes.push(ai);
    }

    this.renderer.camera.x = this.player.x;
    this.renderer.camera.y = this.player.y;

    this._setupTouchControls();
  }

  _setupTouchControls() {
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
        this.input.setTouchControl(key, true);
      };

      const handleEnd = (e) => {
        e.preventDefault();
        this.input.setTouchControl(key, false);
      };

      btn.addEventListener('touchstart', handleStart, { passive: false });
      btn.addEventListener('touchend', handleEnd, { passive: false });
      btn.addEventListener('touchcancel', handleEnd, { passive: false });

      btn.addEventListener('mousedown', handleStart);
      btn.addEventListener('mouseup', handleEnd);
      btn.addEventListener('mouseleave', handleEnd);
    });

    this.canvas.addEventListener('click', () => {
      if (this.state === GameState.MENU || this.state === GameState.FINISHED) {
        this.startGame();
      }
    });
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
    if (this.input.isStart()) {
      this.startGame();
    }
  }

  startGame() {
    this._resetRace();
    this.state = GameState.COUNTDOWN;
    this.countdown = 3;
    this.countdownTimer = 0;
  }

  _resetRace() {
    const startPositions = this.track.getStartPositions(4, 60);

    this.player.reset(
      startPositions[0].x,
      startPositions[0].y,
      startPositions[0].angle
    );

    for (let i = 0; i < this.aiBikes.length; i++) {
      const pos = startPositions[i + 1];
      this.aiBikes[i].reset(pos.x, pos.y, pos.angle);
    }

    this.raceTime = 0;
    this.renderer.camera.x = this.player.x;
    this.renderer.camera.y = this.player.y;
    this.input.reset();
  }

  _updateCountdown(dt) {
    this.countdownTimer += dt;

    if (this.countdownTimer >= 1) {
      this.countdownTimer = 0;
      this.countdown--;

      if (this.countdown < 0) {
        this.state = GameState.RACING;
      }
    }
  }

  _updateRacing(dt) {
    this.raceTime += dt * 1000;
    this.player.raceTime = this.raceTime;

    const playerInput = {
      accel: this.input.isAccel(),
      brake: this.input.isBrake(),
      left: this.input.isLeft(),
      right: this.input.isRight()
    };

    this.player.update(dt, playerInput, this.track);
    this.collision.checkTrackCollision(this.player);
    this.collision.updateCheckpoints(this.player);

    this.aiBikes.forEach(ai => {
      ai.update(dt, this.track, this.getAllBikes());
      this.collision.checkTrackCollision(ai);
      this.collision.updateCheckpoints(ai);
      ai.raceTime = this.raceTime;
    });

    this.collision.checkAllBikeCollisions(this.getAllBikes());

    if (this.player.lap >= this.totalLaps && !this.player.finished) {
      this.player.finished = true;
    }

    this.aiBikes.forEach(ai => {
      if (ai.lap >= this.totalLaps && !ai.finished) {
        ai.finished = true;
      }
    });

    const allFinished = this.getAllBikes().every(b => b.finished);
    if (allFinished || this.player.finished) {
      this.state = GameState.FINISHED;
    }

    this.renderer.updateCamera(this.player, dt);
  }

  _updateFinished() {
    if (this.input.isStart()) {
      this.startGame();
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
      this.renderer.drawMenu();
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
  }
}
