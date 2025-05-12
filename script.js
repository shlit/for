let lastFrameTime = performance.now();
let fps = 60;
let renderScale = 0.2;

function updateFPS() {
  const now = performance.now();
  const deltaTime = now - lastFrameTime;
  lastFrameTime = now;
  fps = 1000 / deltaTime;
}

function adjustRenderScale() {
  if (fps < 30) {
    renderScale = Math.max(0.1, renderScale - 0.02);
  } else if (fps > 50) {
    renderScale = Math.min(0.5, renderScale + 0.02);
  }
}

function renderScene() {
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

  drawCompass();
}

function gameLoop() {
  updateFPS();
  adjustRenderScale();
  applyGravity();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderScene();
  requestAnimationFrame(gameLoop);
}

gameLoop();
