import { z } from "zod";
import { objectIdSchema } from "./objectId";

export const postParamsSchema = z.object({
    blogId: objectIdSchema,
});
