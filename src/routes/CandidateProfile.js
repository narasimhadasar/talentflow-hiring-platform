import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CandidateProfile() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // Mock team members for @mentions
  const teamMembers = [
    { id: 1, name: "John Doe", email: "john@company.com", role: "Recruiter" },
    { id: 2, name: "Jane Smith", email: "jane@company.com", role: "Hiring Manager" },
    { id: 3, name: "Mike Johnson", email: "mike@company.com", role: "Tech Lead" },
    { id: 4, name: "Sarah Wilson", email: "sarah@company.com", role: "HR Manager" },
    { id: 5, name: "David Brown", email: "david@company.com", role: "Team Lead" }
  ];

  useEffect(() => {
    async function fetchCandidate() {
      try {
        console.log('Fetching candidate from:', `/api/candidates/${id}`);
        const res = await axios.get(`/api/candidates/${id}`);
        console.log('Candidate data:', res.data);
        setCandidate(res.data);
        setNotes(res.data.notes || []);
        setError(null);
      } catch (err) {
        console.error('Error loading candidate profile:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.message || 'Failed to load candidate profile');
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidate();
  }, [id]);

  const handleStartAssessment = async (jobId) => {
    try {
      console.log('Checking assessment for job:', jobId);
      const assessmentRes = await axios.get(`/api/assessments/${jobId}`);
      console.log('Assessment found:', assessmentRes.data);
      
      if (assessmentRes.data) {
        navigate(`/assessment/${jobId}/take`, { 
          state: { candidateId: id } 
        });
      }
    } catch (error) {
      console.error('Assessment check error:', error);
      if (error.response?.status === 404) {
        alert('No assessment available for this job yet.');
      } else {
        alert('Error loading assessment. Please try again.');
      }
    }
  };

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setNewNote(value);

    // Check for @mention
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const atSymbolIndex = textBeforeCursor.lastIndexOf('@');

    if (atSymbolIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atSymbolIndex + 1);
      const spaceIndex = textAfterAt.indexOf(' ');
      
      if (spaceIndex === -1) {
        const searchTerm = textAfterAt.toLowerCase();
        const filteredSuggestions = teamMembers.filter(member =>
          member.name.toLowerCase().includes(searchTerm) ||
          member.email.toLowerCase().includes(searchTerm)
        );
        setSuggestions(filteredSuggestions);
        setShowMentionSuggestions(true);
        setSuggestionIndex(0);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const handleMentionSelect = (member) => {
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = newNote.substring(0, cursorPosition);
    const atSymbolIndex = textBeforeCursor.lastIndexOf('@');
    
    const textBeforeAt = newNote.substring(0, atSymbolIndex);
    const textAfterCursor = newNote.substring(cursorPosition);
    
    const newText = `${textBeforeAt}@${member.name}${textAfterCursor}`;
    setNewNote(newText);
    setShowMentionSuggestions(false);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = textBeforeAt.length + member.name.length + 2; // +2 for @ and space
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showMentionSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (suggestions.length > 0) {
          handleMentionSelect(suggestions[suggestionIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowMentionSuggestions(false);
      }
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || isSubmittingNote) return;

    setIsSubmittingNote(true);
    try {
      const note = {
        id: Date.now().toString(),
        content: newNote,
        author: "Current User", // In real app, get from auth context
        timestamp: new Date().toISOString(),
        mentions: extractMentions(newNote)
      };

      // In a real app, you'd make an API call here
      // await axios.post(`/api/candidates/${id}/notes`, note);
      
      setNotes(prev => [note, ...prev]);
      setNewNote("");
      setShowMentionSuggestions(false);
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const extractMentions = (text) => {
    const mentionRegex = /@([\w\s]+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1];
      const member = teamMembers.find(m => m.name === mentionedName);
      if (member) {
        mentions.push(member);
      }
    }
    
    return mentions;
  };

  const formatNoteContent = (content) => {
    return content.split(/(@[\w\s]+)/g).map((part, index) => {
      if (part.startsWith('@')) {
        const memberName = part.substring(1);
        const member = teamMembers.find(m => m.name === memberName);
        return member ? (
          <span key={index} className="mention" style={{
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '500',
            margin: '0 2px'
          }}>
            @{member.name}
          </span>
        ) : part;
      }
      return part;
    });
  };

  const getAssessmentStatus = (job) => {
    const application = candidate.jobs?.find(j => j.id === job.id);
    return application?.assessmentStatus || 'not-started';
  };

  const getAssessmentButtonText = (status) => {
    switch (status) {
      case 'submitted': return 'Assessment Submitted';
      case 'in-progress': return 'Continue Assessment';
      default: return 'Start Assessment';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return { bg: '#d4edda', color: '#155724' };
      case 'in-progress': return { bg: '#fff3cd', color: '#856404' };
      default: return { bg: '#f8f9fa', color: '#6c757d' };
    }
  };

  if (loading) return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>Loading candidate profile...</p>
    </div>
  );
  
  if (error) return (
    <div style={{ padding: "20px" }}>
      <div style={{ 
        padding: "15px", 
        backgroundColor: "#f8d7da", 
        color: "#721c24",
        borderRadius: "4px",
        marginBottom: "20px"
      }}>
        <strong>Error:</strong> {error}
      </div>
      <button 
        onClick={() => navigate("/candidates")}
        style={{
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Back to Candidates
      </button>
    </div>
  );

  if (!candidate) return (
    <div style={{ padding: "20px" }}>
      <p>Candidate not found.</p>
      <button 
        onClick={() => navigate("/candidates")}
        style={{
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Back to Candidates
      </button>
    </div>
  );

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header with back button */}
      <div style={{ marginBottom: "30px" }}>
        <button 
          onClick={() => navigate("/candidates")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "20px"
          }}
        >
          ← Back to Candidates
        </button>
        <h2 style={{ color: "#333", marginBottom: "10px" }}>{candidate.name}</h2>
        <p style={{ color: "#666", fontSize: "16px" }}>
          <strong>Email:</strong> {candidate.email}
        </p>
        <p style={{ color: "#666", fontSize: "14px" }}>
          <strong>ID:</strong> {candidate.id}
        </p>
      </div>

      {/* Notes Section with @Mentions */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "20px", 
        backgroundColor: "#f9f9f9",
        borderRadius: "8px"
      }}>
        <h3 style={{ color: "#333", marginBottom: "15px" }}>Notes</h3>
        
        {/* Add Note Form */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <textarea
            ref={textareaRef}
            value={newNote}
            onChange={handleNoteChange}
            onKeyDown={handleKeyDown}
            placeholder="Add a note... Use @ to mention team members"
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              resize: "vertical",
              fontFamily: "inherit"
            }}
          />
          
          {/* Mention Suggestions */}
          {showMentionSuggestions && suggestions.length > 0 && (
            <div style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              right: 0,
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 1000,
              maxHeight: "200px",
              overflowY: "auto"
            }}>
              {suggestions.map((member, index) => (
                <div
                  key={member.id}
                  onClick={() => handleMentionSelect(member)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    backgroundColor: index === suggestionIndex ? "#f0f0f0" : "transparent",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "#007bff",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: "500" }}>{member.name}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={addNote}
            disabled={!newNote.trim() || isSubmittingNote}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: newNote.trim() ? "#007bff" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: newNote.trim() ? "pointer" : "not-allowed",
              fontSize: "14px"
            }}
          >
            {isSubmittingNote ? "Adding..." : "Add Note"}
          </button>
        </div>

        {/* Notes List */}
        <div>
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: "15px",
                  marginBottom: "15px",
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  position: "relative"
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start",
                  marginBottom: "8px"
                }}>
                  <strong style={{ color: "#333" }}>{note.author}</strong>
                  <span style={{ 
                    fontSize: "12px", 
                    color: "#666",
                    whiteSpace: "nowrap",
                    marginLeft: "10px"
                  }}>
                    {new Date(note.timestamp).toLocaleDateString()} at{" "}
                    {new Date(note.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ lineHeight: "1.5", color: "#333" }}>
                  {formatNoteContent(note.content)}
                </div>
                
                {/* Mentioned users */}
                {note.mentions && note.mentions.length > 0 && (
                  <div style={{ 
                    marginTop: "10px", 
                    paddingTop: "10px",
                    borderTop: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap"
                  }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>Mentioned:</span>
                    {note.mentions.map((member, index) => (
                      <span
                        key={member.id}
                        style={{
                          fontSize: "12px",
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}
                      >
                        @{member.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ 
              padding: "40px", 
              textAlign: "center",
              color: "#666",
              fontStyle: "italic",
              backgroundColor: "white",
              border: "1px dashed #ddd",
              borderRadius: "6px"
            }}>
              No notes yet. Add the first note using the form above.
            </div>
          )}
        </div>
      </div>

      {/* Jobs applied */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "20px", 
        backgroundColor: "#f9f9f9",
        borderRadius: "8px"
      }}>
        <h3 style={{ color: "#333", marginBottom: "15px" }}>Job Applications</h3>
        {candidate.jobs && candidate.jobs.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {candidate.jobs.map((job) => (
              <li key={job.id} style={{ 
                marginBottom: "15px", 
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "6px",
                border: "1px solid #e0e0e0"
              }}>
                <strong style={{ fontSize: "16px", color: "#333" }}>{job.title}</strong>
                <div style={{ marginTop: "8px", color: "#666" }}>
                  <span>Stage: {job.stage || "Unknown"}</span>
                  {job.applicationId && (
                    <span style={{ marginLeft: "15px" }}>
                      Application ID: {job.applicationId}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#666", fontStyle: "italic" }}>No job applications found.</p>
        )}
      </div>

      {/* Assigned Assessments */}
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#f9f9f9",
        borderRadius: "8px"
      }}>
        <h3 style={{ color: "#333", marginBottom: "20px" }}>Assigned Assessments</h3>
        
        {candidate.jobs && candidate.jobs.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {candidate.jobs.map((job) => {
              const assessmentStatus = getAssessmentStatus(job);
              const statusColors = getStatusColor(assessmentStatus);
              
              return (
                <li
                  key={job.id}
                  style={{
                    marginBottom: "20px",
                    border: "1px solid #ddd",
                    padding: "20px",
                    borderRadius: "8px",
                    backgroundColor: "white"
                  }}
                >
                  <div style={{ marginBottom: "15px" }}>
                    <strong style={{ fontSize: "18px", color: "#333" }}>{job.title}</strong>
                    <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
                      Job ID: {job.id}
                    </div>
                  </div>

                  <div style={{ marginTop: "10px" }}>
                    <p style={{ marginBottom: "15px" }}>
                      <strong>Assessment Status:</strong>{" "}
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: statusColors.bg,
                        color: statusColors.color,
                        fontWeight: "bold",
                        textTransform: "capitalize"
                      }}>
                        {assessmentStatus.replace('-', ' ')}
                      </span>
                    </p>

                    {assessmentStatus === 'submitted' ? (
                      <button 
                        disabled 
                        style={{ 
                          padding: "10px 20px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "not-allowed",
                          opacity: 0.6
                        }}
                      >
                        ✓ {getAssessmentButtonText(assessmentStatus)}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartAssessment(job.id)}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: assessmentStatus === "in-progress" ? "#ffc107" : "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold"
                        }}
                      >
                        {getAssessmentButtonText(assessmentStatus)}
                      </button>
                    )}
                  </div>

                  {assessmentStatus === 'submitted' && job.assessmentSubmission && (
                    <div style={{ 
                      marginTop: "15px", 
                      padding: "10px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}>
                      <strong>Submitted on:</strong> {new Date(job.assessmentSubmission.submittedAt).toLocaleDateString()}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p style={{ color: "#666", fontStyle: "italic" }}>No jobs found for this candidate.</p>
        )}
      </div>
    </div>
  );
}