'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import './ActivitiesPage.css'

type ActivityType = '電話' | 'メール' | 'オンライン商談' | '訪問' | 'タスク'

type Activity = {
  id: string
  customerName: string
  title: string
  type: ActivityType
  scheduledAt: string
  completed: boolean
  memo: string
}

type ActivityForm = Omit<Activity, 'id'>

const STORAGE_KEY = 'salesboard-demo-activities-v1'

const activityTypes: ActivityType[] = [
  '電話',
  'メール',
  'オンライン商談',
  '訪問',
  'タスク',
]

const sampleActivities: Activity[] = [
  {
    id: 'sample-1',
    customerName: 'ABC株式会社',
    title: '提案後のフォローアップ',
    type: '電話',
    scheduledAt: '2026-10-12T10:00',
    completed: false,
    memo: '導入検討状況を確認',
  },
  {
    id: 'sample-2',
    customerName: '山田 太郎',
    title: 'サービス詳細説明',
    type: 'オンライン商談',
    scheduledAt: '2026-10-13T14:00',
    completed: false,
    memo: 'Zoomで実施予定',
  },
  {
    id: 'sample-3',
    customerName: 'XYZ株式会社',
    title: '提案資料の送付',
    type: 'メール',
    scheduledAt: '2026-10-15T11:00',
    completed: false,
    memo: '提案書PDFを送付',
  },
  {
    id: 'sample-4',
    customerName: '佐藤 花子',
    title: '契約手続きのご案内',
    type: 'メール',
    scheduledAt: '2026-10-08T15:00',
    completed: true,
    memo: '契約書の送付完了',
  },
]

const emptyForm: ActivityForm = {
  customerName: '',
  title: '',
  type: '電話',
  scheduledAt: '',
  completed: false,
  memo: '',
}

function loadActivities(): Activity[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        return parsed as Activity[]
      }
    }
  } catch {
    // 読み込みに失敗した場合はサンプルデータを使用
  }

  return sampleActivities
}

