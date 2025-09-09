// src/components/Favorites.tsx
import { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface Product {
  id: string;
  name: string;
  price: number;
}

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // ✅ Subscribe to real-time updates on favorites
    const unsubscribe = onSnapshot(userRef, async (userSnap) => {
      if (userSnap.exists()) {
        const data = userSnap.data();
        const favoriteIds: string[] = data.favorites || [];

        // Fetch product docs for each favorite
        const favoriteProducts: Product[] = [];
        for (const favId of favoriteIds) {
          const productSnap = await getDoc(doc(db, "products", favId));
          if (productSnap.exists()) {
            const productData = productSnap.data() as Omit<Product, "id">;
            favoriteProducts.push({
              id: productSnap.id,
              ...productData,
            });
          }
        }

        setFavorites(favoriteProducts);
      } else {
        setFavorites([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <p className="text-white p-6">
        ⚠️ Please log in to see your favorites.
      </p>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">❤️ My Favorites</h1>
      {favorites.length === 0 ? (
        <p>No favorites yet. Add some from the catalog!</p>
      ) : (
        <ul className="space-y-4">
          {favorites.map((product) => (
            <li
              key={product.id}
              className="bg-gray-800 p-4 rounded flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl">{product.name}</h2>
                <p>${product.price}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
