import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

type Data = {
  success: boolean,
  message?: string,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { uri } = req.body;
    const client = await MongoClient.connect(uri);

    client.close();

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
