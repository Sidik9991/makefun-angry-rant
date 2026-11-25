// "Circling Back" — make.fun entry program
// (u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046).
//
// Writes the winning one-line rant to /output/entry.txt.
// Ten candidates are scored 0-2 on each of the judge's five criteria, in the
// judge's order, with weights 5/4/3/2/1 (max 30). The winner is picked at
// runtime; ties go to the smaller text (the bounty's own tie-break), then to
// the earlier candidate. The output is re-read and gate-checked before exit.
//
// Gate (RULES.txt): /output/entry.txt is UTF-8 text of 1-400 characters,
// not only white space. Our own stricter shape: exactly one line, one rant,
// one concrete everyday annoyance, no throat-clearing, no list of complaints.
//
// Pass 1: seven candidates (C1-C7). Pass 2 added three challengers (C8-C10).
// Verified at build time: winner "Circling Back" scores 30/30 internally,
// 156 chars / 156 bytes, inside the 1-400 char gate.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Judge criteria, most important first (RULES.txt "The judge"):
const CRITERIA = [
  "C1 a funny rant about an everyday annoyance, not a general essay or a list of complaints",
  "C2 actually funny: a real laugh, not a smirk at how hard it is trying",
  "C3 a specific, concrete annoyance rather than a vague mood",
  "C4 sharp, economical wording: every sentence earns its place, no throat-clearing",
  "C5 freshness: an angle on the annoyance you have not heard a hundred times before",
] as const;
const WEIGHTS = [5, 4, 3, 2, 1]; // max total 2*(5+4+3+2+1) = 30

type Candidate = {
  id: string;
  title: string;
  line: string;
  annoyance: string; // the one specific concrete annoyance this rant names
  scores: [number, number, number, number, number];
  why: string; // one line per score, in criterion order
};

const CANDIDATES: Candidate[] = [
  {
    id: "C1",
    title: "Paper Jam",
    line: "The printer was fine all morning until the one document I actually needed, and now it blinks 'paper jam' like a slot machine that already took my money and my dignity.",
    annoyance: "printer",
    scores: [2, 2, 2, 2, 1],
    why: "a rant, not an essay; the slot-machine blink is a real laugh; one concrete machine, one concrete moment; every clause works; but a printer that jams on the important page is the oldest printer joke there is",
  },
  {
    id: "C2",
    title: "Hold Music",
    line: "I've been on hold so long the saxophone loop has started a second career in my head, and every time a human voice says 'your call is important to us' I can hear the lie in surround sound.",
    annoyance: "hold",
    scores: [2, 2, 2, 2, 1],
    why: "a rant, not an essay; the saxophone's second career is a real laugh; hold music, one concrete loop; every clause works; but 'your call is important to us' is a line everyone has already ranted about",
  },
  {
    id: "C3",
    title: "Circling Back",
    line: "He wrote 'just circling back' on an email I answered yesterday, like a vulture with a calendar invite, and now I owe him a reply for a reply he already got.",
    annoyance: "circling back",
    scores: [2, 2, 2, 2, 2],
    why: "a rant, not an essay; the vulture with a calendar invite is a real laugh; the judge's own example annoyance, one concrete email; every clause works; nobody has called the circler a vulture before",
  },
  {
    id: "C4",
    title: "Autocorrect",
    line: "Autocorrect changed 'meeting at noon' to 'meeting at moon' with total confidence, and now twelve people think I've invented a lunar standup and nobody will let me live it down.",
    annoyance: "autocorrect",
    scores: [2, 1, 2, 2, 1],
    why: "a rant, not an essay; 'meeting at moon' earns a smirk, not a laugh; one concrete correction; every clause works; autocorrect horror stories are the most-told phone rant in existence",
  },
  {
    id: "C5",
    title: "The Microwave",
    line: "Someone microwaved fish at 9 a.m. and the whole floor now smells like a harbour at low tide, and the culprit is sitting there eating it like the rest of us signed a waiver.",
    annoyance: "microwave",
    scores: [2, 2, 2, 2, 1],
    why: "a rant, not an essay; the harbour at low tide is a real laugh; one concrete fish, one concrete morning; every clause works; but fish in the office microwave is a rant everyone has heard",
  },
  {
    id: "C6",
    title: "Bagging Area",
    line: "The self-checkout accused me of an 'unexpected item in the bagging area' — the item was my own shopping bag, and now a robot is judging me for a crime I committed with my own groceries.",
    annoyance: "self-checkout",
    scores: [2, 2, 2, 2, 2],
    why: "a rant, not an essay; being tried for a crime with your own groceries is a real laugh; one concrete machine, one concrete accusation; every clause works; the machine as prosecutor, not helper, is a fresh angle",
  },
  {
    id: "C7",
    title: "Password Rules",
    line: "The password form rejected my password for lacking a symbol, a number, a capital, and apparently a blood sample, then asked me to remember the thing it just made unrememberable.",
    annoyance: "password",
    scores: [2, 1, 2, 2, 1],
    why: "a rant, not an essay; 'a blood sample' earns a smirk, not a laugh; one concrete form; every clause works; password-rule rants are told a hundred times a day",
  },
  // Pass 2 challengers (C8-C10).
  {
    id: "C8",
    title: "Just K",
    line: "I wrote three paragraphs explaining the plan and he replied 'k', one letter, and somehow that single letter carried the full weight of a man who read nothing and decided everything.",
    annoyance: "'k'",
    scores: [2, 2, 2, 2, 1],
    why: "a rant, not an essay; the single letter carrying the full weight is a real laugh; one concrete reply; every clause works; but the one-letter reply is already a well-worn group-chat meme",
  },
  {
    id: "C9",
    title: "Every Floor",
    line: "He got in the lift and pressed every floor like he was playing the piano, and now we are stopping at floors nobody asked for while he hums like this is a tour.",
    annoyance: "lift",
    scores: [2, 2, 2, 1, 2],
    why: "a rant, not an essay; the piano player in the lift is a real laugh; one concrete ride; the closing 'like this is a tour' is a beat that does not quite earn its place; nobody has ranted the lift as a piano before",
  },
  {
    id: "C10",
    title: "Forgot Password",
    line: "I clicked 'forgot password' and the reset email arrived twenty minutes later, by which time I had already invented a new password, forgotten it too, and started a new life without the account.",
    annoyance: "forgot password",
    scores: [2, 2, 2, 2, 1],
    why: "a rant, not an essay; starting a new life without the account is a real laugh; one concrete reset email; every clause works; but the late reset email is a familiar annoyance with a familiar punchline",
  },
];

