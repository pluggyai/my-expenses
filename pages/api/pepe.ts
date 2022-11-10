import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ accessToken: string }>
) {
  res.status(200).end();
  setTimeout(() => fetch('https://pruebaaaaaaaa.requestcatcher.com'), 5000);
}
