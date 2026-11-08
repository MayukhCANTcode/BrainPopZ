import React from 'react';
import { Layers, Flame, Target, Clock } from 'lucide-react';
import Card from '../common/Card';
import { dashboardStats } from '../../data/mockData';

const iconMap = {
  mastered: Layers,
  streak: Flame,
  accuracy: Target,
  time: Clock,
};

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {dashboardStats.map((stat) => {
        const Icon = iconMap[stat.id] || Layers;

        return (
          <Card key={stat.id} padding="p-4" className="border-surface-border">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium text-gray-400">
                {stat.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
              {stat.value}
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span
                className={`font-medium ${
                  stat.accentColor === 'lime'
                    ? 'text-brand-lime'
                    : stat.accentColor === 'orange'
                    ? 'text-brand-orange'
                    : 'text-brand-violet-light'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-gray-400 text-[10px]">{stat.caption}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