function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>(loadActivities)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('すべて')
  const [typeFilter, setTypeFilter] = useState('すべて')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ActivityForm>({ ...emptyForm })

  const saveActivities = (updated: Activity[]) => {
    setActivities(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const filteredActivities = activities
    .filter(activity => {
      const keyword = search.trim().toLowerCase()

      const matchesSearch =
        activity.customerName.toLowerCase().includes(keyword) ||
        activity.title.toLowerCase().includes(keyword)

      const matchesStatus =
        statusFilter === 'すべて' ||
        (statusFilter === '未完了' && !activity.completed) ||
        (statusFilter === '完了' && activity.completed)

      const matchesType =
        typeFilter === 'すべて' || activity.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))

  const totalCount = activities.length
  const completedCount = activities.filter(a => a.completed).length
  const pendingCount = totalCount - completedCount

  const today = new Date()
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const overdueCount = activities.filter(
    a => !a.completed && a.scheduledAt && a.scheduledAt.slice(0, 10) < todayString
  ).length

  const openCreateForm = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setIsFormOpen(true)
  }

  const openEditForm = (activity: Activity) => {
    setEditingId(activity.id)
    setForm({
      customerName: activity.customerName,
      title: activity.title,
      type: activity.type,
      scheduledAt: activity.scheduledAt,
      completed: activity.completed,
      memo: activity.memo,
    })
    setIsFormOpen(true)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.customerName.trim() || !form.title.trim()) {
      return
    }

    const normalizedForm: ActivityForm = {
      ...form,
      customerName: form.customerName.trim(),
      title: form.title.trim(),
    }

    if (editingId !== null) {
      saveActivities(
        activities.map(activity =>
          activity.id === editingId
            ? { ...activity, ...normalizedForm }
            : activity
        )
      )
    } else {
      saveActivities([
        ...activities,
        {
          id: crypto.randomUUID(),
          ...normalizedForm,
        },
      ])
    }

    setIsFormOpen(false)
  }

  const handleDelete = (activity: Activity) => {
    if (!window.confirm(`「${activity.title}」を削除しますか？`)) {
      return
    }

    saveActivities(activities.filter(item => item.id !== activity.id))
  }

  const toggleCompleted = (id: string) => {
    saveActivities(
      activities.map(activity =>
        activity.id === id
          ? { ...activity, completed: !activity.completed }
          : activity
      )
    )
  }

  const formatDateTime = (value: string) => {
    if (!value) return '未設定'

    const [date, time] = value.split('T')
    return `${date.replace(/-/g, '/')} ${time ?? ''}`
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>営業活動</h1>
          <p>営業活動の予定・実績・対応状況を管理します。</p>
        </div>
        <button className="activity-primary-button" onClick={openCreateForm}>
          ＋ 活動を登録
        </button>
      </div>

      <div className="activity-stats">
        <div className="activity-stat-card">
          <span>登録活動数</span>
          <strong>{totalCount}件</strong>
          <small>すべての活動</small>
        </div>
        <div className="activity-stat-card">
          <span>未完了</span>
          <strong>{pendingCount}件</strong>
          <small>対応が必要な活動</small>
        </div>
        <div className="activity-stat-card">
          <span>完了</span>
          <strong>{completedCount}件</strong>
          <small>対応済みの活動</small>
        </div>
        <div className="activity-stat-card">
          <span>期限超過</span>
          <strong>{overdueCount}件</strong>
          <small>予定日を過ぎた未完了活動</small>
        </div>
      </div>

      <section className="panel activity-panel">
        <div className="activity-toolbar">
          <input
            type="search"
            placeholder="顧客名・活動名で検索"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
          >
            <option value="すべて">すべての対応状況</option>
            <option value="未完了">未完了</option>
            <option value="完了">完了</option>
          </select>

          <select
            value={typeFilter}
            onChange={event => setTypeFilter(event.target.value)}
          >
            <option value="すべて">すべての活動種別</option>
            {activityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="activity-count">
          {filteredActivities.length}件の営業活動
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>活動名</th>
                <th>顧客名</th>
                <th>活動種別</th>
                <th>予定日時</th>
                <th>対応状況</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map(activity => (
                <tr key={activity.id}>
                  <td className="customer-name">
                    {activity.title}
                  </td>
                  <td>{activity.customerName}</td>
                  <td>
                    <span className="activity-type-badge">
                      {activity.type}
                    </span>
                  </td>
                  <td>{formatDateTime(activity.scheduledAt)}</td>
                  <td>
                    <button
                      className={`activity-status-button ${
                        activity.completed ? 'is-completed' : 'is-pending'
                      }`}
                      onClick={() => toggleCompleted(activity.id)}
                      title="クリックして対応状況を変更"
                    >
                      {activity.completed ? '✓ 完了' : '○ 未完了'}
                    </button>
                  </td>
                  <td>
                    <div className="activity-actions">
                      <button onClick={() => openEditForm(activity)}>
                        編集
                      </button>
                      <button
                        className="activity-delete"
                        onClick={() => handleDelete(activity)}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={6} className="activity-empty">
                    該当する営業活動がありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen && (
        <div className="activity-modal-backdrop">
          <div
            className="activity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-form-title"
          >
            <h2 id="activity-form-title">
              {editingId === null ? '営業活動を新規登録' : '営業活動を編集'}
            </h2>

            <form onSubmit={handleSubmit}>
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
                活動名 *
                <input
                  required
                  placeholder="例：提案後のフォローアップ"
                  value={form.title}
                  onChange={event =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </label>

              <label>
                活動種別
                <select
                  value={form.type}
                  onChange={event =>
                    setForm({
                      ...form,
                      type: event.target.value as ActivityType,
                    })
                  }
                >
                  {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label>
                予定日時
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={event =>
                    setForm({ ...form, scheduledAt: event.target.value })
                  }
                />
              </label>

              <label>
                対応状況
                <select
                  value={form.completed ? '完了' : '未完了'}
                  onChange={event =>
                    setForm({
                      ...form,
                      completed: event.target.value === '完了',
                    })
                  }
                >
                  <option value="未完了">未完了</option>
                  <option value="完了">完了</option>
                </select>
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

              <div className="activity-form-actions">
                <button
                  type="button"
                  className="activity-cancel-button"
                  onClick={() => setIsFormOpen(false)}
                >
                  キャンセル
                </button>
                <button type="submit" className="activity-primary-button">
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

export default ActivitiesPage
