"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATA_PATH = exports.ROOT_PATH = void 0;
const pathe_1 = __importDefault(require("pathe"));
exports.ROOT_PATH = pathe_1.default.join(__dirname, '..');
exports.DATA_PATH = pathe_1.default.join(exports.ROOT_PATH, 'data');
