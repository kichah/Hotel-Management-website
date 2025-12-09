'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton({ children, pendingLabel }) {
  // doesn't work on the form need to be an element that be rendered inside the form(ofc we use a hook so this need to be a client component)
  const { pending } = useFormStatus();
  return (
    <button
      className='bg-accent-500 px-8 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300'
      disabled={pending}
    >
      {!pending ? children : pendingLabel}
    </button>
  );
}

export default SubmitButton;
