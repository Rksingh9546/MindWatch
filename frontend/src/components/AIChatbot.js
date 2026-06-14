import React, { useEffect, useRef, useState } from 'react';
import { sendChatMessage, getChatSuggestions } from '../services/api';

const WELCOME = {
  role: 'bot',
  text: "Hi! I'm **MindWatch AI**, your mental wellness assistant. Ask me about sleep, stress, activity, or your assessment results.",
};

function formatReply(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export default function AIChatbot({ embedded = false, onClose }) {
  const [open, setOpen] = useState(embedded);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    getChatSuggestions()
      .then((r) => setSuggestions(r.data.suggestions || []))
      .catch(() => setSuggestions([
        'How can I improve my sleep?',
        "I'm feeling stressed",
        'Explain my assessment',
      ]));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await sendChatMessage(msg);
      setMessages((m) => [...m, { role: 'bot', text: res.data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, I could not connect. Please check that the backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  const panel = (
    <div className={embedded ? 'chat-page-main h-100' : 'chat-panel'}>
      <div className="chat-header">
        <div className="chat-header-avatar">
          <i className="bi bi-robot" />
        </div>
        <div className="flex-grow-1">
          <div className="fw-bold">MindWatch AI</div>
          <small style={{ opacity: 0.85 }}>Wellness Assistant · Online</small>
        </div>
        {!embedded && (
          <button type="button" className="btn btn-sm text-white" style={{ background: 'rgba(255,255,255,0.2)' }} onClick={() => { setOpen(false); onClose?.(); }}>
            <i className="bi bi-x-lg" />
          </button>
        )}
      </div>

      {suggestions.length > 0 && messages.length <= 2 && (
        <div className="chat-suggestions">
          {suggestions.map((s) => (
            <button key={s} type="button" className="chat-suggestion-chip" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="chat-messages">
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="chat-bubble user">{m.text}</div>
          ) : (
            <div key={i} className="chat-bubble bot" dangerouslySetInnerHTML={{ __html: formatReply(m.text) }} />
          )
        )}
        {loading && (
          <div className="chat-typing">
            <span /><span /><span />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about wellness, sleep, stress..."
          disabled={loading}
        />
        <button type="submit" className="btn btn-mw-primary" disabled={loading || !input.trim()}>
          <i className="bi bi-send-fill" />
        </button>
      </form>
    </div>
  );

  if (embedded) return panel;

  return (
    <>
      {open && panel}
      <button
        type="button"
        className={`chat-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="AI Chat"
      >
        <i className={`bi ${open ? 'bi-x-lg' : 'bi-chat-dots-fill'}`} />
      </button>
    </>
  );
}
