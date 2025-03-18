const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Classes for different shapes
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

class Triangle {
  constructor(vertices, color) {
    this.vertices = vertices; // Array of 3 points: [{x, y, z}, {x, y, z}, {x, y, z}]
    this.color = color;
  }

  intersect(rayOrigin, rayDirection) {
    const [v0, v1, v2] = this.vertices;

    const edge1 = {
      x: v1.x - v0.x,
      y: v1.y - v0.y,
      z: v1.z - v0.z,
    };
    const edge2 = {
      x: v2.x - v0.x,
      y: v2.y - v0.y,
      z: v2.z - v0.z,
    };
    const h = cross(rayDirection, edge2);
    const a = dot(edge1, h);

    if (Math.abs(a) < 1e-6) return null;

    const f = 1 / a;
    const s = {
      x: rayOrigin.x - v0.x,
      y: rayOrigin.y - v0.y,
      z: rayOrigin.z - v0.z,
    };
    const u = f * dot(s, h);

    if (u < 0 || u > 1) return null;

    const q = cross(s, edge1);
    const v = f * dot(rayDirection, q);

    if (v < 0 || u + v > 1) return null;

    const t = f * dot(edge2, q);
    return t > 0 ? t : null;
  }
}

class Square {
  constructor(center, size, color) {
    const half = size / 2;
    this.triangles = [
      new Triangle(
        [
          { x: center.x - half, y: center.y, z: center.z - half },
          { x: center.x + half, y: center.y, z: center.z - half },
          { x: center.x + half, y: center.y, z: center.z + half },
        ],
        color
      ),
      new Triangle(
        [
          { x: center.x - half, y: center.y, z: center.z - half },
          { x: center.x + half, y: center.y, z: center.z + half },
          { x: center.x - half, y: center.y, z: center.z + half },
        ],
        color
      ),
    ];
  }

  intersect(rayOrigin, rayDirection) {
    let closestDistance = null;

    for (const triangle of this.triangles) {
      const distance = triangle.intersect(rayOrigin, rayDirection);
      if (distance !== null && (closestDistance === null || distance < closestDistance)) {
        closestDistance = distance;
      }
    }

    return closestDistance;
  }
}

// Utility functions
function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function cross(v1, v2) {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };
}

// Generate random shapes
function generateRandomShapes() {
  const shapes = [];
  const numShapes = 10;

  for (let i = 0; i < numShapes; i++) {
    const type = Math.random();

    if (type < 0.33) {
      shapes.push(
        new Sphere(
          {
            x: Math.random() * 10 - 5,
            y: Math.random() * 5 - 2.5,
            z: Math.random() * 10 + 2,
          },
          Math.random() * 1 + 0.5
        )
      );
    } else if (type < 0.66) {
      shapes.push(
        new Triangle(
          [
            { x: Math.random() * 10 - 5, y: Math.random() * 5 - 2.5, z: Math.random() * 10 + 2 },
            { x: Math.random() * 10 - 5, y: Math.random() * 5 - 2.5, z: Math.random() * 10 + 2 },
            { x: Math.random() * 10 - 5, y: Math.random() * 5 - 2.5, z: Math.random() * 10 + 2 },
          ],
          { r: 255, g: 0, b: 0 }
        )
      );
    } else {
      shapes.push(
        new Square(
          {
            x: Math.random() * 10 - 5,
            y: Math.random() * 5 - 2.5,
            z: Math.random() * 10 + 2,
          },
          Math.random() * 2 + 1,
          { r: 0, g: 255, b: 0 }
        )
      );
    }
  }

  return shapes;
}

// Scene setup
const camera = { x: 0, y: 0, z: 0 };
let yaw = 0;
let pitch = 0;
const shapes = generateRandomShapes();

// Rendering logic
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

      for (const shape of shapes) {
        const distance = shape.intersect(camera, rotatedRay);
        if (distance !== null && distance < closestDistance) {
          closestDistance = distance;
          color = shape.color || { r: 255, g: 255, b: 255 };
        }
      }

      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

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

document.addEventListener("keydown", (event) => {
  const moveStep = 0.2;
  const rotationStep = 0.05;

  if (event.key === "s") camera.z -= moveStep;
  if (event.key === "w") camera.z += moveStep;
  if (event.key === "a") camera.x -= moveStep;
  if (event.key === "d") camera.x += moveStep;
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
