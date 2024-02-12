const HomeLayout = ({ children }: { children: React.ReactElement }) => {
  return (
    <div className='w-full flex flex-col justify-center items-center px-6 md:px-20'>{children}</div>
  );
};

export default HomeLayout;
