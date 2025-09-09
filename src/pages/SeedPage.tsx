// src/pages/SeedPage.tsx
import { useEffect } from "react";
import { seedProducts } from "../utils/seedProducts";

export default function SeedPage() {
  useEffect(() => {
    const runSeed = async () => {
      await seedProducts();
      alert("✅ Products seeded successfully!");
    };
    runSeed();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold">Seeding Products...</h1>
      <p className="mt-2 text-gray-400">Please wait, this will auto-run once.</p>
    </div>
  );
}
