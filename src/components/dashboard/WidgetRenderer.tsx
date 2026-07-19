 import { useMemo } from 'react';
 import { useFitnessStore } from '../../store/store';
 import {
   getWorkoutsInWeek,
   getWorkoutsInMonth,
   weeklyVolumeByDay,
   weeklySummary,
   aggregateMuscleVolume,
   getProgressiveOverloadSets,
   workoutVolume,
   totalSets,
 } from '../../utils/calculations';
 import { DashboardWidget, Workout } from '../../types';
 import { getExercise } from '../../data/exercises';
 import { getMuscleTarget } from '../../data/muscleTargets';
 import { startOfWeek, endOfWeek, parseISO, isWithinInterval, format } from 'date-fns';
 import { zhCN } from 'date-fns/locale';
 import SimpleBarChart from '../charts/SimpleBarChart';
 import SimpleLineChart from '../charts/SimpleLineChart';
 import StatsCard from '../charts/StatsCard';
 import SimpleTable from '../charts/SimpleTable';
 import { ChartBar, ChartLine, ListBullets, Cards } from '@phosphor-icons/react';
 
 interface WidgetRendererProps {
   widget: DashboardWidget;
   workouts: Workout[];
 }
 
 export default function WidgetRenderer({ widget, workouts }: WidgetRendererProps) {
   const data = useWidgetData(widget, workouts);
   const { title, visualization } = widget;
 
   return (
     <div className="h-full flex flex-col">
       <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
         <span className="text-sm font-medium">{title}</span>
         <span className="text-xs text-zinc-400 dark:text-zinc-500">{getVizLabel(visualization)}</span>
       </div>
       <div className="flex-1 min-h-0 p-3">
         {data ? renderContent(data, visualization) : (
           <div className="flex items-center justify-center h-full text-xs text-zinc-400 dark:text-zinc-600">
             暂无数据
           </div>
         )}
       </div>
     </div>
   );
 }
 
 function renderContent(data: WidgetData, viz: DashboardWidget['visualization']) {
   switch (data.type) {
     case 'weeklySummary':
       return <SummaryContent data={data} viz={viz} />;
     case 'weeklyVolume':
       return <VolumeContent data={data} viz={viz} />;
     case 'muscleVolume':
       return <MuscleContent data={data} viz={viz} />;
     case 'progressiveOverload':
       return <ProgressContent data={data} viz={viz} />;
     case 'monthlyStats':
       return <MonthlyContent data={data} viz={viz} />;
     default:
       return null;
   }
 }
 
 // ---- Data Hook ----
 type WidgetData =
  | { type: 'muscleProgress'; items: Awaited<ReturnType<typeof getMuscleProgressData>> }
     | { type: 'weeklySummary'; totalWorkouts: number; totalSets: number; totalVolume: number; totalReps: number }
   | { type: 'weeklyVolume'; items: { day: string; volume: number; sets: number }[] }
   | { type: 'muscleVolume'; items: { muscleId: string; muscleName: string; volume: number; sets: number }[] }
   | { type: 'progressiveOverload'; items: { date: string; exerciseName: string; weight: number; reps: number; restTime: number }[] }
   | { type: 'muscleProgress'; items: any[] };
 
 function useWidgetData(widget: DashboardWidget, workouts: Workout[]): WidgetData | null {
   return useMemo(() => {
     const now = new Date();
 
     switch (widget.type) {
       case 'weeklySummary': {
         const weekWorkouts = getWorkoutsInWeek(workouts, now);
         const summary = weeklySummary(weekWorkouts);
         return { type: 'weeklySummary', ...summary };
       }
       case 'weeklyVolume': {
         const weekWorkouts = getWorkoutsInWeek(workouts, now);
         return {
           type: 'weeklyVolume',
           items: weeklyVolumeByDay(weekWorkouts).map((d) => ({
             day: d.day,
             volume: d.volume,
             sets: d.sets,
           })),
         };
       }
       case 'muscleVolume': {
         const weekWorkouts = getWorkoutsInWeek(workouts, now);
         const muscleData = aggregateMuscleVolume(weekWorkouts);
         return { type: 'muscleVolume', items: muscleData };
       }
       case 'progressiveOverload': {
         return {
           type: 'progressiveOverload',
           items: getProgressiveOverloadSets(workouts, now),
         };
       }
       case 'monthlyStats': {
         const monthWorkouts = getWorkoutsInMonth(workouts, now);
         const items = monthWorkouts
           .sort((a, b) => a.date.localeCompare(b.date))
           .map((w) => ({
             date: w.date.slice(5),
             volume: workoutVolume(w),
             sets: totalSets(w),
             exercises: w.exercises.length,
           }));
         return { type: 'monthlyStats', items };
       }
       default:
         return null;
     }
   }, [widget.type, workouts]);
 }
 
 // ---- Sub-renderers ----
 function SummaryContent({ data, viz }: { data: WidgetData & { type: 'weeklySummary' }; viz: DashboardWidget['visualization'] }) {
   if (viz === 'card') {
     return (
       <div className="grid grid-cols-2 gap-4 h-full items-center">
         <StatsCard title="本周训练" value={`${data.totalWorkouts}次`} subtitle={`${data.totalWorkouts > 0 ? '继续加油' : '本周还未训练'}`} />
         <StatsCard title="总组数" value={data.totalSets} />
         <StatsCard title="总容量" value={data.totalVolume.toLocaleString()} subtitle="kg" />
         <StatsCard title="总次数" value={data.totalReps} />
       </div>
     );
   }
   // For other visualizations, show table
   return (
     <SimpleTable
       columns={[
         { key: 'metric', label: '指标' },
         { key: 'value', label: '数值', align: 'right' },
       ]}
       data={[
         { metric: '本周训练次数', value: `${data.totalWorkouts}次` },
         { metric: '总组数', value: data.totalSets },
         { metric: '总容量 (kg)', value: data.totalVolume.toLocaleString() },
         { metric: '总次数', value: data.totalReps },
       ]}
     />
   );
 }
 
 function VolumeContent({ data, viz }: { data: WidgetData & { type: 'weeklyVolume' }; viz: DashboardWidget['visualization'] }) {
   if (viz === 'bar') {
     return (
       <SimpleBarChart
         data={data.items.map((d) => ({ label: d.day, value: d.volume }))}
         formatter={(v) => v.toLocaleString()}
       />
     );
   }
   if (viz === 'line') {
     return (
       <SimpleLineChart
         data={data.items.map((d) => ({ label: d.day, volume: d.volume }))}
         series={[{ dataKey: 'volume', name: '容量', color: '#f59e0b' }]}
         unit="kg"
       />
     );
   }
   return (
     <SimpleTable
       columns={[
         { key: 'day', label: '日期' },
         { key: 'volume', label: '容量 (kg)', align: 'right' },
         { key: 'sets', label: '组数', align: 'right' },
       ]}
       data={data.items.map((d) => ({ day: d.day, volume: d.volume, sets: d.sets }))}
     />
   );
 }
 
 function MuscleContent({ data, viz }: { data: WidgetData & { type: 'muscleVolume' }; viz: DashboardWidget['visualization'] }) {
   if (viz === 'bar') {
     const sorted = [...data.items].sort((a, b) => b.sets - a.sets).slice(0, 10);
     return (
       <SimpleBarChart
         data={sorted.map((d) => ({ label: d.muscleName, value: d.sets }))}
         color="#8b5cf6"
         unit="组"
       />
     );
   }
   return (
     <SimpleTable
       columns={[
         { key: 'muscle', label: '部位' },
         { key: 'sets', label: '组数', align: 'right' },
         { key: 'volume', label: '容量', align: 'right' },
       ]}
       data={data.items.map((d) => ({
         muscle: d.muscleName,
         sets: d.sets,
         volume: d.volume.toLocaleString(),
       }))}
     />
   );
 }
 
 function ProgressContent({ data, viz }: { data: WidgetData & { type: 'progressiveOverload' }; viz: DashboardWidget['visualization'] }) {
   if (data.items.length === 0) {
     return <div className="flex items-center justify-center h-full text-xs text-zinc-400 dark:text-zinc-600">标记渐进超负荷的动作将会显示在这里</div>;
   }
 
   if (viz === 'line') {
     // Group by exercise name and create multi-series
     const groups = new Map<string, { date: string; weight: number; reps: number }[]>();
     for (const item of data.items) {
       const arr = groups.get(item.exerciseName) || [];
       arr.push({ date: item.date.slice(5), weight: item.weight, reps: item.reps });
       groups.set(item.exerciseName, arr);
     }
     const allDates = [...new Set(data.items.map((i) => i.date.slice(5)))].sort();
     const chartData = allDates.map((date) => {
       const row: Record<string, string | number> = { label: date };
       for (const [name, items] of groups) {
         const match = items.find((i) => i.date.slice(5) === date);
         row[name] = match?.weight || null;
       }
       return row;
     });
     const colors = ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6'];
     const series = Array.from(groups.keys()).map((name, i) => ({
       dataKey: name,
       name,
       color: colors[i % colors.length],
     }));
 
     return (
       <SimpleLineChart
         data={chartData}
         series={series}
         unit="kg"
       />
     );
   }
 
   return (
     <SimpleTable
       columns={[
         { key: 'date', label: '日期' },
         { key: 'exercise', label: '动作' },
         { key: 'weight', label: '重量', align: 'right' },
         { key: 'reps', label: '次数', align: 'right' },
         { key: 'rest', label: '休息', align: 'right' },
       ]}
       data={data.items.map((d) => ({
         date: d.date.slice(5),
         exercise: d.exerciseName,
         weight: `${d.weight}kg`,
         reps: d.reps,
         rest: `${d.restTime}s`,
       }))}
     />
   );
 }
 
  
 function getVizLabel(viz: DashboardWidget['visualization']): string {
   switch (viz) {
     case 'bar': return '柱状图';
     case 'line': return '折线图';
     case 'card': return '数值卡';
     case 'table': return '表格';
   }
 }
 
 export const vizOptions: { value: DashboardWidget['visualization']; label: string; icon: typeof ChartBar }[] = [
   { value: 'bar', label: '柱状图', icon: ChartBar },
   { value: 'line', label: '折线图', icon: ChartLine },
   { value: 'card', label: '数值卡', icon: Cards },
   { value: 'table', label: '表格', icon: ListBullets },
 ];
