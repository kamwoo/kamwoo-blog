import { appRouter } from '@/server/routers/_app';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api',
    req,
    router: appRouter,
    createContext: () => ({}),
  });
};

export { handler as GET, handler as POST };
