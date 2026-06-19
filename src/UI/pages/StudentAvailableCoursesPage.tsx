import { useEffect, useState  } from "react";
import { supabase } from '../lib/supabase'
import StudentNavbar from "../components/StudentNavbar";

function StudentAvailableCoursesPage() {

    const [courses, setCourses] = useState<any[]>([])
    const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])

    const currentUser = JSON.parse(
        sessionStorage.getItem('currentUser') || '{}'
    )

    const studentId = currentUser.id

    const fetchCourses = async () => {

        const { data, error } = await supabase
            .from('Course')
            .select('*')
            //.eq('is_active', true)
            .gte('course_end_date', new Date().toISOString())

        if (error) {
            console.error(error)
            return
        }

        setCourses(data || [])
    }

    const fetchEnrollments = async () => {

        const { data, error } = await supabase
            .from('Enrollment')
            .select('*')
            .eq('student_id', studentId)

        if (error) {
            console.error(error)
            return
        }

        setEnrolledCourses(
            data?.map(item => item.course_id) || []
        )
    }

    useEffect(() => {
        fetchCourses()
        fetchEnrollments()
    }, [])

    const handleEnroll = async (courseId: string) => {

        const { error } = await supabase
            .from('Enrollment')
            .insert([
                {
                    student_id: studentId,
                    course_id: courseId
                }
            ])

        if (error) {
            console.error(error)
            alert(error.message)
            return
        }

        alert('Successfully enrolled')

        fetchEnrollments()
    }

    return (
        <div>
            <StudentNavbar />

            <div className="student-page-container">

                <h1>Available Courses</h1>

                <div className="course-list">

                    {courses.map(course => {

                        const enrolled = enrolledCourses.includes(course.id)

                        return (
                            <div
                                key={course.id}
                                className="course-card"
                            >
                                <h3>
                                    {course.course_name}
                                </h3>

                                <p>
                                    {course.course_description}
                                </p>

                                <p>
                                    Code:
                                    {' '}
                                    {course.course_code}
                                </p>

                                {enrolled ? (
                                    <button
                                        disabled
                                        className="enrolled-btn"
                                    >
                                        Enrolled
                                    </button>
                                ) : (
                                    <button
                                        className="enroll-btn"
                                        onClick={() => handleEnroll(course.id)}
                                    >
                                        Enroll
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default StudentAvailableCoursesPage