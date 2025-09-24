import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    jobsByStatus: { active: 0, archived: 0 },
    applicationsByStage: { Applied: 0, Screening: 0, Interview: 0, Offer: 0, Hired: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get('/api/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    }
    fetchStats();
  }, []);

  const quickActions = [
    { label: 'Post New Job', action: () => navigate('/jobs'), color: '#00d4aa', bgColor: 'rgba(0, 212, 170, 0.1)' },
    { label: 'View Candidates', action: () => navigate('/candidates'), color: '#ff6b6b', bgColor: 'rgba(255, 107, 107, 0.1)' },
    { label: 'Create Assessment', action: () => navigate('/assessments'), color: '#4ecdc4', bgColor: 'rgba(78, 205, 196, 0.1)' },
    { label: 'Analytics', action: () => setShowAnalytics(true), color: '#45b7d1', bgColor: 'rgba(69, 183, 209, 0.1)' }
  ];

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.15); }
          }
          @keyframes glow {
            from { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 16px rgba(255, 215, 0, 0.4)); }
            to { filter: drop-shadow(0 0 16px rgba(255, 215, 0, 1)) drop-shadow(0 0 24px rgba(255, 215, 0, 0.6)); }
          }
          @keyframes flow {
            0% { background: linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(100,181,246,0.5) 50%, rgba(255,255,255,0.3) 100%); }
            50% { background: linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(100,181,246,1) 50%, rgba(255,255,255,0.8) 100%); }
            100% { background: linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(100,181,246,0.5) 50%, rgba(255,255,255,0.3) 100%); }
          }
        `}
      </style>
      <div style={dashboardStyle}>
      <div style={containerStyle}>
        {/* Header Section */}
        <div style={headerSectionStyle}>
          <div style={headerContentStyle}>
            <div style={headerTextStyle}>
              <h1 style={mainTitleStyle}>TalentFlow Dashboard</h1>
              <p style={subtitleStyle}>Streamline your hiring process with intelligent workforce management</p>
            </div>
            <div style={headerStatsStyle}>
              <div style={miniStatStyle}>
                <div style={miniStatNumberStyle}>{stats.totalJobs}</div>
                <div style={miniStatLabelStyle}>Active Jobs</div>
              </div>
              <div style={miniStatStyle}>
                <div style={miniStatNumberStyle}>1000+</div>
                <div style={miniStatLabelStyle}>Candidates</div>
              </div>
            </div>
          </div>
          <div style={headerPatternStyle}></div>
        </div>

        {/* Metrics Grid */}
        <div style={metricsContainerStyle}>
          <div style={metricsGridStyle}>
            <MetricCard 
              number={stats.totalJobs} 
              label="Total Positions" 
              color="#00d4aa"
              subtitle={`${stats.jobsByStatus.active} active openings`}
              trend="+12%"
            />
            <MetricCard 
              number={stats.totalCandidates} 
              label="Talent Pool" 
              color="#ff6b6b"
              subtitle="Registered candidates"
              trend="+8%"
            />
            <MetricCard 
              number={stats.totalApplications} 
              label="Applications" 
              color="#4ecdc4"
              subtitle="Total submissions"
              trend="+15%"
            />
            <MetricCard 
              number={stats.applicationsByStage.Hired} 
              label="Successful Hires" 
              color="#45b7d1"
              subtitle="Completed placements"
              trend="+5%"
            />
          </div>
        </div>

        {/* Action Center */}
        <div style={actionCenterStyle}>
          <div style={actionHeaderStyle}>
            <h2 style={actionTitleStyle}>Action Center</h2>
            <div style={actionSubtitleStyle}>Quick access to core functions</div>
          </div>
          <div style={actionGridStyle}>
            {quickActions.map((action, index) => (
              <ActionButton key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Pipeline Flow */}
        <div style={pipelineFlowStyle}>
          <div style={pipelineHeaderStyle}>
            <h2 style={pipelineTitleStyle}>Hiring Pipeline</h2>
            <div style={pipelineSubtitleStyle}>Application flow visualization</div>
          </div>
          <div style={pipelineVisualizationStyle}>
            {Object.entries(stats.applicationsByStage).map(([stage, count], index) => (
              <PipelineStage key={stage} stage={stage} count={count} index={index} total={stats.totalApplications} />
            ))}
          </div>
        </div>
      </div>
      
      {showAnalytics && (
        <AnalyticsModal stats={stats} onClose={() => setShowAnalytics(false)} />
      )}
    </div>
    </>
  );
}

function AnalyticsModal({ stats, onClose }) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.8rem', fontWeight: '700' }}>Analytics Dashboard</h2>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>
        
        <div style={analyticsContentStyle}>
          <div style={analyticsGridStyle}>
            <div style={analyticsCardStyle}>
              <h3 style={analyticsCardTitleStyle}>Job Statistics</h3>
              <div style={analyticsItemStyle}>
                <span>Total Jobs:</span>
                <strong>{stats?.totalJobs || 0}</strong>
              </div>
              <div style={analyticsItemStyle}>
                <span>Active Jobs:</span>
                <strong style={{ color: '#00d4aa' }}>{stats?.jobsByStatus?.active || 0}</strong>
              </div>
              <div style={analyticsItemStyle}>
                <span>Archived Jobs:</span>
                <strong style={{ color: '#ff6b6b' }}>{stats?.jobsByStatus?.archived || 0}</strong>
              </div>
            </div>
            
            <div style={analyticsCardStyle}>
              <h3 style={analyticsCardTitleStyle}>Candidate Metrics</h3>
              <div style={analyticsItemStyle}>
                <span>Total Candidates:</span>
                <strong>{stats?.totalCandidates || 0}</strong>
              </div>
              <div style={analyticsItemStyle}>
                <span>Total Applications:</span>
                <strong>{stats?.totalApplications || 0}</strong>
              </div>
              <div style={analyticsItemStyle}>
                <span>Success Rate:</span>
                <strong style={{ color: '#45b7d1' }}>
                  {stats?.totalApplications > 0 
                    ? Math.round(((stats?.applicationsByStage?.Hired || 0) / stats.totalApplications) * 100)
                    : 0}%
                </strong>
              </div>
            </div>
          </div>
          
          <div style={pipelineAnalyticsStyle}>
            <h3 style={analyticsCardTitleStyle}>Application Pipeline Breakdown</h3>
            <div style={pipelineStatsStyle}>
              {Object.entries(stats?.applicationsByStage || {}).map(([stage, count]) => {
                const percentage = stats?.totalApplications > 0 
                  ? Math.round((count / stats.totalApplications) * 100) 
                  : 0;
                return (
                  <div key={stage} style={pipelineStatItemStyle}>
                    <div style={pipelineStatLabelStyle}>{stage}</div>
                    <div style={pipelineStatNumberStyle}>{count}</div>
                    <div style={pipelineStatPercentStyle}>{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ number, label, color, subtitle, trend }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div 
      style={{
        ...metricCardStyle,
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hover ? '0 20px 40px rgba(0, 0, 0, 0.15)' : '0 8px 25px rgba(0, 0, 0, 0.08)'
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={metricHeaderStyle}>
        <div style={{ ...metricNumberStyle, color }}>{number}</div>
        <div style={{ ...trendStyle, color }}>{trend}</div>
      </div>
      <div style={metricLabelStyle}>{label}</div>
      <div style={metricSubtitleStyle}>{subtitle}</div>
      <div style={{ ...metricAccentStyle, backgroundColor: color }}></div>
    </div>
  );
}

function ActionButton({ label, action, color, bgColor }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      style={{
        ...actionButtonStyle,
        backgroundColor: hover ? color : bgColor,
        color: hover ? '#ffffff' : color,
        transform: hover ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hover ? `0 12px 30px ${color}40` : '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}
      onClick={action}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={actionButtonLabelStyle}>{label}</div>
      <div style={actionArrowStyle}>→</div>
    </button>
  );
}

function PipelineStage({ stage, count, index, total }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const colors = ['#00d4aa', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
  const color = colors[index % colors.length];
  
  return (
    <div style={pipelineStageCardStyle}>
      <div style={{ ...stageIndicatorStyle, backgroundColor: color }}></div>
      <div style={stageContentStyle}>
        <div style={stageCountStyle}>{count}</div>
        <div style={stageLabelStyle}>{stage}</div>
        <div style={stagePercentStyle}>{percentage}%</div>
      </div>
      {index < 4 && <div style={stageConnectorStyle}></div>}
    </div>
  );
}

// Styles - Dark Modern Theme
const dashboardStyle = {
  minHeight: "calc(100vh - 80px)",
  background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
  padding: "clamp(16px, 4vw, 32px)",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const containerStyle = {
  maxWidth: "1600px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "clamp(20px, 5vw, 40px)",
};

const headerSectionStyle = {
  position: "relative",
  background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
  borderRadius: "16px",
  padding: "clamp(20px, 5vw, 40px)",
  color: "white",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
};

const headerContentStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "relative",
  zIndex: 2,
  flexWrap: "wrap",
  gap: "20px",
};

const headerTextStyle = {
  flex: 1,
};

const mainTitleStyle = {
  fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
  fontWeight: "700",
  margin: "0 0 12px 0",
  letterSpacing: "-0.01em",
  color: "#ffffff",
  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
};

const subtitleStyle = {
  fontSize: "clamp(1rem, 3vw, 1.2rem)",
  opacity: 0.8,
  lineHeight: 1.6,
  margin: 0,
  fontWeight: "400",
};

const headerStatsStyle = {
  display: "flex",
  gap: "clamp(16px, 4vw, 32px)",
  flexWrap: "wrap",
};

const miniStatStyle = {
  textAlign: "center",
  padding: "clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)",
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: "16px",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  minWidth: "120px",
};

const miniStatNumberStyle = {
  fontSize: "clamp(1.5rem, 4vw, 2rem)",
  fontWeight: "700",
  color: "#00d4aa",
  marginBottom: "4px",
};

const miniStatLabelStyle = {
  fontSize: "0.875rem",
  opacity: 0.8,
  fontWeight: "500",
};

const headerPatternStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  width: "200px",
  height: "100%",
  background: "linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%), linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%)",
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 10px 10px",
  opacity: 0.4,
};

const metricsContainerStyle = {
  padding: "0",
};

const metricsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
  gap: "clamp(16px, 3vw, 24px)",
};

const metricCardStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  borderRadius: "20px",
  padding: "clamp(20px, 4vw, 32px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(20px)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
};

const metricHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "20px",
};

const metricNumberStyle = {
  fontSize: "clamp(2rem, 6vw, 3rem)",
  fontWeight: "800",
  lineHeight: 1,
};

const trendStyle = {
  fontSize: "0.875rem",
  fontWeight: "600",
  padding: "4px 8px",
  borderRadius: "8px",
  background: "rgba(255, 255, 255, 0.1)",
};

const metricLabelStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#ffffff",
  marginBottom: "8px",
};

const metricSubtitleStyle = {
  fontSize: "0.875rem",
  color: "rgba(255, 255, 255, 0.7)",
  fontWeight: "400",
};

const metricAccentStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "4px",
  borderRadius: "0 0 20px 20px",
};

const actionCenterStyle = {
  background: "rgba(255, 255, 255, 0.03)",
  borderRadius: "24px",
  padding: "clamp(20px, 5vw, 40px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const actionHeaderStyle = {
  marginBottom: "32px",
};

const actionTitleStyle = {
  fontSize: "clamp(1.5rem, 4vw, 2rem)",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0 0 8px 0",
};

const actionSubtitleStyle = {
  fontSize: "1rem",
  color: "rgba(255, 255, 255, 0.7)",
  fontWeight: "400",
};

const actionGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))",
  gap: "clamp(16px, 3vw, 20px)",
};

const actionButtonStyle = {
  border: "none",
  borderRadius: "16px",
  padding: "clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px)",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontFamily: "inherit",
  fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
  fontWeight: "600",
  position: "relative",
  overflow: "hidden",
};

const actionButtonLabelStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
};

const actionArrowStyle = {
  fontSize: "1.2rem",
  fontWeight: "bold",
  transition: "transform 0.3s ease",
};

const pipelineFlowStyle = {
  background: "rgba(255, 255, 255, 0.03)",
  borderRadius: "24px",
  padding: "clamp(20px, 5vw, 40px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const pipelineHeaderStyle = {
  marginBottom: "32px",
};

const pipelineTitleStyle = {
  fontSize: "clamp(1.5rem, 4vw, 2rem)",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0 0 8px 0",
};

const pipelineSubtitleStyle = {
  fontSize: "1rem",
  color: "rgba(255, 255, 255, 0.7)",
  fontWeight: "400",
};

const pipelineVisualizationStyle = {
  display: "flex",
  gap: "clamp(12px, 3vw, 16px)",
  overflowX: "auto",
  paddingBottom: "8px",
  flexWrap: "wrap",
};

const pipelineStageCardStyle = {
  position: "relative",
  minWidth: "clamp(140px, 20vw, 180px)",
  flex: "1 1 auto",
  background: "rgba(255, 255, 255, 0.05)",
  borderRadius: "16px",
  padding: "clamp(16px, 3vw, 24px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
};

const stageIndicatorStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  marginBottom: "16px",
};

const stageContentStyle = {
  textAlign: "center",
};

const stageCountStyle = {
  fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
  fontWeight: "800",
  color: "#ffffff",
  marginBottom: "8px",
  lineHeight: 1,
};

const stageLabelStyle = {
  fontSize: "1rem",
  fontWeight: "600",
  color: "#ffffff",
  marginBottom: "4px",
};

const stagePercentStyle = {
  fontSize: "0.875rem",
  color: "rgba(255, 255, 255, 0.7)",
  fontWeight: "500",
};

const stageConnectorStyle = {
  position: "absolute",
  top: "50%",
  right: "-16px",
  width: "16px",
  height: "2px",
  background: "rgba(255, 255, 255, 0.2)",
  transform: "translateY(-50%)",
};

const welcomeCardStyle = {
  background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
  borderRadius: "20px",
  padding: "40px",
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 8px 32px rgba(25, 118, 210, 0.3)",
};

const welcomeContentStyle = {
  flex: 1,
};

const welcomeTitleStyle = {
  fontSize: "2.5rem",
  fontWeight: "700",
  margin: "0 0 16px 0",
  letterSpacing: "0.5px",
};

const welcomeSubtitleStyle = {
  fontSize: "1.1rem",
  opacity: 0.9,
  lineHeight: 1.6,
  margin: 0,
};

const logoSectionStyle = {
  marginLeft: "40px",
};

const logoContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
};

const logoIcon = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "rgba(255, 255, 255, 0.15)",
  padding: "16px 20px",
  borderRadius: "25px",
  backdropFilter: "blur(15px)",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
};

const flowElement1 = {
  fontSize: "1.8rem",
  animation: "pulse 2s infinite",
  filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))",
};

const flowConnector = {
  width: "20px",
  height: "3px",
  background: "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(100,181,246,1) 50%, rgba(255,255,255,0.8) 100%)",
  borderRadius: "2px",
  animation: "flow 2s ease-in-out infinite",
};

const talentCore = {
  fontSize: "2.2rem",
  animation: "glow 2s ease-in-out infinite alternate",
  filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))",
};

const flowElement2 = {
  fontSize: "1.8rem",
  animation: "pulse 2s infinite 1s",
  filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))",
};

const logoTextContainer = {
  textAlign: "center",
};

const logoMainText = {
  color: "#fff",
  fontSize: "1.2rem",
  fontWeight: "700",
  letterSpacing: "1px",
  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
};

const logoSubText = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "0.75rem",
  fontWeight: "500",
  letterSpacing: "0.5px",
  marginTop: "2px",
};

const statsContainerStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "32px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  border: "1px solid #e9ecef",
};

const sectionTitleStyle = {
  fontSize: "1.5rem",
  fontWeight: "600",
  color: "#1a237e",
  margin: "0 0 24px 0",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
};

const loadingStyle = {
  textAlign: "center",
  color: "#666",
  fontSize: "16px",
  padding: "40px",
};

const statCardStyle = {
  background: "#f8f9fa",
  borderRadius: "12px",
  padding: "24px",
  transition: "all 0.2s ease",
};

const statCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

const statCardNumberStyle = {
  fontSize: "2rem",
  fontWeight: "700",
};

const statCardLabelStyle = {
  fontSize: "1rem",
  fontWeight: "600",
  color: "#333",
  marginBottom: "4px",
};

const statCardSubtitleStyle = {
  fontSize: "0.875rem",
  color: "#666",
};

const actionsContainerStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "32px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  border: "1px solid #e9ecef",
};

const actionsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px",
};

const actionCardStyle = {
  background: "white",
  border: "2px solid #e9ecef",
  borderRadius: "12px",
  padding: "24px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
};

const actionIconStyle = {
  fontSize: "2rem",
};

const actionLabelStyle = {
  fontSize: "1rem",
  fontWeight: "600",
  color: "#333",
};

const pipelineContainerStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "32px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  border: "1px solid #e9ecef",
};

const pipelineGridStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
};

const pipelineStageStyle = {
  textAlign: "center",
  flex: 1,
  minWidth: "120px",
  padding: "16px",
  background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  borderRadius: "12px",
};

const pipelineCountStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "#1976d2",
  marginBottom: "4px",
};

const pipelineLabelStyle = {
  fontSize: "0.875rem",
  color: "#666",
  fontWeight: "500",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(8px)",
};

const modalContentStyle = {
  background: "linear-gradient(135deg, #1e1e3f 0%, #2a2a5a 100%)",
  borderRadius: "24px",
  padding: "0",
  maxWidth: "min(900px, 95vw)",
  width: "90%",
  maxHeight: "90vh",
  overflow: "hidden",
  boxShadow: "0 25px 80px rgba(0, 0, 0, 0.5)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "clamp(20px, 4vw, 32px) clamp(20px, 5vw, 40px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
};

const closeButtonStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  fontSize: "20px",
  cursor: "pointer",
  color: "#ffffff",
  padding: "8px 12px",
  borderRadius: "12px",
  transition: "all 0.3s ease",
};

const analyticsContentStyle = {
  padding: "clamp(20px, 5vw, 40px)",
  overflowY: "auto",
  maxHeight: "calc(90vh - 120px)",
};

const analyticsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
  gap: "clamp(20px, 4vw, 32px)",
  marginBottom: "clamp(20px, 5vw, 40px)",
};

const analyticsCardStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  borderRadius: "16px",
  padding: "clamp(20px, 4vw, 32px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const analyticsCardTitleStyle = {
  margin: "0 0 20px 0",
  color: "#ffffff",
  fontSize: "1.3rem",
  fontWeight: "700",
};

const analyticsItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  fontSize: "1rem",
  color: "rgba(255, 255, 255, 0.9)",
};

const pipelineAnalyticsStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  borderRadius: "16px",
  padding: "clamp(20px, 4vw, 32px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const pipelineStatsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(140px, 100%), 1fr))",
  gap: "clamp(16px, 3vw, 20px)",
};

const pipelineStatItemStyle = {
  textAlign: "center",
  padding: "clamp(16px, 3vw, 20px)",
  background: "rgba(255, 255, 255, 0.05)",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const pipelineStatLabelStyle = {
  fontSize: "0.875rem",
  color: "rgba(255, 255, 255, 0.7)",
  marginBottom: "8px",
  fontWeight: "500",
};

const pipelineStatNumberStyle = {
  fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
  fontWeight: "700",
  color: "#00d4aa",
  marginBottom: "4px",
};

const pipelineStatPercentStyle = {
  fontSize: "0.875rem",
  color: "#45b7d1",
  fontWeight: "600",
};

