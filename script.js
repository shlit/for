const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Ably setup
const ably = new Ably.Realtime('Aj5RCA.lkSclA:JY7AdllhPQkqoWqgyuxqUA3KeUBA_4ZkQhC8jJnuPYY');
const channel = ably.channels.get('raytracing-game');

// Player information
let player = { id: Math.random().toString(36).substr(2, 9), x: 0, y: 0 };
let otherPlayers = {};

// Listen for updates from other players
channel.subscribe('player-move', (message) => {
  const { id, x, y } = message.data;
  if (id !== player.id) {
    otherPlayers[id] = { x, y };
  }
});

// Broadcast player position
function sendPlayerPosition() {
  channel.publish('player-move', { id: player.id, x: player.x, y: player.y });
}

// Sphere object for raytracing
class Sphere {
  constructor(center, radius, color) {
    this.center = center;
    this.radius = radius;
    this.color = color;
  }
}

const spheres = [
  new Sphere({ x: 0, y: 0, z: 3 }, 1, { r: 255, g: 0, b: 0 }),
];

const camera = { x: 0, y: 0, z: 0 };

function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function renderScene() {
  const imageWidth = canvas.width;
  const imageHeight = canvas.height;

  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      const rayDirection = {
        x: (x / imageWidth) * 2 - 1,
        y: 1 - (y / imageHeight) * 2,
        z: 1,
      };

      let pixelColor = { r: 0, g: 0, b: 0 }; // Background: black

      for (const sphere of spheres) {
        const oc = {
          x: camera.x - sphere.center.x,
          y: camera.y - sphere.center.y,
          z: camera.z - sphere.center.z,
        };
        const a = dot(rayDirection, rayDirection);
        const b = 2.0 * dot(oc, rayDirection);
        const c = dot(oc, oc) - sphere.radius * sphere.radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant > 0) {
          pixelColor = sphere.color;
          break;
        }
      }

      // Render pixel color
      ctx.fillStyle = `rgb(${pixelColor.r}, ${pixelColor.g}, ${pixelColor.b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Render other players as circles
  for (const id in otherPlayers) {
    const { x, y } = otherPlayers[id];
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(x * canvas.width, y * canvas.height, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Update player position
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') player.y -= 0.05;
  if (event.key === 'ArrowDown') player.y += 0.05;
  if (event.key === 'ArrowLeft') player.x -= 0.05;
  if (event.key === 'ArrowRight') player.x += 0.05;
  sendPlayerPosition();
});

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderScene();
  requestAnimationFrame(gameLoop);
}

gameLoop();
