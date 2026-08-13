"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Track = {
  id: string;
  title: string;
  artist: string;
  mood: string;
  duration: number;
  videoId?: string;
};

type Playlist = {
  id: string;
  name: string;
  shortName: string;
  accent: string;
  description: string;
  tracks: Track[];
};

type Theme = {
  id: string;
  name: string;
  routeLabel: string;
  image: string;
  videoWide?: string;
  videoTall?: string;
  icon: string;
};

type YouTubePlayerState = {
  data: number;
};

type YouTubePlayer = {
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

type YouTubePlayerConstructor = new (
  elementId: string | HTMLElement,
  options: {
    videoId?: string;
    host?: string;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: () => void;
      onStateChange?: (event: YouTubePlayerState) => void;
      onError?: () => void;
    };
  },
) => YouTubePlayer;

type YouTubeWindow = Window &
  typeof globalThis & {
    YT?: {
      Player: YouTubePlayerConstructor;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  };

const callYouTubePlayer = <Method extends keyof YouTubePlayer>(
  player: YouTubePlayer | null,
  method: Method,
  ...args: Parameters<YouTubePlayer[Method]>
) => {
  const playerMethod = player?.[method];

  if (typeof playerMethod !== "function") {
    return undefined;
  }

  try {
    return (
      playerMethod as (
        this: YouTubePlayer,
        ...methodArgs: Parameters<YouTubePlayer[Method]>
      ) => ReturnType<YouTubePlayer[Method]>
    ).apply(player, args);
  } catch {
    return undefined;
  }
};

const themes: Theme[] = [
  {
    id: "valley-vista",
    name: "Full Bus",
    routeLabel: "OUTSIDE BUS · UTC ROAD",
    image: "/bg/uttarakhand-bus-generated.png",
    videoWide: "/videos/valley-vista-wide.mp4",
    videoTall: "/videos/valley-vista-tall.mp4",
    icon: "▣",
  },
  {
    id: "windshield-ghats",
    name: "Passenger View",
    routeLabel: "INSIDE BUS · FRONT SEAT",
    image: "/bg/windshield-ghats.png",
    videoWide: "/videos/windshield-ghats.mp4",
    videoTall: "/videos/windshield-ghats.mp4",
    icon: "◫",
  },
  {
    id: "mountain-road-reel",
    name: "Driver View",
    routeLabel: "MOVING BUS · HILL ROAD",
    image: "/bg/uttarakhand-bus-generated.png",
    videoWide: "/videos/mountain-road-reel.mp4",
    videoTall: "/videos/mountain-road-reel.mp4",
    icon: "◨",
  },
];

const makeTrack = (
  playlistId: string,
  index: number,
  title: string,
  artist: string,
  mood: string,
  videoId?: string,
): Track => ({
  id: `${playlistId}-${index + 1}`,
  title,
  artist,
  mood,
  duration: 170 + ((index * 17) % 95),
  videoId,
});

const playlists: Playlist[] = [
  {
    id: "pahadi-safar",
    name: "🌄 Pahadi Safar",
    shortName: "Pahadi Safar",
    accent: "#f8b85f",
    description: "Garhwali and Kumaoni road-trip energy for the climb.",
    tracks: [
      ["Mero Lehenga 2", "Inder Arya, Jyoti Arya", "Kumaoni pop", "qG8_SEtqbJs"],
      ["Cream Paudara Mashakbeen", "Rakesh Khanwal, Maya Upadhyay", "wedding road", "-r-PMDXH3as"],
      ["Mandaan", "Ruhan Bhardwaj, Karishma Shah", "folk pop", "0RjvMBr3tdk"],
      ["Thal Ki Bazar", "B.K. Samant", "market energy", "ijN3PK7j6PQ"],
      ["Modern Kumaon", "Inder Arya", "new Kumaon", "EzFih09wwX8"],
      ["Dhan Singh Ki Gaadi", "Rohit Chauhan", "driver mood", "NELLERJh7dY"],
      ["Fyonladiya Twe Dekhik", "Kishan Mahipal", "Garhwali favourite", "GsqdP7lzdWM"],
      ["Bol Heera", "Inder Arya, Neeraj Dabral", "singalong", "V9u9ogqrpEs"],
      ["Hath Pereli Ghadi La", "Jitendra Tomkyal", "Kumaoni", "QZyisrYgztU"],
      ["Almora Ki Ganga", "Fauji Lalit Mohan Joshi", "long ride", "NUjwYnQx9KU"],
      ["Chhakk Chhina", "Prahlad Mehra, Mamta Arya", "folk dance", "0qqnYDiMSZs"],
      ["Chaha Ghutuk", "Govind Digari, Khushi Joshi", "chai stop", "kpPc03KCvXo"],
      ["Me Jachhu Kamala", "Chandra Prakash", "old melody", "9UqUoXo1Dtg"],
      ["Teri Rangyali Pichodi Kamu", "Pappu Karki", "classic Kumaoni", "PXD_gXBWxRA"],
      ["Hey Deepa Mijaaj", "Lalit Mohan Joshi", "crowd favourite", "ZL_C8oMbQQ0"],
      ["Dhai Hathe Dhameli", "Manoj Arya, Priyanka Meher", "celebration", "MVYkoXd_KZA"],
      ["Barandi Botala", "Sandeep Sonu", "roadside beat", "kLA6gcd0_8Q"],
      ["NAAKE KI NATHULI ME MADHULI", "Gaurav Bisht", "mela energy", "nG9w5yyyy5Y"],
      ["Hit De Sali Myar Dagada", "Rakesh Joshi, Khushi Joshi", "fun", "5bMlEKaEmJs"],
      ["Mai Pahadan", "Mamta Arya, Bhawana Kandpal", "pahadi pride", "dPExLKarsyo"],
    ].map((track, index) => makeTrack("pahadi-safar", index, track[0], track[1], track[2], track[3])),
  },
  {
    id: "baarish-seat",
    name: "🌧️ Baarish wali seat",
    shortName: "Baarish Seat",
    accent: "#86cbd8",
    description: "Soft Hindi and indie-inspired rain-window mood.",
    tracks: [
      ["Barso Re", "A.R. Rahman, Shreya Ghoshal", "monsoon", "asw-wTDzGUQ"],
      ["Rimjhim Gire Saawan", "Kishore Kumar / Lata Mangeshkar", "classic rain", "6C7R_CUJgHQ"],
      ["Iktara", "Amit Trivedi, Kavita Seth", "soft indie", "ZlOZktsODpA"],
      ["Shaam", "Amit Trivedi, Nikhil D'Souza", "evening", "fFyXcX-s0C8"],
      ["Kho Gaye Hum Kahan", "Jasleen Royal, Prateek Kuhad", "window seat", "vt4jX0iRgCg"],
      ["Kasoor", "Prateek Kuhad", "quiet", "BmUe3-sfr7E"],
      ["Baarishein", "Anuv Jain", "indie rain", "PJWemSzExXs"],
      ["Gul", "Anuv Jain", "gentle", "SmaY7RfBgas"],
      ["Alag Aasmaan", "Anuv Jain", "clouds", "vA86QFrXoho"],
      ["Kahani", "When Chai Met Toast", "warm", "TwBJ6cYnGBU"],
      ["Aise Kyun", "Anurag Saikia, Rekha Bhardwaj", "soft question", "YjllO7-K9k4"],
      ["Rehna Tu", "A.R. Rahman", "late rain", "ZYGyuaEU2aA"],
      ["Phir Le Aya Dil", "Pritam, Arijit Singh", "melancholy", "k6BnSIs3XUQ"],
      ["Agar Tum Saath Ho", "A.R. Rahman, Alka Yagnik, Arijit Singh", "heavy rain", "sK7riqg2mr4"],
      ["Saibo", "Sachin-Jigar, Shreya Ghoshal", "drizzle", "kQkH6Ch8Kbg"],
      ["O Sanam", "Lucky Ali", "nostalgia", "dWqb-WqbGh8"],
      ["Dil Mere", "The Local Train", "indie rock", "qLCLvzTGFVM"],
      ["Aaoge Tum Kabhi", "The Local Train", "hope", "i96UO8-GFvw"],
      ["Monta Re", "Amit Trivedi", "travel", "99NUJ1cLbBI"],
      ["Yeh Haseen Vadiyan", "A.R. Rahman, S.P. Balasubrahmanyam", "mountain rain", "5kZ5o-oM0RI"],
    ].map((track, index) => makeTrack("baarish-seat", index, track[0], track[1], track[2], track[3])),
  },
  {
    id: "khidki-romantic",
    name: "❤️ Khidki wali playlist",
    shortName: "Khidki Wali",
    accent: "#ff8c8c",
    description: "Romantic songs for staring dramatically out of the window.",
    tracks: [
      ["Pehla Nasha", "Udit Narayan, Sadhana Sargam", "first love", "SBfPs-PMGTA"],
      ["Tum Se Hi", "Mohit Chauhan", "road romance", "Cb6wuzOurPc"],
      ["Tera Hone Laga Hoon", "Atif Aslam, Alisha Chinai", "glow", "rTuxUAuJRyY"],
      ["Raabta", "Arijit Singh", "connection", "vEe-UgJvUHE"],
      ["Hawayein", "Pritam, Arijit Singh", "mountain wind", "YQZMG-4gcdQ"],
      ["Agar Tum Saath Ho", "Alka Yagnik, Arijit Singh", "heartbreak", "fs7-8M1VbZU"],
      ["Kabira", "Tochi Raina, Rekha Bhardwaj", "leaving", "jHNNMj5bNQw"],
      ["Iktara", "Kavita Seth", "soft", "ZlOZktsODpA"],
      ["Ranjha", "B Praak, Jasleen Royal", "longing", "V7LwfY5U5WI"],
      ["Kesariya", "Arijit Singh", "warm", "BddP6PYo2gs"],
      ["Mast Magan", "Arijit Singh, Chinmayi", "devoted", "lVpZaByCWUE"],
      ["Zehnaseeb", "Chinmayi, Shekhar Ravjiani", "sweet", "KLYwt0YmQw8"],
      ["Ajab Si", "KK", "starlit", "7KKVb0_IdD4"],
      ["Khuda Jaane", "KK, Shilpa Rao", "wide sky", "cmMiyZaSELo"],
      ["Tujh Mein Rab Dikhta Hai", "Roop Kumar Rathod", "classic", "qoq8B8ThgEM"],
      ["Pani Da Rang", "Ayushmann Khurrana", "gentle", "EiItLWWxgOI"],
      ["Sage", "Ritviz", "modern", "_kUrW9SEaJc"],
      ["Liggi", "Ritviz", "playful", "6BYIKEH0RCQ"],
      ["Aankhon Se Batana", "Dikshant", "indie romance", "2vKMY75kvjI"],
      ["Waqt Ki Baatein", "Dream Note", "wistful", "b-K4oDRk04M"],
    ].map((track, index) => makeTrack("khidki-romantic", index, track[0], track[1], track[2], track[3])),
  },
  {
    id: "last-bus",
    name: "🌙 Last Bus",
    shortName: "Last Bus",
    accent: "#a8a5ff",
    description: "Night songs for the final ride back through the hills.",
    tracks: [
      ["Phir Se Ud Chala", "Mohit Chauhan", "night drive", "2mWaqsC3U7k"],
      ["Kun Faya Kun", "A.R. Rahman, Javed Ali, Mohit Chauhan", "spiritual", "T94PHkuydcw"],
      ["Safarnama", "Lucky Ali", "traveller", "sOhESxhibAM"],
      ["Ilahi", "Arijit Singh", "wandering", "fdubeMFwuGs"],
      ["Aao Milo Chale", "Shaan, Ustad Sultan Khan", "road", "Mo5tQDcs__g"],
      ["Khaabon Ke Parinday", "Alyssa Mendonsa, Mohit Chauhan", "open", "R0XjwtP_iTY"],
      ["Yun Hi Chala Chal", "Udit Narayan, Hariharan, Kailash Kher", "journey", "eEeX2QMlSlo"],
      ["Journey Song", "Anupam Roy, Shreya Ghoshal", "train-road", "2__nNm0NK4A"],
      ["Aazaadiyan", "Amit Trivedi, Neuman Pinto", "release", "ugm2SOScEqA"],
      ["Nadaan Parindey", "A.R. Rahman, Mohit Chauhan", "late", "6MgsHSAcI9k"],
      ["Shaam Tanha", "Agnee", "quiet night", "mmd82Jc987E"],
      ["Aahatein", "Agnee", "dim lights", "-P7M0Y635eg"],
      ["Choo Lo", "The Local Train", "after dark", "sFMRqxCexDk"],
      ["Aaftaab", "The Local Train", "night sky", "U77d9912lrw"],
      ["Khoj", "When Chai Met Toast", "dream", "LMEdbBK4bk0"],
      ["Cold/Mess", "Prateek Kuhad", "midnight", "Il7Nv270zNk"],
      ["Tune Kaha", "Prateek Kuhad", "soft", "miXdVbIm5BY"],
      ["Riha", "Anuv Jain", "alone", "9et5qzuzbQM"],
      ["Maula Mere Maula", "Roop Kumar Rathod", "still", "l5sgIqzlPXc"],
      ["Alvida", "KK", "last stop", "hM9QDpLHhdw"],
    ].map((track, index) => makeTrack("last-bus", index, track[0], track[1], track[2], track[3])),
  },
  {
    id: "driver-choice",
    name: "📻 Driver ki Pasand",
    shortName: "Driver Choice",
    accent: "#f4df74",
    description: "Completely random old-school classics energy.",
    tracks: [
      ["Yeh Dosti", "Kishore Kumar, Manna Dey", "classic", "TmwhijUQruQ"],
      ["Zindagi Ek Safar Hai Suhana", "Kishore Kumar", "road", "mzxHflxI-es"],
      ["Musafir Hoon Yaaron", "Kishore Kumar", "traveller", "cHLgOcsngTI"],
      ["O Mere Dil Ke Chain", "Kishore Kumar", "easy", "5eyflIV8pzM"],
      ["Pal Pal Dil Ke Paas", "Kishore Kumar", "romantic classic", "AMuRRXCuy-4"],
      ["Gulabi Aankhen", "Mohammed Rafi", "fun", "KWAdrB2U7cE"],
      ["Khaike Paan Banaras Wala", "Kishore Kumar", "driver mood", "aEqoUHDCris"],
      ["Inteha Ho Gayi Intezaar Ki", "Kishore Kumar, Asha Bhosle", "late", "hORheQwpuuc"],
      ["Neele Neele Ambar Par", "Kishore Kumar", "sky", "ThHYiiZTB1Y"],
      ["Ek Ajnabee Haseena Se", "Kishore Kumar", "memory", "eRDojLoCDpQ"],
      ["Chura Liya Hai Tumne", "Asha Bhosle, Mohammed Rafi", "tape favourite", "RtRpy-B_wno"],
      ["Roop Tera Mastana", "Kishore Kumar", "old gold", "wKQVoA9UVEQ"],
      ["Dum Maro Dum", "Asha Bhosle", "random classic", "kOrRYDJ4AuY"],
      ["Aane Wala Pal", "Kishore Kumar", "soft", "kaQYhGdUQpQ"],
      ["Kahin Door Jab Din Dhal Jaye", "Mukesh", "evening", "lEVl_lC7vMs"],
      ["Main Pal Do Pal Ka Shair Hoon", "Mukesh", "philosophical", "QkGqpVYjLUw"],
      ["Chaudhvin Ka Chand Ho", "Mohammed Rafi", "moon", "uAsM_D5oO9c"],
      ["Lag Ja Gale", "Lata Mangeshkar", "timeless", "y2fgw1Oqz28"],
      ["Ajeeb Dastan Hai Yeh", "Lata Mangeshkar", "classic", "D3b0UU27H4A"],
      ["Mere Sapno Ki Rani", "Kishore Kumar", "bus singalong", "9PdSmDRGIwM"],
    ].map((track, index) => makeTrack("driver-choice", index, track[0], track[1], track[2], track[3])),
  },
  {
    id: "apna-uttarakhand",
    name: "🏔️ Apna Uttarakhand",
    shortName: "Uttarakhand",
    accent: "#9ce0ad",
    description: "Uttarakhand favourites placeholder list for official sources.",
    tracks: [
      ["Mera Aurah Se", "Narendra Singh Negi", "Negi favourite", "NgnYqliCw44"],
      ["Danda Dharu Ma", "Narendra Singh Negi", "Garhwali", "X71lc5KXsFM"],
      ["Mera Hathu Ki Dhan", "Narendra Singh Negi", "Garhwali", "NMM4yY7rjVM"],
      ["Mul Mul KyeKu", "Narendra Singh Negi", "folk", "e8FJbUvLKss"],
      ["Ghagri Ka Ghera", "Narendra Singh Negi", "dance", "Rtd2VJbcq0U"],
      ["Machi Panni Si", "Narendra Singh Negi", "classic", "UJcZAkwUdfw"],
      ["Suma He Nihorya", "Narendra Singh Negi", "memory", "rTw7CYnOoQM"],
      ["Tilledharu Bola", "Narendra Singh Negi", "Utranchali lok geet", "5IaG7MxrVkc"],
      ["Jhumki Le Je Bina", "Narendra Singh Negi", "folk", "VEDVN4nVGrg"],
      ["Supinya Samjhi", "Narendra Singh Negi", "soft", "TcCTbX8dYyY"],
      ["Jeka Bana Boliya", "Narendra Singh Negi", "folk", "7HfxKxlMR30"],
      ["Baand Bijora", "Narendra Singh Negi", "popular", "wBF7eMSUlQc"],
      ["Maalu Gauralu Ka Beech", "Narendra Singh Negi", "classic", "hsY70MX8kVY"],
      ["Teri Peeda Ma Dui Aansu", "Narendra Singh Negi", "emotional", "UBqPpx0V51A"],
      ["Tumari Maya Maa", "Narendra Singh Negi", "romantic folk", "hHcNlw8P7xw"],
      ["Ek Saril Ek Man Hoigi", "Narendra Singh Negi", "folk", "bxCCMhSH6mU"],
      ["Laagi Baduli", "Narendra Singh Negi", "modern favourite", "Wyl3yOpsDMs"],
      ["Otuwa Belena", "Narendra Singh Negi", "pahadi", "GmJqs8hKl_0"],
      ["Kali Ratbyon", "Narendra Singh Negi", "night folk", "K8Bjqze50Vs"],
      ["Harshu Mama", "Narendra Singh Negi, Meena Rana", "Uttarakhand favourite", "M0VwXQshets"],
    ].map((track, index) => makeTrack("apna-uttarakhand", index, track[0], track[1], track[2], track[3])),
  },
];

function formatTime(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return <span className="clock">{time}</span>;
}

function PlayerButton({
  label,
  onClick,
  symbol,
  variant = "ghost",
}: {
  label: string;
  onClick: () => void;
  symbol: string;
  variant?: "ghost" | "play";
}) {
  return (
    <button
      type="button"
      className={variant === "play" ? "control-button play-control" : "control-button"}
      onClick={onClick}
      aria-label={label}
    >
      <span aria-hidden="true">{symbol}</span>
    </button>
  );
}

function SeekBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const seekFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const position = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeek(position * duration);
  };

  return (
    <div
      ref={ref}
      className="seek-hit touch-none"
      onPointerDown={seekFromPointer}
      role="slider"
      aria-label="Seek"
      aria-valuemax={Math.round(duration)}
      aria-valuemin={0}
      aria-valuenow={Math.round(currentTime)}
      tabIndex={0}
    >
      <span className="seek-rail">
        <span className="seek-fill" style={{ width: `${percent}%` }} />
        <span className="seek-knob" style={{ left: `${percent}%` }} />
      </span>
    </div>
  );
}

