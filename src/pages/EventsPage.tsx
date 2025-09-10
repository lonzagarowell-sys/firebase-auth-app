// src/pages/EventsPage.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface Event {
  id: string;
  name: string;
  date: string;
  totalSlots: number;
  bookedSlots: string[];
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];
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

    try {
      // Optimistic UI update first
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? { ...event, bookedSlots: [...event.bookedSlots, user.uid] }
            : event
        )
      );

      // Firestore update using arrayUnion to avoid overwriting existing booked slots
      await updateDoc(eventRef, {
        bookedSlots: arrayUnion(user.uid),
      });

      alert('Slot booked successfully!');
    } catch (e: any) {
      console.error('Failed to book slot:', e);
      alert(`Failed to book slot: ${e.message}`);

      // Rollback UI update if Firestore fails
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? { ...event, bookedSlots: event.bookedSlots.filter(uid => uid !== user.uid) }
            : event
        )
      );
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
          const isDisabled = availableSlots <= 0 || isBookedByUser;

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
                  disabled={!!isDisabled}
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
