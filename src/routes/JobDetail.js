import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";


export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tab, setTab] = useState("overview");
  const [assessments, setAssessments] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchJob();
    fetchAssessments();
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function fetchJob() {
    try {
      const res = await axios.get(`/api/jobs/${jobId}`);
      setJob(res.data);
    } catch (err) {
      console.error('Failed to fetch job:', err);
      if (err.response?.status === 404) {
        setError(`Job not found (ID: ${jobId}). The job may have been deleted or the link is invalid.`);
      } else {
        setError("Failed to load job. Please try again.");
      }
    }
    setLoading(false);
  }

  async function fetchAssessments() {
    try {
      const res = await axios.get(`/api/assessments/${jobId}`);
      setAssessments(res.data ? [res.data] : []);
    } catch (err) {
      console.error("Failed to fetch assessments", err);
    }
  }

  async function fetchCandidates() {
    try {
      const res = await axios.get(`/api/jobs/${jobId}`);
      setCandidates(res.data.candidates || []);
    } catch (err) {
      console.error("Failed to fetch candidates for job", err);
    }
  }

  async function assignAssessment(assessmentId, applicationId) {
    setAssigning(true);
    try {
      await axios.post(`/api/jobs/${jobId}/assessments/${assessmentId}/assign`, {
        applicationId,
      });
      alert("Assessment assigned successfully!");
    } catch (err) {
      console.error("Failed to assign assessment", err);
      alert("Failed to assign assessment");
    }
    setAssigning(false);
  }

  if (loading) return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Loading job details...</p>
    </div>
  );
  
  if (error) return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
      <button 
        onClick={() => window.history.back()} 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#1976d2', 
          color: 'white', 
          border: 'none', 
          borderRadius: '6px', 
          cursor: 'pointer' 
        }}
      >
        Go Back
      </button>
    </div>
  );

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Jobs', path: '/jobs' },
    { label: job?.title || 'Job Details' }
  ];

  const quickActions = [
    { label: 'Back to Jobs', onClick: () => navigate('/jobs'), description: 'Return to jobs list' },
    { label: 'Edit Job', onClick: () => setShowEditModal(true), description: 'Modify job details' },
    { label: 'View Applications', onClick: () => navigate('/candidates'), description: 'See all applications' },
    { label: 'Create Assessment', onClick: () => navigate(`/assessments/${jobId}`), description: 'Build assessment' }
  ];

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={unifiedHeaderStyle}>
          <div style={breadcrumbSectionStyle}>
            <div style={breadcrumbRowStyle}>
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span style={separatorStyle}>›</span>}
                  <button
                    style={{
                      ...breadcrumbItemStyle,
                      ...(index === breadcrumbItems.length - 1 ? activeBreadcrumbStyle : {})
                    }}
                    onClick={() => item.path && navigate(item.path)}
                    disabled={!item.path}
                  >
                    {item.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <div style={quickActionsRowStyle}>
              <span style={quickActionsLabelStyle}>Quick Actions:</span>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  style={quickActionButtonStyle}
                  title={action.description}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={containerStyle}>
        {/* Header Section */}
        <div style={headerStyle}>
          <div style={titleSectionStyle}>
            <h1 style={jobTitleStyle}>{job?.title}</h1>
            <div style={metaInfoStyle}>
              <span style={statusBadgeStyle(job?.status)}>
                {job?.status?.charAt(0).toUpperCase() + job?.status?.slice(1)}
              </span>
              <span style={metaItemStyle}>Remote</span>
              <span style={metaItemStyle}>Competitive Salary</span>
              <span style={metaItemStyle}>Full-time</span>
            </div>
          </div>
          <div style={actionButtonsStyle}>
            <button style={primaryButtonStyle} onClick={() => alert('Apply functionality coming soon!')}>
              Apply Now
            </button>
            <button style={secondaryButtonStyle} onClick={() => alert('Share functionality coming soon!')}>
              Share Job
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={tabNavStyle}>
          <button 
            style={tabButtonStyle(tab === 'overview')} 
            onClick={() => setTab('overview')}
          >
            Overview
          </button>
          <button 
            style={tabButtonStyle(tab === 'candidates')} 
            onClick={() => setTab('candidates')}
          >
            Candidates ({job?.candidates?.length || 0})
          </button>
          <button 
            style={tabButtonStyle(tab === 'assessments')} 
            onClick={() => setTab('assessments')}
          >
            Assessments ({assessments.length})
          </button>
        </div>

        {/* Tab Content */}
        <div style={tabContentStyle}>
          {tab === 'overview' && (
            <div style={overviewStyle}>
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Job Description</h3>
                <div style={descriptionStyle}>
                  <p>We are looking for a talented professional to join our dynamic team. This role offers exciting opportunities to work on cutting-edge projects and make a significant impact.</p>
                  
                  <h4>Key Responsibilities:</h4>
                  <ul style={listStyle}>
                    <li>Lead and execute strategic initiatives</li>
                    <li>Collaborate with cross-functional teams</li>
                    <li>Drive innovation and process improvements</li>
                    <li>Mentor junior team members</li>
                  </ul>

                  <h4>Requirements:</h4>
                  <ul style={listStyle}>
                    <li>Bachelor's degree in relevant field</li>
                    <li>3+ years of professional experience</li>
                    <li>Strong analytical and problem-solving skills</li>
                    <li>Excellent communication abilities</li>
                  </ul>

                  <h4>What We Offer:</h4>
                  <ul style={listStyle}>
                    <li>Competitive salary and benefits</li>
                    <li>Flexible work arrangements</li>
                    <li>Professional development opportunities</li>
                    <li>Collaborative and inclusive culture</li>
                  </ul>
                </div>
              </div>

              <div style={sidebarStyle}>
                <div style={infoCardStyle}>
                  <h4 style={cardTitleStyle}>Job Information</h4>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Department:</span>
                    <span>Engineering</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Location:</span>
                    <span>Remote / San Francisco</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Employment Type:</span>
                    <span>Full-time</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Experience Level:</span>
                    <span>Mid-Senior</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Posted:</span>
                    <span>2 days ago</span>
                  </div>
                </div>

                <div style={infoCardStyle}>
                  <h4 style={cardTitleStyle}>Skills & Tags</h4>
                  <div style={tagsContainerStyle}>
                    {job?.tags?.map((tag, index) => (
                      <span key={index} style={tagStyle}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'candidates' && (
            <div style={candidatesTabStyle}>
              <div style={candidatesHeaderStyle}>
                <h3 style={sectionTitleStyle}>Applications ({job?.candidates?.length || 0})</h3>
                <button style={primaryButtonStyle} onClick={() => navigate('/candidates')}>
                  View All Applications
                </button>
              </div>
              
              {job?.candidates?.length > 0 ? (
                <div style={candidatesGridStyle}>
                  {job.candidates.map((candidate) => (
                    <div 
                      key={candidate.id} 
                      style={candidateCardStyle}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px)';
                        e.target.style.boxShadow = '0 12px 30px rgba(0, 212, 170, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <div style={candidateHeaderStyle}>
                        <div style={candidateAvatarStyle}>
                          {candidate.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={candidateNameStyle}>{candidate.name}</h4>
                          <p style={candidateEmailStyle}>{candidate.email}</p>
                        </div>
                      </div>
                      <div style={candidateStageStyle}>
                        <div style={candidateMetaStyle}>
                          <span style={candidateMetaItemStyle}>Applied 2 days ago</span>
                        </div>
                        <span style={stageBadgeStyle(candidate.stage)}>
                          {candidate.stage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={emptyStateStyle}>
                  <h3>No Applications Yet</h3>
                  <p>This job hasn't received any applications yet.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'assessments' && (
            <div style={assessmentsTabStyle}>
              <div style={assessmentsHeaderStyle}>
                <h3 style={sectionTitleStyle}>Assessments ({assessments.length})</h3>
                <button style={primaryButtonStyle} onClick={() => navigate(`/assessments/${jobId}`)}>
                  Create Assessment
                </button>
              </div>
              
              {assessments.length > 0 ? (
                <div style={assessmentsListStyle}>
                  {assessments.map((assessment) => (
                    <div key={assessment.id} style={assessmentCardStyle}>
                      <div style={assessmentHeaderStyle}>
                        <h4 style={assessmentTitleStyle}>{assessment.schema.title}</h4>
                        <span style={questionCountStyle}>
                          {assessment.schema.sections.reduce((sum, sec) => sum + sec.questions.length, 0)} questions
                        </span>
                      </div>
                      <p style={assessmentDescStyle}>{assessment.schema.description}</p>
                      <div style={assessmentActionsStyle}>
                        <button 
                          style={secondaryButtonStyle}
                          onClick={() => navigate(`/assessments/${jobId}`)}
                        >
                          Edit Assessment
                        </button>
                        <select style={assignSelectStyle} disabled={assigning}>
                          <option value="">Assign to candidate...</option>
                          {candidates.map((c) => (
                            <option key={c.applicationId} value={c.applicationId}>
                              {c.name} ({c.stage})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={emptyStateStyle}>
                  <h3>No Assessments Created</h3>
                  <p>Create assessments to evaluate candidates for this position.</p>
                  <button style={primaryButtonStyle} onClick={() => navigate(`/assessments/${jobId}`)}>
                    Create First Assessment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
      
      {showEditModal && (
        <EditJobModal job={job} onClose={() => setShowEditModal(false)} onSave={(updatedJob) => {
          setJob(updatedJob);
          setShowEditModal(false);
        }} />
      )}
    </div>
  );
}

function EditJobModal({ job, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    status: job?.status || 'active',
    tags: job?.tags?.join(', ') || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedJob = {
        ...job,
        title: formData.title,
        status: formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await axios.put(`/api/jobs/${job.id}`, updatedJob);
      onSave(updatedJob);
    } catch (error) {
      console.error('Failed to update job:', error);
      alert('Failed to update job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.8rem', fontWeight: '700' }}>Edit Job</h2>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Job Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={inputStyle}
              required
            />
          </div>
          
          <div style={fieldStyle}>
            <label style={labelStyle}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              style={inputStyle}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div style={fieldStyle}>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              style={inputStyle}
              placeholder="e.g. React, JavaScript, Remote"
            />
          </div>
          
          <div style={buttonGroupStyle}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={saveButtonStyle}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(5px)'
};

const modalContentStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '20px',
  padding: '32px',
  maxWidth: '500px',
  width: '90%',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px'
};

const closeButtonStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#ffffff'
};

const inputStyle = {
  padding: '12px 16px',
  border: '2px solid rgba(0, 212, 170, 0.3)',
  borderRadius: '12px',
  fontSize: '14px',
  background: 'rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  backdropFilter: 'blur(10px)'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '20px'
};

const cancelButtonStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  backdropFilter: 'blur(10px)'
};

const saveButtonStyle = {
  background: 'linear-gradient(135deg, #00d4aa 0%, #4ecdc4 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 8px 25px rgba(0, 212, 170, 0.3)'
};

// Styles - Dark Modern Theme
const pageStyle = {
  background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
  minHeight: 'calc(100vh - 80px)',
  padding: '32px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
};

const containerStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '32px',
  background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)',
  borderRadius: '20px',
  border: '1px solid rgba(0, 212, 170, 0.2)',
  backdropFilter: 'blur(10px)'
};

const titleSectionStyle = {
  flex: 1
};

const jobTitleStyle = {
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#ffffff',
  margin: '0 0 16px 0',
  lineHeight: 1.2,
  letterSpacing: '0.5px'
};

const metaInfoStyle = {
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const statusBadgeStyle = (status) => ({
  padding: '8px 16px',
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 600,
  backgroundColor: status === 'active' ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255, 107, 107, 0.2)',
  color: status === 'active' ? '#00d4aa' : '#ff6b6b',
  border: `1px solid ${status === 'active' ? 'rgba(0, 212, 170, 0.4)' : 'rgba(255, 107, 107, 0.4)'}`,
  backdropFilter: 'blur(5px)'
});

const metaItemStyle = {
  fontSize: '0.95rem',
  color: 'rgba(255, 255, 255, 0.8)',
  fontWeight: 500,
  padding: '6px 12px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  backdropFilter: 'blur(5px)'
};

const actionButtonsStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const primaryButtonStyle = {
  background: 'linear-gradient(135deg, #00d4aa 0%, #4ecdc4 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 8px 25px rgba(0, 212, 170, 0.3)',
  letterSpacing: '0.5px'
};

const secondaryButtonStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)'
};

const tabNavStyle = {
  display: 'flex',
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '8px'
};

const tabButtonStyle = (active) => ({
  background: active ? 'rgba(0, 212, 170, 0.2)' : 'transparent',
  border: active ? '1px solid rgba(0, 212, 170, 0.4)' : '1px solid transparent',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  color: active ? '#00d4aa' : 'rgba(255, 255, 255, 0.7)',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)',
  flex: 1,
  textAlign: 'center'
});

const tabContentStyle = {
  minHeight: '400px'
};

const overviewStyle = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '32px'
};

const sectionStyle = {
  marginBottom: '32px'
};

const sectionTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#00d4aa',
  marginBottom: '16px'
};

const descriptionStyle = {
  fontSize: '1rem',
  lineHeight: 1.6,
  color: 'rgba(255, 255, 255, 0.9)'
};

const listStyle = {
  paddingLeft: '20px',
  lineHeight: 1.8,
  color: 'rgba(255, 255, 255, 0.8)'
};

const sidebarStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const infoCardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)'
};

const cardTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#00d4aa',
  marginBottom: '16px'
};

const infoItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
  fontSize: '0.95rem',
  color: 'rgba(255, 255, 255, 0.8)'
};

const infoLabelStyle = {
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.9)'
};

const tagsContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px'
};

const tagStyle = {
  background: 'rgba(0, 212, 170, 0.2)',
  color: '#00d4aa',
  border: '1px solid rgba(0, 212, 170, 0.4)',
  padding: '6px 12px',
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 500,
  backdropFilter: 'blur(5px)'
};

const candidatesTabStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const candidatesHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const candidatesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: '20px'
};

const candidateCardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  transition: 'all 0.3s ease',
  cursor: 'pointer'
};

const candidateHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const candidateAvatarStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #00d4aa 0%, #4ecdc4 100%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.4rem',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0, 212, 170, 0.3)',
  flexShrink: 0
};

const candidateNameStyle = {
  fontSize: '1.2rem',
  fontWeight: 600,
  color: '#ffffff',
  margin: '0 0 4px 0'
};

const candidateEmailStyle = {
  fontSize: '0.95rem',
  color: 'rgba(255, 255, 255, 0.7)',
  margin: 0
};

const candidateStageStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const stageBadgeStyle = (stage) => {
  const colors = {
    'Applied': { bg: 'rgba(0, 212, 170, 0.2)', color: '#00d4aa', border: 'rgba(0, 212, 170, 0.4)' },
    'Screening': { bg: 'rgba(255, 193, 7, 0.2)', color: '#ffc107', border: 'rgba(255, 193, 7, 0.4)' },
    'Interview': { bg: 'rgba(69, 183, 209, 0.2)', color: '#45b7d1', border: 'rgba(69, 183, 209, 0.4)' },
    'Offer': { bg: 'rgba(156, 39, 176, 0.2)', color: '#9c27b0', border: 'rgba(156, 39, 176, 0.4)' },
    'Hired': { bg: 'rgba(76, 175, 80, 0.2)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.4)' }
  };
  const style = colors[stage] || { bg: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.7)', border: 'rgba(255, 255, 255, 0.2)' };
  
  return {
    padding: '8px 12px',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: 600,
    backgroundColor: style.bg,
    color: style.color,
    border: `1px solid ${style.border}`,
    backdropFilter: 'blur(5px)'
  };
};

const assessmentsTabStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const assessmentsHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const assessmentsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const assessmentCardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)'
};

const assessmentHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px'
};

const assessmentTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#ffffff',
  margin: 0
};

const questionCountStyle = {
  fontSize: '0.875rem',
  color: '#00d4aa',
  background: 'rgba(0, 212, 170, 0.2)',
  border: '1px solid rgba(0, 212, 170, 0.4)',
  padding: '6px 12px',
  borderRadius: '12px',
  backdropFilter: 'blur(5px)'
};

const assessmentDescStyle = {
  fontSize: '0.95rem',
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: '16px',
  lineHeight: 1.5
};

const assessmentActionsStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const assignSelectStyle = {
  padding: '10px 14px',
  border: '2px solid rgba(0, 212, 170, 0.3)',
  borderRadius: '12px',
  fontSize: '0.9rem',
  background: 'rgba(30, 30, 60, 0.9)',
  color: '#ffffff',
  backdropFilter: 'blur(10px)',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: 'rgba(255, 255, 255, 0.7)',
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.08)'
};

// Unified Header Styles
const unifiedHeaderStyle = {
  background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)',
  borderRadius: '20px',
  border: '1px solid rgba(0, 212, 170, 0.2)',
  backdropFilter: 'blur(10px)',
  padding: '24px',
  marginBottom: '24px'
};

const breadcrumbSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const breadcrumbRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const breadcrumbItemStyle = {
  background: 'transparent',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.7)',
  cursor: 'pointer',
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s'
};

const activeBreadcrumbStyle = {
  color: '#00d4aa',
  fontWeight: '600',
  background: 'rgba(0, 212, 170, 0.1)'
};

const separatorStyle = {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '16px',
  fontWeight: '300'
};

const quickActionsRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap'
};

const quickActionsLabelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#00d4aa'
};

const quickActionButtonStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '10px',
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  color: '#ffffff',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(5px)'
};

const candidateMetaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const candidateMetaItemStyle = {
  fontSize: '0.85rem',
  color: 'rgba(255, 255, 255, 0.6)',
  fontWeight: '500'
};

