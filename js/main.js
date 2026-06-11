window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (window.game) {
      window.game.resize(window.innerWidth, window.innerHeight);
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const game = new Game(canvas);
  window.game = game;
  game.start();
});
