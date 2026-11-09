import React, { useState, useRef } from 'react';
import { Sparkles, Upload, Lightbulb, CheckCircle2, FileText, Loader2, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { generateContent } from '../../services/api';

const samplePrompts = [
  'Photosynthesis Light Reactions',
  'TCP vs UDP Handshake Protocols',
  'Mitosis vs Meiosis Stages',
  'Bayes Theorem & Conditional Probability',
];

export default function QuickGenerateCard({ onTriggerGeneration, onStudyDeck }) {
  const [topicInput, setTopicInput] = useState('');
  const [activeTab, setActiveTab] = useState('topic'); // topic, notes, file
  const [selectedFile, setSelectedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successDeck, setSuccessDeck] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    const effectiveTopic = activeTab === 'file' ? (selectedFile ? selectedFile.name : '') : topicInput;
    if (!effectiveTopic.trim()) return;

    setIsGenerating(true);
    setErrorMessage('');
    setSuccessDeck(null);

    try {
      const result = await generateContent({
        notes: effectiveTopic,
        mode: 'flashcards',
        difficulty: 'adaptive',
        quantity: 5,
      });

      const newDeck = {
        id: `deck-${Date.now()}`,
        title: result.title || effectiveTopic,
        subject: 'AI Generated',
        totalCards: result.cards.length,
        masteredCards: 0,
        masteryPercentage: 0,
        lastStudied: 'Just now',
        badgeColor: 'violet',
        tags: ['Gemini 2.5', 'Adaptive'],
        isBookmarked: false,
        cards: result.cards.map((c) => ({
          question: c.question,
          answer: c.answer,
          q: c.question,
          a: c.answer,
          difficulty: 'Adaptive',
        })),
      };

      if (onTriggerGeneration) {
        onTriggerGeneration(newDeck);
      }
      setSuccessDeck(newDeck);
      setTopicInput('');
    } catch (err) {
      console.error('Quick generation error:', err);
      setErrorMessage(err.message || 'Generation failed. Ensure server is running on port 3001.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Card padding="p-4 sm:p-5" className="border-surface-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Instant Gemini Generator
          </h2>
          <p className="text-xs text-gray-400">
            Convert a subject prompt, pasted notes, or document into real validated flashcards.
          </p>
        </div>

        {/* Minimal segmented control */}
        <div className="flex items-center p-0.5 rounded-lg bg-surface-elevated border border-surface-border text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('topic')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'topic'
                ? 'bg-surface text-white border border-surface-border shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Prompt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-surface text-white border border-surface-border shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Paste Notes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'file'
                ? 'bg-surface text-white border border-surface-border shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-3">
        {activeTab === 'topic' && (
          <div className="relative">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              disabled={isGenerating}
              placeholder="e.g. Krebs Cycle in Cellular Respiration or Dijkstra's Algorithm..."
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-violet/60 focus:ring-1 focus:ring-brand-violet/50 transition-colors pr-28"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!topicInput.trim() || isGenerating}
                leftIcon={isGenerating ? Loader2 : Sparkles}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-2">
            <textarea
              rows={3}
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              disabled={isGenerating}
              placeholder="Paste raw lecture bullet points, textbook excerpts, or syllabus items..."
              className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-violet/60 focus:ring-1 focus:ring-brand-violet/50 transition-colors"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!topicInput.trim() || isGenerating}
                leftIcon={isGenerating ? Loader2 : Sparkles}
              >
                {isGenerating ? 'Synthesizing with Gemini...' : 'Generate Flashcards'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'file' && (
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.md,.pptx"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-surface-border rounded-lg p-4 text-center hover:border-gray-500 transition-colors bg-surface-elevated/40 cursor-pointer"
            >
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5 text-brand-lime" />
                  <span className="font-medium text-white">{selectedFile.name}</span>
                  <span className="text-gray-400">({Math.round(selectedFile.size / 1024)} KB)</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-gray-300">
                    Click to attach PDF, PPTX or notes file
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Definitions and questions will be extracted automatically
                  </p>
                </>
              )}
            </div>

            {selectedFile && (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isGenerating}
                  leftIcon={isGenerating ? Loader2 : Sparkles}
                >
                  {isGenerating ? 'Analyzing...' : 'Generate from File'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-brand-orange" />
            Try:
          </span>
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isGenerating}
              onClick={() => setTopicInput(prompt)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-surface-elevated hover:bg-surface-active text-gray-300 hover:text-white border border-surface-border transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Success alert with direct study button */}
        {successDeck && (
          <div className="flex items-center justify-between p-2.5 rounded-md bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-medium animate-fadeIn">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Generated {successDeck.totalCards} cards for "{successDeck.title}"!</span>
            </div>
            {onStudyDeck && (
              <Button
                variant="lime"
                size="sm"
                onClick={() => onStudyDeck(successDeck)}
              >
                Study Now
              </Button>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>
    </Card>
  );
}
