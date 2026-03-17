import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import "./Hero.css";

export default function Hero() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // ── Scene & Camera ──
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const p1 = new THREE.PointLight(0x004299, 3, 20);
    p1.position.set(3, 3, 3);
    scene.add(p1);
    const p2 = new THREE.PointLight(0x1a5cb5, 2, 20);
    p2.position.set(-3, -2, 2);
    scene.add(p2);
    const p3 = new THREE.PointLight(0x66aaff, 1.5, 15);
    p3.position.set(0, 4, -2);
    scene.add(p3);

    // ── Central sphere (deep navy) ──
    const coreGeo = new THREE.IcosahedronGeometry(1.05, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x001e50,
      emissive: 0x002060,
      metalness: 0.9,
      roughness: 0.15,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // ── Wireframe overlay ──
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1a5cb5,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.08, 2), wireMat);
    scene.add(wire);

    // ── Outer glow shell ──
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x004299,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 32), glowMat));

    // ── Orbiting nodes ──
    const orbitData = [
      { r: 0.16, dist: 1.85, speed: 1.1,  color: 0x004299, tilt: 0 },
      { r: 0.11, dist: 2.35, speed: 0.7,  color: 0x1a5cb5, tilt: Math.PI / 3 },
      { r: 0.13, dist: 2.1,  speed: 1.5,  color: 0x66aaff, tilt: -Math.PI / 4 },
      { r: 0.09, dist: 2.6,  speed: 0.55, color: 0x004299, tilt: Math.PI * 0.6 },
    ];

    const orbiters = orbitData.map(({ r, dist, color, tilt, speed }) => {
      const mat  = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7 });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 12), mat);
      const pivot = new THREE.Object3D();
      pivot.rotation.z = tilt;
      pivot.add(mesh);
      mesh.position.x = dist;
      scene.add(pivot);
      return { pivot, speed };
    });


    // ── Orbit rings ──
    orbitData.forEach(({ dist, tilt, color }) => {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15 });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(dist, 0.007, 6, 80), mat);
      ring.rotation.z = tilt;
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    // ── Floating particles ──
    const count = 140;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 10;
      pos[i*3+1] = (Math.random() - 0.5) * 10;
      pos[i*3+2] = (Math.random() - 0.5) * 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x1a5cb5, size: 0.035, transparent: true, opacity: 0.45,
    })));

    // ── Mouse parallax ──
    let mx = 0, my = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    // ── Animation ──
    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      core.rotation.y = t * 0.25;
      core.rotation.x = Math.sin(t * 0.18) * 0.18;
      wire.rotation.y = -t * 0.18;
      wire.rotation.x = core.rotation.x;

      orbiters.forEach(({ pivot, speed }) => {
        pivot.rotation.y += speed * 0.011;
      });

      camera.position.x += (mx * 0.5 - camera.position.x) * 0.04;
      camera.position.y += (-my * 0.35 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero__bg-dots" />

      {/* Text */}
      <div className="hero__content">
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          University of Blida 1 — AI Literacy Initiative
        </div>

        <h1 className="hero__title">
          Empowering Every Department with{" "}
          <span className="hero__title-accent">Artificial Intelligence</span>
        </h1>

        <p className="hero__subtitle">
          The AI House connects faculty, students, and researchers through
          hands-on workshops, seminars, competitions, and a growing network
          of certified AI representatives.
        </p>

        <div className="hero__actions">
          <Link to="/training" className="btn-primary">Explore Training Hub</Link>
          <Link to="/representatives" className="btn-outline">Meet the Representatives</Link>
        </div>
      </div>

      {/* 3D canvas */}
      <div className="hero__canvas" ref={mountRef} />
    </section>
  );
}