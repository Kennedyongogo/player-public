import { useRef, useEffect, useState } from "react";
import { Box } from "@mui/material";
import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  MeshPhysicalMaterial,
  Color,
  Object3D,
  InstancedMesh,
  PMREMGenerator,
  SphereGeometry,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const GOLD_COLORS = ["#F5C518", "#FFE566", "#C9A000", "#FF9F1C", "#E6B800", "#D4A017"];

const DEFAULT_CONFIG = {
  count: 160,
  colors: GOLD_COLORS,
  materialParams: {
    metalness: 0.75,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.85,
    emissive: 0x3d3200,
    emissiveIntensity: 0.15,
  },
  minSize: 0.3,
  maxSize: 0.85,
  size0: 1,
  gravity: 0.4,
  friction: 0.995,
  wallBounce: 0.2,
  maxVelocity: 0.1,
  maxX: 10,
  maxY: 10,
  maxZ: 10,
  controlSphere0: true,
  followCursor: true,
  lightIntensity: 3.5,
  ambientIntensity: 1.1,
};

function createEnvMap() {
  const pmremRenderer = new WebGLRenderer({ antialias: false, alpha: true });
  pmremRenderer.setSize(32, 32);
  pmremRenderer.setClearColor(0x050508, 1);
  const pmrem = new PMREMGenerator(pmremRenderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(pmremRenderer)).texture;
  pmrem.dispose();
  pmremRenderer.dispose();
  return envTexture;
}

class SceneHost {
  constructor(canvas) {
    this.canvas = canvas;
    this.camera = new PerspectiveCamera(50, 1, 0.1, 100);
    this.scene = new Scene();
    this.scene.background = new Color(0x050508);

    this.renderer = new WebGLRenderer({
      canvas,
      powerPreference: "high-performance",
      alpha: false,
      antialias: true,
    });
    this.renderer.setClearColor(0x050508, 1);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.onBeforeRender = () => {};
    this.onAfterResize = () => {};
    this.onFirstRender = () => {};
    this.clock = new Clock();
    this.animationFrameId = 0;
    this.isRunning = false;

    this.boundResize = this.scheduleResize.bind(this);
    const parent = canvas.parentNode;
    if (parent) {
      this.resizeObserver = new ResizeObserver(this.boundResize);
      this.resizeObserver.observe(parent);
    } else {
      window.addEventListener("resize", this.boundResize);
    }

    this.resize();
  }

  scheduleResize() {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.resize(), 50);
  }

  resize() {
    const parent = this.canvas.parentNode;
    const w = parent?.offsetWidth || window.innerWidth;
    const h = parent?.offsetHeight || window.innerHeight;
    if (w < 1 || h < 1) return;

    this.size = { width: w, height: h, ratio: w / h };
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const fovRad = (this.camera.fov * Math.PI) / 180;
    this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.z;
    this.size.wWidth = this.size.wHeight * (w / h);
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.onAfterResize(this.size);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    let first = true;
    const tick = () => {
      this.animationFrameId = requestAnimationFrame(tick);
      const delta = Math.min(this.clock.getDelta(), 0.05);
      this.renderer.setClearColor(0x050508, 1);
      this.renderer.clear();
      this.onBeforeRender({ delta });
      this.renderer.render(this.scene, this.camera);
      if (first) {
        first = false;
        this.onFirstRender();
      }
    };
    tick();
  }

  stop() {
    if (!this.isRunning) return;
    cancelAnimationFrame(this.animationFrameId);
    this.isRunning = false;
    this.clock.stop();
  }

  dispose() {
    this.stop();
    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.boundResize);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.scene.clear();
    this.renderer.dispose();
  }
}

