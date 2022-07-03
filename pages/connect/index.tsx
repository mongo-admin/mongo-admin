import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Alert, Snackbar, Backdrop, CircularProgress, Box, Stack, TextField, Button, Typography } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import * as cookie from '../../libs/cookie';
import styles from '../../styles/Connect.module.css';

const Connect: NextPage = () => {
  const [uri, setUri] = React.useState<string>('mongodb://root:password@localhost:27017');
  const [message, setMessage] = React.useState<string>('');
  const [connecting, setConnecting] = React.useState<boolean>(false);
  const router = useRouter();

  const requestConnect = async () => {
    if(!uri.length) {
      setMessage('URI is empty.');
      return;
    }

    setConnecting(true);

    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uri }),
      });

      cookie.set('CONNECTION-URI', uri);
      
      router.push('/databases');
    } catch (err) {
      setMessage('Cannot connect to db.');
    } finally {
      setConnecting(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUri(e.target.value);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Box sx={{ py: 4, px: 6, borderRadius: 1, backgroundColor: '#292B33' }}>
          <Stack spacing={2} direction="column">
            <Typography variant="h4" color="#FFFFFF">{'MONGO ADMIN'}</Typography>
            <TextField
              variant="standard"
              label="URI"
              placeholder="mongodb://"
              InputLabelProps={{ style: { color: '#898989' } }}
              sx={{ input: { color: '#FFFFFF' } }}
              value={uri}
              onChange={onChange}
            />
            <Button variant="contained" sx={{ width: 1 }} endIcon={<LoginIcon />} onClick={requestConnect}>Connect</Button>
          </Stack>
        </Box>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>

      <Snackbar
        open={!!message.length}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        autoHideDuration={3000}
        onClose={() => setMessage('')}>
        <Alert severity="error">
          {message}
        </Alert>
      </Snackbar>

      <Backdrop
        open={connecting}
        sx={{ color: '#FFFFFF' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default Connect;
