 interface Column {
   key: string;
   label: string;
   align?: 'left' | 'right' | 'center';
 }
 
 interface SimpleTableProps {
   columns: Column[];
   data: Record<string, string | number>[];
   highlightKey?: string;
 }
 
 export default function SimpleTable({ columns, data, highlightKey }: SimpleTableProps) {
   if (data.length === 0) {
     return (
       <div className="flex items-center justify-center h-full text-xs text-zinc-400 dark:text-zinc-600">
         暂无数据
       </div>
     );
   }
 
   return (
     <div className="overflow-x-auto h-full">
       <table className="w-full text-xs">
         <thead>
           <tr className="border-b border-zinc-200 dark:border-zinc-700">
             {columns.map((col) => (
               <th
                 key={col.key}
                 className={`px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400 ${
                   col.align === 'right'
                     ? 'text-right'
                     : col.align === 'center'
                     ? 'text-center'
                     : 'text-left'
                 }`}
               >
                 {col.label}
               </th>
             ))}
           </tr>
         </thead>
         <tbody>
           {data.map((row, i) => (
             <tr
               key={i}
               className={`border-b border-zinc-100 dark:border-zinc-800 ${
                 highlightKey && row[highlightKey]
                   ? 'bg-amber-50/50 dark:bg-amber-900/10'
                   : ''
               }`}
             >
               {columns.map((col) => (
                 <td
                   key={col.key}
                   className={`px-3 py-2 ${
                     col.align === 'right'
                       ? 'text-right'
                       : col.align === 'center'
                       ? 'text-center'
                       : 'text-left'
                   }`}
                 >
                   {typeof row[col.key] === 'number'
                     ? (row[col.key] as number).toLocaleString()
                     : row[col.key]}
                 </td>
               ))}
             </tr>
           ))}
         </tbody>
       </table>
     </div>
   );
 }
