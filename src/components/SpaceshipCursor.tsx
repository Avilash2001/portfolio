"use client";
import React, { useEffect, useRef, useState } from "react";

const SpaceshipCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  const pos = useRef({ x: 0, y: 0 });
  const prevPos = useRef({ x: 0, y: 0 });
  const angle = useRef(0);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const moveCursor = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      pos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", moveCursor);

    let rafId: number;
    const animate = () => {
      if (cursorRef.current) {
        const dx = pos.current.x - prevPos.current.x;
        const dy = pos.current.y - prevPos.current.y;

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          angle.current = Math.atan2(dy, dx) + Math.PI / 2;
        }

        const x = pos.current.x;
        const y = pos.current.y;

        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle.current}rad)`;

        prevPos.current = pos.current;
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
    >
      <div>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_2412_214)">
            <path
              d="M15.0781 1.62861C18.1964 0.231599 21.3809 -0.368775 23.3532 0.618062C24.3398 2.59042 23.7397 5.77485 22.3427 8.89316L15.0781 1.62861Z"
              fill="#FF5249"
            />
            <path
              d="M19.3974 13.8301L19.315 17.2087C19.3068 17.5406 19.2114 17.8644 19.0383 18.1476L16.2153 22.7648C15.8136 23.4218 14.8668 23.4424 14.4369 22.8036L12.0156 19.206"
              fill="#FF5249"
            />
            <path
              d="M4.76624 11.957L4.14453 14.947L6.5866 17.3865L9.02603 19.8285L12.016 19.2068L4.76624 11.957Z"
              fill="#FF5249"
            />
            <path
              d="M10.1354 4.56836L6.75677 4.65082C6.42484 4.65898 6.10107 4.75435 5.81788 4.92742L1.20087 7.75042C0.54386 8.15216 0.523311 9.09896 1.16215 9.52889L4.75965 11.9501"
              fill="#FF5249"
            />
            <path
              d="M12.0146 19.2074L4.76562 11.9584C4.82648 11.7068 4.90024 11.4542 4.99613 11.201C5.6571 9.45522 6.77144 7.71231 8.30438 6.17963C10.0641 4.41961 12.5505 2.7639 15.08 1.63086L22.3422 8.89304C21.2091 11.4228 19.5532 13.9089 17.7934 15.6689C16.2607 17.2016 14.5176 18.3162 12.772 18.9772C12.5189 19.0728 12.2662 19.1466 12.0146 19.2074Z"
              fill="#F9F9F9"
            />
            <path
              d="M14.3383 12.5867C15.9684 12.5867 17.2898 11.2652 17.2898 9.63515C17.2898 8.00505 15.9684 6.68359 14.3383 6.68359C12.7082 6.68359 11.3867 8.00505 11.3867 9.63515C11.3867 11.2652 12.7082 12.5867 14.3383 12.5867Z"
              fill="#7BD8E8"
            />
            <path
              d="M0.659622 23.84C0.524742 23.84 0.389862 23.7886 0.287121 23.6856C0.0813763 23.4799 0.0813763 23.1464 0.287121 22.9406L4.95234 18.2754C5.15782 18.0697 5.49186 18.0697 5.69734 18.2754C5.90308 18.4811 5.90308 18.8147 5.69734 19.0204L1.03212 23.6856C0.929382 23.7886 0.794502 23.84 0.659622 23.84Z"
              fill="#FFDD78"
            />
            <path
              d="M0.882278 20.5412C0.747398 20.5412 0.612781 20.4898 0.509777 20.3868C0.304033 20.181 0.304033 19.8475 0.509777 19.6418L3.41549 16.7363C3.62097 16.5306 3.95475 16.5306 4.16049 16.7363C4.36624 16.9421 4.36624 17.2756 4.16049 17.4813L1.25478 20.3871C1.15204 20.4898 1.01716 20.5412 0.882278 20.5412Z"
              fill="#FFDD78"
            />
            <path
              d="M3.9565 23.6193C3.82162 23.6193 3.68674 23.5679 3.584 23.4649C3.37825 23.2592 3.37825 22.9257 3.584 22.7199L6.48945 19.8145C6.69493 19.6087 7.02897 19.6087 7.23445 19.8145C7.44019 20.0202 7.44019 20.3537 7.23445 20.5595L4.329 23.4649C4.22599 23.5679 4.09111 23.6193 3.9565 23.6193Z"
              fill="#FFDD78"
            />
          </g>
          <defs>
            <clipPath id="clip0_2412_214">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default SpaceshipCursor;
