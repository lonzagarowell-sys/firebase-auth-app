// src/components/FeedbackList.tsx
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface Feedback {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
}

interface FeedbackListProps {
  productId: string;
}

const FeedbackList = ({ productId }: FeedbackListProps) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);

  useEffect(() => {
    const q = query(
      collection(db, "feedback"),
      where("productId", "==", productId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Feedback[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Feedback, "id">),
      }));
      setFeedbacks(list);

      if (list.length > 0) {
        const total = list.reduce((sum, fb) => sum + fb.rating, 0);
        setAvgRating(total / list.length);
      } else {
        setAvgRating(0);
      }
    });

    return () => unsubscribe();
  }, [productId]);

  return (
    <div className="bg-gray-900 p-4 rounded text-white mt-6">
      <h3 className="text-xl font-bold mb-2">⭐ Feedback</h3>
      <p className="mb-4">Average Rating: {avgRating.toFixed(1)} / 5</p>

      {feedbacks.length === 0 ? (
        <p>No feedback yet. Be the first!</p>
      ) : (
        <ul className="space-y-3">
          {feedbacks.map((fb) => (
            <li
              key={fb.id}
              className="bg-gray-800 p-3 rounded shadow-sm"
            >
              <p className="text-yellow-400">
                {"★".repeat(fb.rating)}{" "}
                {"☆".repeat(5 - fb.rating)}
              </p>
              <p className="text-sm">{fb.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FeedbackList;
