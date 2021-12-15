export interface FSFileTreeItem {
  path: {
    abs: string;
    rel: string;
  };
  dir: string;
}

export type FSFileTreeList = FSFileTreeItem[];

export interface FS {
  exist(root: string, isFile?: boolean): Promise<boolean>;
  save(root: string, data: string | Buffer): Promise<void>;
  mkdir(root: string): Promise<void>;
  read(root: string): Promise<Buffer>;
  readdir(root: string): Promise<string[]>;
  deleteFile(root: string): Promise<void>;
  deleteDir(root: string): Promise<void>;
  rename(root: string, currName: string, newName: string): Promise<void>;
  fileTree(
    startingLocation: string,
    currentLocation: string,
  ): Promise<FSFileTreeList>;
  copy(srcPath: string, destPath: string): Promise<void>;
  move(srcPath: string, destPath: string): Promise<void>;
}

export interface FSConfig {
  base?: string;
}
