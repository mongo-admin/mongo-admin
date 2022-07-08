import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import * as parser from 'mongodb-query-parser';

type Data = {
  success: boolean,
  document: string,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { uri, database, collection, documentId } = req.body;
  const client = await MongoClient.connect(uri);
  const connect = await client.db(database).collection(collection);
  const document = await connect.findOne({ _id: new ObjectId(documentId) });

  client.close();

  res.status(200).json({ success: true, document: parser.toJSString(document, 4) });
}
