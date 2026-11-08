import React, { useState } from 'react';
import { TrendingUp, Award, Clock, Flame } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function AnalyticsView() {
  const [period, setPeriod] = useState('month'); // week, month, all

  const subjectMastery = [
    { name: 'Computer Science & Systems', percentage: 95, color: 'bg-brand-lime' },
    { name: 'Biology & Cognitive Neuroscience', percentage: 84, color: 'bg-brand-violet' },
    { name: 'Artificial Intelligence & ML', percentage: 80, color: 'bg-brand-violet-light' },
    { name: 'Organic Chemistry', percentage: 69, color: 'bg-brand-orange' },
  ];

  return (
    <div className="space-y-4">
      {/* Header with period toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-xl font-heading font-bold text-white tracking-tight">
            Study Analytics
          </h1>
          <p className="text-xs text-gray-400">
            Retention rate, recall performance, and subject mastery.
          </p>
        </div>

        <div className="flex items-center p-0.5 rounded-lg bg-surface border border-surface-border text-xs">
          <button
            onClick={() => setPeriod('week')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              period === 'week'
                ? 'bg-surface-elevated text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              period === 'month'
                ? 'bg-surface-elevated text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              period === 'all'
                ? 'bg-surface-elevated text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card padding="p-4" className="border-surface-border">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs">Retention Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-brand-lime" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading text-white">
            94.2%
          </div>
          <p className="text-[11px] text-brand-lime mt-0.5">
            +4.1% via spaced recall
          </p>
        </Card>

        <Card padding="p-4" className="border-surface-border">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs">Study Time</span>
            <Clock className="w-3.5 h-3.5 text-brand-violet" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading text-white">
            {period === 'week' ? '18.5h' : '42.8h'}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            ~1.4h daily average
          </p>
        </Card>

        <Card padding="p-4" className="border-surface-border">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs">Active Streak</span>
            <Flame className="w-3.5 h-3.5 text-brand-orange" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading text-white">
            7 Days
          </div>
          <p className="text-[11px] text-brand-orange mt-0.5">
            Personal best
          </p>
        </Card>

        <Card padding="p-4" className="border-surface-border">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs">Academic Level</span>
            <Award className="w-3.5 h-3.5 text-brand-lime" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading text-white">
            Lvl 14
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            280 XP to Lvl 15
          </p>
        </Card>
      </div>

      {/* Subject Breakdown Card */}
      <Card padding="p-5" className="border-surface-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            Subject Mastery
          </h3>
          <Badge variant="default" size="sm">
            Top 5%
          </Badge>
        </div>
        <div className="space-y-3.5">
          {subjectMastery.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">{item.name}</span>
                <span className="font-mono text-gray-400">{item.percentage}%</span>
              </div>
              <div className="w-full bg-[#0A0A0F] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
