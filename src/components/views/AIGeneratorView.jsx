import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  RotateCw,
  Layers,
  CheckCircle2,
  Brain,
  Plus,
  Loader2,
  AlertCircle,
  RotateCcw,
  Play,
  SquarePlay,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { generateContent, fetchYouTubeTranscript } from '../../services/api';

const initialCards = [
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

export default function AIGeneratorView({ onSaveDeck, onStartQuiz }) {
  const [format, setFormat] = useState('flashcards'); // flashcards or quiz
  const [deckSize, setDeckSize] = useState(5);
  const [difficulty, setDifficulty] = useState('adaptive');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [cards, setCards] = useState(initialCards);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // YouTube import states
  const [showYouTubeInput, setShowYouTubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);

  // Request race-condition prevention refs
  const abortControllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);

  const handleFetchYouTubeTranscript = async () => {
    if (!youtubeUrl.trim()) {
      setErrorMessage('Please paste a valid YouTube URL first.');
      return;
    }

    setIsFetchingYoutube(true);
    setErrorMessage('');
    try {
      const data = await fetchYouTubeTranscript(youtubeUrl.trim());
      setInputText(data.transcript);
      setGeneratedTitle(data.title);
      setShowYouTubeInput(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch transcript from YouTube.');
    } finally {
      setIsFetchingYoutube(false);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    const trimmedInput = inputText.trim();
    if (!trimmedInput) {
      setErrorMessage('Please enter notes or a concept prompt before generating.');
      return;
    }

    // Abort previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentRequestId = ++latestRequestIdRef.current;

    setIsGenerating(true);
    setErrorMessage('');
    setSavedSuccess(false);

    try {
      const result = await generateContent({
        notes: trimmedInput,
        mode: format,
        difficulty,
        quantity: deckSize,
        signal: controller.signal,
      });

      // Ignore if a newer request was dispatched in the meantime
      if (currentRequestId !== latestRequestIdRef.current) return;

      setGeneratedTitle(result.title);

      if (result.type === 'flashcards' && Array.isArray(result.cards)) {
        const mappedCards = result.cards.map((c, idx) => ({
          id: `card-${Date.now()}-${idx}`,
          question: c.question,
          answer: c.answer,
          difficulty: difficulty,
          topic: result.title,
        }));
        setCards(mappedCards);
      } else if (result.type === 'quiz' && Array.isArray(result.questions)) {
        const mappedQuestions = result.questions.map((q, idx) => ({
          id: `quiz-q-${Date.now()}-${idx}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          correctIndex: q.correctAnswer,
          explanation: q.explanation,
        }));
        setQuizQuestions(mappedQuestions);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (currentRequestId !== latestRequestIdRef.current) return;

      console.error('Generation error:', err);
      setErrorMessage(err.message || 'An error occurred while generating study materials.');
    } finally {
      if (currentRequestId === latestRequestIdRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const toggleFlip = (id) => {
    setFlippedCardId(flippedCardId === id ? null : id);
  };

  const handleSaveDeck = () => {
    setSavedSuccess(true);
    if (onSaveDeck) {
      onSaveDeck({
        id: `deck-${Date.now()}`,
        title: generatedTitle || inputText.slice(0, 35) || 'Generated Study Deck',
        subject: 'AI Generated',
        totalCards: cards.length,
        masteredCards: 0,
        masteryPercentage: 0,
        lastStudied: 'Just now',
        badgeColor: 'violet',
        tags: ['AI', difficulty],
        isBookmarked: false,
        cards: cards.map((c) => ({
          question: c.question,
          answer: c.answer,
          q: c.question,
          a: c.answer,
          difficulty: c.difficulty,
        })),
      });
    }
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-heading font-bold text-zinc-950 tracking-tight">
              AI Generator <span className="font-serif italic font-normal text-zinc-500 text-lg">Studio</span>
            </h1>
            <Badge variant="lime" size="sm">
              Live AI
            </Badge>
          </div>
          <p className="text-xs text-zinc-600">
            Synthesize real interactive flashcards and quiz questions from syllabus topics or lecture notes using AI.
          </p>
        </div>

        <Badge variant="default" size="md">
          Backend Connected
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Form & Configuration */}
        <Card padding="p-4 sm:p-5" className="lg:col-span-1 border-surface-border bg-surface shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-zinc-950 font-medium text-xs pb-2 border-b border-surface-border">
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>Parameters</span>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              Format
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFormat('flashcards')}
                disabled={isGenerating}
                className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                  format === 'flashcards'
                    ? 'bg-brand-violet-lilac text-midnight-ink border-[#C5AFFC] shadow-xs font-semibold'
                    : 'bg-surface-secondary/70 border-surface-border text-zinc-600 hover:text-zinc-950 hover:border-zinc-400'
                }`}
              >
                Flashcards
              </button>
              <button
                type="button"
                onClick={() => setFormat('quiz')}
                disabled={isGenerating}
                className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                  format === 'quiz'
                    ? 'bg-brand-violet-lilac text-midnight-ink border-[#C5AFFC] shadow-xs font-semibold'
                    : 'bg-surface-secondary/70 border-surface-border text-zinc-600 hover:text-zinc-950 hover:border-zinc-400'
                }`}
              >
                Practice Quiz
              </button>
            </div>
          </div>

          {/* Difficulty setting */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              Cognitive Level
            </label>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {['foundational', 'adaptive', 'exam prep'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  disabled={isGenerating}
                  className={`py-1.5 px-2 rounded-lg text-center text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                    difficulty === lvl
                      ? 'bg-midnight-ink text-white font-semibold'
                      : 'bg-surface-secondary/70 border border-surface-border text-zinc-600 hover:text-zinc-950 hover:border-zinc-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Card Count Slider */}
          <div>
            <div className="flex justify-between text-xs text-zinc-700 mb-1.5">
              <span className="text-[11px] text-zinc-500">Quantity</span>
              <span className="font-mono text-xs font-semibold text-zinc-950">{deckSize} items</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={deckSize}
              onChange={(e) => setDeckSize(Number(e.target.value))}
              disabled={isGenerating}
              className="w-full accent-brand-violet-dark cursor-pointer h-1.5 bg-surface-secondary rounded"
            />
          </div>

          {/* Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Topic or Source Material
              </label>
              <button
                type="button"
                onClick={() => setShowYouTubeInput(!showYouTubeInput)}
                className="text-[10px] text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer font-medium"
              >
                <SquarePlay className="w-3 h-3" />
                <span>{showYouTubeInput ? 'Use Manual Notes' : 'Import from YouTube'}</span>
              </button>
            </div>

            {/* YouTube Import Drawer */}
            {showYouTubeInput ? (
              <div className="space-y-2 p-2.5 rounded-lg bg-surface border border-red-300 mb-2 animate-fadeIn">
                <span className="text-[10px] text-zinc-500 block">
                  Paste any YouTube link to fetch captions & lecture notes:
                </span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFetchYouTubeTranscript();
                    }}
                    placeholder="https://youtu.be/... or youtube.com/watch?v=..."
                    className="flex-1 bg-surface border border-surface-border rounded px-2.5 py-1 text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-red-500"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white shrink-0 text-xs py-1"
                    disabled={isFetchingYoutube || !youtubeUrl.trim()}
                    onClick={handleFetchYouTubeTranscript}
                  >
                    {isFetchingYoutube ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Fetching...</span>
                      </span>
                    ) : (
                      'Fetch'
                    )}
                  </Button>
                </div>
              </div>
            ) : null}

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isGenerating}
              placeholder="Paste lecture notes, syllabus concepts, or enter a topic (e.g., Photosynthesis Calvin cycle, TCP handshakes, or Raft consensus)..."
              className="w-full bg-surface border border-surface-border rounded-lg p-2.5 text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-brand-violet-dark focus:ring-1 focus:ring-brand-violet-lilac transition-colors"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1">
            {['Photosynthesis Light Reactions', 'Raft Consensus Algorithm', 'Euler Identity & Proofs'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setInputText(p)}
                disabled={isGenerating}
                className="text-[10px] px-2 py-0.5 rounded bg-surface border border-surface-border text-zinc-600 hover:text-zinc-950 hover:border-zinc-400 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Action button */}
          <Button
            variant="primary"
            fullWidth
            leftIcon={isGenerating ? Loader2 : Sparkles}
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            className={isGenerating ? 'opacity-80' : ''}
          >
            {isGenerating ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Synthesizing with AI...
              </span>
            ) : (
              `Generate ${format === 'quiz' ? 'Quiz with AI' : 'Flashcards with AI'}`
            )}
          </Button>

          {/* Error message with retry */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={RotateCcw}
                  onClick={handleGenerate}
                  className="text-xs h-7 border-red-300 hover:bg-red-100 text-red-700"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved to My Flashcards!</span>
            </div>
          )}
        </Card>

        {/* Right Column: Card Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs text-zinc-950 flex items-center gap-2 uppercase tracking-wider">
              {format === 'flashcards' ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {generatedTitle ? `${generatedTitle} (${cards.length} cards)` : `Generated Flashcards (${cards.length})`}
                  </span>
                </>
              ) : (
                <>
                  <Brain className="w-3.5 h-3.5 text-brand-violet-dark" />
                  <span>
                    {generatedTitle ? `${generatedTitle} (${quizQuestions.length} questions)` : `Generated Quiz (${quizQuestions.length})`}
                  </span>
                </>
              )}
            </h2>

            <div className="flex items-center gap-2">
              {format === 'flashcards' && cards.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Plus}
                  onClick={handleSaveDeck}
                >
                  Save Deck
                </Button>
              )}
              {format === 'quiz' && quizQuestions.length > 0 && onStartQuiz && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={Play}
                  onClick={() => onStartQuiz(quizQuestions, generatedTitle)}
                >
                  Take Quiz
                </Button>
              )}
            </div>
          </div>

          {isGenerating ? (
            <Card padding="p-12" className="border-surface-border bg-surface shadow-xs text-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-violet-dark animate-spin mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-950">Synthesizing with AI...</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Extracting core definitions and formulating validated {format} from your study notes.
              </p>
            </Card>
          ) : format === 'flashcards' ? (
            /* Flashcards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cards.map((card) => {
                const isFlipped = flippedCardId === card.id;

                return (
                  <Card
                    key={card.id}
                    onClick={() => toggleFlip(card.id)}
                    padding="p-4"
                    className={`border transition-colors cursor-pointer min-h-[160px] flex flex-col justify-between select-none shadow-xs ${
                      isFlipped
                        ? 'bg-surface-secondary border-brand-violet-lilac'
                        : 'bg-surface border-surface-border hover:border-zinc-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={isFlipped ? 'violet' : 'default'} size="sm">
                          {isFlipped ? 'Answer' : card.topic || 'Concept'}
                        </Badge>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <RotateCw className="w-3 h-3" />
                          {isFlipped ? 'Question' : 'Flip'}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-zinc-950 leading-relaxed break-words">
                        {isFlipped ? card.answer : card.question}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-surface-border flex items-center justify-between text-[10px] text-zinc-500">
                      <span>{card.difficulty || difficulty}</span>
                      <span className="text-zinc-500">Click to flip</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Quiz Questions List */
            <div className="space-y-3">
              {quizQuestions.length > 0 ? (
                quizQuestions.map((q, idx) => (
                  <Card key={q.id} padding="p-4" className="border-surface-border bg-surface shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default" size="sm">
                        Question {idx + 1}
                      </Badge>
                      <span className="text-[11px] text-zinc-500">Multiple Choice</span>
                    </div>
                    <h4 className="text-xs font-medium text-zinc-950 mb-2.5">
                      {q.question}
                    </h4>
                    <div className="space-y-1 mb-2.5">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded border text-xs flex items-center justify-between ${
                            oIdx === q.correctIndex
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                              : 'bg-surface-secondary/70 border-surface-border text-zinc-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {oIdx === q.correctIndex && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1.5" />}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-600 bg-surface-secondary/70 p-2 rounded border border-surface-border">
                      <strong className="text-zinc-900">Explanation:</strong> {q.explanation}
                    </p>
                  </Card>
                ))
              ) : (
                <Card padding="p-8" className="text-center border-surface-border bg-surface shadow-xs">
                  <Brain className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-zinc-500">
                    Enter notes on the left and click "Generate Quiz with AI" to create interactive questions.
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
