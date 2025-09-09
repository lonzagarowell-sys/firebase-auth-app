// src/pages/AdminProducts.tsx
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Real-time Firestore listener for products
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Admin Product Catalog</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="p-4 border rounded-lg shadow bg-white hover:shadow-md transition"
            >
              <p className="font-semibold text-lg">{p.name}</p>
              {p.description && (
                <p className="text-gray-600 text-sm">{p.description}</p>
              )}
              <p className="text-green-600 font-bold mt-1">${p.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
