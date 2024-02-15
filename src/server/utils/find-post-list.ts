import path from 'path';
import fs from 'fs';

export const findPostList = () => {
  const dirPath = path.resolve(process.cwd(), './src', './contents');
  const list = fs.readdirSync(dirPath, { withFileTypes: false });

  return { list, dirPath };
};
