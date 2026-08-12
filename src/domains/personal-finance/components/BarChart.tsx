export type BarDatum = {
  label: string
  value: number
}

type BarChartProps = {
  data: readonly BarDatum[]
}

const formatter = new Intl.NumberFormat('id-ID')

export default function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="flex h-40 items-end gap-4">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-xs text-muted">{formatter.format(d.value)}</span>
          <div
            className="w-full rounded-t-md bg-chart-1"
            style={{ height: `${(d.value / maxValue) * 100}%` }}
          />
          <span className="text-xs text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
