
import { useState } from 'react'
import './CustomersPage.css'

type CustomerType = '法人' | '個人'

type Customer = {
  id: number
  type: CustomerType
  name: string
  email: string
  phone: string
  industry: string
}

type CustomerForm = Omit<Customer, 'id'>

const initialCustomers: Customer[] = [
  { id: 1, type: '法人', name: 'ABC株式会社', email: 'info@abc.example', phone: '03-1234-5678', industry: 'IT・通信' },
  { id: 2, type: '個人', name: '山田 太郎', email: 'yamada@example.com', phone: '090-1234-5678', industry: '' },
  { id: 3, type: '法人', name: 'XYZ株式会社', email: 'contact@xyz.example', phone: '06-1234-5678', industry: '製造業' },
  { id: 4, type: '個人', name: '佐藤 花子', email: 'sato@example.com', phone: '080-1234-5678', industry: '' },
]

const emptyForm: CustomerForm = {
  type: '法人',
  name: '',
  email: '',
  phone: '',
  industry: '',
}

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'すべて' | CustomerType>('すべて')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CustomerForm>(emptyForm)

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase())
    const matchesType = filter === 'すべて' || customer.type === filter
    return matchesSearch && matchesType
  })

  const openCreateForm = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setIsFormOpen(true)
  }

  const openEditForm = (customer: Customer) => {
    setEditingId(customer.id)
    setForm({
      type: customer.type,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      industry: customer.industry,
    })
    setIsFormOpen(true)
  }

  const saveCustomer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim()) return

    const normalizedForm = {
      ...form,
      name: form.name.trim(),
      industry: form.type === '個人' ? '' : form.industry,
    }

    if (editingId !== null) {
      setCustomers(previous =>
        previous.map(customer =>
          customer.id === editingId
            ? { ...customer, ...normalizedForm }
            : customer
        )
      )
    } else {
      setCustomers(previous => [
        ...previous,
        { id: Date.now(), ...normalizedForm },
      ])
    }

    setIsFormOpen(false)
  }

  const deleteCustomer = (customer: Customer) => {
    if (!window.confirm(`${customer.name}を削除しますか？`)) return
    setCustomers(previous => previous.filter(item => item.id !== customer.id))
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>顧客管理</h1>
          <p>法人・個人の顧客情報を管理します。</p>
        </div>
        <button className="customer-primary-button" onClick={openCreateForm}>
          ＋ 顧客を登録
        </button>
      </div>

      <section className="panel customer-panel">
        <div className="customer-toolbar">
          <input
            className="customer-search"
            type="search"
            placeholder="顧客名・メールアドレスで検索"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <select
            className="customer-filter"
            value={filter}
            onChange={event =>
              setFilter(event.target.value as 'すべて' | CustomerType)
            }
          >
            <option value="すべて">すべて</option>
            <option value="法人">法人</option>
            <option value="個人">個人</option>
          </select>
        </div>

        <div className="customer-count">
          {filteredCustomers.length}件の顧客
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>顧客名</th>
                <th>区分</th>
                <th>メールアドレス</th>
                <th>電話番号</th>
                <th>業種</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td className="customer-name">{customer.name}</td>
                  <td>{customer.type}</td>
                  <td>{customer.email || '—'}</td>
                  <td>{customer.phone || '—'}</td>
                  <td>{customer.industry || '—'}</td>
                  <td>
                    <div className="customer-actions">
                      <button onClick={() => openEditForm(customer)}>編集</button>
                      <button
                        className="customer-delete"
                        onClick={() => deleteCustomer(customer)}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="customer-empty">
                    該当する顧客がありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen && (
        <div className="customer-modal-backdrop">
          <div
            className="customer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-form-title"
          >
            <h2 id="customer-form-title">
              {editingId === null ? '顧客を新規登録' : '顧客情報を編集'}
            </h2>

            <form onSubmit={saveCustomer}>
              <label>
                顧客区分
                <select
                  value={form.type}
                  onChange={event =>
                    setForm({
                      ...form,
                      type: event.target.value as CustomerType,
                    })
                  }
                >
                  <option value="法人">法人</option>
                  <option value="個人">個人</option>
                </select>
              </label>

              <label>
                {form.type === '法人' ? '会社名' : '氏名'} *
                <input
                  required
                  value={form.name}
                  onChange={event =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>

              <label>
                メールアドレス
                <input
                  type="email"
                  value={form.email}
                  onChange={event =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </label>

              <label>
                電話番号
                <input
                  type="tel"
                  value={form.phone}
                  onChange={event =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </label>

              {form.type === '法人' && (
                <label>
                  業種
                  <input
                    value={form.industry}
                    onChange={event =>
                      setForm({ ...form, industry: event.target.value })
                    }
                  />
                </label>
              )}

              <div className="customer-form-actions">
                <button
                  type="button"
                  className="customer-cancel-button"
                  onClick={() => setIsFormOpen(false)}
                >
                  キャンセル
                </button>
                <button type="submit" className="customer-primary-button">
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default CustomersPage
