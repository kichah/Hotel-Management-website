import { auth } from '../_lib/auth';

export const metadata = {
  title: 'Guest Area',
};

async function Page() {
  const session = await auth();
  const firstName = session.user.name.split(' ').at(0);
  return (
    <h1 className='font-semibold text-2xl text-accent-400 mb-7'>
      Welcome, {firstName}
    </h1>
  );
}

export default Page;
