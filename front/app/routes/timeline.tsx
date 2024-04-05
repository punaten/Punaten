import { Box, Button } from "@yamada-ui/react";
import { useEffect, useState } from "react";

// Defining the Timeline type outside the component is a good practice.
type Timeline = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export default function App() {
  const [timeline, setTimeline] = useState<Timeline[]>([]);

  // It's a good practice to handle errors in async operations
  async function getTimeline() {
    try {
      const response = await fetch(
        "https://punaten-uvb7exztca-an.a.run.app/video",
        {
          method: "GET",
          headers: {},
        }
      );

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
    <div
      style={{
        maxWidth: "800px",
        margin: "auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <Box
        color={["cinnamon", "caramel"]}
        fontSize={"3rem"}
        textAlign={"center"}
      >
        <h1 style={{ marginBottom: "40px" }}>タイムライン</h1>
      </Box>
      <div>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {timeline.map((t) => (
            <li
              key={t.id}
              style={{
                margin: "10px 0",
                padding: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <video
                src={"https://punaten.storage.googleapis.com/" + t.name}
                controls
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "10px",
                }}
              ></video>
              <p style={{ marginTop: "10px" }}>{t.created_at}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
