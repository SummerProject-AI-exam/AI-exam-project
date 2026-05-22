import { useNavigate } from 'react-router-dom'

function HomePage() {
    const navigate = useNavigate()

    const handleTeacherClick = (): void => {
        navigate('/teacher')
    }

    const handleStudentClick = (): void => {
        navigate('/student')
    }

    return (
        <div className="container">
            <div className="card">
                <h1>AI Education Platform</h1>
                <p>Select your Role</p>

                <div className="button-group">
                    <button onClick={handleTeacherClick}>
                        Teacher
                    </button>

                    <button onClick={handleStudentClick}>
                        Student
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HomePage