 import { MuscleTarget } from '../types';
 
 export const muscleTargets: MuscleTarget[] = [
   { id: 'upper-chest', name: '上胸', category: 'chest' },
   { id: 'chest', name: '胸', category: 'chest' },
   { id: 'front-delts', name: '肩前侧', category: 'shoulders' },
   { id: 'side-delts', name: '肩中侧', category: 'shoulders' },
   { id: 'rear-delts', name: '肩后侧', category: 'shoulders' },
   { id: 'triceps', name: '肱三头肌', category: 'arms' },
   { id: 'biceps', name: '肱二头肌', category: 'arms' },
   { id: 'forearms', name: '前臂', category: 'arms' },
   { id: 'traps', name: '斜方肌', category: 'back' },
   { id: 'lats', name: '背阔肌', category: 'back' },
   { id: 'middle-back', name: '中背', category: 'back' },
   { id: 'lower-back', name: '下背', category: 'back' },
   { id: 'glutes', name: '臀', category: 'legs' },
   { id: 'quads', name: '股四头肌', category: 'legs' },
   { id: 'hamstrings', name: '腘绳肌', category: 'legs' },
   { id: 'calves', name: '小腿', category: 'legs' },
   { id: 'abs', name: '腹肌', category: 'core' },
   { id: 'obliques', name: '腹斜肌', category: 'core' },
   { id: 'core', name: '核心', category: 'core' },
   { id: 'hip-flexors', name: '髋屈肌', category: 'other' },
 ];
 
 export const muscleTargetMap = new Map(muscleTargets.map(m => [m.id, m]));
 
 export function getMuscleTarget(id: string): MuscleTarget | undefined {
   return muscleTargetMap.get(id);
 }
 
 export function getCategoryGroups(): { category: string; muscles: MuscleTarget[] }[] {
   const groups: { category: string; muscles: MuscleTarget[] }[] = [];
   const cats = [...new Set(muscleTargets.map(m => m.category))];
   for (const cat of cats) {
     groups.push({
       category: cat,
       muscles: muscleTargets.filter(m => m.category === cat),
     });
   }
   return groups;
 }
