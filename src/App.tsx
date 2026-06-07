import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TeacherDashboard from './UI/pages/TeacherDashboard'
import './App.css'
import StudentDashboard from './UI/pages/StudentDashboard'
import CourseDetailsPage from './UI/pages/CourseDetailsPage'
import AssignmentPage from './UI/pages/AssignmentPage'
import FaceLandmarkerViewer from "./landmarker/components/FaceLandmarkerViewer";
import ReadinessTest from "./pages/ReadinessTest";
import MonitoringTest from "./pages/MonitoringTest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/course/:id" element={<CourseDetailsPage />} />
        <Route path="/teacher/course/:id/assignments" element={<AssignmentPage />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/readiness-test" element={<ReadinessTest />} />
        <Route path="/monitor" element={<MonitoringTest />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App;
