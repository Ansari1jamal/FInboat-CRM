const teamService = require("./team.service");

const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");

const createTeam = asyncHandler(
  async (req, res) => {
    const team =
      await teamService.createTeam(
        req.body
      );

    return sendSuccess(
      res,
      team,
      "Team created successfully",
      201
    );
  }
);

const getTeams = asyncHandler(
  async (req, res) => {
    const teams =
      await teamService.getTeams();

    return sendSuccess(
      res,
      teams,
      "Teams fetched successfully"
    );
  }
);

const getTeamById = asyncHandler(
  async (req, res) => {
    const team =
      await teamService.getTeamById(
        req.params.id
      );

    return sendSuccess(
      res,
      team,
      "Team fetched successfully"
    );
  }
);

const updateTeam = asyncHandler(
  async (req, res) => {
    const team =
      await teamService.updateTeam(
        req.params.id,
        req.body
      );

    return sendSuccess(
      res,
      team,
      "Team updated successfully"
    );
  }
);

const deleteTeam = asyncHandler(
  async (req, res) => {
    await teamService.deleteTeam(
      req.params.id
    );

    return sendSuccess(
      res,
      null,
      "Team deleted successfully"
    );
  }
);

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
};