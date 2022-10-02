import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">How did you get there?</h1>
      <h3>It was an error, please contact an administrator.</h3>
    </div>
  );
};

export default Home;
