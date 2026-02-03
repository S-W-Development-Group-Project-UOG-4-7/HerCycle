import { useEffect, useMemo, useState } from "react";
import { getCycleProfile, upsertCycleProfile } from "../../services/cycleApi";

function ProfilePanel() {
  // HerCycle stores user object in localStorage under "user"
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const nic = user?.NIC || user?.nic || user?.Nic || user?.idNumber || null;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Cycle profile form fields
  const [form, setForm] = useState({
    cycle_length: 28,
    period_length: 5,
    tracking_preferences: {
      reminders: true,
      fertileWindow: true,
    },
    privacy_settings: {
      shareWithDoctor: false,
      privateMode: true,
    },
  });

  const load = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (!nic) {
      setError("Logged-in user NIC not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const data = await getCycleProfile(nic);
      setProfile(data || null);

      // If profile exists, populate form with saved values (fallback to defaults)
      if (data) {
        setForm({
          cycle_length: Number(data.cycle_length ?? 28),
          period_length: Number(data.period_length ?? 5),
          tracking_preferences: {
            reminders: Boolean(data.tracking_preferences?.reminders ?? true),
            fertileWindow: Boolean(data.tracking_preferences?.fertileWindow ?? true),
          },
          privacy_settings: {
            shareWithDoctor: Boolean(data.privacy_settings?.shareWithDoctor ?? false),
            privateMode: Boolean(data.privacy_settings?.privateMode ?? true),
          },
        });
      }
    } catch (e) {
      // If server returns 404/empty for new users, just show defaults
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setError("");
    setMessage("");

    if (!nic) {
      setError("Logged-in user NIC not found. Please log in again.");
      return;
    }

    // Basic validation
    const cycleLen = Number(form.cycle_length);
    const periodLen = Number(form.period_length);

    if (!Number.isFinite(cycleLen) || cycleLen < 15 || cycleLen > 60) {
      setError("Cycle length must be between 15 and 60 days.");
      return;
    }
    if (!Number.isFinite(periodLen) || periodLen < 1 || periodLen > 15) {
      setError("Period length must be between 1 and 15 days.");
      return;
    }

    try {
      const saved = await upsertCycleProfile({
        NIC: nic,
        cycle_length: cycleLen,
        period_length: periodLen,
        tracking_preferences: form.tracking_preferences,
        privacy_settings: form.privacy_settings,
      });

      setProfile(saved || true); // keep UI in "has profile" state
      setMessage("Cycle profile saved.");
      setEditMode(false);
    } catch (e) {
      setError(e?.message || "Failed to save cycle profile.");
    }
  };

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>Cycle Profile ⚙️</h2>

      {loading && <p style={styles.muted}>Loading…</p>}
      {!loading && error && <p style={styles.error}>{error}</p>}
      {!loading && message && <p style={styles.success}>{message}</p>}

      {!loading && (
        <div style={styles.card}>
          <div style={styles.rowTop}>
            <div>
              <div style={styles.small}>NIC</div>
              <div style={styles.value}>{nic || "—"}</div>
            </div>

            {!editMode ? (
              <button style={styles.softBtn} onClick={() => setEditMode(true)}>
                {profile ? "Edit Cycle Profile" : "Set Up Cycle Profile"}
              </button>
            ) : (
              <button
                style={styles.softBtn2}
                onClick={() => {
                  setEditMode(false);
                  setMessage("");
                  setError("");
                  load();
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div style={styles.grid}>
            <div>
              <div style={styles.small}>Cycle Length (days)</div>
              <input
                type="number"
                style={styles.input}
                value={form.cycle_length}
                onChange={(e) => setForm({ ...form, cycle_length: e.target.value })}
                disabled={!editMode}
                min={15}
                max={60}
              />
            </div>

            <div>
              <div style={styles.small}>Period Length (days)</div>
              <input
                type="number"
                style={styles.input}
                value={form.period_length}
                onChange={(e) => setForm({ ...form, period_length: e.target.value })}
                disabled={!editMode}
                min={1}
                max={15}
              />
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <h3 style={styles.subTitle}>Tracking Preferences</h3>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.tracking_preferences.reminders}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tracking_preferences: {
                      ...form.tracking_preferences,
                      reminders: e.target.checked,
                    },
                  })
                }
                disabled={!editMode}
              />
              <span>Enable reminders</span>
            </label>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.tracking_preferences.fertileWindow}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tracking_preferences: {
                      ...form.tracking_preferences,
                      fertileWindow: e.target.checked,
                    },
                  })
                }
                disabled={!editMode}
              />
              <span>Show fertile window</span>
            </label>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <h3 style={styles.subTitle}>Privacy Settings</h3>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.privacy_settings.privateMode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    privacy_settings: {
                      ...form.privacy_settings,
                      privateMode: e.target.checked,
                    },
                  })
                }
                disabled={!editMode}
              />
              <span>Private mode</span>
            </label>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.privacy_settings.shareWithDoctor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    privacy_settings: {
                      ...form.privacy_settings,
                      shareWithDoctor: e.target.checked,
                    },
                  })
                }
                disabled={!editMode}
              />
              <span>Share with doctor (optional)</span>
            </label>
          </div>

          {editMode && (
            <button style={styles.saveBtn} onClick={save}>
              Save Cycle Profile
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { maxWidth: "900px" },
  title: { color: "#7b2cbf", marginTop: 0 },
  subTitle: { color: "#b5179e", margin: "0 0 8px" },
  muted: { color: "#6c757d" },
  error: { color: "#d00000" },
  success: { color: "#2d6a4f" },
  card: {
    background: "linear-gradient(180deg, #ffffff, #fff6fb)",
    border: "1px solid #f1d5ff",
    borderRadius: "16px",
    padding: "1.25rem",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },
  rowTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  small: { fontSize: "12px", color: "#6c757d", marginBottom: "4px" },
  value: { fontWeight: "700", color: "#3c096c" },
  input: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #e7c6ff",
    outline: "none",
    minWidth: "220px",
  },
  softBtn: {
    border: "none",
    background: "rgba(157, 78, 221, 0.14)",
    color: "#5a189a",
    padding: "10px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
  },
  softBtn2: {
    border: "none",
    background: "rgba(255, 133, 192, 0.16)",
    color: "#b5179e",
    padding: "10px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
  },
  saveBtn: {
    marginTop: "14px",
    border: "none",
    width: "100%",
    background: "linear-gradient(135deg, #ff85c0, #b5179e)",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "8px 0",
    color: "#3c096c",
    fontWeight: 600,
  },
};

export default ProfilePanel;
