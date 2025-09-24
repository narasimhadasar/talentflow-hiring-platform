import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./routes/Home";
import JobsPage from "./routes/Jobs";
import CandidatesPage from "./routes/Candidates";
import CandidateProfile from "./routes/CandidateProfile";
import ErrorBoundary from "./components/ErrorBoundary";

import { initDb } from "./storage/db";
import CandidateAssessmentPage from "./routes/CandidateAssessmentPage";
import JobDetailPage from "./routes/JobDetail";
import AssessmentsPage from "./routes/Assessments";
import AssessmentBuilder from "./routes/AssessmentsBuilder";
import TakeAssessmentPage from "./routes/TakeAssessment";

function App() {
  useEffect(() => {
    initDb().catch((error) => {
      console.error('App initialization failed:', error);
      alert('Database initialization failed. Please close other tabs, refresh, or clear browser storage.');
    });
  }, []);
  
  return (
    <ErrorBoundary>
      <Router>
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs/" element={<JobsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailPage/>}/>
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/:id" element={<CandidateProfile />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/assessments/:jobId" element={<AssessmentBuilder />} />
            <Route path="/assessment/:jobId/take" element={<TakeAssessmentPage />} />
            <Route path="/candidates/:candidateId/assessments/:jobId" element={<CandidateAssessmentPage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
