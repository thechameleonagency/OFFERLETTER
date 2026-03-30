import type { OfferLetterData, OfferLetterRecord } from "../types/offer-letter";

const RECORDS_KEY = "offer-letter-records";
const DRAFT_KEY = "offer-letter-draft";

function readRecords() {
  const raw = localStorage.getItem(RECORDS_KEY);
  if (!raw) {
    return [] as OfferLetterRecord[];
  }

  try {
    return JSON.parse(raw) as OfferLetterRecord[];
  } catch {
    return [];
  }
}

function writeRecords(records: OfferLetterRecord[]) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function listOfferLetters() {
  return readRecords().sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function getOfferLetter(id: string) {
  return readRecords().find((record) => record.id === id) ?? null;
}

export function saveOfferLetterRecord(input: { id?: string; name: string; content: OfferLetterData }) {
  const records = readRecords();
  const now = new Date().toISOString();
  const existing = input.id ? records.find((record) => record.id === input.id) : undefined;

  const record: OfferLetterRecord = existing
    ? { ...existing, name: input.name, content: input.content, updatedAt: now }
    : {
        id: crypto.randomUUID(),
        name: input.name,
        content: input.content,
        createdAt: now,
        updatedAt: now,
      };

  const nextRecords = existing
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records];

  writeRecords(nextRecords);
  return record;
}

export function deleteOfferLetterRecord(id: string) {
  writeRecords(readRecords().filter((record) => record.id !== id));
}

export function saveDraft(content: OfferLetterData) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
}

export function getDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as OfferLetterData;
  } catch {
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
