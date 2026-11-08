import React, { useState } from 'react';
import { Sparkles, Sliders, RotateCw, Layers, CheckCircle2, Brain, Plus } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const mockGeneratedCards = [
  {
    id: 1,
    question: "What is the primary role of Long-Term Potentiation (LTP) in synaptic plasticity?",
    answer: "LTP strengthens synaptic connections following high-frequency stimulation, serving as the cellular basis for learning and long-term memory formation.",
    difficulty: "Medium",
    topic: "Neuroscience"
  },
  {
    id: 2,
    question: "Which neurotransmitter receptor is magnesium-blocked until cellular depolarization occurs?",
    answer: "The NMDA receptor. Voltage-dependent ejection of the Mg2+ ion allows Ca2+ influx essential for synaptic strengthening.",
    difficulty: "Hard",
    topic: "Neuroscience"
  },
  {
    id: 3,
    question: "How does the Leader Election phase in Raft ensure single-leader consistency?",
    answer: "Nodes transition to candidate status after a randomized election timeout; a node must obtain a majority vote from peers in a given term to become leader.",
    difficulty: "Hard",
    topic: "Distributed Systems"
  }
];

const mockGeneratedQuizQuestions = [
  {
    id: 101,
    question: "Which enzyme is activated by calcium-calmodulin binding during LTP induction?",
    options: ["CaMKII (Calcium/Calmodulin-dependent Protein Kinase II)", "Tyrosine Kinase", "DNA Polymerase III", "Phosphofructokinase-1"],
    correctIndex: 0,
    explanation: "CaMKII is autophosphorylated upon Ca2+/calmodulin binding and remains active even after calcium levels decline, locking in synaptic potentiation."
  },
  {
    id: 102,
    question: "What prevents split-brain conditions during Raft leader election?",
    options: ["GPS synchronized clocks", "Requiring a strict majority (N/2 + 1) quorum for each term", "Heartbeat packets every 5ms", "Central arbitrator server"],
    correctIndex: 1,
    explanation: "Because any two majorities must share at least one node, at most one candidate can win the election for a given term."
  }
];

