import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Layers,
  Brain,
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Play,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { generateContent } from '../../services/api';
import { recordCompletedActivity } from '../../services/gamification';

const SUGGESTED_TOPICS = [
  { label: '⚡ Quantum Computing', topic: 'Quantum Superposition, Qubits and Quantum Entanglement' },
  { label: '🧬 CRISPR-Cas9', topic: 'CRISPR Cas9 Gene Editing Mechanism and Guide RNA' },
  { label: '💻 Raft Consensus', topic: 'Raft Consensus Algorithm Leader Election and Log Replication' },
  { label: '🧠 Synaptic Plasticity', topic: 'Synaptic Plasticity, Long-Term Potentiation (LTP) and NMDA Receptors' },
  { label: '🌌 Black Holes', topic: 'General Relativity, Event Horizon and Hawking Radiation' },
];

export default function HeroGenerator({ onAddNewDeck, onStartQuiz, onStudyDeck }) {
  const [activeTab, setActiveTab] = useState('topic'); // 'topic' | 'notes' | 'upload'
  const [topicInput, setTopicInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [mode, setMode] = useState('flashcards'); // 'flashcards' | 'quiz'
  const [difficulty, setDifficulty] = useState('adaptive'); // 'foundational' | 'adaptive' | 'exam prep'
  const [quantity, setQuantity] = useState(5);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setNotesInput(text);
        setActiveTab('upload');
      }
    };
    reader.readAsText(file);
  };

  const handleSelectSuggestedTopic = (suggested) => {
    setTopicInput(suggested.topic);
    setActiveTab('topic');
    setErrorMessage('');
  };

  const handleGenerate = async () => {
    let effectiveNotes = '';
    if (activeTab === 'topic') {
      effectiveNotes = topicInput.trim();
    } else {
      effectiveNotes = notesInput.trim();
    }

    if (!effectiveNotes) {
      setErrorMessage(
        activeTab === 'topic'
          ? 'Please enter a topic to learn about.'
          : 'Please enter notes or upload a document.'
      );
      return;
    }

    if (effectiveNotes.length < 3) {
      setErrorMessage('Study prompt must be at least 3 characters long.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setGeneratedResult(null);

    try {
      const result = await generateContent({
        notes: effectiveNotes,
        mode,
        difficulty,
        quantity,
      });

      setGeneratedResult(result);

      if (result.type === 'flashcards' && Array.isArray(result.cards)) {
        const newDeck = {
          id: `deck-${Date.now()}`,
          title: result.title || effectiveNotes.slice(0, 40),
          subject: 'AI Generated',
          totalCards: result.cards.length,
          masteredCards: 0,
          masteryPercentage: 0,
          lastStudied: 'Just generated',
          badgeColor: 'violet',
          tags: ['Gemini AI', difficulty],
          isBookmarked: false,
          cards: result.cards.map((c) => ({
            question: c.question,
            answer: c.answer,
            q: c.question,
            a: c.answer,
            difficulty: 'Adaptive',
          })),
        };

        if (onAddNewDeck) {
          onAddNewDeck(newDeck);
        }

        // Award generation XP
        recordCompletedActivity({
          type: 'flashcards',
          cardsReviewed: result.cards.length,
        });
      } else if (result.type === 'quiz' && Array.isArray(result.questions)) {
        // Award quiz generation XP
        recordCompletedActivity({
          type: 'quiz',
          questionsCount: result.questions.length,
        });
      }
    } catch (err) {
      console.error('Generation error:', err);
      setErrorMessage(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card padding="p-5 sm:p-7" className="border-surface-border bg-surface relative overflow-hidden shadow-xl">
      {/* Playful background accent glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-violet/10 blur-[90px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-brand-lime/5 blur-[80px] rounded-full pointer-events-none -z-0" />

      <div className="relative z-10 space-y-5">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-brand-violet/30 shadow-md shadow-brand-violet/15 bg-midnight shrink-0 hidden sm:block">
              <img
                src="/brainpopz-logo.png"
                alt="BrainPopZ Mascot"
                className="w-full h-full object-cover scale-105"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-violet/15 border border-brand-violet/30 text-brand-violet-light text-[11px] font-medium mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
                <span>Real Google Gemini AI Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">
                What are we learning today?
              </h2>
              <p className="text-xs text-gray-400">
                Turn your notes, topics, or syllabi into interactive flashcards and diagnostic drills.
              </p>
            </div>
          </div>

          {/* Mode Selector Segmented Pill */}
          <div className="flex items-center p-1 rounded-xl bg-surface-secondary border border-surface-border self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setMode('flashcards');
                setGeneratedResult(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'flashcards'
                  ? 'bg-brand-violet text-midnight shadow-md font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('quiz');
                setGeneratedResult(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'quiz'
                  ? 'bg-brand-lime text-midnight shadow-md font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Practice Quiz</span>
            </button>
          </div>
        </div>

        {/* Input Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-border/80 pb-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('topic')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'topic'
                ? 'bg-surface-secondary text-white border border-surface-border'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💡 Enter a Topic
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-surface-secondary text-white border border-surface-border'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📝 Paste Notes
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              fileInputRef.current?.click();
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-surface-secondary text-white border border-surface-border'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-brand-orange" />
            <span>Upload Document</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json,.csv,.rtf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Input Area */}
        <div>
          {activeTab === 'topic' ? (
            <div className="space-y-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => {
                  setTopicInput(e.target.value);
                  setErrorMessage('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
                disabled={isGenerating}
                placeholder="E.g., Quantum Entanglement, Cellular Respiration, Raft Consensus Algorithm..."
                className="w-full bg-surface-secondary border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet/70 transition-colors shadow-inner"
              />

              {/* Suggested Topic Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-gray-500 font-medium mr-1">Suggestions:</span>
                {SUGGESTED_TOPICS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestedTopic(item)}
                    className="px-2.5 py-1 rounded-full bg-surface-secondary/70 border border-surface-border text-[11px] text-gray-300 hover:text-brand-lime hover:border-brand-lime/40 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {uploadedFileName && activeTab === 'upload' && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-secondary border border-brand-orange/30 text-xs text-brand-orange">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium font-mono">{uploadedFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName('');
                      setNotesInput('');
                    }}
                    className="text-gray-400 hover:text-white text-[11px] cursor-pointer"
                  >
                    Clear file
                  </button>
                </div>
              )}

              <textarea
                rows={5}
                value={notesInput}
                onChange={(e) => {
                  setNotesInput(e.target.value);
                  setErrorMessage('');
                }}
                disabled={isGenerating}
                placeholder="Paste lecture notes, study guide excerpts, or textbook paragraphs here..."
                className="w-full bg-surface-secondary border border-surface-border rounded-xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet/70 transition-colors shadow-inner resize-y"
              />
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Supports up to 25,000 characters</span>
                <span className="font-mono">{notesInput.length} chars</span>
              </div>
            </div>
          )}
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Difficulty Selection */}
          <div className="sm:col-span-6 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
              Cognitive Level
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'foundational', label: '🌱 Foundation' },
                { id: 'adaptive', label: '⚡ Adaptive' },
                { id: 'exam prep', label: '🎓 Exam Prep' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id)}
                  className={`py-1.5 px-2 rounded-lg text-center font-medium transition-colors cursor-pointer text-xs ${
                    difficulty === lvl.id
                      ? 'bg-brand-violet/20 border border-brand-violet/50 text-brand-violet-light font-bold'
                      : 'bg-surface-secondary border border-surface-border text-gray-400 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="sm:col-span-6 space-y-1">
            <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <span>Deck Size</span>
              <span className="font-mono text-brand-lime font-bold">{quantity} items</span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-xs">
              {[3, 5, 8, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuantity(cnt)}
                  className={`py-1.5 rounded-lg text-center font-medium font-mono transition-colors cursor-pointer ${
                    quantity === cnt
                      ? 'bg-brand-lime/20 border border-brand-lime/50 text-brand-lime font-bold'
                      : 'bg-surface-secondary border border-surface-border text-gray-400 hover:text-white'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert with Retry */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={RotateCcw}
              onClick={handleGenerate}
              className="text-xs h-7 border-red-500/30 hover:bg-red-500/20 text-red-200 shrink-0"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Success Preview Card */}
        {generatedResult && (
          <div className="p-4 rounded-xl bg-surface-secondary border border-brand-lime/40 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-lime shrink-0" />
                <span className="text-xs font-bold text-white">
                  Successfully Generated: "{generatedResult.title}"
                </span>
                <Badge variant="lime" size="sm">
                  +25 XP Earned
                </Badge>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              {generatedResult.type === 'flashcards'
                ? `Saved ${generatedResult.cards.length} flashcards to your library.`
                : `Created ${generatedResult.questions.length} diagnostic quiz questions.`}
            </p>

            <div className="flex items-center gap-2 pt-1">
              {generatedResult.type === 'flashcards' ? (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={BookOpen}
                  onClick={() => {
                    if (onStudyDeck) {
                      onStudyDeck({
                        id: `deck-${Date.now()}`,
                        title: generatedResult.title,
                        subject: 'AI Generated',
                        cards: generatedResult.cards,
                      });
                    }
                  }}
                >
                  Study Cards Now
                </Button>
              ) : (
                <Button
                  variant="lime"
                  size="sm"
                  leftIcon={Play}
                  onClick={() => {
                    if (onStartQuiz) {
                      onStartQuiz(generatedResult.questions, generatedResult.title);
                    }
                  }}
                >
                  Take Practice Quiz
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Generate Primary Button */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="cursor-pointer shadow-lg hover:shadow-brand-violet/25 font-bold tracking-wide"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Synthesizing with Google Gemini AI...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-lime animate-pulse" />
              <span>
                Generate {quantity} {mode === 'flashcards' ? 'Active Recall Cards' : 'Quiz Questions'}
              </span>
            </span>
          )}
        </Button>
      </div>
    </Card>
  );
}

