const PostTemplate = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex pt-4 flex-1 pb-20'>
      <div className='flex-1'>{children}</div>
      <div className='hidden lg:block lg:w-48 border-2 border-neutral-800'>
        <div className='sticky top-20 w-full h-32 border-2 border-neutral-800'></div>
      </div>
    </div>
  );
};

export default PostTemplate;
