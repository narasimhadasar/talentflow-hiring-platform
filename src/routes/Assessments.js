import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AssessmentsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/api/jobs?page=1&pageSize=50");
        setJobs(res.data.items || []);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Assessments' }
  ];

  const quickActions = [
    { label: 'View Jobs', onClick: () => navigate('/jobs'), description: 'Browse job postings' },
    { label: 'Candidates', onClick: () => navigate('/candidates'), description: 'View applications' },
    { label: 'Templates', onClick: () => setShowTemplates(true), description: 'Assessment templates' }
  ];

  if (loading) return (
    <div style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', minHeight: 'calc(100vh - 80px)', padding: '32px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)' }}>Loading assessments...</p>
      </div>
    </div>
  );

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
          <div style={headerSectionStyle}>
            <h1 style={mainTitleStyle}>Assessment Management</h1>
            <div style={subtitleStyle}>
              Create and manage assessments for your job postings • {jobs.length} jobs available
            </div>
          </div>

          <div style={jobsGridStyle}>
            {jobs.map((job) => (
              <div
                key={job.id}
                style={jobCardStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={jobCardHeaderStyle}>
                  <h3 style={jobTitleStyle}>{job.title}</h3>
                  <span style={{
                    ...statusBadgeStyle,
                    background: job.status === 'active' ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                    color: job.status === 'active' ? '#00d4aa' : '#ff6b6b',
                    border: `1px solid ${job.status === 'active' ? '#00d4aa' : '#ff6b6b'}`
                  }}>
                    {job.status}
                  </span>
                </div>
                <div style={jobMetaStyle}>
                  Job ID: {job.id} • Tags: {(job.tags || []).join(', ') || 'None'}
                </div>
                <button
                  onClick={() => navigate(`/assessments/${job.id}`)}
                  style={createButtonStyle}
                >
                  {job.hasAssessment ? "Edit Assessment" : "Create Assessment"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {showTemplates && (
        <TemplatesModal onClose={() => setShowTemplates(false)} />
      )}
    </div>
  );
}

function TemplatesModal({ onClose }) {
  const templates = [
    { id: 1, name: 'Technical Interview', description: 'Standard technical assessment for software developers', questions: 8 },
    { id: 2, name: 'Customer Service', description: 'Assessment for customer-facing roles', questions: 6 },
    { id: 3, name: 'Leadership Assessment', description: 'Evaluation for management positions', questions: 10 },
    { id: 4, name: 'Sales Aptitude', description: 'Assessment for sales roles', questions: 7 }
  ];

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.8rem', fontWeight: '700' }}>Assessment Templates</h2>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>
        
        <div style={templatesContentStyle}>
          {templates.map((template) => (
            <div key={template.id} style={templateCardStyle}>
              <h3 style={templateTitleStyle}>{template.name}</h3>
              <p style={templateDescStyle}>{template.description}</p>
              <div style={templateFooterStyle}>
                <span style={templateQuestionsStyle}>{template.questions} questions</span>
                <button style={templateButtonStyle} onClick={() => {
                  alert(`Template "${template.name}" selected!`);
                  onClose();
                }}>Use Template</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Styles
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
  padding: '40px'
};

const headerSectionStyle = {
  marginBottom: '32px'
};

const mainTitleStyle = {
  margin: 0,
  color: '#ffffff',
  fontSize: '2.2rem',
  fontWeight: 700
};

const subtitleStyle = {
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '1rem',
  marginTop: '8px'
};

const jobsGridStyle = {
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
};

const jobCardStyle = {
  border: "2px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "16px",
  padding: "24px",
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  cursor: 'pointer'
};

const jobCardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px'
};

const jobTitleStyle = {
  margin: 0,
  color: '#00d4aa',
  fontSize: '1.3rem',
  fontWeight: 600
};

const statusBadgeStyle = {
  padding: '6px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600'
};

const jobMetaStyle = {
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '14px',
  marginBottom: '20px'
};

const createButtonStyle = {
  background: 'linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  padding: '14px 24px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  width: '100%',
  boxShadow: '0 4px 12px rgba(78, 205, 196, 0.3)'
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
  maxWidth: '600px',
  width: '90%',
  maxHeight: '80vh',
  overflow: 'auto',
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

const templatesContentStyle = {
  display: 'grid',
  gap: '16px'
};

const templateCardStyle = {
  border: '1px solid rgba(0, 212, 170, 0.2)',
  borderRadius: '12px',
  padding: '20px',
  background: 'rgba(0, 212, 170, 0.05)',
  backdropFilter: 'blur(10px)'
};

const templateTitleStyle = {
  margin: '0 0 8px 0',
  color: '#00d4aa',
  fontSize: '1.2rem',
  fontWeight: '600'
};

const templateDescStyle = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.9rem',
  margin: '0 0 16px 0',
  lineHeight: '1.4'
};

const templateFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const templateQuestionsStyle = {
  fontSize: '0.85rem',
  color: 'rgba(255, 255, 255, 0.6)'
};

const templateButtonStyle = {
  background: 'linear-gradient(135deg, #00d4aa 0%, #4ecdc4 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};