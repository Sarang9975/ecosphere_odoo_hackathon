"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  Leaf,
  Users,
  Zap,
  Info,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ── Simplex-like noise (no deps) ──────────────────────────────────────────────
function hash(n: number) {
  const x = Math.sin(n) * 43758.5453123;
  return x - Math.floor(x);
}


function noise3(x: number, y: number, z: number) {
  const p = Math.floor(x);
  const q = Math.floor(y);
  const r = Math.floor(z);
  const fx = x - p;
  const fy = y - q;
  const fz = z - r;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);
  const a = hash(p + hash(q + hash(r)));
  const b = hash(p + 1 + hash(q + hash(r)));
  const c = hash(p + hash(q + 1 + hash(r)));
  const d = hash(p + 1 + hash(q + 1 + hash(r)));
  const e = hash(p + hash(q + hash(r + 1)));
  const f = hash(p + 1 + hash(q + hash(r + 1)));
  const g = hash(p + hash(q + 1 + hash(r + 1)));
  const h = hash(p + 1 + hash(q + 1 + hash(r + 1)));
  return (
    a +
    (b - a) * ux +
    (c - a) * uy +
    (d - c - b + a) * ux * uy +
    (e - a) * uz +
    (f - b - e + a) * ux * uz +
    (g - c - e + a) * uy * uz +
    (h - g - f - d + e + c + b - a) * ux * uy * uz
  );
}

function fbm(x: number, y: number, z: number, octaves = 5) {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += noise3(x * freq, y * freq, z * freq) * amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return val;
}

// ── Color lerp helper ─────────────────────────────────────────────────────────
function lerpColor(a: THREE.Color, b: THREE.Color, t: number) {
  return new THREE.Color().lerpColors(a, b, t);
}

// ── ESG-reactive Planet Sphere ────────────────────────────────────────────────
interface PlanetProps {
  esg: number; // 0-100
  carbon: number; // 0-100 (higher = more polluted)
  csr: number; // 0-100 (higher = greener)
}

