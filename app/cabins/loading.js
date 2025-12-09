import Spinner from '@/app/_components/Spinner';

export default function Loading() {
  // a loader styles
  return (
    <div className='grid items-center justify-center'>
      <Spinner />
      <p className='text-xl text-primary-200'>Loading Cabin data...</p>
    </div>
  );
}
