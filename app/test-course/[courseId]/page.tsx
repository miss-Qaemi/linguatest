// app/test-course/[courseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TestPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");  // اینجا " رو بسته بودید

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message));
  }, [courseId]);

  return (
    <div className="p-8" dir="ltr">
      <h1 className="text-2xl font-bold mb-4">تست API</h1>
      <p>شناسه کورس: {courseId}</p>
      {error && <p className="text-red-500">خطا: {error}</p>}
      {data && (
        <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}