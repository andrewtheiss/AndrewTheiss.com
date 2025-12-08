import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import CELLS from "vanta/dist/vanta.cells.min";
import * as THREE from "three";
import * as ROUTES from "../../constants/routes";
import './SplashPage.css';

export const SplashPage = () => {
  const [vantaEffect, setVantaEffect] = useState(0);
  const vantaRef = useRef(null);
  const [timeElapsed, setTimeElapsed] = useState(0);


  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        CELLS({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 800,
          minWidth: 300.0,
          scale: 1.0,
          scaleMobile: 1.0,
          speed: 0.0,
          color1: 0x000000,
          color2: 0x006080,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);


  useEffect(() => {
    const targetDate = new Date('February 7, 1989 3:15:00 PM');
    const updateTime = () => {
      const currentDate = new Date();
      const millisecondsElapsed = currentDate.getTime() - targetDate.getTime();
      const newTimeElapsed = millisecondsElapsed / 1000;
      setTimeElapsed(newTimeElapsed);
    };

    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const years = Math.floor(timeElapsed / 31557600);
  const days = Math.floor((timeElapsed % 31557600) / 86400);
  const hours = Math.floor((timeElapsed % 86400) / 3600);
  const minutes = Math.floor((timeElapsed % 3600) / 60);
  const seconds = Math.floor(timeElapsed % 60);

  const timeString = `${years} years, ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;


  return (
    <div ref={vantaRef} className="splash-container">
      <div className="hero-section">
        <div className="hero-content">
          <h2>I'm Andrew Theiss, a coder, student and teacher in Studio City, California</h2>
          <p>I've spent a majority of the past {timeString} pursuing technical interests from full stack audio-visual or web3 programming, team management, teaching, cooking, and ceramics.</p>
          <p>These days my time is spent researching, designing, prototyping and coding. I help young students on their careers to becoming better Computer Scientists.</p>
          <p>Outside school I'm following tech news especially developments in chip manufacturing, AI, and space exploration.</p>
        </div>
        <div className="hero-image" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/me.png)` }}></div>
      </div>
      <div className="splash-cta-bar">
        <Link to={ROUTES.MEDITATION} className="splash-cta-btn">
          Meditation
        </Link>
      </div>
    </div>
  );
};

export default SplashPage;