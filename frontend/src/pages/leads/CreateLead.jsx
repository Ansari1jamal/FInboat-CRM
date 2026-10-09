import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  User,
  IndianRupee,
  Users,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Card from "../../components/common/Card";

import {
  createLeadApi,
} from "../../services/lead.api";
import { getUsersApi } from "../../services/users.api";
import { getTeamsApi } from "../../services/teams.api";

const initialForm = {
  customerName: "",
  mobile: "",
  loanType: "",
  loanAmount: "",
  source: "",
  assignedToId: "",
  assignedTeamId: "",
};

const CreateLead = () => {
  const navigate = useNavigate();

  const [form, setForm] =
    useState(initialForm);

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const [duplicateLead, setDuplicateLead] =
    useState(null);

  const [users, setUsers] =
    useState([]);

  const [teams, setTeams] =
    useState([]);

  useEffect(() => {
    const loadAssignmentOptions = async () => {
      try {
        const [usersResponse, teamsResponse] =
          await Promise.all([
            getUsersApi({
              role: "TELECALLER",
              isActive: true,
            }),
            getTeamsApi(),
          ]);

        setUsers(
          Array.isArray(usersResponse?.data)
            ? usersResponse.data
            : []
        );
        setTeams(
          Array.isArray(teamsResponse?.data)
            ? teamsResponse.data
            : []
        );
      } catch {
        setUsers([]);
        setTeams([]);
      }
    };

    loadAssignmentOptions();
  }, []);

  const availableUsers = useMemo(() => {
    if (!form.assignedTeamId) {
      return users;
    }

    const selectedTeam = teams.find(
      (team) => team.id === form.assignedTeamId
    );

    if (!selectedTeam) {
      return [];
    }

    return users.filter(
      (user) =>
        user.tlId === selectedTeam.tlId ||
        user.managerId === selectedTeam.managerId
    );
  }, [form.assignedTeamId, teams, users]);

  // ========================================
  // HANDLE CHANGE
  // ========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
  };

  // ========================================
  // VALIDATE FORM
  // ========================================

  const validate = () => {
    const newErrors = {};

    if (!form.customerName.trim()) {
      newErrors.customerName =
        "Customer name is required";
    }

    if (!form.mobile.trim()) {
      newErrors.mobile =
        "Mobile number is required";
    } else if (
      !/^\d{10}$/.test(
        form.mobile
      )
    ) {
      newErrors.mobile =
        "Mobile must be 10 digits";
    }

    if (!form.loanType) {
      newErrors.loanType =
        "Loan type is required";
    }

    if (!form.loanAmount) {
      newErrors.loanAmount =
        "Loan amount is required";
    } else if (
      Number(form.loanAmount) <= 0
    ) {
      newErrors.loanAmount =
        "Loan amount must be greater than 0";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setServerError("");
    setDuplicateLead(null);

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerName:
          form.customerName.trim(),

        mobile:
          form.mobile.trim(),

        loanType:
          form.loanType,

        loanAmount:
          Number(form.loanAmount),

        ...(form.source && {
          source: form.source,
        }),

        ...(form.assignedToId && {
          assignedToId:
            form.assignedToId,
        }),

        ...(form.assignedTeamId && {
          assignedTeamId:
            form.assignedTeamId,
        }),
      };

      const response =
        await createLeadApi(
          payload
        );

      // ====================================
      // DUPLICATE LEAD
      // ====================================

      if (
        response?.data
          ?.isDuplicate
      ) {
        setDuplicateLead(
          response.data
        );

        return;
      }

      // ====================================
      // SUCCESS
      // ====================================

      const leadId =
        response?.data?.id;

      if (leadId) {
        navigate(
          `/leads/${leadId}`
        );

        return;
      }

      navigate("/leads");
    } catch (error) {
      const responseData =
        error?.response?.data;

      // ====================================
      // DUPLICATE FROM API
      // ====================================

      if (
        responseData?.data
          ?.isDuplicate
      ) {
        setDuplicateLead(
          responseData.data
        );

        return;
      }

      // ====================================
      // VALIDATION ERROR
      // ====================================

      if (
        Array.isArray(
          responseData?.errors
        )
      ) {
        const apiErrors = {};

        responseData.errors.forEach(
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

      setServerError(
        responseData?.message ||
          "Unable to create lead."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <PageHeader
        title="Create Lead"
        description="Add a new customer lead to FinBoat CRM."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              navigate("/leads")
            }
          >
            <ArrowLeft size={18} />
            Back to Leads
          </Button>
        }
      />

      {/* ================================== */}
      {/* SERVER ERROR */}
      {/* ================================== */}

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {serverError}
          </p>
        </div>
      )}

      {/* ================================== */}
      {/* DUPLICATE WARNING */}
      {/* ================================== */}

      {duplicateLead && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-amber-900">
                Duplicate Lead Found
              </h3>

              <p className="mt-1 text-sm text-amber-700">
                A lead with this mobile
                number already exists.
              </p>
            </div>

            {duplicateLead.duplicateOf && (
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(
                    `/leads/${duplicateLead.duplicateOf}`
                  )
                }
              >
                View Existing Lead
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ================================== */}
      {/* FORM */}
      {/* ================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ================================= */}
        {/* CUSTOMER INFORMATION */}
        {/* ================================= */}

        <Card
          title="Customer Information"
          description="Enter the customer's basic details."
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <User size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Basic Details
              </p>

              <p className="text-xs text-slate-500">
                Customer name and mobile
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Customer Name"
              name="customerName"
              value={
                form.customerName
              }
              onChange={
                handleChange
              }
              placeholder="Enter customer name"
              error={
                errors.customerName
              }
              required
            />

            <Input
              label="Mobile Number"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="10 digit mobile number"
              type="tel"
              error={errors.mobile}
              required
              maxLength={10}
            />
          </div>
        </Card>

        {/* ================================= */}
        {/* LOAN INFORMATION */}
        {/* ================================= */}

        <Card
          title="Loan Information"
          description="Enter the customer's loan requirement."
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <IndianRupee
                size={20}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Loan Requirement
              </p>

              <p className="text-xs text-slate-500">
                Loan type and requested amount
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Select
              label="Loan Type"
              name="loanType"
              value={
                form.loanType
              }
              onChange={
                handleChange
              }
              placeholder="Select loan type"
              error={
                errors.loanType
              }
              required
              options={[
                {
                  value:
                    "PERSONAL",
                  label:
                    "Personal Loan",
                },
                {
                  value:
                    "HOME",
                  label:
                    "Home Loan",
                },
                {
                  value:
                    "BUSINESS",
                  label:
                    "Business Loan",
                },
                {
                  value: "CAR",
                  label:
                    "Car Loan",
                },
              ]}
            />

            <Input
              label="Loan Amount"
              name="loanAmount"
              type="number"
              value={
                form.loanAmount
              }
              onChange={
                handleChange
              }
              placeholder="Enter loan amount"
              error={
                errors.loanAmount
              }
              required
            />
          </div>
        </Card>

        {/* ================================= */}
        {/* SOURCE */}
        {/* ================================= */}

        <Card
          title="Lead Source"
          description="Track where this lead came from."
        >
          <Select
            label="Source"
            name="source"
            value={form.source}
            onChange={handleChange}
            placeholder="Select source"
            options={[
              {
                value: "MANUAL",
                label: "Manual",
              },
              {
                value: "WEBSITE",
                label: "Website",
              },
              {
                value: "REFERRAL",
                label: "Referral",
              },
              {
                value: "CAMPAIGN",
                label: "Campaign",
              },
              {
                value: "CALL",
                label: "Call",
              },
              {
                value: "OTHER",
                label: "Other",
              },
            ]}
          />
        </Card>

        {/* ================================= */}
        {/* ASSIGNMENT */}
        {/* ================================= */}

        <Card
          title="Lead Assignment"
          description="Optionally assign the lead to a user or team."
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Users size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Assignment
              </p>

              <p className="text-xs text-slate-500">
                Team and employee assignment
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Select
              label="Assign To"
              name="assignedToId"
              value={
                form.assignedToId
              }
              onChange={
                handleChange
              }
              placeholder="Optional"
              options={availableUsers.map((user) => ({
                value: user.id,
                label: `${user.name} (${user.email})`,
              }))}
            />

            <Select
              label="Assign Team"
              name="assignedTeamId"
              value={
                form.assignedTeamId
              }
              onChange={(event) => {
                handleChange(event);
                setForm((previous) => ({
                  ...previous,
                  assignedToId: "",
                }));
              }}
              placeholder="Optional"
              options={teams.map((team) => ({
                value: team.id,
                label: team.name,
              }))}
            />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs leading-5 text-slate-500">
              Assignment optional hai. Users aur teams
              backend se load hote hain.
            </p>
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
              navigate("/leads")
            }
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
          >
            Create Lead
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateLead;