import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Workout,
  ExerciseLog,
  WorkoutSet,
  DashboardWidget,
  ExerciseDefinition,
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { formatISO } from 'date-fns';

interface FitnessState {
  workouts: Workout[];
  customExercises: ExerciseDefinition[];
  dashboardWidgets: DashboardWidget[];
  currentWorkout: Workout | null;
  editingWorkoutId: string | null;

  startNewWorkout: () => void;
  setCurrentWorkoutDate: (date: string) => void;
  setCurrentWorkoutNotes: (notes: string) => void;
  addExerciseToCurrentWorkout: (exerciseId: string) => void;
  removeExerciseFromCurrentWorkout: (exerciseLogId: string) => void;
  copySet: (exerciseLogId: string, setId: string) => void;
  addSetToExercise: (exerciseLogId: string) => void;
  updateSet: (exerciseLogId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  removeSet: (exerciseLogId: string, setId: string) => void;
  toggleExerciseProgressiveOverload: (exerciseLogId: string) => void;
  saveCurrentWorkout: () => void;
  editWorkout: (workoutId: string) => void;
  deleteWorkout: (workoutId: string) => void;
  duplicateWorkout: (workoutId: string) => void;
  addDashboardWidget: (type: DashboardWidget['type']) => void;
  removeDashboardWidget: (widgetId: string) => void;
  updateWidgetVisualization: (widgetId: string, visualization: DashboardWidget['visualization']) => void;
  updateWidgetType: (widgetId: string, type: DashboardWidget['type']) => void;
  changeWidgetType: (widgetId: string, newType: DashboardWidget['type']) => void;
  addCustomExercise: (exercise: ExerciseDefinition) => void;
}

function createEmptyWorkout(): Workout {
  const now = new Date();
  return {
    id: uuidv4(),
    date: formatISO(now, { representation: 'date' }),
    notes: '',
    exercises: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

function createDefaultWidgets(): DashboardWidget[] {
  return [
    { id: uuidv4(), type: 'weeklySummary', visualization: 'card', title: '本周概览' },
    { id: uuidv4(), type: 'weeklyVolume', visualization: 'bar', title: '每周容量' },
    { id: uuidv4(), type: 'muscleVolume', visualization: 'bar', title: '部位容量' },
  ];
}
export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      workouts: [],
      customExercises: [],
      dashboardWidgets: createDefaultWidgets(),
      currentWorkout: null,
      editingWorkoutId: null,

      startNewWorkout: () => {
        set({ currentWorkout: createEmptyWorkout(), editingWorkoutId: null });
      },

      setCurrentWorkoutDate: (date) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        set({ currentWorkout: { ...currentWorkout, date } });
      },

      setCurrentWorkoutNotes: (notes) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        set({ currentWorkout: { ...currentWorkout, notes } });
      },

