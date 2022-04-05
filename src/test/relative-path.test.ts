import { expect } from 'chai';
import * as path from 'path';
import { createFS } from '../main';

describe('FS relative paths', async () => {
  const fs = createFS({
    base: path.join(__dirname, '_output', 'test'),
  });

  it('should save test.txt', async () => {
    await fs.save('test.txt', 'This is test!');
  });

  it('should check if test.txt was created', async () => {
    const result = await fs.exist('test.txt', true);
    expect(result).to.eq(true);
  });

  it('should read test.txt', async () => {
    const result = (await fs.read('test.txt')).toString();
    expect(result).to.eq('This is test!');
  });

  it('should create dir "a1"', async () => {
    await fs.mkdir('a1');
    const exist = await fs.exist('a1');
    expect(exist).to.eq(true);
  });

  it('should copy test.txt to "a1" dir', async () => {
    await fs.copy('test.txt', ['a1', 'test1.txt']);
    const exist = await fs.exist(['a1', 'test1.txt'], true);
    expect(exist).to.eq(true);
  });

  it('should move a1/test1.txt to a1/test2.txt', async () => {
    await fs.move(['a1', 'test1.txt'], ['a1', 'test2.txt']);
    let exist = await fs.exist(['a1', 'test1.txt'], true);
    expect(exist).to.eq(false);
    exist = await fs.exist(['a1', 'test2.txt'], true);
    expect(exist).to.eq(true);
  });

  it('should delete file', async () => {
    await fs.copy('test.txt', ['a1', 'test1.txt']);
    let exist = await fs.exist(['a1', 'test1.txt'], true);
    expect(exist).to.eq(true);
    await fs.deleteFile(['a1', 'test1.txt']);
    exist = await fs.exist(['a1', 'test1.txt'], true);
    expect(exist).to.eq(false);
  });

  it('should read dir', async () => {
    const result = await fs.readdir('');
    expect(result).to.be.an('array');
    expect(result.length).to.eq(2);
    expect(result).to.include('a1').and.to.include('test.txt');
  });

  it('should get file tree', async () => {
    const result = await fs.fileTree('', '');
    expect(result).to.be.an('array');
    expect(result.length).to.eq(2);
  });

  it('should clear test data', async () => {
    await fs.deleteDir('');
  });
});
