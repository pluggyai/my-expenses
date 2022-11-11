import { groupBy, sumBy, sortBy } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Transaction } from 'pluggy-sdk';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, accounts!inner(*)')
    .eq('accounts.itemId', req.query.itemId);

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

  const startDate = sortBy(transactions, ['date'])[0].date;

  res.status(200).json({
    categoryBalances: sortBy(categoryBalances, ['balance']),
    startDate,
  });
}
