
import styles from '../styles/Suggestion.module.css';

export default function Suggestion({ tag, question, callback }: { tag: string, question: string, callback: Function }) {
    return (
        <button
            className={styles.suggestedMessage}
            type="button"
            onClick={() => callback(question)}
        >{tag}</button>
    );
}
