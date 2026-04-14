'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Типы для TypeScript
interface Order {
  id: number
  retailcrm_id?: number
  first_name: string
  last_name: string
  phone: string
  email: string
  total_sum: number
  status: string
  created_at: string
}

interface Stats {
  totalOrders: number
  totalAmount: number
  avgOrderValue: number
  newOrders: number
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalAmount: 0,
    avgOrderValue: 0,
    newOrders: 0
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('retailcrm_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ordersData: Order[]) => {
    const total = ordersData.length
    const totalAmount = ordersData.reduce((sum, order) => sum + (parseFloat(order.total_sum?.toString() || '0')), 0)
    const newOrders = ordersData.filter(order => order.status === 'new').length

    setStats({
      totalOrders: total,
      totalAmount: totalAmount,
      avgOrderValue: total > 0 ? totalAmount / total : 0,
      newOrders: newOrders
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Загрузка данных...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Дашборд заказов</h1>
          <p className="text-gray-600">Аналитика заказов из RetailCRM</p>
        </div>

        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
                📦
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Вс
его заказов</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-500 rounded flex items-center justify-center text-white font-bold">
                💰
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общая сумма</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAmount.toLocaleString('ru-RU')} ₸
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-500 rounded flex items-center justify-center text-white font-bold">
                📈
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Средний чек</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.avgOrderValue).toLocaleString('ru-RU')} ₸
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
                🆕
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Новые заказы</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Информационное сообщение */}
        {orders.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex">
              <div className="text-yellow-400 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Нет данных</h3>
                <p className="text-yellow-700">
                  Данные не найдены. Убедитесь, что:
                </p>
                <ul className="list-disc list-inside text-yellow-700 mt-2">
                  <li>Таблица 'orders' создана в Supabase</li>
                  <li>Данные синхронизированы из RetailCRM</li>
                  <li>Переменные окружения настроены правильно</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Таблица заказов */}
        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Последние заказы</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Клиент
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.first_name} {order.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{order.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseFloat(order.total_sum?.toString() || '0').toLocaleString('ru-RU')} ₸
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}

                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
