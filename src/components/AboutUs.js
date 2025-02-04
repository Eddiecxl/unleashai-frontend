import React, { useState } from 'react';
import './AboutUs.css';

function AboutUs() {
  const [activeCardIndex, setActiveCardIndex] = useState(null);

  const team = [
    {
      img: require('../assets/eddie.jpeg'),
      name: 'Eddie',
      role: 'Software Architect',
      quote: 'Turning ideas into reality, one line of code at a time.',
    },
    {
      img: require('../assets/raphael.jpeg'),
      name: 'Raphael',
      role: 'AI Specialist',
      quote: 'Empowering humanity with the magic of AI.',
    },
    {
      img: require('../assets/william.jpeg'),
      name: 'William',
      role: 'UI/UX Designer',
      quote: 'Designing experiences that inspire and connect.',
    },
    {
      img: require('../assets/ru.jpg'),
      name: 'R',
      role: 'Product Manager',
      quote: 'Ensuring every detail leads to the perfect product.',
    },
  ];

  const handleCardClick = (index) => {
    setActiveCardIndex(index === activeCardIndex ? null : index);
  };

  const handleBackgroundClick = () => {
    setActiveCardIndex(null);
  };

  return (
    <div className="aboutus-page" onClick={handleBackgroundClick}>
      {/* Header Section */}
      <div className={`aboutus-header ${activeCardIndex !== null ? 'blur-background' : ''}`}>
        <h1>About Us</h1>
        <p>Meet the passionate individuals shaping the future of technology with creativity and innovation.</p>
      </div>

      {/* Story Section */}
      <section className={`aboutus-story ${activeCardIndex !== null ? 'blur-background' : ''}`}>
        <h2>Our Story</h2>
        <p>
          At UnleashedTeam, our journey began with a dream to create transformative tools that empower individuals and
          organizations. Driven by innovation and collaboration, we turned our vision into reality, overcoming
          countless challenges and milestones. Today, we continue to explore new possibilities, united by a shared
          purpose: to make a positive impact in the world.
        </p>
      </section>

      {/* Team Section */}
      <div className="aboutus-content">
        {team.map((member, index) => (
          <div
            key={index}
            className={`aboutus-row ${index === activeCardIndex ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(index);
            }}
          >
            <div className="aboutus-row-inner">
              <div className="aboutus-row-front">
                <img src={member.img} alt={member.name} className="aboutus-image" />
                <h3 className="aboutus-name">{member.name}</h3>
                <h4 className="aboutus-role">{member.role}</h4>
              </div>
              <div className="aboutus-row-back">
                <p className="aboutus-quote">{member.quote}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <section className={`aboutus-contact ${activeCardIndex !== null ? 'blur-background' : ''}`}>
        <h2>Contact Us</h2>
        <p>Email: contact@unleashedteam.com</p>
        <p>Phone: +64 (222) 00-0001</p>
        <p>Location: 111 Unleashed Street, Water City, Mars</p>
      </section>
    </div>
  );
}

export default AboutUs;