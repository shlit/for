const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Basic raytracing setup
function renderScene() {
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Simple color gradient
      const color = Math.floor((x / canvas.width) * 255);
      ctx.fillStyle = `rgb(${color}, ${color}, 255)`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

renderScene();
