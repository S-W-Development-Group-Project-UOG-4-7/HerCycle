const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Safely parse JSON. If the server returns HTML (like an error page),
 * we throw a readable error instead of: Unexpected token '<'
 */
async function safeJson(res) {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Server returned invalid JSON.");
    }
  }

  // Not JSON (often HTML error page)
  const preview = text.slice(0, 120).replace(/\s+/g, " ");
  throw new Error(`Server returned non-JSON response: ${preview}`);
}

export async function getCycleProfile(nic) {
  const res = await fetch(`${BASE_URL}/api/cycle/profile/${nic}`);
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to fetch cycle profile");
  return data.data;
}

// Create/update cycle profile (POST /api/cycle/profile)
export async function upsertCycleProfile(payload) {
  const res = await fetch(`${BASE_URL}/api/cycle/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to save cycle profile");
  return data.data;
}

// Add a tracker entry (POST /api/cycle/tracker)
export async function addCycleTracker(payload) {
  const res = await fetch(`${BASE_URL}/api/cycle/tracker`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to add cycle tracker");
  return data.data;
}

export async function saveDailyLog(payload) {
  const res = await fetch(`${BASE_URL}/api/cycle/daily-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to save daily log");
  return data.data;
}

export async function getCycleHistory(nic) {
  const res = await fetch(`${BASE_URL}/api/cycle/history/${nic}`);
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to fetch cycle history");
  return data.data; // { daily_logs, cycle_trackers }
}

export async function deleteDailyLog(logId) {
  const res = await fetch(`${BASE_URL}/api/cycle/daily-log/${logId}`, {
    method: "DELETE",
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to delete daily log");
  return data.data;
}

export async function deleteCycleTracker(trackerId) {
  const res = await fetch(`${BASE_URL}/api/cycle/tracker/${trackerId}`, {
    method: "DELETE",
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to delete cycle entry");
  return data.data;
}
