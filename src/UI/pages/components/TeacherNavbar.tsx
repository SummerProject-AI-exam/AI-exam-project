import { useNavigate } from "react-router-dom";

type Props = {
    onActiveCoursesClick: () => void
}

function TeacherNavbar({ onActiveCoursesClick }: Props) {
    const navigate = useNavigate()

    const handleActiveCourses = () => {
        navigate('/teacher')
        onActiveCoursesClick()
    }


    return (
        <div className="teacher-navbar">
            <button onClick={handleActiveCourses}>
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
