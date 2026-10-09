import {
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  PhoneCall,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

import {
  createCallApi,
} from "../../services/calls.api";

import {
  CALL_STATUS_OPTIONS,
} from "./call.constants";

const LogCall = () => {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const leadId =
    searchParams.get("leadId");

  const [form, setForm] =
    useState({
      callStatus: "",
      duration: "",
      notes: "",
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [errors, setErrors] =
    useState({});

  // ======================================
  // HANDLE CHANGE
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
        "Lead is required";
    }

    if (!form.callStatus) {
      nextErrors.callStatus =
        "Call status is required";
    }

    if (
      form.duration &&
      Number(form.duration) < 0
    ) {
      nextErrors.duration =
        "Duration cannot be negative";
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
        callStatus:
          form.callStatus,

        ...(form.notes.trim() && {
          remarks:
            form.notes.trim(),
        }),
      };

      await createCallApi(
        leadId,
        payload
      );

      navigate(
        `/calls?leadId=${leadId}`
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
          "Unable to log call."
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
        title="Log Call"
        description="Record a customer call against this lead."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              leadId
                ? navigate(
                    `/leads/${leadId}`
                  )
                : navigate(
                    "/calls"
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
          title="Call Details"
          description="Record the outcome of the customer call."
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <PhoneCall size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Call Information
              </p>

              <p className="text-xs text-slate-500">
                Status, duration and notes
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* STATUS */}

            <Select
              label="Call Status"
              name="callStatus"
              value={
                form.callStatus
              }
              onChange={
                handleChange
              }
              error={
                errors.callStatus
              }
              required
              options={[
                {
                  value: "",
                  label:
                    "Select call status",
                },
                ...CALL_STATUS_OPTIONS,
              ]}
            />

            {/* DURATION */}

            <Input
              label="Duration (seconds)"
              name="duration"
              type="number"
              min="0"
              value={
                form.duration
              }
              onChange={
                handleChange
              }
              error={
                errors.duration
              }
              placeholder="Example: 180"
            />

            {/* NOTES */}

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
                placeholder="Enter call notes..."
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
            onClick={() =>
              leadId
                ? navigate(
                    `/leads/${leadId}`
                  )
                : navigate(
                    "/calls"
                  )
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={saving}
          >
            <PhoneCall size={17} />
            Log Call
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LogCall;