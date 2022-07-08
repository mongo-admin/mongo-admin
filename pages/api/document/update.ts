import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import * as parser from 'mongodb-query-parser';

type Data = {
  success: boolean,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { uri, database, collection, document } = req.body;
  const parsedDocument = parser(document);
  const client = await MongoClient.connect(uri);
  const connect = await client.db(database).collection(collection);

  await connect.updateOne({ _id: parsedDocument._id }, { $set: parsedDocument });

  res.status(200).json({ success: true });
}
