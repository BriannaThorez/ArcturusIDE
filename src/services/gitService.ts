import git from "isomorphic-git";
import http from "isomorphic-git/http/web";
// Note: isomorphic-git requires an fs implementation.
// In a browser environment, this is typically provided by lightning-fs or a similar library.
// For this boilerplate, we'll mock the fs to prevent immediate errors,
// but a real implementation would be needed for full functionality.

const fs = {
  promises: {
    readFile: async () => new Uint8Array(),
    writeFile: async () => {},
    mkdir: async () => {},
    readdir: async () => [],
    stat: async () => ({ isDirectory: () => true, isFile: () => false }),
    lstat: async () => ({ isDirectory: () => true, isFile: () => false }),
    rmdir: async () => {},
    unlink: async () => {},
  },
};

export const gitService = {
  async init(dir: string) {
    try {
      await git.init({ fs, dir });
    } catch (error) {
      console.error("Failed to initialize git repository:", error);
    }
  },

  async clone(url: string, dir: string) {
    try {
      await git.clone({
        fs,
        http,
        dir,
        url,
        corsProxy: "https://cors.isomorphic-git.org",
        singleBranch: true,
        depth: 1,
      });
    } catch (error) {
      console.error("Failed to clone repository:", error);
    }
  },

  async status(dir: string) {
    try {
      const statusMatrix = await git.statusMatrix({ fs, dir });
      return statusMatrix;
    } catch (error) {
      console.error("Failed to get git status:", error);
      return [];
    }
  },
};
