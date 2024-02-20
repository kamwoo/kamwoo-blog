const PostTemplate = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex pt-4 flex-1 pb-20'>
      <div className='flex-1'>{children}</div>
      {/* <div className='hidden md:block md:w-60 bg-red-300'></div> */}
    </div>
  );
};

export default PostTemplate;
