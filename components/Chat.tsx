import styles from "@/styles/Chat.module.css";
import { useEffect, useRef, useState } from "react";


type Message = {
    id: string;
    text: React.ReactNode | string;
    type: "bot" | "user";
}

const EXAMPLES = [{"text": "Hola", "label": "intro"}, {"text": "Como estás?", "label": "intro"}, {"text": "Quién sos?", "label": "intro"}, {"text": "Tengo una propuesta de trabajo para vos", "label": "newjob"}, {"text": "Te interesa cambiar de trabajo?", "label": "newjob"}, {"text": "Por donde te puedo contactar?", "label": "contact"}, {"text": "Quiero hablar con Federico", "label": "intro"}, {"text": "Te quiero mandar un mensaje", "label": "contact"}, {"text": "Por donde me puedo comunicar?", "label": "contact"}, {"text": "Tengo una duda", "label": "contact"}, {"text": "Estás buscando trabajo?", "label": "newjob"}, {"text": "Dónde trabajas?", "label": "experience"}, {"text": "Con qué tecnologías trabajas?", "label": "experience"}, {"text": "Con qué tecnologías tenes experiencia?", "label": "experience"}, {"text": "Estas escuchando propuestas?", "label": "newjob"}, {"text": "Sabes inglés?", "label": "language"}, {"text": "Qué idiomas sabés?", "label": "language"}, {"text": "Cuantos años de experiencia tenés?", "label": "experience"}, {"text": "Te interesa cambiar de trabajo?", "label": "newjob"}, {"text": "Cómo es tu LinkedIn?", "label": "contact"}, {"text": "Cómo es tu Github?", "label": "contact"}, {"text": "Cómo hiciste este chat?", "label": "chat"}, {"text": "Como funciona esto?", "label": "chat"}, {"text": "Que usaste para armar esta aplicación?", "label": "chat"}, {"text": "Te puedo hacer una consulta?", "label": "contact"}, {"text": "Cuales son tus redes?", "label": "contact"}, {"text": "Tenes curriculum?", "label": "experience"}, {"text": "Tenes CV?", "label": "experience"}, {"text": "Cuál es tu expectativa salarial?", "label": "contact"}, {"text": "Tenes perro?", "label": "unknown"}, {"text": "Cuál es tu hobby?", "label": "unknown"}, {"text": "Conoces a chatGPT?", "label": "unknown"}, {"text": "Hablame sobre la vida", "label": "unknown"}, {"text": "Dónde estas trabajando?", "label": "intro"}, {"text": "Cúal es tu empleo actual?", "label": "intro"}, {"text": "Donde trabajas?", "label": "intro"}, {"text": "Experiencia previa", "label": "experience"}, {"text": "Donde trabajaste antes?", "label": "experience"}, {"text": "Como fue tu carrera?", "label": "experience"}];

const ANSWERS = {

    intro: (<p>Soy Federico Navós. Tengo 22 años. Soy Ingeniero en Sistemas y Desarrollador Fullstack. Tengo 3 años de experiencia como desarrollador, tanto en aplicaciones web como en análisis de datos. Actualmente trabajo en <a href="http://gptrading.com.ar/newweb/" target="_blank" rel="noreferrer">GP Trading</a> como Desarrollador Python.</p>), 

    experience: (
    <>
        <p>Desde 2021 a la actualidad, me encuentro trabajando en GP Trading como Desarrollador Python, haciendo automatización de informes, scraping de datos y desarrollo de estrategias de trading.</p>
        <p>He trabajado en NEORIS como Desarrollador Fullstack, utilizando tecnologías como Angular, entorno .NET y SQL Server. Podés encontrar más información sobre mi carrera <a href="https://drive.google.com/uc?export=download&id=1vdsco5P4G9WOPWEyO2gt2ckJH2zPhdQF">descargando mi CV aquí</a>.</p>
        <p>También me gusta desarrollar proyectos personales para aprender nuevas tecnologías. Puedes encontrar más información en mi <a href="https://github.com/fedenavos" target="_blank" rel="noreferrer">Github</a> o en <a href="https://federiconavos.netlify.app/" target="_blank" rel="noreferrer">mi página de portfolio</a>.</p>
    </>),

    newjob: (<p>No estoy activamente buscando trabajo en este momento, pero estoy dispuesto a escuchar cualquier propuesta. Podés contactarme a través de mi <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> o enviarme un <a href="mailto:federiconavos@gmail.com">email</a> y con gusto te responderé.</p>),

    contact: (<p>Podés contactarme a través de mi <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> o enviarme un <a href="mailto:federiconavos@gmail.com">email</a>.</p>),

    language: (<p>Me manejo muy bien con el inglés, tanto hablado como escrito. Tengo aprobado el First Certificate in English (FCE) con una calificación de 179/190, es decir, que tengo un nivel B2.</p>),

    chat: (
    <>
        <p>Este chat-bot fue desarrollado con <a href="https://nextjs.org/" target="_blank" rel="noreferrer">Next.js</a> y <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">TypeScript</a> para el front-end.</p>
        <p>Para la clasificación de preguntas utilicé la API de <a href="https://cohere.ai/" target="_blank" rel="noreferrer">Cohere</a>, que brinda herramientas IA gratis para desarrolladores. Entrené el dataset con preguntas y gracias a esto puedo clasificar cada uno de tus mensajes para encontrar la mejor respuesta 🙂.</p>
        <p>El código fuente lo podés encontrar en <a href="https://github.com/fedenavos/chat-bot" target="_blank" rel="noreferrer">Github</a>.</p>
    </>),

    default: (<p>Lo siento, soy una IA un poco limitada 😅 y no entiendo algunas preguntas. Podés preguntarme sobre mi experiencia, mi disponibilidad para trabajar, cómo contactarme, entre otras cosas.</p>),

};

const API_KEY = 'jYKXqYE7lXtSzOjehma8L1LMDlec4d4yU0FNQkL2';


const Chat = () => {

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hola! Soy un bot preparado para contestar algunas preguntas sobre Federico. Haceme una pregunta!",
            type: "bot"
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
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_COHERE_API_KEY}`,
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

        // setMessages(
        //     (messages) => messages.concat({
        //         id: new Date().getTime().toString(),
        //         text: `Tu pregunta es de tipo ${prediction} con un ${confidence}% de confianza`,
        //         type: "bot"
        //     })
        // );

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
                            <p>{message.text}</p>
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
