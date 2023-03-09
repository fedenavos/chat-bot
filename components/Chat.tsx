import styles from "@/styles/Chat.module.css";
import { useEffect, useRef, useState } from "react";
// Font Awesome Icons
import { faAndroid, faAngular, faBitcoin, faGithub, faJsSquare, faLinkedin, faPython, faReact } from "@fortawesome/free-brands-svg-icons";
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

    intro: (<p>Gracias por visitar mi bot! 🤗 Soy Federico Navós. Tengo 22 años y vivo en Rosario, Argentina. Soy Ingeniero en Sistemas y Desarrollador Fullstack 💻. Tengo 3 años de experiencia como desarrollador, tanto en aplicaciones web como en análisis de datos. Actualmente trabajo en <a href="http://gptrading.com.ar/newweb/" target="_blank" rel="noreferrer">GP Trading</a> como Desarrollador Python.</p>),

    age: (<p>Tengo 22 años 🎂. Naci el 31 de mayo del 2000.</p>),

    location: (<p>Vivo en Rosario, 🇦🇷. Tierra de Messi.</p>),

    experience: (
        [
            <p key={0}>Desde 2021 a la actualidad, me encuentro trabajando en GP Trading como Desarrollador Python, haciendo automatización de informes, scraping de datos y desarrollo de estrategias de trading 📈.</p>,
            <p key={1}>He trabajado en NEORIS como Desarrollador Fullstack, utilizando tecnologías como Angular, entorno .NET y SQL Server. Podés encontrar más información sobre mi carrera <a href="https://drive.google.com/uc?export=download&id=1vdsco5P4G9WOPWEyO2gt2ckJH2zPhdQF">descargando mi CV aquí</a>.</p>,
            <p key={2}>También me gusta desarrollar proyectos personales para aprender nuevas tecnologías. Puedes encontrarlos en mi <a href="https://www.federiconavos.com" target="_blank" rel="noreferrer">mi página de portfolio</a> o en mi <a href="https://github.com/fedenavos" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon className={styles.icon} icon={faGithub} />.</p>
        ]),

    newjob: (<p>No estoy activamente buscando trabajo en este momento, pero estoy dispuesto a escuchar cualquier propuesta. Podés contactarme a través de mi <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon className={styles.icon} icon={faLinkedin} /> o enviarme un <a href="mailto:fedenavos@gmail.com">email</a> y con gusto te responderé 🤗.</p>),

    contact: (<p>Podés contactarme a través de mi <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon className={styles.icon} icon={faLinkedin} /> o enviarme un <a href="mailto:fedenavos@gmail.com">email</a> en cualquier momento 🕑.</p>),

    language: (<p>Me manejo muy bien con el inglés, tanto hablado como escrito. Tengo aprobado el First Certificate in English (FCE) con una calificación de 179/190, es decir, que tengo un nivel B2.</p>),

    education: (
        [
            <p key={0}>Estudié en la Universidad Tecnológica Nacional (UTN) de Rosario, donde obtuve el título de Ingeniero en Sistemas el año pasado 🎓. Ahi aprendí a modelar y analizar sistemas de información, utilizando herramientas como UML. También realicé cursos de programación que me enseñaron los conceptos básicos del mismo y donde aprendí a desarrollar aplicaciones web con tecnologías como React, .NET y SQL Server.</p>,
            <p key={1}>Mis estudios en la UTN me dieron una sólida base en el desarrollo de software, pero también me enseñaron a pensar de forma crítica y a resolver problemas de forma eficiente. Esto me permitió desarrollar habilidades como la capacidad de trabajar en equipo, la resolución de problemas y la comunicación efectiva.</p>,
            <p key={2}>En cuanto a mis estudios secundarios, realicé mi eduación completa en el Colegio La Salle de Rosario. Allí fui primer escolta de la bandera nacional y obtuve el título de Bachiller en Economía y Administración en el año 2017. También participé como Coordinador de la Pastoral Juvenil de la escuela durante más de 6 años.</p>,
            <p key={3}>Puedes encontrar más información sobre mi carrera <a href="https://drive.google.com/uc?export=download&id=1vdsco5P4G9WOPWEyO2gt2ckJH2zPhdQF">descargando mi CV aquí</a> <FontAwesomeIcon className={styles.icon} icon={faDownload} /> .</p>
        ]),

    courses: (
        [
            <p key={0}>Me gusta aprender cosas nuevas y me gusta mucho aprender de forma autodidacta. Aquí van algunos de los cursos que realicé en los últimos años:</p>,
            <table key={1}>
                <tbody>
                    <tr>
                        <th>Course</th>
                        <th>Platform</th>
                    </tr>
                    <tr>
                        <td>Curso de Introducción al Desarrollo Web: HTML y CSS</td>
                        <td>Google Actívate</td>
                    </tr>
                    <tr>
                        <td>Angular <FontAwesomeIcon className={styles.icon} icon={faAngular} />: De cero a experto (Legacy)</td>
                        <td>Udemy, Fernando Herrera</td>
                    </tr>
                    <tr>
                        <td>The Complete 2020 Flutter Development Bootcamp with Dart <FontAwesomeIcon className={styles.icon} icon={faAndroid} /></td>
                        <td>Udemy, Dr. Angela Yu</td>
                    </tr>
                    <tr>
                        <td>La guía definitiva del desarrollo de videojuegos con Unity <FontAwesomeIcon className={styles.icon} icon={faGamepad} /></td>
                        <td>Udemy, Juan Pablo de la Torre Valdez</td>
                    </tr>
                    <tr>
                        <td>Laboratorio .NET <FontAwesomeIcon className={styles.icon} icon={faCode} /></td>
                        <td>NEORIS</td>
                    </tr>
                    <tr>
                        <td>Taller de Estrategia de Portafolio de Inversión <FontAwesomeIcon className={styles.icon} icon={faChartLine} /></td>
                        <td>Clave Bursátil, con Matias Batista</td>
                    </tr>
                    <tr>
                        <td>Algo Trading <FontAwesomeIcon className={styles.icon} icon={faChartLine} /></td>
                        <td>BCR Capacita</td>
                    </tr>
                </tbody>
            </table>
        ]),

    skills: (
        <>
            <p>Soy una persona que siempre está buscando aprender nuevas tecnologías. Aquí van algunas de las tecnologías que fui aprendiendo, tanto en la facultad como de forma autodidacta:</p>
            <ul>
                <li>Python <FontAwesomeIcon className={styles.icon} icon={faPython} /></li>
                <li>React/Next JS <FontAwesomeIcon className={styles.icon} icon={faReact} /></li>
                <li>JavaScript/Typescript <FontAwesomeIcon className={styles.icon} icon={faJsSquare} /></li>
                <li>Bases de datos SQL <FontAwesomeIcon className={styles.icon} icon={faDatabase} /></li>
                <li>Angular <FontAwesomeIcon className={styles.icon} icon={faAngular} /></li>
                <li>.NET <FontAwesomeIcon className={styles.icon} icon={faCode} /></li>
                <li>Git <FontAwesomeIcon className={styles.icon} icon={faGithub} /></li>
            </ul>
            <p>Actualmente me encuentro explorando nuevas tecnologías como programación de Smart Contracts con Solidity y desarrollo mobile con Flutter.</p>
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
            <p>¿Por qué me insultás? Ni a mi ni a Federico nos gusta esto 😢</p>
            <p>No es el objetivo de este chat. Si querés podes hablar con él por <a href="mailto:fedenavos@gmail.com">email</a>.</p>
        </>),

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

    intro: (<p>Thanks for visiting my bot! 🤗 My name is Federico Navós. I&apos;m 22 years old and I live in Rosario, Argentina. I&apos;m a Systems Engineer and Fullstack Developer 💻. I have 3 years of experience as a developer, both in web applications and data analysis. Currently I work at <a href="http://gptrading.com.ar/newweb/" target="_blank" rel="noreferrer">GP Trading</a> as a Python Developer.</p>),

    age: (<p>I&apos;m 22 years old 🎂. I was born on May 31, 2000.</p>),

    location: (<p>I live in Rosario, 🇦🇷. Messi&apos;s land.</p>),

    experience: (
        [
            <p key={0}>Since 2021 I&apos;m working at <a href="http://gptrading.com.ar/newweb/" target="_blank" rel="noreferrer">GP Trading</a> as a Python Developer, doing reports automation, data scraping and trading strategies development 📈.</p>,
            <p key={1}>I&apos;ve worked at <a href="https://www.neoris.com/" target="_blank" rel="noreferrer">NEORIS</a> as a Fullstack Developer, using technologies like Angular, .NET environment and SQL Server. You can find more information about my career <a href="https://drive.google.com/uc?export=download&id=1vdsco5P4G9WOPWEyO2gt2ckJH2zPhdQF">downloading my CV here</a>.</p>,
            <p key={2}>I also like to develop personal projects to learn new technologies. You can find them in my <a href="https://www.federiconavos.com" target="_blank" rel="noreferrer">portfolio page</a> or in my <a href="https://github.com/fedenavos" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon className={styles.icon} icon={faGithub} />.</p>
        ]
    ),

    newjob: (<p>I&apos;m not actively looking for a job at the moment, but I&apos;m open to any proposal. You can contact me through my <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon className={styles.icon} icon={faLinkedin} /> or send me an <a href="mailto:fedenavos@gmail.com">email</a> and I&apos;ll gladly answer you 🤗.</p>),

    contact: (<p>You can contact me through my <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon className={styles.icon} icon={faLinkedin} /> or send me an <a href="mailto:fedenavos@gmail.com">email</a> at any time 🕑.</p>),

    language: (<p>I&apos;m very fluent in English, both spoken and written. I&apos;ve passed the First Certificate in English (FCE) with a score of 179/190, which means I have a B2 level.</p>),

    education: (
        [
            <p key={0}>I studied at the National Technological University (UTN) of Rosario, where I obtained the title of Systems Engineer last year 🎓. There I learned to model and analyze information systems, using tools such as UML. I also took programming courses that taught me the basic concepts of it and where I learned to develop web applications with technologies like React, .NET and SQL Server.</p>,
            <p key={1}>My studies at the UTN gave me a solid foundation in software development, but they also taught me to think critically and solve problems efficiently. This allowed me to develop skills such as teamwork, problem solving and effective communication.</p>,
            <p key={2}>As for my secondary studies, I completed my education at the La Salle College of Rosario. There I was first escort of the national flag and obtained the title of Bachelor of Economics and Administration in 2017. I also participated as Coordinator of the Youth Pastoral of the school for more than 6 years.</p>,
            <p key={3}>You can find more information about my career <a href="https://drive.google.com/uc?export=download&id=1vdsco5P4G9WOPWEyO2gt2ckJH2zPhdQF">downloading my CV here</a> <FontAwesomeIcon className={styles.icon} icon={faDownload} /> .</p>
        ]
    ),
    
    courses: (
        [
            <p key={0}>I like to learn new things and I really like to learn by myself. Here are some of the courses I took in recent years:</p>,
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
                    <td>Angular <FontAwesomeIcon className={styles.icon} icon={faAngular} />: from zero to expert (Legacy)</td>
                    <td>Udemy, Fernando Herrera</td>
                </tr>
                <tr>
                    <td>The Complete 2020 Flutter Development Bootcamp with Dart <FontAwesomeIcon className={styles.icon} icon={faAndroid} /></td>
                    <td>Udemy, Dr. Angela Yu</td>
                </tr>
                <tr>
                    <td>The definitive guide for videogame development with Unity <FontAwesomeIcon className={styles.icon} icon={faGamepad} /></td>
                    <td>Udemy, Juan Pablo de la Torre Valdez</td>
                </tr>
                <tr>
                    <td>.NET Intern Program <FontAwesomeIcon className={styles.icon} icon={faCode} /></td>
                    <td>NEORIS</td>
                </tr>
                <tr>
                    <td>Investment Portfolio Strategy Workshop <FontAwesomeIcon className={styles.icon} icon={faChartLine} /></td>
                    <td>Clave Bursátil, con Matias Batista</td>
                </tr>
                <tr>
                    <td>Algo Trading <FontAwesomeIcon className={styles.icon} icon={faChartLine} /></td>
                    <td>BCR Capacita</td>
                </tr>
                </tbody>
            </table>
        ]
    ),

    skills: (
        <>
            <p>I&apos;m a person who is always looking to learn new technologies. Here are some of the technologies I&apos;ve been learning, both in college and self-taught:</p>
            <ul>
                <li>Python <FontAwesomeIcon className={styles.icon} icon={faPython} /></li>
                <li>React/Next JS <FontAwesomeIcon className={styles.icon} icon={faReact} /></li>
                <li>JavaScript/Typescript <FontAwesomeIcon className={styles.icon} icon={faJsSquare} /></li>
                <li>SQL Databases <FontAwesomeIcon className={styles.icon} icon={faDatabase} /></li>
                <li>Angular <FontAwesomeIcon className={styles.icon} icon={faAngular} /></li>
                <li>.NET <FontAwesomeIcon className={styles.icon} icon={faCode} /></li>
                <li>Git <FontAwesomeIcon className={styles.icon} icon={faGithub} /></li>
            </ul>
            <p>Currently I&apos;m exploring new technologies like Smart Contracts programming with Solidity and mobile development with Flutter.</p>        
        </>
    ), 

    life_skills: (
        [
            <p key={0}>I&apos;ll tell you a little bit about what I think are my most important skills. I&apos;ve always been very responsible in all my functions, taking the initiative and making sure to fulfill my responsibilities effectively.</p>,
            <p key={1}>I&apos;m a very organized person, who always looks for the best way to perform his tasks. And this also helps my team work capacity, since I&apos;m always willing to help my colleagues.</p>,
            <p key={2}>I also have a great learning capacity, which allows me to acquire new knowledge and apply them quickly in my daily work. In addition, my analytical ability allows me to analyze and solve complex problems effectively.</p>
        ]
    ),

    insults: (
        <>
            <p>Why are you insulting me? Neither me nor Federico like this 😢</p>
            <p>It&apos;s not the goal of this chat. If you want you can talk to him by <a href="mailto:fedenavos@gmail.com">email</a>.</p>
        </>
    ),

    hobbys: (
        <>
            <p>I&apos;m a very interested person in the world of technology, especially in what is the world of <strong>fintech</strong>. I consider myself an expert in everything related to cryptocurrencies <FontAwesomeIcon className={styles.icon} icon={faBitcoin} />. I&apos;m interested in blockchain as a technology and analyzing the projects that are being developed in this field.</p>
            <p>I really like football ⚽. I&apos;m a fanatical fan of River Plate and I really like to watch my team&apos;s matches. I also like video games 🎮, that&apos;s why I did courses for game programming.</p>
        </>
    ),

    chat: (
        [
            <p key={0}>This chat-bot was developed with <a href="https://nextjs.org/" target="_blank" rel="noreferrer">Next.js</a> and <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">TypeScript</a> for the front-end.</p>,
            <>
                <p>To classify the questions I used the <a href="https://cohere.ai/" target="_blank" rel="noreferrer">Cohere</a> API, which provides free AI tools for developers. I trained the dataset with questions and thanks to this I can classify each of your messages to find the best answer 🙂.</p>
                <p>You can find the source code on <a href="https://github.com/fedenavos/chat-bot" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon className={styles.icon} icon={faGithub} />.</p>
            </>
        ]
    ),

    default: (<p>I&apos;m sorry, I&apos;m a little limited AI 😅 and I don&apos;t understand some questions. You can ask me about my experience, my availability to work, how to contact me, among other things.</p>),

}