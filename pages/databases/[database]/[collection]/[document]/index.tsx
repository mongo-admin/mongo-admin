import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Backdrop, CircularProgress, Box, Stack, Typography, Button, TextField } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import * as cookie from '../../../../../libs/cookie';
import styles from '../../../../../styles/Document.module.css';

const Document: NextPage = () => {
  const [uri, setUri] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [documentInfo, setDocumentInfo] = React.useState<any>({});
  const router = useRouter();
  const { database, collection, document } = router.query;

  React.useEffect(() => {
    if(!cookie.check('CONNECTION-URI')) {
      router.replace('/connect');
    }

    setUri(cookie.get('CONNECTION-URI'));
  }, []);

  React.useEffect(() => {
    if(uri?.length && database && collection && document) {
      requestCollectionInfo();
    }
  }, [uri, database, collection, document]);

  const requestCollectionInfo = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/document/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uri, database, collection, documentId: document }),
      });

      if(res.status === 200) {
        const data = await res.json();

        setDocumentInfo(data.document);
      } else {
        router.replace('/connect');  
      }
    } catch (err) {
      router.replace('/connect');
    } finally {
      setLoading(false);
    }
  };

  const onClickDisconnect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    router.replace('/connect');
  }

  const onClickDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const Editor = (
    <TextField
      sx={{ width: '80vw' }}
      label="document"
      multiline
      variant="filled"
      maxRows={20}
      defaultValue={JSON.stringify(documentInfo, null, 4)}
    />
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Typography variant="h6">{'Mongo Admin'}</Typography>
        <Box>
          <Button variant="contained" color="error" endIcon={<LogoutIcon />} onClick={onClickDisconnect}>Disconnect</Button>
        </Box>
      </header>

      <main className={styles.main}>
        {database && collection && Object.keys(documentInfo).length ? (
          Editor
        ) : null}
      </main>

      <Backdrop
        open={loading}
        sx={{ color: '#FFFFFF' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default Document;
