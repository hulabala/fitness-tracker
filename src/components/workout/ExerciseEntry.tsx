import { ExerciseLog } from '../../types';
import SetRow from './SetRow';
import { useFitnessStore } from '../../store/store';
import { Plus, Trash, Star } from '@phosphor-icons/react';
import { getExercise } from '../../data/exercises';
import { getMuscleTarget } from '../../data/muscleTargets';

interface ExerciseEntryProps {
  exerciseLog: ExerciseLog;
  exerciseName: string;
  onRemove: () => void;
}

export default function ExerciseEntry({
  exerciseLog,
  exerciseName,
  onRemove,
}: ExerciseEntryProps) {
  const { addSetToExercise, copySet, updateSet, removeSet, toggleExerciseProgressiveOverload } =
    useFitnessStore();

  const exercise = getExercise(exerciseLog.exerciseId);
  const muscleTargets = exercise?.targets
    .map((t) => getMuscleTarget(t)?.name)
    .filter(Boolean) || [];

  const totalVolume = exerciseLog.sets.reduce(
    (sum, s) => sum + s.weight * s.reps,
    0
  );

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      exerciseLog.isProgressiveOverload
        ? 'border-amber-300 dark:border-amber-600 bg-amber-50/30 dark:bg-amber-900/10'
        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
    }`}>
      {/* Exercise header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        exerciseLog.isProgressiveOverload
          ? 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
          : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleExerciseProgressiveOverload(exerciseLog.id)}
            className={`p-1 rounded-md transition-all ${
              exerciseLog.isProgressiveOverload
                ? 'text-amber-500 hover:text-amber-600 bg-amber-100 dark:bg-amber-900/30'
                : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
            title={exerciseLog.isProgressiveOverload ? '取消渐进超负荷' : '标记为渐进超负荷动作'}
          >
            <Star size={16} weight={exerciseLog.isProgressiveOverload ? 'fill' : 'regular'} />
          </button>
          <span className="font-medium text-sm">{exerciseName}</span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {muscleTargets.join('、')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            容量: {totalVolume} kg
          </span>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="删除此动作"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {/* Set headers */}
      <div className="px-4 pt-3 pb-1">
        <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem_2rem] gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          <span>#</span>
          <span>重量 (kg)</span>
          <span>次数</span>
          <span>休息 (s)</span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Sets */}
      <div className="px-4 pb-2 space-y-1">
        {exerciseLog.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            onChange={(updates) => updateSet(exerciseLog.id, set.id, updates)}
            onRemove={() => removeSet(exerciseLog.id, set.id)}
            onCopy={() => copySet(exerciseLog.id, set.id)}
          />
        ))}
      </div>

      {/* Add set button */}
      <div className="px-4 pb-3">
        <button
          onClick={() => addSetToExercise(exerciseLog.id)}
          className="w-full py-1.5 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 text-xs text-zinc-400 hover:border-amber-400 hover:text-amber-500 transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={12} weight="bold" />
          添加组
        </button>
      </div>
    </div>
  );
}
