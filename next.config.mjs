/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  rewrites: async () => {
    return [{ source: '/', destination: '/posts' }];
  },
};

export default nextConfig;
