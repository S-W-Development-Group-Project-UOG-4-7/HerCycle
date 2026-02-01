import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [landingPageData, setLandingPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    hero: { badgeText: "", mainHeading: "", subheading: "" },
    about: { title: "", description1: "", description2: "" },
    mission: { title: "", description: "" },
    contact: { title: "", description: "" },
    footer: { tagline: "", supportEmail: "", socialLinks: [] },
    features: [],
    stats: [],
  });

  // ---------- UI helpers ----------
  const sections = useMemo(
    () => [
      { id: "hero", label: "Hero", dot: "dot-pink" },
      { id: "about", label: "About", dot: "dot-purple" },
      { id: "mission", label: "Mission", dot: "dot-teal" },
      { id: "contact", label: "Contact", dot: "dot-blue" },
      { id: "features", label: "Features", dot: "dot-yellow" },
      { id: "stats", label: "Stats", dot: "dot-rose" },
      { id: "footer", label: "Footer", dot: "dot-indigo" },
    ],
    []
  );

  const refs = useRef({});
  const scrollTo = (id) => {
    const el = refs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stableStringify = (obj) => {
    const replacer = (key, value) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return Object.keys(value)
          .sort()
          .reduce((acc, k) => {
            acc[k] = value[k];
            return acc;
          }, {});
      }
      return value;
    };
    return JSON.stringify(obj, replacer);
  };

  const isDirty = useMemo(() => {
    if (!landingPageData) return false;
    return stableStringify(formData) !== stableStringify(landingPageData);
  }, [formData, landingPageData]);

  // ---------- Fetch current landing page data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch("http://localhost:5000/api/landing-page/admin", { headers });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const serverData = result.data;

            setFormData({
              hero: serverData.hero || { badgeText: "", mainHeading: "", subheading: "" },
              about: serverData.about || { title: "", description1: "", description2: "" },
              mission: serverData.mission || { title: "", description: "" },
              contact: serverData.contact || { title: "", description: "" },
              footer: serverData.footer || { tagline: "", supportEmail: "", socialLinks: [] },
              features: serverData.features || [],
              stats: serverData.stats || [],
            });

            setLandingPageData(serverData);
            setMessage({ type: "success", text: "Data loaded successfully!" });
          }
        } else {
          setMessage({ type: "error", text: "Failed to load data. Status: " + response.status });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({
          type: "error",
          text: "Failed to connect to server. Make sure backend is running on port 5000.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------- Handlers (NO LOGIC CHANGE) ----------
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => {
      if (section === "hero" || section === "about" || section === "mission" || section === "contact") {
        return { ...prev, [section]: { ...prev[section], [field]: value } };
      } else if (section === "footer") {
        return { ...prev, footer: { ...prev.footer, [field]: value } };
      }
      return prev;
    });
  };

  const handleFeatureChange = (index, field, value) => {
    setFormData((prev) => {
      const newFeatures = [...prev.features];
      if (!newFeatures[index]) newFeatures[index] = { icon: "", title: "", description: "" };
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      return { ...prev, features: newFeatures };
    });
  };

  const handleStatChange = (index, field, value) => {
    setFormData((prev) => {
      const newStats = [...prev.stats];
      if (!newStats[index]) newStats[index] = { number: "", label: "" };
      newStats[index] = { ...newStats[index], [field]: value };
      return { ...prev, stats: newStats };
    });
  };

  const handleSocialLinkChange = (index, field, value) => {
    setFormData((prev) => {
      const newSocialLinks = [...(prev.footer.socialLinks || [])];
      if (!newSocialLinks[index]) newSocialLinks[index] = { name: "", icon: "", color: "", url: "" };
      newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
      return { ...prev, footer: { ...prev.footer, socialLinks: newSocialLinks } };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const token = localStorage.getItem("authToken");
      const headers = token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };

      const response = await fetch("http://localhost:5000/api/landing-page/admin", {
        method: "PUT",
        headers,
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: "Landing page updated successfully!" });
        setLandingPageData(formData);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to update" });
      }
    } catch (error) {
      console.error("Error saving data:", error);
      setMessage({ type: "error", text: "Failed to save changes. Please check console." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (landingPageData) {
      setFormData(landingPageData);
      setMessage({ type: "info", text: "Form reset to last saved data" });
    }
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, { icon: "✨", title: "", description: "" }] }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
    }
  };

  const addStat = () => {
    setFormData((prev) => ({ ...prev, stats: [...prev.stats, { number: "", label: "" }] }));
  };

  const removeStat = (index) => {
    if (formData.stats.length > 1) {
      setFormData((prev) => ({ ...prev, stats: prev.stats.filter((_, i) => i !== index) }));
    }
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialLinks: [...(prev.footer.socialLinks || []), { name: "", icon: "", color: "", url: "" }],
      },
    }));
  };

  const removeSocialLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      footer: { ...prev.footer, socialLinks: (prev.footer.socialLinks || []).filter((_, i) => i !== index) },
    }));
  };

  const availableIcons = ["🌸", "💜", "🤝", "✨", "📱", "💬", "🔒", "📊", "❤️", "🌟", "🎯", "💡"];

  if (loading) {
    return (
      <div className="ap ap-loading">
        <div className="ap-bg" />
        <div className="ap-loader">
          <div className="ap-spinner" />
          <div>
            <div className="ap-loader-title">Loading admin panel…</div>
            <div className="ap-loader-sub">Make sure backend is running on port 5000</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ap">
      <div className="ap-bg" />

      {/* Sticky Header */}
      <div className="ap-topbar">
        <div className="ap-topbar-inner">
          <div className="ap-titleblock">
            <h1 className="ap-title">
              Her<span className="ap-title-gradient">Cycle</span> Landing Page Manager
            </h1>
            <p className="ap-subtitle">Clear, aligned & colorful landing page manager</p>

            <div className="ap-badges">
              <span className="ap-badge">
                <span className="ap-dot ap-dot-green" />
                Backend: <span className="ap-badge-strong">http://localhost:5000</span>
              </span>

              <span className={`ap-badge ${isDirty ? "ap-badge-warn" : "ap-badge-ok"}`}>
                {isDirty ? "⚠️ Unsaved changes" : "✅ Saved"}
              </span>
            </div>
          </div>

          <div className="ap-actions">
            <button className="ap-btn ap-btn-ghost" onClick={handleReset} disabled={saving}>
              Reset
            </button>

            <button className="ap-btn ap-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <span className="ap-mini-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="ap-btn-icon">💾</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section Navigation (clear & easy) */}
        <div className="ap-nav">
          <div className="ap-nav-inner">
            {sections.map((s) => (
              <button key={s.id} className="ap-chip" onClick={() => scrollTo(s.id)}>
                <span className={`ap-dot ${s.dot}`} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`ap-message ${message.type}`}>
            <div className="ap-message-icon">
              {message.type === "success" ? "✅" : message.type === "error" ? "❌" : "ℹ️"}
            </div>
            <div className="ap-message-text">{message.text}</div>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="ap-container">
        <div className="ap-grid">
          {/* LEFT */}
          <div className="ap-col ap-col-left">
            {/* HERO */}
            <section ref={(el) => (refs.current.hero = el)} className="ap-card">
              <SectionHeader title="Hero Section" subtitle="Top content users see first" dot="dot-pink" />
              <div className="ap-form-grid">
                <Field label="Badge Text" hint="Short highlight">
                  <input
                    className="ap-input"
                    value={formData.hero.badgeText || ""}
                    onChange={(e) => handleInputChange("hero", "badgeText", e.target.value)}
                    placeholder="e.g., Empowering Women Worldwide"
                  />
                </Field>

                <Field label="Main Heading" hint="Big headline">
                  <input
                    className="ap-input"
                    value={formData.hero.mainHeading || ""}
                    onChange={(e) => handleInputChange("hero", "mainHeading", e.target.value)}
                    placeholder="e.g., Your Circle of Strength & Support"
                  />
                </Field>

                <div className="ap-span-2">
                  <Field label="Subheading" hint="Short description">
                    <textarea
                      className="ap-textarea"
                      value={formData.hero.subheading || ""}
                      onChange={(e) => handleInputChange("hero", "subheading", e.target.value)}
                      placeholder="Join a compassionate community where menstrual health is understood, tracked, and supported..."
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* ABOUT */}
            <section ref={(el) => (refs.current.about = el)} className="ap-card">
              <SectionHeader title="About Section" subtitle="Explain your product clearly" dot="dot-purple" />

              <div className="ap-stack">
                <Field label="Title" hint="Section heading">
                  <input
                    className="ap-input"
                    value={formData.about.title || ""}
                    onChange={(e) => handleInputChange("about", "title", e.target.value)}
                    placeholder="e.g., More Than Just Period Tracking"
                  />
                </Field>

                <div className="ap-form-grid">
                  <Field label="Description Part 1" hint="First paragraph">
                    <textarea
                      className="ap-textarea"
                      value={formData.about.description1 || ""}
                      onChange={(e) => handleInputChange("about", "description1", e.target.value)}
                      placeholder="HerCycle is a safe, inclusive digital community..."
                    />
                  </Field>

                  <Field label="Description Part 2" hint="Second paragraph">
                    <textarea
                      className="ap-textarea"
                      value={formData.about.description2 || ""}
                      onChange={(e) => handleInputChange("about", "description2", e.target.value)}
                      placeholder="Our platform combines intuitive cycle tracking..."
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* MISSION */}
            <section ref={(el) => (refs.current.mission = el)} className="ap-card">
              <SectionHeader title="Mission Section" subtitle="Purpose & direction" dot="dot-teal" />

              <div className="ap-form-grid">
                <Field label="Title" hint="Short & inspiring">
                  <input
                    className="ap-input"
                    value={formData.mission.title || ""}
                    onChange={(e) => handleInputChange("mission", "title", e.target.value)}
                    placeholder="e.g., Breaking Barriers, Building Bridges"
                  />
                </Field>

                <div className="ap-span-2">
                  <Field label="Description" hint="Mission statement">
                    <textarea
                      className="ap-textarea ap-textarea-tall"
                      value={formData.mission.description || ""}
                      onChange={(e) => handleInputChange("mission", "description", e.target.value)}
                      placeholder="To create an inclusive, educated, and supportive ecosystem..."
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* CONTACT */}
            <section ref={(el) => (refs.current.contact = el)} className="ap-card">
              <SectionHeader title="Contact Section" subtitle="Call-to-action area" dot="dot-blue" />

              <div className="ap-form-grid">
                <Field label="Title" hint="CTA heading">
                  <input
                    className="ap-input"
                    value={formData.contact.title || ""}
                    onChange={(e) => handleInputChange("contact", "title", e.target.value)}
                    placeholder="e.g., Ready to Join Us?"
                  />
                </Field>

                <div className="ap-span-2">
                  <Field label="Description" hint="CTA description">
                    <textarea
                      className="ap-textarea"
                      value={formData.contact.description || ""}
                      onChange={(e) => handleInputChange("contact", "description", e.target.value)}
                      placeholder="Start your journey with HerCycle today..."
                    />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="ap-col ap-col-right">
            {/* FEATURES */}
            <section ref={(el) => (refs.current.features = el)} className="ap-card">
              <div className="ap-card-top">
                <SectionHeader title="Features" subtitle="Displayed on landing page" dot="dot-yellow" />
                <button className="ap-btn ap-btn-add" onClick={addFeature}>
                  + Add
                </button>
              </div>

              <div className="ap-list">
                {formData.features.map((feature, index) => (
                  <div key={index} className="ap-item">
                    <div className="ap-item-top">
                      <div>
                        <div className="ap-item-title">Feature #{index + 1}</div>
                        <div className="ap-item-sub">Icon • Title • Description</div>
                      </div>

                      {formData.features.length > 1 && (
                        <button className="ap-link-danger" onClick={() => removeFeature(index)}>
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="ap-row">
                      <select
                        className="ap-select"
                        value={feature.icon || "🌸"}
                        onChange={(e) => handleFeatureChange(index, "icon", e.target.value)}
                      >
                        {availableIcons.map((icon, i) => (
                          <option key={i} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>

                      <div className="ap-iconPreview">{feature.icon || "🌸"}</div>

                      <input
                        className="ap-input"
                        value={feature.title || ""}
                        onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                        placeholder="Feature title"
                      />
                    </div>

                    <textarea
                      className="ap-textarea ap-textarea-small"
                      value={feature.description || ""}
                      onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                      placeholder="Feature description"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* STATS */}
            <section ref={(el) => (refs.current.stats = el)} className="ap-card">
              <div className="ap-card-top">
                <SectionHeader title="Statistics" subtitle="Numbers on landing page" dot="dot-rose" />
                <button className="ap-btn ap-btn-add" onClick={addStat}>
                  + Add
                </button>
              </div>

              <div className="ap-list">
                {formData.stats.map((stat, index) => (
                  <div key={index} className="ap-item">
                    <div className="ap-item-top">
                      <div className="ap-item-title">Stat #{index + 1}</div>
                      {formData.stats.length > 1 && (
                        <button className="ap-link-danger" onClick={() => removeStat(index)}>
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="ap-form-grid">
                      <input
                        className="ap-input"
                        value={stat.number || ""}
                        onChange={(e) => handleStatChange(index, "number", e.target.value)}
                        placeholder="e.g., 50K+"
                      />
                      <input
                        className="ap-input"
                        value={stat.label || ""}
                        onChange={(e) => handleStatChange(index, "label", e.target.value)}
                        placeholder="e.g., Active Users"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FOOTER */}
            <section ref={(el) => (refs.current.footer = el)} className="ap-card">
              <div className="ap-card-top">
                <SectionHeader title="Footer" subtitle="Support email & social links" dot="dot-indigo" />
                <button className="ap-btn ap-btn-add" onClick={addSocialLink}>
                  + Add Social
                </button>
              </div>

              <div className="ap-stack">
                <Field label="Tagline" hint="Short footer text">
                  <textarea
                    className="ap-textarea"
                    value={formData.footer.tagline || ""}
                    onChange={(e) => handleInputChange("footer", "tagline", e.target.value)}
                    placeholder="Empowering women worldwide with comprehensive menstrual health support..."
                  />
                </Field>

                <Field label="Support Email" hint="Public support email">
                  <input
                    className="ap-input"
                    type="email"
                    value={formData.footer.supportEmail || ""}
                    onChange={(e) => handleInputChange("footer", "supportEmail", e.target.value)}
                    placeholder="support@hercycle.com"
                  />
                </Field>

                <div>
                  <div className="ap-subsectionTitle">Social Links</div>

                  <div className="ap-list">
                    {(formData.footer.socialLinks || []).map((social, index) => (
                      <div key={index} className="ap-item">
                        <div className="ap-item-top">
                          <div className="ap-item-title">Social Link #{index + 1}</div>
                          <button className="ap-link-danger" onClick={() => removeSocialLink(index)}>
                            Remove
                          </button>
                        </div>

                        <div className="ap-form-grid">
                          <input
                            className="ap-input"
                            value={social.name || ""}
                            onChange={(e) => handleSocialLinkChange(index, "name", e.target.value)}
                            placeholder="e.g., Instagram"
                          />
                          <input
                            className="ap-input"
                            value={social.icon || ""}
                            onChange={(e) => handleSocialLinkChange(index, "icon", e.target.value)}
                            placeholder="e.g., I"
                          />
                        </div>

                        <div className="ap-form-grid">
                          <input
                            className="ap-input"
                            value={social.color || ""}
                            onChange={(e) => handleSocialLinkChange(index, "color", e.target.value)}
                            placeholder="from-purple-500 to-pink-500"
                          />
                          <input
                            className="ap-input"
                            value={social.url || ""}
                            onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom bar (unchanged links) */}
        <div className="ap-bottom">
          <div className="ap-bottom-left">
            <div className="ap-bottom-row">
              <span className="ap-bottom-label">API Status:</span>
              <a href="http://localhost:5000/api/landing-page/admin" target="_blank" rel="noreferrer">
                http://localhost:5000/api/landing-page/admin
              </a>
            </div>
            <div className="ap-bottom-row">
              <span className="ap-bottom-label">Seed Database:</span>
              <a href="http://localhost:5000/api/seed" target="_blank" rel="noreferrer">
                http://localhost:5000/api/seed
              </a>
            </div>
          </div>

          <div className="ap-bottom-actions">
            <a className="ap-btn ap-btn-ghost" href="http://localhost:5000" target="_blank" rel="noreferrer">
              ↗️ View Live
            </a>
            <a className="ap-btn ap-btn-primary" href="/" target="_blank" rel="noreferrer">
              🔍 Preview
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// small UI components
const SectionHeader = ({ title, subtitle, dot }) => (
  <div className="ap-sectionHeader">
    <div className="ap-sectionTitleRow">
      <span className={`ap-dot ${dot}`} />
      <h2 className="ap-sectionTitle">{title}</h2>
    </div>
    {subtitle && <p className="ap-sectionSub">{subtitle}</p>}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="ap-field">
    <div className="ap-fieldTop">
      <label className="ap-label">{label}</label>
      {hint && <span className="ap-hint">{hint}</span>}
    </div>
    {children}
  </div>
);

export default AdminPanel;
