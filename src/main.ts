import * as os from 'os';
import * as path from 'path';
import * as fsp from 'fs/promises';
import * as fse from 'fs-extra';
import * as fs from 'fs';
import type { FS, FSConfig, FSFileTreeList } from './types';

export function createFS(config?: FSConfig): FS {
  if (!config) {
    config = {};
  }

  const baseRoot = config.base
    ? config.base instanceof Array
      ? path.join(...config.base)
      : config.base
    : '';
  const isWin = os.platform() === 'win32';
  const slash = isWin ? '\\' : '/';

  function arrayPathToString(root: string | string[]): string {
    return root instanceof Array ? path.join(...root) : root;
  }

  const self: FS = {
    async save(_root, data) {
      const root = arrayPathToString(_root);
      let parts = root.split(slash).filter((e) => !!e);
      let isAbs = false;
      let base = '';
      if (isWin) {
        if (root.charAt(1) === ':') {
          isAbs = true;
          base = parts[0];
          parts.splice(0, 1);
        }
      } else if (root.startsWith('/')) {
        isAbs = true;
      }
      if (!isAbs) {
        parts = [...baseRoot.split(slash), ...parts];
      }
      if (!isWin && !root.startsWith('/')) {
        base = '/';
      } else if (isWin && !isAbs) {
        base = parts[0];
        parts.splice(0, 1);
      }
      for (let j = 0; j < parts.length - 1; j++) {
        base = path.join(base, parts[j]);
        try {
          if (!(await self.exist(base))) {
            await fsp.mkdir(base);
          }
        } catch (error) {
          // Do nothing.
        }
      }
      await fsp.writeFile(path.join(base, parts[parts.length - 1]), data);
    },

    async exist(_root, isFile) {
      const root = arrayPathToString(_root);
      return new Promise<boolean>((resolve, reject) => {
        const pth =
          root.startsWith('/') || root.charAt(1) === ':'
            ? root
            : path.join(baseRoot, root);
        fs.stat(pth, (err, stats) => {
          if (err) {
            if (err.code === 'ENOENT') {
              resolve(false);
              return;
            } else {
              reject(err);
            }
            return;
          }
          if (isFile) {
            resolve(stats.isFile());
          } else {
            resolve(stats.isDirectory());
          }
        });
      });
    },

    async mkdir(_root) {
      const root = arrayPathToString(_root);
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await fse.mkdirp(root);
      }
      return await fse.mkdirp(path.join(baseRoot, root));
    },
    async read(_root) {
      const root = arrayPathToString(_root);
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await fsp.readFile(root);
      }
      return await fsp.readFile(path.join(baseRoot, root));
    },
    async readString(_root) {
      const root = arrayPathToString(_root);
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return (await fsp.readFile(root)).toString();
      }
      return (await fsp.readFile(path.join(baseRoot, root))).toString();
    },

    async readdir(_root) {
      const root = arrayPathToString(_root);
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await fsp.readdir(root);
      }
      return await fsp.readdir(path.join(baseRoot, root));
    },

    async deleteFile(_root) {
      const root = arrayPathToString(_root);
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await fsp.unlink(root);
      }
      await fsp.unlink(path.join(baseRoot, root));
    },

    async deleteDir(_root) {
      const root = arrayPathToString(_root);
      if (root.startsWith('/') || root.charAt(1) === ':') {
        await fse.remove(root);
      }
      await fse.remove(path.join(baseRoot, root));
    },

    async rename(_root, currName, newName) {
      const root = arrayPathToString(_root);
      await self.move(
        root.startsWith('/') || root.charAt(1) === ':'
          ? path.join(root, currName)
          : path.join(baseRoot, root, currName),
        root.startsWith('/') || root.charAt(1) === ':'
          ? path.join(root, newName)
          : path.join(baseRoot, root, newName),
      );
    },

    async fileTree(_startingLocation, _currentLocation) {
      const startingLocation = arrayPathToString(_startingLocation);
      const currentLocation = arrayPathToString(_currentLocation);
      const output: FSFileTreeList = [];
      const basePath =
        startingLocation.startsWith('/') || startingLocation.charAt(1) === ':'
          ? path.join(startingLocation, currentLocation)
          : path.join(baseRoot, startingLocation, currentLocation);
      const files = await fsp.readdir(basePath);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(basePath, file);
        const stat = await fsp.lstat(filePath);
        if (stat.isDirectory()) {
          const children = await self.fileTree(
            startingLocation,
            path.join(currentLocation, file),
          );
          for (let j = 0; j < children.length; j++) {
            const child = children[j];
            output.push(child);
          }
        } else {
          output.push({
            path: {
              abs: filePath,
              rel: path.join(
                currentLocation,
                filePath.replace(basePath, '').substring(1),
              ),
            },
            dir: currentLocation,
          });
        }
      }
      return output;
    },

    async copy(_srcPath, _destPath) {
      const srcPath = arrayPathToString(_srcPath);
      const destPath = arrayPathToString(_destPath);
      await fse.copy(
        srcPath.startsWith('/') || srcPath.charAt(1) === ':'
          ? srcPath
          : path.join(baseRoot, srcPath),
        destPath.startsWith('/') || destPath.charAt(1) === ':'
          ? destPath
          : path.join(baseRoot, destPath),
      );
    },

    async move(_srcPath, _destPath) {
      const srcPath = arrayPathToString(_srcPath);
      const destPath = arrayPathToString(_destPath);
      await fse.move(
        srcPath.startsWith('/') || srcPath.charAt(1) === ':'
          ? srcPath
          : path.join(baseRoot, srcPath),
        destPath.startsWith('/') || destPath.charAt(1) === ':'
          ? destPath
          : path.join(baseRoot, destPath),
      );
    },
  };

  return self;
}
