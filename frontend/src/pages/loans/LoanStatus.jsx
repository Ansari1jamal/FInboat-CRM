import { useState } from "react";

import Button from "../../components/common/Button";

import {
  LOAN_STATUS_FLOW,
} from "./loan.constants";

import {
  updateLoanStatusApi,
} from "../../services/loans.api";

const LoanStatus = ({ loan, onUpdated }) => {
  const [loading, setLoading] = useState(false);

  const nextStatuses =
    LOAN_STATUS_FLOW[loan?.status] || [];

  if (!nextStatuses.length) {
    return null;
  }

  const handleStatusChange = async (status) => {
    const confirmed = window.confirm(
      `Change loan status to ${status}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      await updateLoanStatusApi(
        loan.id,
        status
      );

      if (onUpdated) {
        await onUpdated();
      }
    } catch (error) {
      console.error(
        "Failed to update loan status:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to update loan status"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((status) => (
        <Button
          key={status}
          disabled={loading}
          onClick={() =>
            handleStatusChange(status)
          }
        >
          Mark {status}
        </Button>
      ))}
    </div>
  );
};

export default LoanStatus;