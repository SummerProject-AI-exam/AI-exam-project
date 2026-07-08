import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"
import StudentNavbar from "../components/StudentNavbar";

type Course = {
    id: string;
    course_name: string;
}

function StudentResultsPage() {

    const currentUser = JSON.parse(
        sessionStorage.getItem("currentUser") || "{}"
    )

    const [courses, setCourses] = useState<Course[]>([])

    useEffect(() => {
        loadCourses()
    }, [])

    const loadCourses = async () => {

        const { data, error } = await supabase
            .from("Enrollment")
            .select(`
                course_id,
                Course(
                    id,
                    course_name
                )
                
            `)
            .eq("student_id", currentUser.id)

        if (error) {
            console.error(error)
            return
        }

        const enrolledCourses = data?.map((item: any) => item.Course) || []

        setCourses(enrolledCourses)
    }

    return (
        <div>

            <StudentNavbar />

            <div className="student-page-container">

                <h1>My Results</h1>

                {courses.length === 0 ? (

                    <p>No enrolled courses found</p>
                ) : (

                    courses.map((course) => (

                        <div
                            key={course.id}
                            className="results-course-card"
                        >

                            <h2>{course.course_name}</h2>

                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Title</th>
                                        <th>Score</th>
                                        <th>Status</th>

                                    </tr>
                                </thead>

                                <tbody>
                                    {/*Assignment results */}

                                    {/* Exam Results */}
                                </tbody>
                            </table>

                        </ div>
                    ))
                )}
            </div>
        </div>
    )

}

export default StudentResultsPage