export default function AIGeneratorView({ onSaveDeck }) {
  const [format, setFormat] = useState('flashcards'); // flashcards or quiz
  const [deckSize, setDeckSize] = useState(15);
  const [difficulty, setDifficulty] = useState('Adaptive');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cards, setCards] = useState(mockGeneratedCards);
  const [quizQuestions, setQuizQuestions] = useState(mockGeneratedQuizQuestions);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    const effectiveTopic = inputText.trim() || "Multivariable Calculus: Gradient Descent Optimization";
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      if (format === 'flashcards') {
        setCards([
          {
            id: Date.now(),
            question: `Core Definition: ${effectiveTopic}`,
            answer: `Key theoretical formula and practical application for ${effectiveTopic} synthesized from textbook lecture material.`,
            difficulty: difficulty,
            topic: effectiveTopic.split(':')[0] || "Advanced Topic"
          },
          ...cards
        ]);
      } else {
        setQuizQuestions([
          {
            id: Date.now(),
            question: `Exam Question on ${effectiveTopic}: Which statement accurately describes the optimal constraint?`,
            options: [
              `The gradient vector points in the direction of greatest rate of increase`,
              `The learning rate must approach infinity at local minima`,
              `The Hessian matrix must be strictly negative definite for minima`,
              `Convergence occurs regardless of step size parameter`
            ],
            correctIndex: 0,
            explanation: `By definition, the gradient ∇f(x) points in the direction of steepest ascent; gradient descent takes steps in the negative direction.`
          },
          ...quizQuestions
        ]);
      }
    }, 800);
  };

  const toggleFlip = (id) => {
    setFlippedCardId(flippedCardId === id ? null : id);
  };

  const handleSaveDeck = () => {
    setSavedSuccess(true);
    if (onSaveDeck) {
      onSaveDeck({
        id: `deck-${Date.now()}`,
        title: inputText.trim() || "AI Generated Study Deck",
        subject: "General Studies",
        totalCards: cards.length,
        masteredCards: 0,
        masteryPercentage: 0,
        lastStudied: "Just now",
        badgeColor: "violet",
        tags: ["AI Generated", difficulty],
        isBookmarked: false,
        cards: cards.map((c) => ({ q: c.question, a: c.answer, difficulty: c.difficulty }))
      });
    }
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-xl font-heading font-bold text-white tracking-tight">
            AI Generator
          </h1>
          <p className="text-xs text-gray-400">
            Synthesize flashcards and quiz questions from syllabus topics or lecture notes.
          </p>
        </div>

        <Badge variant="default" size="md">
          84 / 100 AI Credits Remaining
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Form & Configuration */}
        <Card padding="p-4 sm:p-5" className="lg:col-span-1 border-surface-border space-y-4">
          <div className="flex items-center gap-2 text-white font-medium text-xs pb-2 border-b border-surface-border">
            <Sliders className="w-3.5 h-3.5 text-gray-400" />
            <span>Parameters</span>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Format
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFormat('flashcards')}
                className={`py-1.5 px-2.5 rounded-md border text-center font-medium transition-colors cursor-pointer ${
                  format === 'flashcards'
                    ? 'bg-surface-elevated border-brand-violet/40 text-white'
                    : 'bg-transparent border-surface-border text-gray-400 hover:text-white'
                }`}
              >
                Flashcards
              </button>
              <button
                type="button"
                onClick={() => setFormat('quiz')}
                className={`py-1.5 px-2.5 rounded-md border text-center font-medium transition-colors cursor-pointer ${
                  format === 'quiz'
                    ? 'bg-surface-elevated border-brand-violet/40 text-white'
                    : 'bg-transparent border-surface-border text-gray-400 hover:text-white'
                }`}
              >
                Practice Quiz
              </button>
            </div>
          </div>

          {/* Difficulty setting */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Cognitive Level
            </label>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {['Foundational', 'Adaptive', 'Exam Prep'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-1 px-1.5 rounded border text-center text-[11px] transition-colors cursor-pointer ${
                    difficulty === lvl
                      ? 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime font-medium'
                      : 'bg-transparent border-surface-border text-gray-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Card Count Slider */}
          <div>
            <div className="flex justify-between text-xs text-gray-300 mb-1.5">
              <span className="text-[11px] text-gray-400">Quantity</span>
              <span className="font-mono text-xs">{deckSize} cards</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={deckSize}
              onChange={(e) => setDeckSize(Number(e.target.value))}
              className="w-full accent-brand-violet cursor-pointer h-1 bg-surface-elevated rounded"
            />
          </div>

          {/* Input Area */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Topic or Source Material
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste notes, syllabus items, or enter a core concept..."
              className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-violet/60 focus:ring-1 focus:ring-brand-violet/50 transition-colors"
            />
          </div>

          <Button
            variant="primary"
            fullWidth
            leftIcon={Sparkles}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Synthesizing...' : `Generate ${format === 'quiz' ? 'Quiz Questions' : 'Cards'}`}
          </Button>

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved to My Flashcards</span>
            </div>
          )}
        </Card>

        {/* Right Column: Card Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs text-white flex items-center gap-2 uppercase tracking-wider">
              {format === 'flashcards' ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-brand-lime" />
                  <span>Preview ({cards.length} cards)</span>
                </>
              ) : (
                <>
                  <Brain className="w-3.5 h-3.5 text-brand-violet" />
                  <span>Preview ({quizQuestions.length} questions)</span>
                </>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {format === 'flashcards' && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Plus}
                  onClick={handleSaveDeck}
                >
                  Save Deck
                </Button>
              )}
            </div>
          </div>

          {format === 'flashcards' ? (
            /* Flashcards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cards.map((card) => {
                const isFlipped = flippedCardId === card.id;

                return (
                  <Card
                    key={card.id}
                    onClick={() => toggleFlip(card.id)}
                    padding="p-4"
                    className={`border transition-colors cursor-pointer min-h-[160px] flex flex-col justify-between select-none ${
                      isFlipped
                        ? 'bg-surface-elevated border-brand-lime/30'
                        : 'border-surface-border hover:border-gray-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={isFlipped ? 'lime' : 'default'} size="sm">
                          {isFlipped ? 'Answer' : card.topic}
                        </Badge>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <RotateCw className="w-3 h-3" />
                          {isFlipped ? 'Question' : 'Flip'}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-white leading-relaxed">
                        {isFlipped ? card.answer : card.question}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-surface-border flex items-center justify-between text-[10px] text-gray-400">
                      <span>{card.difficulty}</span>
                      <span className="text-gray-400">Click to flip</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Quiz Questions List */
            <div className="space-y-3">
              {quizQuestions.map((q, idx) => (
                <Card key={q.id} padding="p-4" className="border-surface-border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" size="sm">
                      Question {idx + 1}
                    </Badge>
                    <span className="text-[11px] text-gray-400">Multiple Choice</span>
                  </div>
                  <h4 className="text-xs font-medium text-white mb-2.5">
                    {q.question}
                  </h4>
                  <div className="space-y-1 mb-2.5">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded border text-xs flex items-center justify-between ${
                          oIdx === q.correctIndex
                            ? 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime font-medium'
                            : 'bg-surface-elevated border-surface-border text-gray-300'
                        }`}
                      >
                        <span>{opt}</span>
                        {oIdx === q.correctIndex && <CheckCircle2 className="w-3.5 h-3.5 text-brand-lime shrink-0 ml-1.5" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 bg-surface-elevated p-2 rounded border border-surface-border">
                    <strong className="text-gray-300">Explanation:</strong> {q.explanation}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
