 import {
   Workout,
   ExerciseLog,
   WorkoutSet,
   ExerciseDefinition,
 } from '../types';
 import { getExercise } from '../data/exercises';
 import { getMuscleTarget } from '../data/muscleTargets';
 import {
   startOfWeek,
   endOfWeek,
   startOfMonth,
   endOfMonth,
   parseISO,
   isWithinInterval,
 } from 'date-fns';
 
 /** Total volume for a set: weight * reps */
 export function setVolume(set: WorkoutSet): number {
   return set.weight * set.reps;
 }
 
 /** Total volume for an exercise */
 export function exerciseVolume(exercise: ExerciseLog): number {
   return exercise.sets.reduce((sum, s) => sum + setVolume(s), 0);
 }
 
 /** Total volume for a workout */
 export function workoutVolume(workout: Workout): number {
   return workout.exercises.reduce((sum, e) => sum + exerciseVolume(e), 0);
 }
 
 /** Total sets in a workout */
 export function totalSets(workout: Workout): number {
   return workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
 }
 
 /** Total reps in a workout */
 export function totalReps(workout: Workout): number {
   return workout.exercises.reduce(
     (sum, e) => sum + e.sets.reduce((s, set) => s + set.reps, 0),
     0
   );
 }
 
 /** Count sets per muscle group for a workout */
 export function muscleSetCounts(workout: Workout): Map<string, number> {
   const counts = new Map<string, number>();
   for (const exLog of workout.exercises) {
     const exercise = getExercise(exLog.exerciseId);
     if (!exercise) continue;
     const setCount = exLog.sets.length;
     for (const targetId of exercise.targets) {
       counts.set(targetId, (counts.get(targetId) || 0) + setCount);
     }
   }
   return counts;
 }
 
 /** Volume per muscle group for a workout */
 export function muscleVolume(workout: Workout): Map<string, number> {
   const volume = new Map<string, number>();
   for (const exLog of workout.exercises) {
     const exercise = getExercise(exLog.exerciseId);
     if (!exercise) continue;
     const vol = exerciseVolume(exLog);
     for (const targetId of exercise.targets) {
       volume.set(targetId, (volume.get(targetId) || 0) + vol);
     }
   }
   return volume;
 }
 
 /** Get workouts in a given week (Mon-Sun) */
 export function getWorkoutsInWeek(
   workouts: Workout[],
   date: Date
 ): Workout[] {
   const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
   const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
   return workouts.filter((w) => {
     const wDate = parseISO(w.date);
     return isWithinInterval(wDate, { start: weekStart, end: weekEnd });
   });
 }
 
 /** Get workouts in a given month */
 export function getWorkoutsInMonth(
   workouts: Workout[],
   date: Date
 ): Workout[] {
   const monthStart = startOfMonth(date);
   const monthEnd = endOfMonth(date);
   return workouts.filter((w) => {
     const wDate = parseISO(w.date);
     return isWithinInterval(wDate, { start: monthStart, end: monthEnd });
   });
 }
 
 /** Weekly volume calculation */
 export function weeklyVolumeByDay(
   workouts: Workout[]
 ): { day: string; volume: number; sets: number }[] {
   return workouts
     .sort((a, b) => a.date.localeCompare(b.date))
     .map((w) => ({
       day: w.date.slice(5), // MM-DD
       volume: workoutVolume(w),
       sets: totalSets(w),
     }));
 }
 
 /** Get progressive overload sets for a given month */
 export function getProgressiveOverloadSets(
   workouts: Workout[],
   date: Date
 ): {
   date: string;
   exerciseName: string;
   weight: number;
   reps: number;
   restTime: number;
 }[] {
   const monthWorkouts = getWorkoutsInMonth(workouts, date);
   const result: {
     date: string;
     exerciseName: string;
     weight: number;
     reps: number;
     restTime: number;
   }[] = [];
 
   for (const workout of monthWorkouts) {
     for (const exLog of workout.exercises) {
       const starredSets = exLog.sets.filter((s) => s.isProgressiveOverload);
       if (starredSets.length > 0) {
         const exercise = getExercise(exLog.exerciseId);
         const bestSet = starredSets.reduce((best, s) =>
           s.weight > best.weight ||
           (s.weight === best.weight && s.reps > best.reps)
             ? s
             : best
         );
         result.push({
           date: workout.date,
           exerciseName: exercise?.name || exLog.exerciseId,
           weight: bestSet.weight,
           reps: bestSet.reps,
           restTime: bestSet.restTime,
         });
       }
     }
   }
 
   return result.sort((a, b) => a.date.localeCompare(b.date));
 }
 
 /** Calculate weekly summary stats */
 export function weeklySummary(workouts: Workout[]) {
   return {
     totalWorkouts: workouts.length,
     totalSets: workouts.reduce((sum, w) => sum + totalSets(w), 0),
     totalVolume: workouts.reduce((sum, w) => sum + workoutVolume(w), 0),
     totalReps: workouts.reduce((sum, w) => sum + totalReps(w), 0),
   };
 }
 
 /** Aggregate volume by muscle group across a set of workouts */
 export function aggregateMuscleVolume(
   workouts: Workout[]
 ): { muscleId: string; muscleName: string; volume: number; sets: number }[] {
   const volMap = new Map<string, number>();
   const setMap = new Map<string, number>();
 
   for (const workout of workouts) {
     for (const exLog of workout.exercises) {
       const exercise = getExercise(exLog.exerciseId);
       if (!exercise) continue;
       const vol = exerciseVolume(exLog);
       const sc = exLog.sets.length;
       for (const targetId of exercise.targets) {
         volMap.set(targetId, (volMap.get(targetId) || 0) + vol);
         setMap.set(targetId, (setMap.get(targetId) || 0) + sc);
       }
     }
   }
 
   return Array.from(volMap.entries()).map(([muscleId, volume]) => ({
     muscleId,
     muscleName: getMuscleTarget(muscleId)?.name || muscleId,
     volume,
     sets: setMap.get(muscleId) || 0,
   }));
 }

