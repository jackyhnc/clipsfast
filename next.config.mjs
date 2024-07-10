/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'upload.wikimedia.org',
            port: '',
            pathname: '/wikipedia/commons/a/a5/**',
          },
          {
            protocol: 'https',
            hostname: 'i.ytimg.com',
            port: '',
            pathname: '/vi/**',
          },
        ],
      },
    
};

export default nextConfig;
