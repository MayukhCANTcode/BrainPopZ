import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Play, RotateCcw, Award, ChevronRight, Timer } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Confetti from '../common/Confetti';
import { multiQuestionQuizzes, upcomingReviews } from '../../data/mockData';
import { recordCompletedActivity, getGamificationState } from '../../services/gamification';
import {
  playCorrectSound,
  playIncorrectSound,
  playCelebrationSound,
} from '../../services/soundEffects';

export default function QuizzesView({ initialQuiz }) {
  const [questions, setQuestions] = useState(
    initialQuiz?.questions || multiQuestionQuizzes.default
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [activeQuizTitle, setActiveQuizTitle] = useState(
    initialQuiz?.title || "Raft Consensus & Distributed Systems"
  );

  // Speed Challenge Timer (15s per question)
  const [isTimerMode, setIsTimerMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const currentQ = questions[currentIdx] || questions[0];
  const correctIdx = currentQ?.correctAnswer !== undefined ? currentQ.correctAnswer : (currentQ?.correctIndex ?? 0);

  useEffect(() => {
    if (!isTimerMode || isSubmitted || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerMode, isSubmitted, isCompleted]);

  const handleSelectOption = (idx) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    if (selectedOption === correctIdx) {
      playCorrectSound();
      setScore((prev) => prev + 1);
    } else {
      playIncorrectSound();
      setMissedQuestions((prev) => [...prev, currentQ]);
    }
  };

  const [gameState, setGameState] = useState(() => getGamificationState());
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    if (isCompleted && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      recordCompletedActivity({
        type: 'quiz',
        correctAnswers: score,
        questionsCount: questions.length,
        isPerfectQuiz: score === questions.length,
      });
      setGameState(getGamificationState());
      playCelebrationSound();
    }
  }, [isCompleted, score, questions.length]);

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setTimeLeft(15);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = (quizTitle = activeQuizTitle) => {
    hasRecordedRef.current = false;
    setQuestions(initialQuiz?.questions || multiQuestionQuizzes.default);
    setMissedQuestions([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsCompleted(false);
    setActiveQuizTitle(quizTitle);
    setTimeLeft(15);
  };

  const handleRetestIncorrect = () => {
    if (missedQuestions.length === 0) return;
    hasRecordedRef.current = false;
    setQuestions([...missedQuestions]);
    setMissedQuestions([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsCompleted(false);
    setTimeLeft(15);
  };

  const handleStartSubjectQuiz = (quizItem) => {
    hasRecordedRef.current = false;
    setActiveQuizTitle(quizItem.title);
    setQuestions(multiQuestionQuizzes.default);
    setMissedQuestions([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsCompleted(false);
    setTimeLeft(15);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-xl font-heading font-bold text-white tracking-tight">
            Practice Drills
          </h1>
          <p className="text-xs text-gray-400">
            Active recall multiple-choice testing with detailed scientific rationale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Challenge Toggle */}
          <button
            onClick={() => {
              setIsTimerMode(!isTimerMode);
              setTimeLeft(15);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isTimerMode
                ? 'bg-brand-orange/15 border-brand-orange/40 text-brand-orange'
                : 'bg-surface border-surface-border text-gray-400 hover:text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{isTimerMode ? '15s Timer ON' : 'Untimed'}</span>
          </button>

          <Badge variant="lime" size="md">
            {gameState.totalQuizzesTaken > 0
              ? `${Math.round((gameState.totalCorrectAnswers / (gameState.totalQuizzesTaken * 5)) * 100)}% Accuracy`
              : 'Active Recall'}
          </Badge>
        </div>
      </div>

      {/* Interactive Quiz Card */}
      <Card padding="p-5 sm:p-6" className="border-surface-border relative overflow-hidden">
        {/* Countdown Timer Line (Speed Drill) */}
        {isTimerMode && !isSubmitted && !isCompleted && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-surface-elevated">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 5 ? 'bg-red-400' : 'bg-brand-orange'
              }`}
              style={{ width: `${(timeLeft / 15) * 100}%` }}
            />
          </div>
        )}

        {!isCompleted ? (
          <>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">
                  {currentQ.topic || 'Recall Drill'}
                </Badge>
                <span className="text-xs text-gray-400 hidden sm:inline">• {activeQuizTitle}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {isTimerMode && (
                  <span
                    className={`font-mono font-medium ${
                      timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-brand-orange'
                    }`}
                  >
                    ⏱ {timeLeft}s
                  </span>
                )}
                <span className="font-mono">
                  {currentIdx + 1} of {questions.length}
                </span>
                <span className="text-white font-medium">
                  Score: {score}
                </span>
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-medium text-white mb-4 leading-relaxed">
              {currentQ.question}
            </h3>

            <div className="space-y-2 mb-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === correctIdx;

                let buttonStyle = 'bg-surface-elevated border-surface-border text-gray-300 hover:border-gray-600 cursor-pointer';

                if (isSubmitted) {
                  if (isCorrect) {
                    buttonStyle = 'bg-brand-lime/10 border-brand-lime/40 text-brand-lime font-medium';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = 'bg-red-500/10 border-red-500/30 text-red-400';
                  } else {
                    buttonStyle = 'bg-surface-elevated/40 border-surface-border text-gray-400 opacity-50';
                  }
                } else if (isSelected) {
                  buttonStyle = 'bg-surface-active border-brand-violet/50 text-white font-medium';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${buttonStyle}`}
                  >
                    <span>{opt}</span>
                    {isSubmitted && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-brand-lime shrink-0 ml-2" />}
                    {isSubmitted && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation when submitted */}
            {isSubmitted && (
              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border mb-4 text-xs text-gray-300 animate-fadeIn">
                <span className="font-medium text-brand-lime block mb-0.5">Rationale:</span>
                {currentQ.explanation}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={RotateCcw}
                onClick={() => handleRestart()}
              >
                Restart
              </Button>

              {!isSubmitted ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                >
                  Submit
                </Button>
              ) : (
                <Button
                  variant="lime"
                  size="sm"
                  rightIcon={ChevronRight}
                  onClick={handleNextQuestion}
                >
                  {currentIdx + 1 === questions.length ? 'View Results' : 'Next'}
                </Button>
              )}
            </div>
          </>
        ) : (
          /* Quiz Completed Screen */
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn relative">
            <Confetti trigger={isCompleted} count={60} />
            <div className="w-12 h-12 rounded-xl bg-surface-elevated text-brand-lime flex items-center justify-center border border-surface-border">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">
                Drill Complete
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                You scored <strong className="text-white font-medium">{score} / {questions.length}</strong> ({Math.round((score / questions.length) * 100)}%) on {activeQuizTitle}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {missedQuestions.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={RotateCcw}
                  onClick={handleRetestIncorrect}
                >
                  Retest Incorrect ({missedQuestions.length})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                leftIcon={RotateCcw}
                onClick={() => handleRestart()}
              >
                Retry Full Drill
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Available Quiz List */}
      <div className="pt-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
          Available Subject Drills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {upcomingReviews.map((rev) => (
            <Card key={rev.id} hoverEffect padding="p-4" className="border-surface-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="default" size="sm">
                    {rev.subject}
                  </Badge>
                  <span className="text-[10px] text-gray-400">{rev.difficulty}</span>
                </div>
                <h4 className="font-medium text-xs text-white mb-1">
                  {rev.title}
                </h4>
                <p className="text-[11px] text-gray-400 mb-3">
                  {rev.questions} questions curated for spaced retrieval.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                rightIcon={Play}
                onClick={() => handleStartSubjectQuiz(rev)}
              >
                Start Drill
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
