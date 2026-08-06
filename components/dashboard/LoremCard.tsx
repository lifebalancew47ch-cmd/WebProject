import { Card } from "@/components/ui/Card"

const LOREM_PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse potenti. Integer feugiat, nunc non malesuada tincidunt, elit velit sagittis nulla, at facilisis nunc mauris ac risus.",
  "Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nullam nec erat ac magna cursus posuere. Donec sit amet purus at libero cursus consequat.",
  "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Curabitur blandit tempus porttitor. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh.",
]

export function LoremCard() {
  return (
    <Card className="space-y-4 p-8">
      {LOREM_PARAGRAPHS.map((paragraph, index) => (
        <p key={index} className="text-sm leading-relaxed text-slate-600">
          {paragraph}
        </p>
      ))}
    </Card>
  )
}
