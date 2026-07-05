import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from '../lib/supabase';
import StudentNavbar from "../components/StudentNavbar";
import { formatDuration } from "../utils/formatDuration";


function StudentCourseDetailsPage() {


    const { id } = useParams()

    const navigate = useNavigate()

    const [course, setCourse ] = useState<any>(null)
    const [assignments, setAssignments ] = useState<any[]>([])
    const [exams, setExams] = useState<any[]>([])

    useEffect(() => {
        fetchCourse()
        fetchAssignments()
        fetchExams()
    }, [id])

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

    const fetchAssignments = async () => {

        const { data, error } = await supabase
            .from('Assignment')
            .select('*')
            .eq('course_id', id)
            .lte('publish_date', new Date().toISOString())
            .order('due_date', {ascending: true})

        if (error) {
            console.error(error)
            return
        }

        setAssignments(data || [])
    }

    const fetchExams = async () => {

        const { data, error } = await supabase
            .from('Exam')
            .select('*')
            .eq('course_id', id)
            .order('start_time', {ascending: true})

        if (error) {
            console.error()
            return
        }

        setExams(data || [])
    }

    return (
        <div>
            <StudentNavbar />

            <div className="student-page-container">
                <div className="student-detail-card">
                    <h1>{course?.course_name}</h1>

                    <p>
                        {course?.course_description}
                    </p>
                    <p>
                        Course Code:
                        {' '}
                        {course?.course_code}
                    </p>
                </div>

                <h2>Assignments</h2>

                {assignments.length === 0 ? (
                    <p>No assignments available.</p>
                ) : (
                    assignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className="student-dashboard-card"
                            onClick={() => navigate(`/student/assignment/${assignment.id}`)}
                            style={{cursor: 'pointer'}}
                        >
                            <h3>
                                {assignment.title}
                            </h3>

                            <p>
                                Due:
                                {' '}
                                {new Date(assignment.due_date).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    ))
                )}

                <h2>Exams</h2>

                {exams.length === 0 ? (
                    <p>No exams available</p>
                ) : (
                    exams.map((exam) => (
                        <div
                            key={exam.id}
                            className="student-dashboard-card"
                            onClick={() => navigate(`/student/exam/${exam.id}`)}
                            style={{cursor: 'pointer'}}
                        >
                            <h3>
                                {exam.title}
                            </h3>

                            <p>
                                Starts:
                                {' '}
                                {new Date(exam.start_time).toLocaleDateString(
                                    'en-GB',
                                    {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour:'2-digit',
                                        minute: '2-digit'
                                    }
                                )}
                            </p>

                            <p>
                                Duration:
                                {' '}
                                {formatDuration(exam.duration_time)}
                               
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default StudentCourseDetailsPage