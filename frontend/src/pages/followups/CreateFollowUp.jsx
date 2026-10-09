import {
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarClock,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import {
  createFollowUpApi,
} from "../../services/followups.api";

const CreateFollowUp = () => {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const leadId =
    searchParams.get("leadId");

  const [form, setForm] =
    useState({
      followUpDate: "",
      notes: "",
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [errors, setErrors] =
    useState({});

  // ======================================
  // CHANGE
  // ======================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        [name]: "",
      })
    );

    setError("");
  };

  // ======================================
  // VALIDATE
  // ======================================

  const validate = () => {
    const nextErrors = {};

    if (!leadId) {
      nextErrors.leadId =
        "Lead is required.";
    }

    if (!form.followUpDate) {
      nextErrors.followUpDate =
        "Follow-up date and time is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        followUpDate:
          form.followUpDate,

        ...(form.notes.trim() && {
          notes:
            form.notes.trim(),
        }),
      };

      await createFollowUpApi(
        leadId,
        payload
      );

      navigate(
        `/followups?leadId=${leadId}`
      );
    } catch (err) {
      const data =
        err?.response?.data;

      if (
        Array.isArray(
          data?.errors
        )
      ) {
        const apiErrors = {};

        data.errors.forEach(
          (item) => {
            if (item.field) {
              apiErrors[
                item.field
              ] = item.message;
            }
          }
        );

        setErrors(apiErrors);
      }

      setError(
        data?.message ||
          "Unable to create follow-up."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <PageHeader
        title="Create Follow-up"
        description="Schedule the next customer follow-up."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              leadId
                ? navigate(
                    `/leads/${leadId}`
                  )
                : navigate(
                    "/followups"
                  )
            }
          >
            <ArrowLeft size={18} />
            Back
          </Button>
        }
      />

      {/* ================================= */}
      {/* ERROR */}
      {/* ================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ================================= */}
      {/* FORM */}
      {/* ================================= */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <Card
          title="Follow-up Details"
          description="Choose when the customer should be contacted again."
        >
          <div className="space-y-5">
            <Input
              label="Follow-up Date & Time"
              name="followUpDate"
              type="datetime-local"
              value={
                form.followUpDate
              }
              onChange={
                handleChange
              }
              error={
                errors.followUpDate
              }
              required
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notes
              </label>

              <textarea
                name="notes"
                rows={5}
                value={form.notes}
                onChange={
                  handleChange
                }
                placeholder="Enter follow-up notes..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </Card>

        {/* ================================= */}
        {/* ACTIONS */}
        {/* ================================= */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={() =>
              leadId
                ? navigate(
                    `/leads/${leadId}`
                  )
                : navigate(
                    "/followups"
                  )
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={saving}
          >
            <CalendarClock
              size={17}
            />
            Schedule Follow-up
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateFollowUp;