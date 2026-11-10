import React from 'react';
import { Brain } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { upcomingReviews, weeklyActivity } from '../../data/mockData';

export default function UpcomingReviews({ onStartQuiz }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Due Quizzes & Spaced Reviews (2 cols on lg) */}
      <div className="lg:col-span-2">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-zinc-950 tracking-tight">
            Spaced Repetition Queue
          </h2>
          <p className="text-xs text-zinc-500">
            Sessions due to prevent memory decay.
          </p>
        </div>

        <div className="space-y-2">
          {upcomingReviews.map((item) => (
            <Card
              key={item.id}
              hoverEffect
              padding="p-3.5"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-surface-border bg-surface shadow-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface-secondary text-brand-violet-dark flex items-center justify-center shrink-0 border border-surface-border">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-medium text-zinc-950">
                      {item.title}
                    </span>
                    <Badge
                      variant={item.dueIn.includes('Today') ? 'orange' : 'default'}
                      size="sm"
                    >
                      {item.dueIn}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <span>{item.subject}</span>
                    <span>•</span>
                    <span>{item.questions} questions</span>
                    <span>•</span>
                    <span className="text-zinc-500">{item.difficulty}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onStartQuiz && onStartQuiz(item)}
                className="w-full sm:w-auto shrink-0"
              >
                Start Drill
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Weekly Activity (1 col on lg) */}
      <Card padding="p-4" className="flex flex-col justify-between border-surface-border bg-surface shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-zinc-950">
              Weekly Activity
            </span>
            <Badge variant="lime" size="sm">
              Target Met
            </Badge>
          </div>
          <p className="text-[11px] text-gray-400 mb-4">
            Daily cards reviewed over the past 7 days.
          </p>

          {/* Minimalist Activity Bars */}
          <div className="flex items-end justify-between gap-1.5 h-24 pt-1 pb-1">
            {weeklyActivity.map((day) => {
              const maxCount = 70;
              const heightPercent = Math.min(100, Math.round((day.count / maxCount) * 100));
              const isToday = day.day === 'Sun';

              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {day.count}
                  </span>
                  <div className="w-full bg-[#0A0A0F] rounded-t h-full max-h-20 flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isToday
                          ? 'bg-brand-orange'
                          : 'bg-brand-lime hover:bg-brand-lime-hover'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] ${
                      isToday ? 'text-brand-orange font-medium' : 'text-gray-400'
                    }`}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-surface-border flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
            <span>Target reached</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            <span>Today</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
