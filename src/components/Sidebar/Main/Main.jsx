import React, { useState } from "react";
import "./Main.css";
import { assets } from "../../../assets/assets";

// Helper: Decode HTML entities like &gt; back to >, &lt; to <, etc.
const decodeHTMLEntities = (str) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};

// Helper: Filter response text from Gemini
const filterResponse = (text) => {
  if (!text) return "";

  let filtered = text;

  // 1) Decode entities first (so &gt; → >)
  filtered = decodeHTMLEntities(filtered);

  // 2) Replace Markdown-style code blocks ```...``` with CODE BLOCK markers
  filtered = filtered.replace(/```[\s\S]*?```/g, (match) => {
    const innerCode = match.replace(/```/g, "").trim();
    return `\n\nCODE BLOCK:\n${innerCode}\n\n`;
  });

  // 3) Trim leading/trailing whitespace
  filtered = filtered.trim();

  // 4) Replace multiple empty lines with max two
  filtered = filtered.replace(/\n{3,}/g, "\n\n");

  // 5) Escape any real HTML tags to avoid XSS
  filtered = filtered
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return filtered;
};

const Main = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY";

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      const data = await res.json();

      if (data && data.candidates && data.candidates.length > 0) {
        const textResponse = data.candidates[0].content.parts[0].text;
        const cleanedResponse = filterResponse(textResponse);
        setResponse(cleanedResponse);
      } else {
        setResponse("No response from the model.");
      }
    } catch (err) {
      console.error(err);
      setResponse("Error fetching response. Check console.");
    }
    setLoading(false);
  };

  const quickPrompts = [
    {
      text: "Suggest beautiful places to see on an upcoming road trip",
      icon: assets.compass_icon,
    },
    {
      text: "Briefly summarize this concept: urban planning",
      icon: assets.bulb_icon,
    },
    {
      text: "Brainstorm team bonding activities for our work retreat",
      icon: assets.message_icon,
    },
    {
      text: "Improve the readability of the following code",
      icon: assets.code_icon,
    },
  ];

  return (
    <main className="main">
      <header className="nav">
        <p>Gemini</p>
        <img src={assets.user_icon} alt="User" />
      </header>

      <section className="main-container">
        <div className="greet">
          <p>
            <span>Hello, Dev.</span>
          </p>
          <p>How can I help you today?</p>
        </div>

        <div className="cards">
          {quickPrompts.map(({ text, icon }, idx) => (
            <div key={idx} className="card" onClick={() => setPrompt(text)}>
              <p>{text}</p>
              <img src={icon} alt="" />
            </div>
          ))}
        </div>

        <footer className="main-bottom">
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter a prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <div>
              <img src={assets.gallery_icon} alt="Gallery" />
              <img src={assets.mic_icon} alt="Mic" />
              <img
                src={assets.send_icon}
                alt="Send"
                onClick={handleSend}
                className="send-icon"
              />
            </div>
          </div>

          {loading && <p className="bottom-info">Loading...</p>}

          {response && (
            <div className="response-box fade-in">
              <h4>Gemini Response:</h4>
              <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                {response}
              </pre>
            </div>
          )}

          <p className="bottom-info">
            Gemini is a large multimodal model that can accept images and text
            as input, and generate text as output. It is designed to be helpful,
            honest, and harmless.
          </p>
        </footer>
      </section>
    </main>
  );
};

export default Main;
 