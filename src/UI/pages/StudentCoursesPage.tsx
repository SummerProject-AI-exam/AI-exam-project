import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import StudentNavbar from '../components/StudentNavbar'

function StudentCoursesPage() {

    const [courses, setCourses] = useState<any[]>([])

    const currentUser = JSON.parse(
        sessionStorage.getItem('currentUser') || '{}'
    )

    const studentId = currentUser.id

    const fetchMyCourses = async () => {

        const { data, error } = await supabase
            .from('Enrollment')
            .select(`
                course_id,
                Course (
                    id,
                    course_name,
                    course_description,
                    course_code
                )
            `)
            .eq('student_id', studentId)

        if (error) {
            console.error(error)
            return
        }

        setCourses(data || [])
    }

    useEffect(() => {
        fetchMyCourses()
    }, [])

    return (
        <div>
            <StudentNavbar />

            <div className="student-page-container">

                <h1>My Courses</h1>

                <div className="course-list">

                    {courses.map((item: any) => (

                        <div
                            key={item.course_id}
                            className="course-card"
                        >
                            <h3>
                                {item.Course.course_name}
                            </h3>

                            <p>
                                {item.Course.course_description}
                            </p>

                            <p>
                                Code:
                                {' '}
                                {item.Course.course_code}
                            </p>

                            <button
                                className="enrolled-btn"
                                disabled
                            >
                                Enrolled
                            </button>

                        </div>
                    ))}

                </div>

            </div>
        </div>
    )
}

export default StudentCoursesPage