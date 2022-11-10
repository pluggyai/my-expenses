import type { NextApiRequest, NextApiResponse } from 'next';
import { PluggyClient } from 'pluggy-sdk';
import { createClient } from '@supabase/supabase-js'


const PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID || '';
const PLUGGY_CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const client = new PluggyClient({
    clientId: PLUGGY_CLIENT_ID,
    clientSecret: PLUGGY_CLIENT_SECRET,
  });
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const accounts = await client.fetchAccounts(req.query.itemId as string);
  const transactions = [];
  for (const account of accounts.results) {
    const accountTransactions = await client.fetchAllTransactions(account.id);
    transactions.push(...accountTransactions);
    
    await supabase
      .from('accounts')
      .upsert({id: account.id, itemId: account.itemId})
    
    await supabase
      .from('transactions')
      .upsert(accountTransactions.map(tx => ({id: tx.id, accountId: tx.accountId, amount: tx.amount,  category: tx.category})))
  
  }

  res.status(201).json({ itemId: req.query.itemId });
}
