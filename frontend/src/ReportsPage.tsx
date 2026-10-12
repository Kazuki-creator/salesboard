
import { useState } from 'react'
import './ReportsPage.css'

type DealStage = '初回接触' | '商談中' | '提案済み' | '成約' | '失注'

type Deal = {
  id: string
  customerName: string
  customerType: '法人' | '個人'
  title: string
  amount: number
  stage: DealStage
  expectedCloseDate: string
  memo: string
}

const STORAGE_KEY = 'salesboard-demo-deals-v1'

const sampleDeals: Deal[] = [
  {
    id: 'sample-1',
    customerName: 'ABC株式会社',
    customerType: '法人',
    title: '研修プログラム導入',
    amount: 1200000,
    stage: '提案済み',
    expectedCloseDate: '2026-10-30',
    memo: '',
  },
  {
    id: 'sample-2',
    customerName: '山田 太郎',
    customerType: '個人',
    title: 'コンサルティング契約',
    amount: 500000,
    stage: '商談中',
    expectedCloseDate: '2026-11-15',
    memo: '',
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
    memo: '',
  },
]

const stages: DealStage[] = [
  '初回接触',
  '商談中',
  '提案済み',
  '成約',
  '失注',
]

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
    // 保存データを読み込めない場合はサンプルデータを使用
  }
  return sampleDeals
}

function ReportsPage() {
  // 画面を開くたびにlocalStorageから最新の商談を読み込む
  const [deals] = useState<Deal[]>(loadDeals)

  const activeDeals = deals.filter(
    deal => deal.stage !== '成約' && deal.stage !== '失注'
  )
  const wonDeals = deals.filter(deal => deal.stage === '成約')
  const lostDeals = deals.filter(deal => deal.stage === '失注')

  const sumAmount = (items: Deal[]) =>
    items.reduce((sum, deal) => sum + deal.amount, 0)

  const totalWon = sumAmount(wonDeals)
  const totalPipeline = sumAmount(activeDeals)
  const closedCount = wonDeals.length + lostDeals.length
  const winRate =
    closedCount === 0 ? 0 : (wonDeals.length / closedCount) * 100

  const stageData = stages.map(stage => ({
    stage,
    count: deals.filter(deal => deal.stage === stage).length,
    amount: sumAmount(deals.filter(deal => deal.stage === stage)),
  }))

  const maxStageAmount = Math.max(
    ...stageData.map(item => item.amount),
    1
  )

  const customerTypeData = (['法人', '個人'] as const).map(type => ({
    type,
    count: deals.filter(deal => deal.customerType === type).length,
    amount: sumAmount(
      wonDeals.filter(deal => deal.customerType === type)
    ),
  }))

  // 現在のデータには成約日がないため、
  // 成約予定日を使った参考集計として表示
  const monthlySales = wonDeals.reduce<Record<string, number>>(
    (result, deal) => {
      if (!deal.expectedCloseDate) return result
      const month = deal.expectedCloseDate.slice(0, 7)
      result[month] = (result[month] ?? 0) + deal.amount
      return result
    },
    {}
  )

  const monthlyData = Object.entries(monthlySales)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }))

  const maxMonthlyAmount = Math.max(
    ...monthlyData.map(item => item.amount),
    1
  )

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>売上分析</h1>
          <p>商談データから営業成果と見込金額を可視化します。</p>
        </div>
        <span className="period-label">デモデータ分析</span>
      </div>

      <div className="report-stats">
        <div className="report-stat-card">
          <span>累計成約金額</span>
          <strong>{formatYen(totalWon)}</strong>
          <small>成約ステータスの商談合計</small>
        </div>
        <div className="report-stat-card">
          <span>進行中の見込金額</span>
          <strong>{formatYen(totalPipeline)}</strong>
          <small>未成約・未失注の商談合計</small>
        </div>
        <div className="report-stat-card">
          <span>成約件数</span>
          <strong>{wonDeals.length}件</strong>
          <small>成約済みの商談</small>
        </div>
        <div className="report-stat-card">
          <span>成約率</span>
          <strong>{winRate.toFixed(1)}%</strong>
          <small>成約件数 ÷ 終了商談件数</small>
        </div>
      </div>

      <div className="report-grid">
        <section className="panel report-panel">
          <div className="panel-header">
            <div>
              <h2>商談ステータス別の金額</h2>
              <p>各ステータスの商談金額と件数</p>
            </div>
          </div>

          <div className="report-stage-list">
            {stageData.map(item => (
              <div className="report-stage-row" key={item.stage}>
                <div className="report-stage-label">
                  <strong>{item.stage}</strong>
                  <span>{item.count}件</span>
                </div>
                <div className="report-progress-track">
                  <div
                    className="report-progress-fill"
                    style={{
                      width: `${(item.amount / maxStageAmount) * 100}%`,
                    }}
                  />
                </div>
                <strong className="report-stage-amount">
                  {formatYen(item.amount)}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel report-panel">
          <div className="panel-header">
            <div>
              <h2>顧客区分別の成約金額</h2>
              <p>法人・個人の成約実績</p>
            </div>
          </div>

          <div className="report-customer-types">
            {customerTypeData.map(item => (
              <div className="report-type-card" key={item.type}>
                <span>{item.type}顧客</span>
                <strong>{formatYen(item.amount)}</strong>
                <small>登録商談数：{item.count}件</small>
              </div>
            ))}
          </div>

          <p className="report-note">
            ※ 商談管理で登録した顧客区分をもとに集計しています。
          </p>
        </section>
      </div>

      <section className="panel report-panel report-monthly-panel">
        <div className="panel-header">
          <div>
            <h2>月別成約金額（参考）</h2>
            <p>成約済み商談を成約予定月ごとに集計</p>
          </div>
        </div>

        {monthlyData.length > 0 ? (
          <div className="report-monthly-chart">
            {monthlyData.map(item => (
              <div className="report-month-column" key={item.month}>
                <span className="report-month-value">
                  {formatYen(item.amount)}
                </span>
                <div className="report-month-bar-area">
                  <div
                    className="report-month-bar"
                    style={{
                      height: `${(item.amount / maxMonthlyAmount) * 100}%`,
                    }}
                  />
                </div>
                <span className="report-month-label">
                  {item.month.replace('-', '/')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="report-empty">
            成約済み商談に日付が登録されるとグラフが表示されます。
          </p>
        )}

        <p className="report-note">
          ※ 現在は成約日を記録していないため、成約予定日で代用しています。
          実際の売上計上月を表すものではありません。
        </p>
      </section>
    </>
  )
}

export default ReportsPage
