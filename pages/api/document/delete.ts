import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

type Data = {
  success: boolean,
  message?: string,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { uri, database, collection, document } = req.body;
    const client = await MongoClient.connect(uri);
    const connect = await client.db(database).collection(collection);

    await connect.deleteOne({ _id: new ObjectId(document) });

    client.close();

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
