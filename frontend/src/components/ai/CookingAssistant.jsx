import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, Send } from 'lucide-react';
import * as aiService from '../../services/aiService';

const MAX_MESSAGE_LENGTH = 500;

/**
 * Minimal markdown-lite renderer for AI replies: turns **bold** into <strong>
 * and lines starting with "*"/"-" into a real bullet list. The AI is asked
 * not to use markdown, but this is a safety net so a stray "**" never shows
 * up literally in the chat.
 */
const renderInlineBold = (text, keyPrefix) => {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-b-${i}`}>{part}</strong> : part
  );
};

const FormattedMessage = ({ text }) => {
  const lines = text.split('\n');
  const blocks = [];
  let currentList = [];

  const flushList = (key) => {
    if (currentList.length > 0) {
      blocks.push(
        <ul className="ai-message-bullet-list" key={`list-${key}`}>
          {currentList.map((item, i) => (
            <li key={i}>{renderInlineBold(item, `li-${key}-${i}`)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const bulletMatch = line.match(/^\s*[*-]\s+(.*)/);
    if (bulletMatch) {
      currentList.push(bulletMatch[1]);
      return;
    }
    flushList(idx);
    if (line.trim()) {
      blocks.push(<p key={`p-${idx}`}>{renderInlineBold(line, `p-${idx}`)}</p>);
    }
  });
  flushList('end');

  return <>{blocks}</>;
};

const QUICK_QUESTIONS = [
  { label: 'Ingredient Substitution', question: 'What ingredient substitutions would you recommend for this recipe?' },
  { label: 'Cooking Tips', question: 'Do you have any cooking tips for making this recipe well?' },
  { label: 'Make It Spicier', question: 'How can I make this recipe spicier?' },
  { label: 'Make It Healthier', question: 'How can I make this recipe healthier?' },
  { label: 'Beginner Tips', question: "I'm a beginner cook — any tips for making this recipe?" },
];

/**
 * CookingAssistant — a recipe-scoped AI chat modal.
 *
 * Conversation history lives only in this component's state by design
 * (per spec: no ChatHistory model yet). Closing the modal resets it.
 * Every message — typed or from a quick-question button — makes a real
 * request to POST /api/ai/cooking-guidance; nothing here is hardcoded.
 */
const CookingAssistant = ({ recipe, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi! I'm here to help you with ${recipe.title}. What would you like to know?` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const sendMessage = async (rawText) => {
    const text = rawText.trim();
    // Guards against empty submits and duplicate requests while one is in flight.
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const data = await aiService.getCookingGuidance(recipe._id, text);
      setMessages((prev) => [...prev, { role: 'ai', text: data.message }]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div
        className="ai-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`AI Cooking Guidance for ${recipe.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ai-modal-header">
          <div>
            <h2 className="ai-modal-title">
              <Bot size={20} aria-hidden="true" /> AI Cooking Guidance
            </h2>
            <p className="ai-modal-recipe-name">{recipe.title}</p>
          </div>
          <button className="ai-modal-close" onClick={onClose} aria-label="Close AI Cooking Guidance">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="ai-modal-messages">
          {messages.map((m, i) => (
            <div key={i} className={`ai-message ai-message-${m.role}`}>
              {m.role === 'ai' && <Bot size={16} className="ai-message-icon" aria-hidden="true" />}
              <div className="ai-message-text"><FormattedMessage text={m.text} /></div>
            </div>
          ))}

          {loading && (
            <div className="ai-message ai-message-ai ai-message-thinking">
              <Bot size={16} className="ai-message-icon" aria-hidden="true" />
              <p>AI is thinking...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && <div className="alert alert-error ai-modal-error">{error}</div>}

        <div className="ai-quick-questions">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q.label}
              type="button"
              className="ai-quick-btn"
              onClick={() => sendMessage(q.question)}
              disabled={loading}
            >
              {q.label}
            </button>
          ))}
        </div>

        <form className="ai-modal-input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-input ai-modal-input"
            placeholder="Ask something about this recipe..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label="Ask a question about this recipe"
          />
          <button
            type="submit"
            className="btn btn-primary ai-modal-send"
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CookingAssistant;