function Planet({ esg, carbon, csr }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(2.5, 64);
    const positions = g.attributes.position as THREE.BufferAttribute;
    const count = positions.count;
    const colors = new Float32Array(count * 3);
    const displacement = new Float32Array(count);

    // Health derived from ESG
    const health = esg / 100; // 0 = dead, 1 = lush

    // Color palettes
    const deepOcean = new THREE.Color("#0a2a6e");
    const ocean = new THREE.Color("#1464b4");
    const shallow = new THREE.Color("#2a80d0");
    const sand = new THREE.Color("#d4b483");
    const drySoil = new THREE.Color("#8b5c2a");
    const dryland = new THREE.Color("#c8863c");
    const grassDry = new THREE.Color("#7a8c3c");
    const grass = new THREE.Color("#3a8c3c");
    const forestDark = new THREE.Color("#1a5c1a");
    const snowPeak = new THREE.Color("#e8eef5");
    const rock = new THREE.Color("#6a6060");
    const lavaRock = new THREE.Color("#3a2020");

    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const len = Math.sqrt(x * x + y * y + z * z);
      const nx = x / len;
      const ny = y / len;
      const nz = z / len;

      // Multi-octave terrain noise
      const continent = fbm(nx * 2.2, ny * 2.2, nz * 2.2, 4) * 0.6;
      const detail = fbm(nx * 6, ny * 6, nz * 6, 3) * 0.25;
      const mountain = Math.max(0, fbm(nx * 4, ny * 4, nz * 4, 3) - 0.3) * 0.8;
      const totalNoise = continent + detail + mountain * 0.5;

      // Sea level ~ 0.3
      const seaLevel = 0.28;
      const isOcean = totalNoise < seaLevel;

      // Displacement
      let disp = 0;
      if (isOcean) {
        disp = (totalNoise - seaLevel) * 0.04;
      } else {
        const landHeight = (totalNoise - seaLevel) / (1 - seaLevel);
        disp = landHeight * 0.38 * (0.6 + mountain * 0.8);
      }
      displacement[i] = disp;

      // Color based on height + ESG health
      let color: THREE.Color;
      if (isOcean) {
        const depthFactor = Math.max(0, (seaLevel - totalNoise) / seaLevel);
        color = lerpColor(shallow, lerpColor(ocean, deepOcean, depthFactor * 1.5), depthFactor);
        // Pollution darkens ocean
        if (carbon > 50) {
          color = lerpColor(color, new THREE.Color("#0a1a2e"), ((carbon - 50) / 50) * 0.4);
        }
      } else {
        const landHeight = (totalNoise - seaLevel) / (1 - seaLevel);
        if (landHeight < 0.05) {
          color = lerpColor(sand, drySoil, 1 - health);
        } else if (landHeight < 0.35) {
          const greenColor = lerpColor(grassDry, grass, health);
          color = lerpColor(lerpColor(dryland, greenColor, health * 1.2), greenColor, health);
        } else if (landHeight < 0.65) {
          const forestColor = lerpColor(grassDry, forestDark, health);
          color = lerpColor(rock, forestColor, health);
        } else if (landHeight < 0.8) {
          color = lerpColor(rock, lerpColor(rock, new THREE.Color("#8aaa60"), health * 0.5), 0.5);
        } else {
          const snowAmount = Math.max(0, (landHeight - 0.8) / 0.2);
          color = lerpColor(rock, snowPeak, snowAmount * (0.5 + health * 0.5));
          if (health < 0.3) color = lerpColor(color, lavaRock, (0.3 - health) * 2);
        }

        // Pollution overlay: desaturate + darken low-health areas
        if (health < 0.5) {
          const grey = new THREE.Color(color.r * 0.3, color.g * 0.3, color.b * 0.3);
          color = lerpColor(color, grey, (0.5 - health) * 0.8);
        }
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    // Apply displacement to positions
    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const len = Math.sqrt(x * x + y * y + z * z);
      const disp = displacement[i];
      positions.setXYZ(i, x + (x / len) * disp, y + (y / len) * disp, z + (z / len) * disp);
    }

    positions.needsUpdate = true;
    const colorAttr = new THREE.BufferAttribute(colors, 3);
    colorAttr.needsUpdate = true;
    g.setAttribute("color", colorAttr);
    g.computeVertexNormals();
    return g;
  }, [esg, carbon, csr]);

  const condition = getCondition(esg);
  const conditionColorObj = useMemo(() => new THREE.Color(condition.color), [condition.color]);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    esg: { value: esg },
    carbon: { value: carbon },
    csr: { value: csr },
    sunDirection: { value: new THREE.Vector3(8, 5, 3).normalize() },
    conditionColor: { value: conditionColorObj }
  }), [esg, carbon, csr, conditionColorObj]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.04;
    }
    if (matRef.current) {
      matRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  const matRef = useRef<THREE.ShaderMaterial>(null!);

  return (
    <mesh ref={meshRef} geometry={geo} castShadow receiveShadow>
      <shaderMaterial
        ref={matRef}
        vertexShader={PlanetShader.vertexShader}
        fragmentShader={PlanetShader.fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

// ── Procedural Trees (Instanced) ─────────────────────────────────────────────
function Trees({ esg, count = 600 }: { esg: number; count?: number }) {
  const health = esg / 100;
  const visibleCount = Math.floor(count * health);

  const treeData = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const scales: number[] = [];
    const colors: THREE.Color[] = [];

    // Generate candidate positions on sphere surface
    const candidates: { pos: THREE.Vector3; noise: number }[] = [];
    for (let i = 0; i < count * 3; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 1;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);

      const n = fbm(nx * 2.2, ny * 2.2, nz * 2.2, 4) * 0.6 + fbm(nx * 6, ny * 6, nz * 6, 3) * 0.25;
      const isLand = n > 0.28 && n < 0.7;
      const notPolar = Math.abs(ny) < 0.85;

      if (isLand && notPolar) {
        // Place on terrain surface
        const geo = new THREE.IcosahedronGeometry(2.5, 2);
        const landH = (n - 0.28) / (0.72 - 0.28);
        const disp = landH * 0.38;
        const surfaceR = 2.5 + disp + 0.03;
        candidates.push({
          pos: new THREE.Vector3(nx * surfaceR, ny * surfaceR, nz * surfaceR),
          noise: n,
        });
      }
      if (candidates.length >= count * 2) break;
    }

    // Pick the first `count` valid candidates
    for (let i = 0; i < Math.min(count, candidates.length); i++) {
      positions.push(candidates[i].pos);
      scales.push(0.04 + Math.random() * 0.05);
      // Color: gradient from yellow-green (dry) to dark green (healthy)
      const treeGreen = new THREE.Color().setHSL(0.28 + Math.random() * 0.06, 0.6 + Math.random() * 0.3, 0.2 + Math.random() * 0.15);
      colors.push(treeGreen);
    }
    return { positions, scales, colors };
  }, [count]);

  // Trunk instances
  const trunkRef = useRef<THREE.InstancedMesh>(null!);
  const foliageRef = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const { positions, scales, colors } = treeData;

    for (let i = 0; i < count; i++) {
      const visible = i < visibleCount;
      if (!visible) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        trunkRef.current?.setMatrixAt(i, dummy.matrix);
        foliageRef.current?.setMatrixAt(i, dummy.matrix);
        continue;
      }

      const pos = positions[i] || new THREE.Vector3(0, 3, 0);
      const up = pos.clone().normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
      const s = scales[i] || 0.05;

      // Trunk
      dummy.position.copy(pos);
      dummy.quaternion.copy(q);
      dummy.scale.set(s * 0.3, s * 0.8, s * 0.3);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      // Foliage (shift up along normal)
      const foliagePos = pos.clone().addScaledVector(up, s * 1.1);
      dummy.position.copy(foliagePos);
      dummy.quaternion.copy(q);
      dummy.scale.set(s * 1.1, s * 1.1, s * 1.1);
      dummy.updateMatrix();
      foliageRef.current?.setMatrixAt(i, dummy.matrix);

      // Color
      if (colors[i]) {
        foliageRef.current?.setColorAt(i, colors[i]);
        trunkRef.current?.setColorAt(i, new THREE.Color("#5c3a1e"));
      }
    }

    if (trunkRef.current) {
      trunkRef.current.instanceMatrix.needsUpdate = true;
      if (trunkRef.current.instanceColor) trunkRef.current.instanceColor.needsUpdate = true;
    }
    if (foliageRef.current) {
      foliageRef.current.instanceMatrix.needsUpdate = true;
      if (foliageRef.current.instanceColor) foliageRef.current.instanceColor.needsUpdate = true;
    }
  }, [visibleCount, treeData, count]);

  return (
    <>
      {/* Trunk (Thin wireframe pyramid) */}
      <instancedMesh ref={trunkRef} args={[null as any, null as any, count]}>
        <cylinderGeometry args={[0.02, 0.08, 1.0, 4]} />
        <meshBasicMaterial
          wireframe
          color={esg > 50 ? "#10b981" : "#ef4444"}
          transparent
          opacity={0.35}
        />
      </instancedMesh>
      
      {/* Foliage (Wireframe vector cone) */}
      <instancedMesh ref={foliageRef} args={[null as any, null as any, count]}>
        <coneGeometry args={[0.26, 0.75, 4]} />
        <meshBasicMaterial
          wireframe
          color={esg > 50 ? "#06b6d4" : "#f43f5e"}
          transparent
          opacity={0.75}
        />
      </instancedMesh>
    </>
  );
}

