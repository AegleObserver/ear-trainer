interface PlaceholderPageProps {
  icon: string
  title: string
  subtitle: string
}

export default function PlaceholderPage({ icon, title, subtitle }: PlaceholderPageProps) {
  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="panel flex h-20 w-20 items-center justify-center text-4xl">
        <span aria-hidden>{icon}</span>
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-slate-400">{subtitle}</p>
    </div>
  )
}
