
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import RoleSelection from './UI/components/RoleSelection';
import LoginForm from './UI/components/LoginForm';

import TeacherDashboard from './UI/pages/TeacherDashboard';
import StudentDashboard from './UI/pages/StudentDashboard';
import CourseDetailsPage from './UI/pages/CourseDetailsPage';
import AssignmentPage from './UI/pages/AssignmentPage';
import AssignmentDetailsPage from './UI/pages/AssignmentDetailsPage';
import ExamPage from './UI/pages/ExamPage';
import ExamDetailsPage from './UI/pages/ExamDetailsPage';
import StudentAvailableCoursesPage from './UI/pages/StudentAvailableCoursesPage';
import StudentCoursesPage from './UI/pages/StudentCoursesPage';
import StudentCourseDetailsPage from './UI/pages/StudentCourseDetailsPage';
import StudentAssignmentDetailsPage from './UI/pages/StudentAssignmentDetailsPage';
import StudentExamDetailsPage from './UI/pages/StudentExamDetailsPage';
import StudentResultsPage from './UI/pages/StudentResultsPage';

import FaceLandmarkerViewer from "./landmarker/components/FaceLandmarkerViewer";
import ReadinessTest from "./pages/ReadinessTest";
import MonitoringTest from "./pages/MonitoringTest";
import MonitoringDemo from './window_blur_focus/pages/MonitorDemo';
import './App.css';
import ReportsPage from './UI/pages/ReportsPage';

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
        <Route path="/teacher/assignment/:id" element={<AssignmentDetailsPage />} />
        <Route path="/teacher/course/:id/exams" element={<ExamPage />} />
        <Route path="/teacher/exam/:id" element={<ExamDetailsPage />} />
        <Route path="/teacher/reports" element={<ReportsPage />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/available-courses" element={<StudentAvailableCoursesPage />} />
        <Route path="/student/courses" element={<StudentCoursesPage />} />
        <Route path="/student/course/:id" element={<StudentCourseDetailsPage />} />
        <Route path="/student/assignment/:id" element={<StudentAssignmentDetailsPage />} />  
        <Route path="/student/exam/:id" element={<StudentExamDetailsPage />} /> 
        <Route path="/student/results"  element={<StudentResultsPage />} />
        <Route path="/readiness-test" element={<ReadinessTest />} />
        <Route path="/monitor" element={<MonitoringTest />} />
        <Route path="/focus-monitor" element={<MonitoringDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
