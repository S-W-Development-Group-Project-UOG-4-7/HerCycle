import { useState } from 'react';
import { Mail, User, MessageSquare, Send, Loader, Phone, MapPin, Clock } from 'lucide-react';
import HeartLogo from '../components/HeartLogo';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResponseMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessageType('success');
                setResponseMessage(data.message);
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setMessageType('error');
                setResponseMessage(data.message || 'Failed to send message');
            }
        } catch {
            setMessageType('error');
            setResponseMessage('Unable to connect to server');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setResponseMessage(''), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/20 via-bg-dark to-secondary/20 py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-20 w-80 h-80 bg-secondary rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <HeartLogo className="w-16 h-16 animate-pulse" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
                            Get In Touch
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form & Info Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800">
                            <h2 className="text-3xl font-black text-white mb-6">Send Us a Message</h2>

                            {responseMessage && (
                                <div className={`mb-6 p-4 rounded-xl ${messageType === 'success'
                                    ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                                    : 'bg-red-500/20 border border-red-500/50 text-red-300'
                                    }`}>
                                    {responseMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="flex items-center gap-2 text-white font-bold mb-2">
                                        <User size={18} className="text-primary" />
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-primary focus:outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="flex items-center gap-2 text-white font-bold mb-2">
                                        <Mail size={18} className="text-secondary" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-secondary focus:outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="flex items-center gap-2 text-white font-bold mb-2">
                                        <MessageSquare size={18} className="text-primary" />
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-primary focus:outline-none transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="flex items-center gap-2 text-white font-bold mb-2">
                                        <MessageSquare size={18} className="text-secondary" />
                                        Message
                                    </label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-secondary focus:outline-none transition-all resize-none"
                                        placeholder="Tell us what's on your mind..."
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-6">Contact Information</h2>
                                <p className="text-slate-400 mb-8">
                                    We're here to help and answer any question you might have. We look forward to hearing from you!
                                </p>
                            </div>

                            {/* Contact Cards */}
                            <div className="space-y-4">
                                {/* Email Card */}
                                <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 hover:border-primary/50 transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/20 p-3 rounded-xl">
                                            <Mail className="text-primary" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold mb-1">Email Us</h3>
                                            <p className="text-slate-400 text-sm mb-2">Our team will respond within 24 hours</p>
                                            <a href="mailto:support@hercycle.com" className="text-primary hover:underline">
                                                support@hercycle.com
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone Card */}
                                <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 hover:border-secondary/50 transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-secondary/20 p-3 rounded-xl">
                                            <Phone className="text-secondary" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold mb-1">Call Us</h3>
                                            <p className="text-slate-400 text-sm mb-2">Mon-Fri from 9am to 6pm</p>
                                            <a href="tel:+1234567890" className="text-secondary hover:underline">
                                                +1 (234) 567-890
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Card */}
                                <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 hover:border-primary/50 transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/20 p-3 rounded-xl">
                                            <MapPin className="text-primary" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold mb-1">Visit Us</h3>
                                            <p className="text-slate-400 text-sm">
                                                123 Health Education Ave<br />
                                                Wellness City, HC 12345
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hours Card */}
                                <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 hover:border-secondary/50 transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-secondary/20 p-3 rounded-xl">
                                            <Clock className="text-secondary" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold mb-1">Business Hours</h3>
                                            <p className="text-slate-400 text-sm">
                                                Monday - Friday: 9:00 AM - 6:00 PM<br />
                                                Saturday: 10:00 AM - 4:00 PM<br />
                                                Sunday: Closed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Quick Links */}
            <section className="py-16 px-6 bg-slate-900/30">
                <div className="max-w-7xl mx-auto text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Looking for quick answers?</h3>
                    <p className="text-slate-400 mb-6">Check out our frequently asked questions</p>
                    <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3 rounded-xl transition-all">
                        View FAQs
                    </button>
                </div>
            </section>
        </div>
    );
}
