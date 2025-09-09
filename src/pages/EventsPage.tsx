// src/pages/EventsPage.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming your Firebase config is exported as 'db'
import { useAuth } from '../context/AuthContext'; // Assuming you have AuthContext for user info

interface Event {
  id: string;
  name: string;
  date: string; // Consider using Date object or Firestore Timestamp
  totalSlots: number;
  bookedSlots: string[]; // Array of user UIDs
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get current user from AuthContext

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[]; // Cast to Event array
        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleBookSlot = async (eventId: string) => {
    if (!user) {
      alert('You must be logged in to book a slot.');
      return;
    }

    const eventRef = doc(db, 'events', eventId);
    const userId = user.uid;

    try {
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(eventRef);
        if (!sfDoc.exists()) {
          throw new Error('Event does not exist!');
        }

        const eventData = sfDoc.data() as Event; // Cast to Event type
        const currentBookedSlots = eventData.bookedSlots || [];
        const totalSlots = eventData.totalSlots;

        // Check if user already booked
        if (currentBookedSlots.includes(userId)) {
          alert('You have already booked a slot for this event.');
          return; // Exit transaction
        }

        // Check if there are available slots
        if (currentBookedSlots.length >= totalSlots) {
          throw new Error('No more slots available for this event.');
        }

        // Update the bookedSlots array
        const newBookedSlots = [...currentBookedSlots, userId];
        transaction.update(eventRef, { bookedSlots: newBookedSlots });

        // Optimistically update UI (optional but good for UX)
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId
              ? { ...event, bookedSlots: newBookedSlots }
              : event
          )
        );
        alert('Slot booked successfully!');
      });
    } catch (e: any) {
      console.error('Transaction failed: ', e);
      alert(`Failed to book slot: ${e.message}`);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading events...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Available Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const availableSlots = event.totalSlots - event.bookedSlots.length;
          const isBookedByUser = user && event.bookedSlots.includes(user.uid);
          const isDisabled = availableSlots <= 0 || (isBookedByUser ?? false);

          return (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-transform transform hover:scale-105"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-900">{event.name}</h2>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-medium">Slots:</span> {availableSlots} / {event.totalSlots} available
              </p>
              {user ? (
                <button
                  onClick={() => handleBookSlot(event.id)}
                  disabled={isDisabled}
                  className={`w-full px-4 py-2 rounded-md font-semibold ${
                    isDisabled
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  {isBookedByUser ? 'Already Booked' : availableSlots <= 0 ? 'Fully Booked' : 'Book Slot'}
                </button>
              ) : (
                <p className="text-sm text-gray-500 text-center">Log in to book a slot.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsPage;