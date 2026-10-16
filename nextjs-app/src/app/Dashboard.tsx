'use client'

const deals = [
  { name: 'ABC株式会社', title: '研修プログラム導入', amount: 1200000, stage: '提案済み', type: '法人' },
  { name: '山田 太郎', title: 'コンサルティング契約', amount: 500000, stage: '商談中', type: '個人' },
  { name: 'XYZ株式会社', title: 'システム導入支援', amount: 850000, stage: '初回接触', type: '法人' },
  { name: '佐藤 花子', title: 'ビジネス講座', amount: 300000, stage: '成約', type: '個人' },
]

const formatYen = (value: number) =>
  new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value)

export default function Dashboard() {
  return (
    <>
<div className="page-heading">
                <div>
                  <h1>ダッシュボード</h1>
                  <p>営業活動の状況をひと目で確認できます。</p>
                </div>
                <span className="period-label">サンプルデータ</span>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">今月の売上</span>
                  <strong>{formatYen(2640000)}</strong>
                  <span className="stat-note">成約済みの売上</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">商談中の見込金額</span>
                  <strong>{formatYen(2550000)}</strong>
                  <span className="stat-note">進行中の案件</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">今月の成約件数</span>
                  <strong>8件</strong>
                  <span className="stat-note">受注した商談</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">今月の成約率</span>
                  <strong>32.0%</strong>
                  <span className="stat-note">終了商談に対する成約割合</span>
                </div>
              </div>

              <div className="dashboard-grid">
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <h2>月別売上推移</h2>
                      <p>過去6か月の売上実績</p>
                    </div>
                  </div>

                  <div className="chart">
                    {[
                      { month: '5月', value: 132 },
                      { month: '6月', value: 264 },
                      { month: '7月', value: 198 },
                      { month: '8月', value: 396 },
                      { month: '9月', value: 198 },
                      { month: '10月', value: 264 },
                    ].map(item => (
                      <div className="chart-column" key={item.month}>
                        <div className="bar-area">
                          <div
                            className="chart-bar"
                            style={{ height: `${item.value / 4.5}%` }}
                            title={`${item.value}万円`}
                          />
                        </div>
                        <span>{item.month}</span>
                      </div>
                    ))}
                  </div>
                  <p className="chart-note">単位：万円</p>
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <h2>次回アクション</h2>
                      <p>対応予定の営業活動</p>
                    </div>
                  </div>
                  <div className="action-list">
                    <div className="action-item">
                      <span className="action-dot" />
                      <div>
                        <strong>ABC株式会社へ提案後フォロー</strong>
                        <p>電話で進捗を確認</p>
                      </div>
                      <span>10/12</span>
                    </div>
                    <div className="action-item">
                      <span className="action-dot" />
                      <div>
                        <strong>山田太郎さんとオンライン商談</strong>
                        <p>サービスの詳細説明</p>
                      </div>
                      <span>10/13</span>
                    </div>
                    <div className="action-item">
                      <span className="action-dot" />
                      <div>
                        <strong>XYZ株式会社へ資料送付</strong>
                        <p>提案資料をメールで送信</p>
                      </div>
                      <span>10/15</span>
                    </div>
                  </div>
                </section>
              </div>

              <section className="panel deals-panel">
                <div className="panel-header">
                  <div>
                    <h2>最近の商談</h2>
                    <p>最新の商談状況</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => window.location.assign('/deals')}
                  >
                    すべて見る →
                  </button>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>顧客名</th>
                        <th>商談名</th>
                        <th>顧客区分</th>
                        <th>ステータス</th>
                        <th>見込金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deals.map(deal => (
                        <tr key={deal.name}>
                          <td className="customer-name">{deal.name}</td>
                          <td>{deal.title}</td>
                          <td>{deal.type}</td>
                          <td>
                            <span className={`status status-${deal.stage}`}>
                              {deal.stage}
                            </span>
                          </td>
                          <td>{formatYen(deal.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
    </>
  )
}
