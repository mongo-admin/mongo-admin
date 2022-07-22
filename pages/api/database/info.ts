import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, Document, CollectionInfo } from 'mongodb';

type Data = {
  success: boolean,
  databaseStats?: Document,
  collections?: (CollectionInfo | Pick<CollectionInfo, "name" | "type">)[],
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
    const databaseStats = await connect.stats();
    const collections = await connect.listCollections().toArray();

    client.close();

    res.status(200).json({ success: true, databaseStats, collections });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });  
  }
}
