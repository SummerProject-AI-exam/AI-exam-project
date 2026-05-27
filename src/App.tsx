import { BrowserRouter, Routes, Route  } from 'react-router-dom'
import TeacherDashboard from './UI/pages/TeacherDashboard'
import './App.css'
import StudentDashboard from './UI/pages/StudentDashboard'
import  CourseDetailsPage from './UI/pages/CourseDetailsPage'
import HomePage from './UI/pages/HomePage'
import AssignmentPage from './UI/pages/AssignmentPage'

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/teacher/course/:id" element={<CourseDetailsPage />} />
      <Route path="/teacher/course/:id/assignments" element={<AssignmentPage />} />
      <Route path="/student" element={<StudentDashboard />} />
      
    </Routes>
      
    </BrowserRouter>
  )
}

export default App