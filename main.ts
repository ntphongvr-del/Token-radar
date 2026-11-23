/**
 * main.ts — Entrypoint cua token-radar-01 (Node 22, standard library only).
 *
 * Doc RULES.txt truoc khi sua file nay.
 *
 * Chay (nhu starter):
 *   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json
 * Tren may cham (grader): doc /input/snapshot.json, ghi ra /output.
 *
 * Lam gi:
 *   1. Doc snapshot (mac dinh /input/snapshot.json; --input de doi).
 *   2. Dung lib/model.ts (buildRadarData) de xay board + du lieu dashboard.
 *   3. Ghi /output/board.json (object co `rows`: 100–4000 dong, rank 1..N,
 *      implied_value_usd khong tang theo rank, farm_steps 3–12 buoc,
 *      moi buoc 20–600 ky tu, bao het watchlist).
 *   4. Ghi /output/data.js (window.RADAR) canh dashboard/ — app.js cua
 *      Quy Phi doc object nay, khong fetch.
 *   5. Copy dashboard/ va screenshots/ (neu co trong repo) sang /output.
 *   6. Ghi /output/dossier.json: dung buildDossier cua vendor/
 *      makefun-board.ts neu file do co trong repo (nhu starter); neu khong,
 *      dung buildDossier noi bo o cuoi file nay, viet theo dung mo ta o
 *      RULES muc "The dossier" (text toi da 65,536 bytes).
 *
 * Deterministic: khong timestamp, khong random, khong doc bien moi truong
 * nao khac --input / --output / MAKEFUN_OUTPUT_DIR. Hai lan chay viet ra
 * cung mot byte.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRadarData } from "./lib/model.ts";
import type { Snapshot, RadarData } from "./lib/model.ts";

const TEXT_MAX_BYTES = 65_536;
const TEXT_EXTENSIONS = new Set([".html", ".css", ".js", ".json", ".mjs", ".svg", ".md", ".txt"]);
const FENCE_LANGUAGE: Record<string, string> = {
  ".html": "html",
  ".css": "css",
  ".js": "javascript",
  ".json": "json",
  ".mjs": "javascript",
  ".svg": "xml",
  ".md": "markdown",
  ".txt": "text",
};

/** Thu muc chua main.ts (repo root khi chay, /bot khi cham). */
const ROOT_DIR = dirname(fileURLToPath(import.meta.url));

interface CliOptions {
  input: string | null;
  output: string | null;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { input: null, output: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--input" && i + 1 < argv.length) {
      options.input = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--output" && i + 1 < argv.length) {
      options.output = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--help" || argv[i] === "-h") {
      console.log("Usage: node main.ts [--input <snapshot.json>] [--output <dir>]");
      console.log("Defaults: input /input/snapshot.json, output $MAKEFUN_OUTPUT_DIR or /output.");
      process.exit(0);
    }
  }
  return options;
}

/** Duong dan snapshot: --input, neu khong thi thu /input, roi file trong repo. */
function resolveInputPath(explicit: string | null): string {
  if (explicit) return resolve(explicit);
  const candidates = [
    "/input/snapshot.json",
    join(ROOT_DIR, "snapshot.json"),
    join(ROOT_DIR, "input", "snapshot.json"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

/** Thu muc output: --output, $MAKEFUN_OUTPUT_DIR, roi /output. */
function resolveOutputDir(explicit: string | null): string {
  if (explicit) return resolve(explicit);
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv) return resolve(fromEnv);
  return "/output";
}

function readSnapshot(inputPath: string): Snapshot {
  const raw = readFileSync(inputPath, "utf8");
  const snapshot = JSON.parse(raw) as Snapshot;
  if (!snapshot || typeof snapshot !== "object") throw new Error(`Snapshot is not an object: ${inputPath}`);
  if (!Array.isArray(snapshot.protocols)) throw new Error("Snapshot has no protocols array");
  if (!Array.isArray(snapshot.watchlist)) throw new Error("Snapshot has no watchlist array");
  if (!Number.isFinite(snapshot.floor_usd)) throw new Error("Snapshot has no floor_usd");
  if (typeof snapshot.as_of !== "string") throw new Error("Snapshot has no as_of");
  return snapshot;
}

function listFilesRecursive(dir: string): string[] {
  const found: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    )) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) found.push(path);
    }
  };
  walk(dir);
  return found.sort();
}

