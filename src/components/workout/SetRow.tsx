import { WorkoutSet } from '../../types';
import { Copy, Trash } from '@phosphor-icons/react';

interface SetRowProps {
  set: WorkoutSet;
  onChange: (updates: Partial<WorkoutSet>) => void;
  onRemove: () => void;
  onCopy: () => void;
}

export default function SetRow({ set, onChange, onRemove, onCopy }: SetRowProps) {
  return (
    <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem_2rem] gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
      <span className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
        {set.setNumber}
      </span>

      <input
        type="number"
        value={set.weight || ''}
        onChange={(e) => onChange({ weight: Number(e.target.value) })}
        className="w-full px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-center focus:outline-none focus:ring-1 focus:ring-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min={0}
        step={0.5}
      />

      <input
        type="number"
        value={set.reps || ''}
        onChange={(e) => onChange({ reps: Number(e.target.value) })}
        className="w-full px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-center focus:outline-none focus:ring-1 focus:ring-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min={0}
      />

      <input
        type="number"
        value={set.restTime || ''}
        onChange={(e) => onChange({ restTime: Number(e.target.value) })}
        className="w-full px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-center focus:outline-none focus:ring-1 focus:ring-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min={0}
        step={5}
      />

      <button
        onClick={onCopy}
        className="p-1 rounded-md text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all flex items-center justify-center"
        title="复制此组"
      >
        <Copy size={14} />
      </button>

      <button
        onClick={onRemove}
        className="p-1 rounded-md text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
        title="删除此组"
      >
        <Trash size={14} />
      </button>
    </div>
  );
}
