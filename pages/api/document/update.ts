import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

type Data = {
  success: boolean,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { uri, database, collection, document } = req.body;
  const parsedDocument = JSON.parse(document);
  const client = await MongoClient.connect(uri);
  const connect = await client.db(database).collection(collection);
  
  await connect.updateOne({ _id: new ObjectId(parsedDocument.id) }, { $set: parsedDocument });

  res.status(200).json({ success: true });
}