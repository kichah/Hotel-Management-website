'use server';

import { revalidatePath } from 'next/cache';
import { auth, signIn, signOut } from './auth';
import { supabase } from './supabase';
import { getBookings } from './data-service';
import { redirect } from 'next/navigation';
// Auth
export async function signInAction() {
  await signIn('google', { redirectTo: '/account' });
}

export async function signoutAction() {
  await signOut({ redirectTo: '/' });
}
// Update + delete
export async function updateGuest(formdata) {
  const session = await auth();
  if (!session) throw new Error('You mist be logged in');
  const nationalID = formdata.get('nationalID');
  const [nationality, countryFlag] = formdata.get('nationality').split('%');
  //regex to test national ID
  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) {
    throw new Error('Please provide a valid national ID');
  }

  const updatedDate = { nationality, countryFlag, nationalID };
  console.log(updatedDate);

  const { data, error } = await supabase
    .from('guests')
    .update(updatedDate)
    .eq('id', session.user.guestId);

  if (error) throw new Error('Guest could not be updated');
  revalidatePath('/account/profile');
}

export async function deleteBooking(bookingId) {
  //await new Promise((resolve) => setTimeout(resolve, 20000));
  //throw new Error('');

  const session = await auth();
  if (!session) throw new Error('You mist be logged in');
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsId = guestBookings.map((booking) => booking.id);
  if (!guestBookingsId.includes(bookingId))
    throw new Error('You are not allowed to delete this booking');

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (error) throw new Error('Booking could not be deleted');
  revalidatePath('/account/reservations');
}

export async function updateBooking(formdata) {
  const bookingId = Number(formdata.get('bookingId'));
  // 1- authentication
  const session = await auth();
  if (!session) throw new Error('You must be logged in');
  // 2- authorization
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsId = guestBookings.map((booking) => booking.id);

  if (!guestBookingsId.includes(bookingId))
    throw new Error('You are not allowed to update this booking');

  // 3- Data
  const updatedData = {
    numGuests: Number(formdata.get('numGuests')),
    observations: formdata.get('observations').slice(0, 1000),
  };

  // 4- Mutation
  const { data, error } = await supabase
    .from('bookings')
    .update(updatedData)
    .eq('id', bookingId)
    .select()
    .single();

  // 5- Error Handling
  if (error) throw new Error('Booking could not be updated');

  // 6- Redirection
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath(`/account/reservations`);
  redirect('/account/reservations');
}

export async function createBooking(bookingData, formdata) {
  // we add booking data as the first argument for bind
  const session = await auth();
  if (!session) throw new Error('You must be logged in');
  const newBooking = {
    ...bookingData,
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    status: 'unconfirmed',
    hasBreakfast: false,
    isPaid: false,
    observations: formdata.get('observations').slice(0, 1000),
    guestId: session.user.guestId,
    numGuests: Number(formdata.get('numGuests')),
  };
  const { error } = await supabase.from('bookings').insert([newBooking]);

  if (error) throw new Error('Booking could not be created');

  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect('/cabins/thankyou');
}
