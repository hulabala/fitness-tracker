 import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   Cell,
 } from 'recharts';
 
 interface SimpleBarChartProps {
   data: { label: string; value: number; [key: string]: string | number }[];
   dataKey?: string;
   color?: string;
   unit?: string;
   formatter?: (value: number) => string;
   barColors?: string[];
 }
 
 export default function SimpleBarChart({
   data,
   dataKey = 'value',
   color = '#f59e0b',
   unit = '',
   formatter,
   barColors,
 }: SimpleBarChartProps) {
   if (data.length === 0) {
     return (
       <div className="flex items-center justify-center h-full text-xs text-zinc-400 dark:text-zinc-600">
         暂无数据
       </div>
     );
   }
 
   return (
     <ResponsiveContainer width="100%" height="100%">
       <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 4 }}>
         <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
         <XAxis
           dataKey="label"
           tick={{ fontSize: 11, fill: 'currentColor' }}
           tickLine={false}
           axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
         />
         <YAxis
           tick={{ fontSize: 10, fill: 'currentColor' }}
           tickLine={false}
           axisLine={false}
           tickFormatter={formatter}
         />
         <Tooltip
           contentStyle={{
             fontSize: 12,
             borderRadius: 8,
             border: '1px solid rgba(0,0,0,0.08)',
             boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
           }}
           formatter={(value: number) => [
             `${formatter ? formatter(value) : value.toLocaleString()}${unit}`,
           ]}
         />
         <Bar
           dataKey={dataKey}
           radius={[4, 4, 0, 0]}
           maxBarSize={40}
         >
           {barColors ? (
             data.map((_, index) => (
               <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
             ))
           ) : (
             data.map((_, index) => (
               <Cell key={`cell-${index}`} fill={color} />
             ))
           )}
         </Bar>
       </BarChart>
     </ResponsiveContainer>
   );
 }
