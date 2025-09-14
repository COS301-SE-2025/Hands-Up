import useContactForm from "../hooks/contactForm";

export function SupportSection() {
  const { email, setEmail, message, setMessage, handleSubmit } = useContactForm();

  return (
    <div className="recognizer-support">
      <p className="recognizer-support-text">Need help? Contact support:</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
        />

        <textarea
          required
          placeholder="Write your message..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-2 border rounded"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
