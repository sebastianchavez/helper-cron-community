"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMAND_WHITELIST = void 0;
exports.COMMAND_WHITELIST = {
    node: {},
    npm: {
        allowedArgs: [
            /^install$/,
            /^test$/,
            /^run$/,
            /^run:.+$/,
        ],
    },
    npx: {
        allowedArgs: [
            /^ng$/,
            /^ng\s.+$/,
        ],
    },
};
