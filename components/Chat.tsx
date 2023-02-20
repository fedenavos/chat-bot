import styles from "@/styles/Chat.module.css";
import { useEffect, useRef, useState } from "react";

// Font Awesome Icons
import { faAndroid, faAngular, faBitcoin, faCss3Alt, faGithub, faHtml5, faJsSquare, faLinkedin, faPython, faReact } from "@fortawesome/free-brands-svg-icons";
import { faChartLine, faCode, faDatabase, faDownload, faGamepad } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Message from "./Message";


type Message = {
    id: string;
    content: React.ReactNode | string;
    type: "bot" | "user";
}

const EXAMPLES = [
    // INTRO
    {"text": "Hola", "label": "intro"}, 
    {"text": "Como estás?", "label": "intro"}, 
    {"text": "Quién sos?", "label": "intro"}, 
    {"text": "Dónde estas trabajando?", "label": "intro"}, 
    {"text": "Cúal es tu empleo actual?", "label": "intro"}, 
    {"text": "Donde trabajas?", "label": "intro"}, 
    {"text": "Cómo te llamas?", "label": "intro"},
    {"text": "Cuál es tu nombre?", "label": "intro"},
    {"text": "Hablame sobre vos", "label": "unknown"},
    {"text": "Hablame sobre tu vida", "label": "unknown"},
    // NEW JOB
    {"text": "Tengo una propuesta de trabajo para vos", "label": "newjob"}, 
    {"text": "Te interesa cambiar de trabajo?", "label": "newjob"}, 
    {"text": "Estás buscando trabajo?", "label": "newjob"}, 
    {"text": "Estas escuchando propuestas?", "label": "newjob"}, 
    {"text": "Te interesa cambiar de trabajo?", "label": "newjob"}, 
    {"text": "¿Cuándo podrías empezar a trabajar?", "label": "newjob"},
    // CONTACT
    {"text": "Quiero hablar con Federico", "label": "contact"}, 
    {"text": "Por donde te puedo contactar?", "label": "contact"}, 
    {"text": "Te quiero mandar un mensaje", "label": "contact"}, 
    {"text": "Por donde me puedo comunicar?", "label": "contact"}, 
    {"text": "Tengo una duda", "label": "contact"}, 
    {"text": "Quiero hacerte una consulta", "label": "contact"},
    {"text": "Quiero hacerte una pregunta", "label": "contact"},
    {"text": "Cómo es tu LinkedIn?", "label": "contact"}, 
    {"text": "Cómo es tu Github?", "label": "contact"}, 
    {"text": "Te puedo hacer una consulta?", "label": "contact"}, 
    {"text": "Cuales son tus redes?", "label": "contact"}, 
    {"text": "Cuál es tu expectativa salarial?", "label": "contact"}, 
    {"text": "¿Cuál es tu correo electrónico?", "label": "contact"},
    {"text": "¿Cuál es tu número de teléfono?", "label": "contact"},
    {"text": "¿Podrías proporcionar tus redes sociales?", "label": "contact"},
    {"text": "¿En qué horario prefieres ser contactado/a?", "label": "contact"},
    {"text": "¿Cómo te gustaría ser contactado/a?", "label": "contact"},
    {"text": "¿Cuál es tu disponibilidad para una entrevista?", "label": "contact"},
    {"text": "¿Qué día y hora te viene mejor para una entrevista?", "label": "contact"},
    {"text": "¿Hay algún medio de contacto que prefieras utilizar?", "label": "contact"},
    {"text": "¿Hay algún horario en particular en el que no puedas ser contactado/a?", "label": "contact"},
    {"text": "¿Cuál es tu salario actual?", "label": "contact"},
    {"text": "¿Cuál es tu salario deseado?", "label": "contact"},
    {"text": "¿Cuál es tu salario esperado?", "label": "contact"},
    {"text": "¿Cuál es tu salario mínimo?", "label": "contact"},
    {"text": "Y cómo te puedo contactar", "label": "contact"},
    {"text": "Y cómo te puedo llamar", "label": "contact"},
    {"text": "Que forma tengo de hablar con vos?", "label": "contact"},
    // EXPERIENCE
    {"text": "Dónde trabajas?", "label": "experience"}, 
    {"text": "Tenes curriculum?", "label": "experience"}, 
    {"text": "Tenes CV?", "label": "experience"}, 
    {"text": "Con qué tecnologías trabajas?", "label": "experience"}, 
    {"text": "Con qué tecnologías tenes experiencia?", "label": "experience"}, 
    {"text": "Cuantos años de experiencia tenés?", "label": "experience"}, 
    {"text": "Experiencia previa", "label": "experience"}, 
    {"text": "Donde trabajaste antes?", "label": "experience"}, 
    {"text": "Como fue tu carrera?", "label": "experience"},
    {"text": "Como fue tu vida laboral?", "label": "experience"},
    {"text": "Como fue tu vida profesional?", "label": "experience"},
    {"text": "¿Cómo describirías tu experiencia previa?", "label": "experience"},
    {"text": "¿Podrías proporcionar referencias laborales?", "label": "experience"},
    {"text": "¿Podrías hablar un poco sobre tu experiencia laboral previa?", "label": "experience"}, 
    {"text": "¿Cuál es tu mayor logro profesional?", "label": "experience"},
    {"text": "¿Qué tareas has realizado en trabajos anteriores que te hayan gustado especialmente?",  "label": "experience"},
    {"text": "¿Podrías proporcionar un ejemplo de un proyecto en el que hayas trabajado y cómo lo llevaste a cabo?", "label": "experience"},
    {"text": "Y qué experiencia tenes?", "label": "experience"},
    // LANGUAGE
    {"text": "Sabes inglés?", "label": "language"}, 
    {"text": "Qué idiomas sabés?", "label": "language"},
    {"text": "¿Podrías realizar una conversación básica en inglés?", "label": "language"},
    {"text": "¿Cuál es tu nivel de comprensión en ingles?", "label": "language"},
    {"text": "¿Has tomado algún tipo de curso o certificación en algun idioma?", "label": "language"},
    {"text": "¿Cuál es tu nivel de inglés?", "label": "language"},
    {"text": "Y tu ingles?", "label": "language"},
    // EDUCATION
    {"text": "Donde estudiaste?", "label": "education"},
    {"text": "¿Cuál es su nivel de educación más o?", "label": "education"},
    {"text": "¿Cuál es su título más o?", "label": "education"},
    {"text": "¿Dónde estudió y cuál fue su especialización?", "label": "education"},
    {"text": "¿Cuáles fueron algunos de sus cursos o asignaturas favoritas y por qué?", "label": "education"},
    {"text": "¿Cómo le ayudaron sus estudios a desarrollar habilidades específicas?", "label": "education"},
    {"text": "¿Obtuvo algún tipo de premio o reconocimiento por su desempeño académico?", "label": "education"},
    {"text": "¿Cómo ha sido su desempeño académico a lo largo de su carrera?", "label": "education"},
    {"text": "Y tu educación?", "label": "education"},
    // COURSES
    {"text": "Que cursos tomaste?", "label": "courses"},
    {"text": "Que cursos hiciste?", "label": "courses"},
    {"text": "Que cursos hiciste en la universidad?", "label": "courses"},
    {"text": "Que cursos hiciste en la facultad?", "label": "courses"},
    {"text": "Que cursos hiciste en la escuela?", "label": "courses"},
    {"text": "¿Qué capacitaciones o entrenamientos has recibido?", "label": "courses"},
    {"text": "¿Qué programas educativos has completado?", "label": "courses"},
    {"text": "¿Qué talleres o seminarios has asistido?", "label": "courses"},
    {"text": "¿Qué certificaciones o acreditaciones posees?", "label": "courses"},
    {"text": "¿Qué estudios complementarios has realizado?", "label": "courses"},
    {"text": "¿Qué cursos de formación has tomado?", "label": "courses"},
    {"text": "¿Qué aprendizajes adicionales has adquirido?", "label": "courses"},
    {"text": "¿Qué programas de desarrollo profesional has cursado?", "label": "courses"},
    {"text": "¿Qué actividades de aprendizaje continuo has llevado a cabo?", "label": "courses"},
    {"text": "¿Qué programas de educación ejecutiva has completado?", "label": "courses"},
    // SKILLS
    {"text": "Que tecnologías usas?", "label": "skills"},
    {"text": "Que tecnologías conoces?", "label": "skills"},
    {"text": "Que tecnologías manejas?", "label": "skills"},
    {"text": "Que tecnologías tenes?", "label": "skills"},
    {"text": "Que tecnologías tenes en tu stack?", "label": "skills"},
    {"text": "Que tecnologías tenes en tu stack tecnológico?", "label": "skills"},
    {"text": "Que tecnologías?", "label": "skills"},
    {"text": "Y que tecnologías", "label": "skills"},
    // LIFE SKILLS
    {"text": "Que habilidades tenes?", "label": "life_skills"},
    {"text": "Que habilidades tenes fuera de la tecnología?", "label": "life_skills"},
    {"text": "Que habilidades tenes fuera de la programación?", "label": "life_skills"},
    {"text": "Que habilidades tenes fuera de la informática?", "label": "life_skills"},
    {"text": "¿Cuáles son algunas de sus fortalezas personales que cree que lo hacen un buen candidato para este trabajo?", "label": "life_skills"},
    {"text": "¿Cómo describiría su capacidad para trabajar en equipo y colaborar con otros?,", "label": "life_skills"},
    {"text": "¿Cómo describiría su capacidad para trabajar bajo presión?", "label": "life_skills"},
    {"text": "Y tus competencias?", "label": "life_skills"},
    {"text": "¿Cuáles son algunas de sus fortalezas personales?", "label": "life_skills"},
    {"text": "¿Cuáles son tus mejores aptitudes?", "label": "life_skills"},
    {"text": "¿Podrías hablar sobre tus habilidades más destacadas?", "label": "life_skills"},
    {"text": "¿Cuáles son tus fortalezas?", "label": "life_skills"},
    // HOBBYS
    {"text": "Que haces en tu tiempo libre?", "label": "hobbys"},
    {"text": "Y tus hobbys?", "label": "hobbys"},
    {"text": "¿Cuál es su hobby favorito?", "label": "hobbys"},
    {"text": "Que hobbys tenes", "label": "hobbys"},
    {"text": "¿Cuál es su hobby favorito y por qué le gusta tanto?", "label": "hobbys"},
    {"text": "¿Cómo le ha beneficiado su hobby en su vida personal y profesional?", "label": "hobbys"},
    {"text": "¿Ha aplicado alguna habilidad o conocimiento que ha obtenido de su hobby en su trabajo?", "label": "hobbys"},
    {"text": "¿Podría contarme sobre un proyecto interesante en el que ha trabajado relacionado con su hobby?", "label": "hobbys"},
    {"text": "¿Ha tenido alguna oportunidad de liderazgo o trabajo en equipo relacionado con su hobby?", "label": "hobbys"},
    {"text": "¿Qué habilidades ha adquirido gracias a su hobby que podrían ser relevantes para este trabajo?", "label": "hobbys"},
    {"text": "¿Tiene algún hobby que demuestre su habilidad para resolver problemas?", "label": "hobbys"},
    {"text": "¿Ha podido enseñar o compartir su hobby con otras personas?", "label": "hobbys"},
    {"text": "¿Cómo ha influenciado su hobby su toma de decisiones y su actitud hacia el trabajo?", "label": "hobbys"},
    // CHAT
    {"text": "Cómo hiciste este chat?", "label": "chat"}, 
    {"text": "Como funciona esto?", "label": "chat"}, 
    {"text": "Que usaste para armar esta aplicación?", "label": "chat"}, 
    {"text": "Que usaste para armar este chat?", "label": "chat"},
    {"text": "Que usaste para armar este bot?", "label": "chat"},
    {"text": "Que usaste para armar este asistente virtual?", "label": "chat"},
    {"text": "Que usaste para armar este asistente?", "label": "chat"},
    // INSULTS
    {"text": "Idiota", "label": "insults"},
    {"text": "Mentiroso", "label": "insults"},
    {"text": "Tonto", "label": "insults"},
    {"text": "Estupido", "label": "insults"},
    {"text": "Corto de mente", "label": "insults"},
    {"text": "No servis para nada", "label": "insults"},
    {"text": "Inutil", "label": "insults"},
    {"text": "No haces nada", "label": "insults"},
    // UNKNOWN
    {"text": "Tenes perro?", "label": "unknown"}, 
    {"text": "Cuál es tu hobby?", "label": "unknown"}, 
    {"text": "Conoces a chatGPT?", "label": "unknown"}, 
    {"text": "¿Tienes alguna debilidad que hayas trabajado para mejorar?", "label": "unknown"},
    {"text": "¿Qué logros te enorgullecen más en tu carrera?", "label": "unknown"},
    {"text": "¿Qué tipo de trabajo te resulta más desafiante?", "label": "unknown"},
    {"text": "¿Cómo te adaptas a situaciones nuevas o desconocidas?", "label": "unknown"},
    {"text": "¿Cómo te motivas a ti mismo/a?", "label": "unknown"},
    {"text": "¿Has trabajado en un proyecto que haya fallado? ¿Qué aprendiste de ello?", "label": "unknown"},
    {"text": "¿Cómo manejas el estrés y la presión en el trabajo?", "label": "unknown"},
    {"text": "¿Cómo lidias con conflictos en el trabajo?", "label": "unknown"},
    {"text": "¿Cómo te mantienes organizado/a y enfocado/a en tus tareas?", "label": "unknown"},
    {"text": "¿Tienes experiencia en liderazgo de equipos? ¿Cómo lo haces?", "label": "unknown"},
    {"text": "¿Qué habilidades o conocimientos te gustaría desarrollar en el futuro?", "label": "unknown"},
    {"text": "¿Cómo defines el éxito en tu carrera?", "label": "unknown"},
    {"text": "Hablame sobre la vida", "label": "unknown"}, 
];

