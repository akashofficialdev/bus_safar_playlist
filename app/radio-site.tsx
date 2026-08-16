"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

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
  youtubePlaylistId?: string;
  youtubePlaylistUrl?: string;
  tracks: Track[];
};

type Theme = {
  id: string;
  name: string;
  routeLabel: string;
  image: string;
  videoWide?: string;
  videoTall?: string;
};

type YouTubePlayerState = {
  data: number;
};

type YouTubePlayer = {
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  loadPlaylist: (playlist: YouTubePlaylistRequest) => void;
  cuePlaylist: (playlist: YouTubePlaylistRequest) => void;
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
      onAutoplayBlocked?: () => void;
    };
  },
) => YouTubePlayer;

type YouTubePlaylistRequest = {
  listType: "playlist";
  list: string;
  index?: number;
  startSeconds?: number;
};

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
  if (!player) {
    return undefined;
  }

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
  },
  {
    id: "windshield-ghats",
    name: "Passenger View",
    routeLabel: "INSIDE BUS · FRONT SEAT",
    image: "/bg/windshield-ghats.png",
    videoWide: "/videos/windshield-ghats.mp4",
    videoTall: "/videos/windshield-ghats.mp4",
  },
  {
    id: "mountain-road-reel",
    name: "Driver View",
    routeLabel: "MOVING BUS · HILL ROAD",
    image: "/bg/uttarakhand-bus-generated.png",
    videoWide: "/videos/mountain-road-reel.mp4",
    videoTall: "/videos/mountain-road-reel.mp4",
  },
];

