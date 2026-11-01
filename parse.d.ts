export function parseHeader(text: string): { gamertag: string; level: number; gold: number; goldIndex: number } | null;
export function parseCaptaincy(text: string): { pirateGoals: number; shipGoals: number } | null;
export function parseReputation(text: string): { company: string; level: number }[];
export function buildSnapshot(parts: unknown): Record<string, unknown> | null;
