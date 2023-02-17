import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Chat from '@/components/Chat'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Federico Chat-Bot</title>
        <meta name="description" content="AI bot which answers about Federico Navós" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${styles.center}`}>
        {/* <h1 className={styles.title}>
          Federico Chat-Bot
        </h1>
        <p className={styles.description}>
          AI bot which answers about Federico Navós
        </p> */}
        <Chat />
      </main>
    </>
  )
}
