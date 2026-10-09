jest.mock("bullmq", () => ({
  Worker: class {
    constructor(name, processor) {
      this.name = name;
      this.processor = processor;
    }

    on() {}
  },
}));

jest.mock("fs/promises", () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/config/redis", () => ({
  redisConnection: {
    disconnect: jest.fn(),
  },
}));

jest.mock("../src/modules/leads/lead.export.service", () => ({
  exportLeads: jest.fn().mockResolvedValue([{ id: "lead-1" }]),
  createLeadExcel: jest.fn().mockReturnValue(Buffer.from("xlsx")),
}));

const { exportLeads, createLeadExcel } = require("../src/modules/leads/lead.export.service");
const { exportWorker } = require("../src/workers/export.worker");

describe("lead export worker", () => {
  test("loads the export service and processes an export job", async () => {
    const job = {
      id: "job-1",
      data: {
        user: { userId: "admin-1", role: "ADMIN" },
        filters: { status: "NEW" },
      },
      updateProgress: jest.fn().mockResolvedValue(undefined),
    };

    await exportWorker.processor(job);

    expect(exportLeads).toHaveBeenCalledWith({
      user: job.data.user,
      filters: job.data.filters,
    });
    expect(createLeadExcel).toHaveBeenCalledWith([{ id: "lead-1" }]);
    expect(job.updateProgress).toHaveBeenLastCalledWith(100);
  });
});
