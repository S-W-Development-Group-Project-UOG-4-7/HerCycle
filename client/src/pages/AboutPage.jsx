import { Heart, BookOpen, Users, Award } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 text-white">
            {/* Hero Section */}
            <section className="py-20 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center mb-6">
                        <Heart className="w-20 h-20 text-pink-400 animate-pulse" fill="currentColor" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        About HerCycle
                    </h1>
                    <p className="text-xl md:text-2xl text-purple-200 mb-8">
                        Empowering women through education, health awareness, and community support
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-6 bg-white/10 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">Our Mission</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-8 rounded-2xl backdrop-blur-md border border-white/20">
                            <BookOpen className="w-12 h-12 text-pink-400 mb-4" />
                            <h3 className="text-2xl font-semibold mb-4">Education</h3>
                            <p className="text-purple-200">
                                Providing comprehensive courses on women's health, menstrual wellness, and reproductive health education.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-8 rounded-2xl backdrop-blur-md border border-white/20">
                            <Users className="w-12 h-12 text-purple-400 mb-4" />
                            <h3 className="text-2xl font-semibold mb-4">Community</h3>
                            <p className="text-purple-200">
                                Building a supportive community where women can learn, share experiences, and grow together.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500/20 to-pink-500/20 p-8 rounded-2xl backdrop-blur-md border border-white/20">
                            <Award className="w-12 h-12 text-blue-400 mb-4" />
                            <h3 className="text-2xl font-semibold mb-4">Empowerment</h3>
                            <p className="text-purple-200">
                                Empowering women with knowledge and tools to make informed decisions about their health and well-being.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-8">Our Story</h2>
                    <div className="space-y-6 text-lg text-purple-200">
                        <p>
                            HerCycle was founded with a simple yet powerful vision: to break down barriers to women's health education
                            and create a safe, supportive space for learning and growth.
                        </p>
                        <p>
                            We recognized that many women lack access to accurate, comprehensive information about their bodies,
                            menstrual health, and reproductive wellness. This knowledge gap can lead to unnecessary suffering,
                            confusion, and missed opportunities for early intervention.
                        </p>
                        <p>
                            Through our platform, we bring together expert-created courses, interactive learning materials,
                            and a supportive community to ensure every woman has the knowledge and confidence to take charge
                            of her health journey.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 px-6 bg-white/10 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-pink-400">Inclusivity</h3>
                            <p className="text-purple-200">
                                We believe health education should be accessible to all women, regardless of background, age, or circumstance.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-purple-400">Evidence-Based</h3>
                            <p className="text-purple-200">
                                Our courses are developed by healthcare professionals and backed by scientific research and medical expertise.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-blue-400">Privacy & Safety</h3>
                            <p className="text-purple-200">
                                We prioritize the privacy and safety of our users, providing a secure environment for learning and discussion.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-rose-400">Continuous Growth</h3>
                            <p className="text-purple-200">
                                We're committed to constantly improving our platform and expanding our course offerings to meet evolving needs.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
                    <p className="text-xl text-purple-200 mb-8">
                        Start your journey towards better health and wellness today
                    </p>
                    <button className="bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105">
                        Get Started
                    </button>
                </div>
            </section>
        </div>
    );
}
