import Link from 'next/link'
import styles from './header.module.scss'

export default function Header() {
  return(
    <header className={styles.container}>
      <div className={styles.content}>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="logo" />
            <span>spacetraveling</span>
            <span>.</span>
          </a>
        </Link>
      </div>
    </header>
  );
}
