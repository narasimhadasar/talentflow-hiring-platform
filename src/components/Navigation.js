import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const [showHelp, setShowHelp] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '', description: 'Overview & Stats' },
    { path: '/jobs', label: 'Jobs', icon: '', description: 'Manage Job Postings' },
    { path: '/candidates', label: 'Candidates', icon: '', description: 'View Applications' },
    { path: '/assessments', label: 'Assessments', icon: '', description: 'Create Tests' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .nav-mobile-stack {
              flex-direction: column !important;
              height: auto !important;
              padding: 16px !important;
            }
            .nav-mobile-full {
              width: 100% !important;
              justify-content: center !important;
            }
            .nav-mobile-hide-desc {
              display: none !important;
            }
          }
        `}
      </style>
      <nav style={navStyle}>
        <div style={{...navContainerStyle}} className={isMobile ? 'nav-mobile-stack' : ''}>
          <div style={logoStyle} onClick={() => navigate('/')}>
            <span style={logoTextStyle}>TF</span>
            <div>
              <span style={logoNameStyle}>TalentFlow</span>
              <div style={logoSubStyle}>Hiring Platform</div>
            </div>
          </div>
          
          <div style={navLinksStyle} className={isMobile ? 'nav-mobile-full' : ''}>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...navButtonStyle,
                  ...(isActive(item.path) ? activeNavButtonStyle : {})
                }}
                title={item.description}
              >
                <span style={iconStyle}>{item.icon}</span>
                <div style={navTextStyle}>
                  <span style={navLabelStyle}>{item.label}</span>
                  <span style={{...navDescStyle}} className={isMobile ? 'nav-mobile-hide-desc' : ''}>{item.description}</span>
                </div>
              </button>
            ))}
          </div>

          <div style={actionsStyle}>
            <button style={helpButtonStyle} title="Help & Documentation" onClick={() => setShowHelp(true)}>
              ?
            </button>
          </div>
        </div>
      </nav>
      
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </>
  );
}

// Breadcrumb component for sub-pages
export function Breadcrumb({ items }) {
  const navigate = useNavigate();
  
  return (
    <div style={breadcrumbStyle}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span style={separatorStyle}>›</span>}
          <button
            style={{
              ...breadcrumbItemStyle,
              ...(index === items.length - 1 ? activeBreadcrumbStyle : {})
            }}
            onClick={() => item.path && navigate(item.path)}
            disabled={!item.path}
          >
            {item.icon && <span style={breadcrumbIconStyle}>{item.icon}</span>}
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

// Quick Actions component
export function QuickActions({ actions }) {
  return (
    <div style={quickActionsStyle}>
      <span style={quickActionsLabelStyle}>Quick Actions:</span>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          style={quickActionButtonStyle}
          title={action.description}
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}



// Styles
const navStyle = {
  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
};

const navContainerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '0 clamp(16px, 4vw, 24px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 'clamp(60px, 10vw, 80px)',
  flexWrap: 'wrap',
  gap: '16px'
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  ':hover': {
    transform: 'scale(1.05)'
  }
};

const logoTextStyle = {
  width: 'clamp(40px, 8vw, 48px)',
  height: 'clamp(40px, 8vw, 48px)',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #64b5f6 0%, #90caf9 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#1976d2',
  fontWeight: 'bold',
  fontSize: 'clamp(14px, 3vw, 18px)',
  letterSpacing: '1px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
};

const logoNameStyle = {
  color: 'white',
  fontSize: 'clamp(18px, 4vw, 24px)',
  fontWeight: '700',
  letterSpacing: '0.5px',
  lineHeight: '1'
};

const logoSubStyle = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '12px',
  fontWeight: '400',
  letterSpacing: '0.3px'
};

const navLinksStyle = {
  display: 'flex',
  gap: 'clamp(4px, 1vw, 8px)',
  flexWrap: 'wrap',
  justifyContent: 'center'
};

const navButtonStyle = {
  background: 'transparent',
  color: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid transparent',
  borderRadius: '12px',
  padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
  fontSize: 'clamp(12px, 2.5vw, 14px)',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: 'clamp(6px, 2vw, 10px)',
  minWidth: 'clamp(100px, 20vw, 140px)'
};

const activeNavButtonStyle = {
  background: 'rgba(255, 255, 255, 0.15)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transform: 'translateY(-1px)'
};

const iconStyle = {
  fontSize: '20px'
};

const navTextStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '2px'
};

const navLabelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1'
};

const navDescStyle = {
  fontSize: '11px',
  opacity: 0.8,
  lineHeight: '1'
};

const actionsStyle = {
  display: 'flex',
  gap: '12px'
};

const helpButtonStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px'
};

const breadcrumbStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'clamp(6px, 2vw, 8px)',
  padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)',
  background: '#f8f9fa',
  borderBottom: '1px solid #e9ecef',
  flexWrap: 'wrap'
};

const breadcrumbItemStyle = {
  background: 'transparent',
  border: 'none',
  color: '#6c757d',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'all 0.2s'
};

const activeBreadcrumbStyle = {
  color: '#1976d2',
  fontWeight: '600'
};

const separatorStyle = {
  color: '#adb5bd',
  fontSize: '14px'
};

const breadcrumbIconStyle = {
  fontSize: '14px'
};

const quickActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'clamp(8px, 2vw, 12px)',
  padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
  background: 'linear-gradient(90deg, #e3f2fd 0%, #f3e5f5 100%)',
  borderBottom: '1px solid #e1bee7',
  flexWrap: 'wrap'
};

const quickActionsLabelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#1976d2'
};

const quickActionButtonStyle = {
  background: 'white',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
  cursor: 'pointer',
  fontSize: 'clamp(10px, 2vw, 12px)',
  fontWeight: '500',
  color: '#1976d2',
  display: 'flex',
  alignItems: 'center',
  gap: 'clamp(4px, 1vw, 6px)',
  transition: 'all 0.2s'
};

// Help Modal Component
function HelpModal({ onClose }) {
  const helpSections = [
    {
      title: "Getting Started",
      items: [
        "Navigate using the top menu: Dashboard, Jobs, Candidates, Assessments",
        "Use breadcrumbs to track your location and navigate back",
        "Click the TalentFlow logo to return to the dashboard anytime"
      ]
    },
    {
      title: "Jobs Management",
      items: [
        "Create new jobs using the 'New Job' button",
        "Edit jobs by clicking the job title or using the Edit button",
        "Drag and drop jobs to reorder them",
        "Use filters to search by title, status, or tags",
        "Archive/unarchive jobs to manage your active listings"
      ]
    },
    {
      title: "Candidates & Applications",
      items: [
        "View all candidates in list or kanban board format",
        "Search candidates by name, email, or job title",
        "Drag candidates between stages in kanban view",
        "Click on a candidate to view their detailed profile",
        "Export candidate data using the Export button"
      ]
    },
    {
      title: "Assessment Builder",
      items: [
        "Create assessments with 6 question types: text, multiple choice, numeric, file upload",
        "Use the live preview to see how your assessment looks",
        "Set up conditional questions that show/hide based on answers",
        "Add validation rules for different question types",
        "Save your work - assessments are automatically persisted"
      ]
    },
    {
      title: "Tips & Shortcuts",
      items: [
        "Use Quick Actions for fast navigation between sections",
        "All data is saved locally - no internet required after initial load",
        "The app works on mobile, tablet, and desktop devices",
        "Use the Analytics button on dashboard for detailed insights",
        "Drag and drop works throughout the app for intuitive management"
      ]
    }
  ];

  return (
    <div style={helpModalOverlayStyle} onClick={onClose}>
      <div style={helpModalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={helpModalHeaderStyle}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.8rem', fontWeight: '700' }}>Help & Support</h2>
          <button style={helpCloseButtonStyle} onClick={onClose}>×</button>
        </div>
        
        <div style={helpModalBodyStyle}>
          <div style={helpIntroStyle}>
            <p>Welcome to TalentFlow! Here's everything you need to know to get started with our hiring platform.</p>
          </div>
          
          {helpSections.map((section, index) => (
            <div key={index} style={helpSectionStyle}>
              <h3 style={helpSectionTitleStyle}>{section.title}</h3>
              <ul style={helpListStyle}>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} style={helpListItemStyle}>
                    <span style={{ color: '#00d4aa', marginRight: '8px', fontWeight: 'bold' }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div style={helpFooterStyle}>
            <div style={helpContactStyle}>
              <h4 style={helpContactTitleStyle}>Need More Help?</h4>
              <p style={helpContactTextStyle}>
                This is a demo application built for technical assessment purposes. 
                For questions about the implementation, please contact:
              </p>
              <div style={developerContactStyle}>
                <div><strong>Alex Johnson</strong> - Senior Frontend Developer</div>
                <div>Email: alex.johnson.dev@email.com</div>
                <div>LinkedIn: /in/alexjohnson-react</div>
                <div>GitHub: @alexjohnson-dev</div>
                <div>Phone: +1 (555) 123-4567</div>
              </div>
            </div>
            
            <div style={helpVersionStyle}>
              <strong>TalentFlow v1.0</strong> - Built with React & Modern Web Technologies
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Help Modal Styles
const helpModalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(8px)'
};

const helpModalContentStyle = {
  background: 'linear-gradient(135deg, #1e1e3f 0%, #2a2a5a 100%)',
  borderRadius: '24px',
  padding: '0',
  maxWidth: 'min(800px, 95vw)',
  width: '90%',
  maxHeight: '90vh',
  overflow: 'hidden',
  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.1)'
};

const helpModalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'clamp(20px, 4vw, 32px) clamp(20px, 5vw, 40px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'rgba(0, 212, 170, 0.1)'
};

const helpCloseButtonStyle = {
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
  justifyContent: 'center',
  transition: 'all 0.3s ease'
};

const helpModalBodyStyle = {
  padding: 'clamp(20px, 5vw, 40px)',
  overflowY: 'auto',
  maxHeight: 'calc(90vh - 120px)'
};

const helpIntroStyle = {
  marginBottom: '32px',
  padding: '20px',
  background: 'rgba(0, 212, 170, 0.1)',
  borderRadius: '16px',
  border: '1px solid rgba(0, 212, 170, 0.2)'
};

const helpSectionStyle = {
  marginBottom: '32px'
};

const helpSectionTitleStyle = {
  color: '#00d4aa',
  fontSize: '1.3rem',
  fontWeight: '700',
  marginBottom: '16px',
  borderBottom: '2px solid rgba(0, 212, 170, 0.3)',
  paddingBottom: '8px'
};

const helpListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0
};

const helpListItemStyle = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '1rem',
  lineHeight: '1.6',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'flex-start'
};

const helpFooterStyle = {
  marginTop: '40px',
  paddingTop: '24px',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
};

const helpContactStyle = {
  marginBottom: '24px'
};

const helpContactTitleStyle = {
  color: '#ffffff',
  fontSize: '1.2rem',
  fontWeight: '600',
  marginBottom: '12px'
};

const helpContactTextStyle = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.95rem',
  lineHeight: '1.5',
  margin: 0
};

const helpVersionStyle = {
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.9rem',
  fontStyle: 'italic'
};

const developerContactStyle = {
  marginTop: '16px',
  padding: '16px',
  background: 'rgba(0, 212, 170, 0.1)',
  borderRadius: '12px',
  border: '1px solid rgba(0, 212, 170, 0.2)',
  fontSize: '0.9rem',
  lineHeight: '1.6',
  color: 'rgba(255, 255, 255, 0.9)'
};

