// src/pages/ProductDetails.tsx

import FeedbackForm from "../components/FeedbackForm";
import FeedbackList from "../components/FeedbackList";

const ProductDetails = () => {
  const productId = "productId1"; // ← replace with dynamic product ID

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">💻 Laptop</h1>
      <p className="mb-6">$999 - High performance laptop</p>

      <FeedbackForm productId={productId} />
      <FeedbackList productId={productId} />
    </div>
  );
};

export default ProductDetails;
