import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

type Message = {
  content: React.ReactNode; 
  sender: 'bot' | 'user';
};

const SimpleBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { content: "Hi! 👋 Welcome to RepairPro. How can we help you today?", sender: "bot" }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleOptionClick = (option: string) => {
    // 1. User Message
    setMessages((prev) => [...prev, { content: option, sender: "user" }]);

    // 2. Bot Logic
    setTimeout(() => {
      let responseContent: React.ReactNode = "";

      // ✅ CHANGE 1: The Bot Response now has a Real Button inside it
      if (option === "Get a Price Quote") {
        responseContent = (
          <div>
            <p className="mb-2">For an accurate price, please click the button below to select your device:</p>
            
            <a 
              href="/repair-a-device" 
              className="btn btn-danger w-100 fw-bold shadow-sm mb-2"
              style={{ borderRadius: '20px' }}
            >
              Start Repair
            </a>
            
            <div className="small text-muted">
              This will guide you through your specific device model instantly.
            </div>
          </div>
        );
      } 
      
      else if (option === "Locations") {
        responseContent = (
          <div>
            <p className="mb-2">Tap a location to open Google Maps:</p>
            <div className="d-flex flex-column gap-2">
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Repair+Pro+Melbourne+Central+300+Lonsdale+St"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none text-dark p-2 bg-white border rounded shadow-sm d-flex align-items-center gap-2"
              >
                <span className="fs-4">📍</span>
                <div style={{ lineHeight: '1.2' }}>
                  <strong>Melbourne Central</strong>
                  <div className="small text-muted">Shop LG66 (Lower Ground)</div>
                </div>
              </a>

              <a 
                href="https://www.google.com/maps/search/?api=1&query=Repair+Pro+Springvale+46-58+Buckingham+Ave"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none text-dark p-2 bg-white border rounded shadow-sm d-flex align-items-center gap-2"
              >
                <span className="fs-4">📍</span>
                <div style={{ lineHeight: '1.2' }}>
                  <strong>Springvale</strong>
                  <div className="small text-muted">Kiosk C1, Shopping Centre</div>
                </div>
              </a>

              <a 
                href="https://www.google.com/maps/search/?api=1&query=Repair+Pro+Chelsea+450+Nepean+Hwy"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none text-dark p-2 bg-white border rounded shadow-sm d-flex align-items-center gap-2"
              >
                <span className="fs-4">📍</span>
                <div style={{ lineHeight: '1.2' }}>
                  <strong>Chelsea</strong>
                  <div className="small text-muted">Shop 10, 450 Nepean Hwy</div>
                </div>
              </a>
            </div>
          </div>
        );
      } 
      
      else if (option === "Contact Us") {
        responseContent = (
          <div>
            <p className="mb-2">You can reach us directly at:</p>
            <div className="mb-2">
                <a href="tel:0426090099" className="text-decoration-none text-dark fw-bold">
                    📞 0426 09 00 99
                </a>
            </div>
            <div>
                <a href="mailto:hello@repairpro.com.au" className="text-decoration-none text-dark">
                    ✉️ hello@repairpro.com.au
                </a>
            </div>
          </div>
        );
      } 
      
      else if (option === "Hours") {
        responseContent = (
          <div>
            <div className="mb-2">
              <strong>📍 Melbourne Central:</strong><br/>
              Mon-Sun: 10am - 7pm<br/>
              <span className="text-muted small">(Thu/Fri until 9pm)</span>
            </div>
            <div>
              <strong>📍 Springvale & Chelsea:</strong><br/>
              Mon-Sun: 10am - 5:30pm
            </div>
          </div>
        );
      }

      setMessages((prev) => [...prev, { content: responseContent, sender: "bot" }]);
    }, 600);
  };

  return (
    <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 9999 }}>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="card shadow-lg mb-3" style={{ width: '350px', height: '520px', border: 'none', borderRadius: '15px' }}>
          
          {/* Header */}
          <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center py-3" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-robot fs-5"></i>
              <strong>Repair Pro Support</strong>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="btn text-white p-0 border-0" 
              aria-label="Close"
            ><i className="bi bi-x-lg"></i></button>
          </div>

          {/* Chat Body */}
          <div className="card-body bg-light overflow-auto d-flex flex-column gap-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-4 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-danger text-white align-self-end rounded-bottom-right-0' 
                    : 'bg-white text-dark align-self-start rounded-bottom-left-0 border'
                }`}
                style={{ maxWidth: '85%', fontSize: '0.95rem' }}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer (Menu) */}
          <div className="card-footer bg-white border-top-0 p-3">
            <p className="text-muted small mb-2 text-center">Select an option:</p>
            <div className="d-grid gap-2">
              
              {/* ✅ CHANGE 2: Reverted to a normal Chat Button */}
              <button 
                className="btn btn-danger rounded-pill py-2 shadow-sm d-flex align-items-center justify-content-center gap-2" 
                onClick={() => handleOptionClick("Get a Price Quote")}
              >
                <i className="bi bi-currency-dollar"></i> Get a Price Quote
              </button>
              
              <button 
                className="btn btn-outline-secondary rounded-pill py-2 d-flex align-items-center justify-content-center gap-2" 
                onClick={() => handleOptionClick("Locations")}
              >
                <i className="bi bi-geo-alt-fill text-danger"></i> Locations
              </button>

              <div className="d-flex gap-2">
                 <button 
                  className="btn btn-outline-secondary rounded-pill py-2 flex-grow-1 d-flex align-items-center justify-content-center gap-2" 
                  onClick={() => handleOptionClick("Hours")}
                >
                  <i className="bi bi-clock-fill text-danger"></i> Hours
                </button>
                <button 
                  className="btn btn-outline-secondary rounded-pill py-2 flex-grow-1 d-flex align-items-center justify-content-center gap-2" 
                  onClick={() => handleOptionClick("Contact Us")}
                >
                  <i className="bi bi-telephone-fill text-danger"></i> Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-danger rounded-circle shadow-lg d-flex align-items-center justify-content-center"
        style={{ width: '60px', height: '60px', transition: 'transform 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <i className="bi bi-x-lg fs-4"></i> : <i className="bi bi-chat-dots-fill fs-3"></i>}
      </button>
    </div>
  );
};

export default SimpleBot;