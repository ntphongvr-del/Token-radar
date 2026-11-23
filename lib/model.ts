/**
 * lib/model.ts — Mo hinh dinh gia token (token launch radar, token-radar-01).
 *
 * Doc RULES.txt truoc khi viet file nay. Cong thuc duy nhat, dung cho moi dong:
 *
 *   implied_value_usd = tvl_usd x BASE_MULTIPLE
 *                       x growth_multiplier(change_7d)
 *                       x maturity_multiplier(age_days)
 *
 * - TVL la co so: mot protocol giu duoc bao nhieu tien thi token cua no (neu co)
 *   moi co co so de dinh gia.
 * - growth_multiplier: tang truong TVL 7 ngay, cat o [-30%, +50%], doi thanh
 *   he so 0.70–1.50. change_7d null (khong bao cao) thi he so = 1, khong phat
 *   cung khong thuong.
 * - maturity_multiplier: tuoi doi ke tu listed_at den as_of cua snapshot,
 *   tang dan tu 0.85 (moi listed) len 1.00 o 1095 ngay (3 nam) roi dung lai.
 *   Protocol chay lau ma van chua co token thi co lich su de tin hon; protocol
 *   chua co listed_at thi lay giua khoang 0.925, khong doan tuoi.
 * - Khong co danh sach ten cung (hardcoded): moi he so chi doc tu cac truong
 *   so cua chinh protocol do trong snapshot. Ten protocol khong bao gio anh
 *   huong den gia tri.
 *
 * Phan biet "records no token" / "token da giao dich":
 * - isPreToken(p): snapshot khong ghi token nao (gecko_id, symbol va mcap_usd
 *   deu null). Chi noi "records no token", khong bao gio noi "khong co token",
 *   vi DefiLlama co the chua ghi nhan.
 * - buildLiveList(): cac protocol co mcap_usd, xep theo mcap, chi de dashboard
 *   hien thi doi chieu o view "Already has a token"; chung khong vao board
 *   va khong co farm_steps.
 *
 * Chon dong cho board (buildBoard):
 * - Watchlist cua snapshot la danh sach nha lam: moi slug trong do phai co
 *   trong board (RULES: coverage = 1). Tren floor, chi lay dung watchlist,
 *   vi nha da loai cac san pham wrapped/staked/bridged theo parentProtocol
 *   ma snapshot khong mang theo — model khong doan lai phan nay.
 * - Duoi floor, lay them cac protocol pre-token thoa luat loai tru quan sat
 *   duoc trong RULES (category Bridge / Canonical Bridge / Liquid Staking /
 *   Liquid Restaking / Restaked BTC / CEX; ten ket thuc bang version marker;
 *   ten chua whole word wrapped / staked / staking; ten bat dau bang ten mot
 *   san giao dich). Day la floor, khong phai ceiling: board tim protocol som
 *   duoi floor, dung nhu RULES noi.
 * - Board = watchlist + cac protocol duoi floor thoa luat, xep theo
 *   implied_value_usd giam dan. Voi snapshot 14/11: 40 watchlist + 137 duoi
 *   floor = 177 dong (it hon muc tieu 200 vi chi co bay nhieu protocol du
 *   dieu kien; them protocol khong du dieu kien chi de du 200 dong se lam
 *   sai mo hinh).
 *
 * Farm steps: lay tu lib/farm-plans.ts cua Ngu Tru (renderFarmSteps theo
 * category DefiLlama, dien {name} / {chain} that). Category nao chua co mau
 * thi dung DEFAULT_TEMPLATE cua file do. Moi buoc deu ghi ro von + gas/phi
 * va thoi gian, 20–600 ky tu; fitFarmSteps dam bao gioi han nay du template
 * co thay doi.
 */

import { renderFarmSteps } from "./farm-plans.ts";

/** Mot protocol trong snapshot.json (du 10 truong nhu RULES mo ta). */
export interface SnapshotProtocol {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
}

/** Toan bo snapshot.json. */
export interface Snapshot {
  as_of: string;
  source: string;
  floor_usd: number;
  protocols: SnapshotProtocol[];
  watchlist: string[];
}

