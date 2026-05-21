import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gvkljtwhsulzdpsapaau.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2a2xqdHdoc3VsemRwc2FwYWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzQ3MTUsImV4cCI6MjA5NDUxMDcxNX0.AdZ6nW9ClSa-HHqND7vuTYj1Vh6YEta5LX86ep8qcQ4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const AUTH_API = "https://auth.theaigentscompany.xyz";

export async function loginApi(pseudo, password) {
  const res = await fetch(`${AUTH_API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pseudo, password }),
  });
  return res.json();
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem("session")); } catch { return null; }
}

export function setSession(data) {
  localStorage.setItem("session", JSON.stringify(data));
}

export function clearSession() {
  localStorage.removeItem("session");
}
