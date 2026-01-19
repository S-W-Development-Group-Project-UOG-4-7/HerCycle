const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function getCycleProfile(nic) {
  const res = await fetch(`${BASE_URL}/api/cycle/profile/${nic}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch cycle profile");
  return data.data;
}

export async function saveDailyLog(payload) {
  const res = await fetch(`${BASE_URL}/api/cycle/daily-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save daily log");
  return data.data;
}

export async function getCycleHistory(nic) {
  const res = await fetch(`${BASE_URL}/api/cycle/history/${nic}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch cycle history");
  return data.data; // { daily_logs, cycle_trackers }
}
