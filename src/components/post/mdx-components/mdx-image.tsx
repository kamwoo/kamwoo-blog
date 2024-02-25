import NextImage from 'next/image';

/**
 * how to use
 * ![alt text](/image.png?width=500&height=400)
 */
export function MDXImage({
  src = '',
  alt = '',
}: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  let widthFromSrc, heightFromSrc;
  const url = new URL(src);
  const widthParam = url.searchParams.get('w') || url.searchParams.get('width');
  const heightParam = url.searchParams.get('h') || url.searchParams.get('height');
  if (widthParam) {
    widthFromSrc = parseInt(widthParam);
  }
  if (heightParam) {
    heightFromSrc = parseInt(heightParam);
  }

  const imageProps = {
    src,
    alt,
    // tweak these to your liking
    height: heightFromSrc || 450,
    width: widthFromSrc || 550,
  };

  return <NextImage {...imageProps} />;
}
