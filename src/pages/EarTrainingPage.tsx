import PlaceholderPage from '../components/PlaceholderPage'

export default function EarTrainingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="text-xl font-bold">音感测试</h2>
      <p className="mt-1 text-sm text-slate-400">
        音名识别 · 音程识别 · 和弦识别
      </p>
      <div className="mt-4">
        <PlaceholderPage
          icon="🎧"
          title="音感测试"
          subtitle="正在开发中，敬请期待…"
        />
      </div>
    </div>
  )
}
