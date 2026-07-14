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

    const handleGenerateReport = () => {

        console.log({
            course: selectedCourse,
            assignment: selectedAssignment,
            status: selectedStatus
        })

        //Phase 2
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
                
            </div>
        </div>
    )
    
}

export default AssignmentReportPage