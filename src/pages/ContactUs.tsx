import { useState, type ChangeEvent, type FormEvent } from 'react';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        emailAddress: '',
        subject: '',
        message: '',
    });

    const [status, setStatus] = useState('');

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        // Correct endpoint
        const endpoint = 'https://repairpro.com.au/repair_api/sendEmail.php';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            // Safely read response text (PHP may not return JSON on errors)
            const text = await response.text();

            if (response.ok) {
                setStatus('success');
                setFormData({
                    fullName: '',
                    phoneNumber: '',
                    emailAddress: '',
                    subject: '',
                    message: '',
                });
            } else {
                setStatus(`error: ${text}`);
            }

        } catch (error) {
            console.error('Fetch Error:', error);
            setStatus('error: Network error or server connection issue.');
        }
    };

    return (
        <section className="w-full bg-white pt-28 pb-20 px-4">
            <div className="max-w-3xl mx-auto text-center">

                <h1 className="text-4xl font-bold text-black mb-8">Contact Us</h1>

                <p className="text-gray-600 text-lg mb-10">
                    Have a question? Need a quote? Our team is here to help — reach out anytime.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6 text-left">

                    <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 p-4 rounded-xl"
                        placeholder="Full Name"
                    />

                    <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-4 rounded-xl"
                        placeholder="Phone Number"
                    />

                    <input
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleChange}
                        required
                        type="email"
                        className="w-full border border-gray-300 p-4 rounded-xl"
                        placeholder="Email Address"
                    />

                    <input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 p-4 rounded-xl"
                        placeholder="Subject / Service Inquiry"
                    />

                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 p-4 rounded-xl h-32"
                        placeholder="Your Message"
                    ></textarea>

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full bg-black text-white py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
                    >
                        {status === 'submitting' ? 'Sending...' : 'Send Message'}
                    </button>

                    {status === 'success' && (
                        <p className="text-green-600 font-bold">Message sent successfully!</p>
                    )}

                    {status.startsWith('error') && (
                        <p className="text-red-600 font-bold">
                            Failed to send message: {status.substring(7)}
                        </p>
                    )}

                </form>
            </div>
        </section>
    );
};

export default ContactUs;
