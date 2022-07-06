import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Backdrop, CircularProgress, Box, Stack, Typography, Link, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import * as cookie from '../../libs/cookie';
import styles from '../../styles/Databases.module.css';

const Databases: NextPage = () => {
  const [uri, setUri] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [databaseInfo, setDatabaseInfo] = React.useState<any>(null);
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

  const onClickDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const Databases = databaseInfo?.databases?.map((item: any, index: number) => {
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

      <Backdrop
        open={loading}
        sx={{ color: '#FFFFFF' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default Databases;
