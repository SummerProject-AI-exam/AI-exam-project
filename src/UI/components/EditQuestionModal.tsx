import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
    questionData: any
    tableName: string
    onClose: () => void
    onUpdated: () => void
}

function EditQuestionModal ({ questionData, tableName, onClose, onUpdated}: Props) {
    const [question, setQuestion] = useState(questionData.question)
    const [answerA, setAnswerA] = useState(questionData.answer_a)
    const [answerB, setAnswerB] = useState(questionData.answer_b)
    const [answerC, setAnswerC] = useState(questionData.answer_c)
    const [answerD, setAnswerD] = useState(questionData.answer_d)
    const [answerE, setAnswerE] = useState(questionData.answer_e || '')
    const [answerF, setAnswerF] = useState(questionData.answer_f || '')

    const [showAnswerE, setShowAnswerE] = useState(
        !!questionData.answer_e
    )
    
    const [showAnswerF, setShowAnswerF] = useState(
        !!questionData.answer_f
    )
    //const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(questionData.allow_multiple_answers)
    const [correctAnswers, setCorrectAnswers] = useState<string[]>(
        questionData.correct_answers 
            ? questionData.correct_answers.split(',') 
            : []
    )
    const [score, setScore] = useState(String(questionData.score))

    const handleUpdate = async () => {

        if (correctAnswers.length === 0) {
            alert('Please select at least one correct answer')
            return
        }

        const { error } = await supabase
            //.from('assignment_questions')
            .from(tableName)
            .update({
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
            })
            .eq('id', questionData.id)

        if (error) {
            console.error(error)
            alert('Failed to update question')
            return
        }   
        
        alert('Question updated sucessfully')

        onUpdated()
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

                <h2>Edit MCQ Question</h2>

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

                {!showAnswerE && (
                    <button
                        type="button"
                        onClick={() => setShowAnswerE(true)}
                    >
                        Add Option
                    </button>
                )}

                {showAnswerE && !showAnswerF && (
                    <button
                        type="button"
                        onClick={() => setShowAnswerF(true)}
                    >
                        Add Option
                    </button>
                )}
                
                {showAnswerE && (
                    <input
                    type="text"
                    placeholder="Answer E"
                    value={answerE}
                    onChange={(e) => setAnswerE(e.target.value)}
                />
                )}
                {showAnswerF && (
                    <input
                    type="text"
                    placeholder="Answer F"
                    value={answerF}
                    onChange={(e) => setAnswerF(e.target.value)}
                />
                )}
                

                <label>Correct Answer</label>

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
                    <button onClick={handleUpdate}>
                        Update Question
                    </button>

                    <button onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditQuestionModal