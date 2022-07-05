import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Backdrop, CircularProgress, Box, Stack, Grid, Typography, Link, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
    if(uri.length) {
      requestDatabaseList();
    }
  }, [uri]);

  const requestDatabaseList = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/databases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uri }),
      });

      if(res.status === 200) {
        const data = await res.json();

        setDatabaseInfo(data.databases);
      }
    } catch (err) {
      router.replace('/connect');
    } finally {
      setLoading(false);
    }
  };

  const onClickDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const Databases = databaseInfo?.databases?.map((item: any, index: number) => {
    return (
      <Link key={item.name} my={0.5} href="#" underline="hover">
        <Stack spacing={4} p={2} direction="row" alignItems="center" justifyContent="space-between" sx={{ backgroundColor: '#FAFAFA' }}>
          <Box>{`${item.name} (${item.sizeOnDisk / 1024} KB)`}</Box>
          <Button variant="contained" color="error" onClick={onClickDelete}><DeleteIcon /></Button>
        </Stack>
      </Link>
    );
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <Typography variant="h6">{'Mongo Admin'}</Typography>
      </header>

      <main className={styles.main}>
        <Stack>
          <Box sx={{ px: 6, py: 2, backgroundColor: '#FAFAFA' }}>
            {`Connected URI: ${uri}`}
          </Box>
          <Grid container spacing={2} mt={2}>
            <Grid item md={4}>
              <Box sx={{ px: 2, py: 4, backgroundColor: '#FAFAFA', textAlign: 'center' }}>
                {`DB Count: ${databaseInfo?.databases?.length}`}
              </Box>
            </Grid>
            <Grid item md={4}>
              <Box sx={{ px: 2, py: 4, backgroundColor: '#FAFAFA', textAlign: 'center' }}>
                {`Size: ${databaseInfo?.totalSize / 1024} KB`}
              </Box>
            </Grid>
            <Grid item md={4}>
              <Box sx={{ px: 2, py: 4, backgroundColor: '#FAFAFA', textAlign: 'center' }}>
                {`Size: ${databaseInfo?.totalSizeMb} MB`}
              </Box>
            </Grid>
          </Grid>
          <Stack mt={4}>
            {Databases}
          </Stack>
        </Stack>
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

      <Backdrop
        open={loading}
        sx={{ color: '#FFFFFF' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default Databases;
