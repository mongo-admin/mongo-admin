import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Alert, Snackbar, Backdrop, CircularProgress, Box, Stack, TextField, Button, Typography } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import * as cookie from '../../libs/cookie';
import styles from '../../styles/Connect.module.css';

const Connect: NextPage = () => {
  const [uri, setUri] = React.useState<string>('mongodb://root:U7J92NegZuPI@localhost:27017');
  const [message, setMessage] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const router = useRouter();

  React.useEffect(() => {
    cookie.remove('CONNECTION-URI');
  }, []);

  const requestConnect = async () => {
    if(!uri.length) {
      setMessage('URI is empty.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uri }),
      });

      if(res.status === 200) {
        cookie.set('CONNECTION-URI', uri);

        router.replace('/databases');
      } else {
        setMessage('Cannot connect to DB.');
      }
    } catch (err) {
      setMessage('Cannot connect to DB.');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUri(e.target.value);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Box sx={{ py: 4, px: 6, borderRadius: 1, backgroundColor: '#FAFAFA' }}>
          <Stack spacing={4} direction="column">
            <Typography variant="h5" mx={10}>{'MONGO ADMIN'}</Typography>
            <TextField
              variant="standard"
              label="URI"
              placeholder="mongodb://"
              value={uri}
              onChange={onChange}
            />
            <Button variant="contained" sx={{ width: 1 }} endIcon={<LoginIcon />} onClick={requestConnect}>Connect</Button>
          </Stack>
        </Box>
      </main>

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
        open={loading}
        sx={{ color: '#FFFFFF' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default Connect;
