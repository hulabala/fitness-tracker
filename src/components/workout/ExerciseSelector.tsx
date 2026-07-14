 import { useState, useMemo } from 'react';
 import { defaultExercises } from '../../data/exercises';
 import { getMuscleTarget } from '../../data/muscleTargets';
 import { X, MagnifyingGlass } from '@phosphor-icons/react';
 
 interface ExerciseSelectorProps {
   onSelect: (exerciseId: string) => void;
   onClose: () => void;
 }
 
 export default function ExerciseSelector({
   onSelect,
   onClose,
 }: ExerciseSelectorProps) {
   const [search, setSearch] = useState('');
 
   const filtered = useMemo(() => {
     const q = search.toLowerCase();
     return defaultExercises.filter(
       (ex) =>
         ex.name.includes(q) ||
         ex.targets.some((t) => getMuscleTarget(t)?.name.includes(q))
     );
   }, [search]);
 
   // Group by first target category
   const grouped = useMemo(() => {
     const groups: { name: string; exercises: typeof defaultExercises }[] = [];
     const catOrder = ['chest', 'shoulders', 'back', 'legs', 'arms', 'core'];
     const catNames: Record<string, string> = {
       chest: '胸',
       shoulders: '肩',
       back: '背',
       legs: '腿',
       arms: '手臂',
       core: '核心',
     };
 
     for (const cat of catOrder) {
       const exs = filtered.filter((ex) => {
         const firstTarget = getMuscleTarget(ex.targets[0]);
         return firstTarget?.category === cat;
       });
       if (exs.length > 0) {
         groups.push({ name: catNames[cat] || cat, exercises: exs });
       }
     }
     return groups;
   }, [filtered]);
 
   return (
     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
       <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden mx-4">
         {/* Header */}
         <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
           <h3 className="font-medium text-sm">选择动作</h3>
           <button
             onClick={onClose}
             className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
           >
             <X size={18} />
           </button>
         </div>
 
         {/* Search */}
         <div className="px-4 pt-3 pb-2">
           <div className="relative">
             <MagnifyingGlass
               size={16}
               className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
             />
             <input
               type="text"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="搜索动作名称或部位..."
               className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-zinc-400"
               autoFocus
             />
           </div>
         </div>
 
         {/* Exercise list */}
         <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
           {grouped.map((group) => (
             <div key={group.name} className="mt-3 first:mt-0">
               <h4 className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                 {group.name}
               </h4>
               <div className="space-y-1">
                 {group.exercises.map((ex) => {
                   const targets = ex.targets
                     .map((t) => getMuscleTarget(t)?.name)
                     .filter(Boolean);
                   return (
                     <button
                       key={ex.id}
                       onClick={() => onSelect(ex.id)}
                       className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                     >
                       <span className="text-sm font-medium">{ex.name}</span>
                       <span className="text-xs text-zinc-400 dark:text-zinc-500">
                         {targets.join('、')}
                       </span>
                     </button>
                   );
                 })}
               </div>
             </div>
           ))}
 
           {filtered.length === 0 && (
             <div className="text-center py-8 text-zinc-400 dark:text-zinc-600">
               <p className="text-sm">没有找到匹配的动作</p>
             </div>
           )}
         </div>
       </div>
     </div>
   );
 }
