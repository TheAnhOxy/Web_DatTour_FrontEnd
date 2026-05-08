import React from "react";

export const CompactPageHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  stats = [],
}) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
          ) : null}
        </div>

        {actionLabel ? (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center self-start rounded-lg border border-blue-100 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>

      {stats.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="font-medium uppercase tracking-[0.14em] text-slate-400">
                {stat.label}
              </span>
              <span className="font-semibold text-blue-700">{stat.value}</span>
              {stat.badge ? (
                <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  {stat.badge}
                </span>
              ) : null}
              {index < stats.length - 1 ? (
                <span className="text-slate-300">•</span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
