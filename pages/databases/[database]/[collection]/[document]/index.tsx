import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Backdrop, CircularProgress, Box, Stack, Typography, Button, TextField } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SaveIcon from '@mui/icons-material/Save';
import * as cookie from '../../../../../libs/cookie';
import styles from '../../../../../styles/Document.module.css';

const Document: NextPage = () => {
  const [uri, setUri] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [documentInfo, setDocumentInfo] = React.useState<string>('');
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
      requestDocumentInfo();
    }
  }, [uri, database, collection, document]);

  const requestDocumentInfo = async () => {
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

        setDocumentInfo(JSON.stringify(data.document, null, 4));
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
  };

  const onClickBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    router.back();
  };

  const onClickSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const onChangeEditor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentInfo(e.target.value);
  };

  const Editor = (
    <TextField
      sx={{ width: '80vw' }}
      label={`document - ${document}`}
      multiline
      variant="filled"
      maxRows={20}
      value={documentInfo}
      onChange={onChangeEditor}
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
          <Stack spacing={4}>
            <Box display="flex" justifyContent="space-between">
              <Button variant="contained" color="warning" startIcon={<ArrowBackIosNewIcon />} onClick={onClickBack}>Back</Button>
              <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={onClickSave}>Save</Button>
            </Box>
            {Editor}
          </Stack>
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
