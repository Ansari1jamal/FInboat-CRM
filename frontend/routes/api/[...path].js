import { fromNodeHandler } from "nitro/h3";
import expressApp from "../../../backend/src/app.js";

export default fromNodeHandler(expressApp);
