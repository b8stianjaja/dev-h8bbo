import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
// extend is not needed if we use primitive object in the component
// import { extend } from '@react-three/fiber'; 

// A pulsating grid selection shader
const CursorMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.8, 0.8, 0.8),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;

    void main() {
      // Create a hollow square effect
      float border = 0.05;
      float alpha = 0.0;
      
      // Edges
      if (vUv.x < border || vUv.x > 1.0 - border || vUv.y < border || vUv.y > 1.0 - border) {
        alpha = 0.8 + 0.2 * sin(time * 5.0);
      }
      
      // Slight fill
      float fillAlpha = 0.1 + 0.05 * sin(time * 2.0);
      
      gl_FragColor = vec4(color, max(alpha, fillAlpha));
    }
  `
);

export { CursorMaterial };