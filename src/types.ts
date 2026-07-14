 export interface MuscleTarget {
   id: string;
   name: string;
   category: 'chest' | 'shoulders' | 'back' | 'arms' | 'legs' | 'core' | 'other';
 }
 
 export interface ExerciseDefinition {
   id: string;
   name: string;
   targets: string[]; // IDs of MuscleTarget
 }
 
 export interface WorkoutSet {
   id: string;
   setNumber: number;
   reps: number;
   weight: number;
   restTime: number;
 }
 
 export interface ExerciseLog {
   id: string;
   exerciseId: string;
   sets: WorkoutSet[];
   isProgressiveOverload: boolean;
 }
 
 export interface Workout {
   id: string;
   date: string; // YYYY-MM-DD
   notes: string;
   exercises: ExerciseLog[];
   createdAt: string;
   updatedAt: string;
 }
 
 export interface DashboardWidget {
   id: string;
   type: WidgetType;
   visualization: VisualizationType;
   title: string;
 }
 
 export type WidgetType =
   | 'weeklyVolume'
   | 'muscleVolume'
   | 'progressiveOverload'
   | 'weeklySummary'
   | 'monthlyStats';
 
 export type VisualizationType = 'bar' | 'line' | 'card' | 'table';
 
