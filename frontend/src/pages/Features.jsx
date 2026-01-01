import React, { useState } from "react";
import "./Features.css";

const FeaturesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const features = [
    {
      title: "User Account Features",
      items: [
        "User Registration",
        "Secure Login and Logout",
        "Profile Management",
        "Password Reset",
      ],
    },
    {
      title: "Menstrual Cycle Tracking",
      items: [
        "Add Period Dates",
        "Edit or Delete Records",
        "Track Flow Level",
        "Track Mood and Pain",
      ],
    },
    {
      title: "Period Prediction",
      items: [
        "Next Period Prediction",
        "Average Cycle Length Calculation",
        "Basic Analytics",
      ],
    },
    {
      title: "Charts and Analytics",
      items: [
        "Cycle History Charts",
        "Flow Trend Charts",
        "Mood Pattern Charts",
        "Dashboard Summary",
      ],
    },
    {
      title: "Health Education",
      items: [
        "Menstrual Health Articles",
        "Hygiene Tips",
        "Self Care Guidance",
      ],
    },
    {
      title: "Video Learning",
      items: [
        "Educational Videos",
        "Awareness Videos",
        "Professional Guidance",
      ],
    },
    {
      title: "Anonymous Question Support",
      items: [
        "Ask Questions Privately",
        "No Identity Shown",
        "Support and Guidance",
      ],
    },
    {
      title: "Guest Access",
      items: [
        "View Articles Without Login",
        "View Videos Without Login",
      ],
    },
    {
      title: "Privacy and Security",
      items: [
        "Data Privacy Protection",
        "Secure Database Storage",
        "Confidential User Data",
      ],
    },
    {
      title: "System Convenience",
      items: [
        "Web Based Platform",
        "Mobile Friendly",
        "Simple Interface",
      ],
    },
  ];

  // filter by search text
  const filteredFeatures = features.filter((section) =>
    (section.title + " " + section.items.join(" "))
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="features-container">
      <h1 className="page-title">HerCycle – Features</h1>

      <p className="page-description">
        Search and explore the features of the HerCycle web system. Type any word like
        <b> period, chart, login, education, prediction </b> etc.
      </p>

      <input
        type="text"
        placeholder="Search features..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="features-grid">
        {filteredFeatures.length === 0 ? (
          <p className="no-results">No features found for your search.</p>
        ) : (
          filteredFeatures.map((section, index) => (
            <div key={index} className="feature-card">
              <h2 className="feature-title">{section.title}</h2>
              <ul className="feature-list">
                {section.items.map((item, i) => (
                  <li key={i} className="feature-item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeaturesPage;
