import TimelineItem from "./TimelineItem";

const Timeline = ({ events = [] }) => {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-medium text-slate-700">No activity yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Lead activities will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-7 left-5 top-0 w-px bg-slate-200" />
      <div>
        {events.map((event, index) => (
          <TimelineItem
            key={event.id || `${event.type}-${event.createdAt}-${index}`}
            event={event}
          />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
