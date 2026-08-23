
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
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

[▶️ **Watch the Project Demo**](DEMO_VIDEO_LINK)

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

## AI and Intelligent Monitoring

### Face and Head Monitoring

MediaPipe Face Landmarker is used for browser-based face/head
 monitoring.

The monitoring functionality can detect conditions such as:

- No face detected
- Multiple faces detected
- Head/pose movement

### Gaze Monitoring

Gaze-related monitoring is used to identify unusual looking-away or
 gaze-drift events.

Examples include:

gaze_looking_away

gaze_drift_too_far

gaze_rapid_changes

gaze_looking_away_left

gaze_looking_away_right

gaze_looking_away_up

gaze_looking_away_down

gaze_eyes_covered

---

## Examination Monitoring Events

The Fraud_Events table stores monitoring events associated with an
examination session.

Examples of event types currently used by the project include:

window_blur

window_focus

camera_ready

camera_blocked

camera_not_ready

camera_off

no_face

multiple_faces

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


## How to Run 
1. ... 
2. ...

## Current Status
- Week 2
- What's done: Research, wireframes, and database
- What's next: CSV import, and the main page for student and teacher

## Key Features
- [ ] Authentication
- [ ] Weekly assignments
- [ ] Exam mode
- [ ] Gaze tracking (POC)
- [ ] Tab tracking
- [ ] Teacher dashboard
>>>>>>> 5d56a91baed69cf49758d2be394331103eedab1f
