import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./AssessmentBuilder.css";

export default function AssessmentBuilder() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState({});

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const res = await axios.get(`/api/assessments/${jobId}`);
        setAssessment(res.data);
      } catch {
        setAssessment({
          jobId,
          schema: { 
            title: "Untitled Assessment", 
            sections: [{ title: "Section 1", questions: [] }] 
          },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchAssessment();
  }, [jobId]);

  async function saveAssessment() {
    setSaving(true);
    try {
      if (assessment?.id) {
        await axios.put(`/api/assessments/${jobId}`, assessment);
      } else {
        await axios.post(`/api/assessments/${jobId}`, assessment);
      }
      // Show temporary save confirmation
      setTimeout(() => setSaving(false), 2000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaving(false);
    }
  }

  function updateAssessmentTitle(title) {
    setAssessment(prev => ({
      ...prev,
      schema: { ...prev.schema, title }
    }));
  }

  function updateSectionTitle(sectionIdx, title) {
    setAssessment(prev => {
      const sections = [...prev.schema.sections];
      sections[sectionIdx] = { ...sections[sectionIdx], title };
      return { ...prev, schema: { ...prev.schema, sections } };
    });
  }

  function addSection() {
    setAssessment(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: [
          ...prev.schema.sections,
          { title: `Section ${prev.schema.sections.length + 1}`, questions: [] },
        ],
      },
    }));
    setActiveSection(assessment.schema.sections.length);
  }

  function addQuestion(sectionIdx) {
    setAssessment(prev => {
      const sections = [...prev.schema.sections];
      sections[sectionIdx].questions.push({
        id: uuidv4(),
        type: "short-text",
        label: "Question",
        required: false,
        options: [],
      });
      return { ...prev, schema: { ...prev.schema, sections } };
    });
  }

  function addOption(sectionIdx, questionId) {
    setAssessment(prev => {
      const sections = [...prev.schema.sections];
      const section = sections[sectionIdx];
      const question = section.questions.find(q => q.id === questionId);
      
      if (question) {
        question.options = [...(question.options || []), {
          id: uuidv4(),
          label: `Option ${(question.options?.length || 0) + 1}`,
          value: `option${(question.options?.length || 0) + 1}`
        }];
      }
      
      return { ...prev, schema: { ...prev.schema, sections } };
    });
  }

  function removeOption(sectionIdx, questionId, optionId) {
    setAssessment(prev => {
      const sections = [...prev.schema.sections];
      const section = sections[sectionIdx];
      const question = section.questions.find(q => q.id === questionId);
      
      if (question && question.options) {
        question.options = question.options.filter(opt => opt.id !== optionId);
      }
      
      return { ...prev, schema: { ...prev.schema, sections } };
    });
  }

  function updateOptionLabel(sectionIdx, questionId, optionId, newLabel) {
    setAssessment(prev => {
      const sections = [...prev.schema.sections];
      const section = sections[sectionIdx];
      const question = section.questions.find(q => q.id === questionId);
      
      if (question && question.options) {
        question.options = question.options.map(opt =>
          opt.id === optionId ? { ...opt, label: newLabel } : opt
        );
      }
      
      return { ...prev, schema: { ...prev.schema, sections } };
    });
  }

  function isMCQType(type) {
    return type === "single-choice" || type === "multi-choice";
  }

  function moveQuestion(sectionIdx, questionIdx, direction) {
    if (questionIdx === 0 && direction === -1) return;
    if (questionIdx === assessment.schema.sections[sectionIdx].questions.length - 1 && direction === 1) return;
    
    setAssessment(prev => {
      const sections = [...prev.schema.sections];
      const questions = [...sections[sectionIdx].questions];
      const [movedQuestion] = questions.splice(questionIdx, 1);
      questions.splice(questionIdx + direction, 0, movedQuestion);
      sections[sectionIdx] = { ...sections[sectionIdx], questions };
      return { ...prev, schema: { ...prev.schema, sections } };
    });
  }

  function deleteQuestion(sectionIdx, questionId) {
    setAssessment(prev => {
      const sections = [...prev.schema.sections];
      sections[sectionIdx].questions = sections[sectionIdx].questions.filter(q => q.id !== questionId);
      return { ...prev, schema: { ...prev.schema, sections } };
    });
  }

  if (loading) return <div className="docs-loading">Loading assessment...</div>;

  return (
    <div className="docs-container">
      {/* Header Toolbar */}
      <header className="docs-header">
        <div className="docs-toolbar">
          <button className="docs-btn" onClick={() => navigate('/assessments')}>
            Back to Assessments
          </button>
          <button className="docs-btn docs-btn-primary" onClick={saveAssessment}>
            {saving ? "Saving..." : "Save"}
          </button>
          <div className="docs-title">
            <input
              className="docs-title-input"
              value={assessment?.schema.title || ""}
              onChange={(e) => updateAssessmentTitle(e.target.value)}
              placeholder="Assessment Title"
            />
          </div>
          <div className="docs-toolbar-actions">
            <button 
              className={`docs-btn ${showPreview ? 'docs-btn-primary' : ''}`}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Live Preview'}
            </button>
            <button className="docs-btn" onClick={addSection}>
              Add Section
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="docs-content">
        {/* Sidebar - Section Navigation */}
        <nav className="docs-sidebar">
          <div className="docs-sidebar-content">
            <h3>Sections</h3>
            <ul className="docs-section-nav">
              {assessment?.schema.sections.map((section, idx) => (
                <li 
                  key={idx}
                  className={`docs-nav-item ${activeSection === idx ? 'active' : ''}`}
                  onClick={() => setActiveSection(idx)}
                >
                  {section.title}
                </li>
              ))}
            </ul>
            <button className="docs-btn docs-btn-outline" onClick={addSection}>
              + New Section
            </button>
          </div>
        </nav>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="docs-preview-panel">
            <div className="docs-preview-header">
              <h3>Live Preview</h3>
              <button 
                className="docs-btn docs-btn-sm"
                onClick={() => setPreviewAnswers({})}
              >
                Clear Answers
              </button>
            </div>
            <div className="docs-preview-content">
              <AssessmentPreview 
                assessment={assessment}
                answers={previewAnswers}
                onAnswerChange={setPreviewAnswers}
              />
            </div>
          </div>
        )}

        {/* Main Editor */}
        <main className="docs-editor">
          {assessment?.schema.sections.map((section, sectionIdx) => (
            <div 
              key={sectionIdx}
              className={`docs-section ${activeSection === sectionIdx ? 'active' : 'hidden'}`}
            >
              {/* Section Header */}
              <div className="docs-section-header">
                <input
                  className="docs-section-title"
                  value={section.title}
                  onChange={(e) => updateSectionTitle(sectionIdx, e.target.value)}
                  placeholder="Section Title"
                />
                <div className="docs-section-actions">
                  <button 
                    className="docs-btn docs-btn-sm"
                    onClick={() => addQuestion(sectionIdx)}
                  >
                    + Add Question
                  </button>
                </div>
              </div>

              {/* Questions */}
              <div className="docs-questions">
                {section.questions.map((question, questionIdx) => (
                  <div key={question.id} className="docs-question">
                    <div className="docs-question-header">
                      <div className="docs-question-controls">
                        <button 
                          className="docs-icon-btn"
                          onClick={() => moveQuestion(sectionIdx, questionIdx, -1)}
                          disabled={questionIdx === 0}
                        >
                          ↑
                        </button>
                        <button 
                          className="docs-icon-btn"
                          onClick={() => moveQuestion(sectionIdx, questionIdx, 1)}
                          disabled={questionIdx === section.questions.length - 1}
                        >
                          ↓
                        </button>
                        <button 
                          className="docs-icon-btn docs-icon-btn-danger"
                          onClick={() => deleteQuestion(sectionIdx, question.id)}
                        >
                          Delete
                        </button>
                      </div>
                      <span className="docs-question-number">Q{questionIdx + 1}</span>
                    </div>

                    <div className="docs-question-content">
                      <div className="docs-question-main">
                        <input
                          className="docs-question-label"
                          value={question.label}
                          onChange={(e) => {
                            const newLabel = e.target.value;
                            setAssessment(prev => {
                              const sections = [...prev.schema.sections];
                              sections[sectionIdx].questions = sections[sectionIdx].questions.map((q) =>
                                q.id === question.id ? { ...q, label: newLabel } : q
                              );
                              return { ...prev, schema: { ...prev.schema, sections } };
                            });
                          }}
                          placeholder="Question text"
                        />
                        
                        <div className="docs-question-settings">
                          <select
                            className="docs-question-type"
                            value={question.type}
                            onChange={(e) => {
                              const newType = e.target.value;
                              setAssessment(prev => {
                                const sections = [...prev.schema.sections];
                                sections[sectionIdx].questions = sections[sectionIdx].questions.map((q) =>
                                  q.id === question.id ? { 
                                    ...q, 
                                    type: newType,
                                    options: isMCQType(newType) ? (q.options || []) : q.options
                                  } : q
                                );
                                return { ...prev, schema: { ...prev.schema, sections } };
                              });
                            }}
                          >
                            <option value="short-text">Short Text</option>
                            <option value="long-text">Long Text</option>
                            <option value="single-choice">Single Choice</option>
                            <option value="multi-choice">Multiple Choice</option>
                            <option value="numeric">Numeric</option>
                            <option value="file-upload">File Upload</option>
                          </select>

                          <label className="docs-required-checkbox">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setAssessment(prev => {
                                  const sections = [...prev.schema.sections];
                                  sections[sectionIdx].questions = sections[sectionIdx].questions.map((q) =>
                                    q.id === question.id ? { ...q, required: checked } : q
                                  );
                                  return { ...prev, schema: { ...prev.schema, sections } };
                                });
                              }}
                            />
                            Required
                          </label>
                          
                          {/* Conditional Logic */}
                          <div className="docs-conditional-logic">
                            <label className="docs-conditional-checkbox">
                              <input
                                type="checkbox"
                                checked={!!question.conditional}
                                onChange={(e) => {
                                  const hasConditional = e.target.checked;
                                  setAssessment(prev => {
                                    const sections = [...prev.schema.sections];
                                    sections[sectionIdx].questions = sections[sectionIdx].questions.map((q) =>
                                      q.id === question.id ? { 
                                        ...q, 
                                        conditional: hasConditional ? { dependsOn: '', value: '' } : undefined 
                                      } : q
                                    );
                                    return { ...prev, schema: { ...prev.schema, sections } };
                                  });
                                }}
                              />
                              Conditional
                            </label>
                            
                            {question.conditional && (
                              <div className="docs-conditional-settings">
                                <select
                                  value={question.conditional.dependsOn || ''}
                                  onChange={(e) => {
                                    const dependsOn = e.target.value;
                                    setAssessment(prev => {
                                      const sections = [...prev.schema.sections];
                                      sections[sectionIdx].questions = sections[sectionIdx].questions.map((q) =>
                                        q.id === question.id ? { 
                                          ...q, 
                                          conditional: { ...q.conditional, dependsOn } 
                                        } : q
                                      );
                                      return { ...prev, schema: { ...prev.schema, sections } };
                                    });
                                  }}
                                >
                                  <option value="">Select question</option>
                                  {section.questions
                                    .filter(q => q.id !== question.id)
                                    .map(q => (
                                      <option key={q.id} value={q.id}>{q.label}</option>
                                    ))
                                  }
                                </select>
                                <input
                                  type="text"
                                  placeholder="Expected value"
                                  value={question.conditional.value || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setAssessment(prev => {
                                      const sections = [...prev.schema.sections];
                                      sections[sectionIdx].questions = sections[sectionIdx].questions.map((q) =>
                                        q.id === question.id ? { 
                                          ...q, 
                                          conditional: { ...q.conditional, value } 
                                        } : q
                                      );
                                      return { ...prev, schema: { ...prev.schema, sections } };
                                    });
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Options for MCQ types */}
                      {isMCQType(question.type) && (
                        <div className="docs-options">
                          <div className="docs-options-header">
                            <span>Options</span>
                            <button 
                              className="docs-btn docs-btn-sm"
                              onClick={() => addOption(sectionIdx, question.id)}
                            >
                              + Add Option
                            </button>
                          </div>
                          
                          {question.options?.map((option, optionIdx) => (
                            <div key={option.id} className="docs-option">
                              <input
                                className="docs-option-input"
                                value={option.label}
                                onChange={(e) => updateOptionLabel(sectionIdx, question.id, option.id, e.target.value)}
                                placeholder={`Option ${optionIdx + 1}`}
                              />
                              <button 
                                className="docs-icon-btn docs-icon-btn-danger"
                                onClick={() => removeOption(sectionIdx, question.id, option.id)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          
                          {(!question.options || question.options.length === 0) && (
                            <div className="docs-options-empty">
                              No options added yet. Click "Add Option" to create choices.
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Validation Rules */}
                      {(question.type === 'short-text' || question.type === 'long-text') && (
                        <div className="docs-validation">
                          <label>Max Length:</label>
                          <input
                            type="number"
                            value={question.maxLength || ''}
                            onChange={(e) => {
                              const maxLength = parseInt(e.target.value) || undefined;
                              setAssessment(prev => {
                                const sections = [...prev.schema.sections];
                                sections[sectionIdx].questions = sections[sectionIdx].questions.map((q) =>
                                  q.id === question.id ? { ...q, maxLength } : q
                                );
                                return { ...prev, schema: { ...prev.schema, sections } };
                              });
                            }}
                            placeholder="e.g., 500"
                          />
                        </div>
                      )}
                      
                      {question.type === 'numeric' && (
                        <div className="docs-validation">
                          <label>Min:</label>
                          <input
                            type="number"
                            value={question.min || ''}
                            onChange={(e) => {
                              const min = parseInt(e.target.value) || undefined;
                              setAssessment(prev => {
                                const sections = [...prev.schema.sections];
                                sections[sectionIdx].questions = sections[sectionIdx].questions.map((q) =>
                                  q.id === question.id ? { ...q, min } : q
                                );
                                return { ...prev, schema: { ...prev.schema, sections } };
                              });
                            }}
                          />
                          <label>Max:</label>
                          <input
                            type="number"
                            value={question.max || ''}
                            onChange={(e) => {
                              const max = parseInt(e.target.value) || undefined;
                              setAssessment(prev => {
                                const sections = [...prev.schema.sections];
                                sections[sectionIdx].questions = sections[sectionIdx].questions.map((q) =>
                                  q.id === question.id ? { ...q, max } : q
                                );
                                return { ...prev, schema: { ...prev.schema, sections } };
                              });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {section.questions.length === 0 && (
                  <div className="docs-empty-state">
                    <p>No questions in this section yet.</p>
                    <button 
                      className="docs-btn docs-btn-primary"
                      onClick={() => addQuestion(sectionIdx)}
                    >
                      Add your first question
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

// Live Preview Component
function AssessmentPreview({ assessment, answers, onAnswerChange }) {
  if (!assessment?.schema) {
    return <div className="docs-preview-empty">No assessment to preview</div>;
  }

  const handleAnswerChange = (questionId, value) => {
    onAnswerChange(prev => ({ ...prev, [questionId]: value }));
  };

  const shouldShowQuestion = (question, sectionQuestions) => {
    if (!question.conditional) return true;
    
    const dependentQuestion = sectionQuestions.find(q => q.id === question.conditional.dependsOn);
    if (!dependentQuestion) return true;
    
    const dependentAnswer = answers[question.conditional.dependsOn];
    return dependentAnswer === question.conditional.value;
  };

  return (
    <div className="assessment-preview">
      <h2>{assessment.schema.title}</h2>
      
      {assessment.schema.sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="preview-section">
          <h3>{section.title}</h3>
          
          {section.questions.map((question) => {
            if (!shouldShowQuestion(question, section.questions)) {
              return null;
            }
            
            return (
              <div key={question.id} className="preview-question">
                <label className="preview-question-label">
                  {question.label}
                  {question.required && <span className="required">*</span>}
                </label>
                
                <div className="preview-question-input">
                  {question.type === 'short-text' && (
                    <input
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      maxLength={question.maxLength}
                      placeholder="Your answer..."
                    />
                  )}
                  
                  {question.type === 'long-text' && (
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      maxLength={question.maxLength}
                      placeholder="Your answer..."
                      rows={4}
                    />
                  )}
                  
                  {question.type === 'numeric' && (
                    <input
                      type="number"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      min={question.min}
                      max={question.max}
                      placeholder="Enter number..."
                    />
                  )}
                  
                  {question.type === 'single-choice' && question.options && (
                    <div className="preview-options">
                      {question.options.map((option, idx) => (
                        <label key={idx} className="preview-option">
                          <input
                            type="radio"
                            name={question.id}
                            value={option.label}
                            checked={answers[question.id] === option.label}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'multi-choice' && question.options && (
                    <div className="preview-options">
                      {question.options.map((option, idx) => {
                        const currentAnswers = answers[question.id] || [];
                        return (
                          <label key={idx} className="preview-option">
                            <input
                              type="checkbox"
                              checked={currentAnswers.includes(option.label)}
                              onChange={(e) => {
                                const newAnswers = e.target.checked
                                  ? [...currentAnswers, option.label]
                                  : currentAnswers.filter(a => a !== option.label);
                                handleAnswerChange(question.id, newAnswers);
                              }}
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  )}
                  
                  {question.type === 'file-upload' && (
                    <div className="preview-file-upload">
                      <input
                        type="file"
                        onChange={(e) => {
                          const fileName = e.target.files?.[0]?.name || '';
                          handleAnswerChange(question.id, fileName);
                        }}
                      />
                      {answers[question.id] && (
                        <div className="file-selected">Selected: {answers[question.id]}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}