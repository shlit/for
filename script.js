const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let renderScale = 0.3; 

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

class BoundedPlane {
  constructor(normal, point, color, bounds, transparent = false) {
    this.normal = normal;
    this.point = point;
    this.color = color;
    this.bounds = bounds;
    this.transparent = transparent;
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
      if (t > 0) {
        const hitPoint = {
          x: rayOrigin.x + rayDirection.x * t,
          y: rayOrigin.y + rayDirection.y * t,
          z: rayOrigin.z + rayDirection.z * t,
        };
        if (hitPoint.x >= this.bounds.minX && hitPoint.x <= this.bounds.maxX &&
            hitPoint.y >= this.bounds.minY && hitPoint.y <= this.bounds.maxY &&
            hitPoint.z >= this.bounds.minZ && hitPoint.z <= this.bounds.maxZ) {
          return t;
        }
      }
    }
    return null;
  }
}

class Cuboid {
  constructor(min, max, color, interactable = false) {
    this.min = min;
    this.max = max;
    this.color = color;
    this.interactable = interactable;
  }

  intersect(rayOrigin, rayDirection) {
    let tMin = (this.min.x - rayOrigin.x) / rayDirection.x;
    let tMax = (this.max.x - rayOrigin.x) / rayDirection.x;
    if (tMin > tMax) [tMin, tMax] = [tMax, tMin];

    let tyMin = (this.min.y - rayOrigin.y) / rayDirection.y;
    let tyMax = (this.max.y - rayOrigin.y) / rayDirection.y;
    if (tyMin > tyMax) [tyMin, tyMax] = [tyMax, tyMin];

    if ((tMin > tyMax) || (tyMin > tMax)) return null;
    if (tyMin > tMin) tMin = tyMin;
    if (tyMax < tMax) tMax = tyMax;

    let tzMin = (this.min.z - rayOrigin.z) / rayDirection.z;
    let tzMax = (this.max.z - rayOrigin.z) / rayDirection.z;
    if (tzMin > tzMax) [tzMin, tzMax] = [tzMax, tzMin];

    if ((tMin > tzMax) || (tzMin > tMax)) return null;
    if (tzMin > tMin) tMin = tzMin;

    return tMin > 0 ? tMin : null;
  }

