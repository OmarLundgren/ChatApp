import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

interface ChatMessage {
    user: string;
    message: string;
    timestamp: string;
}
function Chat() {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [messageInput, setMessageInput] = useState('');

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('/chatHub').withAutomaticReconnect().build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            // 3. Starta anslutningen
            connection.start()
                .then(() => {
                    console.log("Ansluten till chatten!");

                    // 4. Lyssna på händelser från servern (Task 2)
                    connection.on("ReceiveMessage", (user: string, message: string, timestamp: string) => {
                        setMessages(prev => [...prev, { user, message, timestamp }]);
                    });

                    connection.on("UserStatus", (status: string) => {
                        console.log("Systemmeddelande:", status);
                    });
                })
                .catch(e => console.log("Anslutning misslyckades: ", e));
        }
    }, [connection]);

  return (
      <div style={{ padding: '20px' }}>

          <input
              placeholder="Skriv ett meddelande..."
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
          >
          </input>
      </div>
  );
}



export default Chat;