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

class Plane {
  constructor(normal, point, color) {
    this.normal = normal;
    this.point = point;
    this.color = color;
  }

  intersect(rayOrigin, rayDirection) {
    const denom = dot(this.normal, rayDirection);
    if (Math.abs(denom) > 1e-6) {
      const difference = {
        x: this.point.x - rayOrigin.x,
        y: this.point.y - rayOrigin.y,
        z: this.point.z - rayOrigin.z,
      };
      const t = dot(difference, this.normal) / denom;
      return t > 0 ? t : null;
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

const floor = new Plane(
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { r: 150, g: 150, b: 150 }
);

let camera = { x: 0, y: 1.5, z: 0 }; // Start slightly above the floor
let yaw = 0;
let pitch = 0;

function rotateRay(ray, yaw, pitch) {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);

  return {
    x: ray.x * cosYaw + ray.z * sinYaw,
    y: ray.y * cosPitch - ray.z * sinPitch,
    z: -ray.x * sinYaw + ray.z * cosYaw,
  };
}

function moveCamera(direction, step) {
  const forward = { x: Math.sin(yaw), y: 0, z: Math.cos(yaw) };
  const right = { x: Math.cos(yaw), y: 0, z: -Math.sin(yaw) };

  if (direction === "forward") {
    camera.x += forward.x * step;
    camera.z += forward.z * step;
  } else if (direction === "backward") {
    camera.x -= forward.x * step;
    camera.z -= forward.z * step;
  } else if (direction === "left") {
    camera.x -= right.x * step;
    camera.z -= right.z * step;
  } else if (direction === "right") {
    camera.x += right.x * step;
    camera.z += right.z * step;
  }
}

function renderScene() {
  const renderScale = 0.3;
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

      const rotatedRay = rotateRay(rayDirection, yaw, pitch);

      let closestDistance = Infinity;
      let color = { r: 0, g: 0, b: 0 };

      for (const sphere of spheres) {
        const distance = sphere.intersect(camera, rotatedRay);
        if (distance !== null && distance < closestDistance) {
          closestDistance = distance;
          const shade = Math.max(0, 255 - distance * 50);
          color = { r: shade, g: shade, b: shade };
        }
      }

      const floorDistance = floor.intersect(camera, rotatedRay);
      if (floorDistance !== null && floorDistance < closestDistance) {
        closestDistance = floorDistance;
        const checker = Math.floor(camera.x + rotatedRay.x * floorDistance) % 2;
        const shade = checker === 0 ? 120 : 90;
        color = { r: shade, g: shade, b: shade };
      }

      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

document.addEventListener("keydown", (event) => {
  const moveStep = 0.2;
  const rotationStep = 0.05;

  if (event.key === "w") moveCamera("forward", moveStep);
  if (event.key === "s") moveCamera("backward", moveStep);
  if (event.key === "a") moveCamera("left", moveStep);
  if (event.key === "d") moveCamera("right", moveStep);
  if (event.key === "ArrowLeft") yaw -= rotationStep;
  if (event.key === "ArrowRight") yaw += rotationStep;
  if (event.key === "ArrowUp") pitch = Math.max(-Math.PI / 2, pitch - rotationStep);
  if (event.key === "ArrowDown") pitch = Math.min(Math.PI / 2, pitch + rotationStep);
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderScene();
  requestAnimationFrame(gameLoop);
}

gameLoop();
