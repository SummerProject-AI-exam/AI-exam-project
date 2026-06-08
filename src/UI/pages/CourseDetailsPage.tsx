import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import TeacherNavbar from '../components/TeacherNavbar'


type Course = {
    id: string,
    course_name: string,
    course_description: string,
    course_code: string
}

function CourseDetailsPage() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [course, setCourse ] = useState<Course | null>(null)

    useEffect(() => {
        fetchCourse()
    }, [])

    const fetchCourse = async () => {
        const { data, error } = await supabase
            .from('Course')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error(error)
            return
        }
        
        setCourse(data)
    }

    return (
        <div className="course-details-page">
            <TeacherNavbar />

            <div className="detail-card">
                <h3>Title</h3>
                <p>{course?.course_name}</p>
            </div>

            <div className="detail-card">
                <h3>Description</h3>
                <p>{course?.course_description}</p>
            </div>

            <div className="detail-card"
                onClick={() => navigate(`/teacher/course/${id}/assignments`)}>
                <h3>Assignments</h3>
            </div>

            <div className="detail-card">
                <h3>Exams</h3>
            </div>

            <div className="detail-card">
                <h3>Student List</h3>
            </div>
        </div>
    )
}

export default CourseDetailsPage