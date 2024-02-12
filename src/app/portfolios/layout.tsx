const PortfoliosLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='px-6 md:px-20'>
      <div className='pl-10 pt-6'>
        <h1 className='flex font-bold text-4xl'>Portfolios</h1>
      </div>
      {children}
    </div>
  );
};

export default PortfoliosLayout;