class BallPhysics {
  constructor(config) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count);
    this.velocityData = new Float32Array(3 * config.count);
    this.sizeData = new Float32Array(config.count);
    this.center = new Vector3();
    this.initPositions();
    this.setSizes();
  }

  initPositions() {
    const { count, maxX, maxY, maxZ } = this.config;
    this.center.toArray(this.positionData, 0);
    for (let i = 1; i < count; i += 1) {
      const idx = 3 * i;
      this.positionData[idx] = MathUtils.randFloatSpread(2 * maxX);
      this.positionData[idx + 1] = MathUtils.randFloatSpread(2 * maxY);
      this.positionData[idx + 2] = MathUtils.randFloatSpread(2 * maxZ);
    }
  }

  setSizes() {
    const { count, size0, minSize, maxSize } = this.config;
    this.sizeData[0] = size0;
    for (let i = 1; i < count; i += 1) {
      this.sizeData[i] = MathUtils.randFloat(minSize, maxSize);
    }
  }

  update({ delta }) {
    const { config, center, positionData, sizeData, velocityData } = this;
    const startIdx = config.controlSphere0 ? 1 : 0;

    if (config.controlSphere0) {
      new Vector3().fromArray(positionData, 0).lerp(center, 0.1).toArray(positionData, 0);
      new Vector3(0, 0, 0).toArray(velocityData, 0);
    }

    for (let i = startIdx; i < config.count; i += 1) {
      const base = 3 * i;
      const pos = new Vector3().fromArray(positionData, base);
      const vel = new Vector3().fromArray(velocityData, base);

      vel.y -= delta * config.gravity * sizeData[i];
      vel.multiplyScalar(config.friction);
      vel.clampLength(0, config.maxVelocity);
      pos.add(vel);

      for (let j = i + 1; j < config.count; j += 1) {
        const otherBase = 3 * j;
        const otherPos = new Vector3().fromArray(positionData, otherBase);
        const diff = new Vector3().subVectors(otherPos, pos);
        const dist = diff.length();
        const sumRadius = sizeData[i] + sizeData[j];
        if (dist < sumRadius && dist > 0) {
          const overlap = (sumRadius - dist) * 0.5;
          diff.normalize();
          pos.addScaledVector(diff, -overlap);
          otherPos.addScaledVector(diff, overlap);
          pos.toArray(positionData, base);
          otherPos.toArray(positionData, otherBase);
        }
      }

      if (Math.abs(pos.x) + sizeData[i] > config.maxX) {
        pos.x = Math.sign(pos.x) * (config.maxX - sizeData[i]);
        vel.x *= -config.wallBounce;
      }
      if (pos.y - sizeData[i] < -config.maxY) {
        pos.y = -config.maxY + sizeData[i];
        vel.y *= -config.wallBounce;
      }
      if (Math.abs(pos.z) + sizeData[i] > config.maxZ) {
        pos.z = Math.sign(pos.z) * (config.maxZ - sizeData[i]);
        vel.z *= -config.wallBounce;
      }

      pos.toArray(positionData, base);
      vel.toArray(velocityData, base);
    }
  }
}

const dummy = new Object3D();

class BallpitMesh extends InstancedMesh {
  constructor(scene, params) {
    const envTexture = createEnvMap();
    const geometry = new SphereGeometry(1, 28, 28);
    const material = new MeshPhysicalMaterial({
      envMap: envTexture,
      ...params.materialParams,
    });
    super(geometry, material, params.count);

    this.config = params;
    this.physics = new BallPhysics(params);
    this.setColors(params.colors);

    scene.add(new AmbientLight(0xfff0cc, params.ambientIntensity));
    this.light = new PointLight(0xffe566, params.lightIntensity, 120, 1);
    scene.add(this.light);

    this.syncMatrices();
  }

  setColors(colors) {
    const colorObjs = colors.map((c) => (c instanceof Color ? c : new Color(c)));
    for (let i = 0; i < this.count; i += 1) {
      this.setColorAt(i, colorObjs[i % colorObjs.length]);
    }
    if (this.instanceColor) this.instanceColor.needsUpdate = true;
  }

  syncMatrices() {
    for (let i = 0; i < this.count; i += 1) {
      dummy.position.fromArray(this.physics.positionData, 3 * i);
      dummy.scale.setScalar(this.physics.sizeData[i]);
      dummy.updateMatrix();
      this.setMatrixAt(i, dummy.matrix);
    }
    this.instanceMatrix.needsUpdate = true;
  }

  update(deltaInfo) {
    this.physics.update(deltaInfo);
    this.syncMatrices();
    if (this.config.controlSphere0) {
      this.light.position.fromArray(this.physics.positionData, 0);
    }
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.material.envMap?.dispose();
  }
}

const pointer = new Vector2(0, 0);

function onPointerMove(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
}

export default function BallpitBackground({ sx }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let host = null;
    let spheres = null;
    let outerRaf = 0;
    let innerRaf = 0;

    const init = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const config = {
        ...DEFAULT_CONFIG,
        count: isMobile ? 90 : DEFAULT_CONFIG.count,
      };

      host = new SceneHost(canvas);
      host.camera.position.set(0, 0, 20);

      spheres = new BallpitMesh(host.scene, config);
      host.scene.add(spheres);

      const raycaster = new Raycaster();
      const plane = new Plane(new Vector3(0, 0, 1), 0);
      const hit = new Vector3();

      const applyBounds = (size) => {
        if (!size?.wWidth) return;
        spheres.physics.config.maxX = size.wWidth / 2;
        spheres.physics.config.maxY = size.wHeight / 2;
        spheres.physics.config.maxZ = size.wWidth / 4;
      };

      applyBounds(host.size);
      host.resize();

      window.addEventListener("pointermove", onPointerMove);

      host.onBeforeRender = (deltaInfo) => {
        raycaster.setFromCamera(pointer, host.camera);
        if (raycaster.ray.intersectPlane(plane, hit)) {
          spheres.physics.center.copy(hit);
        }
        spheres.update(deltaInfo);
      };

      host.onAfterResize = applyBounds;

      host.onFirstRender = () => setReady(true);
      host.start();
    };

    outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(init);
    });

    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
      window.removeEventListener("pointermove", onPointerMove);
      spheres?.dispose();
      host?.dispose();
    };
  }, []);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        bgcolor: "#050508",
        ...sx,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
          background: "#050508",
          opacity: ready ? 1 : 0,
          transition: ready ? "opacity 0.25s ease" : "none",
        }}
      />
    </Box>
  );
}
