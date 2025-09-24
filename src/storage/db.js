import Dexie from 'dexie';
import { seedDataIfNeeded } from '../utils/seedData'; // Adjust path

export const db = new Dexie('TalentFlowDB');

db.version(1).stores({
  jobs: 'id, title, slug, status, tags, order', // Match seeded fields
  candidates: 'id, name, email, timeline, notes',
  applications: 'id, candidateId, jobId, stage, candidateName, candidateEmail, jobTitle',
  assessments: 'id, jobId, schema', // 'schema' is an object, Dexie handles it
  assignments: 'id, applicationId, assessmentId, status, answers'
});

export async function initDb() {
  try {
    await db.open();
    console.log("DB opened");
    
    // Always check and seed if empty (force re-seed for testing)
    const totalApps = await db.applications.count();
    if (totalApps === 0) {
      console.log("No applications found, starting seeding...");
      await seedDataIfNeeded(db);
      console.log("Seeding complete. Verifying counts:");
      console.log("Jobs:", await db.jobs.count());
      console.log("Candidates:", await db.candidates.count());
      console.log("Applications:", await db.applications.count());
    } else {
      console.log(`DB already has ${totalApps} applications, skipping seed`);
    }
  } catch (error) {
    console.error("DB init failed:", error);
    throw error; // Re-throw to halt app if critical
  }
}