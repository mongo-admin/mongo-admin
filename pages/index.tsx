import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import * as cookie from '../libs/cookie';
import styles from '../styles/Redirect.module.css';

const Redirect: NextPage = () => {
  const router = useRouter();

  React.useEffect(() => {
    if(!cookie.check('CONNECTION-URI')) {
      router.replace('/connect');
    } else {
      router.replace('/databases');
    }
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        Redirect...
      </main>
    </div>
  );
};

export default Redirect;
