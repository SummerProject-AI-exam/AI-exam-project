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

        const loadDashboard = async () => {

            const { data, error } = await supabase
                .from('Enrollment')
                .select('course_id')
                .eq('student_id', currentUser.id)

            if (error) {
                console.error(error)
                return
            }

            const ids = data?.map(item => item.course_id) || []

            setEnrolledCourses(data || [])

            await fetchUpcomingAssignments(ids)

            await fetchUpcomingExams(ids)


        }

        loadDashboard()
        
    }, [])

    

    const fetchUpcomingAssignments = async (
        enrolledCourseIds: string[]
    ) => {

        if (enrolledCourseIds.length === 0) {
            setUpcomingAssignments([])
            return
        }

        const { data, error } = await supabase
            .from('Assignment')
            .select(`
                *,
                Course (
                    course_name
                )
            `)
            .in('course_id', enrolledCourseIds)
            .lte('publish_date', new Date().toISOString())
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

    const fetchUpcomingExams = async (
        enrolledCourseIds: string[]
    ) => {

        if (enrolledCourseIds.length === 0) {
            setUpcomingExams([])
            return
        }

        const { data, error } = await supabase
            .from('Exam')
            .select(`
                *,
                Course (
                    course_name
                )
            `)
            .in('course_id', enrolledCourseIds)
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

            <div className="student-dashboard-section">
                <h2>Upcoming Assignments</h2>

                {upcomingAssignments.length === 0 ? (
                    <p>No upcoming assignments</p>
                ) : (
                    upcomingAssignments.map(assignment => (
                        <div
                            key={assignment.id}
                            className="student-dashboard-card"
                        >
                            <h4>
                                {assignment.Course?.course_name}
                            </h4>
                            
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

            <div className="student-dashboard-section">
                <h2>Upcoming Exams</h2>

                {upcomingExams.length === 0 ? (
                    <p>No upcoming exams</p>
                ) : (
                    upcomingExams.map(exam => (
                        <div
                            key={exam.id}
                            className="student-dashboard-card"
                        >
                            <h4>
                                {exam.Course?.course_name}
                            </h4>

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