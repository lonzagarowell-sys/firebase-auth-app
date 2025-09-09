import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import FeedbackForm from "../components/FeedbackForm";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string; // ✅ product image
}

interface Feedback {
  id: string;
  userId: string;
  rating: number;
  comment: string;
}

// 🔹 ProductCard (handles feedback & average rating)
const ProductCard = ({ product }: { product: Product }) => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [average, setAverage] = useState<number>(0);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "products", product.id, "feedback"),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Feedback, "id">),
        }));
        setFeedback(list);

        if (list.length) {
          setAverage(
            list.reduce((sum, f) => sum + (f.rating || 0), 0) / list.length
          );
        } else {
          setAverage(0);
        }
      }
    );
    return () => unsub();
  }, [product.id]);

  return (
    <div>
      <p className="text-yellow-400 mt-1">
        ⭐ {average.toFixed(1)}{" "}
        {feedback.length > 0
          ? `(${feedback.length} reviews)`
          : "(no reviews yet)"}
      </p>

      {/* Feedback form */}
      <FeedbackForm productId={product.id} />

      {/* Feedback list */}
      <div className="mt-4 space-y-2">
        {feedback.map((fb) => (
          <p key={fb.id} className="text-sm text-gray-300">
            <span className="text-yellow-400">★ {fb.rating}</span> –{" "}
            {fb.comment}
          </p>
        ))}
      </div>
    </div>
  );
};

// 🔹 Main ProductCatalog
const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // ✅ Real-time listener for products
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const list: Product[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Product, "id">),
      }));
      setProducts(list);
    });

    // ✅ Real-time listener for user favorites
    let unsubscribeFavorites: (() => void) | undefined;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      unsubscribeFavorites = onSnapshot(userRef, (userSnap) => {
        if (userSnap.exists()) {
          setFavorites(userSnap.data().favorites || []);
        } else {
          setFavorites([]);
        }
      });
    }

    return () => {
      unsubscribeProducts();
      if (unsubscribeFavorites) unsubscribeFavorites();
    };
  }, [user]);

  // 🔹 Toggle favorite (add/remove)
  const toggleFavorite = async (productId: string) => {
    if (!user) return alert("⚠️ Please log in to add favorites");

    const userRef = doc(db, "users", user.uid);

    if (favorites.includes(productId)) {
      await updateDoc(userRef, {
        favorites: arrayRemove(productId),
      });
    } else {
      await updateDoc(userRef, {
        favorites: arrayUnion(productId),
      });
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">🛒 Product Catalog</h1>
      <ul className="space-y-4">
        {products.map((product) => (
          <li key={product.id} className="bg-gray-800 p-4 rounded">
            {/* Header + favorite button */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl">{product.name}</h2>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`px-4 py-2 rounded ${
                  favorites.includes(product.id) ? "bg-red-500" : "bg-green-500"
                }`}
              >
                {favorites.includes(product.id)
                  ? "Remove Favorite"
                  : "Add to Favorites"}
              </button>
            </div>

            {/* ✅ Product image */}
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-32 h-32 object-cover rounded mb-3"
              />
            )}

            <p className="mb-4">${product.price}</p>

            {/* Feedback + ratings */}
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductCatalog;
