 import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   Legend,
 } from 'recharts';
 
 interface Series {
   dataKey: string;
   name: string;
   color: string;
 }
 
 interface SimpleLineChartProps {
   data: Record<string, string | number>[];
   series: Series[];
   xKey?: string;
   unit?: string;
 }
 
 export default function SimpleLineChart({
   data,
   series,
   xKey = 'label',
   unit = '',
 }: SimpleLineChartProps) {
   if (data.length === 0) {
     return (
       <div className="flex items-center justify-center h-full text-xs text-zinc-400 dark:text-zinc-600">
         暂无数据
       </div>
     );
   }
 
   return (
     <ResponsiveContainer width="100%" height="100%">
       <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 4 }}>
         <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
         <XAxis
           dataKey={xKey}
           tick={{ fontSize: 11, fill: 'currentColor' }}
           tickLine={false}
           axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
         />
         <YAxis
           tick={{ fontSize: 10, fill: 'currentColor' }}
           tickLine={false}
           axisLine={false}
         />
         <Tooltip
           contentStyle={{
             fontSize: 12,
             borderRadius: 8,
             border: '1px solid rgba(0,0,0,0.08)',
           }}
           formatter={(value: number) => [
             `${value.toLocaleString()}${unit}`,
           ]}
         />
         <Legend
           wrapperStyle={{ fontSize: 11 }}
           iconType="circle"
           iconSize={8}
         />
         {series.map((s) => (
           <Line
             key={s.dataKey}
             type="monotone"
             dataKey={s.dataKey}
             name={s.name}
             stroke={s.color}
             strokeWidth={2}
             connectNulls={true}
             dot={{ r: 3, strokeWidth: 1 }}
             activeDot={{ r: 4, strokeWidth: 1 }}
           />
         ))}
       </LineChart>
     </ResponsiveContainer>
   );
 }
