import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Backdrop, CircularProgress, Box, Stack, Typography, Link, Button, Modal, TextField, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import AddBoxIcon from '@mui/icons-material/AddBox';
import * as cookie from '../../libs/cookie';
import styles from '../../styles/Databases.module.css';

const Databases: NextPage = () => {
  const [uri, setUri] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [databaseInfo, setDatabaseInfo] = React.useState<any>(null);
  const [openNewModal, setOpenNewModal] = React.useState<boolean>(false);
  const [newDatabaseName, setNewDatabaseName] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const router = useRouter();

  React.useEffect(() => {
    if(!cookie.check('CONNECTION-URI')) {
      router.replace('/connect');
    }

    setUri(cookie.get('CONNECTION-URI'));
  }, []);

  React.useEffect(() => {
    if(uri?.length) {
      requestDatabaseList();
    }
  }, [uri]);

  const requestDatabaseList = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/database/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uri }),
      });

      if(res.status === 200) {
        const data = await res.json();

        setDatabaseInfo(data.databases);
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
    
    setNewDatabaseName('');
    setOpenNewModal(true);
  };

  const onClickSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/database/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uri, database: newDatabaseName }),
      });

      if(res.status === 200) {
        setOpenNewModal(false);
        requestDatabaseList();
      } else {
        const data = await res.json();

        setMessage(data.message);
      }
    } catch (err) {
      router.replace('/connect');
    }
  };

  const Databases = databaseInfo?.databases?.map((item: any, index: number) => {
    const onClickDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
  
      if(!window.confirm('Delete a database.')) {
        return;
      }
  
      try {
        const res = await fetch('/api/database/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uri, database: item.name }),
        });
  
        if(res.status === 200) {
          requestDatabaseList();
        } else {
          const data = await res.json();
  
          setMessage(data.message);
        }
      } catch (err) {
        router.replace('/connect');
      }
    };

    return (
      <Link key={item.name} href={`${router.asPath}/${item.name}`} underline="hover">
        <Stack spacing={4} p={2} direction="row" alignItems="center" justifyContent="space-between" sx={{ backgroundColor: '#FAFAFA' }}>
          <Box>{`${item.name} (${item.sizeOnDisk / 1024} KB)`}</Box>
          <Button variant="contained" color="error" onClick={onClickDelete}><DeleteIcon /></Button>
        </Stack>
      </Link>
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
        {databaseInfo ? (
          <Stack spacing={4}>
            <Stack spacing={8} direction="row" justifyContent="flex-end">
              <Button variant="contained" color="success" startIcon={<AddBoxIcon />} onClick={onClickNew}>New Database</Button>
            </Stack>
            <Box sx={{ px: 6, py: 2, textAlign: 'center', backgroundColor: '#FAFAFA' }}>
              {`Connected URI: ${uri}`}
            </Box>
            <Stack spacing={2} direction="row">
              <Box sx={{ flex: 1, px: 2, py: 4, backgroundColor: '#FAFAFA', textAlign: 'center' }}>
                {`DB Count: ${databaseInfo?.databases?.length}`}
              </Box>
              <Box sx={{ flex: 1, px: 2, py: 4, backgroundColor: '#FAFAFA', textAlign: 'center' }}>
                {`Size: ${databaseInfo?.totalSize / 1024} KB`}
              </Box>
              <Box sx={{ flex: 1, px: 2, py: 4, backgroundColor: '#FAFAFA', textAlign: 'center' }}>
                {`Size: ${databaseInfo?.totalSizeMb} MB`}
              </Box>
            </Stack>
            <Stack spacing={1}>
              {Databases}
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
            label="new-database"
            placeholder="Database Name"
            value={newDatabaseName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDatabaseName(e.target.value)}
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

export default Databases;
