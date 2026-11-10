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
import Mascot from '../common/Mascot';
import { generateContent, fetchYouTubeTranscript, extractPdfDocument } from '../../services/api';
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

export default function HeroGenerator({
  onAddNewDeck,
  onStartQuiz,
  onStudyDeck,
  onDeckGenerated,
  onStudyGeneratedDeck,
  onStartGeneratedQuiz,
}) {
  const [activeTab, setActiveTab] = useState('topic'); // 'topic' | 'notes' | 'upload' | 'youtube'
  const [topicInput, setTopicInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfMetadata, setPdfMetadata] = useState(null);

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
  const [createdDeck, setCreatedDeck] = useState(null);

  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setErrorMessage('');

    // Handle PDF lecture slides
    if (file.name.toLowerCase().endsWith('.pdf')) {
      setIsExtractingPdf(true);
      try {
        const result = await extractPdfDocument(file);
        setPdfMetadata(result);
        setNotesInput(result.text);
        setActiveTab('upload');
      } catch (err) {
        setErrorMessage(err.message || 'Failed to extract text from PDF document.');
        setUploadedFileName('');
        setPdfMetadata(null);
      } finally {
        setIsExtractingPdf(false);
      }
      return;
    }

    // Handle plain text / markdown / CSV
    setPdfMetadata(null);
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

    if (activeTab === 'upload' && pdfMetadata) {
      customTitle = uploadedFileName.replace(/\.pdf$/i, '');
      customSubject = 'PDF Lecture Document';
      customTags = ['PDF Document', `${pdfMetadata.pageCount} Pages`, difficulty];
    }

    // Cancel any pending in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++latestRequestIdRef.current;

    setIsGenerating(true);
    setErrorMessage('');
    setGeneratedResult(null);

    try {
      const result = await generateContent({
        notes: effectiveNotes,
        mode,
        difficulty,
        quantity,
        signal: controller.signal,
      });

      // Guard against stale asynchronous responses overwriting newer user requests
      if (currentRequestId !== latestRequestIdRef.current) {
        return;
      }

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

        setCreatedDeck(newDeck);

        const addDeckCallback = onAddNewDeck || onDeckGenerated;
        if (addDeckCallback) {
          addDeckCallback(newDeck);
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
      variant="neo"
      padding="p-5 sm:p-7"
      className="relative overflow-hidden bg-white"
    >
      <div className="space-y-5">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              <span>AI Study Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-950 tracking-tight">
              Turn your notes into knowledge. <span className="font-serif italic font-normal text-zinc-600">Build for mastery.</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 leading-relaxed">
              Create flashcards and diagnostic quizzes from anything you're learning.
            </p>
          </div>

          {/* Mode Selector Segmented Pill */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-secondary border border-surface-border self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setMode('flashcards');
                setGeneratedResult(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mode === 'flashcards'
                  ? 'bg-midnight-ink text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Layers className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Flashcards</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('quiz');
                setGeneratedResult(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mode === 'quiz'
                  ? 'bg-midnight-ink text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Brain className="w-3.5 h-3.5 stroke-[1.75]" />
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
                ? 'bg-surface text-zinc-950 border border-surface-border shadow-xs'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            💡 Enter a Topic
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-surface text-zinc-950 border border-surface-border shadow-xs'
                : 'text-zinc-500 hover:text-zinc-950'
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
                ? 'bg-surface text-zinc-950 border border-surface-border shadow-xs'
                : 'text-zinc-500 hover:text-zinc-950'
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
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            <SquarePlay className="w-3.5 h-3.5 text-red-600" />
            <span>YouTube Video</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.json,.csv,.rtf"
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
                className="w-full bg-surface-secondary border border-surface-border rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet/40 transition-colors shadow-inner"
              />

              {/* Suggested Topic Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-zinc-500 font-medium mr-1">Suggestions:</span>
                {SUGGESTED_TOPICS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestedTopic(item)}
                    className="px-2.5 py-1 rounded-full bg-surface border border-surface-border text-[11px] text-zinc-700 hover:text-zinc-950 hover:border-zinc-400 transition-colors cursor-pointer shadow-xs"
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
              {isExtractingPdf && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-secondary border border-brand-violet/30 text-xs text-brand-violet-light animate-fadeIn">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-lime" />
                  <span>Parsing PDF lecture slides & extracting text...</span>
                </div>
              )}

              {uploadedFileName && activeTab === 'upload' && !isExtractingPdf && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-secondary border border-brand-orange/30 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-brand-orange shrink-0 stroke-[1.75]" />
                    <span className="font-medium font-mono text-white truncate">{uploadedFileName}</span>
                    {pdfMetadata && (
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0 ml-1">
                        ({pdfMetadata.pageCount} pages • {pdfMetadata.wordCount} words)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName('');
                      setPdfMetadata(null);
                      setNotesInput('');
                    }}
                    className="text-zinc-400 hover:text-white text-[11px] cursor-pointer ml-2 shrink-0"
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
                className="w-full bg-surface-secondary border border-surface-border rounded-xl p-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet/40 transition-colors shadow-inner resize-y"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
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
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
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
                  className={`py-1.5 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    difficulty === diff.id
                      ? 'bg-midnight-ink text-white font-semibold shadow-xs'
                      : 'bg-surface border border-surface-border text-zinc-700 hover:text-zinc-950 hover:border-zinc-400'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="sm:col-span-6 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
              Quantity ({mode === 'flashcards' ? 'Cards' : 'Questions'})
            </span>
            <div className="flex items-center gap-1.5">
              {[3, 5, 8, 10, 15].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    quantity === num
                      ? 'bg-midnight-ink text-white font-semibold shadow-xs'
                      : 'bg-surface border border-surface-border text-zinc-700 hover:text-zinc-950 hover:border-zinc-400'
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
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-zinc-900">
                  Successfully Generated: "{generatedResult.title}"
                </span>
                <Badge variant="lime" size="sm">
                  +25 XP Earned
                </Badge>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
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
                    const deckToStudy = createdDeck || {
                      id: `deck-${Date.now()}`,
                      title: generatedResult.title || 'AI Generated Deck',
                      subject: activeTab === 'youtube' ? 'YouTube Lecture' : 'AI Generated',
                      totalCards: generatedResult.cards?.length || 0,
                      masteredCards: 0,
                      masteryPercentage: 0,
                      lastStudied: 'Just now',
                      badgeColor: activeTab === 'youtube' ? 'coral' : 'violet',
                      tags: ['Gemini AI', difficulty],
                      isBookmarked: false,
                      cards: (generatedResult.cards || []).map((c) => ({
                        question: c.question,
                        answer: c.answer,
                        q: c.question,
                        a: c.answer,
                        difficulty: 'Adaptive',
                      })),
                    };

                    const studyCallback = onStudyDeck || onStudyGeneratedDeck;
                    if (studyCallback) {
                      studyCallback(deckToStudy);
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
                    const quizCallback = onStartQuiz || onStartGeneratedQuiz;
                    if (quizCallback) {
                      quizCallback(generatedResult.questions, generatedResult.title);
                    }
                  }}
                >
                  Take Practice Quiz
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Generating Feedback Card with Mascot */}
        {isGenerating && (
          <div className="p-4 rounded-xl bg-surface-secondary/80 border border-purple-200 flex items-center gap-3.5 animate-fadeIn">
            <Mascot size="sm" animation="float" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin shrink-0" />
                <span className="text-xs font-semibold text-zinc-900">
                  Crafting your active recall deck with Gemini AI...
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate">
                Formatting rigorous questions and validating scientific rationales.
              </p>
            </div>
          </div>
        )}

        {/* Generate Primary Button */}
        <Button
          variant="primary"
          fullWidth
          disabled={isGenerating || isFetchingTranscript}
          onClick={handleGenerate}
          className="h-10 text-sm font-semibold shadow-sm"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-midnight-ink" />
              <span>Generating with Google Gemini AI...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-700" />
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
