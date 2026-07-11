import { useNavigate } from "react-router-dom";
import TeacherNavbar from "../components/TeacherNavbar";

function ReportsPage() {

    const navigate = useNavigate()
    return (
        <div>
            <TeacherNavbar />

            <div className="reports-grid">
                <div 
                    className="report-card"
                    onClick={() => navigate('teacher/reports/live-monitoring')}
                >
                    <h3>Live Monitoring</h3>
                    <p>Monitor students and suspecious events during active exams</p>
                </div>

                <div
                    className="report-card"
                    onClick={() => navigate('teacher/reports/assignment-report')}
                >
                    <h3>Assignment Report</h3>
                    <p>View assignment submissions, scores and missing submissions</p>
                </div>
                <div
                    className="report-card"
                    onClick={() => navigate('teacher/reports/exam-report')}
                >
                    <h3>Exam Report</h3>
                    <p>View exam scores, submissions and overall student performance</p>
                </div>

                <div
                    className="report-card"
                    onClick={() => navigate('teacher/reports/fraud-report')}
                >
                    <h3>Fraud Report</h3>
                    <p>Review historical fraud events recorded during examinations</p>
                </div>
            </div>

        </div>
    )
}

export default ReportsPage