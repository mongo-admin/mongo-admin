import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, Document, WithId } from 'mongodb';

type Data = {
  success: boolean,
  collectionStats: Document,
  documents: WithId<Document>[],
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { uri, database, collection } = req.body;
  const client = await MongoClient.connect(uri);
  const connect = await client.db(database).collection(collection);
  const collectionStats = await connect.stats();
  const documents = await connect.find({}).toArray();

  client.close();

  res.status(200).json({ success: true, collectionStats, documents });
}