function copyTree(sourceDir: string, targetDir: string): number {
  if (!existsSync(sourceDir)) return 0;
  let copied = 0;
  for (const file of listFilesRecursive(sourceDir)) {
    const target = join(targetDir, relative(sourceDir, file));
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(file, target);
    copied += 1;
  }
  return copied;
}

function writeJson(filePath: string, value: unknown): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

/** Doc kich thuoc anh PNG/JPEG tu header (khong can thu vien ngoai). */
function imageDimensions(filePath: string): { width: number; height: number } | null {
  const buffer = readFileSync(filePath);
  // PNG: 8-byte signature + IHDR, width/height o byte 16/20 (big-endian).
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
  ) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  // JPEG: quet marker, lay SOF0/SOF2 (0xC0/0xC2) chua height/width.
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) break;
      offset += 2 + length;
    }
  }
  return null;
}

interface ScreenshotInfo {
  name: string;
  bytes: number;
  width: number | null;
  height: number | null;
}

interface Dossier {
  text: string;
  screenshots: ScreenshotInfo[];
}

/**
 * buildDossier noi bo, theo RULES muc "The dossier":
 * text mo dau bang ## Dashboard (so file, so byte, tung file + size), roi
 * ## Source (moi file text: path, size, so dong, noi dung trong fenced block
 * theo path). Text toi da 65,536 byte UTF-8: file nao vua thi dua nguyen theo
 * thu tu path; file dau tien khong vua thi dua den dong tron ven cuoi cung
 * vua, kem dong noi so dong chua hien; sau no chi con mot dong cuoi noi so
 * file nguyen va so byte con lai chua dua. File khong phai .html/.css/.js/
 * .json/.mjs/.svg/.md/.txt chi co ten trong Dashboard block, khong hien noi dung.
 */
export function buildDossier(outputDir: string, options: { text_max_bytes: number }): Dossier {
  const dashboardDir = join(outputDir, "dashboard");
  const screenshotsDir = join(outputDir, "screenshots");
  const maxBytes = options.text_max_bytes;

  const dashboardFiles = existsSync(dashboardDir)
    ? listFilesRecursive(dashboardDir).map((file) => ({
        path: `dashboard/${relative(dashboardDir, file).split("/").join("/")}`,
        size: statSync(file).size,
        fullPath: file,
      }))
    : [];
  const totalBytes = dashboardFiles.reduce((sum, file) => sum + file.size, 0);

  const screenshots: ScreenshotInfo[] = existsSync(screenshotsDir)
    ? listFilesRecursive(screenshotsDir)
        .filter((file) => !basename(file).startsWith("."))
        .map((file) => {
          const dimensions = imageDimensions(file);
          return {
            name: basename(file),
            bytes: statSync(file).size,
            width: dimensions?.width ?? null,
            height: dimensions?.height ?? null,
          };
        })
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    : [];

  const lines: string[] = [];
  lines.push("## Dashboard");
  lines.push(`Files: ${dashboardFiles.length}`);
  lines.push(`Bytes: ${totalBytes}`);
  for (const file of dashboardFiles) lines.push(`${file.path} ${file.size}`);
  lines.push("");
  lines.push("## Source");

  const textFiles = dashboardFiles.filter((file) => TEXT_EXTENSIONS.has(extname(file.path)));
  let omittedFiles = 0;
  let omittedBytes = 0;
  let truncated = false;

  const byteLength = (text: string): number => Buffer.byteLength(text, "utf8");

  for (const file of textFiles) {
    const content = readFileSync(file.fullPath, "utf8");
    const fileLines = content.split("\n");
    const lineCount = content === "" ? 0 : content.endsWith("\n") ? fileLines.length - 1 : fileLines.length;
    const header = [`### ${file.path}`, `Size: ${file.size} bytes, lines: ${lineCount}`, `\`\`\`${FENCE_LANGUAGE[extname(file.path)] ?? ""}`];
    const footer = ["```"];
    const whole = [...header, content.replace(/\n$/, ""), ...footer].join("\n");
    const current = `${lines.join("\n")}\n`;
    if (!truncated && byteLength(current) + byteLength(whole) + 1 <= maxBytes) {
      lines.push(...header, content.replace(/\n$/, ""), ...footer);
      continue;
    }
    if (!truncated) {
      // File dau tien khong vua: dua den dong tron ven cuoi cung vua.
      truncated = true;
      const kept: string[] = [];
      for (const line of fileLines) {
        const trial = [...lines, ...header, ...kept, line, ...footer].join("\n");
        if (byteLength(trial) + 1 > maxBytes) break;
        kept.push(line);
      }
      const notShown = lineCount - kept.length;
      lines.push(...header, ...kept, `... ${notShown} lines not shown`, ...footer);
      // Chi phan cat cua file nay tinh vao byte chua hien; file nay khong
      // dem la "whole file" bi bo (no duoc hien mot phan).
      omittedBytes += Math.max(0, file.size - byteLength(kept.join("\n")));
      continue;
    }
    // Cac file text sau file bi cat: khong hien nua, dem vao so con lai.
    omittedFiles += 1;
    omittedBytes += file.size;
  }
  lines.push(`${omittedFiles} files and ${omittedBytes} bytes not shown.`);

  let text = lines.join("\n");
  // Cat cung o gioi han byte neu dong cuoi lam vuot (chi xay ra khi dashboard
  // rong hoac file dau tien qua lon): giu text tron ven theo byte.
  if (byteLength(text) > maxBytes) {
    const buffer = Buffer.from(text, "utf8").subarray(0, maxBytes);
    text = buffer.toString("utf8");
  }
  return { text, screenshots };
}

