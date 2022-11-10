import type { NextApiRequest, NextApiResponse } from 'next'
import { PluggyClient } from 'pluggy-sdk'

const PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID || ''
const PLUGGY_CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET || ''

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ accessToken: string }>
) {

  const client = new PluggyClient({
    clientId: PLUGGY_CLIENT_ID,
    clientSecret: PLUGGY_CLIENT_SECRET,
  });

  const connectToken = await client.createConnectToken()

  res.status(200).json(connectToken)
}
