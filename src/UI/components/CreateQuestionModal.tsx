import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
    assignmentId: string
    onClose: () => void
    onCreated: () => void
}

function CreateQuestionModal({ assignmentId, onClose, onCreated}: Props) {
    const [question, setQuestion] = useState('')
    const [answerA, setAnswerA] = useState('')
    const [answerB, setAnswerB] = useState('')
    const [answerC, setAnswerC] = useState('')
    const [answerD, setAnswerD] = useState('')
    const [answerE, setAnswerE] = useState('')
    const [answerF, setAnswerF] = useState('')

    //const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false)

    const [correctAnswers, setCorrectAnswers] = useState<string[]>([])

    const [score, setScore] = useState('1')

    const handleSubmit = async () => {

        if (
            !question ||
            !answerA ||
            !answerB ||
            !answerC ||
            !answerD
        ) {
            alert('Please fill all fields')
            return
        }

        if (correctAnswers.length === 0) {
            alert('Please select at least one correct answer')
            return
        }

        const { error } = await supabase
            .from('assignment_questions')
            .insert([
                {
                    assignment_id: assignmentId,

                    question,

                    answer_a: answerA,
                    answer_b: answerB,
                    answer_c: answerC,
                    answer_d: answerD,
                    answer_e: answerE,
                    answer_f: answerF,

                    correct_answers: correctAnswers.join(','),

                    allow_multiple_answers: correctAnswers.length > 1,

                    score: Number(score)
                }
            ])

            if (error) {
                console.error(error)
                //alert('Failed to create question')
                alert(error.message)
                return
            }

            alert('Question created successfully')

            onCreated()
            onClose()

    }

    const toggleCorrectAnswer = (answer: string) => {

        if (correctAnswers.includes(answer)) {
            setCorrectAnswers(
                correctAnswers.filter(a => a !== answer)
            )
        } else {
            setCorrectAnswers([
                ...correctAnswers,
                answer
            ])
        }
    }

    

    return (
        <div className="modal-overlay">
            <div className="modal">

                <h2>Add MCQ Question</h2>

                <textarea
                    placeholder="Question"
                    value={question}
                    onChange={(e) =>
                        setQuestion(e.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Answer A"
                    value={answerA}
                    onChange={(e) => setAnswerA(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Answer B"
                    value={answerB}
                    onChange={(e) => setAnswerB(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Answer C"
                    value={answerC}
                    onChange={(e) => setAnswerC(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Answer D"
                    value={answerD}
                    onChange={(e) => setAnswerD(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Answer E"
                    value={answerE}
                    onChange={(e) => setAnswerE(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Answer F"
                    value={answerF}
                    onChange={(e) => setAnswerF(e.target.value)}
                />

                <label>Correct Answer</label>
                {/*
                <select 
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                </select> 
                <label>
                    <input
                        type="checkbox"
                        checked={allowMultipleAnswers}
                        onChange={(e) => setAllowMultipleAnswers(e.target.checked)}
                    />
                    Multiple Correct Answers
                </label>*/}

                <div className="answer-selector">
                    {['A', 'B', 'C', 'D', 'E', 'F'].map(answer => (
                        <label key={answer} className="answer-option">
                            <input
                                type="checkbox"
                                checked={
                                    correctAnswers.includes(answer)
                                }
                                onChange={() => toggleCorrectAnswer(answer)}
                            />
                            {answer}
                        </label>
                    ))}
                </div>

                <input
                    type="number"
                    placeholder="Score"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                />

                <div className="modal-buttons">
                    <button onClick={handleSubmit}>
                        Save Question
                    </button>

                    <button onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateQuestionModal


