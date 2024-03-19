import { Button } from "@yamada-ui/react";
import { useEffect, useState } from "react";

// Defining the Timeline type outside the component is a good practice.
type Timeline = {
  id: string,
  name: string,
  user_id: string,
  created_at: string,
};

export default function App() {
  const [timeline, setTimeline] = useState<Timeline[]>([]);

  // It's a good practice to handle errors in async operations
  async function getTimeline() {
    try {
      const response = await fetch("https://punaten-uvb7exztca-an.a.run.app/video", {
        method: "GET",
        headers: {},
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: Timeline[] = await response.json();
      setTimeline(data);
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    }
  }

  // Using an empty dependency array to ensure this effect runs once on mount.
    useEffect(() => {
      getTimeline();
    }, []);

  return (
    <div>
      <h1>Time Line</h1>
      <ul>
        {timeline.map((t) => (
          // Using `t.id` as key for more stability compared to index
          <li key={t.id}>
            <video src={"https://punaten.storage.googleapis.com/" + t.name} controls style={{width:400}}></video>
            <p>{t.created_at}</p>
          </li>
        ))}
      </ul>
      {/* <Button onClick={getTimeline}>Get Timeline</Button> */}
    </div>
  );
}
