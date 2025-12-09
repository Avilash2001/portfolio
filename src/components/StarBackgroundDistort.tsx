"use client";

import React, { useRef, useEffect } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
  color: string;
}

const StarBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Track mouse position with a ref to avoid re-renders
  const mouseRef = useRef({ x: 0, y: 0, isActive: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Configuration
    const baseStarCount = 1000;
    let depthMultiplier = 1;
    let baseSpeed = 0.5;
    let stars: Star[] = [];
    const colors = ["#FF0099", "#00FFFF", "#FF9900", "#FFFFFF", "#333333"];

    canvas.width = width;
    canvas.height = height;

    // Helper: Track Mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.isActive = true;
    };

    // Helper: Reset interaction when mouse leaves window
    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    function hexToRgba(hex: string, opacity = 1) {
      let cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
      if (cleanHex.length === 3) {
        cleanHex = cleanHex
          .split("")
          .map((char) => char + char)
          .join("");
      }
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    const initStars = () => {
      stars.length = 0;
      const isMobile = width < 768;
      depthMultiplier = isMobile ? 2.5 : 1;
      baseSpeed = isMobile ? 0.35 : 0.5;
      const starCount = isMobile
        ? Math.max(120, Math.floor(baseStarCount * 0.25))
        : baseStarCount;

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width - width / 2,
          y: Math.random() * height - height / 2,
          z: Math.random() * width * depthMultiplier,
          pz: Math.random() * width * depthMultiplier,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initStars();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const isMobile = width < 768;

      stars.forEach((star) => {
        star.z -= baseSpeed;

        if (star.z <= 0) {
          star.z = width * depthMultiplier;
          star.pz = star.z;
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
        }

        // 1. Calculate Standard Position
        let x = cx + (star.x / star.z) * width;
        let y = cy + (star.y / star.z) * width;

        // 2. Interaction: Deflect if near mouse
        // We only calculate this if the mouse is on screen
        if (mouseRef.current.isActive) {
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 150; // The "Force Field" radius

          if (dist < radius) {
            const force = (radius - dist) / radius; // Stronger force when closer
            const angle = Math.atan2(dy, dx);

            // Push the star away based on angle
            const pushStrength = 50;
            x += Math.cos(angle) * force * pushStrength;
            y += Math.sin(angle) * force * pushStrength;
          }
        }

        const sizeFactor = isMobile ? 1.0 : 2.5;
        const rawSize = (1 - star.z / (width * depthMultiplier)) * sizeFactor;
        const size = Math.max(0.35, rawSize);

        // Optimization: Use pre-calculated RGB if possible, but keeping your logic for now
        ctx.fillStyle = hexToRgba(
          star.color,
          Math.max(0.1, 1 - star.z / (width * depthMultiplier))
        );

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        star.pz = star.z;
      });

      requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 bg-black pointer-events-none"
    />
  );
};

export default StarBackground;
