import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Backdrop, CircularProgress, Box, Stack, Typography, Link, Button, Modal, TextField, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import * as cookie from '../../../libs/cookie';
import styles from '../../../styles/Database.module.css';

const Database: NextPage = () => {
  const [uri, setUri] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [databaseStats, setDatabaseStats] = React.useState<any>({});
  const [collections, setCollections] = React.useState<any[]>([]);
  const [openNewModal, setOpenNewModal] = React.useState<boolean>(false);
  const [newCollectionName, setNewCollectionName] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const router = useRouter();
  const { database } = router.query;

  React.useEffect(() => {
    if(!cookie.check('CONNECTION-URI')) {
      router.replace('/connect');
    }

    setUri(cookie.get('CONNECTION-URI'));
  }, []);

  React.useEffect(() => {
    if(uri?.length && database) {
      requestDatabaseInfo();
    }
  }, [uri, database]);

  const requestDatabaseInfo = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/database/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uri, database }),
      });

      if(res.status === 200) {
        const data = await res.json();

        setDatabaseStats(data.databaseStats);
        setCollections(data.collections);
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

  const onClickNew = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    setNewCollectionName('');
    setOpenNewModal(true);
  };

  const onClickSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/collection/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uri, database, collection: newCollectionName }),
      });

      if(res.status === 200) {
        setOpenNewModal(false);
        requestDatabaseInfo();
      } else {
        const data = await res.json();

        setMessage(data.message);
      }
    } catch (err) {
      router.replace('/connect');
    }
  };

  const Collections = collections.map((collection: any, index: number) => {
    const onClickDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if(!window.confirm('Delete a collection.')) {
        return;
      }

      try {
        const res = await fetch('/api/collection/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uri, database, collection: collection.name }),
        });

        if(res.status === 200) {
          requestDatabaseInfo();
        } else {
          const data = await res.json();

          setMessage(data.message);
        }
      } catch (err) {
        router.replace('/connect');
      }
    };

    return (
      <Link key={collection.name} href={`${router.asPath}/${collection.name}`} underline="hover">
        <Stack spacing={4} p={2} direction="row" alignItems="center" justifyContent="space-between" sx={{ backgroundColor: '#FAFAFA' }}>
          <Box>{collection.name}</Box>
          <Button variant="contained" color="error" onClick={onClickDelete}><DeleteIcon /></Button>
        </Stack>
      </Link>
    );
  });

  const DatabaseStats = Object.keys(databaseStats).map((key: string, index: number) => {
    return (
      <Stack key={key} spacing={16} p={2} direction="row" alignItems="center" justifyContent="space-between" sx={{ backgroundColor: '#FAFAFA' }}>
        <Box>{key}</Box>
        <Box>{databaseStats[key]}</Box>
      </Stack>
    );
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Typography variant="h6">{'Mongo Admin'}</Typography>
        <Box>
          <Button variant="contained" color="error" endIcon={<LogoutIcon />} onClick={onClickDisconnect}>Disconnect</Button>
        </Box>
      </header>

      <main className={styles.main}>
        {database ? (
          <Stack spacing={4}>
            <Stack spacing={8} direction="row" justifyContent="space-between">
              <Button variant="contained" color="warning" startIcon={<ArrowBackIosNewIcon />} onClick={() => router.back()}>Back</Button>
              <Button variant="contained" color="success" startIcon={<AddBoxIcon />} onClick={onClickNew}>New Collection</Button>
            </Stack>
            <Box sx={{ px: 6, py: 2, textAlign: 'center', backgroundColor: '#FAFAFA' }}>
              {`DB Name: ${database}`}
            </Box>
            <Stack spacing={1}>
              {Collections}
            </Stack>
            <Stack spacing={1}>
              {DatabaseStats}
            </Stack>
          </Stack>
        ) : null}
      </main>

      <Modal
        open={openNewModal}
        onClose={() => setOpenNewModal(false)}>
        <Stack
          spacing={2}
          sx={{ p: 4, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFFFFF' }}>
          <TextField
            sx={{ width: 480, backgroundColor: '#FAFAFA' }}
            label="new-collection"
            placeholder="Collection Name"
            value={newCollectionName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCollectionName(e.target.value)}
          />
          <Stack spacing={2} direction="row" justifyContent="space-between">
            <Button variant="outlined" onClick={() => setOpenNewModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={onClickSave}>Save</Button>
          </Stack>
        </Stack>
      </Modal>

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

export default Database;
