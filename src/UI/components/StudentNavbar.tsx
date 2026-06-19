import { useNavigate } from 'react-router-dom'

function StudentNavbar() {

    const navigate = useNavigate()

    return (
        <nav className="student-navbar">

            <div className="student-logo">
                AI Exam Platforrm
            </div>

            <div className="student-nav-links">

                <button
                    className="student-nav-btn"
                    onClick={() => navigate('/student')}
                >
                    Dashboard
                </button>

                <button
                    className="student-nav-btn"
                    onClick={() => navigate('/student/available-courses')}
                >
                    Available Courses
                </button>

                <button
                    className="student-nav-btn"
                    onClick={() => navigate('/student/courses')}
                >
                    My Courses
                </button>

                <button
                    className="student-nav-btn"
                    onClick={() => navigate('/student/results')}
                >
                    Results
                </button>

            </div>

            <button
                className="student-nav-btn"
                onClick={() => {
                    sessionStorage.clear()
                    navigate('/')
                }}
            >
                Logout
            </button>
        </nav>
    )
}

export default StudentNavbar