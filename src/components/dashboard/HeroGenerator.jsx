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
  SquarePlay,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { generateContent, fetchYouTubeTranscript } from '../../services/api';
import { recordCompletedActivity } from '../../services/gamification';

const SUGGESTED_TOPICS = [
  { label: '⚡ Quantum Computing', topic: 'Quantum Superposition, Qubits and Quantum Entanglement' },
  { label: '🧬 CRISPR-Cas9', topic: 'CRISPR Cas9 Gene Editing Mechanism and Guide RNA' },
  { label: '💻 Raft Consensus', topic: 'Raft Consensus Algorithm Leader Election and Log Replication' },
  { label: '🧠 Synaptic Plasticity', topic: 'Synaptic Plasticity, Long-Term Potentiation (LTP) and NMDA Receptors' },
  { label: '🌌 Black Holes', topic: 'General Relativity, Event Horizon and Hawking Radiation' },
];

const SUGGESTED_YOUTUBE_VIDEOS = [
  { label: '⚛️ MIT: Quantum Mechanics', url: 'https://www.youtube.com/watch?v=lZ3bPUKo5zc' },
  { label: '🧬 CrashCourse: Photosynthesis', url: 'https://www.youtube.com/watch?v=sQK3Yr4Sc_k' },
  { label: '🧠 Khan Academy: Neurons', url: 'https://www.youtube.com/watch?v=7EyhsOewnH4' },
  { label: '💻 Computerphile: Raft Consensus', url: 'https://www.youtube.com/watch?v=vYp4LYbnnW8' },
];

