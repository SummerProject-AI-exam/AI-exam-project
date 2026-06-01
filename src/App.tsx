import { BrowserRouter, Routes, Route  } from 'react-router-dom'
import TeacherDashboard from './UI/pages/TeacherDashboard'
import './App.css'
import StudentDashboard from './UI/pages/StudentDashboard'
import  CourseDetailsPage from './UI/pages/CourseDetailsPage'
//import HomePage from './UI/pages/HomePage'
import AssignmentPage from './UI/pages/AssignmentPage'
import FaceLandmarkerViewer from "./landmarker/components/FaceLandmarkerViewer";

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<TeacherDashboard />} /> 
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/teacher/course/:id" element={<CourseDetailsPage />} />
      <Route path="/teacher/course/:id/assignments" element={<AssignmentPage />} />
      <Route path="/student" element={<StudentDashboard />} />
      
       {/* FaceLandmarker demo */}
        <Route
          path="/monitor"
          element={
            <div
              style={{ minHeight: "100vh", background: "#111", color: "#eee" }}
            >
              <h1 style={{ textAlign: "center", padding: "1rem" }}>
                FaceLandmarker Demo
              </h1>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <FaceLandmarkerViewer />
              </div>
            </div>
          }
        />
      
    </Routes>
      
    </BrowserRouter>
  )
}



export default App;
