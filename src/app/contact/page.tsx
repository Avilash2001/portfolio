"use client";
import React, { useState } from "react";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    const data = {
      access_key: process.env.NEXT_PUBLIC_WEB_3_FORMS_API_KEY,
      ...formData,
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSuccessMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      setSuccessMessage("Error sending message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="text-white" size={24} />,
      title: "Email",
      value: "avilashghosh2001@gmail.com",
      link: "mailto:avilashghosh2001@gmail.com",
    },
    {
      icon: <Phone className="text-white" size={24} />,
      title: "Phone",
      value: "+91 70019 40069",
      link: "tel:+917001940069",
    },
    {
      icon: <MapPin className="text-white" size={24} />,
      title: "Location",
      value: "Kolkata, India",
      link: "#",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row w-full h-full gap-10 lg:gap-20 justify-between items-start lg:items-center px-4 sm:px-0 py-10 sm:pt-20 lg:mt-0 pb-20">
      <div className="flex flex-col gap-8 w-full lg:w-1/2">
        <div className="flex flex-col gap-4">
          <p className="text-4xl sm:text-6xl font-bold">
            Let&apos;s <span className="gradient-text">Connect.</span>
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            Whether you have a question, a project proposal, or just want to say
            hi, I&apos;ll try my best to get back to you!
          </p>
        </div>

        <div className="flex flex-col gap-6 mt-4">
          {contactInfo.map((item, index) => (
            <a
              href={item.link}
              key={index}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-[#FF01A2] transition-colors duration-300">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">{item.title}</span>
                <span className="text-lg font-medium group-hover:text-[#FF01A2] transition-colors duration-300">
                  {item.value}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-600 py-2 text-xl focus:border-[#FF01A2] focus:outline-none transition-colors duration-300"
              placeholder="John Doe"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Your Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-600 py-2 text-xl focus:border-[#FF01A2] focus:outline-none transition-colors duration-300"
              placeholder="john@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-600 py-2 text-xl focus:border-[#FF01A2] focus:outline-none transition-colors duration-300"
              placeholder="Project Inquiry"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Message
            </label>
            <textarea
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full bg-transparent border-b border-gray-600 py-2 text-xl resize-none focus:border-[#FF01A2] focus:outline-none transition-colors duration-300"
              placeholder="Tell me about your project..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 group relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#FFCA30] via-[#FF01A2] to-[#B94DDC] py-4 rounded-full text-white font-bold text-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="relative z-10 flex items-center gap-2">
                Sending... <Loader2 className="animate-spin" size={20} />
              </span>
            ) : (
              <span className="relative z-10 flex items-center gap-2">
                Send Message
                <Send
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            )}
          </button>
          {successMessage && (
            <p className="text-center text-green-400 mt-2 font-semibold">
              {successMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
