 import { useEffect, useState } from 'react';
 import { useFitnessStore } from '../../store/store';
 import { getExercise } from '../../data/exercises';
 import ExerciseEntry from './ExerciseEntry';
 import ExerciseSelector from './ExerciseSelector';
 import { FloppyDisk, Plus } from '@phosphor-icons/react';
 
 interface WorkoutLoggerProps {
   onSave: () => void;
 }
 
 export default function WorkoutLogger({ onSave }: WorkoutLoggerProps) {
   const {
     currentWorkout,
     startNewWorkout,
     setCurrentWorkoutDate,
     setCurrentWorkoutNotes,
     addExerciseToCurrentWorkout,
     removeExerciseFromCurrentWorkout,
     saveCurrentWorkout,
   } = useFitnessStore();
 
   const [showExerciseSelector, setShowExerciseSelector] = useState(false);
 
   useEffect(() => {
     if (!currentWorkout) {
       startNewWorkout();
     }
   }, [currentWorkout, startNewWorkout]);
 
   if (!currentWorkout) return null;
 
   const handleSave = () => {
     saveCurrentWorkout();
     onSave();
   };
 
   return (
     <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
         <h2 className="text-xl font-semibold tracking-tight">训练记录</h2>
         <button
           onClick={handleSave}
           disabled={currentWorkout.exercises.length === 0}
           className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
         >
           <FloppyDisk size={16} weight="bold" />
           保存训练
         </button>
       </div>
 
       {/* Date input */}
       <div className="flex items-center gap-4">
         <label className="text-sm text-zinc-500 dark:text-zinc-400">日期</label>
         <input
           type="date"
           value={currentWorkout.date}
           onChange={(e) => setCurrentWorkoutDate(e.target.value)}
           className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
         />
       </div>
 
       {/* Notes */}
       <div>
         <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1">备注</label>
         <input
           type="text"
           value={currentWorkout.notes}
           onChange={(e) => setCurrentWorkoutNotes(e.target.value)}
           placeholder="今天的训练感觉如何？"
           className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-zinc-400"
         />
       </div>
 
       {/* Exercises */}
       <div className="space-y-4">
         {currentWorkout.exercises.map((exLog) => {
           const exercise = getExercise(exLog.exerciseId);
           return (
             <ExerciseEntry
               key={exLog.id}
               exerciseLog={exLog}
               exerciseName={exercise?.name || exLog.exerciseId}
               onRemove={() => removeExerciseFromCurrentWorkout(exLog.id)}
             />
           );
         })}
 
         {currentWorkout.exercises.length === 0 && (
           <div className="text-center py-12 text-zinc-400 dark:text-zinc-600">
             <p className="text-sm">点击下方按钮添加训练动作</p>
           </div>
         )}
 
         <button
           onClick={() => setShowExerciseSelector(true)}
           className="w-full py-3 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-sm text-zinc-500 dark:text-zinc-400 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-colors flex items-center justify-center gap-2"
         >
           <Plus size={16} weight="bold" />
           添加动作
         </button>
       </div>
 
       {showExerciseSelector && (
         <ExerciseSelector
           onSelect={(exerciseId) => {
             addExerciseToCurrentWorkout(exerciseId);
             setShowExerciseSelector(false);
           }}
           onClose={() => setShowExerciseSelector(false)}
         />
       )}
     </div>
   );
 }
