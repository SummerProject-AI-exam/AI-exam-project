import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase"

type Props = {
    onActiveCoursesClick: () => void
}

function TeacherNavbar({ onActiveCoursesClick }: Props) {
    const navigate = useNavigate()

    const handleActiveCourses = () => {
        navigate('/teacher')
        onActiveCoursesClick()
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()

        navigate('/')
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

            <button
                className="logout-btn" 
                onClick={handleLogout}>
                Logout
            </button>
        </div>
    )
}

export default TeacherNavbar
