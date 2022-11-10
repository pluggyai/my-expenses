import { groupBy, sumBy, sortBy } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PluggyClient } from 'pluggy-sdk';

const PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID || '';
const PLUGGY_CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const client = new PluggyClient({
    clientId: PLUGGY_CLIENT_ID,
    clientSecret: PLUGGY_CLIENT_SECRET,
  });

  const accounts = await client.fetchAccounts(req.query.itemId as string);
  const transactions = [];
  for (const account of accounts.results) {
    const accountTransactions = await client.fetchAllTransactions(account.id);
    transactions.push(...accountTransactions);
  }

  const transactionsPerCategory = groupBy(
    transactions,
    (transaction) => transaction.category ?? 'Other'
  );

  const categoryBalances: { category: string; balance: number }[] = [];

  for (const category in transactionsPerCategory) {
    const transactions = transactionsPerCategory[category];
    const balance = +sumBy(
      transactions,
      (transaction) => transaction.amount
    ).toFixed(2);
    categoryBalances.push({ category, balance });
  }

  res.status(200).json(sortBy(categoryBalances, ['balance']).reverse());
}
