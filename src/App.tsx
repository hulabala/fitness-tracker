 import { useState, useEffect, useCallback } from 'react';
 import { useFitnessStore } from './store/store';
 import Header from './components/layout/Header';
 import Dashboard from './components/dashboard/Dashboard';
 import WorkoutLogger from './components/workout/WorkoutLogger';
 import HistoryPanel from './components/history/HistoryPanel';
 import MonthlyStatsPage from './components/stats/MonthlyStatsPage';
 
 type Tab = 'dashboard' | 'workout' | 'history' | 'monthly';
 
 export default function App() {
   const [activeTab, setActiveTab] = useState<Tab>('dashboard');
   const [darkMode, setDarkMode] = useState(() => {
     if (typeof window !== 'undefined') {
       return window.matchMedia('(prefers-color-scheme: dark)').matches;
     }
     return false;
   });
   const currentWorkout = useFitnessStore((s) => s.currentWorkout);
   const duplicateWorkout = useFitnessStore((s) => s.duplicateWorkout);
 
   useEffect(() => {
     document.documentElement.classList.toggle('dark', darkMode);
   }, [darkMode]);
 
   // If there's a current workout in progress, show the workout tab indicator
   const hasPendingWorkout = currentWorkout && currentWorkout.exercises.length > 0;
 
   const handleCopyWorkout = useCallback((id: string) => {
     duplicateWorkout(id);
     setActiveTab('workout');
   }, [duplicateWorkout]);
 
   return (
     <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
       <Header
         activeTab={activeTab}
         onTabChange={setActiveTab}
         darkMode={darkMode}
         onDarkModeToggle={() => setDarkMode((d) => !d)}
         hasPendingWorkout={!!hasPendingWorkout}
       />
       <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
         {activeTab === 'dashboard' && <Dashboard />}
         {activeTab === 'workout' && <WorkoutLogger onSave={() => setActiveTab('dashboard')} />}
         {activeTab === 'history' && (
           <HistoryPanel
             onEdit={(id) => { setActiveTab('workout'); }}
             onCopy={handleCopyWorkout}
           />
         )}
         {activeTab === 'monthly' && <MonthlyStatsPage />}
       </main>
     </div>
   );
 }
