import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage, getChatWelcome, getAvailableSpots, getMyBookings, getPricing } from '../utils/api';

const ChatbotPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const defaultSuggestions = [
    { label: 'Find a spot', action: 'find_spot' },
    { label: 'Check my bookings', action: 'my_bookings' },
    { label: 'View pricing', action: 'pricing' },
    { label: 'How to park?', action: 'help' },
  ];

  useEffect(() => {
    loadWelcome();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadWelcome = async () => {
    try {
      const res = await getChatWelcome();
      addBotMessage(res.data.reply, res.data.suggestions || defaultSuggestions);
    } catch {
      addBotMessage(
        "👋 Hello! I'm **ParkBot**, your friendly parking assistant.\n\nI can help you find parking spots, check your bookings, and answer questions about our parking service.\n\nWhat would you like to do today?",
        defaultSuggestions
      );
    }
  };

  const addBotMessage = (text, suggestions = []) => {
    const sug = suggestions.length > 0 ? suggestions : defaultSuggestions;
    setMessages((prev) => [...prev, { role: 'bot', text, suggestions: sug }]);
  };

  const renderText = (text) => {
    // Handle newlines and bold rendering
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      });
      return (
        <React.Fragment key={lineIdx}>
          {rendered}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  // Handle quick actions with frontend fallbacks
  const handleQuickAction = async (action, label) => {
    setMessages((prev) => [...prev, { role: 'user', text: label }]);
    setLoading(true);

    try {
      switch (action) {
        case 'find_spot': {
          try {
            const res = await getAvailableSpots();
            const spots = res.data || [];
            if (spots.length === 0) {
              addBotMessage(
                "😔 Oh no! All parking spots are currently occupied.\n\nPlease check back in a few minutes, or try a different zone.",
                [{ label: 'Try again', action: 'find_spot' }, { label: 'View pricing' }]
              );
            } else {
              const zones = {};
              spots.forEach(s => {
                const z = s.zone || 'General';
                zones[z] = (zones[z] || 0) + 1;
              });
              const zoneText = Object.entries(zones).map(([z, c]) => `• **${z}**: ${c} spots`).join('\n');
              addBotMessage(
                `🎉 Great news! We have **${spots.length} parking spots** available right now!\n\n${zoneText}\n\nWould you like to book a spot?`,
                [{ label: '📍 Book now', action: 'book' }, { label: 'Show pricing' }, { label: 'Main menu' }]
              );
            }
          } catch {
            // Fallback if API fails
            addBotMessage(
              "🅿️ To find available parking spots, tap the **Book** button below. You'll see all available spots with their locations and prices.\n\nWant me to take you there?",
              [{ label: '📍 Book a spot', action: 'book' }, { label: 'Main menu' }]
            );
          }
          break;
        }

        case 'my_bookings': {
          try {
            const res = await getMyBookings();
            const bookings = res.data || [];
            const active = bookings.filter(b => ['PAID', 'CHECKED_IN', 'PENDING'].includes(b.status));
            if (active.length === 0) {
              addBotMessage(
                "📋 You don't have any active parking bookings at the moment.\n\nWould you like to reserve a spot?",
                [{ label: '📍 Find a spot', action: 'find_spot' }, { label: 'Main menu' }]
              );
            } else {
              const b = active[0];
              addBotMessage(
                `✅ You have an **active booking**!\n\n• **Spot**: ${b.spotLabel || b.spot || '--'}\n• **Status**: ${b.status}\n• **Vehicle**: ${b.vehicleNumber || '--'}\n• **Amount**: ₹${b.totalAmount || 0}\n\nNeed anything else?`,
                [{ label: '🎫 View ticket', action: 'view_ticket' }, { label: 'Main menu' }]
              );
            }
          } catch {
            addBotMessage(
              "📋 To check your bookings, go to the **Bookings** tab in the app. You'll see all your past and current reservations there.\n\nWant me to show you?",
              [{ label: '📋 My Bookings', action: 'go_bookings' }, { label: 'Main menu' }]
            );
          }
          break;
        }

        case 'pricing': {
          try {
            const res = await getPricing();
            const pricing = res.data;
            addBotMessage(
              `💰 Here are our current parking rates:\n\n• **Base Rate**: ₹${pricing?.basePrice || 50}/hour\n• **Surge**: ${pricing?.surgeActive ? '⚡ Active (+' + (pricing.surgeMultiplier || 1.5) + 'x)' : '✅ No surge right now'}\n\n💡 **Tip**: Book during off-peak hours (before 10 AM or after 8 PM) for best rates!`,
              [{ label: '📍 Book now', action: 'book' }, { label: 'Main menu' }]
            );
          } catch {
            addBotMessage(
              "💰 Our parking rates are very competitive!\n\n• **Standard Rate**: Around ₹50-100/hour depending on the zone\n• **Special Zones**: EV charging spots may have different rates\n\nYou'll see exact prices when you select a spot to book.",
              [{ label: '📍 See spots & prices', action: 'book' }, { label: 'Main menu' }]
            );
          }
          break;
        }

        case 'help': {
          addBotMessage(
            "🚗 **How to use ParkEase:**\n\n1️⃣ Tap **Book** to see available spots\n2️⃣ Choose your spot and parking duration\n3️⃣ Complete payment\n4️⃣ Show your **QR code** at the entry gate\n5️⃣ Park your vehicle at your assigned spot\n6️⃣ Scan QR again when leaving\n\nThat's it! Easy parking, every time. 🎉",
            [{ label: '📍 Find a spot', action: 'find_spot' }, { label: 'View pricing', action: 'pricing' }, { label: 'More help' }]
          );
          break;
        }

        case 'book': {
          navigate('/book');
          addBotMessage(
            "🚀 Taking you to the booking page now! Select your preferred spot and complete the reservation.",
            []
          );
          break;
        }

        case 'view_ticket':
        case 'go_bookings': {
          navigate('/my-bookings');
          addBotMessage(
            "📋 Opening your bookings...",
            []
          );
          break;
        }

        default: {
          // Fall back to backend chatbot
          await handleBackendChat(label);
        }
      }
    } catch (err) {
      addBotMessage(
        "I'm having a little trouble right now. 🤔\n\nYou can still use the app directly — the **Book** and **Bookings** buttons in the menu will help you!",
        defaultSuggestions
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackendChat = async (message) => {
    try {
      const res = await sendChatMessage(message);
      addBotMessage(res.data.reply, res.data.suggestions || []);
    } catch (err) {
      // User-friendly error messages based on the type of question
      const msg = message.toLowerCase();
      if (msg.includes('spot') || msg.includes('available') || msg.includes('find')) {
        addBotMessage(
          "🅿️ Looking for parking? Tap **Book** in the app menu to see all available spots with their locations and prices!",
          [{ label: '📍 Book a spot', action: 'book' }, { label: 'Main menu' }]
        );
      } else if (msg.includes('book') || msg.includes('my') || msg.includes('ticket')) {
        addBotMessage(
          "📋 You can view your bookings by tapping **Bookings** in the menu. All your active and past reservations are there!",
          [{ label: '📋 My Bookings', action: 'go_bookings' }, { label: 'Main menu' }]
        );
      } else if (msg.includes('price') || msg.includes('cost') || msg.includes('rate')) {
        addBotMessage(
          "💰 Pricing is shown when you select a spot to book. Rates typically range from ₹50-100 per hour depending on the zone.",
          [{ label: '📍 See prices', action: 'book' }, { label: 'Main menu' }]
        );
      } else {
        addBotMessage(
          "I'm here to help! 😊 Here are some things I can assist you with:",
          defaultSuggestions
        );
      }
    }
  };

  const handleSend = async (text, action) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    // If there's an action, use the quick action handler
    if (action) {
      await handleQuickAction(action, msg);
      return;
    }

    // Otherwise send to backend
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    await handleBackendChat(msg);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chat-header">
        <button
          className="btn btn-link text-white p-0 me-3"
          onClick={() => navigate(-1)}
          style={{ fontSize: '1.4rem', textDecoration: 'none' }}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <i className="bi bi-chat-dots-fill chat-header-icon"></i>
        <div>
          <h1>ParkBot</h1>
          <span>Your parking assistant</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            <div className="bubble-text">{renderText(msg.text)}</div>
            {msg.role === 'bot' && msg.suggestions?.length > 0 && (
              <div className="suggestions">
                {msg.suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-btn"
                    onClick={() => handleSend(s.label || s, s.action)}
                  >
                    {s.label || s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble bot">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
        >
          <i className="bi bi-send-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatbotPage;
