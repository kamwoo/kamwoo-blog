import path from 'path';
import fs from 'fs';

export const findPostList = () => {
  const dirPath = path.resolve(process.cwd(), './src', './contents');
  const list = fs.readdirSync(dirPath);

  return { list, dirPath };
};

export const readPosts = () => {
  const baseDirPath = path.resolve(process.cwd(), './src/contents');
  const postFolders = fs
    .readdirSync(baseDirPath)
    .filter((folderName) => fs.lstatSync(`${baseDirPath}/${folderName}`).isDirectory());

  const postDataList = postFolders.map((folderName) => {
    return fs.readFileSync(`${baseDirPath}/${folderName}/index.md`, 'utf-8');
  });

  return postDataList;
};