/** Thu dung vendor/makefun-board.ts neu co; khong co thi dung ban noi bo. */
async function writeDossier(outputDir: string): Promise<void> {
  const vendorPath = join(ROOT_DIR, "vendor", "makefun-board.ts");
  if (existsSync(vendorPath)) {
    try {
      const vendor = (await import(`file://${vendorPath}`)) as {
        buildDossier?: (dir: string, options: { text_max_bytes: number }) => unknown;
      };
      if (typeof vendor.buildDossier === "function") {
        const dossier = vendor.buildDossier(outputDir, { text_max_bytes: TEXT_MAX_BYTES });
        // buildDossier cua vendor tra ve Uint8Array (bytes cua dossier):
        // ghi thang bytes, khong JSON.stringify (se bien thanh {"0":...}).
        writeFileSync(join(outputDir, "dossier.json"), dossier as Uint8Array);
        return;
      }
    } catch (error) {
      console.error(`vendor/makefun-board.ts could not be used, using built-in buildDossier: ${error}`);
    }
  }
  writeJson(join(outputDir, "dossier.json"), buildDossier(outputDir, { text_max_bytes: TEXT_MAX_BYTES }));
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = resolveInputPath(options.input);
  const outputDir = resolveOutputDir(options.output);
  const snapshot = readSnapshot(inputPath);
  const radar: RadarData = buildRadarData(snapshot);

  mkdirSync(outputDir, { recursive: true });

  // board.json: object co rows; them metadata de doc duoc nguon goc.
  writeJson(join(outputDir, "board.json"), {
    as_of: radar.as_of,
    source: radar.source,
    floor_usd: radar.floor_usd,
    watchlist_size: radar.watchlist_size,
    board_size: radar.board_size,
    model_version: radar.model_version,
    rows: radar.rows,
  });

  // data.js canh dashboard/: app.js doc window.RADAR, khong fetch.
  writeFileSync(
    join(outputDir, "data.js"),
    `window.RADAR = ${JSON.stringify(radar, null, 2)};\n`,
    "utf8",
  );

  const dashboardCopied = copyTree(join(ROOT_DIR, "dashboard"), join(outputDir, "dashboard"));
  if (dashboardCopied === 0) {
    console.error("warning: no dashboard/ found in the repository, /output/dashboard is empty");
  }
  const screenshotsCopied = copyTree(join(ROOT_DIR, "screenshots"), join(outputDir, "screenshots"));
  if (screenshotsCopied === 0) {
    console.error("warning: no screenshots/ found in the repository, /output/screenshots is empty (the gate needs 3-4 images)");
  }

  await writeDossier(outputDir);
  console.log(
    `board: ${radar.board_size} rows (${radar.watchlist_size} watchlist, ${radar.early_size} below the floor), ` +
      `rank 1 ${radar.rows[0]?.slug} $${radar.rows[0]?.implied_value_usd}, ` +
      `rank ${radar.board_size} ${radar.rows[radar.rows.length - 1]?.slug} $${radar.rows[radar.rows.length - 1]?.implied_value_usd}, ` +
      `dashboard files copied: ${dashboardCopied}, screenshots copied: ${screenshotsCopied}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
