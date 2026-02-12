
import { AuthUserPayload } from "../utils/types";

declare global {
    namespace Express {
        interface Request {
            user?: AuthUserPayload;
        }
    }
}
