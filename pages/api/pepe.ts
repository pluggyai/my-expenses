import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ accessToken: string }>
) {
  res.status(200).end();
  setTimeout(() => console.log('Hola'), 2000);
}
