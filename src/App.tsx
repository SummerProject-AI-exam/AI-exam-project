import { BrowserRouter, Routes, Route  } from 'react-router-dom'
import TeacherDashboard from './UI/pages/TeacherDashboard'
import './App.css'
import StudentDashboard from './UI/pages/StudentDashboard'
import HomePage from './UI/pages/HomePage'


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />
    </Routes>
      
    </BrowserRouter>
  )
}

export default App