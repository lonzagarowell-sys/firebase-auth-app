import { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // ✅ Use existing Firebase app
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

// Canvas-provided variable
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// Custom auth hook
const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signInAnonymously(auth)
      .then((cred) => setUser(cred.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
};

export default function FileUpload() {
  const { user, loading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const uploadFileToCloudinary = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const cloudName = "YOUR_CLOUD_NAME";
      const preset = "YOUR_UPLOAD_PRESET";
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) setProgress((e.loaded / e.total) * 100);
      });
      xhr.onload = () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).secure_url);
        else reject(new Error("Upload failed"));
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    const url = await uploadFileToCloudinary(file);
    setUploadedUrl(url);
    await addDoc(collection(db, "artifacts", appId, "public", "data", "files"), {
      url,
      uid: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={handleUpload}>Upload</button>
      {progress > 0 && <p>Progress: {Math.round(progress)}%</p>}
      {uploadedUrl && <a href={uploadedUrl}>View uploaded file</a>}
    </div>
  );
}
