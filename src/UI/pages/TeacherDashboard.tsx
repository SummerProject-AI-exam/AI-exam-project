import { useState, useEffect } from 'react'
import TeacherNavbar from '../components/TeacherNavbar'
import CreateCourseModal from '../components/CreateCourseModal'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

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

  useEffect(() => {
    fetchActiveCourses()
  }, [])

  const fetchActiveCourses = async () => {
    const teacherId = '32d961cf-b8ff-4e85-8c77-ab151c47e937'
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('Course')
      .select('*')
      .eq('teacher_id', teacherId)
      .lte('scheduled_publish_date', now)
      .gte('course_end_date', now)


      if (error) {
        console.error(error)
        return
      }

      setCourses(data || [])
  }

  return (
    <div>
      <TeacherNavbar onActiveCoursesClick={fetchActiveCourses}/>

      <h1>Teacher Dashboard</h1>

      <button onClick={() => setShowModal(true)}>
        Create Course
      </button>

      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
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
            <p>Ends: {course.course_end_date.split('T')[0]}</p>
            </div>
        ))}
      </div>
    </div>
  )
}

export default TeacherDashboard