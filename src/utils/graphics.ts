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
  const size = 128; // Higher res
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // 1. Marble Base
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, COLORS.FLOOR_BASE);
    gradient.addColorStop(1, COLORS.FLOOR_HIGHLIGHT);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // 2. Marble Veins
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    for(let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * size, 0);
        ctx.bezierCurveTo(Math.random()*size, size/2, Math.random()*size, size/2, Math.random()*size, size);
        ctx.stroke();
    }

    // 3. Tile Border (Bevel)
    const border = 4;
    // Highlight Top/Left
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, size, border);
    ctx.fillRect(0, 0, border, size);
    
    // Shadow Bottom/Right
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, size - border, size, border);
    ctx.fillRect(size - border, 0, border, size);

    // 4. Noise for texture
    addNoise(ctx, size, size, 10);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
};

export const createWallTexture = (color: string): THREE.CanvasTexture => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Base Color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    
    // Art Deco Vertical Pattern
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    const stripeWidth = 16;
    for(let i=0; i<size; i+=stripeWidth*2) {
      ctx.fillRect(i, 0, stripeWidth, size);
    }

    // Top Crown Molding
    const trimHeight = 12;
    const gradTop = ctx.createLinearGradient(0, 0, 0, trimHeight);
    gradTop.addColorStop(0, '#ecf0f1');
    gradTop.addColorStop(1, '#bdc3c7');
    ctx.fillStyle = gradTop;
    ctx.fillRect(0, 0, size, trimHeight);
    
    // Bottom Wainscoting
    const wainscotHeight = 40;
    const startY = size - wainscotHeight;
    
    // Wainscot Cap
    ctx.fillStyle = '#555';
    ctx.fillRect(0, startY, size, 4);

    // Wainscot Body
    ctx.fillStyle = '#444';
    ctx.fillRect(0, startY + 4, size, wainscotHeight - 4);
    
    // Wainscot Panels
    ctx.strokeStyle = '#333';
    ctx.strokeRect(10, startY + 10, size - 20, wainscotHeight - 20);

    // Noise
    addNoise(ctx, size, size, 5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
};