import { Check, MessageCircle, Volume2, Globe2 } from "lucide-react";

const PILLARS = [
  {
    icon: MessageCircle,
    title: "Words in context",
    description:
      "See how a word is used in a sentence or conversation.",
  },
  {
    icon: Globe2,
    title: "Meanings in Bangla and English",
    description:
      "Check both translations while you learn a new word or phrase.",
  },
  {
    icon: Volume2,
    title: "Phrases for daily situations",
    description:
      "Study phrases for shopping, work, restaurants, transport, and greetings.",
  },
] as const;

export function WhyArabicMasterSection() {
  return (
    <section id="why-arabic-master" className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-dark">
              Why Arabic Master?
            </span>
            <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Learn a phrase, then see how people use it.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">
              Each lesson connects vocabulary to sentences and short dialogues,
              so you can study the words in context.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Saudi and Gulf expressions</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Bangla and English meanings</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Words, sentences, and guided conversations</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:col-span-7">
            {PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-border/80 bg-background p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-text">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
