import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CandidateAssessmentPage() {
  const { candidateId, jobId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const res = await axios.get(`/api/assessments/${jobId}`);
        setAssessment(res.data);
      } catch (err) {
        console.error("Failed to load assessment", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssessment();
  }, [jobId]);

  function updateResponse(qId, value) {
    setResponses((prev) => ({ ...prev, [qId]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post(`/api/assessments/${jobId}/submit`, {
        candidateId,
        responses,
      });
      alert("Assessment submitted successfully!");
      navigate(`/candidates/${candidateId}`);
    } catch (err) {
      console.error("Submission failed", err);
      alert("Failed to submit assessment.");
    }
  }

  if (loading) return <p>Loading assessment...</p>;
  if (!assessment) return <p>No assessment found for this job.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{assessment.schema.title}</h2>
      <form onSubmit={handleSubmit}>
        {assessment.schema.sections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: "20px" }}>
            <h3>{section.title}</h3>
            {section.questions.map((q) => (
              <div key={q.id} style={{ marginBottom: "12px" }}>
                <label>
                  {q.label}
                  {q.required && " *"}
                </label>
                <div style={{ marginTop: "6px" }}>
                  {q.type === "short-text" && (
                    <input
                      type="text"
                      value={responses[q.id] || ""}
                      onChange={(e) => updateResponse(q.id, e.target.value)}
                      maxLength={q.maxLength || 200}
                      required={q.required}
                    />
                  )}

                  {q.type === "long-text" && (
                    <textarea
                      value={responses[q.id] || ""}
                      onChange={(e) => updateResponse(q.id, e.target.value)}
                      maxLength={q.maxLength || 1000}
                      required={q.required}
                    />
                  )}

                  {q.type === "numeric" && (
                    <input
                      type="number"
                      value={responses[q.id] || ""}
                      onChange={(e) => updateResponse(q.id, e.target.value)}
                      min={q.min || 0}
                      max={q.max || 100}
                      required={q.required}
                    />
                  )}

                  {q.type === "single-choice" &&
                    q.options?.map((opt) => (
                      <label key={opt} style={{ marginLeft: "8px" }}>
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={responses[q.id] === opt}
                          onChange={() => updateResponse(q.id, opt)}
                          required={q.required}
                        />
                        {opt}
                      </label>
                    ))}

                  {q.type === "multi-choice" &&
                    q.options?.map((opt) => (
                      <label key={opt} style={{ marginLeft: "8px" }}>
                        <input
                          type="checkbox"
                          checked={responses[q.id]?.includes(opt) || false}
                          onChange={(e) => {
                            const selected = responses[q.id] || [];
                            if (e.target.checked) {
                              updateResponse(q.id, [...selected, opt]);
                            } else {
                              updateResponse(
                                q.id,
                                selected.filter((o) => o !== opt)
                              );
                            }
                          }}
                        />
                        {opt}
                      </label>
                    ))}

                  {q.type === "file-upload" && (
                    <input
                      type="file"
                      onChange={(e) =>
                        updateResponse(q.id, e.target.files?.[0]?.name || "")
                      }
                      required={q.required}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        <button type="submit">Submit Assessment</button>
      </form>
    </div>
  );
}
