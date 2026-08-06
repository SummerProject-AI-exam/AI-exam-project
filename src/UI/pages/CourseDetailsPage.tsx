import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import TeacherNavbar from '../components/TeacherNavbar'
import Papa from 'papaparse'


type Course = {
    id: string,
    course_name: string,
    course_description: string,
    course_code: string
}

function CourseDetailsPage() {
    const navigate = useNavigate()

    // Get current course id from URL
    const { id } = useParams()

    //Store selected course etails
    const [course, setCourse ] = useState<Course | null>(null)

    //Load course details when open the page
    useEffect(() => {
        fetchCourse()
    }, [])

    //Fetch course data from supabase
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

    //Export Enrolled Student List as CSV file
    const exportStudentList = async () => {
        const { data, error } = await supabase
            .from('Enrollment')
            .select(`
                student_id,
                enrolled_at,
                Student (
                    student_first_name,
                    student_last_name,
                    student_email,
                    student_id
                )    
            `)
            .eq('course_id', id)

        if (error) {
            console.error(error)
            alert('Failed to fetch students')
            return
        } 
        
        //Check any students are enrolled
        if (!data || data.length === 0) {
            alert('No students enrolled')
            return
        }

        // Transfer supabase data into CSV format
        const csvData = data.map((row: any, index: number) => ({
            'No': index + 1,
            'Course': course?.course_name,
            'Student ID': row.Student.student_id,
            'First Name': row.Student.student_first_name,
            'Last Name': row.Student.student_last_name,
            'Email': row.Student.student_email,
            'Enrolled Date': row.enrolled_at
                ? new Date(row.enrolled_at).toLocaleDateString('en-GB')
                : 'N/A'
        }))

        //convert JSON dada into CSV
        const csv = Papa.unparse(csvData)

        //Create a downloadable csv file
        const blob = new Blob(
            [csv],
            { type: 'text/csv;charset=utf-8;' }
        )

        const url = URL.createObjectURL(blob)

        //Automatically trigger whether file downloaded
        const link = document.createElement('a')

        link.href = url
        link.download = `${course?.course_name || 'student-list'}.csv`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="course-details-page">
            <TeacherNavbar />

            <h1 className="page-title">
                Course Details
            </h1>

            <div className="course-header-card">
                
                <h1>{course?.course_name}</h1>

                <p>
                    <strong>Course Code:</strong> {course?.course_code}
                </p>

            
                
                <p>{course?.course_description}</p>
            </div>

            {/* Navigate to assignment management page */}

            <div className="detail-card clickable-card"
                onClick={() => navigate(`/teacher/course/${id}/assignments`)}>
                <h3>Assignments</h3>

                <p>
                    Create and manage assignments
                </p>
            </div>

            {/* Future Exam management section */}
            <div 
                className="detail-card clickable-card"
                onClick={() => navigate(`/teacher/course/${id}/exams`)}
            >
                <h3>Exams</h3>

                <p>
                    Create and manage exams
                </p>
            </div>

            {/* Export enrolled students as CSV */}
            <div 
            className="detail-card"
            
            >
                <h3>Student List</h3>
                <p>Export the enrolled students list</p>

                <button
                    className="create-course-btn"
                    onClick={exportStudentList}
                >
                    Download CSV
                </button>
            </div>
        </div>
    )
}

export default CourseDetailsPage