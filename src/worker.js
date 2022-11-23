"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var bullmq_1 = require("bullmq");
var core_1 = require("@graph-viz/core");
var fs = require("fs");
var process_1 = require("process");
function cleanUpDir(path, zoomLevels) {
    if (fs.existsSync(path)) {
        fs.rmSync(path, { recursive: true, force: true });
    }
    fs.mkdirSync("".concat(path, "/tiles"), { recursive: true });
    for (var i = 0; i < zoomLevels; i++) {
        fs.mkdirSync("".concat(path, "/tiles/").concat(i + 1));
    }
}
var processor = function (job) { return __awaiter(void 0, void 0, void 0, function () {
    var options, parsed, nodes, links, graph;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                options = job.data.options;
                if (options)
                    options.path = String(options.path).endsWith('/')
                        ? options.path + job.id
                        : "".concat(options.path, "/").concat(job.id);
                parsed = JSON.parse(fs.readFileSync(job.data.inputFile).toString());
                nodes = parsed.nodes;
                links = parsed.links;
                graph = new core_1.ForceGraph(Array.from(nodes.values()), links, options);
                cleanUpDir(options.path, options.zoomLevels);
                graph.on('progress', function (e) {
                    job.updateProgress(e);
                });
                return [4 /*yield*/, graph.generateTiles()];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var connection = {
    host: process_1.env.REDIS_HOST,
    port: Number(process_1.env.REDIS_PORT)
};
var worker = new bullmq_1.Worker('graph-viz', processor, { connection: connection });
worker.on('active', function (job) {
    console.info("[STARTED] Job ID ".concat(job.id, " has been started"));
});
worker.on('completed', function (job) {
    console.info("[COMPLETED] Job ID ".concat(job.id, " has been completed"));
});
worker.on('failed', function (job) {
    console.error("[FAILED] Job ID ".concat(job === null || job === void 0 ? void 0 : job.id, ": ").concat(job === null || job === void 0 ? void 0 : job.failedReason));
});
worker.on('drained', function () {
    console.info("[WAITING] Waiting for jobs...");
});
