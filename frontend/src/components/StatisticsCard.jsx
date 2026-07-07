/**
 * Reusable statistics display card.
 *
 * Props:
 *   title       {string}       – card label
 *   value       {string|number}– primary metric
 *   subtitle    {string}       – optional secondary text below value
 *   icon        {ReactNode}    – icon element rendered in the coloured circle
 *   color       {string}       – tailwind color key: 'blue' | 'green' | 'purple' | 'amber' | 'rose'
 *   loading     {boolean}      – show skeleton state
 */
const COLOR_MAP = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-600',   ring: 'ring-blue-200'   },
  green:  { bg: 'bg-green-100',  text: 'text-green-600',  ring: 'ring-green-200'  },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-200' },
  amber:  { bg: 'bg-amber-100',  text: 'text-amber-600',  ring: 'ring-amber-200'  },
  rose:   { bg: 'bg-rose-100',   text: 'text-rose-600',   ring: 'ring-rose-200'   },
};

function StatisticsCard({ title, value, subtitle, icon, color = 'blue', loading = false }) {
  const colors = COLOR_MAP[color] ?? COLOR_MAP.blue;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full ${colors.bg}`} />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.bg} ring-4 ${colors.ring} flex items-center justify-center`}>
            <span className={colors.text}>{icon}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            {value ?? '—'}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatisticsCard;
