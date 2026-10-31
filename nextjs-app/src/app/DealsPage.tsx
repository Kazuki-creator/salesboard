'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import './DealsPage.css'

type DealStage = '初回接触' | '商談中' | '提案済み' | '成約' | '失注'
type CustomerType = '法人' | '個人'

type Deal = {
  id: string
  customerName: string
  customerType: CustomerType
  title: string
  amount: number
  stage: DealStage
  expectedCloseDate: string
  memo: string
}

type DealForm = Omit<Deal, 'id'>

const STORAGE_KEY = 'salesboard-demo-deals-v1'

const stages: DealStage[] = [
  '初回接触',
  '商談中',
  '提案済み',
  '成約',
  '失注',
]

const sampleDeals: Deal[] = [
  {
    id: 'sample-1',
    customerName: 'ABC株式会社',
    customerType: '法人',
    title: '研修プログラム導入',
    amount: 1200000,
    stage: '提案済み',
    expectedCloseDate: '2026-10-30',
    memo: '最終提案後のフォローを予定',
  },
  {
    id: 'sample-2',
    customerName: '山田 太郎',
    customerType: '個人',
    title: 'コンサルティング契約',
    amount: 500000,
    stage: '商談中',
    expectedCloseDate: '2026-11-15',
    memo: '次回オンライン面談を予定',
  },
  {
    id: 'sample-3',
    customerName: 'XYZ株式会社',
    customerType: '法人',
    title: 'システム導入支援',
    amount: 850000,
    stage: '初回接触',
    expectedCloseDate: '2026-11-30',
    memo: '',
  },
  {
    id: 'sample-4',
    customerName: '佐藤 花子',
    customerType: '個人',
    title: 'ビジネス講座',
    amount: 300000,
    stage: '成約',
    expectedCloseDate: '2026-10-05',
    memo: '契約手続き完了',
  },
]

const emptyForm: DealForm = {
  customerName: '',
  customerType: '法人',
  title: '',
  amount: 0,
  stage: '初回接触',
  expectedCloseDate: '',
  memo: '',
}

const formatYen = (amount: number) =>
  new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount)

function loadDeals(): Deal[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        return parsed as Deal[]
      }
    }
  } catch {
    // 保存データを読み込めない場合はサンプルデータを使う
  }

  return sampleDeals
}

