import { fetchNodeHandler } from "srvx/node";
import expressApp from "../../../backend/src/app.js";

export default (event) =>
  fetchNodeHandler(expressApp, event.req);
