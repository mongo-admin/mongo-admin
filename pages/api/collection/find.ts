import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, Document, WithId, ObjectId } from 'mongodb';

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
    const { uri, database, collection, page, rowsPerPage, key, value, valueType } = req.body;
    const client = await MongoClient.connect(uri);
    const connect = await client.db(database).collection(collection);
    const collectionStats = await connect.stats();
    let query = {};

    switch(valueType) {
      case 'string':
        query = {[key]: value};
        break;
      case 'number':
        query = {[key]: Number(value)};
        break;
      case 'objectid':
        query = {[key]: new ObjectId(value)};
        break;
      default:
        break;
    }

    const documentsTotalCount = await connect.countDocuments(query);
    const documents = await connect.find(query).skip(page * rowsPerPage).limit(rowsPerPage).toArray();

    client.close();

    res.status(200).json({ success: true, collectionStats, documentsTotalCount, documents });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
