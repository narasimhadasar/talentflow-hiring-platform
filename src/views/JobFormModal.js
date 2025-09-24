import React, { useState } from "react";
import axios from "axios";

export default function JobFormModal({ onClose, onSaved, job }) {
  const [title, setTitle] = useState(job ? job.title : "");
  const [status, setStatus] = useState(job ? job.status : "active");
  const [tags, setTags] = useState(job ? (job.tags || []).join(", ") : "");
  const [error, setError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    // Generate slug from title
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    // Process tags
    const processedTags = tags.split(",").map(t => t.trim()).filter(Boolean);

    const payload = { title, slug, status, tags: processedTags };

    try {
      if (job) {
        // Edit existing job
        await axios.patch(`/api/jobs/${job.id}`, payload);
      } else {
        // Create new job (no id or order; server handles)
        await axios.post("/api/jobs", payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.message || "Validation error (e.g., duplicate slug)");
      } else if (err.response && err.response.status === 500) {
        setError("Server error. This might be a simulated failure—try again.");
      } else {
        setError("Failed to save job. Check console for details.");
      }
      console.error("Save error:", err);
    }
  }

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h3 style={modalTitleStyle}>{job ? "Edit Job" : "New Job"}</h3>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>
        {error && <div style={errorStyle}>{error}</div>}
        <form onSubmit={handleSave} style={formStyle}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Job Title</label>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter job title"
              required
            />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Status</label>
            <select style={selectStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Tags</label>
            <input
              style={inputStyle}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., engineering, remote, full-time"
            />
          </div>
          <div style={buttonGroupStyle}>
            <button type="submit" style={saveButtonStyle}>Save Job</button>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  border: "1px solid rgba(0, 212, 170, 0.3)",
  borderRadius: "20px",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(20px)",
  minWidth: "500px",
  maxWidth: "600px",
  width: "90%",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "24px 32px 16px 32px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
};

const modalTitleStyle = {
  margin: 0,
  color: "#ffffff",
  fontSize: "1.8rem",
  fontWeight: "700",
  letterSpacing: "0.5px",
};

const closeButtonStyle = {
  background: "transparent",
  border: "none",
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "24px",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "8px",
  transition: "all 0.2s",
};

const errorStyle = {
  color: "#ff6b6b",
  background: "rgba(255, 107, 107, 0.1)",
  border: "1px solid rgba(255, 107, 107, 0.3)",
  borderRadius: "12px",
  padding: "12px 16px",
  margin: "16px 32px",
  fontSize: "14px",
  fontWeight: "500",
};

const formStyle = {
  padding: "24px 32px 32px 32px",
};

const fieldGroupStyle = {
  marginBottom: "24px",
};

const labelStyle = {
  display: "block",
  color: "#00d4aa",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "8px",
  letterSpacing: "0.3px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "2px solid rgba(255, 255, 255, 0.2)",
  background: "rgba(255, 255, 255, 0.05)",
  color: "#ffffff",
  fontSize: "16px",
  outline: "none",
  transition: "all 0.3s ease",
  backdropFilter: "blur(10px)",
  boxSizing: "border-box",
};

const selectStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "2px solid rgba(255, 255, 255, 0.2)",
  background: "rgba(255, 255, 255, 0.05)",
  color: "#ffffff",
  fontSize: "16px",
  outline: "none",
  transition: "all 0.3s ease",
  backdropFilter: "blur(10px)",
  boxSizing: "border-box",
};

const buttonGroupStyle = {
  display: "flex",
  gap: "16px",
  marginTop: "32px",
};

const saveButtonStyle = {
  flex: 1,
  background: "linear-gradient(135deg, #00d4aa 0%, #4ecdc4 100%)",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  padding: "16px 24px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 8px 25px rgba(0, 212, 170, 0.3)",
  letterSpacing: "0.5px",
};

const cancelButtonStyle = {
  flex: 1,
  background: "rgba(255, 255, 255, 0.1)",
  color: "#ffffff",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "12px",
  padding: "16px 24px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backdropFilter: "blur(10px)",
};