"use client";

import { useState, useRef } from "react";
import Message from "./message";

function getMessages() {
    if (typeof window !== "undefined") {
        const msg = localStorage.getItem("messages");
        return JSON.parse(msg) ?? [];
    }

    return [];
}

function setStorage(messages) {
    if (typeof window !== "undefined") {
        localStorage.setItem("messages", JSON.stringify(messages));
    }
}

export function ChatBadge() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState(getMessages());
    const [input, setInput] = useState("");
    const containerRef = useRef(null);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInput("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await res.json();

            if (data?.content) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.content },
                ]);
            }
            setStorage([
                ...newMessages,
                { role: "assistant", content: data.content },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "⚠️ Error reaching assistant." },
            ]);
        }

        // Scroll to bottom
        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTo(
                    0,
                    containerRef.current.scrollHeight,
                );
            }
        }, 100);
    };

    return (
        <>
            <div
                className="fixed bottom-5 right-5 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer shadow"
                onClick={toggleChat}
            >
                Chat
            </div>

            {isChatOpen && (
                <div
                    style={{ width: 400, height: 600 }}
                    className="fixed bottom-24 right-5 h-96 bg-white rounded shadow-xl flex flex-col overflow-hidden border border-gray-200"
                >
                    <div
                        ref={containerRef}
                        className="flex-1 p-3 overflow-y-auto text-sm space-y-2"
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`px-3 py-2 rounded-lg ${
                                        msg.role === "user"
                                            ? "bg-blue-100 text-blue-900"
                                            : "bg-gray-100 text-gray-800"
                                    } max-w-[80%]`}
                                >
                                    <Message content={msg.content} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-2 border-t flex">
                        <input
                            type="text"
                            className="flex-1 px-3 py-2 border rounded text-sm"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
