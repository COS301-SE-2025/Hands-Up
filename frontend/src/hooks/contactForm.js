import { useState } from "react";

export default function useContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoLink = `mailto:tmkdt.cos301@gmail.com?subject=Support Request&body=${encodeURIComponent(
      `From: ${email}\n\n${message}`
    )}`;
    window.location.href = mailtoLink;
  };

  return { email, setEmail, message, setMessage, handleSubmit };
}