function MiniBus({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className={isPlaying ? "mini-bus moving" : "mini-bus"} aria-hidden="true">
      <span className="bus-body" />
      <span className="wheel one" />
      <span className="wheel two" />
    </div>
  );
}

export default function RadioSite() {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const youtubeContainerRef = useRef<HTMLDivElement | null>(null);
  const requestedAutoplayRef = useRef(false);
  const endedRef = useRef(false);
  const nextTrackRef = useRef<() => void>(() => {});
  const fallbackDurationRef = useRef(0);
  const [themeIndex, setThemeIndex] = useState(0);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [playerNotice, setPlayerNotice] = useState("");

  const playlist = playlists[playlistIndex];
  const track = playlist.tracks[trackIndex];
  const theme = themes[themeIndex];
  const journeyPercent = Math.min(100, ((trackIndex + 1) / playlist.tracks.length) * 100);
  const youtubeQuery = `${track.title} ${track.artist} official song`;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`;
  const displayedDuration = duration || track.duration;
  fallbackDurationRef.current = track.duration;

  const togglePlayback = async () => {
    if (isPlaying) {
      callYouTubePlayer(playerRef.current, "pauseVideo");
      setIsPlaying(false);
      return;
    }

    if (!track.videoId) {
      setPlayerNotice("Opening YouTube search for the real track");
      window.open(youtubeSearchUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setPlayerNotice("");
    requestedAutoplayRef.current = true;
    callYouTubePlayer(playerRef.current, "playVideo");
    setIsPlaying(true);
  };

  const selectTrack = (nextPlaylistIndex: number, nextTrackIndex: number) => {
    const nextTrackItem = playlists[nextPlaylistIndex].tracks[nextTrackIndex];

    setPlaylistIndex(nextPlaylistIndex);
    setTrackIndex(nextTrackIndex);
    setCurrentTime(0);
    setDuration(0);
    setPlayerNotice("");
    endedRef.current = false;

    if (!nextTrackItem.videoId) {
      callYouTubePlayer(playerRef.current, "pauseVideo");
      setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      requestedAutoplayRef.current = true;
    }
  };

  const nextTrack = () => {
    selectTrack(playlistIndex, (trackIndex + 1) % playlist.tracks.length);
  };

  nextTrackRef.current = nextTrack;

  const previousTrack = () => {
    selectTrack(playlistIndex, (trackIndex - 1 + playlist.tracks.length) % playlist.tracks.length);
  };

  const nextTheme = () => {
    setThemeIndex((index) => (index + 1) % themes.length);
  };

  const seekTrack = (time: number) => {
    setCurrentTime(time);
    callYouTubePlayer(playerRef.current, "seekTo", time, true);
  };

  useEffect(() => {
    const browserWindow = window as YouTubeWindow;
    const existingReadyCallback = browserWindow.onYouTubeIframeAPIReady;

    const createPlayer = () => {
      const container = youtubeContainerRef.current;

      if (!browserWindow.YT || playerRef.current || !container) {
        return;
      }

      container.replaceChildren();
      const mount = document.createElement("div");
      container.appendChild(mount);

      playerRef.current = new browserWindow.YT.Player(mount, {
        host: "https://www.youtube.com",
        videoId: track.videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
          events: {
            onReady: () => {
              setIsPlayerReady(true);
              setDuration(callYouTubePlayer(playerRef.current, "getDuration") || fallbackDurationRef.current);
            },
          onStateChange: (event) => {
            const state = browserWindow.YT?.PlayerState;

            if (!state) {
              return;
            }

            if (event.data === state.PLAYING) {
              setIsPlaying(true);
              setPlayerNotice("");
              setDuration(callYouTubePlayer(playerRef.current, "getDuration") || fallbackDurationRef.current);
            }

            if (event.data === state.PAUSED) {
              setIsPlaying(false);
            }

            if (event.data === state.ENDED && !endedRef.current) {
              endedRef.current = true;
              setIsPlaying(false);
              nextTrackRef.current();
            }
          },
          onError: () => {
            setIsPlaying(false);
            setPlayerNotice("This YouTube video cannot be played here");
          },
        },
      });
    };

    if (browserWindow.YT?.Player) {
      createPlayer();
    } else {
      browserWindow.onYouTubeIframeAPIReady = () => {
        existingReadyCallback?.();
        createPlayer();
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      if (browserWindow.onYouTubeIframeAPIReady !== existingReadyCallback) {
        browserWindow.onYouTubeIframeAPIReady = existingReadyCallback;
      }

      callYouTubePlayer(playerRef.current, "destroy");
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isPlayerReady || !track.videoId) {
      return;
    }

    endedRef.current = false;

    if (requestedAutoplayRef.current || isPlaying) {
      callYouTubePlayer(playerRef.current, "loadVideoById", track.videoId);
    } else {
      callYouTubePlayer(playerRef.current, "cueVideoById", track.videoId);
    }
  }, [isPlayerReady, track.videoId]);

  useEffect(() => {
    if (!isPlayerReady) {
      return;
    }

    const timer = window.setInterval(() => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      const nextCurrentTime = callYouTubePlayer(player, "getCurrentTime");
      const nextDuration = callYouTubePlayer(player, "getDuration");

      if (Number.isFinite(nextCurrentTime)) {
        setCurrentTime(nextCurrentTime);
      }

      if (Number.isFinite(nextDuration) && nextDuration > 0) {
        setDuration(nextDuration);
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, [isPlayerReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT") {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        void togglePlayback();
      }

      if (event.key === "ArrowRight") {
        const nextTime = Math.min(displayedDuration, currentTime + 10);
        seekTrack(nextTime);
      }

      if (event.key === "ArrowLeft") {
        const nextTime = Math.max(0, currentTime - 10);
        seekTrack(nextTime);
      }

      if (event.key.toLowerCase() === "n") {
        nextTrack();
      }

      if (event.key.toLowerCase() === "p") {
        previousTrack();
      }

      if (event.key.toLowerCase() === "q") {
        setIsLibraryOpen((open) => !open);
      }

      if (event.key.toLowerCase() === "t") {
        nextTheme();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentTime, displayedDuration, isPlaying, playlistIndex, track.duration, trackIndex]);

  const pageStyle = {
    "--accent": playlist.accent,
    "--journey": `${journeyPercent}%`,
    "--scene-image": `url("${theme.image}")`,
  } as React.CSSProperties;

  const listenerCount = useMemo(
    () => (931 + playlistIndex * 137 + trackIndex * 19).toLocaleString("en-IN"),
    [playlistIndex, trackIndex],
  );

  return (
    <main className={`radio-shell theme-${theme.id}`} style={pageStyle}>
      {theme.videoWide ? (
        <video
          key={`${theme.id}-wide`}
          className="hero-video wide"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={theme.image}
        >
          <source src={theme.videoWide} type="video/mp4" />
        </video>
      ) : null}
      {theme.videoTall ? (
        <video
          key={`${theme.id}-tall`}
          className="hero-video tall"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={theme.image}
        >
          <source src={theme.videoTall} type="video/mp4" />
        </video>
      ) : null}
      <div className="hero-bg" />
      <div className="windshield-world" aria-hidden="true">
        <span className="depth-layer mountains" />
        <span className="depth-layer forest" />
        <span className="depth-layer road" />
        <span className="depth-layer roadside" />
        <span className="pass-object pole one" />
        <span className="pass-object tree two" />
      </div>
      <div className="hero-pan" />
      <div className="road-motion" />
      <div className="fog-layer" />
      <div className="hero-shade" />
      <div className="grain" />

      <div className="brand-corner">
        <span className="brand-icon">{theme.icon}</span>
        <div>
          <strong>बस सफर</strong>
          <em>{theme.routeLabel}</em>
        </div>
      </div>

      <div className="status-corner">
        <Clock />
        <label className="theme-select">
          <span>Theme</span>
          <select
            value={theme.id}
            onChange={(event) => {
              const nextIndex = themes.findIndex((item) => item.id === event.target.value);

              if (nextIndex >= 0) {
                setThemeIndex(nextIndex);
              }
            }}
          >
            {themes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="library-toggle" onClick={() => setIsLibraryOpen((open) => !open)}>
          {isLibraryOpen ? "Close queue" : "Queue"}
        </button>
        <span className="listeners">{listenerCount} aboard</span>
      </div>

      <section className="route-title" aria-label="Route">
        <span>{playlist.tracks.length} tracks · non-stop</span>
        <p>देहरादून से मसूरी</p>
        <em>{playlist.shortName}</em>
      </section>

      <div className={isPlaying ? "center-bus moving" : "center-bus"} aria-hidden="true">
        <span className="center-bus-roof" />
        <span className="center-bus-body" />
        <span className="center-bus-window one" />
        <span className="center-bus-window two" />
        <span className="center-bus-window three" />
        <span className="center-wheel one" />
        <span className="center-wheel two" />
      </div>

      <div className="route-strip" aria-label="Journey progress">
        <span>{playlist.shortName}</span>
        <i>
          <b style={{ width: `${journeyPercent}%` }} />
        </i>
        <span>{Math.round(journeyPercent)}%</span>
      </div>

      <aside className={isLibraryOpen ? "library-panel open" : "library-panel"} aria-label="Playlist library">
        <div className="library-head">
          <div>
            <span>{playlist.tracks.length} tracks</span>
            <strong>{playlist.name}</strong>
          </div>
          <button type="button" onClick={() => setIsLibraryOpen(false)} aria-label="Close queue">
            ×
          </button>
        </div>
        <div className="category-list">
          {playlists.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={index === playlistIndex ? "active" : ""}
              onClick={() => selectTrack(index, 0)}
              style={{ "--category-accent": item.accent } as React.CSSProperties}
            >
              <strong>{item.name}</strong>
              <span>{item.tracks.length} songs</span>
            </button>
          ))}
        </div>
        <div className="song-list">
          {playlist.tracks.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={index === trackIndex ? "active" : ""}
              onClick={() => selectTrack(playlistIndex, index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
              <em>{item.artist}</em>
            </button>
          ))}
        </div>
        <button type="button" className="share-row">
          <span>⇧</span>
          <strong>Share the bus</strong>
          <em>dehradun-mussoorie.local</em>
        </button>
      </aside>

      <div className="youtube-frame" ref={youtubeContainerRef} />

      <section className="player-card" aria-label="Music controls">
        <MiniBus isPlaying={isPlaying} />
        <div className="track-copy">
          <p>{track.title}</p>
          <span>
            {track.artist} · {track.mood}
          </span>
          {playerNotice || !track.videoId ? <em className="audio-warning">{playerNotice || "Needs YouTube video ID"}</em> : null}
        </div>
        <SeekBar currentTime={currentTime} duration={displayedDuration} onSeek={seekTrack} />
        <div className="player-bottom">
          <span>{formatTime(currentTime)}</span>
          <div className="transport">
            <PlayerButton label="Previous song" onClick={previousTrack} symbol="‹" />
            <PlayerButton label={isPlaying ? "Pause" : "Play"} onClick={togglePlayback} symbol={isPlaying ? "Ⅱ" : "▶"} variant="play" />
            <PlayerButton label="Next song" onClick={nextTrack} symbol="›" />
          </div>
          <span>{formatTime(displayedDuration)}</span>
        </div>
      </section>

      <div className="shortcut-row" aria-hidden="true">
        <span><kbd>Space</kbd> Play / Pause</span>
        <span><kbd>←</kbd><kbd>→</kbd> Seek</span>
        <span><kbd>N</kbd><kbd>P</kbd> Track</span>
        <span><kbd>Q</kbd> Queue</span>
        <span><kbd>T</kbd> Theme</span>
      </div>
    </main>
  );
}