/** Estimate 1RM using Epley formula: weight × (1 + reps/30) */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/** Get 1RM progression per exercise across months */
export function get1RMProgression(
  workouts: Workout[]
): { exerciseId: string; exerciseName: string; monthly: { monthKey: string; label: string; estimated1RM: number; bestWeight: number; bestReps: number }[] }[] {
  // Group all sets by exercise
  const exerciseSets = new Map<string, { date: string; weight: number; reps: number }[]>();
  
  for (const workout of workouts) {
    for (const exLog of workout.exercises) {
      const exercise = getExercise(exLog.exerciseId);
      const name = exercise?.name || exLog.exerciseId;
      const key = name; // Use name as key for grouping
      const arr = exerciseSets.get(key) || [];
      for (const set of exLog.sets) {
        arr.push({ date: workout.date, weight: set.weight, reps: set.reps });
      }
      exerciseSets.set(key, arr);
    }
  }

  return Array.from(exerciseSets.entries()).map(([name, sets]) => {
    // Group by month
    const byMonth = new Map<string, { weight: number; reps: number }[]>();
    for (const s of sets) {
      const monthKey = s.date.slice(0, 7); // YYYY-MM
      const arr = byMonth.get(monthKey) || [];
      arr.push({ weight: s.weight, reps: s.reps });
      byMonth.set(monthKey, arr);
    }

    const monthly = Array.from(byMonth.entries())
      .map(([monthKey, monthSets]) => {
        // Find best estimated 1RM this month
        let best1RM = 0;
        let bestWeight = 0;
        let bestReps = 0;
        for (const s of monthSets) {
          const est = estimate1RM(s.weight, s.reps);
          if (est > best1RM) {
            best1RM = est;
            bestWeight = s.weight;
            bestReps = s.reps;
          }
        }
        const [y, m] = monthKey.split('-');
        const label = `${parseInt(m)}月`;
        return { monthKey, label, estimated1RM: best1RM, bestWeight, bestReps };
      })
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    return { exerciseId: '', exerciseName: name, monthly };
  }).filter((e) => e.monthly.length > 0)
   .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}


