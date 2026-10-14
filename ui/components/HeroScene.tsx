"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Full-bleed engineered-cosmic field behind the marketing hero (DESIGN.md accents). */
export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = () => mount.clientWidth || window.innerWidth;
    const h = () => mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.045);

    const camera = new THREE.PerspectiveCamera(48, w() / h(), 0.1, 100);
    camera.position.set(0, 0.35, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w(), h());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    // Outer wire gate — torus knot as abstract “idempotency ring”
    const gateGeo = new THREE.TorusKnotGeometry(1.35, 0.28, 180, 24, 2, 3);
    const gateMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.rotation.x = 0.55;
    root.add(gate);

    // Inner ring — sunset accent
    const ringGeo = new THREE.TorusGeometry(1.85, 0.012, 16, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff7a17,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    root.add(ring);

    // Soft dusk core glow (sprite-like via low-poly sphere)
    const coreGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    root.add(core);

    // Particle field — claim tokens drifting
    const COUNT = 900;
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
      size: 0.028,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    root.add(points);

    // Orbiting claim nodes
    const nodes = new THREE.Group();
    root.add(nodes);
    const nodeMats = [0xff7a17, 0xc4b5fd, 0xa0c3ec].map(
      (c) =>
        new THREE.MeshBasicMaterial({
          color: c,
          transparent: true,
          opacity: 0.9,
        }),
    );
    for (let i = 0; i < 8; i++) {
      const n = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), nodeMats[i % nodeMats.length]);
      nodes.add(n);
    }

    let raf = 0;
    let running = true;
    const clock = new THREE.Clock();
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    mount.addEventListener("pointermove", onMove);

    const onResize = () => {
      const width = w();
      const height = h();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const dt = reduced ? 0 : 1;

      pointer.x += (target.x - pointer.x) * 0.04;
      pointer.y += (target.y - pointer.y) * 0.04;

      root.rotation.y = t * 0.12 * dt + pointer.x * 0.25;
      root.rotation.x = 0.18 + pointer.y * 0.12;
      gate.rotation.z = t * 0.08 * dt;
      core.rotation.y = -t * 0.35 * dt;
      core.rotation.x = t * 0.22 * dt;
      ring.rotation.z = t * 0.18 * dt;

      for (let i = 0; i < nodes.children.length; i++) {
        const node = nodes.children[i];
        const a = t * 0.4 + (i / nodes.children.length) * Math.PI * 2;
        const r = 2.35 + Math.sin(t * 0.7 + i) * 0.15;
        node.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * 0.55, Math.sin(a) * r);
        node.rotation.x = t + i;
        node.rotation.y = t * 0.8;
      }

      if (!reduced) {
        const pos = pointsGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < COUNT; i++) {
          let y = pos.getY(i) + speeds[i] * 0.008;
          if (y > 3.2) y = -3.2;
          pos.setY(i, y);
        }
        pos.needsUpdate = true;
      }

      camera.position.x = pointer.x * 0.35;
      camera.position.y = 0.35 + pointer.y * 0.2;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      mount.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      gateGeo.dispose();
      gateMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      nodeMats.forEach((m) => m.dispose());
      nodes.children.forEach((c) => {
        const m = c as THREE.Mesh;
        (m.geometry as THREE.BufferGeometry)?.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-auto absolute inset-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
