import { useState, useMemo } from 'react';
import { useFitnessStore } from '../../store/store';
import { Workout } from '../../types';
import { getExercise } from '../../data/exercises';
import {
  getWorkoutsInMonth,
  workoutVolume,
  totalSets,
  totalReps,
  getProgressiveOverloadSets,
  getExercise1RMProgression,
  get1RMProgression,
  estimate1RM,
} from '../../utils/calculations';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { addMonths, subMonths, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function MonthlyStatsPage() {
  const { workouts } = useFitnessStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthWorkouts = useMemo(
    () => getWorkoutsInMonth(workouts, currentMonth),
    [workouts, currentMonth]
  );

  const summary = useMemo(() => ({
    totalWorkouts: monthWorkouts.length,
    totalSets: monthWorkouts.reduce((s, w) => s + totalSets(w), 0),
    totalVolume: monthWorkouts.reduce((s, w) => s + workoutVolume(w), 0),
    totalReps: monthWorkouts.reduce((s, w) => s + totalReps(w), 0),
  }), [monthWorkouts]);



  const e1rmData = useMemo(
    () => getExercise1RMProgression(workouts, currentMonth),
    [workouts, currentMonth]
  );

  const progressData = useMemo(
    () => getProgressiveOverloadSets(workouts, currentMonth),
    [workouts, currentMonth]
  );

  // Group progress data by exercise
  const progressByExercise = useMemo(() => {
    const groups = new Map<string, typeof progressData>();
    for (const item of progressData) {
      const arr = groups.get(item.exerciseName) || [];
      arr.push(item);
      groups.set(item.exerciseName, arr);
    }
    return groups;
  }, [progressData]);

  const oneRMData = useMemo(
    () => get1RMProgression(workouts),
    [workouts]
  );

  // All months in the data
  const allMonths = useMemo(() => {
    const months = new Set<string>();
    for (const ex of oneRMData) {
      for (const m of ex.monthly) {
        months.add(m.monthKey);
      }
    }
    return Array.from(months).sort();
  }, [oneRMData]);


  const monthLabel = format(currentMonth, 'yyyy年M月', { locale: zhCN });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Month selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">月总结</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <CaretLeft size={18} />
          </button>
          <span className="text-sm font-medium min-w-[100px] text-center">{monthLabel}</span>
          <button
            onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <CaretRight size={18} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">训练次数</div>
          <div className="text-2xl font-bold tracking-tight">{summary.totalWorkouts}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">总组数</div>
          <div className="text-2xl font-bold tracking-tight">{summary.totalSets}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">总容量</div>
          <div className="text-2xl font-bold tracking-tight">{summary.totalVolume.toLocaleString()}</div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">kg</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">总次数</div>
          <div className="text-2xl font-bold tracking-tight">{summary.totalReps.toLocaleString()}</div>
        </div>
      </div>

      {/* Workout list */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-zinc-700 dark:text-zinc-300">训练记录</h3>
        <div className="space-y-2">
          {monthWorkouts.length === 0 && (
            <div className="text-center py-8 text-sm text-zinc-400 dark:text-zinc-600">本月无训练记录</div>
          )}
          {monthWorkouts
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((w) => (
              <div key={w.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{w.date.slice(5)}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {w.exercises.length} 个动作 · {totalSets(w)} 组
                  </span>
                  {w.notes && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">{w.notes}</span>
                  )}
                </div>
                <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                  {workoutVolume(w).toLocaleString()} kg
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Muscle volume by month */}
      {/* Progressive overload progress */}
      {progressByExercise.size > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 text-zinc-700 dark:text-zinc-300">渐进超负荷（⭐）</h3>
          <div className="space-y-4">
            {Array.from(progressByExercise.entries()).map(([name, items]) => (
              <div key={name} className="bg-white dark:bg-zinc-900 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
                <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="text-amber-500">⭐</span>
                    {name}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">日期</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">重量</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">次数</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">休息</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">容量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                        <td className="px-4 py-2">{item.date.slice(5)}</td>
                        <td className="px-4 py-2 text-right font-mono">{item.weight} kg</td>
                        <td className="px-4 py-2 text-right font-mono">{item.reps}</td>
                        <td className="px-4 py-2 text-right font-mono">{item.restTime}s</td>
                        <td className="px-4 py-2 text-right font-mono">{(item.weight * item.reps).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1RM Progression across months */}
      {oneRMData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 text-zinc-700 dark:text-zinc-300">1RM 估算（逐月进步）</h3>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 min-w-[120px]">动作</th>
                  {allMonths.map((m) => (
                    <th key={m} className="text-right px-3 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 min-w-[80px]">
                      {m.split('-')[1]}月
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {oneRMData.map((exercise) => (
                  <tr key={exercise.exerciseName} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <td className="px-4 py-2.5 font-medium">{exercise.exerciseName}</td>
                    {allMonths.map((m) => {
                      const monthData = exercise.monthly.find((md) => md.monthKey === m);
                      if (!monthData) {
                        return <td key={m} className="px-3 py-2.5 text-right text-zinc-300 dark:text-zinc-700">-</td>;
                      }
                      // Color based on trend: green if improving, neutral otherwise
                      const prevIdx = exercise.monthly.findIndex((md) => md.monthKey === m);
                      const prev = prevIdx > 0 ? exercise.monthly[prevIdx - 1] : null;
                      const isUp = prev && monthData.estimated1RM > prev.estimated1RM;
                      const isDown = prev && monthData.estimated1RM < prev.estimated1RM;
                      return (
                        <td
                          key={m}
                          className={`px-3 py-2.5 text-right font-mono text-sm ${
                            isUp ? 'text-emerald-600 dark:text-emerald-400' :
                            isDown ? 'text-red-500 dark:text-red-400' :
                            'text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {monthData.estimated1RM}
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-0.5">kg</span>
                          {prev && (
                            <span className="text-[10px] ml-1">
                              {monthData.estimated1RM - prev.estimated1RM > 0 ? `+${monthData.estimated1RM - prev.estimated1RM}` : monthData.estimated1RM - prev.estimated1RM}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">基于 Epley 公式估算 1RM 理论值（weight × (1 + reps/30)），取每月最优组</p>
        </div>
      )}


            {e1rmData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 text-zinc-700 dark:text-zinc-300">1RM 进步追踪</h3>
          <div className="space-y-4">
            {e1rmData.map(({ exerciseName, data }) => {
              const first = data[0];
              const last = data[data.length - 1];
              const change = last.e1rm - first.e1rm;
              const changePercent = first.e1rm > 0 ? ((change / first.e1rm) * 100).toFixed(1) : '0';
              return (
                <div key={exerciseName} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                    <span className="text-sm font-medium">{exerciseName}</span>
                    <span className={`text-xs font-mono ${change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                      {change > 0 ? '+' : ''}{changePercent}%
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">日期</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">重量</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">次数</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">估算 1RM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, i) => (
                        <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                          <td className="px-4 py-2">{item.date.slice(5)}</td>
                          <td className="px-4 py-2 text-right font-mono">{item.weight} kg</td>
                          <td className="px-4 py-2 text-right font-mono">{item.reps}</td>
                          <td className="px-4 py-2 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                            {item.e1rm} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {monthWorkouts.length === 0 && progressByExercise.size === 0 && (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
          <p className="text-sm">本月还没有训练记录</p>
        </div>
      )}
    </div>
  );
}
