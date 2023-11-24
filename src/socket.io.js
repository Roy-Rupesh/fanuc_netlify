import { io } from "socket.io-client";
import config from "../src/config"
const socket = io(`${config.API_URL}`);

export default socket;
