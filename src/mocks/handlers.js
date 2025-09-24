import { http, HttpResponse } from 'msw';
import { db } from '../storage/db';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4

/* Helpers */
function delay() {
  return Promise.resolve(); // No delay for instant loading
}

function maybeFail() {
  return false; // Disabled for stability
}

// Helper to ensure database is ready
async function ensureDbReady() {
  // Removed delays for instant loading
  return Promise.resolve();
}

export const handlers = [
  /* ---------------- JOBS ---------------- */
  // Handle both /api/jobs and /jobs routes
  http.get('/api/jobs', async ({ request }) => {
    await delay();
    // Temporarily disable random failures for stability
    // if (maybeFail()) return new HttpResponse(null, { status: 500 });

    await ensureDbReady();

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const tagsParam = url.searchParams.get('tags') || '';
    const tags = tagsParam
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const sort = url.searchParams.get('sort') || 'order';

    let jobs = await db.jobs.toArray();

    if (search) {
      jobs = jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (status) {
      jobs = jobs.filter((j) => j.status === status);
    }
    if (tags.length > 0) {
      jobs = jobs.filter((j) => j.tags.some((tag) => tags.includes(tag.toLowerCase())));
    }

    if (sort === 'title') {
      jobs.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      jobs.sort((a, b) => a.order - b.order);
    }

    const total = jobs.length;
    const start = (page - 1) * pageSize;
    const items = jobs.slice(start, start + pageSize);

    return HttpResponse.json({ items, total });
  }),
  
  http.get('/jobs', async ({ request }) => {
    await delay();
    // Temporarily disable random failures for stability
    // if (maybeFail()) return new HttpResponse(null, { status: 500 });

    await ensureDbReady();

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const tagsParam = url.searchParams.get('tags') || '';
    const tags = tagsParam
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const sort = url.searchParams.get('sort') || 'order';

    let jobs = await db.jobs.toArray();

    if (search) {
      jobs = jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (status) {
      jobs = jobs.filter((j) => j.status === status);
    }
    if (tags.length > 0) {
      jobs = jobs.filter((j) => j.tags.some((tag) => tags.includes(tag.toLowerCase())));
    }

    if (sort === 'title') {
      jobs.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      jobs.sort((a, b) => a.order - b.order);
    }

    const total = jobs.length;
    const start = (page - 1) * pageSize;
    const items = jobs.slice(start, start + pageSize);

    return HttpResponse.json({ items, total });
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay();
    // Disabled for stability
    // if (maybeFail()) return HttpResponse.json({ message: 'Random failure' }, { status: 500 });

    const body = await request.json();
    if (!body.title) {
      return HttpResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    }

    const existingSlug = await db.jobs.where('slug').equals(body.slug).first();
    if (existingSlug) {
      return HttpResponse.json({ message: 'Slug must be unique' }, { status: 400 });
    }

    body.status = body.status || 'active';
    body.tags = body.tags || [];
    const maxOrder = (await db.jobs.orderBy('order').last())?.order || 0;
    body.order = body.order || maxOrder + 1;
    body.id = uuidv4(); // Ensure UUID is set

    try {
      await db.jobs.add(body);
      const created = await db.jobs.get(body.id);
      console.log('Created job:', created);
      return HttpResponse.json(created, { status: 201 });
    } catch (error) {
      console.error('Error creating job:', error);
      return HttpResponse.json({ message: 'Creation failed' }, { status: 500 });
    }
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await ensureDbReady();

    const jobId = params.id; // Keep as string since UUIDs are strings
    console.log('Looking for job with ID:', jobId);
    
    const job = await db.jobs.get(jobId);
    if (!job) {
      // Debug: log available job IDs
      const allJobs = await db.jobs.toArray();
      console.log('Available job IDs:', allJobs.map(j => j.id).slice(0, 5));
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    const apps = await db.applications.where('jobId').equals(jobId).toArray();
    const candidates = await db.candidates.toArray();

    const jobCandidates = apps
      .map((a) => {
        const candidate = candidates.find((c) => c.id === a.candidateId);
        return candidate ? { ...candidate, stage: a.stage, applicationId: a.id } : null;
      })
      .filter(Boolean);

    return HttpResponse.json({ ...job, candidates: jobCandidates });
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await delay();
    // Disabled for stability
    // if (maybeFail()) return HttpResponse.json({ message: 'Random failure' }, { status: 500 });

    const { id } = params;
    const body = await request.json();
    
    console.log('PATCH job ID:', id, 'Body:', body);

    // Check if job exists first
    const existingJob = await db.jobs.get(id);
    if (!existingJob) {
      console.log('Job not found for ID:', id);
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    if (body.slug) {
      const existingSlug = await db.jobs.where('slug').equals(body.slug).first();
      if (existingSlug && existingSlug.id !== id) {
        return HttpResponse.json({ message: 'Slug must be unique' }, { status: 400 });
      }
    }

    try {
      await db.jobs.update(id, body);
      const updated = await db.jobs.get(id);
      console.log('Updated job:', updated);
      return HttpResponse.json(updated, { status: 200 });
    } catch (error) {
      console.error('Error updating job:', error);
      return HttpResponse.json({ message: 'Update failed' }, { status: 500 });
    }
  }),

  http.put('/api/jobs/:id', async ({ params, request }) => {
    await delay();
    const { id } = params;
    const body = await request.json();
    
    console.log('PUT job ID:', id, 'Body:', body);

    const existingJob = await db.jobs.get(id);
    if (!existingJob) {
      console.log('Job not found for ID:', id);
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    try {
      await db.jobs.update(id, body);
      const updated = await db.jobs.get(id);
      console.log('Updated job:', updated);
      return HttpResponse.json(updated, { status: 200 });
    } catch (error) {
      console.error('Error updating job:', error);
      return HttpResponse.json({ message: 'Update failed' }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await delay();
    if (maybeFail()) return HttpResponse.json({ message: 'Random reorder failure' }, { status: 500 });

    const { id } = params;
    const { fromOrder, toOrder } = await request.json();
    const job = await db.jobs.get(id);

    if (!job || job.order !== fromOrder) {
      return HttpResponse.json({ message: 'Invalid fromOrder' }, { status: 400 });
    }

    const allJobs = await db.jobs.toArray();
    if (fromOrder < toOrder) {
      const shiftJobs = allJobs.filter(
        (j) => j.id !== job.id && j.order > fromOrder && j.order <= toOrder
      );
      for (const sj of shiftJobs) {
        await db.jobs.update(sj.id, { order: sj.order - 1 });
      }
    } else {
      const shiftJobs = allJobs.filter(
        (j) => j.id !== job.id && j.order >= toOrder && j.order < fromOrder
      );
      for (const sj of shiftJobs) {
        await db.jobs.update(sj.id, { order: sj.order + 1 });
      }
    }
    await db.jobs.update(job.id, { order: toOrder });
    return HttpResponse.json({ fromOrder, toOrder }, { status: 200 });
  }),

  /* ---------------- CANDIDATES ---------------- */
  http.get('/api/candidates', async () => {
    await ensureDbReady();
    const candidates = await db.candidates.toArray();
    return HttpResponse.json(candidates);
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await ensureDbReady();

    const candidate = await db.candidates.get(params.id);
    if (!candidate) return HttpResponse.json({ message: 'Not found' }, { status: 404 });

    const apps = await db.applications.where('candidateId').equals(candidate.id).toArray();
    const jobs = await db.jobs.toArray();

    const jobsApplied = apps
      .map((a) => {
        const job = jobs.find((j) => j.id === a.jobId);
        return job ? { ...job, stage: a.stage, applicationId: a.id } : null;
      })
      .filter(Boolean);

    return HttpResponse.json({ ...candidate, jobs: jobsApplied });
  }),

  /* ---------------- APPLICATIONS ---------------- */
  http.get('/api/applications', async ({ request }) => {
    await delay();
    // Disabled for stability
    // if (maybeFail()) return new HttpResponse(null, { status: 500 });

    await ensureDbReady();

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '100', 10);

    let apps = await db.applications.toArray();
    console.log('Raw applications count:', apps.length, 'Sample:', apps.slice(0, 2));
    const candidates = await db.candidates.toArray();
    console.log('Candidates count:', candidates.length);
    const jobs = await db.jobs.toArray();
    console.log('Jobs count:', jobs.length);

    let enriched = apps
      .map((a) => {
        const candidate = candidates.find((c) => c.id === a.candidateId);
        const job = jobs.find((j) => j.id === a.jobId);
        return {
          ...a,
          candidateName: candidate?.name,
          candidateEmail: candidate?.email,
          jobTitle: job?.title,
        };
      })
      .filter((app) => app.candidateName && app.jobTitle);

    console.log('Enriched count after filter:', enriched.length, 'Sample:', enriched.slice(0, 2));

    if (search) {
      const searchTerm = search.toLowerCase();
      enriched = enriched.filter(
        (a) =>
          a.candidateName?.toLowerCase().includes(searchTerm) ||
          a.candidateEmail?.toLowerCase().includes(searchTerm) ||
          a.jobTitle?.toLowerCase().includes(searchTerm)
      );
    }

    if (stage) {
      enriched = enriched.filter((a) => a.stage === stage);
    }

    const total = enriched.length;
    const start = (page - 1) * pageSize;
    const items = enriched.slice(start, start + pageSize);

    console.log('Final items count:', items.length, 'Total:', total);
    return HttpResponse.json({ items, total });
  }),

  http.patch('/api/applications/:id', async ({ params, request }) => {
    await delay();
    // Disabled for stability
    // if (maybeFail()) return HttpResponse.json({ message: 'Random failure' }, { status: 500 });

    await ensureDbReady();

    const { id } = params;
    const body = await request.json();
    
    console.log('PATCH application ID:', id, 'Body:', body);

    let app = await db.applications.get(id);
    if (!app) {
      console.log('Application not found for ID:', id);
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    try {
      app = { ...app, ...body };
      await db.applications.put(app);
      console.log('Updated application:', app);
      return HttpResponse.json(app, { status: 200 });
    } catch (error) {
      console.error('Error updating application:', error);
      return HttpResponse.json({ message: 'Update failed' }, { status: 500 });
    }
  }),
  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await delay();
    await ensureDbReady();
    const { id } = params;
    const body = await request.json();
    console.log('PATCH candidate ID:', id, 'Body:', body);
    let candidate = await db.candidates.get(id);
    if (!candidate) {
      return HttpResponse.json({ message: 'Candidate not found' }, { status: 404 });
    }
    try {
      candidate = { ...candidate, ...body };
      await db.candidates.put(candidate);
      return HttpResponse.json(candidate, { status: 200 });
    } catch (error) {
      return HttpResponse.json({ message: 'Update failed' }, { status: 500 });
    }
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
  await ensureDbReady();
  const candidate = await db.candidates.get(params.id);
  if (!candidate) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  const apps = await db.applications.where('candidateId').equals(candidate.id).toArray();
  const jobs = await db.jobs.toArray();
  const jobsApplied = apps
    .map((a) => {
      const job = jobs.find((j) => j.id === a.jobId);
      return job ? { ...job, stage: a.stage, applicationId: a.id } : null;
    })
    .filter(Boolean);
  return HttpResponse.json({ ...candidate, jobs: jobsApplied });
}),

  /* ---------------- STATS ---------------- */
  http.get('/api/stats', async () => {
    await ensureDbReady();

    const jobs = await db.jobs.toArray();
    const candidates = await db.candidates.toArray();
    const applications = await db.applications.toArray();

    const stats = {
      totalJobs: jobs.length,
      totalCandidates: candidates.length,
      totalApplications: applications.length,
      jobsByStatus: {
        active: jobs.filter((j) => j.status === 'active').length,
        archived: jobs.filter((j) => j.status === 'archived').length,
      },
      applicationsByStage: {
        Applied: applications.filter((a) => a.stage === 'Applied').length,
        Screening: applications.filter((a) => a.stage === 'Screening').length,
        Interview: applications.filter((a) => a.stage === 'Interview').length,
        Offer: applications.filter((a) => a.stage === 'Offer').length,
        Hired: applications.filter((a) => a.stage === 'Hired').length,
      },
    };

    return HttpResponse.json(stats);
  }),

  /* ---------------- ASSESSMENTS ---------------- */
  // GET /api/assessments/:jobId (remove duplicate)
http.get('/api/assessments/:jobId', async ({ params }) => {
  console.log('MSW intercepted request for jobId:', params.jobId);
  await delay();
  if (maybeFail()) return new HttpResponse(null, { status: 500 });
  await ensureDbReady();
  const assessment = await db.assessments.where('jobId').equals(params.jobId).first();
  if (!assessment) {
    console.log('No assessment found for jobId:', params.jobId);
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }
  console.log('Found assessment:', assessment);
  return HttpResponse.json(assessment);
}),
  // PUT /api/assessments/:jobId
  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    await delay();
    if (maybeFail()) return new HttpResponse(null, { status: 500 });

    const { jobId } = params;
    const body = await request.json();

    await ensureDbReady();
    let existing = await db.assessments.where('jobId').equals(jobId).first();
    if (existing) {
      await db.assessments.update(existing.id, { schema: body.schema });
      existing = await db.assessments.get(existing.id);
      return HttpResponse.json(existing, { status: 200 });
    }

    const newAssessment = { id: uuidv4(), jobId, schema: body.schema };
    await db.assessments.add(newAssessment);
    return HttpResponse.json(newAssessment, { status: 201 });
  }),

  // POST /api/assessments/:jobId
  // In src/mocks/handlers.js
http.post('/api/assessments/:jobId', async ({ params, request }) => {
  await delay();
  if (maybeFail()) return new HttpResponse(null, { status: 500 });
  const { jobId } = params;
  const body = await request.json();
  await ensureDbReady();
  let existing = await db.assessments.where('jobId').equals(jobId).first();
  if (existing) {
    // Optionally update the existing assessment instead of failing
    await db.assessments.update(existing.id, { schema: body.schema });
    existing = await db.assessments.get(existing.id);
    return HttpResponse.json(existing, { status: 200 });
  }
  const newAssessment = { id: uuidv4(), jobId, schema: body.schema };
  await db.assessments.add(newAssessment);
  return HttpResponse.json(newAssessment, { status: 201 });
}),

  // POST /api/assessments/:jobId/submit
  // PATCH candidate assessment status
http.post("/api/assessments/:jobId/submit", async ({ params, request }) => {
  const { jobId } = params;
  const body = await request.json(); // { candidateId, responses }

  const { candidateId, responses } = body;

  // Save submission into applications (job-candidate link)
  let app = await db.applications
    .where({ candidateId, jobId })
    .first();

  if (!app) {
    return HttpResponse.json({ message: "Application not found" }, { status: 404 });
  }

  // Mark as completed
  const submission = {
    submittedAt: new Date().toISOString(),
    responses,
  };

  app = { ...app, assessmentSubmission: submission, assessmentStatus: "submitted" };

  await db.applications.update(app.id, app);

  return HttpResponse.json({ message: "Submitted", app }, { status: 200 });
})
,

  /* ---------------- ASSIGNMENTS ---------------- */
  http.get('/api/assignments', async ({ request }) => {
    await delay();
    if (maybeFail()) return new HttpResponse(null, { status: 500 });

    await ensureDbReady();
    const url = new URL(request.url);
    const applicationId = url.searchParams.get('applicationId');

    let assignments = await db.assignments.toArray();
    if (applicationId) {
      assignments = assignments.filter((a) => a.applicationId === applicationId);
    }

    return HttpResponse.json(assignments);
  }),

  /* ---------------- ASSESSMENTS ROUTE (without /api prefix) ---------------- */
  http.get('/assessments', async () => {
    await ensureDbReady();
    const assessments = await db.assessments.toArray();
    return HttpResponse.json(assessments);
  }),

  /* ---------------- CANDIDATES ROUTE (without /api prefix) ---------------- */
  http.get('/candidates', async () => {
    await ensureDbReady();
    const candidates = await db.candidates.toArray();
    return HttpResponse.json(candidates);
  }),

  /* ---------------- JOBS ROUTE (without /api prefix) ---------------- */
  http.get('/jobs/:id', async ({ params }) => {
    await ensureDbReady();
    const jobId = parseInt(params.id) || params.id;
    const job = await db.jobs.get(jobId);
    if (!job) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const apps = await db.applications.where('jobId').equals(jobId).toArray();
    const candidates = await db.candidates.toArray();
    const jobCandidates = apps
      .map((a) => {
        const candidate = candidates.find((c) => c.id === a.candidateId);
        return candidate ? { ...candidate, stage: a.stage, applicationId: a.id } : null;
      })
      .filter(Boolean);
    return HttpResponse.json({ ...job, candidates: jobCandidates });
  }),
];