      addExerciseToCurrentWorkout: (exerciseId) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        const newExercise: ExerciseLog = {
          id: uuidv4(),
          exerciseId,
          isProgressiveOverload: false,
          sets: [{ id: uuidv4(), setNumber: 1, reps: 10, weight: 20, restTime: 90 }], 
        };
        set({ currentWorkout: { ...currentWorkout, exercises: [...currentWorkout.exercises, newExercise] } });
      },

      removeExerciseFromCurrentWorkout: (exerciseLogId) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        set({ currentWorkout: { ...currentWorkout, exercises: currentWorkout.exercises.filter((e) => e.id !== exerciseLogId) } });
      },

      copySet: (exerciseLogId, setId) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map((e) => {
              if (e.id !== exerciseLogId) return e;
              const idx = e.sets.findIndex((s) => s.id === setId);
              if (idx === -1) return e;
              const source = e.sets[idx];
              const newSet: WorkoutSet = {
                id: uuidv4(),
                setNumber: idx + 2,
                reps: source.reps,
                weight: source.weight,
                restTime: source.restTime,
              };
              const newSets = [...e.sets];
              newSets.splice(idx + 1, 0, newSet);
              // Re-number sets
              return { ...e, sets: newSets.map((s, i) => ({ ...s, setNumber: i + 1 })) };
            }),
          },
        });
      },

      addSetToExercise: (exerciseLogId) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map((e) => {
              if (e.id !== exerciseLogId) return e;
              const lastSet = e.sets[e.sets.length - 1];
              const newSet: WorkoutSet = {
                id: uuidv4(),
                setNumber: e.sets.length + 1,
                reps: lastSet?.reps || 10,
                weight: lastSet?.weight || 20,
                restTime: lastSet?.restTime || 90,
                
              };
              return { ...e, sets: [...e.sets, newSet] };
            }),
          },
        });
      },

      updateSet: (exerciseLogId, setId, updates) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map((e) => {
              if (e.id !== exerciseLogId) return e;
              return { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)) };
            }),
          },
        });
      },

      removeSet: (exerciseLogId, setId) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map((e) => {
              if (e.id !== exerciseLogId) return e;
              const newSets = e.sets.filter((s) => s.id !== setId).map((s, i) => ({ ...s, setNumber: i + 1 }));
              return { ...e, sets: newSets };
            }),
          },
        });
      },

      toggleExerciseProgressiveOverload: (exerciseLogId) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map((e) =>
              e.id === exerciseLogId ? { ...e, isProgressiveOverload: !e.isProgressiveOverload } : e
            ),
          },
        });
      },

      saveCurrentWorkout: () => {
        const { currentWorkout, workouts } = get();
        if (!currentWorkout || currentWorkout.exercises.length === 0) return;
        const saved: Workout = { ...currentWorkout, updatedAt: new Date().toISOString() };
        const existingIdx = workouts.findIndex((w) => w.id === saved.id);
        const newWorkouts = existingIdx >= 0
          ? workouts.map((w) => (w.id === saved.id ? saved : w))
          : [saved, ...workouts];
        set({ workouts: newWorkouts, currentWorkout: null, editingWorkoutId: null });
      },

      editWorkout: (workoutId) => {
        const { workouts } = get();
        const workout = workouts.find((w) => w.id === workoutId);
        if (workout) set({ currentWorkout: { ...workout }, editingWorkoutId: workoutId });
      },

      deleteWorkout: (workoutId) => {
        const { workouts } = get();
        set({ workouts: workouts.filter((w) => w.id !== workoutId) });
      },

      duplicateWorkout: (workoutId) => {
        const { workouts } = get();
        const source = workouts.find((w) => w.id === workoutId);
        if (!source) return;
        const newWorkout: Workout = {
          id: uuidv4(),
          date: formatISO(new Date(), { representation: 'date' }),
          notes: source.notes,
          exercises: source.exercises.map((ex) => ({
            ...ex,
            id: uuidv4(),
            sets: ex.sets.map((s) => ({ ...s, id: uuidv4() })),
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ currentWorkout: newWorkout, editingWorkoutId: null });
      },

      addDashboardWidget: (type) => {
        const { dashboardWidgets } = get();
        const newWidget: DashboardWidget = { id: uuidv4(), type, visualization: 'card', title: type };
        set({ dashboardWidgets: [...dashboardWidgets, newWidget] });
      },

      removeDashboardWidget: (widgetId) => {
        const { dashboardWidgets } = get();
        set({ dashboardWidgets: dashboardWidgets.filter((w) => w.id !== widgetId) });
      },

      updateWidgetVisualization: (widgetId, visualization) => {
        const { dashboardWidgets } = get();
        set({ dashboardWidgets: dashboardWidgets.map((w) => (w.id === widgetId ? { ...w, visualization } : w)) });
      },
      updateWidgetType: (widgetId, type) => {
        const { dashboardWidgets } = get();
        set({ dashboardWidgets: dashboardWidgets.map((w) => (w.id === widgetId ? { ...w, type } : w)) });
      },

      changeWidgetType: (widgetId, newType) => {
        const { dashboardWidgets } = get();
        set({ dashboardWidgets: dashboardWidgets.map((w) => (w.id === widgetId ? { ...w, type: newType } : w)) });
      },

      addCustomExercise: (exercise) => {
        const { customExercises } = get();
        set({ customExercises: [...customExercises, exercise] });
      },
    }),
    {
    name: 'fitness-dashboard-storage',
    version: 1,
    partialize: (state: FitnessState) => ({
      workouts: state.workouts,
      dashboardWidgets: state.dashboardWidgets,
      customExercises: state.customExercises,
    }),
    migrate: (persistedState: any, version: number) => {
      let state = { ...persistedState };
      // Migration from no version / v0 to v1 (version is 0 when unversioned)
      if (!version || version < 1) {
        // Remove widgetLayouts if present (removed from interface)
        delete state.widgetLayouts;
        // Migrate isProgressiveOverload from set-level to exercise-level
        if (state.workouts) {
          state.workouts = state.workouts.map((w: any) => ({
            ...w,
            exercises: w.exercises.map((e: any) => ({
              ...e,
              isProgressiveOverload: e.isProgressiveOverload || e.sets?.some((s: any) => s.isProgressiveOverload) || false,
              sets: e.sets?.map((s: any) => {
                const { isProgressiveOverload, ...cleanSet } = s;
                return cleanSet;
              }),
            })),
          }));
        }
      }
      // Remove any stale currentWorkout persisted state
      delete state.currentWorkout;
      delete state.editingWorkoutId;
      return state as any;
    },
  }
  )
);
