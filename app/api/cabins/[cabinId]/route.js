import { getBookedDatesByCabinId, getCabin } from '@/app/_lib/data-service';

export async function GET(request, { params }) {
  const { cabinId } = params;
  try {
    const [cabin, bookedDates] = await Promise.all([
      getCabin(cabinId),
      getBookedDatesByCabinId(cabinId),
    ]);
    //send back some responses
    return Response.json({ cabin, bookedDates });
  } catch (error) {
    return Response.json({ message: 'Cabin not found' });
  }
}
//async function POST() {}
