import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface FeedbackFormProps {
  productId: string;
}

export default function FeedbackForm({ productId }: FeedbackFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to submit feedback.");
    if (rating < 1 || rating > 5) return alert("Please choose a rating from 1 to 5.");

    try {
      await addDoc(collection(db, "products", productId, "feedback"), {
        userId: user.uid,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      setRating(0);
      setComment("");
      alert("Thanks for your feedback! ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback.");
    }
  };

  return (
    <form onSubmit={submit} className="bg-gray-800 p-4 rounded mt-4">
      <h3 className="text-lg font-bold mb-2">Leave a Review</h3>

      <div className="flex mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-400"}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        className="w-full p-2 text-black rounded mb-2"
        placeholder="Write your comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button type="submit" className="bg-blue-500 px-4 py-2 rounded text-white">
        Submit
      </button>
    </form>
  );
}
