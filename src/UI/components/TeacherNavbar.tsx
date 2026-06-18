import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase"

type Props = {
    onActiveCoursesClick?: () => void
    onPreviousCoursesClick?: () => void
}

function TeacherNavbar({ 
    onActiveCoursesClick,
    onPreviousCoursesClick }: Props) {
    const navigate = useNavigate()

    const handleActiveCourses = () => {
        navigate('/teacher')
        onActiveCoursesClick?.()
    }

    const handlePreviousCourses = () => {
        navigate('/teacher?view=previous')
        onPreviousCoursesClick?.()
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()

        navigate('/')
    }


    return (
        <div className="teacher-navbar">
            <div
                className="teacher-logo"
                onClick={() => navigate('/teacher')}
            >
                AI Exam Platform
            </div>
            <div className="nav-left">

            
                <button onClick={handleActiveCourses}>
                    Active Courses
                </button>
            

                <button onClick={() => navigate('/teacher/reports')}>
                    Reports
                </button>

                <button onClick={handlePreviousCourses}>
                    Previous Courses
                </button>
            </div>

            <button
                className="logout-btn" 
                onClick={handleLogout}>
                Logout
            </button>
        </div>
    )
}

export default TeacherNavbar
