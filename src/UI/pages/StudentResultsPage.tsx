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

    const [assignmentResults, setAssignmentResults] = useState<any[]>([])
    const [examResults, setExamResults] = useState<any[]>([])

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

        const courseIds = enrolledCourses.map((course: any) => course.id)

        await fetchAssignmentResults(courseIds)

        await fetchExamResults(courseIds)
    }

    const fetchAssignmentResults = async (
        courseIds: string[]
    ) => {

        if (courseIds.length === 0) return

        const { data, error } = await supabase
            .from("Assignment")
            .select(`
                id,
                title,
                total_marks,
                course_id,
                assignment_submissions (
                    student_id,
                    total_score,
                    status
                )
            `)
            .in("course_id", courseIds)

        console.log("Assignment data:", data )
        console.log("Assignment error:", error)

        if (error) {
            console.error(error)
            return
        }

        const results = data.map(assignment => {

            const submission = assignment.assignment_submissions.find(
                (item: any) =>
                    item.student_id === currentUser.id
            )

            return {
                course_id: assignment.course_id,
                type: "Assignment",
                title: assignment.title,
                totalMarks: assignment.total_marks,
                score: submission?.total_score ?? null,
                status:
                    submission?.status ??
                    "Not Attempted"
            }
        })

        setAssignmentResults(results)


    }

    const fetchExamResults = async (
        courseIds: string[]
    ) => {

        if (courseIds.length === 0) return

        const { data, error } = await supabase
            .from("Exam")
            .select(`
                id,
                title,
                course_id,
                exam_submissions (
                    student_id,
                    total_score,
                    status
                ),
                Multiple_Choice_Questions (
                    score
                )
            `)
            .in("course_id", courseIds)

        console.log("Exam data:", data)
        console.log("Exam error:", error)

        if (error) {
            console.error(error)
            return
        }

        const results = data.map(exam => {

            const totalMarks = exam.Multiple_Choice_Questions.reduce(
                (sum: number, question: any) =>
                    sum + question.score,
                0
            )

            const submission = exam.exam_submissions.find(
                (item: any) =>
                    item.student_id === currentUser.id
            )

            return {
                course_id: exam.course_id,
                type: "Exam",
                title: exam.title,
                totalMarks,
                score: submission?.total_score ?? null,
                status:
                    submission?.status ??
                    "Not Attempted"
            }
        })

        setExamResults(results)
    }

    return (
        <div>

            <StudentNavbar />

            <div className="student-page-container">

                <h1>My Results</h1>

                {courses.length === 0 ? (

                    <p>No enrolled courses found</p>
                ) : (

                    courses.map((course) => {

                        const courseResults = [

                            ...assignmentResults.filter(
                                item => item.course_id === course.id
                            ),

                            ...examResults.filter(
                                item => item.course_id === course.id
                            )
                        ]

                        return (

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
                                        {courseResults.map((result, index) => (
                                            <tr key={index}>
                                                <td>{result.type}</td>
                                                <td>{result.title}</td>
                                                <td>
                                                    {result.score !== null
                                                        ? `${result.score} / ${result.totalMarks}`
                                                        : "-"}
                                                </td>

                                                <td>
                                                    {result.status === "Submitted"
                                                        ? "Submitted"
                                                        : "Not Attempted"}
                                                </td>
                                            </tr>
                                        ))}

                                    
                                    </tbody>
                                </table>

                            </ div>
                        )
                    })
                )}
            </div>
        </div>
    )

}

export default StudentResultsPage