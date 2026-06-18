import { useEffect, useState  } from "react"
import { supabase } from '../lib/supabase'
import StudentNavbar from '../components/StudentNavbar'


function StudentDashboard() {

    const currentUser = JSON.parse(
        sessionStorage.getItem('currentUser') || '{}'
    )

    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
    const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([])
    const [upcomingExams, setUpcomingExams] = useState<any[]>([])

    useEffect(() => {
        fetchEnrolledCourses()
        fetchUpcomingAssignments()
        fetchUpcomingExams()
    }, [])

    const fetchEnrolledCourses = async () => {

        const { data, error} = await supabase
            .from('Enrollment')
            .select(`
                course_id,
                Course (
                    id,
                    course_name
                )
            `)
            .eq('stuent_id', currentUser.id)

        if (error) {
            console.error(error)
            return
        }

        setEnrolledCourses(data || [])
    }

    const fetchUpcomingAssignments = async () => {
        const { data, error } = await supabase
            .from('Assignment')
            .select('*')
            .gte(
                'due_date',
                new Date().toISOString()
            )
            .order('due_date', {
                ascending: true
            })
            .limit(5)


        if (error) {
            console.error(error)
            return
        }

        setUpcomingAssignments(data || [])
    }

    const fetchUpcomingExams = async () => {

        const { data, error } = await supabase
            .from('Exam')
            .select('*')
            .gte(
                'start_time',
                new Date().toISOString()
            )
            .order('start_time', {
                ascending: true
            })
            .limit(5)

        if (error) {
            console.error(error)
            return
        }

        setUpcomingExams(data || [])
    }
    return (
        <div className="student-dashboard">

            <StudentNavbar />

            <div className="student-welcome-card">
                <h1>
                    Welcome,
                    {' '}
                    {currentUser.student_first_name}
                    {' '}

                </h1>

                <p>
                    You are enrolled in
                    {' '}
                    {enrolledCourses.length}
                    {' '}
                    course(s)
                </p>
            </div>

            <div className="dashboard-section">
                <h2>Upcoming Assignments</h2>

                {upcomingAssignments.length === 0 ? (
                    <p>No upcoming assignments</p>
                ) : (
                    upcomingAssignments.map(assignment => (
                        <div
                            key={assignment.id}
                            className="dashboard-card"
                        >
                            <h3>{assignment.title}</h3>

                            <p>
                                Due:
                                {' '}
                                {new Date(
                                    assignment.due_date
                                ).toLocaleDateString(
                                    'en-GB'
                                )}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="dashboard-section">
                <h2>Upcoming Exams</h2>

                {upcomingExams.length === 0 ? (
                    <p>No upcoming exams</p>
                ) : (
                    upcomingExams.map(exam => (
                        <div
                            key={exam.id}
                            className="dashboard-card"
                        >
                            <h3>{exam.title}</h3>

                            <p>
                                Starts:
                                {' '}
                                {new Date(
                                    exam.start_time
                                ).toLocaleString(
                                    'en-GB'
                                )}
                            </p>
                        </ div>
                    ))
                )}
            </div>
        </div>
    )
}

export default StudentDashboard