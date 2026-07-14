 interface StatsCardProps {
   title: string;
   value: string | number;
   subtitle?: string;
   change?: { value: number; positive: boolean };
 }
 
 export default function StatsCard({ title, value, subtitle, change }: StatsCardProps) {
   return (
     <div className="h-full flex flex-col justify-center px-4">
       <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{title}</div>
       <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
         {value}
       </div>
       {subtitle && (
         <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{subtitle}</div>
       )}
       {change && (
         <div
           className={`text-xs mt-1 ${
             change.positive
               ? 'text-emerald-500'
               : 'text-red-500'
           }`}
         >
           {change.positive ? '+' : ''}
           {change.value}% 较上周
         </div>
       )}
     </div>
   );
 }
