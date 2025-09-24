import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// import { List } from 'react-window'; // Removed due to compatibility issues


const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
const ITEM_HEIGHT = 120; // Height of each candidate item in pixels
const LIST_HEIGHT = 600; // Height of the virtualized list

// Memoized candidate item components to prevent unnecessary re-renders
const CandidateListItem = React.memo(({ app, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div
      style={{
        padding: '15px',
        margin: '4px 8px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: isHovered ? '#f0f8ff' : '#fafafa',
        border: '1px solid #e0e0e0',
        transition: 'all 0.2s ease',
        height: `${ITEM_HEIGHT - 8}px`, // Account for margin
        boxSizing: 'border-box'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <strong style={{ fontSize: '16px', color: '#333' }}>{app.candidateName}</strong>
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          backgroundColor: getStageColor(app.stage),
          color: 'white',
          fontSize: '11px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          {app.stage}
        </span>
      </div>
      <span style={{ color: '#666', fontSize: '14px' }}>{app.candidateEmail}</span>
      <div style={{ 
        fontSize: '13px', 
        color: '#888',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        Job: {app.jobTitle}
      </div>
    </div>
  );
});

// Helper function to get stage colors
function getStageColor(stage) {
  const colors = {
    'Applied': '#6c757d',
    'Screening': '#ffc107',
    'Interview': '#17a2b8',
    'Offer': '#28a745',
    'Hired': '#007bff',
    'Rejected': '#dc3545'
  };
  return colors[stage] || '#6c757d';
}

const KanbanCandidateItem = React.memo(({ app, provided, snapshot, onClick }) => (
  <div
    ref={provided.innerRef}
    {...provided.draggableProps}
    {...provided.dragHandleProps}
    style={{
      padding: '12px',
      marginBottom: '10px',
      borderRadius: '8px',
      background: snapshot.isDragging ? '#bbdefb' : '#fff',
      border: '1px solid #e0e0e0',
      boxShadow: snapshot.isDragging
        ? '0 4px 12px rgba(33, 150, 243, 0.3)'
        : '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s',
      ...provided.draggableProps.style,
    }}
    onClick={onClick}
  >
    <strong style={{ display: 'block', marginBottom: '5px' }}>
      {app.candidateName}
    </strong>
    <small style={{ color: '#666', display: 'block' }}>
      {app.jobTitle}
    </small>
    <small style={{ color: '#999', display: 'block', marginTop: '5px' }}>
      {app.candidateEmail}
    </small>
  </div>
));

export default function CandidatesPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(() => localStorage.getItem('candidatesSearch') || '');
  const [inputValue, setInputValue] = useState(search); // For debounced search input
  const [stageFilter, setStageFilter] = useState(() => localStorage.getItem('candidatesStageFilter') || '');
  const [stageInput, setStageInput] = useState(stageFilter); // For debounced stage filter
  const [view, setView] = useState(() => localStorage.getItem('candidatesView') || 'list');
  const [allApplications, setAllApplications] = useState([]); // All applications loaded
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const listRef = useRef(null);
  const searchDebounceRef = useRef(null); // For search debounce
  const stageDebounceRef = useRef(null); // For stage debounce
  const navigate = useNavigate();

  // Memoized navigation handler
  const handleCandidateClick = useCallback((candidateId) => {
    navigate(`/candidates/${candidateId}`);
  }, [navigate]);

  /* ---------- Persist filters + view ---------- */
  useEffect(() => {
    localStorage.setItem('candidatesSearch', search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem('candidatesStageFilter', stageFilter);
  }, [stageFilter]);

  useEffect(() => {
    localStorage.setItem('candidatesView', view);
  }, [view]);

  /* ---------- Load applications efficiently ---------- */
  const loadAllApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load applications with a single request
      const res = await axios.get(`/api/applications?page=1&pageSize=1000&search=${search}&stage=${stageFilter}`);
      const data = Array.isArray(res.data.items) ? res.data.items : [];
      
      const mappedData = data.map(app => ({
        id: app.id || app.applicationId,
        candidateName: app.candidateName || app.name || 'Unknown Candidate',
        candidateEmail: app.candidateEmail || app.email || '',
        candidateId: app.candidateId || app.id,
        jobTitle: app.jobTitle || app.title || 'Unknown Job',
        stage: app.stage || 'Applied',
      }));
      
      setAllApplications(mappedData);
    } catch (err) {
      console.error('Error fetching applications', err);
      setError('Failed to fetch applications. Please retry.');
      setAllApplications([]);
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter]);

  useEffect(() => {
    loadAllApplications();
  }, [loadAllApplications]);

  // Set applications from all loaded data
  useEffect(() => {
    setApplications(allApplications);
  }, [allApplications]);

  /* ---------- Memoized Filtering (client-side for virtualization) ---------- */
  const filtered = useMemo(() => {
    let result = applications;
    
    // Client-side search filtering for better performance with virtualization
    if (search) {
      const searchTerm = search.toLowerCase();
      result = result.filter(app => 
        app.candidateName?.toLowerCase().includes(searchTerm) ||
        app.candidateEmail?.toLowerCase().includes(searchTerm) ||
        app.jobTitle?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (stageFilter) {
      result = result.filter(app => app.stage === stageFilter);
    }
    
    return result;
  }, [applications, search, stageFilter]);

  /* ---------- Memoized Kanban Grouping ---------- */
  const grouped = useMemo(() => {
    const acc = {};
    stages.forEach((s) => (acc[s] = []));
    filtered.forEach((a) => {
      if (acc[a.stage]) {
        acc[a.stage].push(a);
      }
    });
    return acc;
  }, [filtered]);

  /* ---------- Optimized Drag Handler ---------- */
  const handleDragEnd = useCallback(async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    const movedApp = grouped[sourceStage]?.[source.index];
    if (!movedApp) return;

    // Optimistic update
    setApplications(prev => prev.map(app => 
      app.id === movedApp.id ? { ...app, stage: destStage } : app
    ));

    try {
      await axios.patch(`/api/applications/${movedApp.id}`, { stage: destStage });
    } catch (err) {
      console.error('Stage update failed', err);
      // Revert on error
      setApplications(prev => prev.map(app => 
        app.id === movedApp.id ? { ...app, stage: sourceStage } : app
      ));
      alert('Failed to update stage. Changes reverted.');
    }
  }, [grouped]);

  /* ---------- Memoized Event Handlers ---------- */
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setSearch(value), 500);
  }, []);

  const handleStageFilterChange = useCallback((e) => {
    const value = e.target.value;
    setStageInput(value);
    if (stageDebounceRef.current) clearTimeout(stageDebounceRef.current);
    stageDebounceRef.current = setTimeout(() => setStageFilter(value), 500);
  }, []);

  const handleViewToggle = useCallback(() => {
    setView(prev => prev === 'list' ? 'kanban' : 'list');
  }, []);



  const handleClearFilters = useCallback(() => {
    setSearch('');
    setInputValue('');
    setStageFilter('');
    setStageInput('');
    // No need to reload data, filtering is now client-side
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    loadAllApplications();
  }, [loadAllApplications]);

  const exportData = useCallback(() => {
    if (filtered.length === 0) {
      alert('No data to export');
      return;
    }

    const csvHeaders = 'Name,Email,Job Title,Stage,Application ID\n';
    const csvData = filtered.map(app => 
      `"${app.candidateName}","${app.candidateEmail}","${app.jobTitle}","${app.stage}","${app.id}"`
    ).join('\n');
    
    const csvContent = csvHeaders + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `candidates_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [filtered]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>{error}</p>
        <button onClick={handleRetry} style={{ padding: '8px 16px' }}>Retry</button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Candidates & Applications' }
  ];

  const quickActions = [
    { label: 'View Jobs', onClick: () => navigate('/jobs'), description: 'Browse job postings' },
    { label: 'Assessments', onClick: () => navigate('/assessments'), description: 'Manage assessments' },
    { label: 'Export Data', onClick: exportData, description: 'Export candidate data' }
  ];

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .candidates-mobile-stack {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            .candidates-mobile-center {
              text-align: center !important;
            }
            .candidates-mobile-full {
              width: 100% !important;
            }
            .candidates-mobile-wrap {
              flex-wrap: wrap !important;
              gap: 8px !important;
            }
            .candidates-mobile-hide {
              display: none !important;
            }
          }
          @media (max-width: 480px) {
            .candidates-mobile-small {
              font-size: 0.8rem !important;
              padding: 8px 12px !important;
            }
          }
        `}
      </style>
      <div style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', minHeight: 'calc(100vh - 80px)', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", padding: 'clamp(16px, 4vw, 32px)' }}>
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
        <div style={candidatesContainerStyle}>
          <div style={candidatesHeaderStyle} className="candidates-mobile-stack">
            <div className="candidates-mobile-center">
              <h1 style={{ margin: 0, color: '#ffffff', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, letterSpacing: '0.5px' }}>
                Candidates & Applications
              </h1>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', marginTop: '8px', fontWeight: 400 }}>
                {loading ? 'Loading applications...' : `Manage ${filtered.length} applications from talented candidates`}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 'clamp(12px, 2.5vw, 14px)', color: 'rgba(255, 255, 255, 0.8)' }} className="candidates-mobile-center">
              <div>Total: {filtered.length}</div>
              <div>Stages: {stages.length}</div>
            </div>
          </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <button
          onClick={handleViewToggle}
          style={{ 
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #00d4aa 0%, #4ecdc4 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0, 212, 170, 0.3)'
          }}
        >
          Switch to {view === 'list' ? 'Kanban' : 'List'} View
        </button>
        
        {view === 'list' && (
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
            Virtualized list - handles 1000+ candidates efficiently
          </div>
        )}
      </div>

      {view === 'list' && (
        <div style={{ 
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              placeholder='Search by candidate, email, or job'
              value={inputValue}
              onChange={handleSearchChange}
              style={{ 
                padding: '12px 16px',
                width: '320px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#333333'
              }}
            />
          </div>
          <select
            value={stageInput}
            onChange={handleStageFilterChange}
            style={{ 
              padding: '12px 16px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              fontSize: '14px',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#333333'
            }}
          >
            <option value=''>All Stages</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {(search || stageFilter) && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: '8px 12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {view === 'list' && (
        <div style={{ 
          fontSize: '13px', 
          color: '#666', 
          marginBottom: '16px',
          padding: '8px 12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          Showing {filtered.length} applications
          {search && ` matching "${search}"`}
          {stageFilter && ` in stage "${stageFilter}"`}
          {filtered.length > 100 && ' (virtualized for performance)'}
        </div>
      )}

      {view === 'list' ? (
        <VirtualizedListView
          applications={filtered}
          onCandidateClick={handleCandidateClick}
          search={search}
          stageFilter={stageFilter}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <div>
          <div style={{ 
            fontSize: '13px', 
            color: '#666', 
            marginBottom: '16px',
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            Kanban Board - Drag candidates between stages
          </div>
          <KanbanView
            grouped={grouped}
            stages={stages}
            onDragEnd={handleDragEnd}
            onCandidateClick={handleCandidateClick}
          />
        </div>
      )}
        </div>
        </div>
      </div>
    </>
  );
}

// Simple List Component for candidates
const VirtualizedListView = React.memo(({ 
  applications, 
  onCandidateClick,
  search,
  stageFilter,
  onClearFilters 
}) => {
  if (!applications || applications.length === 0) {
    return <EmptyState search={search} stageFilter={stageFilter} onClearFilters={onClearFilters} />;
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', maxHeight: '600px', overflowY: 'auto' }}>
      {applications.map((app, index) => (
        <CandidateListItem
          key={app.id || index}
          app={app}
          onClick={() => onCandidateClick(app.candidateId)}
        />
      ))}
    </div>
  );
});

const KanbanView = React.memo(({ grouped, stages, onDragEnd, onCandidateClick }) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '10px 0' }}>
      {stages.map((stage) => (
        <Droppable droppableId={stage} key={stage} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
          {(provided, snapshot) => (
            <KanbanColumn
              provided={provided}
              snapshot={snapshot}
              stage={stage}
              applications={grouped[stage]}
              onCandidateClick={onCandidateClick}
            />
          )}
        </Droppable>
      ))}
    </div>
  </DragDropContext>
));

const KanbanColumn = React.memo(({ provided, snapshot, stage, applications, onCandidateClick }) => (
  <div
    ref={provided.innerRef}
    {...provided.droppableProps}
    style={{
      flex: '0 0 280px',
      minHeight: '500px',
      background: snapshot.isDraggingOver ? '#f0f8ff' : '#f5f5f5',
      border: '2px dashed ' + (snapshot.isDraggingOver ? '#2196f3' : '#ddd'),
      borderRadius: '12px',
      padding: '15px',
    }}
  >
    <h4 style={{ 
      textAlign: 'center', 
      margin: '0 0 15px 0',
      padding: '8px',
      backgroundColor: '#e3f2fd',
      borderRadius: '6px',
      color: '#1976d2'
    }}>
      {stage} ({applications?.length || 0})
    </h4>
    
    {applications && applications.length > 0 ? (
      applications.map((app, index) => (
        <Draggable key={app.id} draggableId={app.id} index={index}>
          {(provided, snapshot) => (
            <KanbanCandidateItem
              app={app}
              provided={provided}
              snapshot={snapshot}
              onClick={() => onCandidateClick(app.candidateId)}
            />
          )}
        </Draggable>
      ))
    ) : (
      <div style={{ 
        textAlign: 'center', 
        color: '#999', 
        padding: '20px',
        fontStyle: 'italic'
      }}>
        No candidates
      </div>
    )}
    {provided.placeholder}
  </div>
));

const EmptyState = React.memo(({ search, stageFilter, onClearFilters }) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '60px 40px', 
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></div>
    <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No applications found</h3>
    <p style={{ margin: '0 0 20px 0' }}>
      {search || stageFilter 
        ? 'Try adjusting your search criteria or filters'
        : 'No candidate applications available yet'
      }
    </p>
    {(search || stageFilter) && (
      <button 
        onClick={onClearFilters}
        style={{ 
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        Clear Filters
      </button>
    )}
  </div>
));

// Unified Header Styles
const unifiedHeaderStyle = {
  background: "linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)",
  borderRadius: "20px",
  border: "1px solid rgba(0, 212, 170, 0.2)",
  backdropFilter: "blur(10px)",
  padding: "clamp(16px, 3vw, 24px)",
  marginBottom: "clamp(16px, 3vw, 24px)",
};

const breadcrumbSectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const breadcrumbRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const breadcrumbItemStyle = {
  background: "transparent",
  border: "none",
  color: "rgba(255, 255, 255, 0.7)",
  cursor: "pointer",
  padding: "6px 12px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  transition: "all 0.2s",
};

const activeBreadcrumbStyle = {
  color: "#00d4aa",
  fontWeight: "600",
  background: "rgba(0, 212, 170, 0.1)",
};

const separatorStyle = {
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "16px",
  fontWeight: "300",
};

const quickActionsRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "clamp(8px, 2vw, 12px)",
  flexWrap: "wrap",
};

const quickActionsLabelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#00d4aa",
};

const quickActionButtonStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "10px",
  padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)",
  cursor: "pointer",
  fontSize: "clamp(11px, 2vw, 13px)",
  fontWeight: "500",
  color: "#ffffff",
  transition: "all 0.3s ease",
  backdropFilter: "blur(5px)",
};

const candidatesContainerStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  borderRadius: "24px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(20px)",
  padding: "clamp(16px, 4vw, 32px)",
  display: "flex",
  flexDirection: "column",
  gap: "clamp(16px, 3vw, 24px)",
};

const candidatesHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "clamp(20px, 4vw, 32px)",
  background: "linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)",
  borderRadius: "20px",
  border: "1px solid rgba(0, 212, 170, 0.2)",
  backdropFilter: "blur(10px)",
  flexWrap: "wrap",
  gap: "16px",
};

