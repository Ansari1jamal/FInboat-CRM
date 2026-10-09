import {
  CheckCircle,
  ClipboardList,
  Clock3,
  FileText,
  Landmark,
  Phone,
  RefreshCw,
  Upload,
  User,
  UserPlus,
  XCircle,
} from "lucide-react";

import { TIMELINE_EVENT_TYPES } from "../../pages/leads/timeline.constants";
import {
  formatTimelineDate,
  formatTimelineMetadataValue,
  getTimelineActor,
  getTimelineDescription,
  getTimelineTitle,
} from "../../pages/leads/timeline.utils";

const EVENT_ICONS = {
  [TIMELINE_EVENT_TYPES.LEAD_CREATED]: User,
  [TIMELINE_EVENT_TYPES.STATUS_CHANGE]: RefreshCw,
  [TIMELINE_EVENT_TYPES.CALL]: Phone,
  [TIMELINE_EVENT_TYPES.FOLLOW_UP]: Clock3,
  [TIMELINE_EVENT_TYPES.TRANSFER]: UserPlus,
  [TIMELINE_EVENT_TYPES.DOCUMENT_UPLOADED]: Upload,
  [TIMELINE_EVENT_TYPES.DOCUMENT_VERIFIED]: CheckCircle,
  [TIMELINE_EVENT_TYPES.DOCUMENT_REJECTED]: XCircle,
  [TIMELINE_EVENT_TYPES.DOCUMENT_STATUS]: FileText,
  [TIMELINE_EVENT_TYPES.APPLICATION_CREATED]: ClipboardList,
  [TIMELINE_EVENT_TYPES.APPLICATION_STATUS]: ClipboardList,
  [TIMELINE_EVENT_TYPES.LOAN_DISBURSED]: Landmark,
};

const formatMetadataKey = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());

const TimelineItem = ({ event }) => {
  const Icon = EVENT_ICONS[event.type] || Clock3;
  const metadata = Object.entries(event.metadata || {}).filter(
    ([, value]) => value !== null && value !== undefined && value !== ""
  );

  return (
    <article className="relative flex gap-4">
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
        <Icon size={18} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 pb-7">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900">
                {getTimelineTitle(event)}
              </h3>
              <p className="mt-1 break-words text-sm text-slate-600">
                {getTimelineDescription(event)}
              </p>
            </div>

            <time
              dateTime={event.createdAt || undefined}
              className="shrink-0 text-xs text-slate-400"
            >
              {formatTimelineDate(event.createdAt)}
            </time>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <User size={14} aria-hidden="true" />
            <span>{getTimelineActor(event)}</span>
          </div>

          {metadata.length > 0 && (
            <dl className="mt-3 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
              {metadata.map(([key, value]) => (
                <div key={key} className="min-w-0">
                  <dt className="text-xs text-slate-400">
                    {formatMetadataKey(key)}
                  </dt>
                  <dd className="break-words text-sm font-medium text-slate-700">
                    {formatTimelineMetadataValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </article>
  );
};

export default TimelineItem;
