import { upsertCycleProfile, addCycleTracker } from "../../services/cycleApi";



function TipCard({ title, body, tag }) {
    return (
        <div style={styles.card}>
            <div style={styles.cardTop}>
                <h4 style={styles.cardTitle}>{title}</h4>

                {/* show tag only if it exists */}
                {tag && <span style={styles.tag}>{tag}</span>}
            </div>

            <p style={styles.cardBody}>{body}</p>
        </div>
    );
}


function HealthTipsPanel() {
    const tips = [
        {
            title: "Cramps Relief (Calm & Quick)",
            body:
                "Try a warm compress on the lower belly, gentle stretching, and slow breathing. Stay hydrated and consider light movement (short walk) if you can.",
        },
        {
            title: "Bloating Support",
            body:
                "Reduce salty foods, sip warm water/tea, and add potassium-rich foods (banana, avocado). A gentle tummy massage can help too.",
        },
        {
            title: "Energy Boost (Low Days)",
            body:
                "Prioritize sleep, add protein with meals, and keep small snacks ready. If you feel dizzy or unusually tired, rest and hydrate first.",
        },
        {
            title: "Mood Care",
            body:
                "Short breaks, journaling, and light exercise can stabilize mood. Track mood patterns—later the AI module can personalize this further.",
        },
        {
            title: "When to Get Help",
            tag: "Important",
            body:
                "If pain is severe, you faint, bleed very heavily, or symptoms suddenly change, it’s safer to consult a healthcare professional.",
        },
    ];

    return (
        <div style={styles.wrapper}>
            <div style={styles.header}>
                <h2 style={styles.title}>Health Tips</h2>
                <p style={styles.subtitle}>
                    Gentle, calming tips to support you through each phase 🌷
                </p>
            </div>

            <div style={styles.grid}>
                {tips.map((t, idx) => (
                    <TipCard key={idx} title={t.title} body={t.body} tag={t.tag} />
                ))}
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        marginTop: "1rem",
        background: "linear-gradient(180deg, #ffffff, #fff6fb)",
        border: "1px solid #f1d5ff",
        padding: "1.5rem",
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        maxWidth: "980px",
    },
    header: { marginBottom: "1rem" },
    title: { margin: 0, color: "#7b2cbf" },
    subtitle: { margin: "0.35rem 0 0", color: "#6c757d", fontSize: "14px" },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1rem",
        marginTop: "1rem",
    },

    card: {
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #f6e7ff",
        padding: "1rem",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    },
    cardTop: { display: "flex", justifyContent: "space-between", gap: "10px" },
    cardTitle: { margin: 0, color: "#5a189a", fontSize: "15px" },
    tag: {
        background: "rgba(255, 93, 143, 0.12)", // soft red accent (calm)
        border: "1px solid rgba(255, 93, 143, 0.25)",
        color: "#b5179e",
        padding: "5px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "700",
        whiteSpace: "nowrap",
        height: "fit-content",
    },
    cardBody: { margin: "0.7rem 0 0", color: "#343a40", fontSize: "14px" },
};

export default HealthTipsPanel;
