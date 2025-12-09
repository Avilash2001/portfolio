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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Base configuration
    const baseStarCount = 1000; // desktop default
    let depthMultiplier = 1; // increased on mobile to push stars further back
    let baseSpeed = 0.5;
    let stars: Star[] = [];
    const colors = ["#FF0099", "#00FFFF", "#FF9900", "#FFFFFF", "#333333"];

    // Initialize Canvas
    canvas.width = width;
    canvas.height = height;

    function hexToRgba(hex: string, opacity = 1) {
      let cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
      if (cleanHex.length === 3) {
        cleanHex = cleanHex
          .split("")
          .map((char) => char + char)
          .join("");
      }
      if (cleanHex.length !== 6) {
        throw new Error("Invalid hex color code.");
      }
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      if (opacity > 1 && opacity <= 100) opacity /= 100;
      opacity = Math.max(0, Math.min(1, opacity));
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    const initStars = () => {
      stars.length = 0;

      // Simple mobile detection - tweak breakpoint as needed
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
          z: Math.random() * width * depthMultiplier, // depth scaled by multiplier
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
        // Move star closer
        star.z -= baseSpeed;

        // Reset star if it passes the screen
        if (star.z <= 0) {
          star.z = width * depthMultiplier;
          star.pz = star.z;
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
        }

        // Project 3D -> 2D
        const x = cx + (star.x / star.z) * width;
        const y = cy + (star.y / star.z) * width;

        // Size scales with depthMultiplier and smaller on mobile
        const sizeFactor = isMobile ? 1.0 : 2.5;
        const rawSize = (1 - star.z / (width * depthMultiplier)) * sizeFactor;
        const size = Math.max(0.35, rawSize);

        const opacity = Math.max(0.12, 1 - star.z / (width * depthMultiplier));
        ctx.fillStyle = hexToRgba(star.color, 0.5);

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
