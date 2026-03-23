import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

const ContactUs = () => {
    // 1. Grab the URL parameter
    const [searchParams] = useSearchParams();
    const paramSubject = searchParams.get('subject');

    // 2. Map the URL parameter to a clean, professional subject line
    let defaultSubject = 'General Inquiry';
    if (paramSubject === 'franchising') defaultSubject = 'Franchise Inquiry';
    if (paramSubject === 'training') defaultSubject = 'Training & Courses';

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        emailAddress: '',
        subject: defaultSubject,
        message: '',
    });

    const [status, setStatus] = useState('');
    
    // Custom state for our new dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const subjectOptions = [
        "General Inquiry",
        "Franchise Inquiry",
        "Training & Courses",
        "Device Repair Quote",
        "Corporate Partnership"
    ];

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Custom handler for our new dropdown
    const handleSubjectSelect = (option: string) => {
        setFormData({ ...formData, subject: option });
        setIsDropdownOpen(false); // Close the menu after clicking
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        const endpoint = 'https://repairpro.com.au/repair_api/sendEmail.php';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const text = await response.text();

            if (response.ok) {
                setStatus('success');
                setFormData({
                    fullName: '',
                    phoneNumber: '',
                    emailAddress: '',
                    subject: formData.subject, // Keeps their selected subject after sending
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

                    {/* 1. CUSTOM SUBJECT DROPDOWN (Bypasses Safari's ugly default) */}
                    <div className="relative">
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full border border-gray-300 p-4 rounded-xl bg-white text-gray-900 focus:border-black outline-none transition-all cursor-pointer font-medium flex justify-between items-center"
                        >
                            <span>{formData.subject}</span>
                            <svg 
                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {/* Dropdown Menu Options */}
                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                {subjectOptions.map((option) => (
                                    <div
                                        key={option}
                                        onClick={() => handleSubjectSelect(option)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            formData.subject === option ? 'bg-gray-50 font-bold text-black' : 'text-gray-700'
                                        }`}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. FULL NAME */}
                    <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 p-4 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="Full Name"
                    />

                    {/* 3. EMAIL ADDRESS */}
                    <input
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleChange}
                        required
                        type="email"
                        className="w-full border border-gray-300 p-4 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="Email Address"
                    />

                    {/* 4. PHONE NUMBER */}
                    <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-4 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="Phone Number (Optional)"
                    />

                    {/* 5. MESSAGE */}
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 p-4 rounded-xl h-32 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-y"
                        placeholder="How can we help you?"
                    ></textarea>

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full bg-black text-white py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition disabled:opacity-70"
                    >
                        {status === 'submitting' ? 'Sending...' : 'Send Message'}
                    </button>

                    {status === 'success' && (
                        <p className="text-green-600 font-bold text-center mt-4">Message sent successfully! We will be in touch soon.</p>
                    )}

                    {status.startsWith('error') && (
                        <p className="text-red-600 font-bold text-center mt-4">
                            Failed to send message: {status.substring(7)}
                        </p>
                    )}

                </form>
            </div>
        </section>
    );
};

export default ContactUs;