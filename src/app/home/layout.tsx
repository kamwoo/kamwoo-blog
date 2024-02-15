const HomeLayout = ({ children }: { children: React.ReactElement }) => {
  return (
    <div className='w-full flex flex-col justify-center items-center px-6 pt-14 pb-20 md:px-20'>
      {children}
    </div>
  );
};

export default HomeLayout;
