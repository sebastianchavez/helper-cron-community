export const COMMAND_WHITELIST: Record<string, {
  allowedArgs?: RegExp[];
}> = {
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