  getCenter() {
    return {
      x: (this.min.x + this.max.x) / 2,
      y: (this.min.y + this.max.y) / 2,
      z: (this.min.z + this.max.z) / 2,
    };
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

const buildingPlanes = [];
const desks = [];

function createBuilding(x, z, width, depth, height) {
  const wallColor = { r: 180, g: 160, b: 140 };
  const windowColor = { r: 100, g: 150, b: 200 };
  
  buildingPlanes.push(new BoundedPlane(
    { x: 0, y: 0, z: 1 },
    { x: x, y: 0, z: z - depth / 2 },
    wallColor,
    { minX: x - width / 2, maxX: x + width / 2, minY: -1, maxY: height, minZ: z - depth / 2 - 0.1, maxZ: z - depth / 2 + 0.1 }
  ));
  
  buildingPlanes.push(new BoundedPlane(
    { x: 0, y: 0, z: -1 },
    { x: x, y: 0, z: z + depth / 2 },
    wallColor,
    { minX: x - width / 2, maxX: x + width / 2, minY: -1, maxY: height, minZ: z + depth / 2 - 0.1, maxZ: z + depth / 2 + 0.1 }
  ));
  
  buildingPlanes.push(new BoundedPlane(
    { x: 1, y: 0, z: 0 },
    { x: x - width / 2, y: 0, z: z },
    wallColor,
    { minX: x - width / 2 - 0.1, maxX: x - width / 2 + 0.1, minY: -1, maxY: height, minZ: z - depth / 2, maxZ: z + depth / 2 }
  ));
  
  buildingPlanes.push(new BoundedPlane(
    { x: -1, y: 0, z: 0 },
    { x: x + width / 2, y: 0, z: z },
    wallColor,
    { minX: x + width / 2 - 0.1, maxX: x + width / 2 + 0.1, minY: -1, maxY: height, minZ: z - depth / 2, maxZ: z + depth / 2 }
  ));
  
  buildingPlanes.push(new BoundedPlane(
    { x: 0, y: -1, z: 0 },
    { x: x, y: height, z: z },
    wallColor,
    { minX: x - width / 2, maxX: x + width / 2, minY: height - 0.1, maxY: height + 0.1, minZ: z - depth / 2, maxZ: z + depth / 2 }
  ));
  
  const windowYStart = 1.0;
  const windowHeight = 1.5;
  const windowWidth = 1.0;
  const windowSpacing = 1.5;
  
  for (let wx = x - width / 2 + windowSpacing; wx < x + width / 2 - windowWidth; wx += windowSpacing) {
    buildingPlanes.push(new BoundedPlane(
      { x: 0, y: 0, z: 1 },
      { x: wx, y: windowYStart, z: z - depth / 2 },
      windowColor,
      { minX: wx, maxX: wx + windowWidth, minY: windowYStart, maxY: windowYStart + windowHeight, minZ: z - depth / 2 - 0.1, maxZ: z - depth / 2 + 0.1 },
      true
    ));
  }
  
  const deskWidth = 0.8;
  const deskDepth = 0.5;
  const deskHeight = 0.7;
  const deskColor = { r: 139, g: 90, b: 43 };
  
  const deskX = x - width / 4;
  const deskZ = z;
  desks.push(new Cuboid(
    { x: deskX - deskWidth / 2, y: -1, z: deskZ - deskDepth / 2 },
    { x: deskX + deskWidth / 2, y: -1 + deskHeight, z: deskZ + deskDepth / 2 },
    deskColor,
    true
  ));
}

createBuilding(5, 8, 6, 4, 3);
createBuilding(-8, 10, 5, 5, 4);

let camera = { x: 0, y: 2, z: 0 };
let yaw = 0;
let pitch = 0;

const gravity = -0.02;
const jumpStrength = 0.2;
let velocityY = 0;
let isGrounded = true;

let interactionMessage = "";
let messageDisplayTime = 0;

function checkDeskProximity() {
  let nearestDesk = null;
  let minDistance = Infinity;
  
  for (const desk of desks) {
    const deskCenter = desk.getCenter();
    const dx = camera.x - deskCenter.x;
    const dz = camera.z - deskCenter.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < 2.5 && distance < minDistance) {
      minDistance = distance;
      nearestDesk = desk;
    }
  }
  
  return nearestDesk;
}

function interactWithDesk() {
  const nearDesk = checkDeskProximity();
  if (nearDesk) {
    interactionMessage = "You are at a desk!";
    messageDisplayTime = 120;
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

function applyGravity() {
  velocityY += gravity;
  camera.y += velocityY;

  if (camera.y <= 1.5) {
    camera.y = 1.5;
    velocityY = 0;
    isGrounded = true;
  }
}

function jump() {
  if (isGrounded) {
    velocityY = jumpStrength;
    isGrounded = false;
  }
}

let lastFrameTime = performance.now();
let fps = 60;

function updateFPS() {
  const now = performance.now();
  const deltaTime = now - lastFrameTime;
  lastFrameTime = now;
  fps = 1000 / deltaTime;
}


let useDynamicScale = false;
function adjustRenderScale() {
  if (useDynamicScale) {
    if (fps < 30) {
      renderScale = Math.max(0.1, renderScale - 0.02);
    } else if (fps > 50) {
      renderScale = Math.min(1.0, renderScale + 0.02);
    }
  }
}

function renderScene() {
  
  const imageWidth = Math.floor(canvas.width * renderScale);
  const imageHeight = Math.floor(canvas.height * renderScale);
  const imgData = ctx.createImageData(imageWidth, imageHeight);
  const pix = imgData.data;

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
      let isTransparent = false;

      for (const sphere of spheres) {
        const distance = sphere.intersect(camera, rotatedRay);
        if (distance !== null && distance < closestDistance) {
          closestDistance = distance;
          const shade = Math.max(0, 255 - distance * 50);
          color = { r: shade, g: shade, b: shade };
          isTransparent = false;
        }
      }

      for (const plane of buildingPlanes) {
        const distance = plane.intersect(camera, rotatedRay);
        if (distance !== null && distance < closestDistance) {
          closestDistance = distance;
          if (plane.transparent) {
            color = { r: plane.color.r, g: plane.color.g, b: plane.color.b };
            isTransparent = true;
          } else {
            color = { r: plane.color.r, g: plane.color.g, b: plane.color.b };
            isTransparent = false;
          }
        }
      }

      for (const desk of desks) {
        const distance = desk.intersect(camera, rotatedRay);
        if (distance !== null && distance < closestDistance) {
          closestDistance = distance;
          color = { r: desk.color.r, g: desk.color.g, b: desk.color.b };
          isTransparent = false;
        }
      }

      const floorDistance = floor.intersect(camera, rotatedRay);
      if (floorDistance !== null && floorDistance < closestDistance) {
        closestDistance = floorDistance;
        const checker = Math.floor(camera.x + rotatedRay.x * floorDistance) % 2;
        const shade = checker === 0 ? 120 : 90;
        color = { r: shade, g: shade, b: shade };
        isTransparent = false;
      }

    
      const idx = (y * imageWidth + x) * 4;
      pix[idx] = color.r;
      pix[idx + 1] = color.g;
      pix[idx + 2] = color.b;
      pix[idx + 3] = isTransparent ? 128 : 255;
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  if (renderScale !== 1.0) {
    ctx.drawImage(canvas, 0, 0, imageWidth, imageHeight, 0, 0, canvas.width, canvas.height);
  }

  if (messageDisplayTime > 0) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(canvas.width / 2 - 150, canvas.height - 100, 300, 50);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(interactionMessage, canvas.width / 2, canvas.height - 70);
    messageDisplayTime--;
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
  if (event.key === " ") jump();
  if (event.key === "e" || event.key === "E") interactWithDesk();
});

function gameLoop() {
  updateFPS();
  adjustRenderScale();
  applyGravity();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderScene();
  requestAnimationFrame(gameLoop);
}

gameLoop();
