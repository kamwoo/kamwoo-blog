const DoyeonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='w-full flex flex-col justify-center items-center px-6 pt-4 pb-20 md:px-20'>
      <p className='text-lg font-bold text-accent-foreground'>도연이와 나를 위한 배차 시간표</p>
      {children}
    </div>
  );
};

export default DoyeonLayout;
