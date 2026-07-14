 import { ExerciseDefinition } from '../types';
 
 export const defaultExercises: ExerciseDefinition[] = [
   // Chest
   { id: 'bench-press', name: '杠铃卧推', targets: ['chest', 'triceps', 'front-delts'] },
   { id: 'dumbbell-bench', name: '哑铃卧推', targets: ['chest', 'triceps', 'front-delts'] },
   { id: 'incline-barbell', name: '上斜杠铃卧推', targets: ['upper-chest', 'front-delts', 'triceps'] },
   { id: 'incline-dumbbell', name: '上斜哑铃卧推', targets: ['upper-chest', 'front-delts', 'triceps'] },
   { id: 'decline-bench', name: '下斜卧推', targets: ['chest', 'triceps', 'front-delts'] },
   { id: 'chest-dips', name: '双杠臂屈伸(胸)', targets: ['chest', 'triceps', 'front-delts'] },
   { id: 'cable-fly', name: '绳索夹胸', targets: ['chest', 'front-delts'] },
   { id: 'pec-deck', name: '蝴蝶机夹胸', targets: ['chest'] },
   { id: 'pushup', name: '俯卧撑', targets: ['chest', 'triceps', 'front-delts'] },
 
   // Shoulders
   { id: 'ohp-barbell', name: '杠铃推举', targets: ['front-delts', 'side-delts', 'triceps'] },
   { id: 'ohp-dumbbell', name: '哑铃推举', targets: ['front-delts', 'side-delts', 'triceps'] },
   { id: 'lateral-raise', name: '侧平举', targets: ['side-delts'] },
   { id: 'front-raise', name: '前平举', targets: ['front-delts'] },
   { id: 'face-pull', name: '面拉', targets: ['rear-delts', 'traps'] },
   { id: 'reverse-fly', name: '反向飞鸟', targets: ['rear-delts'] },
   { id: 'arnold-press', name: '阿诺德推举', targets: ['front-delts', 'side-delts', 'triceps'] },
 
   // Back
   { id: 'pullup', name: '引体向上', targets: ['lats', 'biceps', 'middle-back'] },
   { id: 'lat-pulldown', name: '高位下拉', targets: ['lats', 'biceps'] },
   { id: 'barbell-row', name: '杠铃划船', targets: ['middle-back', 'lats', 'biceps', 'rear-delts'] },
   { id: 'dumbbell-row', name: '哑铃划船', targets: ['lats', 'middle-back', 'biceps'] },
   { id: 'cable-row', name: '坐姿划船', targets: ['middle-back', 'lats', 'biceps'] },
   { id: 't-bar-row', name: 'T杠划船', targets: ['middle-back', 'lats', 'biceps', 'rear-delts'] },
   { id: 'deadlift', name: '硬拉', targets: ['hamstrings', 'glutes', 'lower-back', 'traps', 'forearms'] },
   { id: 'rack-pull', name: '架上硬拉', targets: ['hamstrings', 'glutes', 'lower-back', 'traps', 'forearms'] },
   { id: 'shrug', name: '耸肩', targets: ['traps'] },
   { id: 'pullover', name: '直臂下压', targets: ['lats', 'chest'] },
 
   // Legs
   { id: 'squat-barbell', name: '杠铃深蹲', targets: ['quads', 'glutes', 'hamstrings', 'core', 'lower-back'] },
   { id: 'front-squat', name: '前蹲', targets: ['quads', 'glutes', 'core'] },
   { id: 'leg-press', name: '倒蹬机', targets: ['quads', 'glutes', 'hamstrings'] },
   { id: 'leg-extension', name: '腿屈伸', targets: ['quads'] },
   { id: 'leg-curl', name: '腿弯举', targets: ['hamstrings'] },
   { id: 'rdl', name: '罗马尼亚硬拉', targets: ['hamstrings', 'glutes'] },
   { id: 'bulgarian-split', name: '保加利亚分腿蹲', targets: ['quads', 'glutes', 'hamstrings'] },
   { id: 'lunge', name: '箭步蹲', targets: ['quads', 'glutes', 'hamstrings'] },
   { id: 'hip-thrust', name: '臀推', targets: ['glutes', 'hamstrings'] },
   { id: 'calf-raise', name: '提踵', targets: ['calves'] },
   { id: 'goblet-squat', name: '高脚杯深蹲', targets: ['quads', 'glutes', 'core'] },
 
   // Arms
   { id: 'barbell-curl', name: '杠铃弯举', targets: ['biceps'] },
   { id: 'dumbbell-curl', name: '哑铃弯举', targets: ['biceps'] },
   { id: 'hammer-curl', name: '锤式弯举', targets: ['biceps', 'forearms'] },
   { id: 'cable-curl', name: '绳索弯举', targets: ['biceps'] },
   { id: 'preacher-curl', name: '牧师凳弯举', targets: ['biceps'] },
   { id: 'skull-crusher', name: '碎颅者', targets: ['triceps'] },
   { id: 'tricep-pushdown', name: '绳索下压', targets: ['triceps'] },
   { id: 'overhead-tricep', name: '颈后臂屈伸', targets: ['triceps'] },
   { id: 'close-grip-bench', name: '窄距卧推', targets: ['triceps', 'chest'] },
   { id: 'dips', name: '双杠臂屈伸(肱三)', targets: ['triceps', 'chest'] },
   { id: 'wrist-curl', name: '腕弯举', targets: ['forearms'] },
 
   // Core
   { id: 'crunch', name: '卷腹', targets: ['abs'] },
   { id: 'plank', name: '平板支撑', targets: ['core', 'abs'] },
   { id: 'hanging-leg-raise', name: '悬垂举腿', targets: ['abs', 'hip-flexors'] },
   { id: 'cable-crunch', name: '绳索卷腹', targets: ['abs'] },
   { id: 'russian-twist', name: '俄罗斯转体', targets: ['obliques', 'abs'] },
   { id: 'pallof-press', name: '帕洛夫推', targets: ['core', 'obliques'] },
   { id: 'ab-wheel', name: '健腹轮', targets: ['abs', 'core'] },
   { id: 'leg-raise', name: '举腿', targets: ['abs', 'hip-flexors'] },
 ];
 
 export const exerciseMap = new Map(defaultExercises.map(e => [e.id, e]));
 
 export function getExercise(id: string): ExerciseDefinition | undefined {
   return exerciseMap.get(id);
 }
 
 // Custom exercises added by user
 let customExercises: ExerciseDefinition[] = [];
 
 export function getCustomExercises(): ExerciseDefinition[] {
   return customExercises;
 }
 
 export function getAllExercises(): ExerciseDefinition[] {
   return [...defaultExercises, ...customExercises];
 }
 
 export function addCustomExercise(exercise: ExerciseDefinition) {
   customExercises.push(exercise);
 }
