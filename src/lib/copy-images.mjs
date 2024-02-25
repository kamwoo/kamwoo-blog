import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra';

const fsPromises = fs.promises;
const targetDir = './public/images/posts';
const postsDir = './src/contents';

async function copyImagesToPublic(images, slug) {
  for (const image of images) {
    await fsPromises.copyFile(
      `${postsDir}/${slug}/images/${image}`,
      `${targetDir}/${slug}/${image}`
    );
  }
}

async function createPostImageFoldersForCopy() {
  const postSlugs = await fsPromises.readdir(postsDir);

  for (const slug of postSlugs) {
    const allowedImageFileExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    const postDirFiles = await fsPromises.readdir(`${postsDir}/${slug}`);
    if (!postDirFiles.includes('images')) continue;

    const postImagesFiles = await fsPromises.readdir(`${postsDir}/${slug}/images`);

    const images = postImagesFiles.filter((file) =>
      allowedImageFileExtensions.includes(path.extname(file))
    );

    if (images.length) {
      await fsPromises.mkdir(`${targetDir}/${slug}`);
      await copyImagesToPublic(images, slug);
    }
  }
}

async function copy() {
  await fsExtra.emptyDir(targetDir);
  createPostImageFoldersForCopy();
}

copy();
