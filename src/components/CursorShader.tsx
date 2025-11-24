import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const CursorMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color('#fbbf24'), // Warm amber
  },
  // Vertex
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment
  `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;

    void main() {
      // Rounded square logic
      vec2 uv = vUv * 2.0 - 1.0;
      float d = max(abs(uv.x), abs(uv.y));
      
      // Soft pulsing opacity
      float pulse = 0.4 + 0.1 * sin(time * 3.0);
      
      // Border thickness
      float border = step(0.85, d);
      
      gl_FragColor = vec4(color, border * pulse + 0.1);
    }
  `
);

export { CursorMaterial };