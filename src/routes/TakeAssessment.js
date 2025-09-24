import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function TakeAssessmentPage() {
  const { jobId } = useParams();
  const location = useLocation();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Get candidateId from navigation state or fallback
  const candidateId = location.state?.candidateId || "demo-candidate";

  useEffect(() => {
    async function fetchAssessment() {
      try {
        console.log('Fetching assessment for job:', jobId);
        const res = await axios.get(`/api/assessments/${jobId}`);
        console.log('Assessment data:', res.data);
        
        // Handle both direct schema and nested schema structure
        const assessmentData = res.data;
        if (assessmentData.schema) {
          setAssessment(assessmentData);
        } else if (assessmentData.assessmentSchema) {
          // If schema is nested under assessmentSchema
          setAssessment({
            ...assessmentData,
            schema: assessmentData.assessmentSchema
          });
        } else {
          // If no schema found, create a default one
          setAssessment({
            id: assessmentData.id,
            jobId: assessmentData.jobId,
            schema: {
              title: "Assessment",
              sections: []
            }
          });
        }
      } catch (err) {
        console.error("Error loading assessment:", err);
        // Create a fallback assessment if none exists
        setAssessment({
          id: `temp-${jobId}`,
          jobId,
          schema: {
            title: "Assessment",
            sections: []
          }
        });
      } finally {
        setLoading(false);
      }
    }
    fetchAssessment();
  }, [jobId]);

  const handleChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const shouldShowQuestion = (question, sectionQuestions) => {
    if (!question.conditional) return true;
    
    const dependentQuestion = sectionQuestions.find(q => q.id === question.conditional.dependsOn);
    if (!dependentQuestion) return true;
    
    const dependentAnswer = answers[question.conditional.dependsOn];
    return dependentAnswer === question.conditional.value;
  };

  const validateAnswers = () => {
    const errors = [];
    
    assessment.schema.sections.forEach((section, sectionIdx) => {
      section.questions.forEach((question) => {
        if (!shouldShowQuestion(question, section.questions)) return;
        
        const answer = answers[question.id];
        
        if (question.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
          errors.push(`${question.label} is required`);
        }
        
        if (question.type === 'numeric' && answer) {
          const numValue = parseFloat(answer);
          if (question.min !== undefined && numValue < question.min) {
            errors.push(`${question.label} must be at least ${question.min}`);
          }
          if (question.max !== undefined && numValue > question.max) {
            errors.push(`${question.label} must be at most ${question.max}`);
          }
        }
        
        if ((question.type === 'short-text' || question.type === 'long-text') && answer && question.maxLength) {
          if (answer.length > question.maxLength) {
            errors.push(`${question.label} must be ${question.maxLength} characters or less`);
          }
        }
      });
    });
    
    return errors;
  };

  async function submitAssessment() {
    if (submitting) return;
    
    // Validate answers before submission
    const validationErrors = validateAnswers();
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    setSubmitting(true);
    try {
      console.log('Submitting assessment:', { candidateId, jobId, answers });
      
      await axios.post(`/api/assessments/${jobId}/submit`, {
        candidateId: candidateId,
        responses: answers
      });
      
      alert("Assessment submitted successfully!");
      navigate(`/candidates/${candidateId}`);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>Loading assessment...</p>
    </div>
  );

  if (!assessment) return (
    <div style={{ padding: "20px" }}>
      <p>No assessment found for this job.</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ 
          marginBottom: "20px",
          padding: "8px 16px",
          backgroundColor: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        ← Back
      </button>
      
      <h2 style={{ marginBottom: "30px", color: "#333" }}>
        {assessment.schema?.title || "Assessment"}
      </h2>
      
      {assessment.schema?.sections?.length > 0 ? (
        assessment.schema.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: "40px" }}>
            <h3 style={{ 
              padding: "10px", 
              backgroundColor: "#f8f9fa", 
              borderRadius: "4px",
              marginBottom: "20px"
            }}>
              {section.title}
            </h3>
            
            {section.questions?.length > 0 ? (
              section.questions.map((q) => {
                // Check if question should be shown based on conditional logic
                if (!shouldShowQuestion(q, section.questions)) {
                  return null;
                }
                
                return (
                  <div key={q.id} style={{ 
                    marginBottom: "25px", 
                    padding: "20px", 
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    backgroundColor: "white"
                  }}>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "12px", 
                    fontWeight: "bold",
                    fontSize: "16px"
                  }}>
                    {q.label} {q.required && "*"}
                  </label>
                  
                  {q.type === "short-text" && (
                    <input 
                      type="text" 
                      style={{ 
                        width: "100%", 
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "16px"
                      }}
                      onChange={(e) => handleChange(q.id, e.target.value)} 
                    />
                  )}
                  
                  {q.type === "long-text" && (
                    <textarea 
                      style={{ 
                        width: "100%", 
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        minHeight: "120px",
                        fontSize: "16px"
                      }}
                      onChange={(e) => handleChange(q.id, e.target.value)} 
                    />
                  )}
                  
                  {q.type === "numeric" && (
                    <div>
                      <input 
                        type="number" 
                        min={q.min} 
                        max={q.max} 
                        style={{ 
                          width: "100%", 
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "16px"
                        }}
                        onChange={(e) => handleChange(q.id, e.target.value)} 
                      />
                      {(q.min !== undefined || q.max !== undefined) && (
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                          {q.min !== undefined && q.max !== undefined 
                            ? `Range: ${q.min} - ${q.max}`
                            : q.min !== undefined 
                            ? `Minimum: ${q.min}`
                            : `Maximum: ${q.max}`
                          }
                        </div>
                      )}
                    </div>
                  )}
                  
                  {(q.type === "single-choice" || q.type === "multi-choice") && (
                    <div style={{ marginTop: "10px" }}>
                      {q.options?.map((opt, optIndex) => {
                        const optionValue = typeof opt === 'string' ? opt : opt.label;
                        return (
                          <div key={optIndex} style={{ margin: "8px 0" }}>
                            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                              <input
                                type={q.type === "single-choice" ? "radio" : "checkbox"}
                                name={q.id}
                                value={optionValue}
                                checked={q.type === "single-choice" 
                                  ? answers[q.id] === optionValue
                                  : (answers[q.id] || []).includes(optionValue)
                                }
                                onChange={(e) => {
                                  if (q.type === "single-choice") {
                                    handleChange(q.id, e.target.value);
                                  } else {
                                    const currentAnswers = answers[q.id] || [];
                                    const updatedAnswers = e.target.checked
                                      ? [...currentAnswers, optionValue]
                                      : currentAnswers.filter(item => item !== optionValue);
                                    handleChange(q.id, updatedAnswers);
                                  }
                                }}
                                style={{ marginRight: "10px" }}
                              />
                              <span>{optionValue}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {q.type === "file-upload" && (
                    <div>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // In a real app, you'd upload the file to a server
                            // For now, just store the filename
                            handleChange(q.id, file.name);
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "16px"
                        }}
                      />
                      {answers[q.id] && (
                        <div style={{ 
                          marginTop: "8px", 
                          fontSize: "14px", 
                          color: "#666",
                          fontStyle: "italic"
                        }}>
                          Selected file: {answers[q.id]}
                        </div>
                      )}
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#999", 
                        marginTop: "4px"
                      }}>
                        Note: This is a file upload stub. In a real application, files would be uploaded to a server.
                      </div>
                    </div>
                  )}
                </div>
                );
              })
            ) : (
              <p style={{ color: "#666", fontStyle: "italic" }}>No questions in this section.</p>
            )}
          </div>
        ))
      ) : (
        <div style={{ 
          padding: "40px", 
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px"
        }}>
          <p style={{ color: "#666", fontSize: "18px" }}>
            No assessment questions available yet.
          </p>
        </div>
      )}
      
      <button 
        onClick={submitAssessment}
        disabled={submitting}
        style={{
          padding: "12px 30px",
          backgroundColor: submitting ? "#6c757d" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: submitting ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          marginTop: "20px"
        }}
      >
        {submitting ? "Submitting..." : "Submit Assessment"}
      </button>
    </div>
  );
}