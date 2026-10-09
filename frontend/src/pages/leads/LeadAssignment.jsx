import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Users,
  UserRound,
  RefreshCw,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";

import {
  assignLeadApi,
} from "../../services/lead.api";

import {
  getTeamsApi,
} from "../../services/teams.api";

import {
  getUsersApi,
} from "../../services/users.api";

const LeadAssignment = ({
  lead,
  onUpdated,
}) => {
  const [teams, setTeams] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [teamId, setTeamId] =
    useState(
      lead?.assignedTeamId || ""
    );

  const [userId, setUserId] =
    useState(
      lead?.assignedToId || ""
    );

  const [loading, setLoading] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ======================================
  // LOAD TEAMS + USERS
  // ======================================

  useEffect(() => {
    const loadData =
      async () => {
        try {
          setLoadingData(true);
          setError("");

          const [
            teamsResponse,
            usersResponse,
          ] = await Promise.all([
            getTeamsApi(),
            getUsersApi(),
          ]);

          setTeams(
            teamsResponse?.data ||
              []
          );

          setUsers(
            usersResponse?.data ||
              []
          );
        } catch (err) {
          setError(
            err?.response?.data
              ?.message ||
              "Unable to load assignment data."
          );
        } finally {
          setLoadingData(false);
        }
      };

    loadData();
  }, []);

  useEffect(() => {
    setTeamId(lead?.assignedTeamId || "");
    setUserId(lead?.assignedToId || "");
  }, [lead?.assignedTeamId, lead?.assignedToId]);

  // ======================================
  // USERS FILTER
  // ======================================

  const availableUsers =
    useMemo(() => {
      if (!teamId) {
        return users;
      }

      return users.filter(
        (user) =>
          user.teamId ===
            teamId ||
          user.team?.id ===
            teamId
      );
    }, [
      users,
      teamId,
    ]);

  // ======================================
  // ASSIGN
  // ======================================

  const handleAssign =
    async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const payload = {
          toUserId:
            userId || null,

          toTeamId:
            teamId || null,
        };

        const response =
          await assignLeadApi(
            lead.id,
            payload
          );

        setSuccess(
          "Lead assignment updated successfully."
        );

        if (onUpdated) {
          onUpdated(
            response?.data?.lead ||
              response?.data
          );
        }
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to assign lead."
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================
  // LOADING
  // ======================================

  if (loadingData) {
    return (
      <Card
        title="Assignment"
        description="Manage lead ownership"
      >
        <div className="flex items-center gap-3 py-4 text-sm text-slate-500">
          <RefreshCw
            size={17}
            className="animate-spin"
          />
          Loading assignment data...
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Assignment"
      description="Assign or reassign this lead."
    >
      <div className="space-y-5">
        {/* ================================= */}
        {/* CURRENT ASSIGNMENT */}
        {/* ================================= */}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Users size={14} />
              Current Team
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              {lead.assignedTeam?.name ||
                lead.assignedTeamName ||
                "Unassigned"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <UserRound size={14} />
              Current User
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              {lead.assignedTo?.name ||
                lead.assignedToName ||
                "Unassigned"}
            </p>
          </div>
        </div>

        {/* ================================= */}
        {/* SELECT TEAM */}
        {/* ================================= */}

        <Select
          label="Team"
          value={teamId}
          onChange={(event) => {
            setTeamId(
              event.target.value
            );

            setUserId("");
          }}
          options={[
            {
              value: "",
              label:
                "Select team",
            },
            ...teams.map(
              (team) => ({
                value: team.id,
                label: team.name,
              })
            ),
          ]}
        />

        {/* ================================= */}
        {/* SELECT USER */}
        {/* ================================= */}

        <Select
          label="Assign User"
          value={userId}
          onChange={(event) =>
            setUserId(
              event.target.value
            )
          }
          options={[
            {
              value: "",
              label:
                "Select user",
            },
            ...availableUsers.map(
              (user) => ({
                value: user.id,
                label: `${user.name} ${
                  user.role
                    ? `(${user.role})`
                    : ""
                }`,
              })
            ),
          ]}
        />

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ================================= */}
        {/* SUCCESS */}
        {/* ================================= */}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-700">
              {success}
            </p>
          </div>
        )}

        {/* ================================= */}
        {/* BUTTON */}
        {/* ================================= */}

        <Button
          onClick={handleAssign}
          loading={loading}
          disabled={!userId}
          className="w-full sm:w-auto"
        >
          <RefreshCw size={17} />
          {lead.assignedToId ||
          lead.assignedTeamId
            ? "Reassign Lead"
            : "Assign Lead"}
        </Button>
      </div>
    </Card>
  );
};

export default LeadAssignment;