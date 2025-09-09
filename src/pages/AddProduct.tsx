import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "products"), { name, price });
    setName("");
    setPrice(0);
    alert("Product added!");
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">➕ Add Product</h1>
      <form onSubmit={handleAdd} className="space-y-4">
        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded text-black w-full"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="p-2 rounded text-black w-full"
        />
        <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
          Add
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
