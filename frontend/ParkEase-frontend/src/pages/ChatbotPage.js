import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { sendChatMessage, getAvailableSpots, getMyBookings, createComplaint } from '../utils/api';
import { Navbar } from '../components';
import BottomNav from '../components/BottomNav';

const SUGGESTIONS = [
  { icon: '🅿️', label: 'Find Spots', action: 'find_spots' },
  { icon: '📋', label: 'My Bookings', action: 'my_bookings' },
  { icon: '💰', label: 'Pricing', action: 'pricing' },
  { icon: '📞', label: 'Support', action: 'support' },
  { icon: '📝', label: 'File Complaint', action: 'complaint' },
];

const renderFormattedText = (text) => {
  const lines = String(text || '').split('\n');

  return lines.map((line, lineIndex) => {
    const parts = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<React.Fragment key={`t-${lineIndex}-${key++}`}>{line.slice(lastIndex, match.index)}</React.Fragment>);
      }
      parts.push(<strong key={`b-${lineIndex}-${key++}`}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(<React.Fragment key={`t-${lineIndex}-${key++}`}>{line.slice(lastIndex)}</React.Fragment>);
    }

    return (
      <React.Fragment key={`line-${lineIndex}`}>
        {parts.length > 0 ? parts : line}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const ChatbotPage = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: `Hello${user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! 👋\n\nI'm ParkBot, your parking assistant. How can I help you today?` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [complaintMode, setComplaintMode] = useState(false);
  const [complaintStep, setComplaintStep] = useState(0);
  const [complaintData, setComplaintData] = useState({ subject: '', description: '' });
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text, time: new Date() }]);
  };

  const handleSuggestion = async (action) => {
    switch (action) {
      case 'find_spots':
        addMessage('user', '🅿️ Find available spots');
        try {
          const res = await getAvailableSpots();
          const spots = res.data || [];
          addMessage('bot', spots.length > 0
            ? `Found ${spots.length} available spots! 🎉\n\nWould you like to book one?`
            : 'No spots available right now. Try again shortly! 😊');
        } catch { addMessage('bot', 'Unable to check spots right now. Please try again.'); }
        break;

      case 'my_bookings':
        addMessage('user', '📋 Show my bookings');
        try {
          const res = await getMyBookings();
          const bookings = res.data || [];
          if (bookings.length === 0) {
            addMessage('bot', 'You have no bookings yet. Tap "Book" to reserve a spot! 🚗');
          } else {
            const recent = bookings.slice(0, 3);
            const lines = recent.map((b) =>
              `🎫 ${b.ticketNumber || '#' + b.bookingId} — ${b.spotLabel || b.slot || 'N/A'} — ${b.status}`
            ).join('\n');
            addMessage('bot', `Your recent bookings:\n\n${lines}\n\nTap below to see all bookings.`);
          }
        } catch { addMessage('bot', 'Unable to fetch bookings. Please try again.'); }
        break;

      case 'pricing':
        addMessage('user', '💰 Pricing info');
        addMessage('bot', '💰 **ParkEase Pricing**\n\n🕐 Base Rate: ₹75/hour\n⚡ Surge: Up to 1.5x during peak hours\n⏰ Overstay: 2x rate per extra hour\n\nPrices may vary based on demand.');
        break;

      case 'support':
        addMessage('user', '📞 Contact support');
        addMessage('bot', '📞 **Support Contact**\n\n📧 Email: support@parkease.in\n📱 Phone: +91 98765 43210\n🕐 Hours: 24/7\n\nOr file a complaint from this chat!');
        break;

      case 'complaint':
        addMessage('user', '📝 File a complaint');
        addMessage('bot', 'I\'ll help you file a complaint. 📝\n\nPlease type the **subject** of your complaint:');
        setComplaintMode(true);
        setComplaintStep(1);
        setComplaintData({ subject: '', description: '' });
        break;

      default:
        break;
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    // Handle complaint flow
    if (complaintMode) {
      addMessage('user', text);
      if (complaintStep === 1) {
        setComplaintData((prev) => ({ ...prev, subject: text }));
        setComplaintStep(2);
        addMessage('bot', `Subject: "${text}"\n\nNow please describe the issue in detail:`);
        return;
      }
      if (complaintStep === 2) {
        setComplaintData((prev) => ({ ...prev, description: text }));
        addMessage('bot', 'Submitting your complaint... ⏳');
        try {
          await createComplaint({ subject: complaintData.subject, description: text });
          addMessage('bot', '✅ Complaint submitted successfully! Our team will review it shortly.\n\nYou can track your complaints from Profile → My Complaints.');
        } catch {
          addMessage('bot', '❌ Failed to submit complaint. Please try again from the Complaints page.');
        }
        setComplaintMode(false);
        setComplaintStep(0);
        return;
      }
    }

    addMessage('user', text);
    setLoading(true);

    try {
      const res = await sendChatMessage(text, user?.userId);
      const reply = res.data?.reply || res.data?.message || 'I\'m not sure how to help with that. Try the suggestions below!';
      addMessage('bot', reply);
    } catch {
      addMessage('bot', 'Sorry, I\'m having trouble right now. Please try again! 🤖');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-page-wrapper">
      <Navbar />
      <div className="mobile-content d-flex flex-column" style={{ height: 'calc(100vh - 130px)' }}>
        {/* Chat Messages */}
        <div ref={chatRef} className="flex-grow-1 overflow-auto px-3 py-2" style={{ paddingBottom: '160px' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
              {msg.sender === 'bot' && (
                <div className="me-2 flex-shrink-0" style={{
                  width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #00C4B4, #2C3E50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.9rem'
                }}>🤖</div>
              )}
              <div style={{
                maxWidth: '80%', padding: '10px 14px', borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.sender === 'user' ? 'linear-gradient(135deg, #00C4B4, #009688)' : '#f1f5f9',
                color: msg.sender === 'user' ? '#fff' : '#1e293b', fontSize: '0.9rem', lineHeight: 1.45,
              }}>{renderFormattedText(msg.text)}</div>
            </div>
          ))}
          {loading && (
            <div className="d-flex mb-3">
              <div className="me-2" style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #00C4B4, #2C3E50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>🤖</div>
              <div style={{ padding: '10px 14px', background: '#f1f5f9', borderRadius: '16px', color: '#64748b' }}>
                <span className="spinner-grow spinner-grow-sm me-1"></span> Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="px-3 py-2 border-top bg-white">
          <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {SUGGESTIONS.map((s) => (
              <button key={s.action} className="btn btn-sm btn-outline-secondary flex-shrink-0"
                style={{ borderRadius: '20px', fontSize: '0.8rem' }}
                onClick={() => handleSuggestion(s.action)}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="d-flex gap-2 mt-2">
            <input type="text" className="form-control" placeholder={complaintMode ? (complaintStep === 1 ? 'Enter complaint subject...' : 'Describe the issue...') : 'Type a message...'}
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
            <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
              <i className="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ChatbotPage;
