import SearchInput from "../../components/common/SearchInput";
import Select from "../../components/common/Select";

const LeadFilters = ({
  filters,
  onChange,
}) => {
  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    onChange({
      ...filters,
      [name]: value,
    });
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Search Leads
          </label>

          <SearchInput
            value={filters.search}
            onChange={(event) =>
              onChange({
                ...filters,
                search:
                  event.target.value,
              })
            }
            placeholder="Search name or mobile..."
          />
        </div>

        <Select
          label="Lead Status"
          name="status"
          value={filters.status}
          onChange={handleChange}
          options={[
            {
              value: "NEW",
              label: "New",
            },
            {
              value: "INTERESTED",
              label: "Interested",
            },
            {
              value: "DOCUMENTS_PENDING",
              label: "Documents Pending",
            },
            {
              value: "LOGIN",
              label: "Login",
            },
            {
              value: "APPROVED",
              label: "Approved",
            },
            {
              value: "DISBURSED",
              label: "Disbursed",
            },
            {
              value: "REJECTED",
              label: "Rejected",
            },
          ]}
        />

        <Select
          label="Loan Type"
          name="loanType"
          value={filters.loanType}
          onChange={handleChange}
          options={[
            {
              value: "PERSONAL",
              label: "Personal Loan",
            },
            {
              value: "HOME",
              label: "Home Loan",
            },
            {
              value: "BUSINESS",
              label: "Business Loan",
            },
            {
              value: "CAR",
              label: "Car Loan",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default LeadFilters;