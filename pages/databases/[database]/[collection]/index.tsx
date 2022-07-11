import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  Backdrop,
  CircularProgress,
  Box,
  Stack,
  Snackbar,
  Alert,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import * as cookie from '../../../../libs/cookie';
import styles from '../../../../styles/Collection.module.css';

const Collection: NextPage = () => {
  const [uri, setUri] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openNewModal, setOpenNewModal] = React.useState<boolean>(false);
  const [collectionStats, setCollectionStats] = React.useState<any>({});
  const [documents, setDocuments] = React.useState<any[]>([0]);
  const [message, setMessage] = React.useState<string>('');
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

        setCollectionStats(data.collectionStats);
        setDocuments(data.documents);
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

  const onClickDeleteAll = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if(!window.confirm('Delete all documents.')) {
      return;
    }

    try {
      const res = await fetch('/api/document/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uri, database, collection }),
      });

      if(res.status === 200) {
        requestCollectionInfo();
      } else {
        const data = await res.json();

        setMessage(data.message);
      }
    } catch (err) {
      router.replace('/connect');
    }
  };

  const onClickNew = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    setOpenNewModal(true);
  };

  const onClickRow = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, documentId: string) => {
    e.preventDefault();

    router.push(`${router.asPath}/${documentId}`);
  };

  const Documents = (() => {
    if(!documents.length) {
      return (
        <Box sx={{ px: 6, py: 2, textAlign: 'center', backgroundColor: '#FAFAFA' }}>
          No documents
        </Box>
      );
    }

    let keys: any[] = [];

    const DocumentsTableHead = (() => {
      const TableHeadRows = Object.keys(documents[0]).map((key: string, index: number) => {
        keys.push(key);

        return (
          <TableCell key={key}>
            {key}
          </TableCell>
        );
      });
  
      TableHeadRows.unshift(
        <TableCell key={'delete-button'} />
      );

      return (
        <TableHead>
          <TableRow>
            {TableHeadRows}
          </TableRow>
        </TableHead>
      );
    })();
  
    const DocumentsTableBody = (() => {
      const TableBodyRows = documents.map((document: any, rowIndex: number) => {
        const onClickDeleteOne = async (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          e.preventDefault();

          if(!window.confirm('Delete a document.')) {
            return;
          }

          try {
            const res = await fetch('/api/document/delete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ uri, database, collection, document: document._id }),
            });
      
            if(res.status === 200) {
              requestCollectionInfo();
            } else {
              const data = await res.json();

              setMessage(data.message);
            }
          } catch (err) {
            router.replace('/connect');
          }
        };

        const TableBodyRowCells = Object.keys(document).map((key: string, cellIndex: number) => {
          return (
            <TableCell key={`${keys[cellIndex]}-${rowIndex}`} sx={{ whiteSpace: 'break-spaces', wordWrap: 'break-word' }}>
              {typeof document[keys[cellIndex]] === 'object' ? JSON.stringify(document[keys[cellIndex]], null, 2) : document[keys[cellIndex]]}
            </TableCell>
          );
        });

        TableBodyRowCells.unshift(
          <TableCell key={`delete-button-${rowIndex}`}>
            <Button variant="contained" color="error" onClick={onClickDeleteOne}><DeleteIcon /></Button>
          </TableCell>
        );
  
        return (
          <TableRow key={`document-${rowIndex}`} hover sx={{ cursor: 'pointer' }} onClick={(e) => onClickRow(e, document._id)}>
            {TableBodyRowCells}
          </TableRow>
        );
      });
  
      return (
        <TableBody>
          {TableBodyRows}
        </TableBody>
      );
    })();

    return (
      <TableContainer className={styles.table} sx={{ backgroundColor: '#FAFAFA' }}>
        <Table aria-label="simple table">
          {DocumentsTableHead}
          {DocumentsTableBody}
        </Table>
      </TableContainer>
    );
  })();

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
        {database && collection ? (
          <Stack spacing={4}>
            <Stack spacing={8} direction="row"justifyContent="space-between">
              <Button variant="contained" color="warning" startIcon={<ArrowBackIosNewIcon />} onClick={() => router.back()}>Back</Button>
              <Stack spacing={2} direction="row">
                <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={onClickDeleteAll}>Delete All</Button>
                <Button variant="contained" color="success" startIcon={<AddBoxIcon />} onClick={onClickNew}>New</Button>
              </Stack>
            </Stack>
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

      <Modal
        open={openNewModal}
        onClose={() => setOpenNewModal(false)}>
        <Box sx={{ p: 4, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFFFFF' }}>new</Box>
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

export default Collection;
