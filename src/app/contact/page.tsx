"use client";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import React from "react";
import { useState } from "react";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(
      message + "\n\nFrom: " + name + " <" + email + ">"
    );
    window.location.href = `mailto:avilashg05@gmail.com?subject=${subject}&body=${body}`;
  }
  return (
    <div className="py-10 space-y-8 max-w-2xl">
      <Reveal>
        <h1 className="text-4xl font-bold">Contact</h1>
      </Reveal>
      <Reveal>
        <p className="opacity-80">
          Let’s build something! I’m based in India (IST).
        </p>
      </Reveal>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl px-3 py-2 bg-transparent border border-black/20 dark:border-white/20"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl px-3 py-2 bg-transparent border border-black/20 dark:border-white/20"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full rounded-2xl px-3 py-2 bg-transparent border border-black/20 dark:border-white/20"
            required
          />
        </div>
        <Button type="submit" size="lg">
          Send message
        </Button>
      </form>

      <div className="pt-6">
        <p className="text-sm opacity-70">Find me online:</p>
        <ul className="flex gap-4 mt-2 text-sm underline underline-offset-4">
          <li>
            <a href="http://github.com/Avilash2001" target="_blank">
              GitHub
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/avilashg/" target="_blank">
              LinkedIn
            </a>
          </li>
          <li>
            <a href="https://x.com/AvilashGhosh6" target="_blank">
              X
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ContactUs;
