import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MonitoringDemo from './window_blur_focus/pages/MonitorDemo'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/focus-monitor" element={<MonitoringDemo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
