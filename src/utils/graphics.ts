import * as THREE from 'three';
import { COLORS } from '../constants';

// Helper: Add noise to context
const addNoise = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
};

export const createFloorTexture = (): THREE.CanvasTexture => {
  const size = 512; // High res for crisp lines
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // 1. Dark Neon Base
    ctx.fillStyle = COLORS.FLOOR_BASE;
    ctx.fillRect(0, 0, size, size);

    // 2. Glowing Borders (The Grid)
    ctx.strokeStyle = '#4c1d95'; // Deep Purple Glow
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, size, size);
    
    // 3. Inner Tile Detail (Subtle reflection)
    ctx.fillStyle = COLORS.FLOOR_HIGHLIGHT;
    ctx.fillRect(16, 16, size-32, size-32);

    // 4. Center Shine (Radial Gradient for depth)
    const grad = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(139, 92, 246, 0.15)'); // Light purple
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,size,size);

    // 5. Tech Noise
    addNoise(ctx, size, size, 5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter; // Smoother for neon
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  return texture;
};

export const createWallTexture = (color: string): THREE.CanvasTexture => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Metallic Wall Base
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    
    // Cyber Lines
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    const stripeWidth = 4;
    for(let i=0; i<size; i+=32) {
      ctx.fillRect(i, 0, stripeWidth, size);
    }

    // Top Light Strip
    ctx.fillStyle = '#60a5fa'; // Blue light strip
    ctx.fillRect(0, 0, size, 6);
    
    // Bottom Base
    ctx.fillStyle = '#111';
    ctx.fillRect(0, size - 12, size, 12);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  return texture;
};