import React, { useState, useEffect, useRef } from "react";
import CELLS from "vanta/dist/vanta.cells.min";
import * as THREE from "three";

export const SplashPage = () => {
  const [vantaEffect, setVantaEffect] = useState(0);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        CELLS({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 1000,
          minWidth: 600.0,
          scale: 1.0,
          scaleMobile: 1.0,
          speed: 0.0,
          color1: 0x40504,
          color2: 0xed4444,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);
  return (
    <div ref={vantaRef}>
      <p style={{ color: "#fff", paddingTop: "20px" }}>
       
       
      </p>
    </div>
  );
};

export default SplashPage;