export default function HeroGenerator({ onAddNewDeck, onStartQuiz, onStudyDeck }) {
  const [activeTab, setActiveTab] = useState('topic'); // 'topic' | 'notes' | 'upload' | 'youtube'
  const [topicInput, setTopicInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // YouTube states
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isFetchingTranscript, setIsFetchingTranscript] = useState(false);
  const [youtubeData, setYoutubeData] = useState(null);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

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

  const handleFetchTranscript = async (overrideUrl) => {
    const targetUrl = (overrideUrl || youtubeUrl).trim();
    if (!targetUrl) {
      setErrorMessage('Please enter a YouTube video URL.');
      return;
    }

    setIsFetchingTranscript(true);
    setErrorMessage('');
    try {
      const data = await fetchYouTubeTranscript(targetUrl);
      setYoutubeData(data);
      setYoutubeUrl(targetUrl);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to retrieve transcript from YouTube video.');
    } finally {
      setIsFetchingTranscript(false);
    }
  };

  const handleGenerate = async () => {
    let effectiveNotes = '';
    let customTitle = '';
    let customSubject = 'AI Generated';
    let customTags = ['Gemini AI', difficulty];

    if (activeTab === 'topic') {
      effectiveNotes = topicInput.trim();
    } else if (activeTab === 'youtube') {
      if (!youtubeData?.transcript) {
        setErrorMessage('Please paste a YouTube URL and fetch the transcript first.');
        return;
      }
      effectiveNotes = `Source: YouTube Video "${youtubeData.title}" by ${youtubeData.author}\n\nTranscript:\n${youtubeData.transcript.slice(0, 30000)}`;
      customTitle = youtubeData.title;
      customSubject = 'YouTube Lecture';
      customTags = ['YouTube', 'Gemini AI', difficulty];
    } else {
      effectiveNotes = notesInput.trim();
    }

    if (!effectiveNotes) {
      setErrorMessage(
        activeTab === 'topic'
          ? 'Please enter a topic to learn about.'
          : activeTab === 'youtube'
          ? 'Please fetch a YouTube transcript before generating.'
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
          title: customTitle || result.title || effectiveNotes.slice(0, 40),
          subject: customSubject,
          totalCards: result.cards.length,
          masteredCards: 0,
          masteryPercentage: 0,
          lastStudied: 'Just generated',
          badgeColor: activeTab === 'youtube' ? 'coral' : 'violet',
          tags: customTags,
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
      console.error('[AI-GEN] Hero generation failed:', err);
      setErrorMessage(
        err.message || 'Generation failed. Please verify your connection or try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card
      padding="p-5 sm:p-6"
      className="relative overflow-hidden border-surface-border bg-surface shadow-md"
    >
      <div className="space-y-5">
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
                Turn topics, notes, syllabi, or YouTube lectures into interactive flashcards and diagnostic drills.
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
        <div className="flex items-center gap-2 border-b border-surface-border/80 pb-2 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('topic')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-surface-secondary text-white border border-surface-border'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-brand-orange" />
            <span>Upload Document</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('youtube')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'youtube'
                ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <SquarePlay className="w-3.5 h-3.5 text-red-400" />
            <span>YouTube Video</span>
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
          ) : activeTab === 'youtube' ? (
            <div className="space-y-3">
              {/* YouTube Link Input and Fetch Action */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <SquarePlay className="w-4 h-4 text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      setErrorMessage('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFetchTranscript();
                    }}
                    disabled={isFetchingTranscript || isGenerating}
                    placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
                    className="w-full bg-surface-secondary border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 transition-colors shadow-inner"
                  />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto shrink-0 bg-red-500 hover:bg-red-600 border-none text-white font-medium"
                  disabled={isFetchingTranscript || !youtubeUrl.trim()}
                  onClick={() => handleFetchTranscript()}
                >
                  {isFetchingTranscript ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching Transcript...</span>
                    </span>
                  ) : (
                    <span>Fetch Transcript</span>
                  )}
                </Button>
              </div>

              {/* Suggested Educational YouTube Video Chips */}
              {!youtubeData && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-gray-500 font-medium mr-1">Sample Lectures:</span>
                  {SUGGESTED_YOUTUBE_VIDEOS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleFetchTranscript(item.url)}
                      className="px-2.5 py-1 rounded-full bg-surface-secondary/70 border border-surface-border text-[11px] text-gray-300 hover:text-red-300 hover:border-red-500/40 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Loaded YouTube Video Preview Card */}
              {youtubeData && (
                <div className="p-3.5 rounded-xl bg-surface-secondary border border-surface-border space-y-3 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <img
                      src={youtubeData.thumbnail}
                      alt={youtubeData.title}
                      className="w-24 h-16 object-cover rounded-lg border border-surface-border shrink-0 bg-midnight"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="lime" size="sm">
                          Transcript Loaded
                        </Badge>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {youtubeData.wordCount} words • ~{youtubeData.estimatedMinutes} min
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                        {youtubeData.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">
                        Channel: {youtubeData.author}
                      </p>
                    </div>

                    <a
                      href={youtubeData.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded text-gray-400 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer shrink-0"
                      title="Open video on YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Collapsible Transcript Text Inspector */}
                  <div className="border-t border-surface-border/60 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFullTranscript(!showFullTranscript)}
                      className="text-[11px] text-brand-violet-light hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{showFullTranscript ? 'Hide transcript preview' : 'View transcript preview'}</span>
                      {showFullTranscript ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {showFullTranscript && (
                      <div className="mt-2 p-2.5 rounded-lg bg-midnight/70 border border-surface-border text-xs text-gray-300 max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed animate-fadeIn">
                        {youtubeData.transcript}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'foundational', label: 'Foundational' },
                { id: 'adaptive', label: 'Adaptive' },
                { id: 'exam prep', label: 'Exam Prep' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    difficulty === diff.id
                      ? 'bg-surface-elevated text-white border-brand-violet shadow-sm font-semibold'
                      : 'bg-surface-secondary border-surface-border text-gray-400 hover:text-white'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="sm:col-span-6 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
              Quantity ({mode === 'flashcards' ? 'Cards' : 'Questions'})
            </span>
            <div className="flex items-center gap-1.5">
              {[3, 5, 8, 10, 15].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium border text-center transition-all cursor-pointer ${
                    quantity === num
                      ? 'bg-brand-lime/15 text-brand-lime border-brand-lime/40 font-bold'
                      : 'bg-surface-secondary border-surface-border text-gray-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
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
                        subject: activeTab === 'youtube' ? 'YouTube Lecture' : 'AI Generated',
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
          disabled={isGenerating || isFetchingTranscript}
          onClick={handleGenerate}
          className="h-11 font-semibold text-sm shadow-lg shadow-brand-violet/15"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating with Google Gemini AI...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-lime" />
              <span>
                {activeTab === 'youtube' && youtubeData
                  ? `Generate ${quantity} ${mode === 'flashcards' ? 'Flashcards' : 'Quiz Questions'} from YouTube`
                  : `Generate ${quantity} ${mode === 'flashcards' ? 'Flashcards' : 'Quiz Questions'} with Gemini AI`}
              </span>
            </span>
          )}
        </Button>
      </div>
    </Card>
  );
}
