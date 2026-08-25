# AI-exam-project
 
> An intelligent examination platform for managing courses, assignments,
> examinations, automated assessment, and examination monitoring.

The **AI Exam Platform** is a web-based examination system designed to
provide teachers and students with a centralized environment for
creating and managing courses, assignments, and exams.

The platform also provides examination monitoring capabilities,
including window focus/blur monitoring, camera and face monitoring,
gaze-related monitoring, and fraud-event reporting. Teachers can review
student submissions, examination results, and historical monitoring
events through dedicated reporting pages.

---

## 🎥 Project Demo

Take a quick look at the AI Exam Platform in action.

[▶️ **Watch the Project Demo**](https://youtu.be/ONmR5uBsgzc)

---

## Key Features

## Teacher Features

- Teacher authentication and dashboard
- Create and manage courses
- View active and previous courses
- Create and manage assignments
- Create and manage examinations
- Add and manage examination questions
- View enrolled students
- Export enrolled student lists as CSV
- View assignment reports
- View examination reports
- Review fraud/monitoring reports
- Filter reports by course, student,  assignment, event type, and risk level
- Inspect individual fraud-event details

## Student Features

- Student authentication and dashboard
- Browse available courses
- Enroll in courses
- View enrolled courses
- View assignments
- Submit assignments
- View assignment results
- Participate in scheduled examinations
- Automatic examination scoring where applicable
- Review submitted examination results
- View total marks and received marks

## Examination Monitoring

The platform records examination-related monitoring events, including:

- Window blur/focus events
- Camera readiness/blocking events
- Face detection events
- Multiple-face detection
- No-face detection
- Camera-off events
- Gaze-related events
- Head/pose monitoring events
- Gaze calibration events
- Other examination monitoring events

The monitoring events are stored in the Fraud_Events table and can be
 reviewed through the teacher's Fraud Report.

---

###  Reporting

The platform provides separate reporting areas for teachers.

## Assignment Report

The Assignment Report provides:

- Course selection
- Assignment selection
- Submission-status filtering
- Total students
- Total assignments
- Submitted assignments
- Missing submissions
- Student submission summary
- Detailed assignment submission information
- Student scores
- Submission dates

The detailed report allows teachers to see individual assignment records
and whether each student has submitted the assignment.

---

## Exam Report

The Exam Report provides teachers with an overview of examination
 performance, including:

- Course selection
- Exam selection
- Submission-status filtering
- Total students
- Total exams
- Submitted examinations
- Missing submissions
- Student examination summary
- Detailed examination results
- Scores and submission information


---

## Fraud Report

The Fraud Report provides a historical overview of examination
monitoring events.

## Filters

Teachers can filter the report by:

- Course
- Student
- Event Type
- Risk Level


## Summary

The report provides summary information such as:

- Total students
- Total fraud/monitoring events
- High-risk events
- Average confidence



##  Student Fraud Summary

Teachers can see the number of recorded monitoring events for each
student, including their email address and risk-level event counts.

The summary helps teachers quickly identify students with a higher
number of suspicious monitoring events.


## Detailed Fraud Report

The detailed report displays:

- Student
- Student email
- Event type
- Risk level
- Event date and time
- Event details

A **View** button can be used to inspect the JSON details associated
 with an individual event.

**Note:** Fraud-event risk levels are assigned according to the
 project's monitoring-event classification.

 

---

## System Architecture

The platform follows a web client/server architecture.


                    ┌─────────────────────────┐

                    │       Web Browser       │

                    │      React + Vite       │

                    └────────────┬────────────┘

                                 │

                                 │ HTTP / API

                                 ▼

                    ┌─────────────────────────┐

                    │       Node.js API       │

                    │        Express.js       │

                    └────────────┬────────────┘

                                 │

                ┌────────────────┴────────────────┐

                │                                 │

                ▼                                 ▼

       ┌─────────────────┐              ┌──────────────────┐

       │    Supabase     │              │ Monitoring / AI  │

       │ PostgreSQL/Auth │              │ related services │

       └─────────────────┘              └──────────────────┘



### Frontend

- React
- TypeScript
- Vite
- React Router
- HTML/CSS
- MediaPipe-related browser monitoring      components


### Backend

- Node.js
- Express.js
- TypeScript
- REST API endpoints

### Database

- Supabase
- PostgreSQL


---

## Database Structure

The current Supabase database includes entities for:

- Teacher
- Student
- Course
- Enrollment
- Assignment
- assignment_questions
- assignment_submissions
- student_answers
- Exam
- Multiple_Choice_Questions
- Coding_Questions
- exam_submissions
- exam_answers
- Exam_Sessions
- Fraud_Events
- Risk_Scores

## Main Relationships

Teacher

   │

   └── Course

          │

          ├── Enrollment ───── Student

          │

          ├── Assignment

          │      ├── Assignment Questions

          │      └── Assignment Submissions

          │

          └── Exam

                 ├── Multiple Choice Questions

                 ├── Coding Questions

                 ├── Exam Submissions

                 └── Exam Sessions

                          │

                          └── Fraud Events

## Examination Monitoring Relationship

Student

   │

   ▼

Exam Session

   │

   ▼

Fraud Events

   ├── Window events

   ├── Camera events

   ├── Face events

   ├── Gaze events

   └── Pose/head events

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router |
| Backend | Node.js |
| API | Express.js |
| Database | Supabase / PostgreSQL |
| Face / Head Monitoring | MediaPipe Face Landmarker |
| Gaze Monitoring | WebGazer.js / gaze-related browser monitoring |
| CSV Processing | PapaParse |
| Version Control | Git / GitHub |

---

## Team Contribution 


| Team Member | Main Contributions | 
|---|---| 
| Yvonne Frankort | Wireframes, database structure, frontend/backend features, camera readiness checks, camera alerts, gaze calibration, gaze/pose alerts , backlog management, documenting weekly reports | 
| Valtteri Myllyniemi | Wireframes, database structure, frontend/backend features, authentication, Safe Exam Browser features, testing, backlog management, documenting weekly reports | 
| Shyama Wijayarathna | Wireframes, database structure, frontend/backend features, CSV generation, window blur/focus monitoring, Teacher and Student dashboard creation,  backlog management, documenting weekly reports |

---

## AI and Monitoring

This part of the system handles everything related to the webcam: face detection, camera readiness, calibration, and the prototype gaze alerts. It all runs in the browser using MediaPipe Face Landmarker.

---

## Face & Camera Monitoring

The basic monitoring runs all the time and checks that the camera is working and the student is actually visible. It can detect things like:

- **no_face**
- **multiple_faces**   
- **camera_off**
- **camera_blocked**

These alerts form the base layer of the monitoring system.

---

## Readiness Check

Before an exam session begins, the system performs a camera readiness check:

- camera is working  
- face is visible 
- lighting is acceptable  
- no multiple faces   
- frame is stable (no freezing)  

If readiness fails, the exam does not start.

---

## Gaze Calibration

The system includes individualized gaze calibration for each student.  
During calibration, the system records baseline head‑pose values for

- **CENTER**  
- **LEFT**  
- **RIGHT**  
- **UP**  
- **DOWN**

These baseline values help adjust for different webcams, seating positions, and lighting.

---

## Gaze Features

The gaze logic uses head‑pose values (yaw/pitch) and other signals from Face Landmarker.
It computes:
 
- dx/dy direction values  
- smoothed gaze vectors  
- eye openness and direction  
- classification into **left**, **right**, **up**, **down**, **center**

These features are used by both calibration and gaze alerts.

---

## Gaze Alerts (Prototype)

The system has a prototype for detecting when a student is looking away from the screen.
It can detect:

- looking away left
- looking away right
- looking away up

Clear head‑turn events work reliably.
Borderline cases (like looking at the edge of the screen) are still unstable and would need more development time. Eyes covered and a keyboard-safe zone were considered, but not implemented in this prototype

---

## Examination Monitoring Events

All monitoring events are logged to Supabase in the `Fraud_Events` table.

Examples include:

- **window_blur**  
- **window_focus**  
- **camera_ready**  
- **camera_blocked**  
- **camera_off**  
- **camera_not_ready**  
- **no_face**  
- **multiple_faces**  
- **gaze_looking_away (direction)**  
- **calibration_ready**  

---

## Architecture Overview

The monitoring system is built in layers:

**FaceLandmarker → readiness check → camera alerts → calibration → gaze features → gaze alerts → logging → UI pages**

### Folder Structure

- **src/landmarker/alerts/** – camera alerts  
- **src/landmarker/analysis/** – readiness & camera quality  
- **src/gaze/** – gaze feature extraction  
- **src/gazeAlerts/** – gaze alert logic  
- **src/hooks/** – pipeline connecting all layers  
- **src/components/** – UI pages 
- **src/pages/** – testing pages  
- **src/utils/** – drawing & Supabase logging

`src/hooks` is the center of the pipeline. It:

- starts the webcam  
- runs FaceLandmarker  
- sends raw data to readiness & alerts  
- computes gaze features  
- runs calibration  
- runs gaze alerts  
- logs events  
- provides UI‑ready data to components

---
## Fraud Risk Classification

The Fraud Report groups monitoring events into risk levels to make the
 report easier for teachers to interpret.

The classification is based primarily on **event type**.  

Monitoring Event

       │

       ▼

Event Type Classification

       │

       ├── High Risk

       ├── Medium Risk

       └── Low Risk

---


## Getting Started

### 1. Clone the repository

git clone https://github.com/SummerProject-AI-exam/AI-exam-project

cd AI-exam-project

### 2. Install frontend dependencies

cd frontend

npm install

### 3. Install backend dependencies

cd ../backend

npm install

### 4. Configure environment variables

Create the required .env files.

### Frontend 

```env 
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_backend_api_url

```

### Backend

```env
PORT=3001 
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

```

### 5. Start the backend

npm run dev

### 6. Start the frontend

npm run dev

Use the local URL shown by Vite in the terminal.

---

## Main User Workflows

### Teacher Workflow

Teacher Login

      ↓

Teacher Dashboard

      ↓

Create / Select Course

      ↓

Manage Students

      ↓

Create Assignments / Exams

      ↓

Monitor Examination Activity

      ↓

Review Reports

      ↓

Analyze Results / Fraud Events

### Student Workflow

Student Login

      ↓

Student Dashboard

      ↓

Browse / Enroll in Course

      ↓

View Assignments / Exams

      ↓

Submit Assignment

      ↓

Take Examination

      ↓

Examination Monitoring

      ↓

Automatic / Manual Assessment

      ↓

View Results

---

## License

This project was developed as an academic project.

The source code is provided for educational and demonstration purposes.
No open-source license has been applied to this project.

---

## Useful Links

- 💻 **GitHub Repository:** https://github.com/SummerProject-AI-exam/AI-exam-project
- 🎨 **Figma Design:**https://www.figma.com/design/bu6pj2jNmVcmUA7oBhhakw/AI-Exam?node-id=0-1&m=dev&t=p3yrKZVRZVtDuC5H-1
- 🎥 **Project Demo:** https://youtu.be/ONmR5uBsgzc




