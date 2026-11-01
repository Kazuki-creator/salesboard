'use client'

import { useEffect, useRef, useState } from 'react'
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

function toCustomer(value: unknown): Customer {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid customer')
  }

  const row = value as Record<string, unknown>
  if (
    typeof row.id !== 'number' || !Number.isSafeInteger(row.id) ||
    (row.type !== '法人' && row.type !== '個人') ||
    typeof row.name !== 'string' || typeof row.email !== 'string' ||
    typeof row.phone !== 'string' || typeof row.industry !== 'string'
  ) {
    throw new Error('Invalid customer fields')
  }

  // APIの日時フィールドは一覧では使わず、区分は検証して画面の型に絞る。
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    email: row.email,
    phone: row.phone,
    industry: row.industry,
  }
}

const emptyForm: CustomerForm = {
  type: '法人',
  name: '',
  email: '',
  phone: '',
  industry: '',
}

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'すべて' | CustomerType>('すべて')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const savingRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCustomers() {
      try {
        const response = await fetch('/api/customers', {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!response.ok) throw new Error('Customer request failed')

        const data: unknown = await response.json()
        if (!Array.isArray(data)) throw new Error('Invalid customer list')

        const loadedCustomers = data.map(toCustomer)
        if (!controller.signal.aborted) setCustomers(loadedCustomers)
      } catch {
        if (!controller.signal.aborted) {
          setError('顧客一覧を取得できませんでした。時間をおいて再読み込みしてください。')
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadCustomers()
    return () => controller.abort()
  }, [])

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase())
    const matchesType = filter === 'すべて' || customer.type === filter
    return matchesSearch && matchesType
  })

  const openCreateForm = () => {
    if (savingRef.current) return
    setSaveError(null)
    setEditingId(null)
    setForm({ ...emptyForm })
    setIsFormOpen(true)
  }

  const openEditForm = (customer: Customer) => {
    if (savingRef.current) return
    setSaveError(null)
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

  const saveCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (editingId !== null || savingRef.current) return
    if (!form.name.trim()) {
      setSaveError('会社名・氏名は必須です。')
      return
    }

    savingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, industry: form.type === '個人' ? '' : form.industry }),
      })
      if (!response.ok) {
        setSaveError(response.status === 400
          ? '入力内容を確認してください。名前・業種は200文字、メールは254文字、電話は50文字以内で入力してください。'
          : '顧客を登録できませんでした。時間をおいて再度お試しください。')
        return
      }

      setIsFormOpen(false)
      setIsLoading(true)
      setError(null)
      try {
        const listResponse = await fetch('/api/customers', { cache: 'no-store' })
        if (!listResponse.ok) throw new Error('Customer request failed')
        const data: unknown = await listResponse.json()
        if (!Array.isArray(data)) throw new Error('Invalid customer list')
        setCustomers(data.map(toCustomer))
      } catch {
        setError('顧客の登録は完了しましたが、一覧の更新に失敗しました。再登録せず、画面を再読み込みしてください。')
      } finally {
        setIsLoading(false)
      }
    } catch {
      setSaveError('通信に失敗しました。登録済みの可能性があるため、再送信前に画面を再読み込みして一覧を確認してください。')
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  const deleteCustomer = (customer: Customer) => {
    window.alert(`${customer.name}の削除はDB未連携のため、実行できません。`)
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
          {isLoading ? '顧客一覧を取得中…' : error ? '顧客一覧の取得に失敗しました' : `${filteredCustomers.length}件の顧客`}
        </div>
        {error && customers.length > 0 && <p role="alert">{error}</p>}

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
                    <span role={error ? 'alert' : 'status'}>
                      {isLoading
                        ? '顧客一覧を取得中…'
                        : error ?? (customers.length === 0
                          ? '顧客が登録されていません。'
                          : '該当する顧客がありません。')}
                    </span>
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

            <p>{editingId === null ? '編集・削除はDB未連携です。' : '編集はDB未連携のため、現在は保存できません。'}</p>
            {saveError && <p role="alert">{saveError}</p>}

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
                  maxLength={200}
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
                  maxLength={254}
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
                  maxLength={50}
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
                    maxLength={200}
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
                  disabled={isSaving}
                  onClick={() => setIsFormOpen(false)}
                >
                  キャンセル
                </button>
                <button type="submit" className="customer-primary-button" disabled={isSaving || editingId !== null}>
                  {isSaving ? '登録中…' : '保存する'}
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
