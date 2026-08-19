// BarChart: simple vertical bar chart used inside finance screen renderers.
export type BarDatum = {
  label: string
  value: number
}

type BarChartProps = {
  data: readonly BarDatum[]
}

const formatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

export default function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="flex h-40 items-end gap-4">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-sm font-semibold text-muted">{formatter.format(Math.round(d.value))}</span>
          <div
            data-testid="bar-chart-bar"
            className="w-full rounded-t-md bg-linear-to-r from-(--btn-from) to-(--btn-to)"
            style={{ height: `${(d.value / maxValue) * 100}%` }}
          />
          <span className="text-sm font-semibold text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
