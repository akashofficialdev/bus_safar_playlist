"use client";

import { useEffect, useMemo, useState } from "react";

type Song = {
  title: string;
  artist: string;
  mood: string;
};

type Stop = {
  name: string;
  at: number;
  note: string;
};

const songs: Song[] = [
  { title: "Subah Ki Bus", artist: "Garhwali Road Radio", mood: "City sunrise" },
  { title: "Paltan Bazaar Waltz", artist: "Doon Valley Ensemble", mood: "Market hum" },
  { title: "Rajpur Road Reverb", artist: "The Hill Turners", mood: "Leaving town" },
  { title: "Pahad Shuru", artist: "Mitti aur Pine", mood: "First climb" },
  { title: "Kempty Window Seat", artist: "Mistline Collective", mood: "Old postcard" },
  { title: "Chai at Halfway", artist: "Brass Kettle Band", mood: "Roadside pause" },
  { title: "Deodar Drift", artist: "Oak & Echo", mood: "Forest shade" },
  { title: "Clouds over Landour", artist: "Himalayan Tape Club", mood: "High fog" },
  { title: "Maggi Steam", artist: "Turn After Turn", mood: "Warm stop" },
  { title: "Five Kilometres More", artist: "Mall Road Players", mood: "Almost there" },
  { title: "Library Bazaar Lights", artist: "Evening Doon", mood: "Hill town glow" },
  { title: "Mussoorie Arrival", artist: "The Last Bend", mood: "Welcome" },
  { title: "Rain on the Windshield", artist: "Pine Needle Orchestra", mood: "Light drizzle" },
  { title: "Camel Back Chorus", artist: "Ridge Walkers", mood: "Soft evening" },
  { title: "Doon Below", artist: "Valley Signal", mood: "Look back" },
  { title: "Ticket to the Hills", artist: "Bus Stand Sessions", mood: "Encore" },
];

const stops: Stop[] = [
  { name: "Dehradun", at: 0, note: "Bus stand chatter, bakery shutters, morning traffic." },
  { name: "Rajpur", at: 18, note: "The city thins out and the road starts leaning upward." },
  { name: "Pahad Shuru", at: 33, note: "First tight bend. Pine air starts coming through the window." },
  { name: "Halfway Chai", at: 52, note: "A kettle, a biscuit tin, and ten minutes of mountain gossip." },
  { name: "Fog Bend", at: 72, note: "The valley disappears behind soft white weather." },
  { name: "Mussoorie", at: 100, note: "Mall Road lights, woollen caps, and the bus breathing out." },
];

const journeyMinutes = 45;

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [songIndex, setSongIndex] = useState(0);
  const [progress, setProgress] = useState(8);
  const sceneStyle = {
    "--journey": `${progress}%`,
    "--cloud-shift": `${progress * -0.28}%`,
    "--mountain-shift": `${progress * -0.52}%`,
    "--town-shift": `${progress * -1.05}%`,
    "--forest-shift": `${progress * -1.55}%`,
    "--near-shift": `${progress * -3.4}%`,
    "--fog-shift": `${progress * -0.8}%`,
    "--fog-opacity": Math.max(0, Math.min(0.82, (progress - 56) * 0.025)),
  } as React.CSSProperties;

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current + 0.18;
        return next >= 100 ? 0 : next;
      });
    }, 180);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    const nextSong = Math.min(
      songs.length - 1,
      Math.floor((progress / 100) * songs.length),
    );
    setSongIndex(nextSong);
  }, [progress]);

  const currentSong = songs[songIndex];
  const currentStop = useMemo(
    () =>
      stops.reduce((active, stop) => (progress >= stop.at ? stop : active), stops[0]),
    [progress],
  );
  const minutes = Math.round((progress / 100) * journeyMinutes);

  const previousSong = () => {
    setSongIndex((current) => (current - 1 + songs.length) % songs.length);
  };

  const nextSong = () => {
    setSongIndex((current) => (current + 1) % songs.length);
  };

  const jumpToStop = (at: number) => {
    setProgress(at);
    setIsPlaying(true);
  };

  return (
    <main className="journey-shell">
      <section
        className="windshield"
        aria-label="Animated Dehradun to Mussoorie bus journey"
        style={sceneStyle}
      >
        <div className="skyline layer" />
        <div className="clouds layer">
          <span />
          <span />
          <span />
        </div>
        <div className="mountains layer">
          <span className="peak peak-one" />
          <span className="peak peak-two" />
          <span className="peak peak-three" />
        </div>
        <div className="towns layer">
          <span className="doon">Dehradun</span>
          <span className="rajpur">Rajpur</span>
          <span className="mussoorie">Mussoorie</span>
        </div>
        <div className="forest layer">
          {Array.from({ length: 22 }, (_, index) => (
            <i
              key={index}
              style={
                {
                  left: `${index * 8.5 - 20}%`,
                  opacity: 0.42 + (index % 4) * 0.12,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div className="road layer">
          <span className="road-edge left" />
          <span className="road-edge right" />
          <span className="lane lane-one" />
          <span className="lane lane-two" />
          <span className="lane lane-three" />
        </div>
        <div className="near-road layer">
          {Array.from({ length: 10 }, (_, index) => (
            <i key={index} style={{ left: `${index * 18 - 26}%` }} />
          ))}
        </div>
        <div className="fog" />
        <div className="windshield-frame" />
        <div className="dashboard">
          <div className="route-card">
            <p>Dehradun to Mussoorie</p>
            <h1>Window Seat Radio</h1>
            <span>{minutes} min into a 45 min climb</span>
          </div>

          <div className="player" aria-label="Playlist controls">
            <button type="button" onClick={previousSong} aria-label="Previous song">
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              className="play-button"
              onClick={() => setIsPlaying((playing) => !playing)}
              aria-label={isPlaying ? "Pause journey" : "Play journey"}
            >
              <span aria-hidden="true">{isPlaying ? "II" : "▶"}</span>
            </button>
            <button type="button" onClick={nextSong} aria-label="Next song">
              <span aria-hidden="true">›</span>
            </button>
            <div className="now-playing">
              <span>Now playing</span>
              <strong>{currentSong.title}</strong>
              <small>
                {currentSong.artist} · {currentSong.mood}
              </small>
            </div>
          </div>

          <div className="journey-panel">
            <div className="progress-copy">
              <span>{currentStop.name}</span>
              <p>{currentStop.note}</p>
            </div>
            <div className="route-progress" aria-label={`Journey progress ${Math.round(progress)} percent`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="stop-row">
              {stops.map((stop) => (
                <button
                  type="button"
                  key={stop.name}
                  className={progress >= stop.at ? "active" : ""}
                  onClick={() => jumpToStop(stop.at)}
                  aria-label={`Jump to ${stop.name}`}
                >
                  <span />
                  {stop.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
