const { z } = require("zod");

const createMasterDataSchema =
  z.object({
    category: z
      .string()
      .min(1),

    code: z
      .string()
      .min(1)
      .max(100),

    name: z
      .string()
      .min(1)
      .max(200),

    description:
      z.string().max(500).optional(),

    sortOrder:
      z.coerce.number()
        .int()
        .min(0)
        .optional(),

    metadata:
      z.record(z.any()).optional(),
  });

module.exports = {
  createMasterDataSchema,
};