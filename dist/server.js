"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("./controllers");
require('dotenv').config();
const port = Number(process.env.PORT) || 3000;
const app = (0, express_1.default)();
const router = express_1.default.Router();
app.use(express_1.default.json());
app.use(router);
function bootstrap() {
    const server = app.listen(port);
    if (server) {
        console.log(`Servidor está rodando na porta ${port} 🚀`);
    }
    else {
        console.log(`Servidor falhou ao iniciar 😥`);
        process.exit(1);
    }
}
app.use('/pix', controllers_1.PixController);
bootstrap();
//# sourceMappingURL=server.js.map