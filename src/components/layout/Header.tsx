 import { useState, useRef } from 'react';
import { Barbell, ChartBar, ClockCounterClockwise, Calendar, Sun, Moon, Plus, DownloadSimple, UploadSimple } from '@phosphor-icons/react';
 
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
 
 function DataMenu() {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const raw = localStorage.getItem('fitness-dashboard-storage');
    if (!raw) { alert('没有数据可导出'); return; }
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-data-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = JSON.parse(text);
        if (!data.state || !data.state.workouts) {
          alert('无效的数据文件');
          return;
        }
        localStorage.setItem('fitness-dashboard-storage', text);
        alert('导入成功！页面即将刷新');
        window.location.reload();
      } catch {
        alert('文件解析失败，请确认是导出的 JSON 文件');
      }
    };
    reader.readAsText(file);
    setOpen(false);
    e.target.value = '';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs"
        title="导出/导入数据"
      >
        <DownloadSimple size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden min-w-[140px]">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <DownloadSimple size={16} />
              导出数据
            </button>
            <button
              onClick={() => { fileRef.current?.click(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <UploadSimple size={16} />
              导入数据
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </>
      )}
    </div>
  );
}

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
