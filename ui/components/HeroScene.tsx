"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Full-bleed Three.js claim-field behind the marketing hero.
 * Self-contained (no GSAP) so missing deps / ScrollTrigger races cannot blank the canvas.
 */
export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let visible = true;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.04);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0.35, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const gateGeo = new THREE.TorusKnotGeometry(1.35, 0.28, 160, 20, 2, 3);
    const gateMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.rotation.x = 0.55;
    root.add(gate);

    const ringGeo = new THREE.TorusGeometry(1.85, 0.014, 16, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff7a17,
      transparent: true,
      opacity: 0.9,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    root.add(ring);

    const coreGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    root.add(core);

    const COUNT = window.innerWidth < 768 ? 420 : 780;
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = 2.2 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      positions[i * 3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.15 + Math.random() * 0.45;
    }
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({
      color: 0xa0c3ec,
      size: 0.03,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    root.add(points);

    const nodes = new THREE.Group();
    root.add(nodes);
    const nodeGeo = new THREE.OctahedronGeometry(0.065, 0);
    const nodeMats = [0xff7a17, 0xc4b5fd, 0xa0c3ec].map(
      (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.95 }),
    );
    for (let i = 0; i < 8; i++) {
      nodes.add(new THREE.Mesh(nodeGeo, nodeMats[i % nodeMats.length]));
    }

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const clock = new THREE.Clock();
    // Intro settle (manual, no GSAP)
    let intro = reduced ? 1 : 0;

    const resize = () => {
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      if (width < 2 || height < 2) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
    };

    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      pointer.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (!visible || width < 2 || height < 2) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      if (!reduced) intro = Math.min(1, intro + dt * 0.55);

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      const t = clock.elapsedTime;
      const s = 0.55 + intro * 0.45;
      root.scale.setScalar(s);
      root.rotation.y = t * 0.12 * (reduced ? 0 : 1) + pointer.x * 0.28;
      root.rotation.x = 0.18 + pointer.y * 0.14;
      gate.rotation.z = t * 0.08;
      core.rotation.y = -t * 0.35;
      core.rotation.x = t * 0.22;
      ring.rotation.z = t * 0.18;

      gateMat.opacity = 0.22 * intro;
      ringMat.opacity = 0.9 * intro;
      coreMat.opacity = 0.4 * intro;
      pointsMat.opacity = 0.75 * intro;

      for (let i = 0; i < nodes.children.length; i++) {
        const node = nodes.children[i];
        const a = t * 0.4 + (i / nodes.children.length) * Math.PI * 2;
        const r = 2.35 + Math.sin(t * 0.7 + i) * 0.15;
        node.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * 0.55, Math.sin(a) * r);
        node.rotation.x = t + i;
        node.rotation.y = t * 0.8;
        node.scale.setScalar(Math.max(0.001, intro));
      }

      if (!reduced) {
        const pos = pointsGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < COUNT; i++) {
          let y = pos.getY(i) + speeds[i] * 0.01;
          if (y > 3.2) y = -3.2;
          pos.setY(i, y);
        }
        pos.needsUpdate = true;
      }

      camera.position.x = pointer.x * 0.4;
      camera.position.y = 0.35 + pointer.y * 0.22;
      camera.position.z = 7.4 - intro * 1.2;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(mount);

    // Observe the hero section (parent), not the absolute child — avoids 0-size false negatives.
    const ioTarget = mount.parentElement ?? mount;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    io.observe(ioTarget);

    window.addEventListener("pointermove", onMove, { passive: true });

    resize();
    // Retry size once after layout (absolute children can report 0 on first paint)
    const layoutTimer = window.setTimeout(() => resize(), 50);
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(layoutTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      gateGeo.dispose();
      gateMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      nodeGeo.dispose();
      nodeMats.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-0 h-full min-h-[min(100vh,920px)] w-full overflow-hidden"
      aria-hidden="true"
    />
  );
}
