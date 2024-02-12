import { ScrollArea } from '@/components/ui/scroll-area';

const PostsPage = () => {
  return (
    <div className='border-2 flex pt-8 gap-6'>
      <ScrollArea className='w-60 border-2'>
        <div>1</div>
      </ScrollArea>
      <div className='border-2 flex-1'></div>
    </div>
  );
};

export default PostsPage;
