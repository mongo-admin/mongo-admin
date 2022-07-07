import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Backdrop, CircularProgress, Box, Stack, Typography, Link, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import * as cookie from '../../../libs/cookie';
import styles from '../../../styles/Database.module.css';

const Database: NextPage = () => {
  const [uri, setUri] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [databaseStats, setDatabaseStats] = React.useState<any>({});
  const [collections, setCollections] = React.useState<any[]>([]);
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
      requestDatabaseInfo(database);
    }
  }, [uri, database]);

  const requestDatabaseInfo = async (dbName: string | string[] | undefined) => {
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

  const onClickDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const Collections = collections.map((collection: any, index: number) => {
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
            <Box>
              <Button variant="contained" color="warning" startIcon={<ArrowBackIosNewIcon />} onClick={() => router.back()}>Back</Button>
            </Box>
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

      <Backdrop
        open={loading}
        sx={{ color: '#FFFFFF' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default Database;
