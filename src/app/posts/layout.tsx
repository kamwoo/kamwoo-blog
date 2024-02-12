const PostsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='px-8 md:px-36 pt-6'>
      <h1 className='flex font-bold text-4xl'>Posts</h1>
      {children}
    </div>
  );
};

export default PostsLayout;
