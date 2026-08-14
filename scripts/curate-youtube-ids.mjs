import { readFile, writeFile } from "node:fs/promises";

const source = await readFile(new URL("../app/radio-site.tsx", import.meta.url), "utf8");
const trackMatches = [...source.matchAll(/\["([^"\n]+)",\s*"([^"\n]+)",\s*"([^"\n]+)"\]/g)];
const tracks = trackMatches.map((match) => ({
  title: match[1],
  artist: match[2],
  query: `${match[1]} ${match[2]} official song`,
}));

function collectVideoRenderers(value, results = []) {
  if (!value || typeof value !== "object") {
    return results;
  }

  if (value.videoRenderer?.videoId) {
    const renderer = value.videoRenderer;
    const title =
      renderer.title?.runs?.map((run) => run.text).join("") ??
      renderer.title?.simpleText ??
      "";
    const channel =
      renderer.ownerText?.runs?.map((run) => run.text).join("") ??
      renderer.longBylineText?.runs?.map((run) => run.text).join("") ??
      "";
    results.push({ id: renderer.videoId, title, channel });
  }

  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) {
        collectVideoRenderers(item, results);
      }
    } else {
      collectVideoRenderers(child, results);
    }
  }

  return results;
}

function parseInitialData(html) {
  const marker = "var ytInitialData = ";
  const start = html.indexOf(marker);

  if (start < 0) {
    return null;
  }

  let index = start + marker.length;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (; index < html.length; index += 1) {
    const char = html[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return JSON.parse(html.slice(start + marker.length, index + 1));
      }
    }
  }

  return null;
}

async function lookup(track) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.query)}`;
  const response = await fetch(url, {
    headers: {
      "accept-language": "en-US,en;q=0.9",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
    },
  });
  const html = await response.text();
  const data = parseInitialData(html);
  const candidates = data ? collectVideoRenderers(data).slice(0, 5) : [];

  return { ...track, candidates };
}

const results = [];

for (const [index, track] of tracks.entries()) {
  let result;

  try {
    result = await lookup(track);
  } catch (error) {
    result = { ...track, candidates: [], error: String(error) };
  }

  results.push(result);
  console.log(`${index + 1}/${tracks.length} ${track.title}: ${result.candidates[0]?.id ?? "none"}`);
  await writeFile(
    new URL("../tmp-youtube-candidates.json", import.meta.url),
    JSON.stringify(results, null, 2),
  );
  await new Promise((resolve) => setTimeout(resolve, 900));
}

await writeFile(
  new URL("../tmp-youtube-candidates.json", import.meta.url),
  JSON.stringify(results, null, 2),
);