function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(loadDeals)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('すべて')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DealForm>({ ...emptyForm })

  const saveDeals = (updatedDeals: Deal[]) => {
    setDeals(updatedDeals)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDeals))
  }

  const filteredDeals = deals.filter(deal => {
    const keyword = search.trim().toLowerCase()
    const matchesSearch =
      deal.customerName.toLowerCase().includes(keyword) ||
      deal.title.toLowerCase().includes(keyword)

    const matchesStage =
      stageFilter === 'すべて' || deal.stage === stageFilter

    return matchesSearch && matchesStage
  })

  const openCreateForm = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setIsFormOpen(true)
  }

  const openEditForm = (deal: Deal) => {
    setEditingId(deal.id)
    setForm({
      customerName: deal.customerName,
      customerType: deal.customerType,
      title: deal.title,
      amount: deal.amount,
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate,
      memo: deal.memo,
    })
    setIsFormOpen(true)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.customerName.trim() || !form.title.trim()) {
      return
    }

    const normalizedForm: DealForm = {
      ...form,
      customerName: form.customerName.trim(),
      title: form.title.trim(),
      amount: Math.max(0, Number(form.amount) || 0),
    }

    if (editingId !== null) {
      saveDeals(
        deals.map(deal =>
          deal.id === editingId
            ? { ...deal, ...normalizedForm }
            : deal
        )
      )
    } else {
      saveDeals([
        ...deals,
        {
          id: crypto.randomUUID(),
          ...normalizedForm,
        },
      ])
    }

    setIsFormOpen(false)
  }

  const handleDelete = (deal: Deal) => {
    if (!window.confirm(`「${deal.title}」を削除しますか？`)) {
      return
    }

    saveDeals(deals.filter(item => item.id !== deal.id))
  }

  const handleStageChange = (id: string, stage: DealStage) => {
    saveDeals(
      deals.map(deal =>
        deal.id === id ? { ...deal, stage } : deal
      )
    )
  }

  const activeDeals = deals.filter(
    deal => deal.stage !== '成約' && deal.stage !== '失注'
  )
  const wonDeals = deals.filter(deal => deal.stage === '成約')

  const totalPipeline = activeDeals.reduce(
    (sum, deal) => sum + deal.amount,
    0
  )
  const totalWon = wonDeals.reduce(
    (sum, deal) => sum + deal.amount,
    0
  )

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>商談管理</h1>
          <p>商談の進捗と見込金額を管理します。</p>
        </div>
        <button className="deal-primary-button" onClick={openCreateForm}>
          ＋ 商談を登録
        </button>
      </div>

      <div className="deal-stats">
        <div className="deal-stat-card">
          <span>進行中の商談</span>
          <strong>{activeDeals.length}件</strong>
          <small>成約・失注を除く</small>
        </div>
        <div className="deal-stat-card">
          <span>商談中の見込金額</span>
          <strong>{formatYen(totalPipeline)}</strong>
          <small>進行中の商談金額合計</small>
        </div>
        <div className="deal-stat-card">
          <span>成約金額</span>
          <strong>{formatYen(totalWon)}</strong>
          <small>成約済み商談の合計</small>
        </div>
        <div className="deal-stat-card">
          <span>登録商談数</span>
          <strong>{deals.length}件</strong>
          <small>すべての商談</small>
        </div>
      </div>

      <section className="panel deal-panel">
        <div className="deal-toolbar">
          <input
            type="search"
            placeholder="顧客名・商談名で検索"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <select
            value={stageFilter}
            onChange={event => setStageFilter(event.target.value)}
          >
            <option value="すべて">すべてのステータス</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>

        <div className="deal-count">
          {filteredDeals.length}件の商談
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>顧客名</th>
                <th>商談名</th>
                <th>区分</th>
                <th>ステータス</th>
                <th>見込金額</th>
                <th>成約予定日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map(deal => (
                <tr key={deal.id}>
                  <td className="customer-name">
                    {deal.customerName}
                  </td>
                  <td>{deal.title}</td>
                  <td>{deal.customerType}</td>
                  <td>
                    <select
                      className="deal-stage-select"
                      value={deal.stage}
                      onChange={event =>
                        handleStageChange(
                          deal.id,
                          event.target.value as DealStage
                        )
                      }
                    >
                      {stages.map(stage => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="deal-amount">
                    {formatYen(deal.amount)}
                  </td>
                  <td>{deal.expectedCloseDate || '—'}</td>
                  <td>
                    <div className="deal-actions">
                      <button onClick={() => openEditForm(deal)}>
                        編集
                      </button>
                      <button
                        className="deal-delete"
                        onClick={() => handleDelete(deal)}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDeals.length === 0 && (
                <tr>
                  <td colSpan={7} className="deal-empty">
                    該当する商談がありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen && (
        <div className="deal-modal-backdrop">
          <div
            className="deal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deal-form-title"
          >
            <h2 id="deal-form-title">
              {editingId === null ? '商談を新規登録' : '商談を編集'}
            </h2>

            <form onSubmit={handleSubmit}>
              <label>
                顧客区分
                <select
                  value={form.customerType}
                  onChange={event =>
                    setForm({
                      ...form,
                      customerType: event.target.value as CustomerType,
                    })
                  }
                >
                  <option value="法人">法人</option>
                  <option value="個人">個人</option>
                </select>
              </label>

              <label>
                顧客名 *
                <input
                  required
                  value={form.customerName}
                  onChange={event =>
                    setForm({ ...form, customerName: event.target.value })
                  }
                />
              </label>

              <label>
                商談名 *
                <input
                  required
                  value={form.title}
                  onChange={event =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </label>

              <label>
                見込金額（円）
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.amount}
                  onChange={event =>
                    setForm({ ...form, amount: Number(event.target.value) })
                  }
                />
              </label>

              <label>
                ステータス
                <select
                  value={form.stage}
                  onChange={event =>
                    setForm({
                      ...form,
                      stage: event.target.value as DealStage,
                    })
                  }
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                成約予定日
                <input
                  type="date"
                  value={form.expectedCloseDate}
                  onChange={event =>
                    setForm({
                      ...form,
                      expectedCloseDate: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                メモ
                <textarea
                  rows={3}
                  value={form.memo}
                  onChange={event =>
                    setForm({ ...form, memo: event.target.value })
                  }
                />
              </label>

              <div className="deal-form-actions">
                <button
                  type="button"
                  className="deal-cancel-button"
                  onClick={() => setIsFormOpen(false)}
                >
                  キャンセル
                </button>
                <button type="submit" className="deal-primary-button">
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

export default DealsPage
