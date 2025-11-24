import * as THREE from 'three';

// Helper: Add subtle noise to context
const addNoise = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Greyscale noise is better for blending
    const noise = (Math.random() - 0.5) * intensity;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
};

export const createFloorTexture = (): THREE.CanvasTexture => {
  const size = 1024; // High res for sharpness
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // 1. Background (Light Oak)
    ctx.fillStyle = '#f3e5d0'; 
    ctx.fillRect(0, 0, size, size);

    // 2. Planks
    const plankCount = 4;
    const plankHeight = size / plankCount;
    
    for(let i = 0; i < plankCount; i++) {
        // Slight randomization of plank tone
        const variance = (Math.random() - 0.5) * 10;
        // Warm wood tones
        const r = 243 + variance;
        const g = 229 + variance;
        const b = 208 + variance;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, i * plankHeight, size, plankHeight);
        
        // Plank Bevel/Shadow at bottom
        ctx.fillStyle = 'rgba(160, 140, 120, 0.2)';
        ctx.fillRect(0, (i * plankHeight) + plankHeight - 2, size, 2);
        
        // Plank Highlight at top
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, i * plankHeight, size, 2);
    }

    // 3. Subtle Grain Pattern
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#654321';
    for(let i=0; i<100; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = Math.random() * size * 0.5;
        const h = Math.random() * 4 + 1;
        ctx.fillRect(x, y, w, h);
    }
    ctx.globalAlpha = 1.0;

    // 4. Perceptual Noise (very subtle)
    addNoise(ctx, size, size, 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16; // Crisp at oblique angles
  return texture;
};

export const createWallTexture = (color: string): THREE.CanvasTexture => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // 1. Base Paint
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    
    // 2. Texture: Light Stucco/Roll pattern
    addNoise(ctx, size, size, 12);

    // 3. Bottom Wainscoting (Classic White)
    const baseboardHeight = 64;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, size - baseboardHeight, size, baseboardHeight);
    
    // 4. Baseboard Detail (Molding line)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, size - baseboardHeight, size, 4); // Top lip
    
    // 5. Shadow under molding
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, size - baseboardHeight + 4, size, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};