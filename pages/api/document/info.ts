import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, Document, WithId, ObjectId } from 'mongodb';

type Data = {
  success: boolean,
  document: WithId<Document> | null,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { uri, database, collection, documentId } = req.body;
  const client = await MongoClient.connect(uri);
  const connect = await client.db(database).collection(collection);
  const document = await connect.findOne({ _id: new ObjectId(documentId) });

  console.log(document);

  res.status(200).json({ success: true, document });
}