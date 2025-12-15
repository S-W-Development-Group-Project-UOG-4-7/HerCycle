import { useState } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);

      // Redirect to main app
      window.location.href = "/app";
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>HerCycle</h2>
        <p style={styles.subtitle}>Cycle User Login</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <p style={styles.registerText}>
          New user?{" "}
          <a href="/register" style={styles.link}>
            Register now
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f3d9ff, #ffe4f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#ffffff",
    padding: "2.5rem",
    borderRadius: "16px",
    width: "350px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    color: "#7b2cbf",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#9d4edd",
    marginBottom: "1.5rem",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "linear-gradient(135deg, #ff85c0, #b5179e)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },
  registerText: {
    marginTop: "1rem",
    fontSize: "14px",
  },
  link: {
    color: "#b5179e",
    textDecoration: "none",
    fontWeight: "bold",
  },
  error: {
    color: "#d00000",
    fontSize: "14px",
    marginBottom: "1rem",
  },
};

export default LoginPage;
