import { useState } from "react";
import styles from "@/styles/Chat.module.css";

type Message = {
    id: string;
    text: string;
    type: 'bot' | 'user';
}

const Chat = () => {

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hola, soy un bot",
            type: "bot"
        },
        {
            id: "2",
            text: "Hola, soy un usuario",
            type: "user"
        },
    ]);

    return (
        <div className={styles.container}>
            <h1>Chat</h1>
            <div className={styles.chat}>
                <div className={styles.messagesContainer}>
                    {messages.map((message) => (
                        <div key={message.id} className={`${styles.message} ${message.type === 'bot' ? styles.bot : styles.user}`}>
                            <div>{message.text}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

}

export default Chat;
