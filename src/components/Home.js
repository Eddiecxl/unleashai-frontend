import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import welcomeGif from '../assets/globalvaccine.jpg';
import uoaLogo from '../assets/uoa.png';

function Home() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [openFAQIndexes, setOpenFAQIndexes] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeUnit = (unit) => {
    return unit < 10 ? `0${unit}` : unit;
  };

  const handleNavigateToChatbot = () => {
    navigate('/chatbot');
  };

  const toggleFAQ = (index) => {
    if (openFAQIndexes.includes(index)) {
      setOpenFAQIndexes(openFAQIndexes.filter((i) => i !== index));
    } else {
      setOpenFAQIndexes([...openFAQIndexes, index]);
    }
  };

  function FAQItem({ faq, isOpen, toggleFAQ }) {
    return (
      <div className={`faq-item ${isOpen ? "open" : ""}`} onClick={toggleFAQ}>
        <div className="faq-header">
          <div className="faq-question">{faq.question}</div>
          <span className={`faq-arrow ${isOpen ? "open" : ""}`}>▼</span>
        </div>
        {isOpen && <div className="faq-answer">{faq.answer}</div>}
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          The New <span className="highlight">Chatbot</span>
        </h1>
        <p className="hero-description">
          Explore our powerful vaccine chatbot.
        </p>
        <button className="try-it-button" onClick={handleNavigateToChatbot}>
          Try it
        </button>
      </section>

      {/* Dashboard Preview and Clock */}
      <section className="dashboard-preview">
        <img src={welcomeGif} alt="Dashboard preview" className="dashboard-image" />

        {/* Clock Section */}
        <div className="clock-container">
          <div className="clock-row">
            {['Hours', 'Minutes', 'Seconds'].map((unit) => {
              const value =
                unit === 'Hours'
                  ? formatTimeUnit(time.getHours())
                  : unit === 'Minutes'
                  ? formatTimeUnit(time.getMinutes())
                  : formatTimeUnit(time.getSeconds());
              return (
                <div className="clock-unit" key={unit}>
                  <div className="time-label">{unit}</div>
                  <div className="number">{value}</div>
                </div>
              );
            })}
          </div>

          <p className="quote">
            "Every tick of the clock marks a life lost, a dream unfulfilled, a goodbye never spoken. 
            Cherish the time you have—it is more fragile than it seems."
          </p>
        </div>
      </section>

      {/* Trusted Companies Section */}
      <section className="trusted-companies">
        <p className="trusted-title">Trusted by the best companies</p>
        <div className="trusted-logos">
          <img src={uoaLogo} alt="University of Awesome" className="logo" />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2 className="faq-title">Frequently asked questions</h2>
        <div className="faq-container">
          {[
            {
              question: "How do I contact customer support if I have a question or issue?",
              answer: "You can reach out to our customer support team via email or phone. Please visit our contact page for detailed information. To report an issue, please proceed to Chatbot → Report.",
            },
            {
              question: "Can I return the vaccine if it doesn't meet my expectations?",
              answer: "Unfortunately, vaccines cannot be returned once used.",
            },
            {
              question: "What makes your chatbot stand out from others in the market?",
              answer: "Our chatbot is built with cutting-edge technology and powered by a team of experts to provide exceptional accuracy and efficiency.",
            },
            {
              question: "Is there a limitation on the chatbot?",
              answer: "Yes, the free version of our chatbot has some limitations. To unlock advanced features, consider upgrading to the premium version.",
            },
          ].map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openFAQIndexes.includes(index)}
              toggleFAQ={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-links">
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
        </div>
        <div className="copyright">
          © UnleashedTeam 2025
        </div>
        <div className="contact">
          <a href="/about">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}

export default Home;