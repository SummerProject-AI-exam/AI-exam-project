# API Endpoints

The AI Exam Platform backend provides endpoints for creating exam sessions
and recording examination monitoring events.

## Base URL

```text
http://localhost:3001
```

---

## Exam Session

### Create Exam Session

Creates a new exam session when a student starts an examination.

**Method:** `POST`

**Endpoint:**

```text
/api/sessions
```

**Request Body:**

```json
{
  "studentId": "student-uuid",
  "examId": "exam-uuid"
}
```

**Response:** `201 Created`

---

## Monitoring / Fraud Event

### Create Monitoring Event

Records an examination monitoring event and stores it in the
`Fraud_Events` table.

**Method:** `POST`

**Endpoint:**

```text
/api/events
```

**Request Body:**

```json
{
  "sessionId": "exam-session-uuid",
  "type": "WINDOW_BLUR"
}
```

**Response:** `201 Created`

```json
{
  "success": true
}
```

### Event Types

Examples of monitoring events include:

- `WINDOW_BLUR`
- `WINDOW_FOCUS`
- `CAMERA_BLOCKED`
- `CAMERA_OFF`
- `NO_FACE`
- `MULTIPLE_FACES`
- `GAZE_LOOKING_AWAY`
- `GAZE_DRIFT_TOO_FAR`
- `GAZE_RAPID_CHANGES`
- `POSE_TOO_DOWN`
- `POSE_TOO_LEFT`
- `POSE_TOO_RIGHT`
- `POSE_TOO_UP`

---

## API Summary

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/sessions` | Create an exam session |
| `POST` | `/api/events` | Record a monitoring/fraud event |
