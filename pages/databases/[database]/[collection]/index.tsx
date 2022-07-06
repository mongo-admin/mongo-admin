import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Backdrop, CircularProgress, Box, Stack, Typography, Link, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import * as cookie from '../../../../libs/cookie';
import styles from '../../../../styles/Collection.module.css';

const Collection: NextPage = () => {
  const [uri, setUri] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [collectionStats, setCollectionStats] = React.useState<any>({});
  const [documents, setDocuments] = React.useState<any[]>([]);
  const router = useRouter();
  const { database, collection } = router.query;

  React.useEffect(() => {
    if(!cookie.check('CONNECTION-URI')) {
      router.replace('/connect');
    }

    setUri(cookie.get('CONNECTION-URI'));
  }, []);

  React.useEffect(() => {
    if(uri?.length && database && collection) {
      requestCollectionInfo();
    }
  }, [uri, database, collection]);

  const requestCollectionInfo = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/collection/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uri, database, collection }),
      });

      if(res.status === 200) {
        const data = await res.json();
        console.log(data);
        setCollectionStats(data.collectionStats);
        setDocuments(data.documents);
      } else {
        // router.replace('/connect');  
      }
    } catch (err) {
      // router.replace('/connect');
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

  const Documents = documents.map((document: any, index: number) => {
    return (
      <Link key={document.name} href={`${router.asPath}/${document.name}`} underline="hover">
        <Stack spacing={4} p={2} direction="row" alignItems="center" justifyContent="space-between" sx={{ backgroundColor: '#FAFAFA' }}>
          <Box>{document.name}</Box>
          <Button variant="contained" color="error" onClick={onClickDelete}><DeleteIcon /></Button>
        </Stack>
      </Link>
    );
  });

  const CollectionStats = Object.keys(collectionStats).map((key: string, index: number) => {
    if(typeof collectionStats[key] !== 'object') {
      return (
        <Stack key={key} spacing={16} p={2} direction="row" alignItems="center" justifyContent="space-between" sx={{ backgroundColor: '#FAFAFA' }}>
          <Box>{key}</Box>
          <Box>{collectionStats[key]}</Box>
        </Stack>
      );
    }
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
            <Box sx={{ px: 6, py: 2, textAlign: 'center', backgroundColor: '#FAFAFA' }}>
              {`Collection Name: ${collection}`}
            </Box>
            <Stack spacing={1}>
              {Documents}
            </Stack>
            <Stack spacing={1}>
              {CollectionStats}
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

export default Collection;
