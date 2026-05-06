import React, { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useNavigate } from 'react-router-dom';


interface ChatMessage {
    sender: string;
    message: string;
    timestamp: string;
}


function Chat() {
    const navigate = useNavigate();
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const username = sessionStorage.getItem('username') ?? 'Anonym'; 



    useEffect(() => {
        if (username === 'Anonym') {
            navigate('/');   // skicka tillbaka till login om inget namn finns
        }
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('/chatHub')
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            // 3. Starta anslutningen
            connection.start()
                .then(() => {
                    console.log("Ansluten till chatten!");

                    // 4. Lyssna på händelser från servern (Task 2)
                    connection.on("ReceiveMessage", (sender: string, message: string, timestamp: string) => {
                        setMessages(prev => [...prev, { sender, message, timestamp }]);
                    });

                    connection.on("UserStatus", (status: string) => {
                        console.log("Systemmeddelande:", status);
                    });
                })
                .catch(e => console.log("Anslutning misslyckades: ", e));
        }
    }, [connection]);

    async function SendMessage(e: React.FormEvent) 
    {
        e.preventDefault();         // ← stoppar page refresh

        if (!connection) return;
        try {
            await connection.invoke("SendMessage", username, messageInput);
        }
        catch (err) {
            console.error(err);
        }

    }
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "500px", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
            {/* Meddelanden */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {messages.map((msg) => {
                    const isMine = msg.sender === username;
                    return (
                        <div key={msg.timestamp + msg.sender} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                            <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", gap: "3px" }}>
                                {!isMine && <span style={{ fontSize: "12px", color: "#6b7280" }}>{msg.sender}</span>}
                                <div style={{
                                    padding: "9px 13px",
                                    borderRadius: "16px",
                                    borderBottomRightRadius: isMine ? "4px" : "16px",
                                    borderBottomLeftRadius: isMine ? "16px" : "4px",
                                    background: isMine ? "#534AB7" : "#f3f4f6",
                                    color: isMine ? "#fff" : "#111",
                                    fontSize: "14px",
                                    lineHeight: "1.5",
                                }}>
                                    {msg.message}
                                </div>
                                <span style={{ fontSize: "11px", color: "#9ca3af" }}>{msg.timestamp}</span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Inputfält */}
            <form onSubmit={SendMessage} style={{ display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid #e5e7eb" }}>
                <input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Skriv ett meddelande..."
                    style={{ flex: 1, padding: "9px 14px", borderRadius: "999px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
                />
                <button type="submit" style={{ padding: "9px 18px", borderRadius: "999px", background: "#534AB7", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px" }}>
                    Skicka
                </button>
            </form>
        </div>
    );
}



export default Chat;