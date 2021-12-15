export interface FSFileTreeItem {
  path: {
    abs: string;
    rel: string;
  };
  dir: string;
}

export type FSFileTreeList = FSFileTreeItem[];

export interface FS {
  exist(root: string | string[], isFile?: boolean): Promise<boolean>;
  save(root: string | string[], data: string | Buffer): Promise<void>;
  mkdir(root: string | string[]): Promise<void>;
  read(root: string | string[]): Promise<Buffer>;
  readString(root: string | string[]): Promise<string>;
  readdir(root: string | string[]): Promise<string[]>;
  deleteFile(root: string | string[]): Promise<void>;
  deleteDir(root: string | string[]): Promise<void>;
  rename(
    root: string | string[],
    currName: string,
    newName: string,
  ): Promise<void>;
  fileTree(
    startingLocation: string | string[],
    currentLocation: string | string[],
  ): Promise<FSFileTreeList>;
  copy(srcPath: string | string[], destPath: string | string[]): Promise<void>;
  move(srcPath: string | string[], destPath: string | string[]): Promise<void>;
}

export interface FSConfig {
  base?: string | string[];
}
