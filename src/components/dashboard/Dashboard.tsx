import { useState, useMemo } from 'react';
import { useFitnessStore } from '../../store/store';
import WidgetRenderer, { vizOptions } from './WidgetRenderer';
import { Plus, X, ChartBar } from '@phosphor-icons/react';
import { DashboardWidget, WidgetType } from '../../types';

const widgetTypeLabels: Record<WidgetType, string> = {
  weeklySummary: '本周概览',
  weeklyVolume: '每周容量',
  muscleVolume: '部位容量',
  progressiveOverload: '渐进超负荷',
  muscleProgress: '部位渐进超负荷',
};

const widgetSize: Record<string, { cols: number; height: number; label: string }> = {
  weeklySummary: { cols: 1, height: 150, label: '小' },
  weeklyVolume: { cols: 1, height: 220, label: '中' },
  muscleVolume: { cols: 1, height: 220, label: '中' },
  progressiveOverload: { cols: 2, height: 260, label: '大' },
  muscleProgress: { cols: 1, height: 220, label: '中' },
};

export default function Dashboard() {
  const { workouts, dashboardWidgets, addDashboardWidget, removeDashboardWidget, updateWidgetVisualization } =
    useFitnessStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const availableTypes: WidgetType[] = [
    'weeklySummary',
    'weeklyVolume',
    'muscleVolume',
    'progressiveOverload',
    'muscleProgress',
  ];

  // Guard: if no widgets, show empty state
  if (dashboardWidgets.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">训练看板</h2>
        </div>
        <div className="text-center py-24 text-zinc-400 dark:text-zinc-600">
          <ChartBar size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">暂无看板组件</p>
          <p className="text-xs mt-1">点击右上角添加看板组件</p>
          <button
            onClick={() => {
              if (availableTypes.length > 0) {
                addDashboardWidget(availableTypes[0]);
              }
            }}
            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors mx-auto"
          >
            <Plus size={16} weight="bold" />
            添加本周概览
          </button>
        </div>
      </div>
    );
  }

  // Find specific widgets
  const summaryW = dashboardWidgets.find((w) => w.type === 'weeklySummary');
  const volumeW = dashboardWidgets.find((w) => w.type === 'weeklyVolume');
  const muscleW = dashboardWidgets.find((w) => w.type === 'muscleVolume');
  const progressW = dashboardWidgets.find((w) => w.type === 'progressiveOverload');
  const muscleProgressW = dashboardWidgets.find((w) => w.type === 'muscleProgress');

  // Other widgets (custom / extra)
  const otherWidgets = dashboardWidgets.filter(
    (w) => !['weeklySummary', 'weeklyVolume', 'muscleVolume', 'progressiveOverload', 'muscleProgress'].includes(w.type)
  );

  return (
    <div>
      {/* Dashboard header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">训练看板</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            看板组件支持切换可视化方式
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Plus size={16} weight="bold" />
            添加看板
          </button>

          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                {availableTypes
                  .filter((t) => !dashboardWidgets.find((w) => w.type === t))
                  .map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        addDashboardWidget(type);
                        setShowAddMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {widgetTypeLabels[type]}
                    </button>
                  ))}
                {availableTypes.filter((t) => !dashboardWidgets.find((w) => w.type === t)).length === 0 && (
                  <div className="px-4 py-3 text-xs text-zinc-400 dark:text-zinc-600 text-center">已添加所有可用看板</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Primary 3-column grid */}
      <div className="space-y-5">
        {/* Row 1: summary, volume, muscle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {summaryW && <WidgetCard widget={summaryW} size={widgetSize[summaryW.type]} onRemove={() => removeDashboardWidget(summaryW.id)} onVizChange={(v) => updateWidgetVisualization(summaryW.id, v)} />}
          {volumeW && <WidgetCard widget={volumeW} size={widgetSize[volumeW.type]} onRemove={() => removeDashboardWidget(volumeW.id)} onVizChange={(v) => updateWidgetVisualization(volumeW.id, v)} />}
          {muscleW && <WidgetCard widget={muscleW} size={widgetSize[muscleW.type]} onRemove={() => removeDashboardWidget(muscleW.id)} onVizChange={(v) => updateWidgetVisualization(muscleW.id, v)} />}
        </div>

        {/* Row 2: progressive overload (large, 2 cols) + muscle progress (medium) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            {progressW && <WidgetCard widget={progressW} size={widgetSize[progressW.type]} onRemove={() => removeDashboardWidget(progressW.id)} onVizChange={(v) => updateWidgetVisualization(progressW.id, v)} />}
          </div>
          {muscleProgressW && <WidgetCard widget={muscleProgressW} size={widgetSize[muscleProgressW.type]} onRemove={() => removeDashboardWidget(muscleProgressW.id)} onVizChange={(v) => updateWidgetVisualization(muscleProgressW.id, v)} />}
        </div>

        {/* Extra widgets */}
        {otherWidgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherWidgets.map((w) => (
              <WidgetCard key={w.id} widget={w} onRemove={() => removeDashboardWidget(w.id)} onVizChange={(v) => updateWidgetVisualization(w.id, v)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual widget card
function WidgetCard({
  widget,
  size,
  onRemove,
  onVizChange,
}: {
  widget: DashboardWidget;
  size: { cols: number; height: number };
  onRemove: () => void;
  onVizChange: (viz: DashboardWidget['visualization']) => void;
}) {
  const [showVizMenu, setShowVizMenu] = useState(false);
  const workouts = useFitnessStore((s) => s.workouts);

  const currentViz = vizOptions.find((v) => v.value === widget.visualization);
  const VizIcon = currentViz?.icon || ChartBar;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      {/* Widget header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {widgetTypeLabels[widget.type] || widget.title}
        </span>
        <div className="flex items-center gap-0.5">
          {/* Visualization selector */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVizMenu(!showVizMenu);
              }}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="切换可视化方式"
            >
              <VizIcon size={15} />
            </button>
            {showVizMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowVizMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 min-w-[130px]">
                  {vizOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          onVizChange(opt.value);
                          setShowVizMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                          widget.visualization === opt.value
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Icon size={14} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Remove */}
          <button
            onClick={onRemove}
            className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="移除此看板"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Widget content */}
      <div style={{ height: size.height }}>
        <WidgetRenderer widget={widget} workouts={workouts} />
      </div>
    </div>
  );
}
