const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Sphere object definition
class Sphere {
  constructor(center, radius) {
    this.center = center; // { x, y, z }
    this.radius = radius;
  }

  // Function to check ray-sphere intersection and return the distance
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
      // Return the closest intersection distance
      return (-b - Math.sqrt(discriminant)) / (2.0 * a);
    }
    return null; // No intersection
  }
}

// Utility function to calculate dot product of two vectors
function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

// Scene setup
const spheres = [
  new Sphere({ x: 0, y: 0, z: 3 }, 1), // Sphere 1
  new Sphere({ x: -1.5, y: 0, z: 5 }, 1), // Sphere 2
];

const camera = { x: 0, y: 0, z: 0 }; // Camera at the origin

// Render the scene
function renderScene() {
  const imageWidth = canvas.width;
  const imageHeight = canvas.height;

  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      // Calculate ray direction
      const rayDirection = {
        x: (x / imageWidth) * 2 - 1,
        y: 1 - (y / imageHeight) * 2,
        z: 1, // Points forward
      };

      let closestDistance = Infinity;
      let shade = 0;

      // Check for intersections with all spheres
      for (const sphere of spheres) {
        const distance = sphere.intersect(camera, rayDirection);
        if (distance !== null && distance < closestDistance) {
          closestDistance = distance;
          shade = Math.max(0, 255 - distance * 50); // Darker for closer objects
        }
      }

      // Set pixel color based on distance (shade)
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

renderScene();
