"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* -------------------------------------------------------------------------- */
/* Constants & types                                                           */
/* -------------------------------------------------------------------------- */

const SW = 1024; // screen canvas size
const SH = 640;
const LANE_Y = -2.15; // "network lane" under the computer
const LANE_Z = 0.3;
const LX = { client: -4.3, gate: -1.9, api: 3.3 };

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
const mono = (size: number, weight = 500) => `${weight} ${size}px ${MONO}`;

const C = {
  bg: "#08080a",
  panel: "#101014",
  line: "#25252d",
  text: "#ececf1",
  dim: "#8a8a95",
  orange: "#ff7a17",
  violet: "#c4b5fd",
  blue: "#a0c3ec",
  green: "#4ade80",
  red: "#ff5c5c",
  amber: "#fbbf24",
};

/** Click vào các phần tử này sẽ KHÔNG kích hoạt demo trên màn hình. */
const INTERACTIVE = "a,button,input,textarea,select,label,[data-no-burst]";

type BtnId = "new" | "retry" | "race" | "tamper" | "gate" | "reset";
type Tone = "ok" | "info" | "warn" | "err";
type PKind = "req" | "claim" | "replay" | "ok" | "err";
type Outcome = "claim" | "passthrough" | "replay" | "conflict" | "mismatch";
type BaseReq = { key: string; amount: number; fp: string };
type Req = BaseReq & { id: number };
type LogEntry = { id: number; status: number; label: string; note: string; tone: Tone; t: number };
type Packet = { mesh: THREE.Mesh; spr: THREE.Sprite };
type PopEntry = { s: THREE.Sprite; mat: THREE.SpriteMaterial; tex: THREE.Texture };
type StoreEntry = { status: "IN_FLIGHT" | "COMPLETED"; fp: string };

const BTNS: { id: BtnId; label: string; x: number; y: number; w: number; h: number }[] = [
  { id: "new", label: "NEW PAYMENT", x: 24, y: 536, w: 200, h: 52 },
  { id: "retry", label: "RETRY", x: 236, y: 536, w: 140, h: 52 },
  { id: "race", label: "RACE ×3", x: 388, y: 536, w: 150, h: 52 },
  { id: "tamper", label: "TAMPER", x: 550, y: 536, w: 140, h: 52 },
  { id: "gate", label: "GATE", x: 714, y: 536, w: 170, h: 52 },
  { id: "reset", label: "RESET", x: 896, y: 536, w: 104, h: 52 },
];

const SCRIPT: BtnId[] = ["new", "retry", "retry", "tamper", "race", "retry"];

const TONE_COLOR: Record<Tone, string> = {
  ok: C.green,
  info: C.violet,
  warn: C.amber,
  err: C.red,
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

const hex = (n: number) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,160,80,0.9)");
  g.addColorStop(0.25, "rgba(124,58,237,0.45)");
  g.addColorStop(1, "rgba(10,10,10,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeDotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeLabel(text: string, color: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const g = c.getContext("2d")!;
  g.font = mono(34, 600);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = color;
  g.fillText(text, 256, 48);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    fog: false,
    opacity: 0,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.5, 0.28, 1);
  return { sprite, mat, tex };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

type Props = {
  /** "right": máy tính lệch phải để chừa chỗ cho headline bên trái (màn hình rộng). */
  placement?: "center" | "right";
};

/**
 * Hero 3D: một chiếc máy tính tương tác được, chạy demo IdemGate ngay trên màn hình.
 *
 *  client ──▶ [ IdemGate ] ──▶ your API
 *
 *  - NEW PAYMENT : key mới → gate "claim" key → API charge 1 lần → 201
 *  - RETRY       : cùng key + body → gate trả lại response đã cache (200), API không bị gọi
 *  - RACE ×3     : 3 request đồng thời cùng key → 1 request đi qua, 2 request nhận 409
 *  - TAMPER      : cùng key nhưng body khác → 422 (key reuse)
 *  - GATE ON/OFF : tắt gate để thấy double-charge xảy ra như thế nào
 *
 * Tự chạy demo khi idle, dừng khi người dùng tương tác, tự chạy lại sau 14s.
 * Section chứa component này cần `position: relative` (cũng là trigger cho scroll).
 */
