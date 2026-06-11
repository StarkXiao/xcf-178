window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (window.game) {
      window.game.resize(window.innerWidth, window.innerHeight);
    }
    if (window.game && window.game.touchManager) {
      window.game.touchManager._updateOrientationHint();
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      resizeCanvas();
    }, 200);
  });

  const game = new Game(canvas);
  window.game = game;
  game.start();

  if (game.touchManager) {
    game.touchManager._updateOrientationHint();
  }
});