// ── Custom GLSL Shaders for Holographic Vector Look ──────────────────────────

const PlanetShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float time;
    uniform float esg;
    uniform float carbon;
    uniform float csr;
    uniform vec3 sunDirection;
    uniform vec3 conditionColor;

    // Simple procedural 3D noise
    float hash(vec3 p) {
      return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
    }
    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      vec3 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i+vec3(0.0,0.0,0.0)), hash(i+vec3(1.0,0.0,0.0)), u.x),
            mix(hash(i+vec3(0.0,1.0,0.0)), hash(i+vec3(1.0,1.0,0.0)), u.x), u.y),
        mix(mix(hash(i+vec3(0.0,0.0,1.0)), hash(i+vec3(1.0,0.0,1.0)), u.x),
            mix(hash(i+vec3(0.0,1.0,1.0)), hash(i+vec3(1.0,1.0,1.0)), u.x), u.y), u.z
      );
    }
    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.2;
        a = a * 0.5;
      }
      return v;
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 p = normalize(vPosition);
      
      // Calculate continent outline noise
      float n = fbm(p * 2.2);
      
      // Base dark glossy globe background
      vec3 finalColor = vec3(0.015, 0.04, 0.08); // dark space blue
      
      // Coordinate grid lines (Latitude & Longitude)
      float gridX = abs(sin(p.x * 24.0));
      float gridY = abs(sin(p.y * 24.0));
      float gridZ = abs(sin(p.z * 24.0));
      float gridLine = smoothstep(0.985, 1.0, max(gridX, max(gridY, gridZ)));
      
      // Continental threshold
      float seaLevel = 0.44;
      bool isLand = n > seaLevel;
      
      // Neon colors
      vec3 healthyGreen = vec3(0.06, 0.95, 0.55); // emerald green
      vec3 deadRed = vec3(0.95, 0.2, 0.15); // crimson warning
      
      // Interpolate main continent glow color based on esg
      vec3 vectorColor = mix(deadRed, healthyGreen, esg / 100.0);
      
      if (!isLand) {
        // Draw coordinate grid on ocean
        finalColor = mix(finalColor, vec3(0.04, 0.18, 0.38), gridLine * 0.35);
      } else {
        // Topographic contours on land (moving waves of light)
        float heightVal = (n - seaLevel) / (1.0 - seaLevel);
        float contour = sin(heightVal * 40.0 - time * 1.8);
        float contourLine = smoothstep(0.85, 0.96, contour);
        
        // Continent borders
        float border = smoothstep(0.0, 0.015, n - seaLevel) * (1.0 - smoothstep(0.015, 0.035, n - seaLevel));
        
        // Mix topographic vectors and glowing borders
        finalColor = mix(finalColor, vectorColor * 0.5, 0.2); // slight continent body glow
        finalColor = mix(finalColor, vectorColor * 1.2, contourLine * 0.55);
        finalColor = mix(finalColor, vectorColor * 1.5, border * 0.9);
        
        // Carbon overload glitch red grid
        if (carbon > 50.0) {
          float glitch = sin(time * 20.0) * cos(time * 8.0);
          if (glitch > 0.35) {
            float alertGrid = smoothstep(0.96, 1.0, max(gridX, max(gridY, gridZ)));
            finalColor = mix(finalColor, vec3(1.0, 0.05, 0.15), alertGrid * ((carbon - 50.0) / 50.0) * 0.9);
          }
        }
      }
      
      // Fresnel edge glow (subtle)
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);
      finalColor += vectorColor * fresnel * 0.55;
      
      gl_FragColor = vec4(finalColor, 0.88);
    }
  `
};

const CloudShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float time;
    uniform float opacity;
    uniform vec3 color;
    uniform vec3 sunDirection;

    float hash(vec3 p) {
      return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
    }

    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      vec3 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(
          mix(hash(i + vec3(0.0,0.0,0.0)), hash(i + vec3(1.0,0.0,0.0)), u.x),
          mix(hash(i + vec3(0.0,1.0,0.0)), hash(i + vec3(1.0,1.0,0.0)), u.x),
          u.y
        ),
        mix(
          mix(hash(i + vec3(0.0,0.0,1.0)), hash(i + vec3(1.0,0.0,1.0)), u.x),
          mix(hash(i + vec3(0.0,1.0,1.0)), hash(i + vec3(1.0,1.0,1.0)), u.x),
          u.y
        ),
        u.z
      );
    }

    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.5;
        a = a * 0.5;
      }
      return v;
    }

    void main() {
      vec3 normal = normalize(vNormal);
      float diffuse = max(dot(normal, sunDirection), 0.0);
      float lighting = 0.4 + 0.6 * diffuse;

      // Slow wind current motion
      vec3 p = vPosition * 1.4;
      p.x += time * 0.035;
      p.z -= time * 0.015;

      float n = fbm(p);
      
      // Draw wind current glowing vector lines
      float windLine = smoothstep(0.86, 0.95, sin(n * 32.0));
      float densityMask = smoothstep(0.38, 0.62, n);

      gl_FragColor = vec4(color * lighting, windLine * densityMask * opacity * 1.5);
    }
  `
};