const ANSWERS = {

    intro: (<p>Gracias por visitar mi bot! 🤗 Soy Federico Navós. Tengo 22 años y vivo en Rosario, Argentina. Soy Ingeniero en Sistemas y Desarrollador Fullstack 💻. Tengo 3 años de experiencia como desarrollador, tanto en aplicaciones web como en análisis de datos. Actualmente trabajo en <a href="http://gptrading.com.ar/newweb/" target="_blank" rel="noreferrer">GP Trading</a> como Desarrollador Python.</p>), 

    experience: (
    <>
        <p>Desde 2021 a la actualidad, me encuentro trabajando en GP Trading como Desarrollador Python, haciendo automatización de informes, scraping de datos y desarrollo de estrategias de trading 📈.</p>
        <p>He trabajado en NEORIS como Desarrollador Fullstack, utilizando tecnologías como Angular, entorno .NET y SQL Server. Podés encontrar más información sobre mi carrera <a href="https://drive.google.com/uc?export=download&id=1vdsco5P4G9WOPWEyO2gt2ckJH2zPhdQF">descargando mi CV aquí</a>.</p>
        <p>También me gusta desarrollar proyectos personales para aprender nuevas tecnologías. Puedes encontrar más información en mi <a href="https://github.com/fedenavos" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon icon={ faGithub } /> o en <a href="https://federiconavos.netlify.app/" target="_blank" rel="noreferrer">mi página de portfolio</a> .</p>
    </>),

    newjob: (<p>No estoy activamente buscando trabajo en este momento, pero estoy dispuesto a escuchar cualquier propuesta. Podés contactarme a través de mi <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon icon={ faLinkedin } /> o enviarme un <a href="mailto:federiconavos@gmail.com">email</a> y con gusto te responderé 🤗.</p>),

    contact: (<p>Podés contactarme a través de mi <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer">LinkedIn</a> <FontAwesomeIcon icon={ faLinkedin } /> o enviarme un <a href="mailto:federiconavos@gmail.com">email</a> en cualquier momento 🕑.</p>),

    language: (<p>Me manejo muy bien con el inglés, tanto hablado como escrito. Tengo aprobado el First Certificate in English (FCE) con una calificación de 179/190, es decir, que tengo un nivel B2.</p>),

    education: (
    <>
        <p>Estudié en la Universidad Tecnológica Nacional (UTN) de Rosario, donde obtuve el título de Ingeniero en Sistemas el año pasado 🎓. Ahi aprendí a modelar y analizar sistemas de información, utilizando herramientas como UML. También realicé cursos de programación que me enseñaron los conceptos básicos del mismo y donde aprendí a desarrollar aplicaciones web con tecnologías como React, .NET y SQL Server.</p>
        <p>Mis estudios en la UTN me dieron una sólida base en el desarrollo de software, pero también me enseñaron a pensar de forma crítica y a resolver problemas de forma eficiente. Esto me permitió desarrollar habilidades como la capacidad de trabajar en equipo, la resolución de problemas y la comunicación efectiva.</p>
        <p>En cuanto a mis estudios secundarios, realicé mi eduación completa en el Colegio La Salle de Rosario. Allí fui primer escolta de la bandera nacional y obtuve el título de Bachiller en Economía y Administración en el año 2017. También participé como Coordinador de la Pastoral Juvenil de la escuela durante más de 6 años.</p>
        <p>Puedes encontrar más información sobre mi carrera <a href="https://drive.google.com/uc?export=download&id=1vdsco5P4G9WOPWEyO2gt2ckJH2zPhdQF">descargando mi CV aquí</a> <FontAwesomeIcon icon={ faDownload } /> .</p>
    </>),

    courses: (
    <>
        <p>Me gusta aprender cosas nuevas y me gusta mucho aprender de forma autodidacta. Aquí van algunos de los cursos que realicé en los últimos años:</p>
        <ul>
            <li>Curso de Introducción al Desarrollo Web: HTML y CSS <FontAwesomeIcon icon={ faHtml5 } /> <FontAwesomeIcon icon={ faCss3Alt } /> - Google Actívate</li>
            <li>Angular: De cero a experto (Legacy) <FontAwesomeIcon icon={ faAngular } /> con Fernando Herrera</li>
            <li>The Complete 2020 Flutter Development Bootcamp with Dart <FontAwesomeIcon icon={ faAndroid } /> - Udemy, Angela Yu</li>
            <li>La guía definitiva del desarrollo de videojuegos con Unity <FontAwesomeIcon icon={ faGamepad } /> - Udemy, brindado por Unity</li>
            <li>Laboratorio .NET <FontAwesomeIcon icon={ faCode } /> - NEORIS</li>
            <li>Taller de Estrategia de Portafolio de Inversión <FontAwesomeIcon icon={ faChartLine } /> - Clave Bursátil</li>
            <li>Algo Trading <FontAwesomeIcon icon={ faChartLine } /> - BCR Capacita</li>
        </ul>   
    </>),

    skills: (
    <div>
        <p>Soy una persona que siempre está buscando aprender nuevas tecnologías. Aquí van algunas de las tecnologías que fui aprendiendo, tanto en la facultad como de forma autodidacta:</p>
        <ul>
            <li>Python <FontAwesomeIcon icon={ faPython } /></li> 
            <li>React/Next JS <FontAwesomeIcon icon={ faReact } /></li>
            <li>JavaScript/Typescript <FontAwesomeIcon icon={ faJsSquare } /></li>
            <li>Bases de datos SQL <FontAwesomeIcon icon={ faDatabase } /></li>
            <li>Angular <FontAwesomeIcon icon={ faAngular } /></li>
            <li>.NET <FontAwesomeIcon icon={ faCode } /></li>
            <li>Git <FontAwesomeIcon icon={ faGithub } /></li>
        </ul>
        <p>Actualmente me encuentro explorando nuevas tecnologías como programación de Smart Contracts con Solidity y desarrollo mobile con Flutter.</p> 
    </div>),

    life_skills: (
    <div>
        <p>Te cuento un poco cuáles creo que son mis habilidades más importantes. Siempre fui muy responsable en todas mis funciones, tomando la iniciativa y asegurándome de cumplir con mis responsabilidades de manera efectiva.</p>
        <p>Soy una persona muy organizada, que siempre busca la mejor manera de realizar sus tareas. Y esto ayuda también a mi capacidad de trabajo en equipo, ya que siempre estoy dispuesto a ayudar a mis compañeros de trabajo.</p>
        <p>También tengo una gran capacidad de aprendizaje, que me permite adquirir nuevos conocimientos aplicarlos rápidamente en mi trabajo diario. Además, mi habilidad analítica me permiten analizar y resolver problemas complejos de manera efectiva.</p>
    </div>),

    insults: (
    <div>
        <p>¿Por qué me insultás? Ni a mi ni a Federico nos gusta esto 😢</p>
        <p>No es el objetivo de este chat. Si querés podes hablar con él por <a href="mailto:federiconavos@gmail.com">email</a>.</p>
    </div>),

    hobbys: (
    <div>
        <p>Soy una persona muy interesada en el mundo de la tecnología, sobre todo en lo que es el mundo <strong>fintech</strong>. Principalmente me considero un experto en todo lo que es criptomonedas <FontAwesomeIcon icon={ faBitcoin } />. Me interesa la blockchain como tecnología y analizar los proyectos que se están desarrollando en este campo.</p>
        <p>Me gusta mucho el fútbol ⚽. Soy hincha fanático de River Plate y me gusta mucho ver los partidos de mi equipo. También me gustan los videojuegos 🎮, es por eso que hice cursos para programación de los mismos.</p>
    </div>
    ),

    chat: (
    <div>
        <p>Este chat-bot fue desarrollado con <a href="https://nextjs.org/" target="_blank" rel="noreferrer">Next.js</a> y <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">TypeScript</a> para el front-end.</p>
        <p>Para la clasificación de preguntas utilicé la API de <a href="https://cohere.ai/" target="_blank" rel="noreferrer">Cohere</a>, que brinda herramientas IA gratis para desarrolladores. Entrené el dataset con preguntas y gracias a esto puedo clasificar cada uno de tus mensajes para encontrar la mejor respuesta 🙂.</p>
        <p>El código fuente lo podés encontrar en <a href="https://github.com/fedenavos/chat-bot" target="_blank" rel="noreferrer">Github</a> <FontAwesomeIcon icon={ faGithub } />.</p>
    </div>),

    default: (<p>Lo siento, soy una IA un poco limitada 😅 y no entiendo algunas preguntas. Podés preguntarme sobre mi experiencia, mi disponibilidad para trabajar, cómo contactarme, entre otras cosas.</p>),

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
            (messages) => messages.concat({
                id: new Date().getTime().toString(),
                content: question,
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
                content: ANSWERS[prediction as keyof typeof ANSWERS] || ANSWERS.default,
                type: "bot"
            })
        );

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
                            { message.type === 'bot' ? <Message content={message.content} /> : message.content  }
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