const instagramUrl = "https://www.instagram.com/akashinthesky_/";
const pahadiSafarPlaylistId = "PL4evSRTkAueHrypEakuqCDboJWCBAosMO";
const pahadiSafarPlaylistUrl = `https://music.youtube.com/playlist?list=${pahadiSafarPlaylistId}`;
const routeTitleText = "देहरादून से मसूरी";
const routeTitleLetters = Array.from(
  new Intl.Segmenter("hi", { granularity: "grapheme" }).segment(routeTitleText),
  ({ segment }) => segment,
);
const hornUrls = [
  "/audio/horn-real-truck.mp3",
  "/audio/horn-real-truck.mp3",
  "/audio/horn-real-truck.mp3",
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

const getYouTubeThumbnailUrl = (track: Track) => (track.videoId ? `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg` : "");

function YouTubeThumbnail({ className, index, track }: { className: string; index?: number; track: Track }) {
  const thumbnailUrl = getYouTubeThumbnailUrl(track);

  return (
    <span className={className}>
      {thumbnailUrl ? <img src={thumbnailUrl} alt="" loading="lazy" draggable={false} /> : null}
      {typeof index === "number" ? <i>{String(index + 1).padStart(2, "0")}</i> : null}
    </span>
  );
}

const playlists: Playlist[] = [
  {
    id: "pahadi-safar",
    name: "🌄 Pahadi Safar",
    shortName: "Pahadi Safar",
    accent: "#f8b85f",
    description: "Garhwali and Kumaoni road-trip energy for the climb.",
    youtubePlaylistId: pahadiSafarPlaylistId,
    youtubePlaylistUrl: pahadiSafarPlaylistUrl,
    tracks: [
      ["Hey Madhu", "Inder Arya", "Kumaoni pop", "1ipJZHXol-U"],
      ["Gulabi Sharara", "Inder Arya, Rakesh Joshi", "Kumaoni hit", "4cw3x0tU-pk"],
      ["Dhana", "Pahadi Safar", "folk pop", "OqDqIt2Qq9k"],
      ["Ghumai De", "Pahadi Safar", "road dance", "5gCKYGSHkvI"],
      ["Thal Ki Bazar", "B.K. Samant", "market energy", "ijN3PK7j6PQ"],
      ["Chaitwali", "Pahadi Safar", "Garhwali favourite", "uoRotsLAHWk"],
      ["Cream Paudara", "Pahadi Safar", "wedding road", "rq4i7v7UUww"],
      ["Fyonladiya Twe Dekhik", "Pahadi Safar", "Garhwali favourite", "9sVApD1gYBM"],
      ["Roop Ku Mantar", "Priyanka Meher, Vivek Nautiyal", "visualizer", "Q2qgdDjxCcA"],
      ["Meri Bamani", "Pahadi Safar", "singalong", "EOdR5RWR7N0"],
      ["Tak Taka Tak Kamla", "Pahadi Safar", "Pahari pop", "DR6nZHZnBR0"],
      ["RAMM JHAMA", "Vivek Nautiyal", "dance", "c_JA4lxZ9U8"],
      ["Jeetu Bagdwal", "Shraddha Kuhupriya", "folk story", "Y4BPI5oRbL4"],
      ["Nanda Tero Dola Live", "Pahadi Safar", "live folk", "XouvXw1QeQA"],
      ["Mathu Mathu", "Pahadi Safar", "Uttarakhandi", "P8rtpO93Iu0"],
      ["Yo Mero Pahad", "B.K. Samant", "mountain pride", "lcF2wFFIiBY"],
      ["BASANTI CHHYODI", "Pahadi Safar", "folk dance", "Axt8ZnbXiaI"],
      ["Fwa Baga Re", "Pahadi Safar", "Pahari", "HmVx5EeYHHg"],
      ["Gopuli", "Kumauni Folk Song", "folk classic", "L9eSWavZFWE"],
      ["Bedu Pako", "Uttarakhandi Folk Song", "folk classic", "9qt5qOQx0eE"],
      ["Thando Re Thando", "Pahadi Safar", "cool breeze", "J20uF1L6B9w"],
      ["Surma Sarela", "Pahadi Safar", "roadside beat", "dbP2M5dhylA"],
      ["Nuchami Narina", "Pahadi Safar", "folk groove", "h0pLTDtj-GM"],
      ["Dharti Hamara Garhwala Ki", "Narendra Singh Negi", "Garhwali song", "TzcHbGNO_Vs"],
      ["Laska Dhasko Ma Chali", "Pahadi Safar", "dance", "wMx1r8v-VQk"],
      ["Ramdai Ka Hotel", "Pahadi Safar", "chai stop", "5VQVws46VOo"],
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

function TrackCover({ isPlaying, track }: { isPlaying: boolean; track: Track }) {
  return (
    <div className={isPlaying ? "mini-bus cover-disc moving" : "mini-bus cover-disc"} aria-hidden="true">
      <YouTubeThumbnail className="cover-art" track={track} />
      <span className="cover-hole" />
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
  const hornAudioRef = useRef<HTMLAudioElement[]>([]);
  const lastHornAtRef = useRef(0);
  const hornPresetIndexRef = useRef(-1);
  const isHornUnlockedRef = useRef(false);
  const hornButtonTimerRef = useRef<number | null>(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [isSocialBrowser, setIsSocialBrowser] = useState(false);
  const [isDirectPlayerOpen, setIsDirectPlayerOpen] = useState(false);
  const [isRouteActive, setIsRouteActive] = useState(false);
  const [isHornButtonActive, setIsHornButtonActive] = useState(false);
  const [activeRouteLetter, setActiveRouteLetter] = useState<number | null>(null);
  const [routeWaveId, setRouteWaveId] = useState(0);
  const [playerNotice, setPlayerNotice] = useState("");

  const playlist = playlists[playlistIndex];
  const track = playlist.tracks[trackIndex];
  const theme = themes[themeIndex];
  const journeyPercent = Math.min(100, ((trackIndex + 1) / playlist.tracks.length) * 100);
  const youtubeQuery = `${track.title} ${track.artist} official song`;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`;
  const youtubeOpenUrl = playlist.youtubePlaylistUrl ?? (track.videoId ? `https://www.youtube.com/watch?v=${track.videoId}` : youtubeSearchUrl);
  const youtubePlaylistRequest = useMemo(
    () =>
      playlist.youtubePlaylistId
        ? ({
            listType: "playlist",
            list: playlist.youtubePlaylistId,
            index: trackIndex,
          } satisfies YouTubePlaylistRequest)
        : null,
    [playlist.youtubePlaylistId, trackIndex],
  );
  const displayedDuration = duration || track.duration;

  const renderRouteLetters = () =>
    routeTitleLetters.map((letter, index) => {
      const isSpace = letter === " ";
      const waveDistance = activeRouteLetter === null ? 0 : Math.abs(index - activeRouteLetter);

      return (
        <span
          className={`route-letter${isSpace ? " space" : ""}${activeRouteLetter === index ? " active" : ""}`}
          key={`${letter}-${index}-${routeWaveId}`}
          onPointerEnter={
            isSpace
              ? undefined
              : () => {
                  setIsRouteActive(true);
                  setActiveRouteLetter(index);
                  setRouteWaveId((id) => id + 1);
                }
          }
          style={
            {
              "--route-letter-index": index,
              "--route-wave-distance": waveDistance,
            } as React.CSSProperties
          }
        >
          {letter}
        </span>
      );
    });

  const togglePlayback = async () => {
    if (isPlaying) {
      callYouTubePlayer(playerRef.current, "pauseVideo");
      setIsPlaying(false);
      return;
    }

    if (!track.videoId && !youtubePlaylistRequest) {
      setPlayerNotice("Opening YouTube for the real track");
      window.open(youtubeOpenUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setPlayerNotice("");
    requestedAutoplayRef.current = true;

    if (isSocialBrowser) {
      flushSync(() => setIsDirectPlayerOpen(true));
    }

    if (!isPlayerReady) {
      setPlayerNotice(isSocialBrowser ? "Tap play in the YouTube player" : "Loading the player...");
      return;
    }

    callYouTubePlayer(playerRef.current, "playVideo");
    setIsPlaying(true);
  };

  const selectTrack = (nextPlaylistIndex: number, nextTrackIndex: number) => {
    const nextTrackItem = playlists[nextPlaylistIndex].tracks[nextTrackIndex];

    requestedAutoplayRef.current = true;
    setPlaylistIndex(nextPlaylistIndex);
    setTrackIndex(nextTrackIndex);
    setCurrentTime(0);
    setDuration(0);
    setPlayerNotice("");
    setIsLibraryOpen(false);
    endedRef.current = false;

    if (!nextTrackItem.videoId) {
      callYouTubePlayer(playerRef.current, "pauseVideo");
      setIsPlaying(false);
      return;
    }

    if (!isPlayerReady) {
      setPlayerNotice(isSocialBrowser ? "Tap play in the YouTube player" : "Loading the player...");
      return;
    }

    if (nextPlaylistIndex === playlistIndex && nextTrackIndex === trackIndex) {
      callYouTubePlayer(playerRef.current, "playVideo");
    }

    setIsPlaying(true);
  };

  const selectPlaylistCategory = (nextPlaylistIndex: number) => {
    setPlaylistIndex(nextPlaylistIndex);
    setTrackIndex(0);
    setCurrentTime(0);
    setDuration(0);
    setPlayerNotice("");
    endedRef.current = false;
    requestedAutoplayRef.current = false;
  };

  const nextTrack = () => {
    selectTrack(playlistIndex, (trackIndex + 1) % playlist.tracks.length);
  };

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

  const playPahadiHorn = () => {
    const nowMs = window.performance.now();

    if (nowMs - lastHornAtRef.current < 1100) {
      return;
    }

    lastHornAtRef.current = nowMs;

    try {
      if (!hornAudioRef.current.length) {
        hornAudioRef.current = hornUrls.map((url) => {
          const audio = new Audio(url);
          audio.preload = "auto";
          audio.volume = 0.9;
          return audio;
        });
      }

      hornPresetIndexRef.current = (hornPresetIndexRef.current + 1) % hornAudioRef.current.length;

      const horn = hornAudioRef.current[hornPresetIndexRef.current];
      horn.pause();
      horn.muted = false;
      horn.currentTime = 0;
      horn
        .play()
        .then(() => {
          isHornUnlockedRef.current = true;
        })
        .catch(() => {
          isHornUnlockedRef.current = false;
        });
    } catch {
      // Ignore browsers that block hover audio before the first user gesture.
    }
  };

  const unlockHorns = () => {
    if (isHornUnlockedRef.current) {
      return;
    }

    try {
      if (!hornAudioRef.current.length) {
        hornAudioRef.current = hornUrls.map((url) => {
          const audio = new Audio(url);
          audio.preload = "auto";
          audio.volume = 0.9;
          return audio;
        });
      }

      const horn = hornAudioRef.current[0];
      horn.muted = true;
      horn.currentTime = 0;
      horn
        .play()
        .then(() => {
          horn.pause();
          horn.currentTime = 0;
          horn.muted = false;
          isHornUnlockedRef.current = true;
        })
        .catch(() => {
          horn.muted = false;
        });
    } catch {
      // Audio unlock is best-effort; hover will retry after the next gesture.
    }
  };

  const triggerHornOkButton = () => {
    if (hornButtonTimerRef.current) {
      window.clearTimeout(hornButtonTimerRef.current);
    }

    setIsHornButtonActive(false);
    window.requestAnimationFrame(() => {
      setIsHornButtonActive(true);
      hornButtonTimerRef.current = window.setTimeout(() => {
        setIsHornButtonActive(false);
        hornButtonTimerRef.current = null;
      }, 680);
    });

    playPahadiHorn();
  };

  useEffect(() => {
    fallbackDurationRef.current = track.duration;
  }, [track.duration]);

  useEffect(
    () => () => {
      if (hornButtonTimerRef.current) {
        window.clearTimeout(hornButtonTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    setIsSocialBrowser(/Instagram|FBAN|FBAV/i.test(window.navigator.userAgent));
  }, []);

  useEffect(() => {
    nextTrackRef.current = nextTrack;
  });

  useEffect(() => {
    const browserWindow = window as YouTubeWindow;
    const isSocialWebView = /Instagram|FBAN|FBAV/i.test(window.navigator.userAgent);
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
          ...(playlist.youtubePlaylistId
            ? {
                listType: "playlist",
                list: playlist.youtubePlaylistId,
              }
            : {}),
        },
          events: {
            onReady: () => {
              setIsPlayerReady(true);
              setDuration(callYouTubePlayer(playerRef.current, "getDuration") || fallbackDurationRef.current);

              if (requestedAutoplayRef.current) {
                callYouTubePlayer(playerRef.current, "playVideo");
              }
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
            setIsDirectPlayerOpen(isSocialWebView);
            setPlayerNotice("This video cannot play inside this browser");
          },
          onAutoplayBlocked: () => {
            setIsPlaying(false);
            setIsDirectPlayerOpen(true);
            setPlayerNotice("Tap play in the YouTube player");
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
    if (!isPlayerReady || (!track.videoId && !youtubePlaylistRequest)) {
      return;
    }

    endedRef.current = false;

    if (youtubePlaylistRequest) {
      if (requestedAutoplayRef.current) {
        callYouTubePlayer(playerRef.current, "loadPlaylist", youtubePlaylistRequest);
      } else {
        callYouTubePlayer(playerRef.current, "cuePlaylist", youtubePlaylistRequest);
      }

      return;
    }

    if (!track.videoId) {
      return;
    }

    if (requestedAutoplayRef.current) {
      callYouTubePlayer(playerRef.current, "loadVideoById", track.videoId);
    } else {
      callYouTubePlayer(playerRef.current, "cueVideoById", track.videoId);
    }
  }, [isPlayerReady, track.videoId, youtubePlaylistRequest]);

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

      if (typeof nextCurrentTime === "number" && Number.isFinite(nextCurrentTime)) {
        setCurrentTime(nextCurrentTime);
      }

      if (typeof nextDuration === "number" && Number.isFinite(nextDuration) && nextDuration > 0) {
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

      if (event.key.toLowerCase() === "h") {
        triggerHornOkButton();
      }

      if (event.key === "Escape") {
        setIsDriverOpen(false);
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

  return (
    <main
      className={`radio-shell theme-${theme.id}${isPlayerExpanded ? " player-expanded" : ""}${isLibraryOpen ? " queue-open" : ""}`}
      style={pageStyle}
      onPointerDown={unlockHorns}
    >
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
        <span className="brand-icon" aria-hidden="true" />
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
        <button
          type="button"
          className="library-toggle"
          onClick={() => {
            setIsLibraryOpen((open) => {
              const nextOpen = !open;

              if (nextOpen) {
                setIsPlayerExpanded(false);
              }

              return nextOpen;
            });
          }}
        >
          {isLibraryOpen ? "Close queue" : "Queue"}
        </button>
        <button
          type="button"
          className="driver-toggle"
          onClick={() => setIsDriverOpen((open) => !open)}
          aria-expanded={isDriverOpen}
          aria-controls="driver-card"
        >
          <span className="driver-avatar" aria-hidden="true">🚌</span>
          <strong>Who&apos;s driving?</strong>
        </button>
      </div>

      <aside
        id="driver-card"
        className={isDriverOpen ? "driver-card open" : "driver-card"}
        aria-label="Driver profile"
        aria-hidden={!isDriverOpen}
      >
        <button
          type="button"
          className="driver-close"
          onClick={() => setIsDriverOpen(false)}
          aria-label="Close driver profile"
        >
          ×
        </button>
        <div className="driver-card-head">
          <span className="driver-avatar large" aria-hidden="true">🚌</span>
          <div>
            <strong>Akash</strong>
            <p>I drive this bus. I pick every song on it.</p>
          </div>
        </div>
        <a className="instagram-follow" href={instagramUrl} target="_blank" rel="noreferrer">
          <span aria-hidden="true">◎</span>
          Follow akashinthesky_
        </a>
        <p className="driver-note">New songs join the bus most weeks.</p>
      </aside>

      <section
        className={isRouteActive ? "route-title route-active" : "route-title"}
        aria-label="Route"
        tabIndex={0}
        onPointerEnter={() => {
          setIsRouteActive(true);
        }}
        onPointerLeave={() => {
          setIsRouteActive(false);
          setActiveRouteLetter(null);
        }}
        onFocus={() => {
          setIsRouteActive(true);
          setActiveRouteLetter(Math.floor(routeTitleLetters.length / 2));
        }}
        onBlur={() => {
          setIsRouteActive(false);
          setActiveRouteLetter(null);
        }}
      >
        <span>{playlist.tracks.length} tracks · non-stop</span>
        <p>
          <span className="route-title-main" aria-label={routeTitleText}>{renderRouteLetters()}</span>
        </p>
        <button
          type="button"
          className={isHornButtonActive ? "horn-ok-button honking" : "horn-ok-button"}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={triggerHornOkButton}
          aria-label="Play horn"
        >
          <span className="horn-ok-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4.5 10.5H8l5.2-4.2v11.4L8 13.5H4.5z" />
              <path d="M16.2 8.1c1.1 1.1 1.7 2.4 1.7 3.9s-.6 2.8-1.7 3.9" />
              <path d="M19 5.8c1.8 1.7 2.8 3.9 2.8 6.2s-1 4.5-2.8 6.2" />
            </svg>
          </span>
          <strong>हॉर्न ओके प्लीज</strong>
          <em>HORN OK PLEASEEEE</em>
        </button>
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
              onClick={() => selectPlaylistCategory(index)}
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
              <YouTubeThumbnail className="queue-cover" track={item} index={index} />
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

      <section className={isPlayerExpanded ? "player-card expanded" : "player-card"} aria-label="Music controls">
        <TrackCover isPlaying={isPlaying} track={track} />
        <button
          type="button"
          className="player-expand"
          onClick={() => {
            setIsPlayerExpanded((expanded) => {
              const nextExpanded = !expanded;

              if (nextExpanded) {
                setIsLibraryOpen(false);
              }

              return nextExpanded;
            });
          }}
          aria-label={isPlayerExpanded ? "Collapse player" : "Expand player"}
          aria-expanded={isPlayerExpanded}
        >
          {isPlayerExpanded ? "×" : "↗"}
        </button>
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
        <span><kbd>H</kbd> Horn</span>
      </div>
    </main>
  );
}
