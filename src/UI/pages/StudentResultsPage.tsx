import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"
import StudentNavbar from "../components/StudentNavbar";

//Represents an enrolled course
type Course = {
    id: string;
    course_name: string;
}

function StudentResultsPage() {

//Retrieves the currently logged-in student from session storage
    const currentUser = JSON.parse(
        sessionStorage.getItem("currentUser") || "{}"
    )

    //Store enrolled courses, assignments results and exam results 
    const [courses, setCourses] = useState<Course[]>([])
    const [assignmentResults, setAssignmentResults] = useState<any[]>([])
    const [examResults, setExamResults] = useState<any[]>([])

    //Loads the student's enrolled courses when the page is first rendered
    useEffect(() => {
        loadCourses()
    }, [])

    
    //Fetches all courses the current student has enrolled in
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

        
        // Extract course IDs to retrieve assignment and exam results
        const courseIds = enrolledCourses.map((course: any) => course.id)

        //Loads assignment and exam results for all enrolled courses
        await fetchAssignmentResults(courseIds)

        await fetchExamResults(courseIds)
    }

    // Fetches assiignment results for the student's enrolled courses
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
                    status,
                    submitted_at
                )
            `)
            .in("course_id", courseIds)

        console.log("Assignment data:", data )
        console.log("Assignment error:", error)

        if (error) {
            console.error(error)
            return
        }

        //Converts assignment data into a format suitable for the results table
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
                    "Not Attempted",
                submittedAt: submission?.submitted_at ?? null

            }
        })

        setAssignmentResults(results)


    }

    //Fetches exam results for the student's enrolled courses
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
                    status,
                    submitted_at
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

        //calculates the total marks for each exam by summing the scores of all questions
            const totalMarks = exam.Multiple_Choice_Questions.reduce(
                (sum: number, question: any) =>
                    sum + question.score,
                0
            )

            const submission = exam.exam_submissions.find(
                (item: any) =>
                    item.student_id === currentUser.id
            )

        //Creates a simplified result object for the UI

            return {
                course_id: exam.course_id,
                type: "Exam",
                title: exam.title,
                totalMarks,
                score: submission?.total_score ?? null,
                status:
                    submission?.status ??
                    "Not Attempted",
                submittedAt: submission?.submitted_at ?? null

            }
        })

        setExamResults(results)
    }

    return (
        <div>

        {/* Student navigation bar */}
            <StudentNavbar />

            <div className="student-page-container">

            {/* Page heading */}
                <h1>My Results</h1>

                {courses.length === 0 ? (

                    <p>No enrolled courses found</p>

                    
                ) : (

                    courses.map((course) => {

                    //combines assignment and exam results belonging to the current course
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
                            {/* Results table */}
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Title</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                            <th>Submitted On</th>

                                        </tr>
                                    </thead>
                                {/* Display assignment and exam results */}
                                    <tbody>
                                        {courseResults.map((result, index) => (
                                            <tr key={index}>
                                                <td>{result.type}</td>
                                                <td>{result.title}</td>
                                                <td>
                                                    {result.score !== null
                                                        ? `${result.score} / ${result.totalMarks}`
                                                        : `- / ${result.totalMarks}`}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            result.status === "Submitted"
                                                                ? "status-submitted"
                                                                : "status-not-attempted"
                                                        }
                                                    >
                                                        {result.status}
                                                    </span>
                                                </td>
                                            {/* Display the submission data and time or "-" if not submitted*/}
                                                <td>
                                                    {result.submittedAt
                                                        ? new Date(result.submittedAt).toLocaleString("en-GB", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"

                                                            

                                                        })
                                                        : "-"}
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