/** Mot dong trong board.json. Them truong phu de dashboard dung (cho phep). */
export interface BoardRow {
  slug: string;
  name: string;
  rank: number;
  implied_value_usd: number;
  farm_steps: string[];
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  listed_at: string | null;
  age_days: number | null;
  growth_multiplier: number;
  maturity_multiplier: number;
  is_watchlist: boolean;
}

/** Mot dong o view "Already has a token" (doi chieu, khong phai board). */
export interface LiveRow {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number;
  listed_at: string | null;
  age_days: number | null;
}

/** Du lieu dashboard (window.RADAR trong data.js) — khop app.js cua Quy Phi. */
export interface RadarData {
  as_of: string;
  source: string;
  floor_usd: number;
  watchlist: string[];
  watchlist_size: number;
  board_size: number;
  early_size: number;
  model: {
    base_multiple: number;
    growth_floor: number;
    growth_cap: number;
    maturity_days: number;
  };
  model_version: string;
  rows: BoardRow[];
  live: LiveRow[];
}

/** He so co so: implied value bang 25% TVL truoc khi nhan growth/maturity. */
export const BASE_MULTIPLE = 0.25;
/** Cat tang truong 7 ngay: duoi -30% tinh nhu -30%, tren +50% tinh nhu +50%. */
export const GROWTH_FLOOR_PCT = -30;
export const GROWTH_CAP_PCT = 50;
/** Tuoi doi de maturity dat tran: 1095 ngay = 3 nam. */
export const MATURITY_DAYS = 1095;
/** So dong board muon co; thuc te co the it hon neu khong du protocol du dieu kien. */
export const BOARD_TARGET = 200;
/** So protocol co token hien o view doi chieu. */
export const LIVE_SIZE = 50;

export const MODEL_VERSION = "radar-v1";

/**
 * Category ma luat watchlist loai (RULES, phan snapshot): san pham wrapped,
 * staked, bridged hoac san giao dich — khong phai protocol doc lap can farm.
 */
export const EXCLUDED_CATEGORIES: ReadonlySet<string> = new Set([
  "Bridge",
  "Canonical Bridge",
  "Liquid Staking",
  "Liquid Restaking",
  "Restaked BTC",
  "CEX",
]);

/** Ten cac san giao dich ma luat watchlist loai khi ten protocol bat dau bang chung. */
export const EXCHANGE_NAMES: readonly string[] = [
  "Binance",
  "Coinbase",
  "Bybit",
  "Kraken",
  "Bitget",
  "OKX",
  "Bitfinex",
  "Gemini",
];

/** Cat mot so vao khoang [lo, hi]. */
export function clamp(value: number, lo: number, hi: number): number {
  return value < lo ? lo : value > hi ? hi : value;
}

/**
 * So ngay tu listed_at den as_of (ca hai deu ngay UTC, dang YYYY-MM-DD).
 * Tra null khi listed_at null hoac khong doc duoc; 0 khi listed sau as_of.
 */
