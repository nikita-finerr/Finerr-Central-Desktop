class ReactNativeBlobUtilStub {
  static config() {
    return {
      fetch: async () => ({ path: () => "", data: "" }),
    };
  }

  static fs = {
    dirs: { CacheDir: "/tmp", DocumentDir: "/tmp" },
    unlink: async () => {},
    exists: async () => false,
    writeFile: async () => {},
    readFile: async () => "",
  };

  static fetch = async () => ({ path: () => "", data: "" });
}

module.exports = ReactNativeBlobUtilStub;
module.exports.default = ReactNativeBlobUtilStub;
