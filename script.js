const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Sphere {
  constructor(center, radius) {
    this.center = center;
    this.radius = radius;
  }

  intersect(rayOrigin, rayDirection) {
    const oc = {
      x: rayOrigin.x - this.center.x,
      y: rayOrigin.y - this.center.y,
      z: rayOrigin.z - this.center.z,
    };
    const a = dot(rayDirection, rayDirection);
    const b = 2.0 * dot(oc, rayDirection);
    const c = dot(oc, oc) - this.radius * this.radius;
    const discriminant = b * b - 4 * a * c;

    if (discriminant > 0) {
      return (-b - Math.sqrt(discriminant)) / (2.0 * a);
    }
    return null;
  }
}

function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

const spheres = [
  new Sphere({ x: 0, y: 0, z: 3 }, 1),
  new Sphere({ x: -1.5, y: 0, z: 5 }, 1),
];

let camera = { x: 0, y: 0, z: 0 };

function renderScene() {
  const renderScale = 0.2; 
  const imageWidth = Math.floor(canvas.width * renderScale);
  const imageHeight = Math.floor(canvas.height * renderScale);
  const pixelSize = Math.floor(1 / renderScale);

  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      const rayDirection = {
        x: (x / imageWidth) * 2 - 1,
        y: 1 - (y / imageHeight) * 2,
        z: 1,
      };

      let closestDistance = Infinity;
      let shade = 0;

      for (const sphere of spheres) {
        const distance = sphere.intersect(camera, rayDirection);
        if (distance !== null && distance < closestDistance) {
          closestDistance = distance;
          shade = Math.max(0, 255 - distance * 50);
        }
      }

      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

document.addEventListener('keydown', (event) => {
  const moveStep = 0.1;
  if (event.key === 'w') camera.z -= moveStep;
  if (event.key === 's') camera.z += moveStep;
  if (event.key === 'a') camera.x -= moveStep;
  if (event.key === 'd') camera.x += moveStep;
  if (event.key === 'ArrowUp') camera.y += moveStep;
  if (event.key === 'ArrowDown') camera.y -= moveStep;
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderScene();
  requestAnimationFrame(gameLoop);
}

gameLoop();
