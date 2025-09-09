import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface FileData {
  id: string;
  url: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

export default function FileList() {
  const [files, setFiles] = useState<FileData[]>([]);

  useEffect(() => {
    const q = query(collection(db, "files"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFiles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FileData[]);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Uploaded Files</h2>

      {files.length === 0 ? (
        <p className="text-gray-600">No files uploaded yet.</p>
      ) : (
        <ul className="space-y-4">
          {files.map((file) => (
            <li
              key={file.id}
              className="border p-3 rounded-lg flex flex-col space-y-2"
            >
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {file.url}
              </a>

              {/* Show preview if image */}
              {file.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/) && (
                <img
                  src={file.url}
                  alt="Uploaded"
                  className="rounded shadow max-h-48"
                />
              )}

              <span className="text-sm text-gray-500">
                Uploaded:{" "}
                {file.createdAt
                  ? new Date(file.createdAt.seconds * 1000).toLocaleString()
                  : "N/A"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
