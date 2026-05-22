import { useState } from 'react'
import TeacherNavbar from './components/TeacherNavbar'
import CreateCourseModal from './components/CreateCourseModal'

function TeacherDashboard() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <TeacherNavbar />

      <h1>Teacher Dashboard</h1>

      <button onClick={() => setShowModal(true)}>
        Create Course
      </button>

      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default TeacherDashboard