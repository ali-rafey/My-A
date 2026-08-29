import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Prospect, ProspectRecord, ProspectStatusRow, ProspectStatusValue } from '@/lib/supabase/types';

// Outbound prospect records live in data/prospects.csv, committed to the repo. Vercel's runtime
// filesystem is read-only, so the CSV is the immutable research payload and public.prospect_status
// carries the mutable pipeline state — the two are joined in getProspects() below.
//
// The CSV is the source of truth on purpose: research passes regenerate it, git diffs it, and the
// operator can open it in Excel. Nothing here writes to disk.

const CSV_PATH = join(process.cwd(), 'data', 'prospects.csv');

// ---------------------------------------------------------------------------
// CSV parsing (RFC 4180 subset — quoted fields, embedded commas/newlines, "" escapes)
// ---------------------------------------------------------------------------
// Hand-rolled rather than adding a dependency. The input is a file we generate ourselves, but the
// parser is still strict about quoting so a stray comma in a signal_quote can't shift every
// subsequent column silently.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  // Strip a UTF-8 BOM — Excel adds one on save and it would otherwise poison the first header.
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < src.length; i++) {
    const char = src[i];

    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') { inQuotes = true; continue; }
    if (char === ',') { row.push(field); field = ''; continue; }
    if (char === '\r') continue;
    if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += char;
  }

  // Flush the trailing field/row when the file doesn't end in a newline.
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function toBool(value: string | undefined): boolean {
  return (value ?? '').trim().toLowerCase() === 'yes';
}

