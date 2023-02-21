import styles from '@/styles/Footer.module.css'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default function Footer() {
    return (
        <footer className={styles.footer}>
            <p className={styles.footerContent}>Made by © Federico Navós 2023</p>
            <a href="https://github.com/fedenavos" target="_blank" rel="noreferrer" className={styles.link}>
                <FontAwesomeIcon icon={ faGithub } className={styles.socialIcon} />
            </a>
            <a href="https://www.linkedin.com/in/federico-navos/" target="_blank" rel="noreferrer" className={styles.link}>
                <FontAwesomeIcon icon={ faLinkedin } className={styles.socialIcon} />
            </a>
            
        </footer>
    );
}
