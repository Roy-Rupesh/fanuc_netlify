import React from 'react';
import '../assets/css/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer>
      <div>
        <span>&copy;2023 MachineWise Monitor&Improve</span> |{' '}
        <a href="/">About Us</a> |{' '}
        <a href="/contact-us">Contact Us</a>
      </div>
    </footer>
  );
};

export default Footer;



