// src/global.d.ts
declare global {
  const __app_id: string;
  const __initial_auth_token: string | null;
}

// This is needed to make the file a module
export {};
