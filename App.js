import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

function App() {
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const res = await axios.get(`${API}/messages/`);
    setMessages(res.data);
  };

  const sendMessage = async () => {
    if (!username || !content) return;
    await axios.post(`${API}/messages/`, { username, content });
    setContent("");
    fetchMessages();
  };

  const performSearch = async () => {
    const res = await axios.post(`${API}/search/`, { query: search });
    setSearchResults(res.data);
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto" }}>
      <h2> Deep Search Chat App</h2>
      <input
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        placeholder="Type a message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage} style={{ marginLeft: 10 }}>
        Send
      </button>

      <h3 style={{ marginTop: 20 }}>Search Messages</h3>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && performSearch()}
        style={{ width: "80%" }}
      />
      <button onClick={performSearch} style={{ marginLeft: 10 }}>
        Search
      </button>

      <h3>All Messages</h3>
      {messages.map((m) => (
        <div key={m.id}>
          <b>{m.username}:</b> {m.content}
        </div>
      ))}

      {searchResults.length > 0 && (
        <>
          <h3> Search Results</h3>
          {searchResults.map((m) => (
            <div key={m.id}>
              <b>{m.username}:</b> {m.content} <i>({m.score}%)</i>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