function splitList(value: string | undefined): string[] {
  return (value ?? '')
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
// Deliberately computed in code rather than stored in the CSV, so the weighting stays a single
// auditable place and can be retuned across the whole list at once. Weighted for the "technical
// partner + Fanaar manufacturing" offer: a prospect who needs BOTH is the rarest and least
// contested opportunity, so needs_manufacturing carries the heaviest single weight.
// Weights are tuned so the MAXIMUM possible score is exactly 100 and nothing is lost to clipping.
// This matters: an earlier tuning let an unverified row reach 100 on signals alone, which tied it
// with a fully verified, directly-contactable lead and made the `verified` flag decorative. Now a
// record that is neither verified nor directly contactable tops out at 70, so the research queue
// can never outrank a real, checked lead.
//
// Weighted for the "technical partner + Fanaar manufacturing" offer: needs_manufacturing carries
// the heaviest single weight because it is the least contested advantage. Verification is second,
// because an unchecked lead is a guess, and a guess costs an hour of outreach to disprove.
// Weights sum to exactly 100 so nothing is lost to clipping, and the penalties push poor fits
// clearly below good ones. Retuned around the operator's sharpened brief: he wants NEWCOMERS.
//
// earlyStage now carries as much weight as needsManufacturing, because an established brand has
// already chosen a manufacturer and a developer - displacing an incumbent is a far harder sale
// than being the first one in. establishedPenalty actively pushes long-running brands down rather
// than merely failing to reward them.
// Weights sum to exactly 100 so nothing is lost to clipping.
//
// Retargeted on the operator's revised brief: MATURE businesses in ANY sector that need a
// technical partner. This deliberately inverts the earlier early-stage tuning. The reasoning is
// sound either way, but they are opposite bets: a newcomer has nothing locked in, while a mature
// business has revenue, real operational pain and budget to fix it. The operator wants the latter.
//
// socialPresence carries the single heaviest weight because it is now a hard requirement, not a
// bonus - a lead he cannot open a conversation with is worth nothing to him regardless of fit.
const SCORE_WEIGHTS = {
  socialPresence: 22,
  needsTech: 18,
  mature: 16,
  verified: 14,
  directContact: 12,
  techGapDepth: 8,
  needsManufacturing: 5,
  freshSignal: 5,
  outOfMarketPenalty: 15,
  tooNewPenalty: 10,
} as const;

const TARGET_MARKETS = ['EU', 'UK', 'US'];

// Four or more years trading reads as mature: past survival, into growth problems. Under two
// years is penalised - likely still pre-revenue and unable to pay for a technical partner.
const MATURE_BEFORE = 2022;
const TOO_NEW_FROM = 2024;

// Sector is no longer a filter - the operator now takes any industry - so this only nudges rather
// than gates, recognising work he can service end to end including production.
const KNITWEAR_HINTS = ['loungewear', 'knitwear', 'basics', 'jersey', 'activewear', 'sleepwear', 'fabric', 'textile'];

export function scoreProspect(record: ProspectRecord): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Contactability first - it is the gating factor.
  if (record.instagram || record.linkedin) {
    score += SCORE_WEIGHTS.socialPresence;
    const channels = [record.instagram ? 'Instagram' : '', record.linkedin ? 'LinkedIn' : '']
      .filter(Boolean)
      .join(' + ');
    reasons.push(`Reachable on ${channels}`);
  } else {
    reasons.push('NO social handle — you cannot open a conversation');
  }

  if (record.contact_route === 'email' || record.phone) {
    score += SCORE_WEIGHTS.directContact;
    reasons.push(record.phone ? 'Phone number available' : 'Direct email available');
  }

  if (record.needs_tech) {
    score += SCORE_WEIGHTS.needsTech;
    reasons.push('Needs technical work');
  }

  // Depth of confirmed problems. More documented gaps means more to talk about on a first
  // approach and a bigger engagement if it lands.
  if (record.tech_gaps.length >= 3) {
    score += SCORE_WEIGHTS.techGapDepth;
    reasons.push(`${record.tech_gaps.length} concrete gaps documented`);
  } else if (record.tech_gaps.length > 0) {
    score += Math.round(SCORE_WEIGHTS.techGapDepth / 2);
    reasons.push(`${record.tech_gaps.length} gap(s) documented`);
  }

  if (record.verified) {
    score += SCORE_WEIGHTS.verified;
    reasons.push('Verified — source fetched and checked directly');
  } else {
    reasons.push('NOT yet verified — confirm before spending time on outreach');
  }

  const founded = Number.parseInt(record.founded_year, 10);
  if (!Number.isNaN(founded)) {
    if (founded < MATURE_BEFORE) {
      score += SCORE_WEIGHTS.mature;
      reasons.push(`Trading since ${founded} — established, with real operational problems`);
    } else if (founded >= TOO_NEW_FROM) {
      score -= SCORE_WEIGHTS.tooNewPenalty;
      reasons.push(`Started ${founded} — may be too early to pay for a technical partner`);
    }
  }

  if (record.needs_manufacturing === 'yes') {
    score += SCORE_WEIGHTS.needsManufacturing;
    reasons.push('Also needs a manufacturer — you can serve the whole chain');
  }

  const category = record.product_category.toLowerCase();
  if (KNITWEAR_HINTS.some((hint) => category.includes(hint))) {
    reasons.push('Category also matches Fanaar production');
  }

  const signalDate = Date.parse(record.signal_date);
  if (!Number.isNaN(signalDate)) {
    const ageDays = (Date.now() - signalDate) / 86_400_000;
    if (ageDays <= 90) {
      score += SCORE_WEIGHTS.freshSignal;
    } else if (ageDays > 365) {
      reasons.push('Signal over a year old — confirm they are still trading');
    }
  }

  if (record.market && !TARGET_MARKETS.includes(record.market)) {
    score -= SCORE_WEIGHTS.outOfMarketPenalty;
    reasons.push(`Outside your target markets (${record.market})`);
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------
const REQUIRED_HEADERS = ['id', 'name', 'brand', 'source_url'];

export function loadProspectRecords(): ProspectRecord[] {
  let raw: string;
  try {
    raw = readFileSync(CSV_PATH, 'utf8');
  } catch (err) {
    // Missing/unreadable CSV degrades to an empty list rather than 500ing the admin page — the UI
    // renders its empty state and the operator can see the path in the logs.
    console.error(
      `[prospects] could not read ${CSV_PATH}:`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }

  const rows = parseCsv(raw);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    console.error(`[prospects] CSV is missing required column(s): ${missing.join(', ')}`);
    return [];
  }

  const records: ProspectRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    const get = (key: string): string => {
      const index = headers.indexOf(key);
      return index === -1 ? '' : (cells[index] ?? '').trim();
    };

    const id = get('id');
    if (!id) continue;

    const needsManufacturing = get('needs_manufacturing').toLowerCase();

    records.push({
      id,
      name: get('name'),
      role: get('role'),
      brand: get('brand'),
      brand_stage: (get('brand_stage') || 'pre_launch') as ProspectRecord['brand_stage'],
      product_category: get('product_category'),
      country: get('country'),
      market: get('market'),
      signal_type: (get('signal_type') || 'pre_launch_founder') as ProspectRecord['signal_type'],
      signal_summary: get('signal_summary'),
      signal_quote: get('signal_quote'),
      signal_date: get('signal_date'),
      source_platform: get('source_platform'),
      source_url: get('source_url'),
      website: get('website'),
      tech_gaps: splitList(get('tech_gaps')),
      needs_tech: toBool(get('needs_tech')),
      needs_manufacturing:
        needsManufacturing === 'yes' ? 'yes' : needsManufacturing === 'no' ? 'no' : 'unknown',
      contact_route: get('contact_route'),
      contact_value: get('contact_value'),
      instagram: get('instagram'),
      linkedin: get('linkedin'),
      phone: get('phone'),
      founded_year: get('founded_year'),
      verified: toBool(get('verified')),
      verified_on: get('verified_on'),
      opt_out: toBool(get('opt_out')),
    });
  }

  return records;
}

// Join CSV records with their pipeline state. Records carrying opt_out are dropped entirely rather
// than merely hidden — if someone has asked not to be contacted, they should not surface in a UI
// whose primary action is "contact this person".
export function mergeProspects(
  records: ProspectRecord[],
  statuses: ProspectStatusRow[],
): Prospect[] {
  const byId = new Map(statuses.map((row) => [row.prospect_id, row]));

  return records
    .filter((record) => !record.opt_out)
    .map((record) => {
      const state = byId.get(record.id);
      const { score, reasons } = scoreProspect(record);
      return {
        ...record,
        score,
        score_reasons: reasons,
        status: (state?.status ?? 'new') as ProspectStatusValue,
        notes: state?.notes ?? null,
        last_contacted_at: state?.last_contacted_at ?? null,
      };
    })
    .sort((a, b) => b.score - a.score || a.brand.localeCompare(b.brand));
}

// Read pipeline state and merge it onto the CSV records. Mirrors lib/content/blogs.ts: this is an
// admin-only path, so a Supabase failure throws and the admin UI surfaces it rather than silently
// rendering every prospect as "new" — a status silently reverting to New would be worse than an
// error, because the operator would re-contact people they had already emailed.
export async function getProspects(): Promise<Prospect[]> {
  const { createServiceClient } = await import('@/lib/supabase/server');
  const records = loadProspectRecords();
  if (records.length === 0) return [];

  const supabase = createServiceClient();
  const { data, error } = await supabase.from('prospect_status').select('*');

  if (error) {
    throw new Error(
      `Could not read prospect_status: ${error.message}. If the table is missing, run ` +
      `supabase/schema.sql in the Supabase SQL Editor, then: notify pgrst, 'reload schema';`,
    );
  }

  return mergeProspects(records, (data ?? []) as ProspectStatusRow[]);
}
