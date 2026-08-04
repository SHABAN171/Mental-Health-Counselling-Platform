import { z } from "zod";

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().trim().min(1, "Message can't be empty.").max(2000),
  backTo: z.string().min(1),
});
