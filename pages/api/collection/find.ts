import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, Document, WithId } from 'mongodb';

type Data = {
  success: boolean,
  collectionStats?: Document,
  documentsTotalCount?: number,
  documents?: WithId<Document>[],
  message?: string,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { uri, database, collection, page, rowsPerPage, key, value } = req.body;
    const client = await MongoClient.connect(uri);
    const connect = await client.db(database).collection(collection);
    const collectionStats = await connect.stats();
    const documentsTotalCount = await connect.countDocuments({[key]: value});
    const documents = await connect.find({[key]: value}).skip(page * rowsPerPage).limit(rowsPerPage).toArray();

    client.close();

    res.status(200).json({ success: true, collectionStats, documentsTotalCount, documents });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
