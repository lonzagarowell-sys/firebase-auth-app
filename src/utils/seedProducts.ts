// src/utils/seedProducts.ts
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const sampleProducts = [
  { name: "Laptop", price: 999 },
  { name: "Headphones", price: 199 },
  { name: "Smartphone", price: 699 },
  { name: "Keyboard", price: 99 },
  { name: "Mouse", price: 49 },
];

export async function seedProducts() {
  try {
    const productsRef = collection(db, "products");

    for (const product of sampleProducts) {
      await addDoc(productsRef, product);
    }

    console.log("✅ Products seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  }
}
