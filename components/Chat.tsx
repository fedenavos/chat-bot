import styles from "@/styles/Chat.module.css";
import { useEffect, useRef, useState } from "react";
// Font Awesome Icons
import { faAndroid, faAngular, faBitcoin, faCss3Alt, faGithub, faHtml5, faJsSquare, faLinkedin, faPython, faReact } from "@fortawesome/free-brands-svg-icons";
import { faChartLine, faCode, faDatabase, faDownload, faGamepad } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Components
import Message from "./Message";
// Examples
import { EXAMPLES } from "../data/EXAMPLES";


type Message = {
    id: string;
    content: React.ReactNode | string;
    type: "bot" | "user";
};


const Chat = () => {

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Hola 👋 Soy un bot preparado para contestar algunas preguntas sobre Federico. Haceme una pregunta!",
            type: "bot"
        },
    ]);

    const [question, setQuestion] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        container.current?.scrollTo(0, container.current.scrollHeight)
    }, [messages]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (question === "") return;
        if (loading) return;

        setLoading(true);
        setQuestion("");
        setMessages(
            (messages) =>
                messages.concat({
                    id: new Date().getTime().toString(),
                    content: question,
                    type: "user",
                })
        );

        const { classifications } = await fetch(
            "https://api.cohere.ai/classify",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_COHERE_API_KEY}`,
                    "Content-Type": "application/json",
                    "Cohere-Version": "2022-12-06",
                },
                body: JSON.stringify({
                    model: "large",
                    inputs: [question],
                    examples: EXAMPLES,
                }),
            }
        ).then((res) => res.json());

        const prediction: string = classifications[0].prediction;
        let confidence =
            classifications[0].labels[prediction].confidence * 100;
        confidence = Math.round(confidence);

        const response = ANSWERS[prediction as keyof typeof ANSWERS] || ANSWERS.default;
        sendMessages(response);
    }

    function sendMessages(response: JSX.Element | JSX.Element[]) {
        const DELAY = 3500;
        if (Array.isArray(response)) {
            const len = response.length;
            setTimeout(() => {
                setLoading(false);
            }, (len - 1) * DELAY);
            for (let i = 0; i < response.length; i++) {
                setTimeout(() => {
                    setMessages((messages) => messages.concat({
                        id: new Date().getTime().toString(),
                        content: response[i],
                        type: "bot",
                    })
                    );
                }, i * DELAY);
            }
        } else {
            setMessages((messages) => messages.concat({
                id: new Date().getTime().toString(),
                content: response,
                type: "bot",
            })
            );
            setLoading(false);
        }
    }


    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Chat-Bot</h1>
            <p className={styles.description}>
                Bot que responde preguntas sobre Federico Navós, utilizando <a href="https://cohere.ai/" target="_blank" rel="noreferrer">Cohere</a>.
            </p>
            <div className={styles.chat}>
                <div ref={container} className={styles.messagesContainer}>
                    {messages.map((message) => (
                        <div key={message.id} className={`${styles.message} ${message.type === 'bot' ? styles.bot : styles.user}`}>
                            {message.type === 'bot' ? <Message content={message.content} /> : message.content}
                        </div>
                    ))}
                    {
                        loading && (
                            <div className={styles.message}>
                                <div className={styles.loading}>
                                    <div className={styles.loadingDot}>.</div>
                                    <div className={styles.loadingDot}>.</div>
                                    <div className={styles.loadingDot}>.</div>
                                </div>
                            </div>
                        )
                    }
                </div>
                <form className={styles.formSend} onSubmit={handleSubmit}>
                    <input
                        className={styles.inputSend} type="text"
                        placeholder="Hola! Quien eres?"
                        value={question}
                        disabled={loading}
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

const ANSWERS = {

    intro: (<p>Gracias por visitar mi bot! 🤗 Soy Federico Navós. Tengo 22 años y vivo en Rosario, Argentina. Soy Ingeniero en Sistemas y Desarrollador Fullstack 💻. Tengo 3 años de experiencia como desarrollador, tanto en aplicaciones web como en análisis de datos. Actualmente trabajo en <a href="http://gptrading.com.ar/newweb/" target="_blank" rel="noreferrer">GP Trading</a> como Desarrollador Python.</p>),

    age: (<p>Tengo 22 años 🎂. Naci el 31 de mayo del 2000.</p>),

    location: (<p>Vivo en Rosario, Argentina 🇦🇷. Tierra de Messi.</p>),

    experience: (
        [
            <p key={0}>Desde 2021 a la actualidad, me encuentro trabajando en GP Trading como Desarrollador Python, haciendo automatización de informes, scraping de datos y desarrollo de estrategias de trading 📈.</p>,
            <p key={1}>He trabajado en NEORIS como Desarrollador Fullstack, utilizando tecnologías como Angular, entorno .NET y SQL Server. Podés encontrar más información sobre mi carrera <a href="https://drive.google.com/uc?export=download&id=1vdsco5P4G9WOPWEyO2gt2ckJH2zPhdQF">descargando mi CV aquí</a>.</p>,
            <p key={2}>También me gusta desarrollar proyectos personales para aprender nuevas tecnologías. Puedes encontrarlos en mi <a href="https://federiconavos.netlify.app/" target="_blank" rel="noreferrer">mi página de portfolio</a> o en mi<a href="https://github.com/fedenavos" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon icon={faGithub} />.</p>
        ]),

    newjob: (<p>No estoy activamente buscando trabajo en este momento, pero estoy dispuesto a escuchar cualquier propuesta. Podés contactarme a través de mi <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon icon={faLinkedin} /> o enviarme un <a href="mailto:federiconavos@gmail.com">email</a> y con gusto te responderé 🤗.</p>),

    contact: (<p>Podés contactarme a través de mi <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon icon={faLinkedin} /> o enviarme un <a href="mailto:federiconavos@gmail.com">email</a> en cualquier momento 🕑.</p>),

    language: (<p>Me manejo muy bien con el inglés, tanto hablado como escrito. Tengo aprobado el First Certificate in English (FCE) con una calificación de 179/190, es decir, que tengo un nivel B2.</p>),

    education: (
        [
            <p key={0}>Estudié en la Universidad Tecnológica Nacional (UTN) de Rosario, donde obtuve el título de Ingeniero en Sistemas el año pasado 🎓. Ahi aprendí a modelar y analizar sistemas de información, utilizando herramientas como UML. También realicé cursos de programación que me enseñaron los conceptos básicos del mismo y donde aprendí a desarrollar aplicaciones web con tecnologías como React, .NET y SQL Server.</p>,
            <p key={1}>Mis estudios en la UTN me dieron una sólida base en el desarrollo de software, pero también me enseñaron a pensar de forma crítica y a resolver problemas de forma eficiente. Esto me permitió desarrollar habilidades como la capacidad de trabajar en equipo, la resolución de problemas y la comunicación efectiva.</p>,
            <p key={2}>En cuanto a mis estudios secundarios, realicé mi eduación completa en el Colegio La Salle de Rosario. Allí fui primer escolta de la bandera nacional y obtuve el título de Bachiller en Economía y Administración en el año 2017. También participé como Coordinador de la Pastoral Juvenil de la escuela durante más de 6 años.</p>,
            <p key={3}>Puedes encontrar más información sobre mi carrera <a href="https://drive.google.com/uc?export=download&id=1vdsco5P4G9WOPWEyO2gt2ckJH2zPhdQF">descargando mi CV aquí</a> <FontAwesomeIcon icon={faDownload} /> .</p>
        ]),

    courses: (
        <>
            <p>Me gusta aprender cosas nuevas y me gusta mucho aprender de forma autodidacta. Aquí van algunos de los cursos que realicé en los últimos años:</p>
            <table>
                <tr>
                    <th>Course</th>
                    <th>Platform</th>
                </tr>
                <tr>
                    <td>Curso de Introducción al Desarrollo Web: HTML y CSS</td>
                    <td>Google Actívate</td>
                </tr>
                <tr>
                    <td>Angular <FontAwesomeIcon icon={faAngular} />: De cero a experto (Legacy)</td>
                    <td>Udemy, Fernando Herrera</td>
                </tr>
                <tr>
                    <td>The Complete 2020 Flutter Development Bootcamp with Dart <FontAwesomeIcon icon={faAndroid} /></td>
                    <td>Udemy, Dr. Angela Yu</td>
                </tr>
                <tr>
                    <td>La guía definitiva del desarrollo de videojuegos con Unity <FontAwesomeIcon icon={faGamepad} /></td>
                    <td>Udemy, Juan Pablo de la Torre Valdez</td>
                </tr>
                <tr>
                    <td>Laboratorio .NET <FontAwesomeIcon icon={faCode} /></td>
                    <td>NEORIS</td>
                </tr>
                <tr>
                    <td>Taller de Estrategia de Portafolio de Inversión <FontAwesomeIcon icon={faChartLine} /></td>
                    <td>Clave Bursátil, con Matias Batista</td>
                </tr>
                <tr>
                    <td>Algo Trading <FontAwesomeIcon icon={faChartLine} /></td>
                    <td>BCR Capacita</td>
                </tr>
            </table>
        </>),

    skills: (
        <>
            <p>Soy una persona que siempre está buscando aprender nuevas tecnologías. Aquí van algunas de las tecnologías que fui aprendiendo, tanto en la facultad como de forma autodidacta:</p>
            <ul>
                <li>Python <FontAwesomeIcon icon={faPython} /></li>
                <li>React/Next JS <FontAwesomeIcon icon={faReact} /></li>
                <li>JavaScript/Typescript <FontAwesomeIcon icon={faJsSquare} /></li>
                <li>Bases de datos SQL <FontAwesomeIcon icon={faDatabase} /></li>
                <li>Angular <FontAwesomeIcon icon={faAngular} /></li>
                <li>.NET <FontAwesomeIcon icon={faCode} /></li>
                <li>Git <FontAwesomeIcon icon={faGithub} /></li>
            </ul>
            <p>Actualmente me encuentro explorando nuevas tecnologías como programación de Smart Contracts con Solidity y desarrollo mobile con Flutter.</p>
        </>),

    life_skills: (
        [
            <p key={0}>Te cuento un poco cuáles creo que son mis habilidades más importantes. Siempre fui muy responsable en todas mis funciones, tomando la iniciativa y asegurándome de cumplir con mis responsabilidades de manera efectiva.</p>,
            <p key={1}>Soy una persona muy organizada, que siempre busca la mejor manera de realizar sus tareas. Y esto ayuda también a mi capacidad de trabajo en equipo, ya que siempre estoy dispuesto a ayudar a mis compañeros de trabajo.</p>,
            <p key={2}>También tengo una gran capacidad de aprendizaje, que me permite adquirir nuevos conocimientos aplicarlos rápidamente en mi trabajo diario. Además, mi habilidad analítica me permiten analizar y resolver problemas complejos de manera efectiva.</p>
        ]),

    insults: (
        <>
            <p>¿Por qué me insultás? Ni a mi ni a Federico nos gusta esto 😢</p>
            <p>No es el objetivo de este chat. Si querés podes hablar con él por <a href="mailto:federiconavos@gmail.com">email</a>.</p>
        </>),

    hobbys: (
        <>
            <p>Soy una persona muy interesada en el mundo de la tecnología, sobre todo en lo que es el mundo <strong>fintech</strong>. Principalmente me considero un experto en todo lo que es criptomonedas <FontAwesomeIcon icon={faBitcoin} />. Me interesa la blockchain como tecnología y analizar los proyectos que se están desarrollando en este campo.</p>
            <p>Me gusta mucho el fútbol ⚽. Soy hincha fanático de River Plate y me gusta mucho ver los partidos de mi equipo. También me gustan los videojuegos 🎮, es por eso que hice cursos para programación de los mismos.</p>
        </>
    ),

    chat: (
        [
            <p key={0}>Este chat-bot fue desarrollado con <a href="https://nextjs.org/" target="_blank" rel="noreferrer">Next.js</a> y <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">TypeScript</a> para el front-end.</p>,
            <>
                <p>Para la clasificación de preguntas utilicé la API de <a href="https://cohere.ai/" target="_blank" rel="noreferrer">Cohere</a>, que brinda herramientas IA gratis para desarrolladores. Entrené el dataset con preguntas y gracias a esto puedo clasificar cada uno de tus mensajes para encontrar la mejor respuesta 🙂.</p>
                <p>El código fuente lo podés encontrar en <a href="https://github.com/fedenavos/chat-bot" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon icon={faGithub} />.</p>
            </>
        ]),

    default: (<p>Lo siento, soy una IA un poco limitada 😅 y no entiendo algunas preguntas. Podés preguntarme sobre mi experiencia, mi disponibilidad para trabajar, cómo contactarme, entre otras cosas.</p>),

};
