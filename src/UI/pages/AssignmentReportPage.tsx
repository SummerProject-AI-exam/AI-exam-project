import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import TeacherNavbar from "../components/TeacherNavbar";



function AssignmentReportPage() {

    const currentUser = JSON.parse(
        sessionStorage.getItem("currentUser") || "{}"
    )

    //Store report filters, summary statistics and generated report data

    const [courses, setCourses] = useState<any[]>([])
    const [assignments, setAssignments] = useState<any[]>([])

    const [selectedCourse, setSelectedCourse] = useState("")
    const [selectedAssignment, setSelectedAssignment] = useState("all")
    const [selectedStatus, setSelectedStatus] = useState("all")

    const [summary, setSummary] = useState({
        totalStudents: 0,
        totalAssignments: 0,
        submitted: 0,
        missing: 0
    })

    const [studentSummary, setStudentSummary] = useState<any[]>([])
    const [detailedReport, setDetailedReport] = useState<any[]>([])

    // Load teacher's courses when the page opens
    useEffect(() => {
        loadCourses()
    }, [])

    // Reload assignments whenever the selected course changes
    useEffect(() => {
        if (selectedCourse) {
            loadAssignments(selectedCourse)
        }
    }, [selectedCourse])

    //Retrieve all courses created by the logged-in teacher
    const loadCourses = async () => {

        const { data, error} = await supabase
            .from("Course")
            .select( "id, course_name")
            .eq("teacher_id", currentUser.id)
            .order("course_name")

        if (error) {
            console.error(error)
            return
        }

        setCourses(data || [])

    }

    // Retrieve assignments  for the  selected course
    const loadAssignments = async (courseId: string) => {

        const { data, error } = await supabase
            .from("Assignment")
            .select("id, title")
            .eq("course_id", courseId)
            .order("title")

        if (error) {
            console.error(error)
            return
        }

        setAssignments(data || [])
    }

    // Generate the assignment report based on the selected filters
    const handleGenerateReport = async () => {

        if (!selectedCourse) {
            alert("Please select a course")
            return
        }

        // Retrieve students enrolled in the selected course

        const { data: enrollments } = await supabase
            .from("Enrollment")
            .select("student_id")
            .eq("course_id", selectedCourse)

        const totalStudents = enrollments?.length || 0

        // Retrieve the selected assignment(s)
        let assignmentQuery = supabase
            .from("Assignment")
            .select("id")

        if (selectedAssignment === "all") {

            assignmentQuery = assignmentQuery.eq(
                "course_id",
                selectedCourse
            )
        } else {

            assignmentQuery = assignmentQuery.eq(
                "id",
                selectedAssignment
            )
        }

        // Retrieve assignment submissions
        const { data: assignments } = await assignmentQuery

        const totalAssignments = assignments?.length || 0
        
        const assignmentIds = assignments?.map(a => a.id) || []

        const { data: submissions } = await supabase
            .from("assignment_submissions")
            .select("student_id, status")
            .in("assignment_id", assignmentIds)

        const submitted = submissions?.filter(
            item => item.status === "Submitted"
            ).length || 0

        // Calculate overall report statistics

        const expected = totalStudents * totalAssignments

        const missing = expected - submitted

        setSummary({
            totalStudents,
            totalAssignments,
            submitted,
            missing
        })

        await loadStudentsSummary()
        await loadDetailedReport()
    }

    // Generate a summary showing how many assignments each student submitted
    const loadStudentsSummary = async () => {

        // Get enrolled students
        const { data: enrollments, error } = await supabase
            .from("Enrollment")
            .select(`
                student_id,
                Student(
                    id,
                    student_first_name,
                    student_last_name
                )
            `)
            .eq("course_id", selectedCourse)

        if (error) {
            console.error(error)
            return
        }

        if (!enrollments) return

        // Get assignments
        let assignmentQuery = supabase
                .from("Assignment")
                .select("id")

        if (selectedAssignment === "all") {

            assignmentQuery = assignmentQuery.eq("course_id", selectedCourse)
        } else {

            assignmentQuery = assignmentQuery.eq("id", selectedAssignment)

        }

        const { data: assignments } = await assignmentQuery

        const assignmentIds = assignments?.map(a => a.id) || []

        const totalAssignments = assignmentIds.length

        // Get submissions
        const { data: submissions } = await supabase
            .from("assignment_submissions")
            .select(`
                assignment_id,
                student_id,
                status
            `)
            .in("assignment_id", assignmentIds)

        // Build one summary row for each enrolled student
        const rows = enrollments.map((enrollment: any) => {

            const submitted = submissions?.filter(item =>
                item.student_id === enrollment.student_id && 
                item.status === "Submitted"
            ).length || 0
        

            return {

                studentName:
                    `${enrollment.Student.student_first_name} ${enrollment.Student.student_last_name}`,

                submitted,
                totalAssignments,
                missing: totalAssignments - submitted
            }
        })

        // Save the summary table data
        setStudentSummary(rows)

        
    }

    // Generate a detailed report for every student and assignment
    const loadDetailedReport = async () => {

        // Get enrolled students
        const { data: enrollments } = await supabase
            .from("Enrollment")
            .select(`
                student_id,
                Student(
                    student_first_name,
                    student_last_name
                )
            `)
            .eq("course_id", selectedCourse)

        if (!enrollments) return

        // Get assignments
        let assignmentQuery = supabase
                .from("Assignment")
                .select(`
                    id,
                    title,
                    total_marks
                `)
        if (selectedAssignment === "all") {

            assignmentQuery = assignmentQuery.eq(
                "course_id",
                selectedCourse
            )
        } else {

            assignmentQuery = assignmentQuery.eq(
                "id",
                selectedAssignment
            )
        }

        const { data: assignments } = await assignmentQuery

        if (!assignments) return

        const assignmentIds = assignments.map(a => a.id)

        // Get submissions
        const { data: submissions } = await supabase
            .from("assignment_submissions")
            .select(`
                assignment_id,
                student_id,
                total_score,
                status,
                submitted_at
            `)
            .in("assignment_id", assignmentIds)

        const rows: any[] = []
        // Create one report row for every student-assignment combination
        assignments.forEach(assignment => {

            enrollments.forEach((student: any) => {

                const submission = submissions?.find(item =>
                    item.assignment_id === assignment.id &&
                    item.student_id === student.student_id
                )

                // Add the student's assignment result to the report
                rows.push({

                    student:

                        `${student.Student.student_first_name} ${student.Student.student_last_name}`,

                    assignment:

                        assignment.title,

                    totalMarks:

                        assignment.total_marks,

                    score:

                        submission?.total_score ?? null,

                    status:

                        submission?.status ??
                        "Not Submitted",

                    submittedAt:

                        submission?.submitted_at ?? null
                })
            })
        })

        // Apply the selected status filter (All, Submitted or Not Submitted)
        let filteredRows = rows

        if (selectedStatus === "submitted") {
            filteredRows = rows.filter(
                row => row.status === "Submitted"
            )
        }

        if (selectedStatus === "missing") {
            filteredRows = rows.filter(
                row => row.status === "Not Submitted"
            )
        }

        //Update the detailed report displayed on the page
        setDetailedReport(filteredRows)
    }

    return (

        <div>

            <TeacherNavbar />

            <div className="report-container">
                <h1>Assignment Report</h1>

                {/* Report Filter section */}
                <div className="report-filters">
                    <div>

                        <label>Course</label>

                        <select
                            value={selectedCourse}
                            onChange={(e) =>
                                setSelectedCourse(e.target.value)
                            }
                        >
                            <option value="">
                                Select Course
                            </option>

                            {courses.map(course => (
                                <option
                                    key={course.id}
                                    value={course.id}
                                >
                                    {course.course_name}
                                </option>
                            ))}

                        </select>
                    </div>
                    <div>

                        <label>Assignment</label>

                        <select
                            value={selectedAssignment}
                            onChange={(e) =>
                                setSelectedAssignment(e.target.value)
                            }
                        >

                            <option value="all">
                                All Assignments
                            </option>

                            {assignments.map(item => (

                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.title}
                                </option>

                            ))}
                        </select>
                    </div>

                    <div>

                        <label>Status</label>

                        <select
                            value={selectedStatus}
                            onChange={(e) => 
                                setSelectedStatus(e.target.value)
                            }
                        >
                            <option value="all">
                                All
                            </option>

                            <option value="submitted">
                                Submitted
                            </option>

                            <option value="missing">
                                Not Submitted
                            </option>

                        </select>
                    </div>

                </div>

                <button
                    className="generate-btn"
                    onClick={handleGenerateReport}
                >
                    Generate Report
                </button>
                {/* Overall report statistics */}
                <div className="summary-grid">

                    <div className="summary-card">
                        <h3>Total Students</h3>

                        <h2>{summary.totalStudents}</h2>
                    </div>

                    <div className="summary-card">

                        <h3>Total Assignments</h3>

                        <h2>{summary.totalAssignments}</h2>
                    </div>

                    <div className="summary-card">

                        <h3>Submitted</h3>

                        <h2>{summary.submitted}</h2>
                    </div>

                    <div className="summary-card">

                        <h3>Missing Submission</h3>

                        <h2>{summary.missing}</h2>

                    </div>
                </div>

                <h2 style={{ marginTop: "50px" }}>
                    Student Submission Summary
                </h2>
                {/* Summary of assignment submissions for each student */}
                <table className="results-table">

                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Submitted</th>
                            <th>Missing</th>
                        </tr>
                    </thead>

                    <tbody>
                        {studentSummary.map((student, index) => (
                            <tr key={index}>

                                <td>{student.studentName}</td>

                                <td>
                                    {student.submitted}
                                    {" / "}
                                    {student.totalAssignments}

                                </td>
                                <td>{student.missing}</td>
                            </tr>

                        ))}

                    </tbody>

                </table>

                <h2 style={{ marginTop: "50px" }}>
                    Detailed Assignment Report
                </h2>
                {/* Detailed assignment report showing every student's submission status */}
                <table className="results-table">
                    <thead>

                        <tr>

                            <th>Student</th>
                            <th>Assignment</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Submitted On</th>
                        </tr>
                    </thead>

                    <tbody>

                        {detailedReport.map((item, index) => (

                            <tr key={index}>

                                <td>{item.student}</td>
                                <td>{item.assignment}</td>
                                <td>

                                    {item.score !== null
                                        ? `${item.score} / ${item.totalMarks}`
                                        : `- / ${item.totalMarks}`}
                                        
                                </td>
                                {/* Display submission status using a colored badge */}
                                <td>
                                    <span
                                        className={
                                            item.status === "Submitted"
                                                ? "status-submitted"
                                                : "status-not-attempted"
                                        }
                                    >
                                    

                                        {item.status}
                                    </span>
                                    
                                </td>
                                {/* Display the submission date if available */}
                                <td>
                                    {item.submittedAt
                                        ? new Date(item.submittedAt)
                                            .toLocaleString("en-GB")
                                        
                                        : "-"}

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
            </div>
        </div>
    )
    
}

export default AssignmentReportPage