const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform vec3 color;
    uniform vec3 sunDirection;
    uniform float power;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel glow intensity
      float intensity = pow(1.0 - max(dot(normal, viewDir), 0.0), power);

      // Fade out on night side
      float dotSun = dot(normal, sunDirection);
      float dayNight = smoothstep(-0.35, 0.35, dotSun) * 0.85 + 0.15;

      gl_FragColor = vec4(color, intensity * dayNight);
    }
  `
};

// ── Animated Shader Clouds ───────────────────────────────────────────────────
function Clouds({ esg }: { esg: number }) {
  const health = esg / 100;
  const cloudOpacity = 0.18 + health * 0.42; // healthier = more/thicker clouds
  const cloudColor = health > 0.4
    ? new THREE.Color("#f8fafc")
    : new THREE.Color("#a1a1aa"); // greyish polluted clouds

  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    opacity: { value: cloudOpacity },
    color: { value: cloudColor },
    sunDirection: { value: new THREE.Vector3(8, 5, 3).normalize() }
  }), [cloudOpacity, cloudColor]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[2.58, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={CloudShader.vertexShader}
        fragmentShader={CloudShader.fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Atmosphere Glow Shell ─────────────────────────────────────────────────────
function AtmosphereGlow({ esg }: { esg: number }) {
  const health = esg / 100;
  const atmColor = health > 0.5
    ? new THREE.Color("#38bdf8") // vibrant light blue
    : lerpColor(new THREE.Color("#ca8a04"), new THREE.Color("#0ea5e9"), health * 2); // yellow-brown to blue

  const uniforms = useMemo(() => ({
    color: { value: atmColor },
    sunDirection: { value: new THREE.Vector3(8, 5, 3).normalize() },
    power: { value: 4.0 }
  }), [atmColor]);

  return (
    <mesh>
      <sphereGeometry args={[2.74, 48, 48]} />
      <shaderMaterial
        vertexShader={AtmosphereShader.vertexShader}
        fragmentShader={AtmosphereShader.fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Pollution Haze ────────────────────────────────────────────────────────────
function PollutionHaze({ carbon }: { carbon: number }) {
  if (carbon < 20) return null;
  const intensity = (carbon - 20) / 80;
  return (
    <mesh>
      <sphereGeometry args={[2.65, 32, 32]} />
      <meshBasicMaterial
        color={new THREE.Color("#78350f")}
        transparent
        opacity={intensity * 0.15}
        depthWrite={false}
      />
    </mesh>
  );
}


// ── Orbiting Satellite ────────────────────────────────────────────────────────
function Satellite({ esg }: { esg: number }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t * 0.3) * 3.8,
        Math.sin(t * 0.15) * 1.2,
        Math.sin(t * 0.3) * 3.8
      );
      ref.current.rotation.y = t;
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.08, 0.08, 0.2]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.18, 0, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.1]} />
        <meshStandardMaterial color={esg > 50 ? "#10b981" : "#f59e0b"} metalness={0.6} roughness={0.3} emissive={esg > 50 ? "#10b981" : "#f59e0b"} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.18, 0, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.1]} />
        <meshStandardMaterial color={esg > 50 ? "#10b981" : "#f59e0b"} metalness={0.6} roughness={0.3} emissive={esg > 50 ? "#10b981" : "#f59e0b"} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// ── Animated particles (CO2 / pollen) ────────────────────────────────────────
function EnvironmentParticles({ esg, carbon }: { esg: number; carbon: number }) {
  const health = esg / 100;
  return (
    <>
      {/* Healthy sparkles = fireflies/pollen */}
      {health > 0.4 && (
        <Sparkles
          count={Math.floor(health * 60)}
          scale={6}
          size={0.6}
          speed={0.15}
          color="#a0ff80"
          opacity={health * 0.5}
        />
      )}
      {/* Pollution particles */}
      {carbon > 40 && (
        <Sparkles
          count={Math.floor(((carbon - 40) / 60) * 80)}
          scale={5.5}
          size={0.8}
          speed={0.05}
          color="#aa6622"
          opacity={((carbon - 40) / 60) * 0.4}
        />
      )}
    </>
  );
}

// ── Ocean Sphere (Transparent Vector Grid Globe) ──────────────────────────────
function Ocean() {
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.012;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.49, 36, 18]} />
      <meshBasicMaterial
        color="#083344" // deep teal grid line
        transparent
        opacity={0.16}
        wireframe
      />
    </mesh>
  );
}

// ── Spinning Orbiting Vector HUD Rings ───────────────────────────────────────
function HUDRings({ esg }: { esg: number }) {
  const ref1 = useRef<THREE.Mesh>(null!);
  const ref2 = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref1.current) {
      ref1.current.rotation.z = t * 0.12;
      ref1.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.05) * 0.08;
    }
    if (ref2.current) {
      ref2.current.rotation.z = -t * 0.18;
      ref2.current.rotation.y = Math.PI / 4 + Math.cos(t * 0.08) * 0.08;
    }
  });

  const neonColor = esg > 50 ? "#06b6d4" : "#f43f5e";

  return (
    <>
      {/* Outer telemetry rings (simulated dashboard lines) */}
      <mesh ref={ref1}>
        <ringGeometry args={[3.25, 3.28, 64]} />
        <meshBasicMaterial
          color={neonColor}
          side={THREE.DoubleSide}
          transparent
          opacity={0.25}
          wireframe
        />
      </mesh>
      
      <mesh ref={ref2}>
        <ringGeometry args={[3.55, 3.57, 32]} />
        <meshBasicMaterial
          color={neonColor}
          side={THREE.DoubleSide}
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
    </>
  );
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function PlanetScene({ esg, carbon, csr }: PlanetProps) {
  const health = esg / 100;
  const sunColor = health > 0.5 ? "#fff8e7" : "#ffcc88";
  const ambientIntensity = 0.4 + health * 0.2;

  return (
    <>
      {/* Space stars */}
      <Stars radius={80} depth={50} count={5000} factor={4} saturation={0.3} fade speed={0.4} />

      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} color={sunColor} />
      <directionalLight
        position={[8, 5, 3]}
        intensity={1.8}
        color={sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {/* Rim light (subtle blue from space) */}
      <directionalLight position={[-6, 3, -4]} intensity={0.3} color="#3060ff" />

      {/* Ocean vector grid */}
      <Ocean />

      {/* Spinning HUD rings */}
      <HUDRings esg={esg} />

      {/* Planet */}
      <Planet esg={esg} carbon={carbon} csr={csr} />

      {/* Trees */}
      <Trees esg={esg} count={800} />

      {/* Clouds */}
      <Clouds esg={esg} />

      {/* Atmosphere */}
      <AtmosphereGlow esg={esg} />
      <PollutionHaze carbon={carbon} />

      {/* Satellite */}
      <Satellite esg={esg} />

      {/* Particles */}
      <EnvironmentParticles esg={esg} carbon={carbon} />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={14}
        autoRotate={false}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

// ── ESG Condition Labels ──────────────────────────────────────────────────────
function getCondition(esg: number) {
  if (esg >= 85) return { label: "Thriving 🌿", color: "#10b981", desc: "Earth is lush, green and healthy" };
  if (esg >= 70) return { label: "Recovering 🌱", color: "#34d399", desc: "Good progress, forests are growing" };
  if (esg >= 55) return { label: "Stressed 🌾", color: "#f59e0b", desc: "Vegetation is thinning, soil drying" };
  if (esg >= 40) return { label: "Struggling 🌵", color: "#f97316", desc: "Desertification spreading, bare land" };
  if (esg >= 25) return { label: "Degraded ⚠️", color: "#ef4444", desc: "Critical — severe ecosystem damage" };
  return { label: "Dying 💀", color: "#dc2626", desc: "Planet on the brink — emergency action needed!" };
}

// ── Main Component ────────────────────────────────────────────────────────────
interface EarthVisualizerProps {
  initialESG?: number;
  initialCarbon?: number;
  initialCSR?: number;
  isFullPage?: boolean;
}

export function EarthVisualizer({
  initialESG = 72,
  initialCarbon = 45,
  initialCSR = 60,
  isFullPage = false,
}: EarthVisualizerProps) {
  const [esg, setEsg] = useState(initialESG);
  const [carbon, setCarbon] = useState(initialCarbon);
  const [csr, setCSR] = useState(initialCSR);
  const [fullscreen, setFullscreen] = useState(isFullPage);
  const [showInfo, setShowInfo] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const condition = getCondition(esg);
  const health = esg / 100;

  // Recompute ESG from carbon + csr
  const computedESG = Math.max(0, Math.min(100,
    Math.round((100 - carbon * 0.5 + csr * 0.3 + esg * 0.2))
  ));

  const bgColor = health > 0.5
    ? `radial-gradient(ellipse at center, #030a14 0%, #000408 100%)`
    : `radial-gradient(ellipse at center, #0a0505 0%, #020101 100%)`;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: "100%",
        height: fullscreen ? "100vh" : "100%",
        minHeight: fullscreen ? "100vh" : 600,
        background: bgColor,
        borderRadius: fullscreen ? 0 : 20,
        border: fullscreen ? "none" : "1px solid rgba(16,185,129,0.15)",
      }}
    >
      {/* ── 3D Canvas ── */}
      <Canvas
        shadows
        camera={{ position: [0, 0, 7], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <PlanetScene esg={esg} carbon={carbon} csr={csr} />
      </Canvas>

      {/* ── Top Bar ── */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none z-10">
        {/* Title + condition */}
        <motion.div
          className="pointer-events-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div
            className="px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(8,12,20,0.85)",
              border: `1px solid ${condition.color}30`,
              backdropFilter: "blur(16px)",
              boxShadow: `0 0 30px ${condition.color}15`,
            }}
          >
            <p className="font-orbitron text-xs text-slate-400 tracking-widest uppercase mb-1">🌍 ESG Digital Twin</p>
            <p className="font-orbitron text-lg font-bold" style={{ color: condition.color }}>
              {condition.label}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{condition.desc}</p>
          </div>
        </motion.div>

        {/* Right controls */}
        <div className="flex flex-col gap-2 items-end pointer-events-auto">
          <motion.button
            onClick={() => setFullscreen(!fullscreen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(8,12,20,0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
          >
            {fullscreen ? <Minimize2 size={14} className="text-slate-300" /> : <Maximize2 size={14} className="text-slate-300" />}
          </motion.button>
          <motion.button
            onClick={() => setShowInfo(!showInfo)}
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(8,12,20,0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
          >
            <Info size={14} className="text-slate-300" />
          </motion.button>
        </div>
      </div>

      {/* ── Live Score Panel (right side) ── */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="absolute top-20 right-4 w-48 space-y-2 z-10"
          >
            {[
              { label: "ESG Score", value: esg, color: condition.color, icon: <Zap size={12} /> },
              { label: "Carbon Load", value: carbon, color: "#f43f5e", icon: <Leaf size={12} /> },
              { label: "CSR Impact", value: csr, color: "#10b981", icon: <Users size={12} /> },
            ].map((s) => (
              <motion.div
                key={s.label}
                className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(8,12,20,0.85)", border: `1px solid ${s.color}20`, backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="font-orbitron text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-xs text-slate-500 mb-0.5">/100</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 mt-1.5">
                  <motion.div
                    className="h-1 rounded-full"
                    style={{ background: s.color }}
                    animate={{ width: `${s.value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Slider Controls (bottom) ── */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Toggle button */}
          <div className="flex justify-center mb-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-slate-400"
              style={{ background: "rgba(8,12,20,0.7)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
            >
              {showControls ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              {showControls ? "Hide controls" : "Show controls"}
            </button>
          </div>

          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl px-5 py-4"
                style={{ background: "rgba(8,12,20,0.90)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
              >
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-4 text-center">
                  🎛️ Adjust ESG Values — Watch Earth Change
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { label: "🌍 ESG Score", value: esg, set: setEsg, color: "#10b981", hint: "Overall sustainability health" },
                    { label: "💨 Carbon Emission", value: carbon, set: setCarbon, color: "#f43f5e", hint: "Higher = more pollution" },
                    { label: "🌱 CSR Activity", value: csr, set: setCSR, color: "#06b6d4", hint: "Higher = greener planet" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-300">{s.label}</span>
                        <span className="font-orbitron text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={s.value}
                        onChange={(e) => s.set(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(90deg, ${s.color} ${s.value}%, rgba(255,255,255,0.06) ${s.value}%)`,
                          accentColor: s.color,
                        }}
                      />
                      <p className="text-[10px] text-slate-600 mt-1">{s.hint}</p>
                    </div>
                  ))}
                </div>

                {/* Quick presets */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                  <span className="text-xs text-slate-600 mr-1">Presets:</span>
                  {[
                    { label: "🌿 Thriving", vals: [90, 10, 90] },
                    { label: "⚠️ Struggling", vals: [45, 65, 30] },
                    { label: "💀 Critical", vals: [15, 90, 10] },
                    { label: "📊 Baseline", vals: [72, 45, 60] },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => { setEsg(p.vals[0]); setCarbon(p.vals[1]); setCSR(p.vals[2]); }}
                      className="text-xs px-3 py-1 rounded-full border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/25 transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Hint overlay ── */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-[180px] pointer-events-none z-5">
        <p className="text-[10px] text-slate-600 text-center">
          🖱️ Drag to rotate · Scroll to zoom · Drag sliders to change Earth
        </p>
      </div>
    </div>
  );
}

// ── Standalone full-page wrapper ──────────────────────────────────────────────
export default function EarthPage() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <EarthVisualizer isFullPage />
    </div>
  );
}
