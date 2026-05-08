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
    const [userStatus, setUserStatus] = useState<string[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const username = sessionStorage.getItem('username') ?? 'Anonym'; 
    const [teacherInput, setTeacherInput] = useState('');
    const [teacherMessages, setTeacherMessages] = useState<ChatMessage[]>([]);
    const role = sessionStorage.getItem('role') ?? 'user';
    const [teacherIndicator, setTeacherIndicator] = useState('');
    const [userTypingIndicator, setUserTypingIndicator] = useState('');



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
            .withUrl(`/chatHub?username=${username}&role=${role}`)
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
                    connection.on("ReceiveTeacherMessage", (sender: string, message: string, timestamp: string) => {
                        setTeacherMessages(prev => [...prev, { sender, message, timestamp }]);
                    });

                    connection.on("UserStatus", (status: string) => {
                        setUserStatus(prev => [...prev, status]);
                    });
                    connection.on("TeacherTyping", (status: string, user: string) => {
                        setTeacherIndicator(`${status}`);
                    });
                    connection.on("UserTyping", (status: string, user: string) => {
                        setUserTypingIndicator(`${status}`);
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
            await connection.invoke("SendMessage", messageInput);
        }
        catch (err) {
            console.error(err);
        }
        setMessageInput(''); 

    }

    async function SendTeacherMessage(e: React.FormEvent) {
        e.preventDefault();        

        if (!connection) return;
        try {
            await connection.invoke("SendTeacherMessage", teacherInput);
        }
        catch (err) {
            console.error(err);
        }
        setTeacherInput(''); 
    }

    function handleTeacherTyping() {
        connection?.invoke("UpdateTeacherTyping", true);
    }

    function handleTeacherStoppedTyping() {
        connection?.invoke("UpdateTeacherTyping", false);
    }
    function handleTyping() {
        connection?.invoke("UpdateUserTyping", true);    
    }   

    function handleStoppedTyping() {
        connection?.invoke("UpdateUserTyping", false);
    }


    return (

        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} >
            <div style={{ display: "flex", flexDirection: "column", height: "500px", width: "60vw", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden"}}>
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
                    {userStatus.length > 0 && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", margin: "12px 0" }}>
                            <div style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                background: "none",
                                color: "#666",
                                fontSize: "13px",
                                textAlign: "center",
                                fontStyle: "italic"
                            }}>
                                {userStatus[userStatus.length - 1]}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Inputfält */}
                <form onSubmit={SendMessage} style={{ display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid #e5e7eb" }}>
                    <input
                        onKeyUp={handleTyping}
                        onBlur={handleStoppedTyping}
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


            {/* Lärare */} 
            <div style={{ display: "flex", flexDirection: "column", height: "500px", width: "30vw", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", background: '#534AB7 ' }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {teacherMessages.map((teacherMsg) => {
                        const isMine = teacherMsg.sender === username;
                        return (
                            <div key={teacherMsg.timestamp + teacherMsg.sender} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                                <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", gap: "3px" }}>
                                    {!isMine && <span style={{ fontSize: "12px", color: "rgb(205 205 205)" }}>{teacherMsg.sender}</span>}
                                    <div style={{
                                        padding: "9px 13px",
                                        borderRadius: "16px",
                                        borderBottomRightRadius: isMine ? "4px" : "16px",
                                        borderBottomLeftRadius: isMine ? "16px" : "4px",
                                        background: isMine ? "#000000" : "#f3f4f6",
                                        color: isMine ? "#fff" : "#111",
                                        fontSize: "14px",
                                        lineHeight: "1.5",
                                    }}>
                                        {teacherMsg.message}
                                    </div>
                                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>{teacherMsg.timestamp}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {role === "teacher" && (
                    <form onSubmit={SendTeacherMessage} style={{ display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid #e5e7eb" }}>
                        <input
                            onKeyUp={handleTeacherTyping}
                            onBlur={handleTeacherStoppedTyping}
                            value={teacherInput}
                            onChange={(e) => setTeacherInput(e.target.value)}
                            placeholder="Skriv ett meddelande..."
                            style={{ flex: 1, padding: "9px 14px", borderRadius: "999px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
                        />
                        <button type="submit" style={{ padding: "9px 18px", borderRadius: "999px",background:'#000000', color: "#fff", border: "none", cursor: "pointer", fontSize: "14px" }}>
                            Skicka
                        </button>
                    </form>
                )}
            </div>
        </div>
        

    );
}



export default Chat;