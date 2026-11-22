// Cursor app identity: the simulated viewer for local development. Yours to edit.
// Keep in sync with identity.dev.js (Turbopack resolves identity.ts → "./identity.dev.js").

export const DEV_VIEWER: {
  sub: string;
  email: string;
  name?: string;
  teamId?: number;
  teamRole?: "admin" | "member" | "service";
} | null = {
  sub: "user:dev",
  email: "dev@example.com",
  name: "Dev Viewer",
  teamId: 1,
  teamRole: "admin",
};
