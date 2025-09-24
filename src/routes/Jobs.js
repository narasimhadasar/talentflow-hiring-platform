import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import JobFormModal from "../views/JobFormModal";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagsFilter, setTagsFilter] = useState("");
  const [sort, setSort] = useState("order");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [filterErrors, setFilterErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, tagsFilter, sort]);

  async function fetchJobs() {
    setLoading(true);
    setError(null);
    setFilterErrors({});

    // Validate filter inputs
    const errors = {};
    if (search && search.length > 100) {
      errors.search = "Search term must not exceed 100 characters.";
    }
    if (tagsFilter && !/^[a-zA-Z0-9,\s-]+$/.test(tagsFilter)) {
      errors.tagsFilter = "Tags must contain only letters, numbers, commas, hyphens, and spaces.";
    }

    if (Object.keys(errors).length > 0) {
      setFilterErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/jobs", {
        params: { page, pageSize: 10, search, status: statusFilter, tags: tagsFilter, sort },
      });
      setJobs(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError("Failed to load jobs. Please try again.");
    }
    setLoading(false);
  }

  async function toggleArchive(job) {
    const newStatus = job.status === "active" ? "archived" : "active";
    const previousJobs = [...jobs];

    setJobs(jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j));

    try {
      await axios.patch(`/api/jobs/${job.id}`, { status: newStatus });
      fetchJobs();
    } catch (err) {
      setJobs(previousJobs);
      alert("Failed to update job status. This might be a simulated error—try again.");
    }
  }

  async function handleDragEnd(result) {
    const { destination, source, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const newJobs = Array.from(jobs);
    const [movedJob] = newJobs.splice(source.index, 1);
    newJobs.splice(destination.index, 0, movedJob);

    // Update order values based on new positions
    const updatedJobs = newJobs.map((job, index) => ({
      ...job,
      order: index + 1
    }));

    setJobs(updatedJobs);

    try {
      // Update all job orders in the backend
      await Promise.all(
        updatedJobs.map(job => 
          axios.patch(`/api/jobs/${job.id}`, { order: job.order })
        )
      );
    } catch (err) {
      console.error('Reorder failed:', err);
      setJobs(jobs); // Revert on error
      alert("Reorder failed. Please try again.");
    }
  }

  const handleShowForm = () => {
    if (!editJob) {
      setShowConfirm(true);
    } else {
      setShowForm(true);
    }
  };

  const handleConfirm = (confirmed) => {
    setShowConfirm(false);
    if (confirmed) {
      setShowForm(true);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Jobs Management' }
  ];

  const quickActions = [
    { label: 'New Job', onClick: () => setShowForm(true), description: 'Create a new job posting' },
    { label: 'View Candidates', onClick: () => navigate('/candidates'), description: 'Browse all candidates' },
    { label: 'Assessments', onClick: () => navigate('/assessments'), description: 'Manage assessments' }
  ];

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .jobs-mobile-stack {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            .jobs-mobile-center {
              text-align: center !important;
            }
            .jobs-mobile-full {
              width: 100% !important;
            }
            .jobs-mobile-hide {
              display: none !important;
            }
            .jobs-mobile-wrap {
              flex-wrap: wrap !important;
              gap: 8px !important;
            }
          }
          @media (max-width: 480px) {
            .jobs-mobile-small {
              font-size: 0.8rem !important;
              padding: 8px 12px !important;
            }
          }
        `}
      </style>
      <div style={jobsPageBgStyle}>
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

        <div style={jobsContainerStyle}>

        <div style={jobsHeaderStyle} className="jobs-mobile-stack">
          <div className="jobs-mobile-center">
            <h1 style={{ margin: 0, color: "#ffffff", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.2rem)", letterSpacing: "0.5px" }}>
              Jobs Management
            </h1>
            <div style={{ color: "rgba(255, 255, 255, 0.7)", fontWeight: 400, fontSize: "clamp(0.9rem, 2.5vw, 1rem)", marginTop: 8 }}>
              Create, manage, and track all your job postings • {total} total jobs
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', alignItems: 'center' }} className="jobs-mobile-wrap jobs-mobile-full">
            <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: 'rgba(255, 255, 255, 0.8)', textAlign: 'right' }} className="jobs-mobile-center">
              <div>Active: {jobs.filter(j => j.status === 'active').length}</div>
              <div>Archived: {jobs.filter(j => j.status === 'archived').length}</div>
            </div>
            <button style={primaryBtnStyle} onClick={() => setShowForm(true)} className="jobs-mobile-full">
              New Job
            </button>
          </div>
        </div>

        <div style={filtersBarStyle}>
          <div style={filterGroupStyle}>
            <label style={filterLabelStyle}>Search Job Title</label>
            <input
              style={inputStyle}
              placeholder="Enter job title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#00d4aa'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 212, 170, 0.3)'}
            />
            {filterErrors.search && <span style={errorTextStyle}>{filterErrors.search}</span>}
          </div>

          <div style={filterGroupStyle}>
            <label style={filterLabelStyle}>Status Filter</label>
            <select
              style={selectStyle}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#00d4aa'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 212, 170, 0.3)'}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div style={filterGroupStyle}>
            <label style={filterLabelStyle}>Filter by Tags</label>
            <input
              style={inputStyle}
              placeholder="Enter tags (comma separated)..."
              value={tagsFilter}
              onChange={(e) => setTagsFilter(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#00d4aa'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 212, 170, 0.3)'}
            />
            {filterErrors.tagsFilter && <span style={errorTextStyle}>{filterErrors.tagsFilter}</span>}
          </div>

          <div style={filterGroupStyle}>
            <label style={filterLabelStyle}>Sort Order</label>
            <select
              style={selectStyle}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#00d4aa'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 212, 170, 0.3)'}
            >
              <option value="order">Sort by Order</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={errorBoxStyle}>
            {error}{" "}
            <button onClick={fetchJobs} style={retryBtnStyle}>
              Retry
            </button>
          </div>
        )}

        {loading && <p style={{ color: "#00d4aa", fontWeight: 500 }}>Loading...</p>}

        {!loading && !error && (
          <div style={jobsListCardStyle}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="jobs" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      minHeight: "200px",
                      background: snapshot.isDraggingOver ? "rgba(0, 212, 170, 0.1)" : "transparent",
                      padding: "8px",
                      borderRadius: "10px",
                      transition: "background 0.2s",
                    }}
                  >
                    {jobs.map((job, index) => (
                      <Draggable
                        key={job.id}
                        draggableId={job.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...jobCardStyle,
                              background: snapshot.isDragging ? "rgba(0, 212, 170, 0.2)" : "rgba(255, 255, 255, 0.08)",
                              boxShadow: snapshot.isDragging ? "0 8px 32px rgba(0, 212, 170, 0.3)" : "0 4px 20px rgba(0, 0, 0, 0.1)",
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Link to={`/jobs/${job.id}`} style={jobTitleLinkStyle}>
                                <strong>{job.title}</strong>
                              </Link>
                              <span style={{
                                background: job.status === "active" ? "rgba(0, 212, 170, 0.2)" : "rgba(255, 107, 107, 0.2)",
                                color: job.status === "active" ? "#00d4aa" : "#ff6b6b",
                                border: `1px solid ${job.status === "active" ? "rgba(0, 212, 170, 0.4)" : "rgba(255, 107, 107, 0.4)"}`,
                                borderRadius: "12px",
                                padding: "6px 12px",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                marginLeft: 10,
                                backdropFilter: "blur(5px)",
                              }}>
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </span>
                            </div>
                            <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.95rem", margin: "8px 0", padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
                                <span><span style={{ color: "#00d4aa", fontWeight: "600" }}>Slug:</span> <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>{job.slug}</span></span>
                                <span><span style={{ color: "#00d4aa", fontWeight: "600" }}>Order:</span> <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>{job.order}</span></span>
                                <span><span style={{ color: "#00d4aa", fontWeight: "600" }}>Tags:</span> <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>{(job.tags || []).join(", ") || "None"}</span></span>
                              </div>
                            </div>
                            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                              <button
                                style={editBtnStyle}
                                onClick={() => {
                                  setEditJob(job);
                                  setShowForm(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                style={archiveBtnStyle}
                                onClick={() => toggleArchive(job)}
                              >
                                {job.status === "active" ? "Archive" : "Unarchive"}
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        <div style={paginationStyle}>
          <button
            style={pageBtnStyle}
            disabled={loading || page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span style={{ margin: "0 18px", fontWeight: 600, color: "#00d4aa" }}>Page {page}</span>
          <button
            style={pageBtnStyle}
            disabled={loading || (page * 10 >= total)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>

        {showForm && (
          <JobFormModal
            onClose={() => {
              setShowForm(false);
              setEditJob(null);
            }}
            onSaved={fetchJobs}
            job={editJob}
          />
        )}

        {showConfirm && (
          <div style={confirmModalStyle}>
            <p>Are you sure you want to create a new job?</p>
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <button style={primaryBtnStyle} onClick={() => handleConfirm(true)}>Yes</button>
              <button style={archiveBtnStyle} onClick={() => handleConfirm(false)}>No</button>
            </div>
          </div>
        )}
        </div>
        </div>
      </div>
    </>
  );
}

// Modern Dark Theme Styles
const jobsPageBgStyle = {
  minHeight: "calc(100vh - 80px)",
  background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
  padding: "clamp(16px, 4vw, 32px)",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const jobsContainerStyle = {
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

const jobsHeaderStyle = {
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

const filtersBarStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))",
  gap: "clamp(16px, 4vw, 24px)",
  alignItems: "start",
  padding: "clamp(20px, 4vw, 32px)",
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(10px)",
};

const inputStyle = {
  padding: "clamp(12px, 3vw, 16px)",
  borderRadius: "12px",
  border: "2px solid rgba(0, 212, 170, 0.3)",
  fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
  outline: "none",
  width: "100%",
  background: "rgba(255, 255, 255, 0.95)",
  color: "#2c3e50",
  transition: "all 0.3s ease",
  fontWeight: "500",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

const selectStyle = {
  padding: "clamp(12px, 3vw, 16px)",
  borderRadius: "12px",
  border: "2px solid rgba(0, 212, 170, 0.3)",
  fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
  outline: "none",
  width: "100%",
  background: "rgba(255, 255, 255, 0.95)",
  color: "#2c3e50",
  transition: "all 0.3s ease",
  fontWeight: "500",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

const errorTextStyle = {
  color: "#ff6b6b",
  marginLeft: "10px",
  fontSize: "0.95rem",
};

const errorBoxStyle = {
  color: "#ffffff",
  background: "rgba(255, 107, 107, 0.2)",
  border: "1px solid #ff6b6b",
  padding: "16px 20px",
  borderRadius: "12px",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const retryBtnStyle = {
  background: "#fff",
  color: "#d32f2f",
  border: "1px solid #fff",
  borderRadius: "6px",
  padding: "4px 12px",
  cursor: "pointer",
  fontWeight: 600,
};

const jobsListCardStyle = {
  background: "rgba(255, 255, 255, 0.02)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  padding: "clamp(16px, 3vw, 24px)",
  minHeight: "300px",
};

const jobCardStyle = {
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: "16px",
  padding: "clamp(16px, 3vw, 24px)",
  marginBottom: "clamp(12px, 2vw, 16px)",
  background: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease",
  display: "flex",
  flexDirection: "column",
  gap: "clamp(8px, 2vw, 12px)",
};

const jobTitleLinkStyle = {
  color: "#00d4aa",
  textDecoration: "none",
  fontSize: "clamp(1rem, 3vw, 1.2rem)",
  fontWeight: 700,
  letterSpacing: "0.5px",
};

const editBtnStyle = {
  background: "linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%)",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  padding: "10px 20px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(78, 205, 196, 0.3)",
};

const archiveBtnStyle = {
  background: "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  padding: "10px 20px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
};

const primaryBtnStyle = {
  background: "linear-gradient(135deg, #00d4aa 0%, #4ecdc4 100%)",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  padding: "clamp(10px, 2vw, 14px) clamp(20px, 4vw, 32px)",
  fontWeight: 700,
  fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
  cursor: "pointer",
  boxShadow: "0 8px 25px rgba(0, 212, 170, 0.3)",
  letterSpacing: "0.5px",
  transition: "all 0.3s ease",
};

const paginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "18px",
  gap: "10px",
};

const pageBtnStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  color: "#ffffff",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "10px",
  padding: "10px 20px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "1rem",
  transition: "all 0.3s ease",
};

const confirmModalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "#fff",
  padding: "28px 36px",
  borderRadius: "14px",
  boxShadow: "0 4px 24px rgba(25,118,210,0.13)",
  zIndex: 1000,
  minWidth: "320px",
  textAlign: "center",
};

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

const filterGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const filterLabelStyle = {
  fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
  fontWeight: "600",
  color: "#00d4aa",
  marginBottom: "4px",
  letterSpacing: "0.5px",
};