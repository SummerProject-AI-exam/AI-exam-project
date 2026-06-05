import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import RoleSelection from './UI/components/RoleSelection';
import LoginForm from './UI/components/LoginForm';

import TeacherDashboard from './UI/pages/TeacherDashboard';
import StudentDashboard from './UI/pages/StudentDashboard';
import CourseDetailsPage from './UI/pages/CourseDetailsPage';
import AssignmentPage from './UI/pages/AssignmentPage';
import FaceLandmarkerViewer from "./landmarker/components/FaceLandmarkerViewer";
import MonitoringDemo from './window_blur_focus/pages/MonitorDemo';
import './App.css';

type viewState = 'selection' | 'teacher-login' | 'student-login';

function MainLogin() {
  const [view, setView] = useState<viewState>('selection');
  const navigate = useNavigate();

  const handleLoginSuccess = (userData: any, role: 'student' | 'teacher') => {
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    
    if (role === 'teacher') {
      navigate('/teacher');
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="App">
      {view === 'selection' && (
        <RoleSelection
          onSelectRole={(role) => setView(role === 'teacher' ? 'teacher-login' : 'student-login')}
        />
      )}

      {view === 'teacher-login' && (
        <LoginForm
          role="teacher"
          onBack={() => setView('selection')}
          onLoginSuccess={(data) => handleLoginSuccess(data, 'teacher')} 
        />
      )}

      {view === 'student-login' && (
        <LoginForm
          role="student"
          onBack={() => setView('selection')}
          onLoginSuccess={(data) => handleLoginSuccess(data, 'student')} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLogin />} /> 
        
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/course/:id" element={<CourseDetailsPage />} />
        <Route path="/teacher/course/:id/assignments" element={<AssignmentPage />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/focus-monitor" element={<MonitoringDemo />} />
        
        <Route
          path="/monitor"
          element={
            <div style={{ minHeight: "100vh", background: "#111", color: "#eee" }}>
              <h1 style={{ textAlign: "center", padding: "1rem" }}>
                FaceLandmarker Demo
              </h1>
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <FaceLandmarkerViewer />
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
