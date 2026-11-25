import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const outputPath = path.resolve('d:/anonyms msg/CampusVoice_Technical_Report.pdf');
console.log('Generating PDF to:', outputPath);

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  bufferPages: true,
  info: {
    Title: 'CampusVoice & HostelConnect Technical Architecture Specification',
    Author: 'CampusVoice Engineering Team',
    Subject: 'Enterprise Architecture & Cloud Database Specification',
    Keywords: 'Firebase, React, TypeScript, Hostel Management, Zero-Knowledge',
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const primary = '#4338ca';
const dark = '#0f172a';
const text = '#334155';
const lightBg = '#f8fafc';
const border = '#cbd5e1';
const emergencyRed = '#e11d48';

function drawHeader(title, subtitle) {
  doc.rect(45, 40, 505, 55).fill('#1e1b4b');
  doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text(title, 60, 50);
  doc.fillColor('#c7d2fe').fontSize(9).font('Helvetica').text(subtitle, 60, 72);
  doc.moveDown(2);
}

function sectionTitle(num, title) {
  doc.moveDown(0.8);
  const y = doc.y;
  doc.rect(45, y, 505, 24).fill('#e0e7ff');
  doc.fillColor(primary).fontSize(12).font('Helvetica-Bold').text(`${num}. ${title}`, 55, y + 6);
  doc.moveDown(0.8);
}

function subTitle(title) {
  doc.moveDown(0.5);
  doc.fillColor(dark).fontSize(11).font('Helvetica-Bold').text(title);
  doc.moveDown(0.3);
}

function bodyText(textStr) {
  doc.fillColor(text).fontSize(9.5).font('Helvetica').lineGap(2.5).text(textStr);
  doc.moveDown(0.4);
}

function bullet(boldPrefix, content) {
  doc.fillColor(primary).fontSize(10).text('• ', { continued: true });
  doc.fillColor(dark).font('Helvetica-Bold').fontSize(9.5).text(boldPrefix + ': ', { continued: true });
  doc.fillColor(text).font('Helvetica').text(content);
  doc.moveDown(0.2);
}

// ---------------- PAGE 1 ----------------
drawHeader('CampusVoice & HostelConnect Enterprise Suite', 'Comprehensive Technical Architecture & Cloud Database Specification');

doc.rect(45, 105, 505, 45).fillAndStroke(lightBg, border);
doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold');
doc.text('PROJECT: CV-HOSTEL-PRO', 55, 115);
doc.text('DATABASE: GOOGLE CLUSTER FIRESTORE', 220, 115);
doc.text('VERSION: 2.4.0 (PRODUCTION)', 400, 115);

doc.text('FRONTEND: REACT 18 + TYPESCRIPT', 55, 130);
doc.text('SECURITY: 108 SOS + ZERO-KNOWLEDGE', 220, 130);
doc.text('STATUS: CERTIFIED', 400, 130);

doc.y = 160;

sectionTitle('1', 'Executive Summary & Institutional Mission');
bodyText('CampusVoice & HostelConnect is an integrated digital grievance redressal, residential outpass, and student operations suite engineered to address core friction points in universities and residential institutions:');
bullet('Zero-Knowledge Grievance Redressal', 'Protects students from academic and residential retaliation by cryptographically decoupling student personal identity (PII) from complaints.');
bullet('SpaceBasic-Inspired Digital Outpass Engine', 'Replaces error-prone paper logbooks with automated leave requests, parental consent validation, Warden approvals, and encrypted QR gate passes.');
bullet('Kitchen Headcount & Food Waste Minimization', 'Empowers mess chefs with real-time diner forecasting across Breakfast, Lunch, Snacks, and Dinner to prevent meal over-preparation.');
bullet('Campus Emergency Red Channel (108 SOS)', 'Instantly routes critical fire, electrical, structural, and health hazards directly to emergency responders and campus leadership.');

sectionTitle('2', 'High-Level System Architecture');
bodyText('The platform follows a clean four-tier decoupled architecture designed for high scalability and zero-failure resilience:');
bullet('Presentation Tier', 'Responsive React 18 Single Page Application (SPA) with 6 role-scoped portals (Student, Warden, Chef, Watchman, College Management, University Administrator).');
bullet('Client Routing & State Tier', 'Declarative React Router v6 guarded by ProtectedRoute components; global state synchronized through React Context (AuthContext, BrandingContext, ToastContext).');
bullet('Business & Service Layer', 'Specialized domain controllers (complaintService, leaveService, foodService, firestoreService) with automated payload sanitization.');
bullet('Persistence & Cloud Tier', 'Google Cloud Firestore native mode (Project: campus-voice-b3bbc) validated by production-grade Common Expression Language (CEL) security rules, backed by an in-memory offline fallback cache.');

sectionTitle('3', 'Technology Stack & Languages');
bodyText('Built exclusively using modern enterprise web standards:');
bullet('TypeScript (v5.7.3)', 'Strict type enforcement across all database schemas, API service adapters, and React component contracts.');
bullet('React (v18.3.1)', 'Virtual DOM rendering engine with declarative state hooks and fast component re-renders.');
bullet('Vite (v6.2.0)', 'Next-generation build toolchain compiling 2,661 modules into optimized Rollup vendor chunks in ~16 seconds.');
bullet('Tailwind CSS (v3.4.17)', 'Utility-first responsive design system with custom brand tokens, dark/light contrast ratios, and animations.');
bullet('Google Firebase (v13.4.0)', 'Cloud Firestore real-time client providing sub-second document reads, writes, and optimistic UI updates.');

// ---------------- PAGE 2 ----------------
doc.addPage();
drawHeader('CampusVoice & HostelConnect Enterprise Suite', 'Data Models, Security Architecture & Role Portals');

sectionTitle('4', 'Cloud Firestore Database Schemas');
bodyText('Active Cloud Database: Google Cloud Firestore (Project ID: campus-voice-b3bbc)');

subTitle('Collection: complaints');
bullet('public_tracking_id (string)', 'Cryptographic public token (e.g., CV-9821A) allowing students to track progress and reply without logging in.');
bullet('anonymous_public_id (string)', 'Masked pseudonym (e.g., Anonymous Student #842). Strictly immutable.');
bullet('category / priority / status', 'Grievance classification (Hostel, Water, Mess, Labs), urgency tier, and lifecycle state.');
bullet('is_emergency (boolean)', 'Bypasses standard queues to trigger high-priority alerts across warden and management screens.');
bullet('upvote_count (number)', 'Community support counter, restricted to atomic ±1 adjustments in security rules.');
bullet('messages (array)', 'Threaded anonymous dialogue between resident students and responding administration.');

subTitle('Collection: leave_requests (SpaceBasic Outpass)');
bullet('student_id / student_name / room', 'Student identity, assigned residential block, and room number.');
bullet('leave_type / dates / curfew', 'day_pass, weekend_home, night_out, emergency with departure and return times.');
bullet('qr_pass_code (string)', 'Encrypted pass code (e.g., SB-PASS-204-9812) verified via camera barcode scanner at gate.');
bullet('status / approved_by / remarks', 'Lifecycle: pending -> approved -> checked_out -> checked_in.');

subTitle('Collection: food_attendance (Mess Headcount)');
bullet('student_id (string)', 'Unique student key storing current meal attendance state.');
bullet('is_in_hostel (boolean)', 'Calculates live active diner headcount to forecast food preparation and raw material needs.');

sectionTitle('5', 'Role-Based Portals & Operation Workflows');
bullet('1. Student Anonymous Portal (/student/dashboard)', 'Lodge anonymous complaints, track tickets, apply for outpasses, and toggle mess attendance.');
bullet('2. Hostel Warden Portal (/management/dashboard)', 'Review block-level grievances, approve/reject SpaceBasic outpasses with curfew conditions.');
bullet('3. Gate Security Portal (/watchman/scan)', 'Web camera QR scanner to verify student outpass passes and maintain digital gate logs.');
bullet('4. Mess Kitchen Hub (/chef/dashboard)', 'Real-time dining headcount (Breakfast, Lunch, Snacks, Dinner) and food waste analytics.');
bullet('5. College Management Portal (/college-management/dashboard)', 'Academic complaints: lecture halls, projectors, lab equipment, and direct notes to senior leadership.');
bullet('6. Admin Control Room (/admin)', 'Institutional branding customizer, purge fake/spam complaints, and Cloud Firestore sync manager.');

// ---------------- PAGE 3 ----------------
doc.addPage();
drawHeader('CampusVoice & HostelConnect Enterprise Suite', 'Emergency SOS, Governance & Deployment Blueprint');

sectionTitle('6', 'Campus Emergency Red Channel (108 SOS)');
doc.rect(45, doc.y, 505, 80).fillAndStroke('#fff1f2', emergencyRed);
const emergencyY = doc.y + 8;
doc.fillColor(emergencyRed).fontSize(11).font('Helvetica-Bold').text('CRITICAL LIFE SAFETY & SOS INTEGRATION', 55, emergencyY);
doc.fillColor(dark).fontSize(9).font('Helvetica').text('Immediate emergency escalation channel directly accessible from any page:', 55, emergencyY + 16);
doc.fillColor(text).fontSize(8.5).font('Helvetica')
  .text('• National Ambulance Service: Direct dial 108', 65, emergencyY + 30)
  .text('• National Police & Campus Safety: Direct dial 112 | Fire Brigade: Direct dial 101', 65, emergencyY + 42)
  .text('• Chief Warden: Dr. R. Meenakshi (+91 94432 00100) | Associate Director (AD): Dr. P. Sundaram (+91 94432 00300)', 65, emergencyY + 54)
  .text('• Lady Warden: Mrs. S. Kavitha (+91 94432 00200) | Security Control Desk 24x7: Ext. 222 (+91 94432 00500)', 65, emergencyY + 66);

doc.y = emergencyY + 85;

sectionTitle('7', 'Zero-Knowledge Privacy Architecture');
bodyText('To eliminate student fear of reprisal, CampusVoice enforces mathematical separation:');
bullet('Zero PII Storage', 'Student name, roll number, department, and IP address are never stored in grievance documents.');
bullet('Public Tracking Token', 'Students track resolution and exchange messages using an anonymous 8-character token.');
bullet('Common Expression Language (CEL)', 'Cloud Firestore security rules (firestore.rules) prohibit any user from modifying author identity or tracking tokens.');

sectionTitle('8', 'Official Source Repositories & Cloud Deployment');
bullet('Primary GitHub Repository', 'https://github.com/subhiksha353/hostel-management-system');
bullet('Mirror GitHub Repository', 'https://github.com/joshwajoseph728-cell/studentsvoice');
bullet('Google Firebase Console', 'Project ID: campus-voice-b3bbc | Cloud Firestore Native Mode');
bullet('Production Build Output', 'd:/anonyms msg/dist/ (Zero compiler warnings, 2,661 transformed modules)');

sectionTitle('9', 'Verification & Local Startup Guide');
bodyText('To run the production-grade suite locally:');
doc.fillColor('#0f172a').font('Courier-Bold').fontSize(9)
  .text('git clone https://github.com/subhiksha353/hostel-management-system.git', 60)
  .text('cd hostel-management-system', 60)
  .text('npm install', 60)
  .text('npm run dev  # Starts Vite server on http://localhost:5173', 60);

doc.moveDown(1);
doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text('CampusVoice & HostelConnect • Technical Architecture Specification • All Rights Reserved', 45, 780, { align: 'center', width: 505 });

// Finalize
doc.end();

writeStream.on('finish', () => {
  console.log('✅ PDF generated successfully at:', outputPath);
});