/** Get e1RM progression per exercise for workouts in a month */
export function getExercise1RMProgression(
  workouts: Workout[],
  date: Date
): {
  exerciseName: string;
  data: { date: string; e1rm: number; weight: number; reps: number }[];
}[] {
  const monthWorkouts = getWorkoutsInMonth(workouts, date);
  const exerciseMap = new Map<string, { date: string; e1rm: number; weight: number; reps: number }[]>();

  for (const workout of monthWorkouts) {
    for (const exLog of workout.exercises) {
      if (!exLog.isProgressiveOverload) continue;
      const exercise = getExercise(exLog.exerciseId);
      const name = exercise?.name || exLog.exerciseId;
      let bestE1RM = 0;
      let bestWeight = 0;
      let bestReps = 0;
      for (const set of exLog.sets) {
        const e1rm = estimate1RM(set.weight, set.reps);
        if (e1rm > bestE1RM) {
          bestE1RM = e1rm;
          bestWeight = set.weight;
          bestReps = set.reps;
        }
      }
      if (bestE1RM > 0) {
        const arr = exerciseMap.get(name) || [];
        arr.push({ date: workout.date, e1rm: bestE1RM, weight: bestWeight, reps: bestReps });
        exerciseMap.set(name, arr);
      }
    }
  }

  return Array.from(exerciseMap.entries())
    .map(([exerciseName, data]) => ({
      exerciseName,
      data: data.sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}

/** Aggregate progressive overload data grouped by muscle category */
export function getMuscleProgressData(
  workouts: Workout[],
  date: Date
): {
  category: string;
  muscleIds: string[];
  exerciseNames: string[];
  weekly: { weekStart: string; volume: number; e1rm: number; setCount: number }[];
}[] {
  const monthWorkouts = getWorkoutsInMonth(workouts, date);
  const catNames: Record<string, string> = {
    chest: '胸', shoulders: '肩', back: '背', legs: '腿', arms: '手臂', core: '核心', other: '其他'
  };

  // Collect all starred exercises with their muscle categories
  const exByCat = new Map<string, {
    exerciseNames: Set<string>;
    muscleIds: Set<string>;
    weekly: Map<string, { volume: number; e1rm: number; sets: number; count: number }>;
  }>();

  for (const workout of monthWorkouts) {
    const wDate = parseISO(workout.date);
    const weekStart = format(startOfWeek(wDate, { weekStartsOn: 1 }), 'MM/dd');

    for (const exLog of workout.exercises) {
      if (!exLog.isProgressiveOverload) continue;
      const exercise = getExercise(exLog.exerciseId);
      if (!exercise || exercise.targets.length === 0) continue;

      const firstTarget = getMuscleTarget(exercise.targets[0]);
      const cat = firstTarget?.category || 'other';
      const catLabel = catNames[cat] || cat;

      if (!exByCat.has(catLabel)) {
        exByCat.set(catLabel, { exerciseNames: new Set(), muscleIds: new Set(), weekly: new Map() });
      }
      const entry = exByCat.get(catLabel)!;
      entry.exerciseNames.add(exercise.name);
      exercise.targets.forEach(t => entry.muscleIds.add(t));

      const vol = exerciseVolume(exLog);
      let bestE1RM = 0;
      let setCount = exLog.sets.length;
      for (const s of exLog.sets) {
        const e = estimate1RM(s.weight, s.reps);
        if (e > bestE1RM) bestE1RM = e;
      }

      if (!entry.weekly.has(weekStart)) {
        entry.weekly.set(weekStart, { volume: 0, e1rm: 0, sets: 0, count: 0 });
      }
      const w = entry.weekly.get(weekStart)!;
      w.volume += vol;
      w.e1rm = Math.max(w.e1rm, bestE1RM);
      w.sets += setCount;
      w.count += 1;
    }
  }

  return Array.from(exByCat.entries())
    .map(([category, data]) => ({
      category,
      muscleIds: Array.from(data.muscleIds),
      exerciseNames: Array.from(data.exerciseNames),
      weekly: Array.from(data.weekly.entries())
        .map(([weekStart, stats]) => ({
          weekStart,
          volume: stats.volume,
          e1rm: stats.e1rm,
          setCount: stats.sets,
        }))
        .sort((a, b) => a.weekStart.localeCompare(b.weekStart)),
    }));
}

