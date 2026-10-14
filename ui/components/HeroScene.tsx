"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { gsap } from "gsap";

/* -------------------------------------------------------------------------- */
/* Screen UI                                                                   */
/* -------------------------------------------------------------------------- */

const SW = 1024;
const SH = 640;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const C = {
  bg: "#0a0a0c",
  panel: "#121218",
  line: "#2a2a32",
  text: "#ececf1",
  dim: "#8a8a95",
  orange: "#ff7a17",
  violet: "#c4b5fd",
  blue: "#a0c3ec",
  green: "#4ade80",
  red: "#ff5c5c",
  amber: "#fbbf24",
};

type Mode = "before" | "after";
type BtnId = "mode-before" | "mode-after" | "pay" | "retry" | "race" | "reset";
type Tone = "ok" | "info" | "warn" | "err";
type LogEntry = { id: number; label: string; note: string; tone: Tone };

const BTNS: { id: BtnId; label: string; x: number; y: number; w: number; h: number }[] = [
  { id: "mode-before", label: "BEFORE", x: 24, y: 88, w: 140, h: 44 },
  { id: "mode-after", label: "AFTER · IDEMGATE", x: 176, y: 88, w: 220, h: 44 },
  { id: "pay", label: "PAY $19.00", x: 24, y: 552, w: 180, h: 52 },
  { id: "retry", label: "RETRY SAME KEY", x: 220, y: 552, w: 200, h: 52 },
  { id: "race", label: "RACE ×3", x: 436, y: 552, w: 140, h: 52 },
  { id: "reset", label: "RESET", x: 900, y: 552, w: 100, h: 52 },
];

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function makeLabel(text: string, color: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = color;
  ctx.font = `600 22px ${MONO}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.4, 0.35, 1);
  return { sprite, mat, tex };
}

/**
 * Centered interactive computer. Screen demos the same payment flow
 * BEFORE IdemGate (double-charge) vs AFTER (claim → replay).
 */
export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const disposables: { dispose: () => void }[] = [];
    const own = <T extends { dispose: () => void }>(o: T) => {
      disposables.push(o);
      return o;
    };
    const anims = new Set<gsap.core.Animation>();
    const reg = <T extends gsap.core.Animation>(a: T) => {
      anims.add(a);
      a.eventCallback("onComplete", () => anims.delete(a));
      return a;
    };
    const to = (target: gsap.TweenTarget, vars: gsap.TweenVars) => reg(gsap.to(target, vars));
    const later = (sec: number, fn: () => void) => reg(gsap.delayedCall(sec, fn));

    const w = () => Math.max(2, mount.clientWidth || window.innerWidth);
    const h = () => Math.max(2, mount.clientHeight || window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.028);

    const camera = new THREE.PerspectiveCamera(38, w() / h(), 0.1, 100);
    camera.position.set(0, 0.55, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w(), h(), false);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x707088, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2.5, 5, 6);
    scene.add(key);
    const warm = new THREE.PointLight(0xff7a17, 28, 18, 2);
    warm.position.set(-2.5, 1.8, 2);
    scene.add(warm);
    const cool = new THREE.PointLight(0x7c3aed, 22, 18, 2);
    cool.position.set(3, 2, 1.5);
    scene.add(cool);

    const stage = new THREE.Group();
    scene.add(stage);

    /* ---- Screen canvas ---- */
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = SW;
    screenCanvas.height = SH;
    const g = screenCanvas.getContext("2d")!;
    const screenTex = own(new THREE.CanvasTexture(screenCanvas));
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    /* ---- Computer ---- */
    const bodyMat = own(new THREE.MeshStandardMaterial({ color: 0x16161c, metalness: 0.35, roughness: 0.55 }));
    const bezelMat = own(new THREE.MeshStandardMaterial({ color: 0x0c0c10, metalness: 0.4, roughness: 0.45 }));
    const accentMat = own(new THREE.MeshStandardMaterial({ color: 0xff7a17, emissive: 0xff7a17, emissiveIntensity: 0.35 }));

    const mon = new THREE.Group();
    mon.position.set(0, 0.55, 0);
    const chassis = new THREE.Mesh(own(new RoundedBoxGeometry(3.6, 2.35, 0.22, 4, 0.06)), bodyMat);
    mon.add(chassis);
    const bezel = new THREE.Mesh(own(new RoundedBoxGeometry(3.25, 2.0, 0.06, 3, 0.03)), bezelMat);
    bezel.position.z = 0.12;
    mon.add(bezel);
    const screenMat = own(
      new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }),
    );
    const screen = new THREE.Mesh(own(new THREE.PlaneGeometry(3.05, 1.82)), screenMat);
    screen.position.z = 0.155;
    mon.add(screen);
    const stand = new THREE.Mesh(own(new RoundedBoxGeometry(0.55, 0.7, 0.18, 3, 0.04)), bodyMat);
    stand.position.set(0, -1.35, -0.05);
    mon.add(stand);
    const base = new THREE.Mesh(own(new RoundedBoxGeometry(1.5, 0.1, 0.7, 3, 0.04)), bodyMat);
    base.position.set(0, -1.72, 0.05);
    mon.add(base);
    const led = new THREE.Mesh(own(new THREE.BoxGeometry(0.08, 0.03, 0.02)), accentMat);
    led.position.set(0, -1.05, 0.14);
    mon.add(led);
    stage.add(mon);

    const kb = new THREE.Mesh(own(new RoundedBoxGeometry(3.2, 0.08, 1.05, 3, 0.03)), bodyMat);
    kb.position.set(0, -1.78, 1.05);
    kb.rotation.x = 0.06;
    stage.add(kb);

    /* ---- Lane: Client → Gate → API ---- */
    const LANE_Y = -0.15;
    const LANE_Z = -1.55;
    const LX = { client: -2.6, gate: 0, api: 2.6 };

    const laneGeo = own(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(LX.client, LANE_Y, LANE_Z),
      new THREE.Vector3(LX.api, LANE_Y, LANE_Z),
    ]));
    stage.add(new THREE.Line(laneGeo, own(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 }))));

    const mkNode = (x: number, color: number) => {
      const n = new THREE.Mesh(
        own(new THREE.OctahedronGeometry(0.14, 0)),
        own(new THREE.MeshBasicMaterial({ color })),
      );
      n.position.set(x, LANE_Y, LANE_Z);
      stage.add(n);
      return n;
    };
    const clientNode = mkNode(LX.client, 0xa0c3ec);
    const gateNode = mkNode(LX.gate, 0xff7a17);
    const apiNode = mkNode(LX.api, 0x4ade80);

    const gateRing = new THREE.Mesh(
      own(new THREE.TorusGeometry(0.32, 0.025, 12, 48)),
      own(new THREE.MeshBasicMaterial({ color: 0xff7a17, transparent: true, opacity: 0.85 })),
    );
    gateRing.position.copy(gateNode.position);
    gateRing.rotation.x = Math.PI / 2;
    stage.add(gateRing);

    const labels = [
      { ...makeLabel("CLIENT", "#a0c3ec"), x: LX.client },
      { ...makeLabel("IDEMGATE", "#ff7a17"), x: LX.gate },
      { ...makeLabel("YOUR API", "#4ade80"), x: LX.api },
    ];
    labels.forEach((l) => {
      l.sprite.position.set(l.x, LANE_Y - 0.45, LANE_Z);
      stage.add(l.sprite);
      own(l.mat);
      own(l.tex);
    });

    /* ---- Packets ---- */
    type Packet = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial };
    const packetGeo = own(new THREE.OctahedronGeometry(0.09, 0));
    const packets = new Set<Packet>();
    const spawnPacket = (color: number, x: number) => {
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(packetGeo, mat);
      mesh.position.set(x, LANE_Y, LANE_Z);
      mesh.scale.setScalar(0.001);
      stage.add(mesh);
      const p = { mesh, mat };
      packets.add(p);
      return p;
    };
    const fly = (p: Packet, x1: number, x2: number, dur: number, color?: number) => {
      if (color != null) p.mat.color.setHex(color);
      p.mesh.position.x = x1;
      to(p.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.15 });
      return to(p.mesh.position, {
        x: x2,
        duration: dur,
        ease: "power1.inOut",
        onComplete: () => {
          stage.remove(p.mesh);
          p.mat.dispose();
          packets.delete(p);
        },
      });
    };

    /* ---- Demo state ---- */
    let mode: Mode = "after";
    let busy = false;
    let hoverBtn: BtnId | null = null;
    let dirty = true;
    let logId = 1;
    let chargeCount = 0;
    let lastKey = "pay_demo_1";
    let lastFp = "a1b2c3d4";
    let lastAmount = 1900;
    const store = new Map<string, { status: number; body: string; fp: string }>();
    const logs: LogEntry[] = [];
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const ndc = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let raf = 0;
    let running = true;
    let visible = true;
    const clock = new THREE.Clock();
    let intro = reduced ? 1 : 0;

    const pushLog = (label: string, note: string, tone: Tone) => {
      logs.unshift({ id: logId++, label, note, tone });
      if (logs.length > 7) logs.pop();
      dirty = true;
    };

    const setMode = (m: Mode) => {
      if (busy || mode === m) return;
      mode = m;
      store.clear();
      chargeCount = 0;
      lastKey = "pay_demo_1";
      pushLog(
        m === "after" ? "IDEMGATE ON" : "RAW API",
        m === "after" ? "Claim → work → complete. Retries replay." : "No registry. Every retry hits YOUR API.",
        m === "after" ? "ok" : "warn",
      );
      to(gateRing.scale, { x: m === "after" ? 1 : 0.01, y: m === "after" ? 1 : 0.01, z: m === "after" ? 1 : 0.01, duration: 0.45 });
      to(gateNode.scale, { x: m === "after" ? 1 : 0.35, y: m === "after" ? 1 : 0.35, z: m === "after" ? 1 : 0.35, duration: 0.45 });
      (gateNode.material as THREE.MeshBasicMaterial).color.setHex(m === "after" ? 0xff7a17 : 0xff5c5c);
      dirty = true;
    };

    const runPay = (opts: { key: string; fp: string; amount: number; isRetry: boolean }) => {
      if (busy) return;
      busy = true;
      dirty = true;
      const { key, fp, amount } = opts;
      lastKey = key;
      lastFp = fp;
      lastAmount = amount;

      const p = spawnPacket(0xe8e8f0, LX.client);

      if (mode === "before") {
        // Every call hits the API — retries double-charge
        fly(p, LX.client, LX.api, 0.55, 0xe8e8f0);
        later(0.55, () => {
          chargeCount += 1;
          const status = opts.isRetry ? 201 : 201;
          pushLog(
            `${status} CHARGED`,
            `API executed · charges=${chargeCount} · key=${key}`,
            chargeCount > 1 ? "err" : "ok",
          );
          const flash = spawnPacket(0x4ade80, LX.api);
          fly(flash, LX.api, LX.client, 0.45, chargeCount > 1 ? 0xff5c5c : 0x4ade80);
          later(0.5, () => {
            busy = false;
            dirty = true;
          });
        });
        return;
      }

      // AFTER: through IdemGate
      fly(p, LX.client, LX.gate, 0.4, 0xff7a17);
      later(0.42, () => {
        const hit = store.get(key);
        if (hit) {
          if (hit.fp !== fp) {
            pushLog("409 MISMATCH", `Same key, different fingerprint · key=${key}`, "err");
            const err = spawnPacket(0xff5c5c, LX.gate);
            fly(err, LX.gate, LX.client, 0.4, 0xff5c5c);
            later(0.45, () => {
              busy = false;
              dirty = true;
            });
            return;
          }
          pushLog("200 REPLAY", `Cached response · API not called · charges=${chargeCount}`, "info");
          const rep = spawnPacket(0xc4b5fd, LX.gate);
          fly(rep, LX.gate, LX.client, 0.4, 0xc4b5fd);
          later(0.45, () => {
            busy = false;
            dirty = true;
          });
          return;
        }

        // Claim then API
        pushLog("CLAIMED", `Owner token issued · key=${key}`, "info");
        const mid = spawnPacket(0xff7a17, LX.gate);
        fly(mid, LX.gate, LX.api, 0.4, 0xff7a17);
        later(0.42, () => {
          chargeCount += 1;
          const body = `{"chargeId":"ch_${chargeCount}","amount":${amount}}`;
          store.set(key, { status: 201, body, fp });
          pushLog("201 COMPLETE", `API charged once · charges=${chargeCount}`, "ok");
          const back = spawnPacket(0x4ade80, LX.api);
          // complete registers at gate then client
          fly(back, LX.api, LX.gate, 0.35, 0x4ade80);
          later(0.36, () => {
            const toClient = spawnPacket(0x4ade80, LX.gate);
            fly(toClient, LX.gate, LX.client, 0.35, 0x4ade80);
            later(0.4, () => {
              busy = false;
              dirty = true;
            });
          });
        });
      });
    };

    const onBtn = (id: BtnId) => {
      if (id === "mode-before") return setMode("before");
      if (id === "mode-after") return setMode("after");
      if (id === "reset") {
        store.clear();
        chargeCount = 0;
        logs.length = 0;
        lastKey = "pay_demo_1";
        pushLog("RESET", "Store cleared · ready for a new key", "warn");
        dirty = true;
        return;
      }
      if (id === "pay") {
        const key = `pay_${Math.floor(Math.random() * 900 + 100)}`;
        runPay({ key, fp: "a1b2c3d4", amount: 1900, isRetry: false });
        return;
      }
      if (id === "retry") {
        runPay({ key: lastKey, fp: lastFp, amount: lastAmount, isRetry: true });
        return;
      }
      if (id === "race") {
        if (busy) return;
        const key = lastKey;
        // fire 3 near-simultaneous
        busy = true;
        dirty = true;
        pushLog("RACE ×3", `Three clients · same key=${key}`, "warn");
        let done = 0;
        const finish = () => {
          done += 1;
          if (done >= 3) {
            busy = false;
            dirty = true;
          }
        };
        // temporarily allow overlapping by not using global busy inside — use local
        const wasBusy = () => {};
        void wasBusy;
        const runOne = (delay: number) => {
          later(delay, () => {
            if (mode === "before") {
              const p = spawnPacket(0xe8e8f0, LX.client);
              fly(p, LX.client, LX.api, 0.45);
              later(0.45, () => {
                chargeCount += 1;
                pushLog("201 CHARGED", `Race hit API · charges=${chargeCount}`, chargeCount > 1 ? "err" : "ok");
                finish();
              });
            } else {
              const p = spawnPacket(0xff7a17, LX.client);
              fly(p, LX.client, LX.gate, 0.35);
              later(0.36, () => {
                const hit = store.get(key);
                if (hit) {
                  pushLog("409 IN_PROGRESS / REPLAY", "Loser does not re-execute", "info");
                  const r = spawnPacket(0xc4b5fd, LX.gate);
                  fly(r, LX.gate, LX.client, 0.35, 0xc4b5fd);
                  finish();
                } else {
                  store.set(key, { status: 201, body: "{}", fp: lastFp }); // claim lock
                  const mid = spawnPacket(0xff7a17, LX.gate);
                  fly(mid, LX.gate, LX.api, 0.35);
                  later(0.36, () => {
                    chargeCount += 1;
                    store.set(key, { status: 201, body: `{"ok":1}`, fp: lastFp });
                    pushLog("201 WINNER", `Only one charge · charges=${chargeCount}`, "ok");
                    const back = spawnPacket(0x4ade80, LX.api);
                    fly(back, LX.api, LX.client, 0.4, 0x4ade80);
                    finish();
                  });
                }
              });
            }
          });
        };
        // reset store claim for fair race demo on after mode if empty
        if (mode === "after") store.delete(key);
        runOne(0);
        runOne(0.05);
        runOne(0.1);
        later(1.2, () => {
          busy = false;
          dirty = true;
        });
      }
    };

    /* ---- Draw screen ---- */
    const drawScreen = () => {
      g.fillStyle = C.bg;
      g.fillRect(0, 0, SW, SH);

      // header
      g.fillStyle = C.panel;
      g.fillRect(0, 0, SW, 64);
      g.fillStyle = C.text;
      g.font = `600 22px ${MONO}`;
      g.fillText("IdemGate · live bench", 24, 40);
      g.fillStyle = mode === "after" ? C.green : C.red;
      g.font = `600 14px ${MONO}`;
      g.fillText(mode === "after" ? "● AFTER  service applied" : "○ BEFORE  no registry", SW - 280, 40);

      // mode buttons
      for (const b of BTNS.filter((x) => x.id.startsWith("mode"))) {
        const on = (b.id === "mode-before" && mode === "before") || (b.id === "mode-after" && mode === "after");
        const hot = hoverBtn === b.id;
        g.fillStyle = on ? (mode === "after" ? "rgba(74,222,128,0.18)" : "rgba(255,92,92,0.18)") : hot ? "#1a1a22" : C.panel;
        rr(g, b.x, b.y, b.w, b.h, 999);
        g.fill();
        g.strokeStyle = on ? (mode === "after" ? C.green : C.red) : hot ? "rgba(255,255,255,0.35)" : C.line;
        g.lineWidth = 1.5;
        g.stroke();
        g.fillStyle = on ? C.text : C.dim;
        g.font = `600 14px ${MONO}`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
        g.textAlign = "left";
        g.textBaseline = "alphabetic";
      }

      // explanation
      g.fillStyle = C.dim;
      g.font = `400 15px ${MONO}`;
      if (mode === "before") {
        g.fillText("Client retries go straight to YOUR API. Same key → charged again.", 24, 160);
      } else {
        g.fillText("Client → IdemGate claim → YOUR API once → complete. Retry → replay.", 24, 160);
      }

      // stats
      g.fillStyle = C.panel;
      rr(g, 24, 184, 300, 100, 12);
      g.fill();
      g.strokeStyle = C.line;
      g.stroke();
      g.fillStyle = C.dim;
      g.font = `500 12px ${MONO}`;
      g.fillText("API CHARGES", 44, 214);
      g.fillStyle = chargeCount > 1 && mode === "before" ? C.red : C.text;
      g.font = `600 42px ${MONO}`;
      g.fillText(String(chargeCount), 44, 262);

      g.fillStyle = C.panel;
      rr(g, 340, 184, 660, 100, 12);
      g.fill();
      g.strokeStyle = C.line;
      g.stroke();
      g.fillStyle = C.dim;
      g.font = `500 12px ${MONO}`;
      g.fillText("LAST KEY", 360, 214);
      g.fillStyle = C.text;
      g.font = `600 22px ${MONO}`;
      g.fillText(lastKey, 360, 250);
      g.fillStyle = C.dim;
      g.font = `400 13px ${MONO}`;
      g.fillText(`fp ${lastFp} · $${(lastAmount / 100).toFixed(2)}`, 360, 272);

      // log
      g.fillStyle = C.panel;
      rr(g, 24, 304, 976, 220, 12);
      g.fill();
      g.strokeStyle = C.line;
      g.stroke();
      g.fillStyle = C.dim;
      g.font = `500 12px ${MONO}`;
      g.fillText("EVENT LOG", 44, 332);
      let ly = 360;
      for (const row of logs) {
        const col = row.tone === "ok" ? C.green : row.tone === "err" ? C.red : row.tone === "warn" ? C.amber : C.violet;
        g.fillStyle = col;
        g.font = `600 13px ${MONO}`;
        g.fillText(row.label, 44, ly);
        g.fillStyle = C.dim;
        g.font = `400 13px ${MONO}`;
        g.fillText(row.note, 220, ly);
        ly += 26;
      }
      if (!logs.length) {
        g.fillStyle = C.dim;
        g.font = `400 14px ${MONO}`;
        g.fillText("Click PAY, then RETRY — compare BEFORE vs AFTER.", 44, 380);
      }

      // action buttons
      for (const b of BTNS.filter((x) => !x.id.startsWith("mode"))) {
        const hot = hoverBtn === b.id;
        const disabled = busy && b.id !== "reset";
        g.fillStyle = hot && !disabled ? "#1c1c26" : C.panel;
        rr(g, b.x, b.y, b.w, b.h, 999);
        g.fill();
        g.strokeStyle = hot ? "rgba(255,255,255,0.45)" : C.line;
        g.stroke();
        g.fillStyle = disabled ? "#55555f" : C.text;
        g.font = `600 14px ${MONO}`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
        g.textAlign = "left";
        g.textBaseline = "alphabetic";
      }

      screenTex.needsUpdate = true;
      dirty = false;
    };

    const screenToUV = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(screen, false);
      if (!hits.length) return null;
      const uv = hits[0].uv;
      if (!uv) return null;
      return { x: uv.x * SW, y: (1 - uv.y) * SH };
    };

    const hitBtn = (x: number, y: number) => {
      for (const b of BTNS) {
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
      }
      return null;
    };

    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const uv = screenToUV(e);
      const next = uv ? hitBtn(uv.x, uv.y) : null;
      if (next !== hoverBtn) {
        hoverBtn = next;
        document.documentElement.style.cursor = next ? "pointer" : "";
        dirty = true;
      }
    };

    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("a,button,input,textarea,select,label,[data-no-burst]")) return;
      const uv = screenToUV(e);
      if (!uv) return;
      const id = hitBtn(uv.x, uv.y);
      if (id) onBtn(id);
    };

    /* ---- Loop ---- */
    const resize = () => {
      const width = w();
      const height = h();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      if (!reduced) intro = Math.min(1, intro + dt * 0.7);

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      const t = clock.elapsedTime;
      stage.scale.setScalar(0.75 + intro * 0.25);
      stage.rotation.y = pointer.x * 0.35 + Math.sin(t * 0.35) * 0.03;
      stage.rotation.x = -pointer.y * 0.12;
      stage.position.y = Math.sin(t * 0.55) * 0.04;

      gateRing.rotation.z = t * 0.6;
      clientNode.rotation.y = t;
      apiNode.rotation.y = -t;

      labels[1].sprite.visible = mode === "after" ? intro > 0.2 : false;
      gateRing.visible = mode === "after";

      camera.position.x = pointer.x * 0.25;
      camera.position.y = 0.55 + pointer.y * 0.15;
      camera.lookAt(0, 0.1, 0);

      if (dirty) drawScreen();
      renderer.render(scene, camera);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    io.observe(mount.parentElement ?? mount);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    pushLog("READY", "Toggle BEFORE / AFTER, then PAY → RETRY", "info");
    setMode("after");
    resize();
    window.setTimeout(resize, 40);
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.style.cursor = "";
      anims.forEach((a) => a.kill());
      packets.forEach((p) => stage.remove(p.mesh));
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-0 h-full min-h-screen w-full overflow-hidden"
      aria-hidden="true"
    />
  );
}
