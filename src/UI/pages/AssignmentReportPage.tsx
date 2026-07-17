import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import TeacherNavbar from "../components/TeacherNavbar";



function AssignmentReportPage() {

    const currentUser = JSON.parse(
        sessionStorage.getItem("currentUser") || "{}"
    )

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

    useEffect(() => {
        loadCourses()
    }, [])

    useEffect(() => {
        if (selectedCourse) {
            loadAssignments(selectedCourse)
        }
    }, [selectedCourse])

    //Load teacher's courses
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

    //Load assignments for selected course
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

    const handleGenerateReport = async () => {

        if (!selectedCourse) {
            alert("Please select a course")
            return
        }

        //Get enrolled students

        const { data: enrollments } = await supabase
            .from("Enrollment")
            .select("student_id")
            .eq("course_id", selectedCourse)

        const totalStudents = enrollments?.length || 0

        //Get assignments
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

        //Calculating missing

        const expected = totalStudents * totalAssignments

        const missing = expected - submitted

        setSummary({
            totalStudents,
            totalAssignments,
            submitted,
            missing
        })

        await loadStudentsSummary()
    }

    const loadStudentsSummary = async () => {

        //Get enrolled students
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

        //Get submissions
        const { data: submissions } = await supabase
            .from("assignment_submissions")
            .select(`
                assignment_id,
                student_id,
                status
            `)
            .in("assignment_id", assignmentIds)

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

        setStudentSummary(rows)

        
    }

    return (

        <div>

            <TeacherNavbar />

            <div className="report-container">
                <h1>Assignment Report</h1>

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
                
            </div>
        </div>
    )
    
}

export default AssignmentReportPage