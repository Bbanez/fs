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

  const baseRoot = config.base ? config.base : '';
  const isWin = os.platform() === 'win32';
  const slash = isWin ? '\\' : '/';

  const self: FS = {
    async save(root, data) {
      let parts = root.split(slash).filter((e) => !!e);
      let base = root.startsWith(slash) ? '' : `${baseRoot}`;
      if (root.startsWith(slash) || root.charAt(1) === ':') {
        base = '';
      } else {
        parts = ['', ...parts];
        base = `${baseRoot}`;
      }
      for (let j = 0; j < parts.length - 1; j++) {
        if (base) {
          base = path.join(base, parts[j]);
        } else {
          base = path.join(slash, parts[j]);
        }
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
    async exist(root, isFile) {
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
    async mkdir(root) {
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await fse.mkdirp(root);
      }
      return await fse.mkdirp(path.join(baseRoot, root));
    },
    async read(root) {
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await fsp.readFile(root);
      }
      return await fsp.readFile(path.join(baseRoot, root));
    },
    async readdir(root) {
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await fsp.readdir(root);
      }
      return await fsp.readdir(path.join(baseRoot, root));
    },
    async deleteFile(root) {
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await fsp.unlink(root);
      }
      await fsp.unlink(path.join(baseRoot, root));
    },
    async deleteDir(root) {
      if (root.startsWith('/') || root.charAt(1) === ':') {
        await fse.remove(root);
      }
      await fse.remove(path.join(baseRoot, root));
    },
    async rename(root, currName, newName) {
      await self.move(
        root.startsWith('/') || root.charAt(1) === ':'
          ? path.join(root, currName)
          : path.join(baseRoot, root, currName),
        root.startsWith('/') || root.charAt(1) === ':'
          ? path.join(root, newName)
          : path.join(baseRoot, root, newName),
      );
    },
    async fileTree(startingLocation, currentLocation) {
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
    async copy(srcPath, destPath) {
      await fse.copy(
        srcPath.startsWith('/') || srcPath.charAt(1) === ':'
          ? srcPath
          : path.join(baseRoot, srcPath),
        destPath.startsWith('/') || destPath.charAt(1) === ':'
          ? destPath
          : path.join(baseRoot, destPath),
      );
    },
    async move(srcPath, destPath) {
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
