import { expect } from 'chai';
import * as path from 'path';
import { createFS } from '../main';

describe('FS absolute path', async () => {
  const fs = createFS();
  const basePath = path.join(process.cwd(), '_output');

  it('should save test.txt', async () => {
    await fs.save(path.join(basePath, 'test.txt'), 'This is test!');
  });

  it('should check if test.txt was created', async () => {
    const result = await fs.exist(path.join(basePath, 'test.txt'), true);
    expect(result).to.eq(true);
  });

  it('should read test.txt', async () => {
    const result = (await fs.read(path.join(basePath, 'test.txt'))).toString();
    expect(result).to.eq('This is test!');
  });

  it('should create dir "a1"', async () => {
    await fs.mkdir(path.join(basePath, 'a1'));
    const exist = await fs.exist(path.join(basePath, 'a1'));
    expect(exist).to.eq(true);
  });

  it('should copy test.txt to "a1" dir', async () => {
    await fs.copy(
      path.join(basePath, 'test.txt'),
      path.join(basePath, 'a1', 'test1.txt'),
    );
    const exist = await fs.exist(path.join(basePath, 'a1', 'test1.txt'), true);
    expect(exist).to.eq(true);
  });

  it('should move a1/test1.txt to a1/test2.txt', async () => {
    await fs.move(
      path.join(basePath, 'a1', 'test1.txt'),
      path.join(basePath, 'a1', 'test2.txt'),
    );
    let exist = await fs.exist(path.join(basePath, 'a1', 'test1.txt'), true);
    expect(exist).to.eq(false);
    exist = await fs.exist(path.join(basePath, 'a1', 'test2.txt'), true);
    expect(exist).to.eq(true);
  });

  it('should delete file', async () => {
    await fs.copy(
      path.join(basePath, 'test.txt'),
      path.join(basePath, 'a1', 'test1.txt'),
    );
    let exist = await fs.exist(path.join(basePath, 'a1', 'test1.txt'), true);
    expect(exist).to.eq(true);
    await fs.deleteFile(path.join(basePath, 'a1', 'test1.txt'));
    exist = await fs.exist(path.join(basePath, 'a1', 'test1.txt'), true);
    expect(exist).to.eq(false);
  });

  it('should read dir', async () => {
    const result = await fs.readdir(basePath);
    expect(result).to.be.an('array');
    expect(result.length).to.eq(2);
    expect(result).to.include('a1').and.to.include('test.txt');
  });

  it('should get file tree', async () => {
    const result = await fs.fileTree(basePath, '');
    expect(result).to.be.an('array');
    expect(result.length).to.eq(2);
  });

  it('should clear test data', async () => {
    await fs.deleteDir(basePath);
  });
});
