import type { Environment } from "@vertexvis/viewer";

export interface Configuration {
  readonly vertexEnv: Environment;
}

export interface StreamCredentials {
  readonly clientId: string;
  readonly streamKey: string;
}

export const Config: Configuration = {
  vertexEnv: envVar("VERTEX_ENV", "platprod") as Environment,
};

// Vertex Valve
export const DefaultCredentials: StreamCredentials = {
  clientId: "08F675C4AACE8C0214362DB5EFD4FACAFA556D463ECA00877CB225157EF58BFA",
  streamKey: "W8Nk7_Ch8u8AS4_rstyew2H6GIlvBnhf6dOc",
};

export function head<T>(items?: T | T[]): T | undefined {
  return Array.isArray(items) ? items[0] : items ?? undefined;
}

function envVar(name: string, fallback: string): string {
  const ev = process.env[name];
  return ev ? ev : fallback;
}
