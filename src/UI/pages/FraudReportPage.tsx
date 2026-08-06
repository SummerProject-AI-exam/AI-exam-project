import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import TeacherNavbar from "../components/TeacherNavbar";


function FraudReportPage() {

    const currentUser = JSON.parse(
        sessionStorage.getItem("currentUser") || "{}"
    )

    //Filters
    const [courses, setCourses] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [eventTypes, setEventTypes] = useState<string[]>([])

    const[selectedCourse, setSelectedCourse] = useState("")
    const [selectedStudent, setSelectedStudent] = useState("all")
    const [selectedEvent, setSelectedEvent] = useState("all")
    const [selectedRisk, setSelectedRisk] = useState("all")

    const [studentSummary, setStudentSummary] = useState<any[]>([])

    const [detailedReport, setDetailedReport] = useState<any[]>([])




    // Summary Cards
    const [summary, setSummary] = useState({
        totalStudents: 0,
        totalEvents: 0,
        highRisk: 0,
        averageConfidence: 0

    })

    // Store fetched fraud events 
    //const [fraudEvents, setFraudEvents] = useState<any[]>([])



    useEffect(() => {
        loadCourses()
        loadEventTypes()
    }, [])

    useEffect(() => {
        if (selectedCourse) {
            loadStudents(selectedCourse)
        }
    }, [selectedCourse])

    //load teacher courses
    const loadCourses = async () => {

        const { data, error } = await supabase
            .from("Course")
            .select("id, course_name")
            .eq("teacher_id", currentUser.id)
            .order("course_name")

        if (error) {
            console.error(error)
            return
        }

        setCourses(data || [])
    }

    //Load students enrolled in selected course
    const loadStudents = async (courseId: string) => {

        const { data, error } = await supabase
            .from("Enrollment")
            .select(`
                student_id,
                Student(
                    id,
                    student_first_name,
                    student_last_name,
                    student_email
                )
            `)
            .eq("course_id", courseId)

        if (error) {
            console.error(error)
            return
        }

        const studentList = data?.map((item: any) => item.Student) || []

        setStudents(studentList)
    }

    //Load all available fraud event types
    const loadEventTypes = async () => {

        const { data, error } = await supabase
            .from("Fraud_Events")
            .select("event_type")

        if (error) {
            console.error(error)
            return
        }

        const uniqueEvents = [
            ...new Set(
                data.map((item: any) => item.event_type)
            )
        ]

        setEventTypes(uniqueEvents as string[])
    }

    const handleGenerateReport = async () => {

        if (!selectedCourse) {
            alert("Please select a course")
            return
        }

        //Load fraud events
        await loadFraudReport()

    }

    // Determine the risk level for a fraud event
    const getRiskLevel = (event: any): "High" | "Medium" | "Low" => {

        //Use Confidence when available
        if (event.confidence !== null && event.confidence !== undefined) {

            if (event.confidence >= 0.8) return "High"
            if (event.confidence >= 0.5) return "Medium"

            return "Low"
        }

        // Otherwise determine the risk by event type
        switch (event.event_type?.toLowerCase()) {

            // High Risk
            case "camera_blocked":
            case "camera_off":
            case "multiple_faces":
            case "gaze_eyes_covered":
            case "fraud_gaze":
                return "High"

            // Medium Risk
            case "window_blur":
            case "no_face":
            case "camera_not_ready":
            case "gaze_looking_away":
            case "gaze_looking_away_left":
            case "gaze_looking_away_right":
            case "gaze_looking_away_up":
            case "gaze_looking_away_down":
            case "gaze_drift_too_far":
            case "gaze_rapid_changes":
            case "pose_too-left":
            case "pose_too_right":
            case "pose_too_up":
            case "pose_too_down":
            case "pose_down":
                return "Medium"

            // Everything else
            default:
                return "Low"
        }
    }

    const loadFraudReport = async () => {

        const { data, error } = await supabase
            .from("Exam_Sessions")
            .select(`
                student_id,
                exam_id,
                Fraud_Events(
                    id,
                    event_type,
                    confidence,
                    details,
                    timestamp
                )
            `)

        if (error) {
            console.error(error)
            return
        }

        let events: any[] = []

        data.forEach((session: any) => {

            session.Fraud_Events.forEach((event: any) => {

                events.push({

                    student_id: session.student_id,
                    exam_id: session.exam_id,
                    event_type: event.event_type,
                    confidence: event.confidence,
                    details: event.details,
                    timestamp: event.timestamp

                })
            })
        })

        //Filter by selected student
        if (selectedStudent !== "all") {

            events = events.filter(
                event => event.student_id === selectedStudent
            )
        }

        //Filter by event type
        if (selectedEvent !== "all") {

            events = events.filter(
                event => event.event_type === selectedEvent
            )
        }

        //Filter by risk level
        if (selectedRisk !== "all") {

            events = events.filter(event =>
                getRiskLevel(event).toLowerCase() === selectedRisk 

                /*if (selectedRisk === "high")
                    return event.confidence >= 0.8

                if (selectedRisk === "medium")
                    return (
                        event.confidence >= 0.5 &&
                        event.confidence < 0.8
                    )

                return event.confidence < 0.5 */

            )
        }

        //setFraudEvents(events)

        // Summary Cards
        const uniqueStudents = new Set(
            events.map(event => event.student_id)
        )

        const highRiskEvents = events.filter(
            event => getRiskLevel(event) === "High"
            //event => event.confidence >= 0.8
        )

        const totalConfidence = events.reduce(
            (sum, event) => sum + event.confidence,
            0
        )

        setSummary({

            totalStudents: uniqueStudents.size,
            totalEvents: events.length,
            highRisk: highRiskEvents.length,
                averageConfidence:
                events.length > 0
                    ? Number(
                        (
                            totalConfidence / events.length
                        ).toFixed(2)
                    )
                    : 0

        })

        //Build student fraud summary
        const summaryRows = students.map(student => {

            const studentEvents = events.filter(
                event => event.student_id === student.id
            )

            const highRisk = studentEvents.filter(
                event => getRiskLevel(event) === "High"
            ).length

            const mediumRisk = studentEvents.filter(
                event => getRiskLevel(event) === "Medium"
            ).length

            const lowRisk = studentEvents.filter(
                event => getRiskLevel(event) === "Low"
            ).length

            return {
                student:
                `${student.student_first_name} ${student.student_last_name}`,
                email: student.student_email,
                totalEvents: studentEvents.length,
                highRisk,
                mediumRisk,
                lowRisk
            }
        })

        setStudentSummary(summaryRows)

        const reportRows = events.map(event => {

            const student = students.find(
                s => s.id === event.student_id
            )

            /*let risk = "Low"

            if (event.confidence >= 0.8)
                risk = "High"

            else if (event.confidence >= 0.5)
                risk = "Medium" */

            const risk = getRiskLevel(event)

            return {

                student:
                    student
                        ? `${student.student_first_name} ${student.student_last_name}`
                        : "Unknown",
                email: student?.student_email ?? "-",

                eventType: event.event_type,
                //confidence: event.confidence,
                risk,
                timestamp: event.timestamp,
                details: event.details
            }
        })

        let filteredRows = reportRows

        if (selectedRisk !== "all") {

            filteredRows = filteredRows.filter(
                row =>
                    row.risk.toLowerCase() === selectedRisk
            )

        }

        if (selectedStudent !== "all") {

            const student = students.find(
                s => s.id === selectedStudent
            )

            const fullName = `${student?.student_first_name} ${student?.student_last_name}`

            filteredRows = filteredRows.filter(
                row => row.student === fullName
            )
        }

        if (selectedEvent !== "all") {

            filteredRows = filteredRows.filter(
                row => row.eventType === selectedEvent

            )
        }

        //Save filtered rows to state
        setDetailedReport(filteredRows)
    }
    

    return (
        <div>

            <TeacherNavbar />

            <div className="report-container">

                <h1>Fraud Report</h1>

                <div className="report-filters">

                    {/* Course */}

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

                    {/* Student */}

                    <div>

                        <label>Student</label>

                        <select
                            value={selectedStudent}
                            onChange={(e) =>
                                setSelectedStudent(e.target.value)
                            }
                        >
                            <option value="all">
                                All Students
                            </option>

                            {students.map(student => (

                                <option
                                    key={student.id}
                                    value={student.id}
                                >
                                    {student.student_first_name} {student.student_last_name}
                                </option>
                            ))}

                        </select>
                    </div>

                    {/* Event */}

                    <div>

                        <label>Event Type</label>

                        <select
                            value={selectedEvent}
                            onChange={(e) => 
                                setSelectedEvent(e.target.value)
                            }
                        >
                            <option value="all">
                                All Events
                            </option>

                            {eventTypes.map(event => (

                                <option
                                    key={event}
                                    value={event}
                                >
                                    {event}
                                </option>

                            ))}

                        </select>
                    </div>

                    {/* Risk */}

                    <div>

                        <label>Risk Level</label>

                        <select
                            value={selectedRisk}
                            onChange={(e) =>
                                setSelectedRisk(e.target.value)
                            }
                        >
                            <option value="all">All</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>


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
                        <h1>{summary.totalStudents}</h1>
                    </div>

                    <div className="summary-card">

                        <h3>Total Fraud Events</h3>
                        <h1>{summary.totalEvents}</h1>
                    </div>

                    <div className="summary-card">

                        <h3>High Risk Events</h3>
                        <h1>{summary.highRisk}</h1>
                    </div>

                    <div className="summary-card">
                        <h3>Average Confidence</h3>
                        <h1>{summary.averageConfidence}</h1>
                    </div>

                </div>

                <h2 className="report-section">
                    Student Fraud Summary
                </h2>
                <div className="report-table-container">
                    <table className="results-table">

                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Email</th>
                                <th>Total Events</th>
                                <th>High Risk</th>
                                <th>Medium Risk</th>
                                <th>Low Risk</th>
                            </tr>
                        </thead>

                        <tbody>
                            {studentSummary.map((item, index) => (

                                <tr key={index}>

                                    <td>{item.student}</td>
                                    <td>{item.email}</td>
                                    <td>{item.totalEvents}</td>
                                    <td>{item.highRisk}</td>
                                    <td>{item.mediumRisk}</td>
                                    <td>{item.lowRisk}</td>

                                </tr>
                            ))}


                        </tbody>
                    </table>
                    
                </div>

                <h2 className="report-section">
                    Detailed Fraud Report
                </h2>

                <div className="report-table-container">
                    <table className="results-table">

                        <thead>

                            <tr>

                                <th>Student</th>
                                <th>Email</th>
                                <th>Event Type</th>
                                <th>Risk</th>
                                <th>Date & Time</th>
                                <th>Details</th>


                            </tr>
                        </thead>

                        <tbody>

                            {detailedReport.map((item, index) => (

                                <tr key={index}>

                                    <td>{item.student}</td>
                                    <td>{item.email}</td>
                                    <td>{item.eventType}</td>
                                    

                                    <td>
                                        <span
                                            className={
                                                item.risk === "High"
                                                    ? "risk-high"
                                                    : item.risk === "Medium"
                                                    ? "risk-medium"
                                                    : "risk-low"
                                            }
                                        >
                                            {item.risk}
                                        </span>
                                    </td>

                                    <td>

                                        {new Date(item.timestamp)
                                            .toLocaleString("en-GB")}
                                    </td>

                                    <td>

                                        <button
                                            className="details-btn"
                                            onClick={() =>
                                                alert(JSON.stringify(
                                                    item.details,
                                                    null,
                                                    2
                                                ))
                                            }
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>


            </div>


        </div>
    )
}

export default FraudReportPage