export function ageDays(listedAt: string | null, asOf: string): number | null {
  if (!listedAt) return null;
  const start = Date.parse(`${listedAt}T00:00:00Z`);
  const end = Date.parse(`${asOf}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  const days = Math.floor((end - start) / 86_400_000);
  return days < 0 ? 0 : days;
}

/**
 * He so tang truong tu change_7d (phan tram). Null thi 1.0.
 * Cat o [-30, +50] roi doi: 1 + pct/100, khoang 0.70–1.50.
 */
export function growthMultiplier(change7d: number | null): number {
  if (change7d === null || !Number.isFinite(change7d)) return 1;
  return 1 + clamp(change7d, GROWTH_FLOOR_PCT, GROWTH_CAP_PCT) / 100;
}

/**
 * He so truong thanh tu tuoi doi (ngay). Tang tuyen tinh 0.85 -> 1.00 trong
 * 1095 ngay dau. Khong biet tuoi thi 0.925 (giua khoang), khong doan.
 */
export function maturityMultiplier(age: number | null): number {
  if (age === null || !Number.isFinite(age)) return 0.925;
  return 0.85 + 0.15 * (clamp(age, 0, MATURITY_DAYS) / MATURITY_DAYS);
}

/**
 * Gia tri am chi (implied value) cua mot protocol, so nguyen duong (USD).
 * Cong thuc duy nhat: TVL x 0.25 x growth x maturity.
 */
export function impliedValueUsd(
  protocol: SnapshotProtocol,
  asOf: string,
): number {
  const age = ageDays(protocol.listed_at, asOf);
  const value =
    protocol.tvl_usd *
    BASE_MULTIPLE *
    growthMultiplier(protocol.change_7d) *
    maturityMultiplier(age);
  return Math.max(1, Math.round(value));
}

/** Snapshot co ghi token cho protocol nay khong (gecko_id / symbol / mcap). */
export function hasRecordedToken(protocol: SnapshotProtocol): boolean {
  return (
    protocol.gecko_id !== null ||
    protocol.symbol !== null ||
    protocol.mcap_usd !== null
  );
}

/** Protocol "records no token": snapshot khong ghi token nao cho no. */
export function isPreToken(protocol: SnapshotProtocol): boolean {
  return !hasRecordedToken(protocol);
}

/**
 * Luat loai tru quan sat duoc cua watchlist (RULES, phan snapshot), ap cho
 * cac protocol duoi floor — noi snapshot khong co watchlist san:
 * category bi loai; ten ket thuc bang version marker (khoang trang + V2/v2/
 * 2.0...); ten chua whole word wrapped/staked/staking; ten bat dau bang ten
 * mot san giao dich. Tra true khi protocol BI loai.
 */
export function isExcludedByWatchlistRule(protocol: SnapshotProtocol): boolean {
  if (protocol.category !== null && EXCLUDED_CATEGORIES.has(protocol.category)) {
    return true;
  }
  const name = protocol.name ?? "";
  if (/\s[vV]?\d+(?:\.\d+)*$/.test(name)) return true;
  if (/\b(?:wrapped|staked|staking)\b/i.test(name)) return true;
  const firstWord = name.split(/\s+/)[0] ?? "";
  if (
    EXCHANGE_NAMES.some(
      (exchange) => firstWord.toLowerCase() === exchange.toLowerCase(),
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Dam bao farm_steps hop le gate: 3–12 buoc, moi buoc 20–600 ky tu sau trim.
 * Buoc qua dai thi cat ngan (giu 597 ky tu + "…"); buoc qua ngan thi bo.
 * Neu con duoi 3 buoc thi dung lai mau mac dinh cua farm-plans.ts.
 */
export function fitFarmSteps(steps: string[]): string[] {
  const kept: string[] = [];
  for (const step of steps) {
    const text = step.trim();
    if (text.length < 20) continue;
    kept.push(text.length > 600 ? `${text.slice(0, 597)}…` : text);
    if (kept.length === 12) break;
  }
  if (kept.length >= 3) return kept;
  // Du phong: khong bao gio tra ve duoi 3 buoc hop le.
  return renderFarmSteps("", "this protocol", "its main chain")
    .map((s) => s.trim())
    .filter((s) => s.length >= 20 && s.length <= 600)
    .slice(0, 6);
}

/** Sinh farm_steps cho mot protocol tu mau theo category cua no. */
export function farmStepsFor(protocol: SnapshotProtocol): string[] {
  const chain = protocol.chains?.[0] ?? "Ethereum";
  const steps = renderFarmSteps(protocol.category ?? "", protocol.name, chain);
  return fitFarmSteps(steps);
}

/**
 * Xay board: watchlist (du, bat buoc) + cac protocol pre-token duoi floor
 * thoa luat loai tru, xep theo implied value giam dan, rank 1..N.
 * Implied value duoc ep giam chat (it nhat 1 do giua 2 hang lien ke) de
 * rank luon khop thu tu gia tri va khong co 2 hang bang nhau lien tiep.
 */
export function buildBoard(snapshot: Snapshot): BoardRow[] {
  const watchlist = new Set(snapshot.watchlist);
  const bySlug = new Map(snapshot.protocols.map((p) => [p.slug, p]));

  const candidates: SnapshotProtocol[] = [];
  for (const protocol of snapshot.protocols) {
    if (!isPreToken(protocol)) continue;
    if (watchlist.has(protocol.slug)) {
      candidates.push(protocol);
      continue;
    }
    // Tren floor ma khong co trong watchlist: nha da loai vi ly do khong co
    // trong snapshot (parentProtocol) — khong doan lai, khong lay.
    if (protocol.tvl_usd >= snapshot.floor_usd) continue;
    if (isExcludedByWatchlistRule(protocol)) continue;
    candidates.push(protocol);
  }

  const scored = candidates.map((protocol) => ({
    protocol,
    value: impliedValueUsd(protocol, snapshot.as_of),
  }));
  scored.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    if (b.protocol.tvl_usd !== a.protocol.tvl_usd) {
      return b.protocol.tvl_usd - a.protocol.tvl_usd;
    }
    return a.protocol.slug < b.protocol.slug
      ? -1
      : a.protocol.slug > b.protocol.slug
        ? 1
        : 0;
  });

  const chosen = scored.slice(0, BOARD_TARGET);
  // Watchlist phai du: neu cat o BOARD_TARGET lam mat watchlist (khong xay
  // ra voi snapshot nay vi watchlist TVL cao, nhung cu dam bao), them lai.
  const chosenSlugs = new Set(chosen.map((c) => c.protocol.slug));
  for (const slug of snapshot.watchlist) {
    if (!chosenSlugs.has(slug)) {
      const protocol = bySlug.get(slug);
      if (protocol) {
        chosen.push({
          protocol,
          value: impliedValueUsd(protocol, snapshot.as_of),
        });
        chosenSlugs.add(slug);
      }
    }
  }
  chosen.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    if (b.protocol.tvl_usd !== a.protocol.tvl_usd) {
      return b.protocol.tvl_usd - a.protocol.tvl_usd;
    }
    return a.protocol.slug < b.protocol.slug ? -1 : 1;
  });

  const rows: BoardRow[] = [];
  let previousValue = Number.POSITIVE_INFINITY;
  chosen.forEach((entry, index) => {
    const protocol = entry.protocol;
    const age = ageDays(protocol.listed_at, snapshot.as_of);
    let value = entry.value;
    if (value >= previousValue) value = previousValue - 1;
    if (value < 1) value = 1;
    previousValue = value;
    rows.push({
      slug: protocol.slug,
      name: protocol.name,
      rank: index + 1,
      implied_value_usd: value,
      farm_steps: farmStepsFor(protocol),
      category: protocol.category,
      chains: protocol.chains,
      tvl_usd: protocol.tvl_usd,
      change_7d: protocol.change_7d,
      listed_at: protocol.listed_at,
      age_days: age,
      growth_multiplier: growthMultiplier(protocol.change_7d),
      maturity_multiplier: maturityMultiplier(age),
      is_watchlist: watchlist.has(protocol.slug),
    });
  });
  return rows;
}

/**
 * Cac protocol co token dang giao dich, xep theo mcap giam dan — chi de
 * dashboard hien thi doi chieu. Khong vao board, khong co farm plan.
 */
export function buildLiveList(snapshot: Snapshot): LiveRow[] {
  return snapshot.protocols
    .filter((p) => p.mcap_usd !== null && Number.isFinite(p.mcap_usd))
    .sort((a, b) => (b.mcap_usd as number) - (a.mcap_usd as number))
    .slice(0, LIVE_SIZE)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      chains: p.chains,
      tvl_usd: p.tvl_usd,
      change_7d: p.change_7d,
      mcap_usd: p.mcap_usd as number,
      listed_at: p.listed_at,
      age_days: ageDays(p.listed_at, snapshot.as_of),
    }));
}

/** Toan bo du lieu dashboard: board + watchlist + live + mo hinh. */
export function buildRadarData(snapshot: Snapshot): RadarData {
  const rows = buildBoard(snapshot);
  return {
    as_of: snapshot.as_of,
    source: snapshot.source,
    floor_usd: snapshot.floor_usd,
    watchlist: [...snapshot.watchlist].sort(),
    watchlist_size: snapshot.watchlist.length,
    board_size: rows.length,
    early_size: rows.filter((r) => r.tvl_usd < snapshot.floor_usd).length,
    model: {
      base_multiple: BASE_MULTIPLE,
      growth_floor: GROWTH_FLOOR_PCT,
      growth_cap: GROWTH_CAP_PCT,
      maturity_days: MATURITY_DAYS,
    },
    model_version: MODEL_VERSION,
    rows,
    live: buildLiveList(snapshot),
  };
}
