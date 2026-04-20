import React, { useState } from 'react';
import './MusicPage.css';
import GameCanvas from './GameCanvas';

const STRUDEL_URL = 'https://strudel.cc';

const MusicPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="music-page">
      <section className="music-hero">
        <p className="music-eyebrow">Music</p>
        <h1>Live-code music in Strudel</h1>
        <p className="music-copy">
          This page embeds the full public Strudel studio and only loads it when someone opens
          the <code>/music</code> route, so it does not add weight to the default experience.
        </p>
        <a
          className="music-link"
          href={STRUDEL_URL}
          target="_blank"
          rel="noreferrer"
        >
          Open Strudel in a new tab
        </a>
      </section>

      <section className="music-game-shell">
        <h2>Game canvas</h2>
        <p className="music-copy">
          Strudel runs natively here via <code>@strudel/web</code>. Click the canvas to start
          or stop the music — the first click also unlocks audio.
        </p>
        <GameCanvas />
      </section>

      <section className="music-frame-shell" aria-busy={!isLoaded}>
        {!isLoaded && (
          <div className="music-frame-loading" role="status" aria-live="polite">
            Loading Strudel...
          </div>
        )}
        <iframe
          title="Strudel music studio"
          src={STRUDEL_URL}
          className={`music-frame${isLoaded ? ' loaded' : ''}`}
          allow="autoplay; clipboard-read; clipboard-write; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setIsLoaded(true)}
        />
      </section>
    </div>
  );
};

export default MusicPage;
