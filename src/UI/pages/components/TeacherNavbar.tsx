import { useNavigate } from "react-router-dom";

function TeacherNavbar() {
    const navigate = useNavigate()


    return (
        <div className="teacher-navbar">
            <button onClick={() => navigate('/teacher')}>
                Active Courses
            </button>
            

            <button onClick={() => navigate('/teacher/reports')}>
                Reports
            </button>

            <button onClick={() => navigate('/teacher/previous')}>
                Previous Courses
            </button>
        </div>
    )
}

export default TeacherNavbar