function total(c: Candidate): number {
  return c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);
}

function charCount(s: string): number {
  return [...s].length;
}

function byteCount(s: string): number {
  return Buffer.byteLength(s, "utf8");
}

// Gate + shape validation. Throws on any failure (fail loudly).
function validate(text: string, label: string): void {
  const chars = charCount(text);
  if (chars < 1 || chars > 400) {
    throw new Error(`${label}: ${chars} chars, gate requires 1-400`);
  }
  if (text.trim().length === 0) {
    throw new Error(`${label}: only white space`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error(`${label}: more than one line, gate requires exactly one line`);
  }
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    throw new Error(`${label}: not clean UTF-8 round-trip`);
  }
  if (/[\u0000-\u001f\u007f]/.test(text)) {
    throw new Error(`${label}: control characters present`);
  }
}

function main(): void {
  // Validate every candidate against the gate before scoring, and check each
  // names its one specific concrete everyday annoyance.
  for (const c of CANDIDATES) {
    validate(c.line, c.id);
    if (!c.line.toLowerCase().includes(c.annoyance.toLowerCase())) {
      throw new Error(`${c.id}: does not name its annoyance (${c.annoyance})`);
    }
  }

  // Score every candidate, print the table, pick the winner.
  const ranked = [...CANDIDATES]
    .map((c) => ({ c, total: total(c), bytes: byteCount(c.line) }))
    .sort((a, b) => b.total - a.total || a.bytes - b.bytes || (a.c.id < b.c.id ? -1 : 1));
  console.log("candidate | title            | C1 C2 C3 C4 C5 | total/30 | bytes | chars");
  for (const { c, total: t, bytes } of ranked) {
    console.log(
      `${c.id.padEnd(9)} | ${c.title.padEnd(16)} | ${c.scores.join("  ")} | ${String(t).padStart(5)}    | ${String(bytes).padStart(5)} | ${charCount(c.line)}`,
    );
  }
  for (const { c } of ranked) console.log(`${c.id} ${c.title}: ${c.why}`);
  const winner = ranked[0];
  console.log(`winner: ${winner.c.id} "${winner.c.title}" total ${winner.total}/30, ${winner.bytes} bytes`);

  const text = winner.c.line;
  validate(text, "winner");
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  const outPath = `${outDir}/entry.txt`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, text, "utf8");

  // Re-read and verify: byte-identical to the chosen entry, gate still passes.
  const back = readFileSync(outPath);
  if (!back.equals(Buffer.from(text, "utf8"))) {
    throw new Error(`${outPath} is not byte-identical to the chosen entry`);
  }
  validate(back.toString("utf8"), "re-read");
  console.log(`wrote ${outPath}: ${winner.bytes} bytes, ${charCount(text)} chars, gate OK`);
  console.log("--- entry ---");
  console.log(text);
}

main();
