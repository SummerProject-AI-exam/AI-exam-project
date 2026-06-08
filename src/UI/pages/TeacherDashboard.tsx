import { useState, useEffect } from 'react'
import TeacherNavbar from '../components/TeacherNavbar'
import CreateCourseModal from '../components/CreateCourseModal'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'

type Course = {
  id: string
  course_name: string
  course_code: string
  course_description: string
  scheduled_publish_date: string
  course_end_date: string
  teacher_id: string
}

function TeacherDashboard() {

  const navigate = useNavigate()


  const [showModal, setShowModal] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])

  const [searchParams] = useSearchParams()

  useEffect(() => {
    const view = searchParams.get('view')

    if (view === 'previous') {
      fetchPreviousCourses()
    } else {
      fetchActiveCourses()
    }
  }, [searchParams])

  

  const fetchActiveCourses = async () => {
    const currentUser = JSON.parse(
      sessionStorage.getItem('currentUser') || '{}'
    )
    const teacherId = currentUser.id
    //const teacherId = '32d961cf-b8ff-4e85-8c77-ab151c47e937'
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('Course')
      .select('*')
      .eq('teacher_id', teacherId)
      //.lte('scheduled_publish_date', now)
      .gte('course_end_date', now)


      if (error) {
        console.error(error)
        return
      }

      setCourses(data || [])
  }

  //Fetching previous courses
  const fetchPreviousCourses = async () => {
    const currentUser = JSON.parse(
      sessionStorage.getItem('currentUser') || '{}'
    )
    const teacherId = currentUser.id
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('Course')
      .select('*')
      .eq('teacher_id', teacherId)
      .lt('course_end_date', now)


    console.log("Previous courses:", data)

    if (error) {
      console.error(error)
      return
    }

    setCourses(data || [])

  }

  return (
    <div>
      <TeacherNavbar 
      onActiveCoursesClick={fetchActiveCourses}
      onPreviousCoursesClick={fetchPreviousCourses}/>

      <h1>Teacher Dashboard</h1>

      <button 
      className="create-course-btn"
      onClick={() => setShowModal(true)}>
        Create Course
      </button>

      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onCreated={fetchActiveCourses}
        />
      )}

      <div className="course-list">
        {courses.map((course) => (
          <div 
          key={course.id} 
          className="course-card"
          onClick={() => navigate(`/teacher/course/${course.id}`)}
          >
            <h3>{course.course_name}</h3>
            <p>Code: {course.course_code}</p>
            <p>{course.course_description}</p>
            <p>
              Publish:
              {" "}
              {new Date(course.scheduled_publish_date)
                .toLocaleDateString("en-GB")}
            </p>
            <p>
              Ends:
              {" "}
              {new Date(course.course_end_date)
                .toLocaleDateString("en-GB")}
              </p>
            </div>
        ))}
      </div>
    </div>
  )
}

export default TeacherDashboard