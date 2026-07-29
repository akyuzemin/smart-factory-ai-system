import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const iconMap = {
  start: <ClockIcon className="h-5 w-5 text-cyan-400" />,
  detect: <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />,
  calculate: <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />,
  notify: <CheckCircleIcon className="h-5 w-5 text-slate-300" />,
};

function Timeline({ data }) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {data.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== data.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-700" aria-hidden="true" />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 ring-4 ring-slate-900">
                    {iconMap[event.type] || <ClockIcon className="h-5 w-5 text-slate-400" />}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <p className="font-semibold text-white">{event.text}</p>
                  <p className="mt-1 text-sm text-slate-400">{event.time}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Timeline;