import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

// Only simulate failures in development
const SIMULATE_FAILURES = process.env.NODE_ENV === 'development';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delay(ms) {
  return Promise.resolve(); // No delay for instant loading
}

function maybeFail(rate = 0.075) {
  return false; // Disabled for better performance
}

async function withRetry(operation, maxRetries = 3, delayMs = 0) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.warn(`Attempt ${attempt} failed, retrying...`);
    }
  }
}

// Validate database object and stores
function validateDatabase(db) {
  if (!db) {
    throw new Error('Database object is undefined');
  }

  const requiredStores = ['jobs', 'candidates', 'assessments', 'applications', 'assignments'];
  const missingStores = requiredStores.filter((store) => !db[store]);

  if (missingStores.length > 0) {
    throw new Error(`Missing database stores: ${missingStores.join(', ')}`);
  }

  // Check if methods exist
  requiredStores.forEach((store) => {
    if (!db[store].bulkAdd) {
      throw new Error(`Store ${store} missing bulkAdd method`);
    }
    if (!db[store].clear) {
      throw new Error(`Store ${store} missing clear method`);
    }
  });
}

export async function seedDataIfNeeded(db) {
  console.log('Starting seeding process...');

  try {
    // Validate database structure first
    validateDatabase(db);
    console.log('Database structure validated');

    // Clear all stores
    await db.jobs.clear();
    await db.candidates.clear();
    await db.assessments.clear();
    await db.applications.clear();
    await db.assignments.clear();
    console.log('Cleared all stores');

    /* ---------------- JOBS ---------------- */
    const jobs = Array.from({ length: 25 }).map((_, i) => {
      const title = faker.person.jobTitle();
      const slug =
        title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '') + `-${i + 1}`;
      const status = i % 5 === 0 ? 'archived' : 'active';
      const tags = [
        faker.commerce.product(),
        faker.location.city(),
        ['full-time', 'part-time', 'remote', 'contract'][randomInt(0, 3)],
      ].map((tag) => tag.toLowerCase().replace(/\s+/g, '-'));
      const order = i;
      return { id: uuidv4(), title, slug, status, tags, order };
    });

    await withRetry(async () => {
      await db.jobs.bulkAdd(jobs);
    });
    console.log('Seeded jobs:', jobs.length);

    /* ---------------- CANDIDATES ---------------- */
    const candidates = Array.from({ length: 1000 }).map(() => {
      const name = faker.person.fullName();
      const email = faker.internet.email({ firstName: name.split(' ')[0] });
      return {
        id: uuidv4(),
        name,
        email,
        phone: faker.phone.number(),
        location: faker.location.city() + ', ' + faker.location.state(),
        appliedDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
        overallStatus: ['active', 'inactive', 'hired'][randomInt(0, 2)],
        timeline: [],
        notes: [],
      };
    });

    // Process candidates in batches
    const CANDIDATE_BATCH_SIZE = 50;
    for (let i = 0; i < candidates.length; i += CANDIDATE_BATCH_SIZE) {
      const batch = candidates.slice(i, i + CANDIDATE_BATCH_SIZE);
      await withRetry(async () => {
        await db.candidates.bulkAdd(batch);
      });
    }
    console.log('Seeded candidates:', candidates.length);

    /* ---------------- APPLICATIONS ---------------- */
    const applications = [];
    candidates.forEach((c) => {
      const numApplications = randomInt(1, 3);
      const appliedJobs = new Set();
      
      for (let i = 0; i < numApplications; i++) {
        let job;
        let attempts = 0;
        
        do {
          job = jobs[randomInt(0, jobs.length - 1)];
          attempts++;
        } while (appliedJobs.has(job.id) && attempts < 10);
        
        appliedJobs.add(job.id);
        
        const stage = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"][randomInt(0, 5)];
        const assessmentStatusOptions = ['not-started', 'in-progress', 'submitted'];
        const assessmentStatus = Math.random() > 0.7 ? assessmentStatusOptions[randomInt(0, 2)] : 'not-started';
        
        const application = {
          id: uuidv4(),
          candidateId: c.id,
          jobId: job.id,
          stage,
          candidateName: c.name,
          candidateEmail: c.email,
          jobTitle: job.title,
          assessmentStatus: assessmentStatus,
        };

        if (assessmentStatus === 'submitted') {
          application.assessmentSubmission = {
            submittedAt: faker.date.recent({ days: 30 }).toISOString(),
            responses: {
              question_1: "Sample response for question 1",
              question_2: ["Option A", "Option C"],
              question_3: 85,
            }
          };
        } else if (assessmentStatus === 'in-progress') {
          application.assessmentSubmission = {
            startedAt: faker.date.recent({ days: 7 }).toISOString(),
            responses: {
              question_1: "Partial response for question 1",
            }
          };
        }

        applications.push(application);
      }
    });

    // Process applications in batches
    const APPLICATION_BATCH_SIZE = 100;
    for (let i = 0; i < applications.length; i += APPLICATION_BATCH_SIZE) {
      const batch = applications.slice(i, i + APPLICATION_BATCH_SIZE);
      await withRetry(async () => {
        await db.applications.bulkAdd(batch);
      });
    }
    console.log('Seeded applications:', applications.length);

    /* ---------------- ASSIGNMENTS ---------------- */
    const assignments = [];
    
    // Create assignments for a subset of applications
    const applicationsForAssignments = applications.filter(app => 
      ['Screening', 'Interview', 'Offer'].includes(app.stage)
    ).slice(0, 30); // Limit to 30 assignments
    
    applicationsForAssignments.forEach((application) => {
      const assignmentTypes = [
        'Technical Screening',
        'Code Review',
        'System Design',
        'Behavioral Interview',
        'Technical Interview',
        'Cultural Fit Assessment'
      ];
      
      const assignmentStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
      const priorities = ['low', 'medium', 'high', 'urgent'];
      
      const numAssignments = randomInt(1, 2); // 1-2 assignments per application
      
      for (let i = 0; i < numAssignments; i++) {
        const dueDate = faker.date.future({ days: 30 });
        const createdAt = faker.date.past({ days: 10 });
        
        const assignment = {
          id: uuidv4(),
          applicationId: application.id,
          candidateId: application.candidateId,
          jobId: application.jobId,
          title: `${assignmentTypes[randomInt(0, assignmentTypes.length - 1)]} - ${application.jobTitle}`,
          description: faker.lorem.paragraph(),
          type: assignmentTypes[randomInt(0, assignmentTypes.length - 1)],
          status: assignmentStatuses[randomInt(0, assignmentStatuses.length - 1)],
          priority: priorities[randomInt(0, priorities.length - 1)],
          dueDate: dueDate.toISOString(),
          createdAt: createdAt.toISOString(),
          updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
          assignedTo: ['recruiter@company.com', 'hiringmanager@company.com', 'techlead@company.com'][randomInt(0, 2)],
          estimatedDuration: randomInt(30, 120), // minutes
          instructions: faker.lorem.paragraphs(2),
          evaluationCriteria: [
            'Technical accuracy',
            'Code quality',
            'Problem solving',
            'Communication skills',
            'Cultural fit'
          ].slice(0, randomInt(2, 5)),
          score: Math.random() > 0.5 ? randomInt(1, 10) : null, // Some assignments have scores
          feedback: Math.random() > 0.7 ? faker.lorem.paragraph() : null, // Some have feedback
          attachments: Math.random() > 0.8 ? [
            {
              name: 'assignment_brief.pdf',
              url: '/attachments/brief.pdf',
              uploadedAt: faker.date.past({ days: 5 }).toISOString()
            }
          ] : []
        };

        assignments.push(assignment);
      }
    });

    await withRetry(async () => {
      await db.assignments.bulkAdd(assignments);
    });
    console.log('Seeded assignments:', assignments.length);

    /* ---------------- ASSESSMENTS ---------------- */
    const assessmentJobs = jobs.slice(0, 5);
    const assessments = assessmentJobs.map((job) => ({
      id: uuidv4(),
      jobId: job.id,
      schema: {
        title: `Technical Assessment - ${job.title}`,
        description: `This assessment evaluates candidates for the ${job.title} position.`,
        estimatedTime: "30-45 minutes",
        sections: [
          {
            id: uuidv4(),
            title: 'Technical Skills',
            description: 'Evaluate technical capabilities and problem-solving skills',
            questions: [
              {
                id: uuidv4(),
                type: 'single-choice',
                label: 'How many years of experience do you have in this field?',
                required: true,
                options: ['Less than 1 year', '1-2 years', '3-5 years', '5+ years']
              },
              {
                id: uuidv4(),
                type: 'multi-choice',
                label: 'Which technologies are you proficient with?',
                required: true,
                options: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS']
              },
              {
                id: uuidv4(),
                type: 'long-text',
                label: 'Describe a challenging technical problem you solved recently.',
                required: true,
                maxLength: 500
              },
              {
                id: uuidv4(),
                type: 'short-text',
                label: 'What is your preferred programming language?',
                required: false,
                maxLength: 50
              },
              {
                id: uuidv4(),
                type: 'numeric',
                label: 'On a scale of 1-10, how would you rate your problem-solving skills?',
                required: true,
                min: 1,
                max: 10
              }
            ]
          }
        ]
      }
    }));

    await withRetry(async () => {
      await db.assessments.bulkAdd(assessments);
    });
    console.log('Seeded assessments:', assessments.length);

    // Log sample data for debugging
    console.log('Sample data created:');
    console.log('- Jobs:', jobs.length);
    console.log('- Candidates:', candidates.length);
    console.log('- Applications:', applications.length);
    console.log('- Assignments:', assignments.length);
    console.log('- Assessments:', assessments.length);
    
    console.log('Sample assignment:', assignments[0]);
    console.log('Sample application with assignment:', applicationsForAssignments[0]);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed with error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      db: db ? Object.keys(db) : 'undefined',
    });
    throw new Error(`Database seeding failed: ${error.message}`);
  }
}