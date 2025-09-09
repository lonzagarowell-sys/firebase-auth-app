// src/pages/Upload.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  onSnapshot,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

interface UploadedFile {
  id: string;
  url: string;
  createdAt: any;
  uid: string;
}

export default function Upload() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  const CLOUD_NAME = "dijbiwcbo"; // Your Cloudinary cloud name
  const UPLOAD_PRESET = "react_upload"; // Your unsigned preset

  // Load previously uploaded files from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "uploads"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const list: UploadedFile[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<UploadedFile, "id">),
        }));
        setFiles(list);
        setSnapshotError(null);
      },
      (error) => {
        console.error("Firestore snapshot error:", error);
        setSnapshotError(
          "Cannot load uploaded files yet. Index may still be building."
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle Cloudinary upload + Firestore
  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Cloudinary upload failed: " + errorText);
      }

      const data = await res.json();
      if (!data.secure_url) throw new Error("Cloudinary upload failed");

      setUploadedUrl(data.secure_url);

      // Save metadata to Firestore
      await addDoc(collection(db, "uploads"), {
        url: data.secure_url,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });

      setFile(null);
      setProgress(100);
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 text-white p-8 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">📤 Upload File</h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 block w-full border border-white/30 bg-white/10 text-white placeholder-gray-300 p-2 rounded"
        />

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-6 py-2 w-full rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {uploading ? `Uploading... ${progress}%` : "Upload"}
        </button>

        {uploading && (
          <div className="w-full bg-white/20 rounded h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {uploadedUrl && (
          <div className="mt-6 text-center">
            <p className="font-semibold">Uploaded File:</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 underline break-all"
            >
              {uploadedUrl}
            </a>
            <br />
            {uploadedUrl.match(/\.(jpeg|jpg|png|gif)$/) && (
              <img
                src={uploadedUrl}
                alt="Uploaded preview"
                className="mt-4 w-full rounded-lg shadow"
              />
            )}
          </div>
        )}

        {snapshotError && (
          <p className="mt-4 text-red-400 text-center">{snapshotError}</p>
        )}

        {/* Previously uploaded files */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {files.map((f) => (
            <div
              key={f.id}
              className="bg-white/10 backdrop-blur-md p-2 rounded shadow hover:shadow-lg transition"
            >
              <img src={f.url} alt="upload" className="rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
