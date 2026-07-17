module.exports = {
  pick: async () => {
    throw new Error("Document picker is not available on macOS.");
  },
  types: {},
  keepLocalCopy: async () => [],
  errorCodes: {},
  isErrorWithCode: () => false,
};
