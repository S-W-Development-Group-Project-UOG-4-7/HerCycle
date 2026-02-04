import React, { useMemo } from "react";

function getFertilityWindow(cycleLen) {
  // Ovulation is commonly estimated ~14 days before next period.
  const ovulationDay = Math.max(1, cycleLen - 14);
  return {
    ovulationDay,
    fertileStart: Math.max(1, ovulationDay - 5), // fertile window often starts ~5 days before ovulation
    fertileEnd: Math.min(cycleLen, ovulationDay + 1), // and ends ~1 day after
  };
}

function clampCycleLen(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 28;
  return Math.min(60, Math.max(20, x)); // keep UI sane
}

const PHASE_INFO = {
  Menstrual: {
    accent: "menstrual",
    hormones: [
      { name: "Estrogen", level: "Low → rising" },
      { name: "Progesterone", level: "Low" },
      { name: "FSH", level: "Rising (follicle recruitment)" },
      { name: "LH", level: "Low" },
    ],
    symptoms: [
      "Cramps / lower back pain",
      "Fatigue, low energy",
      "Headaches (some people)",
      "Bowel changes (diarrhea/constipation)",
      "Lower mood or irritability",
    ],
    cravings: "Cravings can happen; some people want salty or sugary comfort foods.",
    comfort:
      "Gentle movement, heat pack, hydration may help. If sexual intercourse is uncomfortable, go slow and use lubrication.",
  },
  Follicular: {
    accent: "follicular",
    hormones: [
      { name: "Estrogen", level: "Rising" },
      { name: "Progesterone", level: "Low" },
      { name: "FSH", level: "Moderate" },
      { name: "LH", level: "Low → rising (later)" },
    ],
    symptoms: [
      "More energy / motivation",
      "Better mood (common)",
      "Skin may look clearer for some",
      "Higher social/sexual interest (varies)",
    ],
    cravings: "Cravings often reduce; appetite may feel steadier (varies).",
    comfort:
      "Often a comfortable phase for many; good time to build routines (sleep, exercise).",
  },
  Ovulatory: {
    accent: "ovulatory",
    hormones: [
      { name: "Estrogen", level: "High" },
      { name: "LH", level: "Surge" },
      { name: "FSH", level: "Small surge" },
      { name: "Progesterone", level: "Starts rising after ovulation" },
    ],
    symptoms: [
      "Cervical mucus becomes slippery/egg-white (common)",
      "Libido may peak (common)",
      "Mild one-sided pelvic ache (some people)",
      "Bloating (some people)",
    ],
    cravings:
      "Some people feel hungrier; keep protein/fiber steady if you snack more.",
    comfort: "Hydration + protection if needed. If sharp pain is severe, don’t ignore it.",
  },
  Luteal: {
    accent: "luteal",
    hormones: [
      { name: "Progesterone", level: "High → falling (late luteal)" },
      { name: "Estrogen", level: "Moderate → falling" },
      { name: "LH", level: "Low" },
      { name: "FSH", level: "Low" },
    ],
    symptoms: [
      "Bloating, breast tenderness",
      "Mood swings / irritability (PMS)",
      "Acne flare (some people)",
      "Sleep changes",
      "Sugar cravings / increased appetite (common)",
    ],
    cravings:
      "Sugar cravings are common. Try balanced snacks (protein + fiber) to reduce crashes.",
    comfort:
      "Some people prefer gentler intimacy; lubrication can help if dryness occurs.",
  },
};

function getChanceClass(chance) {
  if (chance === "Highest") return "high";
  if (chance === "Rising") return "medium";
  return "low";
}

