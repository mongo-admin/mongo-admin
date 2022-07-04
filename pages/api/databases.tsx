import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ListDatabasesResult } from 'mongodb';

type Data = {
  success: boolean,
  databases: ListDatabasesResult,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { uri } = req.body;
  const client = await MongoClient.connect(uri);
  const connect = await client.db('admin').admin();
  const listDatabases = await connect.listDatabases();

  console.log(listDatabases);

  res.status(200).json({ success: true, databases: listDatabases });
}