export function HeroScene({ placement = "center" }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = !reduced;
    const w = () => mount.clientWidth || window.innerWidth;
    const h = () => mount.clientHeight || window.innerHeight;

    const disposables: { dispose: () => void }[] = [];
    const own = <T extends { dispose: () => void }>(o: T): T => {
      disposables.push(o);
      return o;
    };

    /* ---------------------------------------------------------------- */
    /* Renderer / scene / camera                                         */
    /* ---------------------------------------------------------------- */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.03);

    const camera = new THREE.PerspectiveCamera(40, w() / h(), 0.1, 100);
    camera.position.set(0, 0.35, 9);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w(), h());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x6a6a80, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 4, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0xff7a17, 35, 16, 2);
    rim.position.set(-3.5, 1.5, -1.5);
    scene.add(rim);
    const violet = new THREE.PointLight(0x7c3aed, 30, 16, 2);
    violet.position.set(4, 2.5, 2);
    scene.add(violet);

    const field = new THREE.Group(); // bụi hạt phía sau
    scene.add(field);
    const stage = new THREE.Group(); // máy tính + lane
    scene.add(stage);

    /* ---------------------------------------------------------------- */
    /* Screen (canvas texture)                                           */
    /* ---------------------------------------------------------------- */
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = SW;
    screenCanvas.height = SH;
    const sctx = screenCanvas.getContext("2d")!;
    const screenTex = own(new THREE.CanvasTexture(screenCanvas));
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const overlay = document.createElement("canvas"); // scanlines + vignette, vẽ 1 lần
    overlay.width = SW;
    overlay.height = SH;
    {
      const og = overlay.getContext("2d")!;
      og.fillStyle = "rgba(255,255,255,0.03)";
      for (let y = 0; y < SH; y += 3) og.fillRect(0, y, SW, 1);
      const v = og.createRadialGradient(SW / 2, SH / 2, SH * 0.4, SW / 2, SH / 2, SH * 0.9);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,0.5)");
      og.fillStyle = v;
      og.fillRect(0, 0, SW, SH);
    }

    /* ---------------------------------------------------------------- */
    /* Computer: monitor + stand + keyboard                              */
    /* ---------------------------------------------------------------- */
    const mon = new THREE.Group();
    mon.position.set(0, 0.5, 0);
    stage.add(mon);

    const bodyMat = own(
      new THREE.MeshStandardMaterial({ color: 0x131317, roughness: 0.5, metalness: 0.65 }),
    );
    const bodyGeo = own(new RoundedBoxGeometry(3.9, 2.55, 0.28, 4, 0.09));
    mon.add(new THREE.Mesh(bodyGeo, bodyMat));

    const screenGeo = own(new THREE.PlaneGeometry(3.6, 2.25));
    const screenMat = own(
      new THREE.MeshBasicMaterial({
        map: screenTex,
        toneMapped: false,
        fog: false,
        transparent: true,
        opacity: 0,
      }),
    );
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.142;
    mon.add(screen);

    const frameGeo = own(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.82, -1.145, 0.146),
        new THREE.Vector3(1.82, -1.145, 0.146),
        new THREE.Vector3(1.82, 1.145, 0.146),
        new THREE.Vector3(-1.82, 1.145, 0.146),
      ]),
    );
    const frameMat = own(
      new THREE.LineBasicMaterial({ color: 0xff7a17, transparent: true, opacity: 0 }),
    );
    mon.add(new THREE.LineLoop(frameGeo, frameMat));

    const neckGeo = own(new THREE.BoxGeometry(0.34, 0.5, 0.18));
    const neck = new THREE.Mesh(neckGeo, bodyMat);
    neck.position.set(0, -1.52, -0.05);
    mon.add(neck);

    const baseGeo = own(new RoundedBoxGeometry(1.8, 0.07, 1.0, 3, 0.03));
    const base = new THREE.Mesh(baseGeo, bodyMat);
    base.position.set(0, -1.78, 0.1);
    mon.add(base);

    const powerGeo = own(new THREE.SphereGeometry(0.028, 12, 12));
    const powerMat = own(new THREE.MeshBasicMaterial({ color: 0xff7a17, transparent: true }));
    const power = new THREE.Mesh(powerGeo, powerMat);
    power.position.set(1.7, -1.2, 0.15);
    mon.add(power);

    // Keyboard
    const kb = new THREE.Group();
    kb.position.set(0, -1.6, 1.2);
    kb.rotation.x = 0.4;
    stage.add(kb);

    const plateGeo = own(new RoundedBoxGeometry(3.3, 0.08, 1.12, 3, 0.03));
    kb.add(new THREE.Mesh(plateGeo, bodyMat));

    const COLS = 14;
    const ROWS = 4;
    const NKEYS = COLS * ROWS;
    const keyGeo = own(new THREE.BoxGeometry(0.19, 0.05, 0.19));
    const keyMat = own(
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.3 }),
    );
    const keys = new THREE.InstancedMesh(keyGeo, keyMat, NKEYS);
    keys.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    own(keys);
    const kx = new Float32Array(NKEYS);
    const kz = new Float32Array(NKEYS);
    const keyLevel = new Float32Array(NKEYS);
    const keyBase = new THREE.Color(0x1b1b21);
    const keyHot = new THREE.Color(0xff7a17);
    const tmpCol = new THREE.Color();
    const dummy = new THREE.Object3D();
    for (let i = 0; i < NKEYS; i++) {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      kx[i] = (c - (COLS - 1) / 2) * 0.22;
      kz[i] = (r - (ROWS - 1) / 2) * 0.22;
      dummy.position.set(kx[i], 0.065, kz[i]);
      dummy.updateMatrix();
      keys.setMatrixAt(i, dummy.matrix);
      keys.setColorAt(i, keyBase);
    }
    kb.add(keys);
    let kbActive = false;
    const pressKeys = (n: number) => {
      for (let i = 0; i < n; i++) keyLevel[Math.floor(Math.random() * NKEYS)] = 1;
      kbActive = true;
    };

    // Back glow
    const glowTex = own(makeGlowTexture());
    const glowMat = own(
      new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    );
    const glow = new THREE.Sprite(glowMat);
    glow.scale.setScalar(11);
    glow.position.set(0, 0.4, -1.6);
    stage.add(glow);

    /* ---------------------------------------------------------------- */
    /* Network lane: client → IdemGate → your API                        */
    /* ---------------------------------------------------------------- */
    const laneGeo = own(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-4.8, LANE_Y, LANE_Z),
        new THREE.Vector3(4.6, LANE_Y, LANE_Z),
      ]),
    );
    const laneMat = own(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
    stage.add(new THREE.Line(laneGeo, laneMat));

    // Client node
    const clientNode = new THREE.Group();
    clientNode.position.set(LX.client, LANE_Y, LANE_Z);
    const clientGeo = own(new THREE.OctahedronGeometry(0.22, 0));
    const clientMat = own(
      new THREE.MeshBasicMaterial({ color: 0xa0c3ec, wireframe: true, transparent: true, opacity: 0.9 }),
    );
    const clientMesh = new THREE.Mesh(clientGeo, clientMat);
    clientNode.add(clientMesh);
    stage.add(clientNode);

    // IdemGate (hoop + torus knot, trục dọc theo lane)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(LX.gate, LANE_Y, LANE_Z);
    const gateRot = new THREE.Group();
    gateRot.rotation.y = Math.PI / 2;
    gateGroup.add(gateRot);
    const hoopGeo = own(new THREE.TorusGeometry(0.58, 0.022, 16, 96));
    const hoopMat = own(new THREE.MeshBasicMaterial({ color: 0xff7a17, transparent: true, opacity: 0 }));
    gateRot.add(new THREE.Mesh(hoopGeo, hoopMat));
    const knotGeo = own(new THREE.TorusKnotGeometry(0.4, 0.07, 110, 10, 2, 3));
    const knotMat = own(
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0 }),
    );
    const knot = new THREE.Mesh(knotGeo, knotMat);
    gateRot.add(knot);
    stage.add(gateGroup);
    const colOn = new THREE.Color(0xff7a17);
    const colOff = new THREE.Color(0xff5c5c);
    const flashCol = new THREE.Color(0xff7a17);

    // API node: server rack
    const apiGroup = new THREE.Group();
    apiGroup.position.set(LX.api, LANE_Y, LANE_Z);
    const slabGeo = own(new THREE.BoxGeometry(0.9, 0.2, 0.55));
    const slabEdges = own(new THREE.EdgesGeometry(slabGeo));
    const slabLineMat = own(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }));
    const ledGeo = own(new THREE.BoxGeometry(0.07, 0.05, 0.02));
    const ledMat = own(new THREE.MeshBasicMaterial({ color: 0x4ade80 }));
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * 0.26;
      const slab = new THREE.Mesh(slabGeo, bodyMat);
      slab.position.y = y;
      apiGroup.add(slab);
      const edge = new THREE.LineSegments(slabEdges, slabLineMat);
      edge.position.y = y;
      apiGroup.add(edge);
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(-0.33, y, 0.285);
      apiGroup.add(led);
    }
    stage.add(apiGroup);
    const ledIdle = new THREE.Color(0x4ade80);
    const ledBusy = new THREE.Color(0xff7a17);

    // Labels
    const labels = [
      { ...makeLabel("CLIENT", "#a0a0aa"), x: LX.client },
      { ...makeLabel("IDEMGATE", "#ff7a17"), x: LX.gate },
      { ...makeLabel("YOUR API", "#a0a0aa"), x: LX.api },
    ];
    labels.forEach((l) => {
      l.sprite.position.set(l.x, LANE_Y - 0.72, LANE_Z + 0.1);
      stage.add(l.sprite);
      own(l.mat);
      own(l.tex);
    });

    /* ---------------------------------------------------------------- */
    /* Packets                                                           */
    /* ---------------------------------------------------------------- */
    const dotTex = own(makeDotTexture());
    const packetGeo = own(new THREE.OctahedronGeometry(0.1, 0));
    const pkColors: Record<PKind, number> = {
      req: 0xe8e8f0,
      claim: 0xff7a17,
      replay: 0xc4b5fd,
      ok: 0x4ade80,
      err: 0xff5c5c,
    };
    const PK = {} as Record<PKind, { mesh: THREE.MeshBasicMaterial; spr: THREE.SpriteMaterial }>;
    (Object.keys(pkColors) as PKind[]).forEach((k) => {
      PK[k] = {
        mesh: own(new THREE.MeshBasicMaterial({ color: pkColors[k] })),
        spr: own(
          new THREE.SpriteMaterial({
            map: dotTex,
            color: pkColors[k],
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            fog: false,
          }),
        ),
      };
    });
    const packets = new Set<Packet>();
    const pops = new Set<PopEntry>();

    const makePacket = (kind: PKind, x: number, visible: boolean): Packet => {
      const mesh = new THREE.Mesh(packetGeo, PK[kind].mesh);
      const spr = new THREE.Sprite(PK[kind].spr);
      spr.scale.setScalar(0.75);
      mesh.add(spr);
      mesh.position.set(x, LANE_Y, LANE_Z);
      mesh.scale.setScalar(0.0001);
      mesh.visible = visible;
      stage.add(mesh);
      const p = { mesh, spr };
      packets.add(p);
      return p;
    };
    const recolor = (p: Packet, kind: PKind) => {
      p.mesh.material = PK[kind].mesh;
      p.spr.material = PK[kind].spr;
    };
    const removePacket = (p: Packet) => {
      stage.remove(p.mesh);
      packets.delete(p);
    };

    /* ---------------------------------------------------------------- */
    /* Particles                                                         */
    /* ---------------------------------------------------------------- */
    const COUNT = window.innerWidth < 768 ? 450 : 800;
    const home = new Float32Array(COUNT * 3);
    const off = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = 3.5 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      home[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.3;
      home[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      home[i * 3 + 2] = r * Math.cos(phi) - 3;
      positions[i * 3] = home[i * 3];
      positions[i * 3 + 1] = home[i * 3 + 1];
      positions[i * 3 + 2] = home[i * 3 + 2];
      speeds[i] = 0.15 + Math.random() * 0.45;
    }
    const pointsGeo = own(new THREE.BufferGeometry());
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pointsMat = own(
      new THREE.PointsMaterial({
        color: 0xa0c3ec,
        size: 0.03,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      }),
    );
    const points = new THREE.Points(pointsGeo, pointsMat);
    field.add(points);

    /* ---------------------------------------------------------------- */
    /* Animated state                                                    */
    /* ---------------------------------------------------------------- */
    const intro = animate ? { dolly: 5, spin: 1.6, scale: 0.6 } : { dolly: 0, spin: 0, scale: 1 };
    const rv = animate
      ? { mon: 0, kb: 0, lane: 0, points: 0, glow: 0 }
      : { mon: 1, kb: 1, lane: 1, points: 1, glow: 1 };
    const fx = { hover: 0, gate: 1, flash: 0, busy: 0, burst: 0, client: 0 };
    const scr = { p: 0 };
    const pointer = { x: 0, y: 0 };
    const ui = {
      boot: animate ? 0 : 1,
      caret: true,
      animUntil: 0,
      pressed: null as { id: BtnId; t: number } | null,
    };

    /* ---------------------------------------------------------------- */
    /* Demo state (the "real" idempotency logic)                         */
    /* ---------------------------------------------------------------- */
    const store = new Map<string, StoreEntry>();
    const stats = { requests: 0, charges: 0, total: 0, orders: 0 };
    const logs: LogEntry[] = [];
    const view = { req: null as BaseReq | null, tampered: false };
    let last: BaseReq | null = null;
    let reqSeq = 0;
    let gateOn = true;
    let dirty = true;
    let booted = !animate;
    let autoplay = animate;
    let lastUser = performance.now();
    let autoClock = 0;
    let autoAt = 0;
    let scriptI = 0;
    let hoverBtn: BtnId | null = null;
    let screenHover = false;
    let lastDraw = 0;
    let baseZ = 9;
    let baseYaw = 0;

    /* ---- animation registry (để reset / cleanup kill sạch) ---- */
    const anims = new Set<gsap.core.Animation>();
    const reg = <T extends gsap.core.Animation>(a: T): T => {
      anims.add(a);
      a.then(() => {
        anims.delete(a);
      });
      return a;
    };
    const killAnims = () => {
      anims.forEach((a) => a.kill());
      anims.clear();
    };
    const to = (target: gsap.TweenTarget, vars: gsap.TweenVars) => reg(gsap.to(target, vars));
    const later = (sec: number, fn: () => void) => reg(gsap.delayedCall(sec, fn));

    /* ---- small visual helpers ---- */
    const flash = (hexColor: number, amt = 1) => {
      flashCol.setHex(hexColor);
      gsap.fromTo(
        fx,
        { flash: amt },
        { flash: 0, duration: 0.9, ease: "power2.out", overwrite: "auto" },
      );
    };
    const pulseClient = () => {
      gsap.fromTo(
        fx,
        { client: 1 },
        { client: 0, duration: 0.6, ease: "power2.out", overwrite: "auto" },
      );
    };
    const dissolve = (p: Packet) => {
      to(p.mesh.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.18,
        ease: "power2.in",
        onComplete: () => removePacket(p),
      });
    };
    const disposePop = (e: PopEntry) => {
      stage.remove(e.s);
      e.mat.dispose();
      e.tex.dispose();
      pops.delete(e);
    };
    const spawnPop = (text: string, color: string, x: number) => {
      const c = document.createElement("canvas");
      c.width = 320;
      c.height = 80;
      const g = c.getContext("2d")!;
      g.font = mono(38, 700);
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = color;
      g.shadowColor = color;
      g.shadowBlur = 12;
      g.fillText(text, 160, 40);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        fog: false,
        opacity: 0,
      });
      const s = new THREE.Sprite(mat);
      s.scale.set(1.3, 0.325, 1);
      s.position.set(x, LANE_Y + 0.55, LANE_Z + 0.2);
      stage.add(s);
      const entry: PopEntry = { s, mat, tex };
      pops.add(entry);
      const tl = reg(gsap.timeline({ onComplete: () => disposePop(entry) }));
      tl.to(mat, { opacity: 1, duration: 0.15 })
        .to(s.position, { y: LANE_Y + 1.1, duration: 1.2, ease: "power2.out" }, 0)
        .to(mat, { opacity: 0, duration: 0.5 }, 0.8);
    };
    const gatePop = (text: string, color: string) => spawnPop(text, color, LX.gate);

    const pushLog = (
      status: number,
      label: string,
      note: string,
      tone: Tone,
      id: number,
    ) => {
      logs.unshift({ id, status, label, note, tone, t: performance.now() });
      if (logs.length > 7) logs.length = 7;
      ui.animUntil = performance.now() + 450;
      dirty = true;
    };

    /* ---- idempotency gateway logic ---- */
    const decide = (req: Req): Outcome => {
      if (!gateOn) return "passthrough";
      const e = store.get(req.key);
      if (!e) {
        store.set(req.key, { status: "IN_FLIGHT", fp: req.fp });
        return "claim";
      }
      if (e.fp !== req.fp) return "mismatch";
      if (e.status === "IN_FLIGHT") return "conflict";
      return "replay";
    };

    const backend = (req: Req, gated: boolean) => {
      gsap.to(fx, { busy: 1, duration: 0.2 });
      later(0.9, () => {
        stats.charges++;
        stats.total += req.amount;
        const n = stats.charges;
        const dup = stats.charges > stats.orders;
        gsap.to(fx, { busy: 0, duration: 0.5 });
        spawnPop(`+${money(req.amount)}`, dup ? C.red : C.green, LX.api);
        dirty = true;

        const resp = makePacket(dup ? "err" : "ok", LX.api, true);
        const tl = reg(gsap.timeline());
        tl.to(resp.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.2, ease: "back.out(3)" })
          .to(resp.mesh.position, { x: LX.gate, duration: 0.8, ease: "power1.inOut" }, "<")
          .add(() => {
            if (gated) {
              const e = store.get(req.key);
              if (e) e.status = "COMPLETED";
              flash(0x4ade80, 0.8);
              dirty = true;
            }
          })
          .to(resp.mesh.position, { x: LX.client, duration: 0.8, ease: "power1.out" })
          .add(() => {
            dissolve(resp);
            pulseClient();
            pushLog(
              201,
              "CREATED",
              dup ? `DOUBLE CHARGE · ${money(req.amount)}` : `charge #${n} · ${money(req.amount)}`,
              dup ? "err" : "ok",
              req.id,
            );
          });
      });
    };

    const forward = (req: Req, p: Packet, gated: boolean) => {
      to(p.mesh.position, {
        x: LX.api,
        duration: 0.9,
        ease: "power1.inOut",
        onComplete: () => {
          dissolve(p);
          backend(req, gated);
        },
      });
    };

    const respondReplay = (req: Req) => {
      const r = makePacket("replay", LX.gate, true);
      const tl = reg(gsap.timeline());
      tl.to(r.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.2, ease: "back.out(3)" })
        .to(r.mesh.position, { x: LX.client, duration: 0.9, ease: "power1.out" }, "<")
        .add(() => {
          dissolve(r);
          pulseClient();
          pushLog(200, "REPLAYED", "cached response · API not called", "info", req.id);
        });
    };

    const bounce = (req: Req, p: Packet, kind: "conflict" | "mismatch") => {
      to(p.mesh.position, {
        x: LX.client,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          dissolve(p);
          pulseClient();
          if (kind === "conflict") {
            pushLog(409, "IN_FLIGHT", "original still processing · retry later", "warn", req.id);
          } else {
            pushLog(422, "KEY_REUSED", "same key, different body · rejected", "err", req.id);
          }
        },
      });
    };

    const atGate = (req: Req, p: Packet) => {
      const out = decide(req);
      dirty = true;
      switch (out) {
        case "passthrough":
          forward(req, p, false);
          break;
        case "claim":
          flash(0xff7a17);
          gatePop("CLAIMED", C.orange);
          recolor(p, "claim");
          forward(req, p, true);
          break;
        case "replay":
          flash(0xc4b5fd);
          gatePop("CACHED", C.violet);
          dissolve(p);
          respondReplay(req);
          break;
        case "conflict":
          flash(0xfbbf24);
          gatePop("409", C.amber);
          recolor(p, "err");
          bounce(req, p, "conflict");
          break;
        case "mismatch":
          flash(0xff5c5c);
          gatePop("422", C.red);
          recolor(p, "err");
          bounce(req, p, "mismatch");
          break;
      }
    };

    const sendReq = (base: BaseReq, delay: number) => {
      const req: Req = { ...base, id: ++reqSeq };
      stats.requests++;
      dirty = true;
      const p = makePacket("req", LX.client, false);
      const tl = reg(gsap.timeline({ delay }));
      tl.add(() => {
        p.mesh.visible = true;
        pulseClient();
      })
        .to(p.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.2, ease: "back.out(3)" })
        .to(p.mesh.position, { x: LX.gate, duration: 0.8, ease: "power2.in" }, "<")
        .add(() => atGate(req, p));
    };

    const mkBase = (k: string, amount: number): BaseReq => ({
      key: k,
      amount,
      fp: fnv(`${amount}|usd`),
    });
    const newReq = (): BaseReq => {
      const amounts = [1299, 2450, 4200, 8900];
      return mkBase(`idg_${hex(8)}`, amounts[Math.floor(Math.random() * amounts.length)]);
    };

    const toggleGate = () => {
      gateOn = !gateOn;
      gsap.to(fx, { gate: gateOn ? 1 : 0, duration: 0.7, ease: "power3.out" });
      gatePop(gateOn ? "GATE ON" : "GATE OFF", gateOn ? C.green : C.red);
      flash(gateOn ? 0x4ade80 : 0xff5c5c, 0.6);
      dirty = true;
    };

    const resetAll = () => {
      killAnims();
      packets.forEach((p) => stage.remove(p.mesh));
      packets.clear();
      pops.forEach(disposePop);
      store.clear();
      logs.length = 0;
      last = null;
      view.req = null;
      view.tampered = false;
      stats.requests = 0;
      stats.charges = 0;
      stats.total = 0;
      stats.orders = 0;
      gateOn = true;
      gsap.to(fx, { gate: 1, busy: 0, duration: 0.6 });
      dirty = true;
    };

    const act = (id: BtnId, auto = false) => {
      if (!booted) return;
      if (!auto) {
        autoplay = false;
        lastUser = performance.now();
      }
      pressKeys(id === "race" ? 12 : 6);
      gsap.fromTo(
        fx,
        { burst: 1 },
        { burst: 0, duration: 1.1, ease: "power2.out", overwrite: "auto" },
      );
      switch (id) {
        case "new": {
          const r = newReq();
          last = r;
          view.req = r;
          view.tampered = false;
          stats.orders++;
          sendReq(r, 0);
          break;
        }
        case "retry": {
          const base = last;
          if (!base) {
            act("new", true);
            return;
          }
          view.req = base;
          view.tampered = false;
          sendReq(base, 0);
          break;
        }
        case "race": {
          const r = newReq();
          last = r;
          view.req = r;
          view.tampered = false;
          stats.orders++;
          for (let i = 0; i < 3; i++) sendReq(r, i * 0.16);
          break;
        }
        case "tamper": {
          const base = last;
          if (!base) {
            act("new", true);
            return;
          }
          const r = mkBase(base.key, base.amount === 9900 ? 7700 : 9900);
          view.req = r;
          view.tampered = true;
          sendReq(r, 0);
          break;
        }
        case "gate":
          toggleGate();
          break;
        case "reset":
          resetAll();
          break;
      }
      dirty = true;
    };

    /* ---------------------------------------------------------------- */
    /* Screen drawing                                                    */
    /* ---------------------------------------------------------------- */
    const panel = (g: CanvasRenderingContext2D, x: number, y: number, ww: number, hh: number) => {
      rr(g, x, y, ww, hh, 10);
      g.fillStyle = C.panel;
      g.fill();
      g.lineWidth = 1;
      g.strokeStyle = C.line;
      g.stroke();
    };
    const label = (g: CanvasRenderingContext2D, text: string, x: number, y: number) => {
      g.font = mono(12, 700);
      g.fillStyle = C.dim;
      g.textAlign = "left";
      g.fillText(text, x, y);
    };
    const runs = (
      g: CanvasRenderingContext2D,
      x: number,
      y: number,
      parts: [string, string][],
    ) => {
      let cx = x;
      for (const [t, col] of parts) {
        g.fillStyle = col;
        g.fillText(t, cx, y);
        cx += g.measureText(t).width;
      }
      return cx;
    };

    const drawBoot = (g: CanvasRenderingContext2D) => {
      const lines: [string, string][] = [
        ["", "idemgate 1.0.0 — idempotency gateway"],
        ["[ ok ]", " key store online (ttl 24h)"],
        ["[ ok ]", " request fingerprinting (sha-256)"],
        ["[ ok ]", " in-flight lock manager"],
        ["[ ok ]", " response cache warmed"],
        ["", "gate armed. waiting for traffic"],
      ];
      const n = Math.floor((ui.boot / 0.75) * (lines.length + 0.5));
      g.textAlign = "left";
      g.textBaseline = "middle";
      g.font = mono(20);
      lines.slice(0, n).forEach(([tag, rest], i) => {
        const y = 60 + i * 34;
        if (tag) {
          g.fillStyle = C.green;
          g.fillText(tag, 40, y);
          g.fillStyle = C.dim;
          g.fillText(rest, 40 + g.measureText(tag).width, y);
        } else {
          g.fillStyle = i === 0 ? C.text : C.orange;
          g.fillText(rest, 40, y);
        }
      });
      if (Math.floor(performance.now() / 400) % 2 === 0) {
        g.fillStyle = C.orange;
        g.fillRect(40, 60 + Math.min(n, lines.length) * 34 - 10, 11, 20);
      }
    };

    const drawUI = (g: CanvasRenderingContext2D, now: number) => {
      g.textBaseline = "middle";
      g.textAlign = "left";

      // Top bar
      g.fillStyle = "#0d0d11";
      g.fillRect(0, 0, SW, 44);
      g.fillStyle = C.line;
      g.fillRect(0, 43, SW, 1);
      ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
        g.fillStyle = c;
        g.beginPath();
        g.arc(24 + i * 20, 22, 6, 0, Math.PI * 2);
        g.fill();
      });
      g.font = mono(14);
      g.fillStyle = C.dim;
      g.fillText("idemgate  ·  payments-api  ·  POST /v1/payments", 96, 23);
      rr(g, SW - 176, 10, 152, 25, 12.5);
      g.fillStyle = gateOn ? "rgba(74,222,128,0.12)" : "rgba(255,92,92,0.12)";
      g.fill();
      g.fillStyle = gateOn ? C.green : C.red;
      g.textAlign = "center";
      g.fillText(gateOn ? "● GATE ON" : "○ GATE OFF", SW - 100, 23);
      g.textAlign = "left";

      // REQUEST
      label(g, "REQUEST", 24, 70);
      panel(g, 24, 84, 468, 170);
      g.font = mono(15);
      const r = view.req;
      if (r) {
        runs(g, 44, 112, [
          ["POST ", C.orange],
          ["/v1/payments", C.text],
        ]);
        runs(g, 44, 138, [
          ["Idempotency-Key: ", C.dim],
          [r.key, C.blue],
        ]);
        runs(g, 44, 164, [
          ["Content-Type: ", C.dim],
          ["application/json", C.text],
        ]);
        runs(g, 44, 204, [
          ['{ "amount": ', C.dim],
          [String(r.amount), view.tampered ? C.red : C.amber],
          [', "currency": "usd" }', C.dim],
        ]);
        if (view.tampered) {
          g.font = mono(12, 600);
          g.fillStyle = C.red;
          g.fillText("↑ body modified, same key", 44, 232);
        }
      } else {
        g.fillStyle = C.dim;
        g.fillText("press NEW PAYMENT to send a request", 44, 160);
        if (ui.caret) {
          g.fillStyle = C.orange;
          g.fillRect(44 + g.measureText("press NEW PAYMENT to send a request ").width, 151, 9, 18);
        }
      }

      // KEY STATE
      label(g, "IDEMPOTENCY STATE", 24, 272);
      panel(g, 24, 286, 468, 100);
      if (!gateOn) {
        g.textAlign = "center";
        g.font = mono(14, 700);
        g.fillStyle = C.red;
        g.fillText("gate bypassed", 258, 322);
        g.font = mono(13);
        g.fillStyle = C.dim;
        g.fillText("requests hit your API with no key tracking", 258, 348);
        g.textAlign = "left";
      } else {
        const entry = r ? store.get(r.key) : undefined;
        const st = entry ? entry.status : r ? "UNSEEN" : "—";
        const stCol = st === "IN_FLIGHT" ? C.amber : st === "COMPLETED" ? C.green : C.dim;
        g.font = mono(14);
        g.fillStyle = C.dim;
        g.fillText("key", 44, 312);
        g.fillText("state", 44, 337);
        g.fillText("fingerprint", 44, 362);
        g.fillStyle = C.blue;
        g.fillText(r ? r.key : "—", 170, 312);
        g.fillStyle = stCol;
        g.beginPath();
        g.arc(176, 337, 4, 0, Math.PI * 2);
        g.fill();
        g.font = mono(14, 700);
        g.fillText(st, 190, 337);
        g.font = mono(14);
        g.fillStyle = C.text;
        g.fillText(r ? `sha256:${r.fp}…` : "—", 170, 362);
      }

      // RESPONSES
      label(g, "RESPONSES", 516, 70);
      panel(g, 516, 84, 484, 302);
      if (logs.length === 0) {
        g.textAlign = "center";
        g.font = mono(14);
        g.fillStyle = C.dim;
        g.fillText("no responses yet", 758, 235);
        g.textAlign = "left";
      }
      const base = g.globalAlpha;
      logs.forEach((e, i) => {
        const a = Math.min(1, (now - e.t) / 300);
        const dy = (1 - a) * 10;
        const y = 98 + i * 40 + dy;
        const col = TONE_COLOR[e.tone];
        g.globalAlpha = base * a;
        rr(g, 532, y + 4, 54, 22, 6);
        g.fillStyle = col + "26";
        g.fill();
        g.font = mono(14, 700);
        g.fillStyle = col;
        g.textAlign = "center";
        g.fillText(String(e.status), 559, y + 16);
        g.textAlign = "left";
        g.fillText(e.label, 600, y + 12);
        g.font = mono(12);
        g.fillStyle = C.dim;
        g.fillText(e.note, 600, y + 29);
        g.textAlign = "right";
        g.fillText(`#${String(e.id).padStart(2, "0")}`, 984, y + 12);
        g.textAlign = "left";
      });
      g.globalAlpha = base;

      // STATS
      const dupN = Math.max(0, stats.charges - stats.orders);
      const boxes: { x: number; title: string; val: string; col: string; note: string; noteCol: string }[] = [
        {
          x: 24,
          title: "REQUESTS SENT",
          val: String(stats.requests),
          col: C.text,
          note: "",
          noteCol: C.dim,
        },
        {
          x: 354,
          title: "CHARGES EXECUTED",
          val: String(stats.charges),
          col: dupN > 0 ? C.red : stats.charges > 0 ? C.green : C.text,
          note: `expected ${stats.orders}`,
          noteCol: C.dim,
        },
        {
          x: 684,
          title: "AMOUNT CHARGED",
          val: money(stats.total),
          col: dupN > 0 ? C.red : C.text,
          note: dupN > 0 ? `${dupN} duplicate ✗` : stats.charges > 0 ? "exactly-once ✓" : "",
          noteCol: dupN > 0 ? C.red : C.green,
        },
      ];
      boxes.forEach((b) => {
        panel(g, b.x, 404, 316, 96);
        g.font = mono(12, 700);
        g.fillStyle = C.dim;
        g.textAlign = "left";
        g.fillText(b.title, b.x + 20, 428);
        g.font = mono(38, 700);
        g.fillStyle = b.col;
        g.fillText(b.val, b.x + 20, 468);
        if (b.note) {
          g.font = mono(13, 600);
          g.fillStyle = b.noteCol;
          g.textAlign = "right";
          g.fillText(b.note, b.x + 296, 468);
          g.textAlign = "left";
        }
      });

      // BUTTONS
      BTNS.forEach((b) => {
        const hov = hoverBtn === b.id;
        const pr = ui.pressed && ui.pressed.id === b.id && now - ui.pressed.t < 180;
        rr(g, b.x, b.y, b.w, b.h, 10);
        g.fillStyle = pr
          ? "rgba(255,122,23,0.35)"
          : b.id === "new"
            ? "rgba(255,122,23,0.14)"
            : hov
              ? "#1d1d24"
              : "#141418";
        g.fill();
        g.lineWidth = 1.5;
        g.strokeStyle = hov || pr ? C.orange : b.id === "new" ? "rgba(255,122,23,0.5)" : C.line;
        g.stroke();
        let text = b.label;
        let col = C.text;
        if (b.id === "new") col = C.orange;
        if (b.id === "gate") {
          text = gateOn ? "GATE: ON" : "GATE: OFF";
          col = gateOn ? C.green : C.red;
        }
        g.font = mono(15, 700);
        g.textAlign = "center";
        g.fillStyle = col;
        g.fillText(text, b.x + b.w / 2, b.y + b.h / 2 + 1);
      });

      g.textAlign = "center";
      g.font = mono(12);
      g.fillStyle = C.dim;
      g.fillText(
        "try RETRY and RACE ×3, then switch the gate off to see double charges",
        SW / 2,
        618,
      );
      g.textAlign = "left";
    };

    const drawScreen = (now: number) => {
      const g = sctx;
      g.save();
      g.globalAlpha = 1;
      g.fillStyle = C.bg;
      g.fillRect(0, 0, SW, SH);
      if (ui.boot < 0.75) {
        drawBoot(g);
      } else {
        g.globalAlpha = Math.min(1, (ui.boot - 0.75) / 0.25);
        drawUI(g, now);
        g.globalAlpha = 1;
      }
      g.drawImage(overlay, 0, 0);
      g.restore();
      screenTex.needsUpdate = true;
    };

    /* ---------------------------------------------------------------- */
    /* Pointer interaction                                               */
    /* ---------------------------------------------------------------- */
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const inv = new THREE.Matrix4();
    const lray = new THREE.Ray();
    let inside = false;
    let qx: (v: number) => void = () => {};
    let qy: (v: number) => void = () => {};

    const btnAt = (px: number, py: number): BtnId | null => {
      const b = BTNS.find((q) => px >= q.x && px <= q.x + q.w && py >= q.y && py <= q.y + q.h);
      return b ? b.id : null;
    };

    const screenPick = (): BtnId | null | undefined => {
      // undefined = không chạm màn hình, null = chạm màn hình nhưng không trúng nút
      const hits = raycaster.intersectObject(screen, false);
      const uv = hits.length ? hits[0].uv : undefined;
      if (!uv) return undefined;
      return btnAt(uv.x * SW, (1 - uv.y) * SH);
    };

    const setScreenHover = (v: boolean) => {
      if (screenHover === v) return;
      screenHover = v;
      gsap.to(fx, { hover: v ? 1 : 0, duration: v ? 0.5 : 0.9, ease: "power3.out", overwrite: "auto" });
    };

    const updatePointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      inside = nx >= -1 && nx <= 1 && ny >= -1 && ny <= 1;
      ndc.set(nx, ny);
      if (inside) {
        qx(nx);
        qy(ny);
      }
    };
    const onMove = (e: PointerEvent) => updatePointer(e);
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        inside = false;
        document.documentElement.style.cursor = "";
      }
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) return;
      updatePointer(e);
      if (!inside) return;
      raycaster.setFromCamera(ndc, camera);
      const b = screenPick();
      if (b) {
        ui.pressed = { id: b, t: performance.now() };
        ui.animUntil = performance.now() + 260;
        act(b);
      }
    };

    /* ---------------------------------------------------------------- */
    /* Layout & frame loop                                               */
    /* ---------------------------------------------------------------- */
    const layout = () => {
      const A = camera.aspect;
      const wide = A > 1.15 && placement === "right";
      stage.position.x = wide ? 1.35 : 0;
      baseYaw = wide ? -0.16 : 0;
      const half = A < 1 ? 2.6 : wide ? 5.9 : 4.9;
      const fit = half / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * A);
      baseZ = THREE.MathUtils.clamp(Math.max(8.4, fit), 8.4, 16);
    };
    layout();

    let raf = 0;
    let visible = true;
    const clock = new THREE.Clock();
    let spinT = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const delta = Math.min(clock.getDelta(), 0.1);
      const f = delta * 60;
      const m = animate ? 1 : 0;
      spinT += delta * m;
      const t = spinT;
      const now = performance.now();

      // --- pointer → screen hover ---
      raycaster.setFromCamera(ndc, camera);
      let nextBtn: BtnId | null = null;
      let onScreen = false;
      if (inside) {
        const pick = screenPick();
        if (pick !== undefined) {
          onScreen = true;
          nextBtn = pick;
        }
      }
      setScreenHover(onScreen);
      if (nextBtn !== hoverBtn) {
        hoverBtn = nextBtn;
        dirty = true;
        ui.animUntil = now + 200;
        document.documentElement.style.cursor = nextBtn ? "pointer" : "";
      }

      // --- autoplay ---
      if (animate && booted) {
        autoClock += delta;
        if (!autoplay && now - lastUser > 14000) {
          resetAll();
          autoplay = true;
          autoAt = autoClock + 1.2;
        }
        if (autoplay && autoClock >= autoAt) {
          if (scriptI > 0 && scriptI % SCRIPT.length === 0) resetAll();
          const id = SCRIPT[scriptI++ % SCRIPT.length];
          act(id, true);
          autoAt = autoClock + (id === "race" ? 5.2 : 3.4);
        }
      }

      // --- stage ---
      stage.scale.setScalar(intro.scale * (1 - scr.p * 0.2));
      stage.rotation.y = baseYaw + intro.spin + pointer.x * 0.28 + Math.sin(t * 0.3) * 0.04;
      stage.rotation.x = -pointer.y * 0.08 + scr.p * 0.45;
      stage.position.y = Math.sin(t * 0.6) * 0.05 + scr.p * 0.6;

      // --- computer ---
      mon.scale.setScalar(0.9 + 0.1 * rv.mon);
      screenMat.opacity = rv.mon;
      frameMat.opacity = (0.45 + fx.hover * 0.4 + fx.flash * 0.2) * rv.mon;
      powerMat.opacity = 0.55 + 0.45 * Math.sin(t * 3);
      kb.scale.setScalar(0.001 + 0.999 * rv.kb);
      glowMat.opacity = Math.min(
        1,
        (0.16 + fx.hover * 0.14 + fx.busy * 0.12 + fx.burst * 0.15) * rv.glow,
      );

      // --- keyboard ---
      if (kbActive) {
        let any = false;
        for (let i = 0; i < NKEYS; i++) {
          const lv = keyLevel[i];
          if (lv > 0) {
            keyLevel[i] = Math.max(0, lv - delta * 3);
            any = true;
          }
          const L = keyLevel[i];
          dummy.position.set(kx[i], 0.065 - L * 0.025, kz[i]);
          dummy.updateMatrix();
          keys.setMatrixAt(i, dummy.matrix);
          tmpCol.copy(keyBase).lerp(keyHot, L);
          keys.setColorAt(i, tmpCol);
        }
        keys.instanceMatrix.needsUpdate = true;
        if (keys.instanceColor) keys.instanceColor.needsUpdate = true;
        if (!any) kbActive = false;
      }

      // --- lane / gate / nodes ---
      laneMat.opacity = 0.16 * rv.lane;
      const ga = fx.gate;
      hoopMat.color.copy(colOff).lerp(colOn, ga).lerp(flashCol, fx.flash);
      hoopMat.opacity = Math.min(1, (0.35 + 0.6 * ga + fx.flash * 0.4) * rv.lane);
      knotMat.opacity = (0.1 + 0.22 * ga + fx.flash * 0.2) * rv.lane;
      knot.rotation.z += delta * (0.3 + ga * 1.3) * m;
      gateGroup.scale.setScalar(Math.max(0.0001, rv.lane) * (1 + fx.flash * 0.25));

      clientMesh.rotation.y += delta * 0.8 * m;
      clientMesh.rotation.x += delta * 0.5 * m;
      clientNode.scale.setScalar(Math.max(0.0001, rv.lane) * (1 + fx.client * 0.45));

      ledMat.color.copy(ledIdle).lerp(ledBusy, fx.busy);
      apiGroup.scale.setScalar(Math.max(0.0001, rv.lane));
      apiGroup.position.y = LANE_Y + Math.sin(t * 2.2) * 0.01 * fx.busy;
      labels.forEach((l) => {
        l.mat.opacity = 0.9 * rv.lane;
      });

      packets.forEach((p) => {
        p.mesh.rotation.x += delta * 4;
        p.mesh.rotation.y += delta * 3;
      });

      // --- screen ---
      const caret = Math.floor(now / 500) % 2 === 0;
      if (caret !== ui.caret) {
        ui.caret = caret;
        if (!view.req) dirty = true;
      }
      if ((dirty || now < ui.animUntil || ui.boot < 1) && now - lastDraw > 33) {
        drawScreen(now);
        lastDraw = now;
        dirty = false;
      }

      // --- particles: drift + repulsion theo tia nhìn con trỏ ---
      field.rotation.y = t * 0.03 + pointer.x * 0.1;
      points.updateWorldMatrix(true, false);
      inv.copy(points.matrixWorld).invert();
      lray.copy(raycaster.ray).applyMatrix4(inv);
      const O = lray.origin;
      const D = lray.direction;
      const R = 0.9 + fx.burst * 2.5;
      const R2 = R * R;
      const F = 0.05 * (1 + fx.burst * 10) * f;
      const K = 0.02 * f;
      const DAMP = 0.92;
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        home[i3 + 1] += speeds[i] * 0.008 * f * m;
        if (home[i3 + 1] > 4) home[i3 + 1] = -4;

        const px = home[i3] + off[i3];
        const py = home[i3 + 1] + off[i3 + 1];
        const pz = home[i3 + 2] + off[i3 + 2];

        if (inside && animate) {
          const vx = px - O.x;
          const vy = py - O.y;
          const vz = pz - O.z;
          const tt = vx * D.x + vy * D.y + vz * D.z;
          const cx = vx - D.x * tt;
          const cy = vy - D.y * tt;
          const cz = vz - D.z * tt;
          const d2 = cx * cx + cy * cy + cz * cz;
          if (d2 < R2 && d2 > 1e-6) {
            const d = Math.sqrt(d2);
            const s = ((1 - d / R) * F) / d;
            vel[i3] += cx * s;
            vel[i3 + 1] += cy * s;
            vel[i3 + 2] += cz * s;
          }
        }
        vel[i3] = (vel[i3] - off[i3] * K) * DAMP;
        vel[i3 + 1] = (vel[i3 + 1] - off[i3 + 1] * K) * DAMP;
        vel[i3 + 2] = (vel[i3 + 2] - off[i3 + 2] * K) * DAMP;
        off[i3] += vel[i3];
        off[i3 + 1] += vel[i3 + 1];
        off[i3 + 2] += vel[i3 + 2];

        positions[i3] = home[i3] + off[i3];
        positions[i3 + 1] = home[i3 + 1] + off[i3 + 1];
        positions[i3 + 2] = home[i3 + 2] + off[i3 + 2];
      }
      (pointsGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      pointsMat.opacity = 0.6 * rv.points;

      // --- camera ---
      camera.position.x = pointer.x * 0.35;
      camera.position.y = 0.35 + pointer.y * 0.2;
      camera.position.z = baseZ + intro.dolly + scr.p * 3.5;
      camera.lookAt(stage.position.x * 0.35, 0, 0);

      renderer.render(scene, camera);
    };

    const start = () => {
      if (raf) return;
      clock.getDelta();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onResize = () => {
      const width = w();
      const height = h();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      layout();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(mount.parentElement ?? mount);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* ---------------------------------------------------------------- */
    /* GSAP: intro + scroll                                              */
    /* ---------------------------------------------------------------- */
    const ctx = gsap.context(() => {
      qx = gsap.quickTo(pointer, "x", { duration: 1.1, ease: "power3.out" });
      qy = gsap.quickTo(pointer, "y", { duration: 1.1, ease: "power3.out" });

      if (!animate) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(intro, { dolly: 0, spin: 0, scale: 1, duration: 3.2, ease: "expo.out" }, 0)
        .to(rv, { glow: 1, duration: 2 }, 0.1)
        .to(rv, { points: 1, duration: 2 }, 0.2)
        .to(rv, { mon: 1, duration: 1.2 }, 0.3)
        .to(rv, { kb: 1, duration: 1.2, ease: "back.out(1.6)" }, 0.7)
        .to(rv, { lane: 1, duration: 1.4 }, 1.0)
        .to(ui, { boot: 1, duration: 2.6, ease: "none" }, 1.0)
        .add(() => {
          booted = true;
          autoAt = autoClock + 0.8;
          dirty = true;
        });

      const trigger = {
        trigger: mount.parentElement ?? mount,
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
      };
      gsap.to(scr, { p: 1, ease: "none", scrollTrigger: trigger });
    }, mount);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerout", onOut);

    drawScreen(performance.now());
    start();

    /* ---------------------------------------------------------------- */
    /* Cleanup                                                           */
    /* ---------------------------------------------------------------- */
    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerout", onOut);
      document.documentElement.style.cursor = "";

      killAnims();
      gsap.killTweensOf([fx, intro, rv, scr, pointer, ui]);
      ctx.revert();

      pops.forEach(disposePop);
      packets.forEach((p) => stage.remove(p.mesh));
      packets.clear();

      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [placement]);

  // pointer-events-none: sự kiện chuột được lắng nghe ở window nên máy tính
  // vẫn tương tác được mà không chặn nút/link của hero ở phía trên.
  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 h-full min-h-screen w-full overflow-hidden"
      aria-hidden="true"
    />
  );
}