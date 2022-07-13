import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ListDatabasesResult } from 'mongodb';

type Data = {
  success: boolean,
  databases?: ListDatabasesResult,
  message?: string,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { uri } = req.body;
    const client = await MongoClient.connect(uri);
    const connect = await client.db('admin').admin();
    const databases = await connect.listDatabases();

    client.close();

    res.status(200).json({ success: true, databases });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