export default function CycleSexualInsightsCard({ summary }) {
  const info = useMemo(() => {
    if (!summary?.hasData) return null;

    const cycleLen = clampCycleLen(
      summary.avgCycleLength || summary.cycleLen || 28
    );
    const periodLen = Math.min(12, Math.max(1, Number(summary.periodLen || 5)));
    const day = Number(summary.currentCycleDay || 1);

    const { ovulationDay, fertileStart, fertileEnd } =
      getFertilityWindow(cycleLen);

    const inFertileWindow = day >= fertileStart && day <= fertileEnd;
    const nearFertileWindow = day >= fertileStart - 2 && day < fertileStart;

    const phase = summary.currentPhase || "Luteal";
    const phaseInfo = PHASE_INFO[phase] || PHASE_INFO.Luteal;

    let pregnancyChance = "Low";
    if (inFertileWindow) pregnancyChance = "Highest";
    else if (nearFertileWindow) pregnancyChance = "Rising";

    let comfortNote = "";
    let libidoNote = "";
    let conceiveTip = "";
    let avoidTip = "";

    if (phase === "Menstrual") {
      comfortNote =
        "Some people feel cramps/tenderness; go gentle and consider comfort-focused positions.";
      libidoNote = "Libido varies; some feel higher, others lower.";
      conceiveTip =
        "Pregnancy chance is usually low early in the period, but cycles vary—don’t rely on timing alone.";
      avoidTip =
        "If avoiding pregnancy, use contraception even during bleeding (timing alone is not reliable).";
    } else if (phase === "Follicular") {
      comfortNote =
        "Often more comfortable as energy rises; vaginal dryness is usually less common.";
      libidoNote = "Libido and energy may increase for many people.";
      conceiveTip = `If trying to conceive: plan intercourse every 1–2 days as you approach days ${fertileStart}–${fertileEnd}.`;
      avoidTip =
        "If avoiding pregnancy: fertility is increasing as you near ovulation—use consistent contraception.";
    } else if (phase === "Ovulatory") {
      comfortNote =
        "Cervical fluid may be more slippery; some people feel mild pelvic twinges.";
      libidoNote = "Libido often peaks around ovulation for many people.";
      conceiveTip = `Best time if trying to conceive: days ${fertileStart}–${fertileEnd} (especially near day ${ovulationDay}).`;
      avoidTip =
        "If avoiding pregnancy: this is typically the highest-risk window—use reliable contraception.";
    } else {
      comfortNote =
        "PMS symptoms (bloating, breast tenderness) can make sexual intercourse less comfortable for some.";
      libidoNote = "Libido may dip for some; others feel no change.";
      conceiveTip = "If you already had an intercourse in the fertile window, now is mostly “wait and see.”";
      avoidTip =
        "Pregnancy is less likely than the ovulatory window, but still possible—use contraception if avoiding.";
    }

    const isPainRedFlag =
      "If you have severe pain, bleeding after an intercourse, unusual discharge/odor, fever, or burning, get medical advice.";

    return {
      phase,
      day,
      cycleLen,
      periodLen,
      fertileStart,
      fertileEnd,
      ovulationDay,
      pregnancyChance,
      conceiveTip,
      avoidTip,
      comfortNote,
      libidoNote,
      isPainRedFlag,
      phaseInfo,
    };
  }, [summary]);

  if (!info) {
    return (
      <div className="health-card phase-card luteal">
        <div className="card-header">
          <h3 className="card-title">Sex & Fertility Insights</h3>
          <span className="phase-badge luteal">Phase-based</span>
        </div>
        <p className="muted">
          Log your period to unlock phase-based insights.
        </p>
      </div>
    );
  }

  const accent = info?.phaseInfo?.accent || "luteal";
  const chanceClass = getChanceClass(info.pregnancyChance);

  return (
    <div className={`health-card phase-card ${accent}`}>
      <div className="card-header">
        <h3 className="card-title">Sex & Fertility Insights</h3>
        <span className={`phase-badge ${accent}`}>{info.phase} phase</span>
      </div>

      {/* Highlight row */}
      <div className="highlight-row">
        <div className={`highlight-pill ${chanceClass}`}>
          Pregnancy chance: <strong>{info.pregnancyChance}</strong>
        </div>
        <div className="highlight-pill">
          Fertile window: <strong>{info.fertileStart}–{info.fertileEnd}</strong>
        </div>
        <div className="highlight-pill subtle">
          Cycle day <strong>{info.day}</strong>
        </div>
      </div>

      {/* Main guidance */}
      <div className="two-col">
        <div className="mini-card mini-card--conceive">
          <div className="mini-title">If trying to conceive</div>
          <div className="mini-text">{info.conceiveTip}</div>
          <div className="mini-sub">
            Ovulation estimate: ~ day <strong>{info.ovulationDay}</strong>
          </div>
        </div>

        <div className="mini-card mini-card--avoid">
          <div className="mini-title">If avoiding pregnancy</div>
          <div className="mini-text">{info.avoidTip}</div>
          <div className="mini-sub">
            Reminder: timing alone is not reliable.
          </div>
        </div>
      </div>

      {/* Comfort */}
      <div className="insight-section">
        <div className="insight-section-title">💗 Comfort & mood notes</div>
        <ul className="insight-list">
          <li>{info.comfortNote}</li>
          <li>{info.libidoNote}</li>
        </ul>
      </div>

      {/* Hormones */}
      <div className="insight-section">
        <div className="insight-section-title">💗 Hormone snapshot (general)</div>
        <div className="hormone-grid">
          {info.phaseInfo.hormones.map((h) => (
            <div key={h.name} className="hormone-chip">
              <div className="hormone-name">{h.name}</div>
              <div className="hormone-level">{h.level}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Symptoms */}
      <div className="insight-section">
        <div className="insight-section-title">💗 Common symptoms this phase</div>
        <ul className="insight-list">
          {info.phaseInfo.symptoms.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
        <div className="insight-note">
          <strong>Cravings:</strong> {info.phaseInfo.cravings}
        </div>
      </div>

      {/* Safety */}
      <div className="insight-section safety-box">
        <div className="insight-section-title">💗 Safe guidance (when to check / when to get help)</div>
        <ul className="insight-list">
          <li>
            <strong>Dizziness + heavy bleeding</strong> (soaking pads, large clots, fainting) → seek medical care urgently.
          </li>
          <li>
            If you often feel dizzy, unusually tired, or short of breath during/after periods, consider asking a clinician about{" "}
            <strong>iron levels (ferritin/hemoglobin)</strong>.
          </li>
          <li>
            Severe pelvic pain, fever, foul discharge, or bleeding after a sexual intercourse → get checked (can be infection or other causes).
          </li>
          <li>
            If cycles suddenly change a lot, or you miss periods for 3+ months (not pregnant) → medical review is a good idea.
          </li>
        </ul>
        <div className="disclaimer">
          Educational only — not a diagnosis. If symptoms feel severe or new, it’s safer to talk to a doctor.
        </div>
      </div>

      <div className="tiny-muted">
        Educational only (not medical advice). {info.isPainRedFlag}
      </div>
    </div>
  );
}
