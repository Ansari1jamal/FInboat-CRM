import {
  Phone,
  CalendarPlus,
  FileText,
  Pencil,
} from "lucide-react";

import Button from "../../components/common/Button";

const LeadQuickActions = ({
  onCall,
  onFollowUp,
  onDocument,
  onEdit,
}) => {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="success"
          onClick={onCall}
        >
          <Phone size={17} />
          Call
        </Button>

        <Button
          variant="secondary"
          onClick={onFollowUp}
        >
          <CalendarPlus size={17} />
          Follow-up
        </Button>

        <Button
          variant="secondary"
          onClick={onDocument}
        >
          <FileText size={17} />
          Documents
        </Button>

        <Button
          variant="secondary"
          onClick={onEdit}
        >
          <Pencil size={17} />
          Edit
        </Button>
      </div>
    </div>
  );
};

export default LeadQuickActions;