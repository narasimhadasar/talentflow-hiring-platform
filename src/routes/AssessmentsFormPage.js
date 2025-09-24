import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AssessmentForm from './AssessmentsForm';

export default function AssessmentFormPage() {
  const { applicationId } = useParams();
  const [jobId, setJobId] = useState(null);
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    axios.get(`/api/applications/${applicationId}`)
      .then(res => {
        const app = res.data;
        setJobId(app.jobId);
        axios.get(`/api/assessments/${app.jobId}`)
          .then(res => setSchema(res.data));
      });
  }, [applicationId]);

  if (!schema) return <div>Loading...</div>;

  return <AssessmentForm schema={schema} preview={false} jobId={jobId} applicationId={applicationId} />;
}