import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, Document, CollectionInfo } from 'mongodb';

type Data = {
  success: boolean,
  message?: string,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { uri, database } = req.body;
    const client = await MongoClient.connect(uri);
    const connect = await client.db(database);
    
    await connect.dropDatabase();

    client.close();

    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
