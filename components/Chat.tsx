import styles from "@/styles/Chat.module.css";
import { useEffect, useRef, useState } from "react";

type Message = {
    id: string;
    text: React.ReactNode | string;
    type: "bot" | "user";
}

const EXAMPLES = [{ "text": "Hola", "label": "intro" }, { "text": "Como estás?", "label": "intro" }, { "text": "Quién sos?", "label": "intro" }, { "text": "Tengo una propuesta de trabajo para vos", "label": "newjob" }, { "text": "Te interesa cambiar de trabajo?", "label": "newjob" }, { "text": "Por donde te puedo contactar?", "label": "contact" }, { "text": "Quiero hablar con Federico", "label": "intro" }, { "text": "Te quiero mandar un mensaje", "label": "contact" }, { "text": "Por donde me puedo comunicar?", "label": "contact" }, { "text": "Tengo una duda", "label": "contact" }, { "text": "Estás buscando trabajo?", "label": "newjob" }, { "text": "Dónde trabajas?", "label": "experience" }, { "text": "Con qué tecnologías trabajas?", "label": "experience" }, { "text": "Con qué tecnologías tenes experiencia?", "label": "experience" }, { "text": "Estas escuchando propuestas?", "label": "newjob" }, { "text": "Sabes inglés?", "label": "language" }, { "text": "Qué idiomas sabés?", "label": "language" }, { "text": "Cuantos años de experiencia tenés?", "label": "experience" }, { "text": "Te interesa cambiar de trabajo?", "label": "newjob" }, { "text": "Cómo es tu LinkedIn?", "label": "contact" }, { "text": "Cómo es tu Github?", "label": "contact" }, { "text": "Cómo hiciste este chat?", "label": "chat" }, { "text": "Como funciona esto?", "label": "chat" }, { "text": "Que usaste para armar esta aplicación?", "label": "chat" }, { "text": "Te puedo hacer una consulta?", "label": "contact" }, { "text": "Cuales son tus redes?", "label": "contact" }, { "text": "Tenes curriculum?", "label": "contact" }, { "text": "Tenes CV?", "label": "contact" }, { "text": "Cuál es tu expectativa salarial?", "label": "contact" }, { "text": "Tenes perro?", "label": "unknown" }, { "text": "Cuál es tu hobby?", "label": "unknown" }, { "text": "Conoces a chatGPT?", "label": "unknown" }, { "text": "Hablame sobre la vida", "label": "unknown" }, { "text": "Dónde estas trabajando?", "label": "newjob" }, { "text": "Cúal es tu empleo actual?", "label": "newjob" }, { "text": "Donde trabajas?", "label": "newjob" }];

const ANSWERS = {
    intro: (<p>Hi, I&apos;m <b>Chatbot</b>. I&apos;m here to help you with your questions about the company.</p>),
    default: (<p>Sorry, I don&apos;t understand. Please try again.</p>),
};

const API_KEY = 'jYKXqYE7lXtSzOjehma8L1LMDlec4d4yU0FNQkL2';


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
    const [question, setQuestion] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (container.current) {
            container.current.scrollTo(0, container.current.scrollHeight)
        }
    }, [messages]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (question === "") return;
        if (loading) return;

        setLoading(true);
        setQuestion("");
        setMessages(
            (messages) => messages.concat({
                id: new Date().getTime().toString(),
                text: question,
                type: "user"
            })
        );

        const { classifications } = await fetch('https://api.cohere.ai/classify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Cohere-Version': '2022-12-06'
            },
            body: JSON.stringify({
                model: 'large',
                inputs: [question],
                examples: EXAMPLES,
            })
        }).then(res => res.json());

        const prediction: string = classifications[0].prediction;
        let confidence = classifications[0].labels[prediction].confidence * 100;
        confidence = Math.round(confidence)

        setLoading(false);

        setMessages(
            (messages) => messages.concat({
                id: new Date().getTime().toString(),
                text: `Tu pregunta es de tipo ${prediction} con un ${confidence}% de confianza`,
                type: "bot"
            })
        );

        setMessages(
            (messages) => messages.concat({
                id: new Date().getTime().toString(),
                text: ANSWERS[prediction as keyof typeof ANSWERS] || ANSWERS.default,
                type: "bot"
            })
        );

    }


    return (
        <div className={styles.container}>
            <h1>Chat</h1>
            <div className={styles.chat}>
                <div ref={container} className={styles.messagesContainer}>
                    {messages.map((message) => (
                        <div key={message.id} className={`${styles.message} ${message.type === 'bot' ? styles.bot : styles.user}`}>
                            <div>{message.text}</div>
                        </div>
                    ))}
                </div>
                <form className={styles.formSend} onSubmit={handleSubmit}>
                    <input
                        className={styles.inputSend} type="text"
                        placeholder="Hola! Quien eres?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                    <button
                        className={styles.buttonSend}
                        type="submit"
                    >↩</button>
                </form>
            </div>
        </div>
    )

}

export default Chat;
