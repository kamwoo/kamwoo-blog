import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra';

const fsPromises = fs.promises;
const targetDir = './public/images/posts';
const targetVideoDir = './public/videos/posts';
const postsDir = './src/contents';

async function copyImagesToPublic(images, slug) {
  for (const image of images) {
    await fsPromises.copyFile(
      `${postsDir}/${slug}/images/${image}`,
      `${targetDir}/${slug}/${image}`
    );
  }
}

async function copyVideosToPublic(images, slug) {
  for (const image of images) {
    await fsPromises.copyFile(
      `${postsDir}/${slug}/videos/${image}`,
      `${targetVideoDir}/${slug}/${image}`
    );
  }
}

async function createPostImagesFoldersForCopy() {
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

async function createPostVideosFoldersForCopy() {
  const postSlugs = await fsPromises.readdir(postsDir);

  for (const slug of postSlugs) {
    const allowedVideosFileExtensions = ['.mov', '.mp4'];

    const postDirFiles = await fsPromises.readdir(`${postsDir}/${slug}`);
    if (!postDirFiles.includes('videos')) continue;

    const postVideosFiles = await fsPromises.readdir(`${postsDir}/${slug}/videos`);

    const videos = postVideosFiles.filter((file) =>
      allowedVideosFileExtensions.includes(path.extname(file))
    );

    if (videos.length) {
      await fsPromises.mkdir(`${targetVideoDir}/${slug}`);
      await copyVideosToPublic(videos, slug);
    }
  }
}

async function copy() {
  await fsExtra.emptyDir(targetDir);
  await fsExtra.emptyDir(targetVideoDir);
  await createPostImagesFoldersForCopy();
  createPostVideosFoldersForCopy();
}

copy();
