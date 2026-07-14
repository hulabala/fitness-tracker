 import { Barbell, ChartBar, ClockCounterClockwise, Calendar, Sun, Moon, Plus } from '@phosphor-icons/react';
 
 type Tab = 'dashboard' | 'workout' | 'history' | 'monthly';
 
 interface HeaderProps {
   activeTab: Tab;
   onTabChange: (tab: Tab) => void;
   darkMode: boolean;
   onDarkModeToggle: () => void;
   hasPendingWorkout: boolean;
 }
 
 const tabs: { id: Tab; label: string; icon: typeof Barbell }[] = [
   { id: 'dashboard', label: '看板', icon: ChartBar },
   { id: 'workout', label: '训练记录', icon: Barbell },
   { id: 'history', label: '历史', icon: ClockCounterClockwise },
  { id: 'monthly', label: '月总结', icon: Calendar },
 ];
 
 export default function Header({
   activeTab,
   onTabChange,
   darkMode,
   onDarkModeToggle,
   hasPendingWorkout,
 }: HeaderProps) {
   return (
     <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
       <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Barbell size={20} weight="fill" className="text-amber-500" />
           <span className="font-semibold text-sm tracking-tight">Fitness Pro</span>
         </div>
 
         <nav className="flex items-center gap-1">
           {tabs.map((tab) => {
             const Icon = tab.icon;
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => onTabChange(tab.id)}
                 className={`
                   relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                   ${isActive
                     ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                     : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                   }
                 `}
               >
                 <Icon size={16} weight={isActive ? 'fill' : 'regular'} />
                 <span>{tab.label}</span>
                 {hasPendingWorkout && tab.id === 'workout' && (
                   <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                 )}
               </button>
             );
           })}
         </nav>
 
         <button
           onClick={onDarkModeToggle}
           className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
           title={darkMode ? '切换到亮色模式' : '切换到暗色模式'}
         >
           {darkMode ? <Sun size={18} /> : <Moon size={18} />}
         </button>
       </div>
     </header>
   );
 }
