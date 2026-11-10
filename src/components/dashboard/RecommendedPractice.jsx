import React from 'react';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const RECOMMENDED_TOPICS = [
  {
    id: 'rec-1',
    title: 'Raft Consensus & Distributed Log Replication',
    subject: 'Computer Science',
    badgeVariant: 'violet',
    difficulty: 'Adaptive',
    estimatedTime: '4 min',
    prompt: 'Raft Consensus Algorithm Leader Election and Log Replication',
    questionsCount: 5,
    description: 'Master leader election, terms, heartbeat mechanisms, and safety properties under network partitions.',
  },
  {
    id: 'rec-2',
    title: 'Photosynthesis & Electron Transport Chain',
    subject: 'Biology',
    badgeVariant: 'lime',
    difficulty: 'Foundational',
    estimatedTime: '3 min',
    prompt: 'Photosynthesis Light Reactions, Photosystem II and ATP Synthase',
    questionsCount: 5,
    description: 'Understand photon absorption, water photolysis, NADPH synthesis, and proton electrochemical gradients.',
  },
  {
    id: 'rec-3',
    title: 'Synaptic Plasticity & Long-Term Potentiation',
    subject: 'Neuroscience',
    badgeVariant: 'orange',
    difficulty: 'Exam Prep',
    estimatedTime: '5 min',
    prompt: 'Synaptic Plasticity, Long-Term Potentiation (LTP) and NMDA Receptors',
    questionsCount: 5,
    description: 'Explore glutamate dynamics, magnesium block removal in NMDA receptors, and dendritic spine enlargement.',
  },
];

/**
 * Recommended Practice component for BrainPopZ dashboard.
 * Curated high-yield topics ready for immediate recall drills or AI expansion.
 */
export default function RecommendedPractice({ onStartQuiz, onSelectTopic }) {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-heading font-bold text-white tracking-tight flex items-center gap-2">
            <span>Recommended Practice</span>
            <Badge variant="lime" size="sm">
              High-Yield
            </Badge>
          </h2>
          <p className="text-xs text-gray-400">
            Scientifically curated active recall topics to sharpen diagnostic accuracy
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {RECOMMENDED_TOPICS.map((topic) => (
          <Card
            key={topic.id}
            hoverEffect
            padding="p-4 sm:p-5"
            className="flex flex-col justify-between border-surface-border bg-surface"
          >
            <div>
              {/* Badges row */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <Badge variant={topic.badgeVariant} size="sm">
                  {topic.subject}
                </Badge>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>{topic.estimatedTime}</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">
                {topic.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4">
                {topic.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={Sparkles}
                onClick={() => onSelectTopic && onSelectTopic(topic.prompt)}
                className="text-xs"
              >
                Synthesize
              </Button>

              <Button
                variant="lime"
                size="sm"
                rightIcon={ArrowRight}
                onClick={() => {
                  if (onStartQuiz) {
                    onStartQuiz({
                      title: topic.title,
                      questions: [
                        {
                          question: `What is the critical mechanism underlying ${topic.title}?`,
                          options: [
                            'Structural coordination stabilizing high-frequency gradient signals.',
                            'Negative feedback counter-regulation inhibiting steady-state flow.',
                            'Transient non-specific binding with stochastic diffusion.',
                            'Independent orthogonal cascade without energetic coupling.',
                          ],
                          correctAnswer: 0,
                          explanation: `In ${topic.subject}, structural coordination ensures robust, reproducible state replication.`,
                        },
                      ],
                    });
                  }
                }}
                className="text-xs"
              >
                Start Drill
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
