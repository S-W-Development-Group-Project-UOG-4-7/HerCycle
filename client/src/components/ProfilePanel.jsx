import { useEffect, useState } from "react";
import { apiGet, apiPut, apiPost } from "../services/api";
import { useNavigate } from "react-router-dom";

function ProfilePanel() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        deletePassword: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet("/api/profile");
            setProfile(data);
            setForm((f) => ({
                ...f,
                name: data.name || "",
                email: data.email || "",
            }));
        } catch (e) {
            setError("Could not load profile.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        load();
    }, []);

    const save = async () => {
        setError("");
        setMessage("");
        try {
            const payload = {
                name: form.name,
                email: form.email,
            };

            // Only send password change fields if user entered something
            if (form.currentPassword || form.newPassword) {
                payload.currentPassword = form.currentPassword;
                payload.newPassword = form.newPassword;
            }

            const updated = await apiPut("/api/profile", payload);
            setMessage(updated.message || "Profile updated");
            setEditMode(false);
            setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
            load();
        } catch (e) {
            setError(e.message || "Update failed.");
        }
    };

    const deleteAccount = async () => {
        setError("");
        setMessage("");

        if (!confirm("Are you sure? This will permanently delete your account.")) return;

        try {
            await apiPost("/api/profile/delete", { password: form.deletePassword });
            localStorage.removeItem("token");
            navigate("/login"); // ✅ redirects after success
        } catch (e) {
            setError(e.message || "Delete failed.");
        }
    };

    return (
        <div style={styles.wrap}>
            <h2 style={styles.title}>Profile 👤</h2>

            {loading && <p style={styles.muted}>Loading…</p>}
            {error && <p style={styles.error}>{error}</p>}
            {message && <p style={styles.success}>{message}</p>}

            {!loading && profile && (
                <div style={styles.card}>
                    <div style={styles.rowTop}>
                        <div>
                            <div style={styles.small}>Role</div>
                            <div style={styles.value}>{profile.role}</div>
                        </div>
                        {!editMode ? (
                            <button style={styles.softBtn} onClick={() => setEditMode(true)}>
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                style={styles.softBtn2}
                                onClick={() => {
                                    setEditMode(false);
                                    setForm((f) => ({
                                        ...f,
                                        name: profile.name || "",
                                        email: profile.email || "",
                                        currentPassword: "",
                                        newPassword: "",
                                        deletePassword: "",
                                    }));
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    <div style={styles.grid}>
                        <div>
                            <div style={styles.small}>Name</div>
                            {editMode ? (
                                <input
                                    style={styles.input}
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            ) : (
                                <div style={styles.value}>{profile.name}</div>
                            )}
                        </div>

                        <div>
                            <div style={styles.small}>Email</div>
                            {editMode ? (
                                <input
                                    style={styles.input}
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            ) : (
                                <div style={styles.value}>{profile.email}</div>
                            )}
                        </div>

                        <div>
                            <div style={styles.small}>Created</div>
                            <div style={styles.value}>{new Date(profile.createdAt).toLocaleDateString()}</div>
                        </div>

                        <div>
                            <div style={styles.small}>Updated</div>
                            <div style={styles.value}>{new Date(profile.updatedAt).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Password change */}
                    <div style={{ marginTop: "1rem" }}>
                        <h3 style={styles.subTitle}>Change Password </h3>

                        <div style={styles.grid2}>
                            <div>
                                <div style={styles.small}>Current Password</div>
                                <input
                                    type="password"
                                    style={styles.input}
                                    value={form.currentPassword}
                                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                    disabled={!editMode}
                                />
                            </div>

                            <div>
                                <div style={styles.small}>New Password</div>
                                <input
                                    type="password"
                                    style={styles.input}
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                    placeholder="Minimum 6 characters"
                                    disabled={!editMode}
                                />
                            </div>
                        </div>

                        {editMode && (
                            <button style={styles.saveBtn} onClick={save}>
                                Save Changes
                            </button>
                        )}
                    </div>

                    {/* Delete account */}
                    <div style={styles.dangerBox}>
                        <h3 style={styles.dangerTitle}>Delete Account</h3>
                        <p style={styles.muted}>
                            This will permanently delete your account. This action cannot be undone.
                        </p>

                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <input
                                type="password"
                                style={styles.input}
                                value={form.deletePassword}
                                onChange={(e) => setForm({ ...form, deletePassword: e.target.value })}
                                placeholder="Enter password to confirm"
                            />
                            <button style={styles.dangerBtn} onClick={deleteAccount}>
                                Delete My Account
                            </button>
                        </div>
                    </div>
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
    grid2: {
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
        marginTop: "10px",
        border: "none",
        width: "100%",
        background: "linear-gradient(135deg, #ff85c0, #b5179e)",
        color: "#fff",
        padding: "10px 12px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "800",
    },
    dangerBox: {
        marginTop: "1.2rem",
        paddingTop: "1rem",
        borderTop: "1px dashed rgba(181, 23, 158, 0.35)",
    },
    dangerTitle: { margin: 0, color: "#b00020" },
    dangerBtn: {
        border: "none",
        background: "rgba(255, 77, 109, 0.16)",
        color: "#b00020",
        padding: "10px 12px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "900",
    },
};

export default ProfilePanel;
