import styles from "@/styles/Chat.module.css";
import { useEffect, useRef, useState } from "react";
// Font Awesome Icons
import { faAndroid, faAws, faAngular, faBitcoin, faGithub, faJsSquare, faLinkedin, faPython, faReact } from "@fortawesome/free-brands-svg-icons";
import { faChartLine, faCode, faDatabase, faDownload, faGamepad } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Components
import Message from "./Message";
// Examples
import { EXAMPLES, EXAMPLES_EN } from "../data/EXAMPLES";
import Suggestion from "./Suggestion";


type Message = {
    id: string;
    content: React.ReactNode | string;
    type: "bot" | "user";
};


const Chat = () => {

    const [lang, setLanguage] = useState<string>('es');
    const [question, setQuestion] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [displaySuggestions, setDisplaySuggestions] = useState<boolean>(true);
    const [suggestions, setSuggestions] = useState<number[]>([]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: lang == 'es' ? "Hola 👋 Soy un bot preparado para contestar algunas preguntas sobre Federico. Haceme una pregunta!" : "Hi 👋 I'm a bot prepared to answer some questions about Federico. Ask me something!",
            type: "bot"
        },
    ]);

    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([
            {
                id: "1",
                content: lang == 'es' ? "Hola 👋 Soy un bot preparado para contestar algunas preguntas sobre Federico. Haceme una pregunta!" : "Hi 👋 I'm a bot prepared to answer some questions about Federico. Ask me something!",
                type: "bot"
            },
        ]);
        const interval = setTimeout(() => {
            setMessages((messages) => messages.concat({
                id: new Date().getTime().toString(),
                content: lang == 'es' ? "Puedes usar las sugerencias o escribir tu propia pregunta." : "You can use the suggestions or write your own question.",
                type: "bot",
            }));
        }, 3000);
        setSuggestionsNum();
        return () => clearTimeout(interval);
    }, [lang]);

    useEffect(() => {
        container.current?.scrollTo(0, container.current.scrollHeight);
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
                    examples: lang == 'es' ? EXAMPLES : EXAMPLES_EN,
                }),
            }
        ).then((res) => res.json());

        const prediction: string = classifications[0].prediction;
        let confidence =
            classifications[0].labels[prediction].confidence * 100;
        confidence = Math.round(confidence);

        const response =
            lang == 'es' ? ANSWERS[prediction as keyof typeof ANSWERS] || ANSWERS.default :
                ANSWERS_EN[prediction as keyof typeof ANSWERS_EN] || ANSWERS_EN.default;

        sendMessages(response);
    }

    const SUGGESTIONS = [
        <Suggestion key={0} tag="Experiencia" question="Podrías hablar un poco sobre tu experiencia laboral?" callback={setQuestion} />,
        <Suggestion key={1} tag="Cursos" question="Contame sobre los cursos que hiciste" callback={setQuestion} />,
        <Suggestion key={2} tag="Edad" question="Cuantos años tenés?" callback={setQuestion} />,
        <Suggestion key={3} tag="Este bot" question="Que usaste para armar este chat?" callback={setQuestion} />,
        <Suggestion key={4} tag="Idioma" question="Sabes hablar inglés?" callback={setQuestion} />,
        <Suggestion key={5} tag="Hobbies" question="Que te gusta hacer en tu tiempo libre?" callback={setQuestion} />,
        <Suggestion key={6} tag="Contacto" question="Como puedo hablar con vos?" callback={setQuestion} />,
        <Suggestion key={7} tag="Tecnologías" question="Que tecnologías manejás?" callback={setQuestion} />,
        <Suggestion key={8} tag="Estudios" question="Qué y dónde estudiaste?" callback={setQuestion} />,
    ];

    const SUGGESTIONS_EN = [
        <Suggestion key={0} tag="Experience" question="Could you talk a little about your work experience?" callback={setQuestion} />,
        <Suggestion key={1} tag="Courses" question="Tell me about the courses you took" callback={setQuestion} />,
        <Suggestion key={2} tag="Age" question="How old are you?" callback={setQuestion} />,
        <Suggestion key={3} tag="This bot" question="What did you use to build this chat?" callback={setQuestion} />,
        <Suggestion key={4} tag="Language" question="Do you speak English?" callback={setQuestion} />,
        <Suggestion key={5} tag="Hobbies" question="What do you like to do in your free time?" callback={setQuestion} />,
        <Suggestion key={6} tag="Contact" question="How can I talk to you?" callback={setQuestion} />,
        <Suggestion key={7} tag="Technologies" question="What technologies do you handle?" callback={setQuestion} />,
        <Suggestion key={8} tag="Studies" question="What and where did you study?" callback={setQuestion} />,
    ];

    function sendMessages(response: JSX.Element | JSX.Element[]) {
        const DELAY = 3500;
        if (Array.isArray(response)) {
            const len = response.length;
            setTimeout(() => {
                setLoading(false);
                setSuggestionsNum();
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
            setSuggestionsNum();
        }
    }

    const setSuggestionsNum = () => {
        let suggestionNumbers: number[] = [];
        while (suggestionNumbers.length < 3) {
            let randomNumber = Math.floor(Math.random() * 5);
            if (!suggestionNumbers.includes(randomNumber)) {
                suggestionNumbers.push(randomNumber);
            }
        }
        setSuggestions(suggestionNumbers);
    }

    const changeLanguage = (lang: string) => {
        setLanguage(lang);
        setMessages([]);
        setQuestion("");
        setLoading(false);
        setSuggestionsNum();
    }

    return (
        <div className={styles.container}>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>Chat-Bot</h1>
                <div className={styles.langContainer}>
                    <button onClick={() => changeLanguage('es')} className={lang === 'es' ? `${styles.active} ${styles.langButton}` : styles.langButton}>ES</button>
                    <button onClick={() => changeLanguage('en')} className={lang === 'en' ? `${styles.active} ${styles.langButton}` : styles.langButton}>EN</button>
                </div>
            </div>
            {
                lang === 'es' ? (
                    <p className={styles.description}>
                        Bot que responde preguntas sobre Federico Navós, utilizando <a className={styles.link} href="https://cohere.ai/" target="_blank" rel="noreferrer">Cohere</a>.
                    </p>
                ) : (
                    <p className={styles.description}>
                        Bot that answers questions about Federico Navós, using <a className={styles.link} href="https://cohere.ai/" target="_blank" rel="noreferrer">Cohere</a>.
                    </p>
                )
            }
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
                {
                    displaySuggestions ? (
                        <div className={styles.suggestedMessages}>
                            {suggestions.map((suggestion) => { return lang === 'es' ? SUGGESTIONS[suggestion] : SUGGESTIONS_EN[suggestion]; })}
                            <button key={10}
                                className={styles.suggestedMessage}
                                type="button"
                                onClick={() => setDisplaySuggestions(false)}
                            >▶️</button>
                        </div>
                    ) : (
                        <div className={styles.suggestedMessages}>
                            <button
                                className={styles.suggestedMessage}
                                type="button"
                                onClick={() => setDisplaySuggestions(true)}
                            >◀️</button>
                        </div>
                    )
                }
                <form className={styles.formSend} onSubmit={handleSubmit}>
                    <input
                        className={styles.inputSend} type="text"
                        placeholder={lang == 'es' ? "Escribe tu mensaje aquí" : "Write your message here"}
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

    intro: (
        <p>
            ¡Gracias por visitar mi bot! 🤗 Mi nombre es Federico Navós. Tengo 23 años y vivo en Rosario, Argentina. Soy Ingeniero en Sistemas de Información y Desarrollador Fullstack 💻. Tengo amplia experiencia en desarrollo en Python, servicios en la nube y tanto en front-end como en back-end. Actualmente trabajo en <a href="https://www.fiwind.io/" target="_blank" rel="noreferrer">Fiwind</a> como Desarrollador Python, donde me enfoco en automatizar estrategias de trading y mejorar la eficiencia operativa con integración de datos en tiempo real.
        </p>
    ),

    age: (<p>Tengo 23 años 🎂. Nací el 31 de mayo del 2000.</p>),

    location: (<p>Vivo en Rosario, 🇦🇷. La ciudad de Messi.</p>),

    experience: (
        [
            <p key={0}>
                Desde marzo del 2024, trabajo en <a href="https://www.fiwind.io/" target="_blank" rel="noreferrer">Fiwind</a> como Desarrollador Python. Mi rol incluye el desarrollo de aplicaciones para estrategias de trading automatizadas, utilizando datos de mercado en tiempo real, con dashboards interactivos para monitoreo y análisis.
            </p>,
            <p key={1}>
                Antes de Fiwind, estuve en <a href="https://www.dxc.technology/" target="_blank" rel="noreferrer">DXC Technology</a> enfocado en servicios en la nube de AWS, creando funciones serverless e infraestructura como código.
            </p>,
            <p key={2}>
                Anteriormente, trabajé en G.P. Trading como Desarrollador Python, donde desarrollé y backtesteé estrategias de trading y realicé web scraping para adquisición de datos. También tengo experiencia como Desarrollador Fullstack en NEORIS, utilizando tecnologías como Angular, .NET y SQL Server. Para más detalles, puedes visitar mi <a href="https://www.linkedin.com/in/federico-navos" target="_blank" rel="noreferrer">LinkedIn</a> o ver mis proyectos en <a href="www.federiconavos.com" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon className={styles.icon} icon={faGithub} />.
            </p>
        ]
    ),

    newjob: (<p>En este momento no estoy buscando activamente nuevas oportunidades laborales, pero estoy abierto a propuestas interesantes. Puedes contactarme a través de mi <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon className={styles.icon} icon={faLinkedin} /> o enviarme un <a href="mailto:fedenavos@gmail.com">email</a> y te responderé con gusto 🤗.</p>),

    contact: (<p>Puedes contactarme a través de mi <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon className={styles.icon} icon={faLinkedin} /> o enviarme un <a href="mailto:fedenavos@gmail.com">email</a> en cualquier momento 🕑.</p>),

    language: (<p>Manejo el inglés con fluidez, poseo una certificación de nivel B2. Aprobé el First Certificate in English (FCE) con una puntuación de 179/190.</p>),

    education: (
        [
            <p key={0}>Estudié en la Universidad Tecnológica Nacional (UTN) de Rosario, donde obtuve el título de Ingeniero en Sistemas el año pasado 🎓. Ahi aprendí a modelar y analizar sistemas de información, utilizando herramientas como UML. También realicé cursos de programación que me enseñaron los conceptos básicos del mismo y donde aprendí a desarrollar aplicaciones web con tecnologías como React, .NET y SQL Server.</p>,
            <p key={1}>Mis estudios en la UTN me dieron una sólida base en el desarrollo de software, pero también me enseñaron a pensar de forma crítica y a resolver problemas de forma eficiente. Esto me permitió desarrollar habilidades como la capacidad de trabajar en equipo, la resolución de problemas y la comunicación efectiva.</p>,
            <p key={2}>En cuanto a mis estudios secundarios, realicé mi eduación completa en el Colegio La Salle de Rosario. Allí fui primer escolta de la bandera nacional y obtuve el título de Bachiller en Economía y Administración en el año 2017. También participé como Coordinador de la Pastoral Juvenil de la escuela durante más de 6 años.</p>,
            <p key={3}>Puedes encontrar más información sobre mi carrera <a href="https://drive.google.com/uc?export=download&id=1vdsco5P4G9WOPWEyO2gt2ckJH2zPhdQF">descargando mi CV aquí</a> <FontAwesomeIcon className={styles.icon} icon={faDownload} /> .</p>
        ]),

    courses: (
        [
            <p key={0}>Continuamente busco aprender y actualizar mis habilidades. Aquí algunos de los cursos que he completado:</p>,
            <table key={1}>
                <tbody>
                    <tr>
                        <th>Curso</th>
                        <th>Plataforma</th>
                    </tr>
                    <tr>
                        <td>Curso de Introducción al Desarrollo Web: HTML y CSS</td>
                        <td>Google Actívate</td>
                    </tr>
                    <tr>
                        <td>Angular: De cero a experto (Legacy)</td>
                        <td>Udemy, Fernando Herrera</td>
                    </tr>
                    <tr>
                        <td>The Complete 2020 Flutter Development Bootcamp with Dart</td>
                        <td>Udemy, Dr. Angela Yu</td>
                    </tr>
                    <tr>
                        <td>La guía definitiva del desarrollo de videojuegos con Unity</td>
                        <td>Udemy, Unity</td>
                    </tr>
                    <tr>
                        <td>Laboratorio .NET</td>
                        <td>NEORIS</td>
                    </tr>
                    <tr>
                        <td>Taller de Estrategia de Portafolio de Inversión</td>
                        <td>Clave Bursátil, Matías Batista</td>
                    </tr>
                    <tr>
                        <td>Algo Trading</td>
                        <td>BCR Capacita</td>
                    </tr>
                    <tr>
                        <td>AWS Lambda - Guía Práctica</td>
                        <td>Udemy, Daniel Galati</td>
                    </tr>
                </tbody>
            </table>
        ]),

    skills: (
        <>
            <p>Como desarrollador, tengo un conjunto diverso de habilidades técnicas. Aquí algunas de las tecnologías y herramientas con las que he trabajado:</p>
            <ul>
                <li>Python <FontAwesomeIcon className={styles.icon} icon={faPython} /></li>
                <li>Servicios de AWS <FontAwesomeIcon className={styles.icon} icon={faAws} /></li>
                <li>React <FontAwesomeIcon className={styles.icon} icon={faReact} /></li>
                <li>JavaScript/Typescript <FontAwesomeIcon className={styles.icon} icon={faJsSquare} /></li>
                <li>Bases de Datos SQL <FontAwesomeIcon className={styles.icon} icon={faDatabase} /></li>
                <li>Angular <FontAwesomeIcon className={styles.icon} icon={faAngular} /></li>
                <li>.NET <FontAwesomeIcon className={styles.icon} icon={faCode} /></li>
                <li>Git <FontAwesomeIcon className={styles.icon} icon={faGithub} /></li>
            </ul>
            <p>También estoy explorando nuevas tecnologías como el desarrollo móvil con Flutter y la programación de Smart Contracts.</p>
        </>
    ),

    life_skills: (
        [
            <p key={0}>Te cuento un poco cuáles creo que son mis habilidades más importantes. Siempre fui muy responsable en todas mis funciones, tomando la iniciativa y asegurándome de cumplir con mis responsabilidades de manera efectiva.</p>,
            <p key={1}>Soy una persona muy organizada, que siempre busca la mejor manera de realizar sus tareas. Y esto ayuda también a mi capacidad de trabajo en equipo, ya que siempre estoy dispuesto a ayudar a mis compañeros de trabajo.</p>,
            <p key={2}>También tengo una gran capacidad de aprendizaje, que me permite adquirir nuevos conocimientos aplicarlos rápidamente en mi trabajo diario. Además, mi habilidad analítica me permiten analizar y resolver problemas complejos de manera efectiva.</p>
        ]),

    insults: (
        <>
            <p>¿Por qué me insultas? Ni a mí ni a Federico nos gusta esto 😢</p>,
            <p>Este chat no está diseñado para eso. Si lo deseas, puedes contactar a Federico por <a href="mailto:fedenavos@gmail.com">email</a>.</p>
        </>
    ),

    hobbys: (
        <>
            <p>Soy una persona muy interesada en el mundo de la tecnología, sobre todo en lo que es el mundo <strong>fintech</strong>. Principalmente me considero un experto en todo lo que es criptomonedas <FontAwesomeIcon className={styles.icon} icon={faBitcoin} />. Me interesa la blockchain como tecnología y analizar los proyectos que se están desarrollando en este campo.</p>
            <p>Me gusta mucho el fútbol ⚽. Soy hincha fanático de River Plate y me gusta mucho ver los partidos de mi equipo. También me gustan los videojuegos 🎮, es por eso que hice cursos para programación de los mismos.</p>
        </>
    ),

    chat: (
        [
            <p key={0}>Este chat-bot fue desarrollado con <a href="https://nextjs.org/" target="_blank" rel="noreferrer">Next.js</a> y <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">TypeScript</a> para el front-end.</p>,
            <>
                <p>Para la clasificación de preguntas utilicé la API de <a href="https://cohere.ai/" target="_blank" rel="noreferrer">Cohere</a>, que brinda herramientas IA gratis para desarrolladores. Entrené el dataset con preguntas y gracias a esto puedo clasificar cada uno de tus mensajes para encontrar la mejor respuesta 🙂.</p>
                <p>El código fuente lo podés encontrar en <a href="https://github.com/fedenavos/chat-bot" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon className={styles.icon} icon={faGithub} />.</p>
            </>
        ]),

    default: (<p>Lo siento, soy una IA un poco limitada 😅 y no entiendo algunas preguntas. Podés preguntarme sobre mi experiencia, mi disponibilidad para trabajar, cómo contactarme, entre otras cosas.</p>),

};


const ANSWERS_EN = {
    intro: (
        <p>
            Thanks for visiting my bot! 🤗 My name is Federico Navós. I&apos;m 23 years old and I live in Rosario, Argentina. I&apos;m an Information Systems Engineer and Fullstack Developer 💻. I have extensive experience in Python development, cloud services, and both front-end and back-end development. I am currently working at <a href="https://www.fiwind.io/" target="_blank" rel="noreferrer">Fiwind</a> as a Python Developer, where I focus on automating trading strategies and improving operational efficiencies with real-time data integration.
        </p>
    ),

    age: (<p>I&apos;m 23 years old 🎂. I was born on May 31, 2000.</p>),

    location: (<p>I live in Rosario, 🇦🇷. Messi&apos;s land.</p>),

    experience: (
        [
            <p key={0}>
                Since March 2024, I&apos;ve been working at <a href="https://www.fiwind.io/" target="_blank" rel="noreferrer">Fiwind</a> as a Python Developer. My role includes developing applications for automated trading strategies, utilizing real-time market data, with interactive dashboards for monitoring and analysis.
            </p>,
            <p key={1}>
                Before Fiwind, I was at <a href="https://www.dxc.technology/" target="_blank" rel="noreferrer">DXC Technology</a> focusing on AWS cloud services, creating serverless functions, and infrastructure as code.
            </p>,
            <p key={2}>
                Previously, I worked at G.P. Trading as a Python Developer, where I developed and backtested trading strategies and performed web scraping for data acquisition. I also have experience as a Fullstack Developer at NEORIS, using technologies like Angular, .NET, and SQL Server. For more details, you can visit my <a href="https://www.linkedin.com/in/federico-navos" target="_blank" rel="noreferrer">LinkedIn</a> or check out my projects on <a href="https://github.com/fedenavos" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon className={styles.icon} icon={faGithub} />.
            </p>
        ]
    ),

    newjob: (<p>Currently, I am not actively seeking new job opportunities, but I am open to interesting proposals. Feel free to reach out via my <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon className={styles.icon} icon={faLinkedin} /> or send an <a href="mailto:fedenavos@gmail.com">email</a> for any inquiries 🤗.</p>),

    contact: (<p>For contact, please reach out via my <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon className={styles.icon} icon={faLinkedin} /> or email me at <a href="mailto:fedenavos@gmail.com">fedenavos@gmail.com</a> anytime 🕑.</p>),

    language: (<p>I am fluent in English, holding a B2 level certification. I&apos;ve passed the First Certificate in English (FCE) with a score of 179/190.</p>),

    education: (
        [
            <p key={0}>I graduated from the National Technological University (UTN) of Rosario with a degree in Information Systems Engineering 🎓. My education provided a strong foundation in software engineering, critical thinking, and problem-solving skills.</p>,
            <p key={1}>In secondary education, I attended La Salle College in Rosario, where I graduated with a Bachelor&apos;s in Economics and Administration in 2017. I was also deeply involved in the Youth Pastoral as a coordinator.</p>,
            <p key={2}>For more information about my education and career, feel free to visit my <a href="https://www.linkedin.com/in/federico-navos" target="_blank" rel="noreferrer">LinkedIn</a> profile.</p>
        ]
    ),

    courses: (
        [
            <p key={0}>I am continually learning and updating my skills. Here are some of the courses I&apos;ve completed:</p>,
            <table key={1}>
                <tbody>
                    <tr>
                        <th>Course</th>
                        <th>Platform</th>
                    </tr>
                    <tr>
                        <td>Introduction to Web Development: HTML and CSS</td>
                        <td>Google Actívate</td>
                    </tr>
                    <tr>
                        <td>Angular: from zero to expert (Legacy)</td>
                        <td>Udemy, Fernando Herrera</td>
                    </tr>
                    <tr>
                        <td>The Complete 2020 Flutter Development Bootcamp with Dart</td>
                        <td>Udemy, Dr. Angela Yu</td>
                    </tr>
                    <tr>
                        <td>The definitive guide for videogame development with Unity</td>
                        <td>Udemy, Unity</td>
                    </tr>
                    <tr>
                        <td>.NET Intern Program</td>
                        <td>NEORIS</td>
                    </tr>
                    <tr>
                        <td>Investment Portfolio Strategy Workshop</td>
                        <td>Clave Bursátil, Matías Batista</td>
                    </tr>
                    <tr>
                        <td>Algo Trading</td>
                        <td>BCR Capacita</td>
                    </tr>
                    <tr>
                        <td>AWS Lambda - A Practical Guide</td>
                        <td>Udemy, Daniel Galati</td>
                    </tr>
                </tbody>
            </table>
        ]
    ),

    skills: (
        <>
            <p>As a developer, I have a diverse set of technical skills. Here are some of the technologies and tools I&apos;ve worked with:</p>
            <ul>
                <li>Python <FontAwesomeIcon className={styles.icon} icon={faPython} /></li>
                <li>AWS Services <FontAwesomeIcon className={styles.icon} icon={faAws} /></li>
                <li>React <FontAwesomeIcon className={styles.icon} icon={faReact} /></li>
                <li>JavaScript/Typescript <FontAwesomeIcon className={styles.icon} icon={faJsSquare} /></li>
                <li>SQL Databases <FontAwesomeIcon className={styles.icon} icon={faDatabase} /></li>
                <li>Angular <FontAwesomeIcon className={styles.icon} icon={faAngular} /></li>
                <li>.NET <FontAwesomeIcon className={styles.icon} icon={faCode} /></li>
                <li>Git <FontAwesomeIcon className={styles.icon} icon={faGithub} /></li>
            </ul>
            <p>I am also exploring new technologies like mobile development with Flutter and Smart Contracts programming.</p>
        </>
    ),

    life_skills: (
        [
            <p key={0}>Here are some of my key personal skills: I am highly responsible, always ensuring effective completion of my tasks and initiatives.</p>,
            <p key={1}>I am organized and diligent, aiding in my ability to work well in teams and assist my colleagues.</p>,
            <p key={2}>My strong learning capacity and analytical skills enable me to quickly adapt to new technologies and effectively solve complex problems.</p>
        ]
    ),

    insults: (
        <>
            <p>Why are you insulting me? Neither I nor Federico appreciate this 😢</p>
            <p>This chat isn&apos;t meant for that. If you wish, you can contact Federico via <a href="mailto:fedenavos@gmail.com">email</a>.</p>
        </>
    ),

    hobbys: (
        <>
            <p>My interests lie in the realm of technology, particularly fintech and blockchain. I&apos;m deeply fascinated by cryptocurrency projects <FontAwesomeIcon className={styles.icon} icon={faBitcoin} /> and their underlying technologies.</p>
            <p>I&apos;m also a football ⚽ enthusiast, a dedicated fan of River Plate. Besides, I enjoy video games 🎮, and have pursued game programming courses.</p>
        </>
    ),

    chat: (
        [
            <p key={0}>This chat-bot was developed with Next.js and TypeScript for the front-end.</p>,
            <>
                <p>I used the Cohere API for question classification, training the dataset with various questions to provide accurate responses.</p>
                <p>The source code is available on my <a href="https://github.com/fedenavos/chat-bot" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon className={styles.icon} icon={faGithub} />.</p>
            </>
        ]
    ),

    default: (<p>Sorry, I&apos;m a limited AI 😅 and may not understand some questions. Feel free to ask about my experience, availability, contact details, and more.</p>),

}
