import React from 'react';
import './Contact.css';

function Contact() {
	return (
		<div className="contact">
			<div className="contact-item">
				<img src="https://fonts.gstatic.com/s/i/materialicons/mail/v21/24px.svg" alt="mail icon" className="contact-icon" />
				<a href="mailto:you@example.com">you@example.com</a>
			</div>
			<div className="contact-item">
				<img src="https://fonts.gstatic.com/s/i/materialicons/phone/v15/24px.svg" alt="phone icon" className="contact-icon" />
				<a href="tel:+1234567890">+1 234 567 890</a>
			</div>
			<div className="contact-item">
				<img src="https://fonts.gstatic.com/s/i/materialicons/location_on/v20/24px.svg" alt="location icon" className="contact-icon" />
				<span>123 Street, City</span>
			</div>
			<div className="contact-item">
				<img src="https://fonts.gstatic.com/s/i/materialicons/schedule/v13/24px.svg" alt="time icon" className="contact-icon" />
				<span>Mon–Fri 9:00–17:00</span>
			</div>
		</div>
	);
}

export default Contact;