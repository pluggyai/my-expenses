import Head from 'next/head'
import { useEffect, useState } from 'react';
import type { PluggyConnect as PluggyConnectType } from 'react-pluggy-connect'
import dynamic from 'next/dynamic';

const PluggyConnect = dynamic(
  () => (import('react-pluggy-connect') as any).then((mod: { PluggyConnect: any; }) => mod.PluggyConnect),
  { ssr: false }
) as typeof PluggyConnectType

export default function Home() {

  const [connectToken, setConnectToken] = useState<string>('')
  const [itemIdToUpdate, setItemIdToUpdate] = useState<string>()
  const [isWidgetOpen, setIsWidgetOpen] = useState<boolean>(false)
  const [categoryBalances, setCategoryBalances] = useState<{category: string, balance: number}[] | null>(null)

  useEffect(() => {
    if (!connectToken) {
      const fetchToken = async () => {
        const response = await fetch('/api/connect-token')
        const { accessToken } = await response.json()
        setConnectToken(accessToken)
      }

      fetchToken()
    }
  })

  const onSuccess = async (itemData: { item: any; }) => {
    setTimeout(async () => { // Wait for webhook to be sent from pluggy-api to our backend
      const transactionsResponse = await fetch('/api/transactions?itemId=' + itemData.item.id)
      const {categoryBalances, startDate} = await transactionsResponse.json()
      setIsWidgetOpen(false)
      setCategoryBalances(categoryBalances)
      setItemIdToUpdate(itemData.item.id)
    }, 5000)
  }

  return (
    <div>
      <Head>
        <title>Pluggy My Expenses</title>
        <link rel="stylesheet" href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css"></link>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet"></link>
      </Head>

      <main className="text-center p-5 col-6 offset-3">
        <div>
          {
            categoryBalances ? (
            <div className="pb-4">
              <h3 className="pb-5">Your movements last 12 months per category</h3>
              <table className="table">
                <thead><th>Category</th><th>Amount</th></thead>
                <tbody>
                  {
                    categoryBalances.map(categoryBalance => (
                      <tr key={categoryBalance.category}>
                        <td>{categoryBalance.category}</td>
                        <td className={
                          `${categoryBalance.balance > 0 ? 'text-success' : 'text-danger'}`
                        }>R$ {Math.abs(categoryBalance.balance)}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            ) : 
            <h1 className="display-3 pb-4">
              <i className="las la-wallet"></i> Pluggy My Expenses
            </h1>
          }  
          {isWidgetOpen ? (
            <PluggyConnect
              updateItem={itemIdToUpdate}
              connectToken={connectToken}
              includeSandbox={true}
              onClose={() => setIsWidgetOpen(false)}
              onSuccess={onSuccess}
            />
          ) : (
            <button
            className="btn btn-primary btn-lg"
              onClick={() => setIsWidgetOpen(true)}
            >
              { itemIdToUpdate ? 'Refresh my data' : 'Connect your account' }
            </button>
          )}
        </div>
      </main>

      
    </div>
  )
}
