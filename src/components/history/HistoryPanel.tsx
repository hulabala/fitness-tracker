 import { useState } from 'react';
 import { useFitnessStore } from '../../store/store';
import { workoutVolume, totalSets, totalReps, muscleSetCounts } from '../../utils/calculations';
 import { getExercise } from '../../data/exercises';
 import { getMuscleTarget } from '../../data/muscleTargets';
 import { Star, Pencil, Trash, CaretDown, CaretRight, Copy } from '@phosphor-icons/react';
 import { format, parseISO } from 'date-fns';
 import { zhCN } from 'date-fns/locale';
 
 interface HistoryPanelProps {
   onEdit: (workoutId: string) => void;
 }
 
 export default function HistoryPanel({ onEdit, onCopy }: HistoryPanelProps) {
   const { workouts, editWorkout, deleteWorkout } = useFitnessStore();
   const [expandedId, setExpandedId] = useState<string | null>(null);
 
   const sortedWorkouts = [...workouts].sort(
     (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
   );
 
   if (sortedWorkouts.length === 0) {
     return (
       <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
         <p className="text-sm">还没有训练记录</p>
         <p className="text-xs mt-1">点击「训练记录」开始记录你的训练</p>
       </div>
     );
   }
 
   return (
     <div className="max-w-3xl mx-auto space-y-3">
       <h2 className="text-xl font-semibold tracking-tight mb-6">训练历史</h2>
       {sortedWorkouts.map((workout) => {
         const isExpanded = expandedId === workout.id;
         const vol = workoutVolume(workout);
         const sets = totalSets(workout);
         const reps = totalReps(workout);
         const muscleSets = muscleSetCounts(workout);
         const topMuscles = Array.from(muscleSets.entries())
           .sort((a, b) => b[1] - a[1])
           .slice(0, 3)
           .map(([id, count]) => `${getMuscleTarget(id)?.name || id}(${count}组)`)
           .join('、');
 
         const dateObj = parseISO(workout.date);
         const dayLabel = format(dateObj, 'M月d日 EEEE', { locale: zhCN });
 
         return (
           <div
             key={workout.id}
             className="border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden transition-all"
           >
             {/* Collapsed header */}
             <button
               onClick={() => setExpandedId(isExpanded ? null : workout.id)}
               className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
             >
               <div className="flex items-center gap-3">
                 {isExpanded ? (
                   <CaretDown size={16} className="text-zinc-400" />
                 ) : (
                   <CaretRight size={16} className="text-zinc-400" />
                 )}
                 <div className="text-left">
                   <span className="font-medium text-sm">{dayLabel}</span>
                   {workout.notes && (
                     <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                       {workout.notes}
                     </span>
                   )}
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 {/* Collapsed stats row */}
                 <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                   <span>{workout.exercises.length}个动作</span>
                   <span>{sets}组</span>
                   <span>{vol.toLocaleString()}kg</span>
                   {topMuscles && <span className="text-zinc-400 dark:text-zinc-500">| {topMuscles}</span>}
                 </div>
                 {/* Mobile condensed stats */}
                 <div className="sm:hidden flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                   <span>{sets}组</span>
                   <span>{vol.toLocaleString()}kg</span>
                 </div>
               </div>
             </button>
 
             {/* Expanded detail */}
             {isExpanded && (
               <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-3 space-y-4">
                 {workout.exercises.map((exLog) => {
                   const exercise = getExercise(exLog.exerciseId);
                   const targets = exercise?.targets
                     .map((t) => getMuscleTarget(t)?.name)
                     .filter(Boolean)
                     .join('、') || '';
 
                   return (
                     <div key={exLog.id}>
                       <div className="flex items-center gap-2 mb-2">
                         <span className="text-sm font-medium flex items-center gap-1.5">
                           {exLog.isProgressiveOverload && (
                             <Star size={12} weight="fill" className="text-amber-500" />
                           )}
                           {exercise?.name || exLog.exerciseId}
                         </span>
                         <span className="text-xs text-zinc-400 dark:text-zinc-500">
                           {targets}
                         </span>
                       </div>
                       {/* Set header */}
                       <div className="grid grid-cols-[2rem_3rem_3rem_3rem] gap-3 text-xs text-zinc-400 dark:text-zinc-500 px-2 mb-1">
                         <span>#</span>
                         <span>kg</span>
                         <span>次数</span>
                         <span>休息</span>
                         <span></span>
                       </div>
                       {exLog.sets.map((set) => (
                         <div
                           key={set.id}
                           className="grid grid-cols-[2rem_3rem_3rem_3rem_2rem] gap-3 items-center px-2 py-1 text-sm"
                         >
                           <span className="text-zinc-400 dark:text-zinc-500 text-xs">
                             {set.setNumber}
                           </span>
                           <span>{set.weight}</span>
                           <span>{set.reps}</span>
                           <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                             {set.restTime}s
                           </span>
                           <span>
                             {set.isProgressiveOverload && (
                               <Star
                                 size={12}
                                 weight="fill"
                                 className="text-amber-500"
                               />
                             )}
                           </span>
                         </div>
                       ))}
                     </div>
                   );
                 })}
 
                 {/* Action buttons */}
                 <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                   <button
                     onClick={() => {
                       editWorkout(workout.id);
                       onEdit(workout.id);
                     }}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                   >
                     <Pencil size={14} />
                     编辑
                   </button>
                   <button
                     onClick={() => onCopy(workout.id)}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                   >
                     <Copy size={14} />
                     复制
                   </button>
                   <button
                     onClick={() => {
                       if (confirm('确定要删除这次训练吗？')) {
                         deleteWorkout(workout.id);
                       }
                     }}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                   >
                     <Trash size={14} />
                     删除
                   </button>
                 </div>
               </div>
             )}
           </div>
         );
       })}
     </div>
   );
 }
