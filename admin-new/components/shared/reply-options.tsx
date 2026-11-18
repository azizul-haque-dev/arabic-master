"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReplyOption } from "@/lib/types/content";

const EMPTY_REPLY: ReplyOption = {
  arabicText: "",
  pronunciationBn: "",
  pronunciationEn: "",
  meaningBn: "",
  meaningEn: "",
};

export function ReplyOptionsEditor({
  value,
  onChange,
}: {
  value: ReplyOption[];
  onChange: (value: ReplyOption[]) => void;
}) {
  function update(index: number, key: keyof ReplyOption, nextValue: string) {
    onChange(
      value.map((reply, replyIndex) =>
        replyIndex === index ? { ...reply, [key]: nextValue } : reply,
      ),
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-text">Common replies</h3>
        <p className="mt-1 text-xs text-text-muted">
          Add up to three natural replies. Leave empty when none applies.
        </p>
      </div>
      {value.map((reply, index) => (
        <fieldset
          key={index}
          className="flex flex-col gap-3 rounded-default border border-border p-3"
        >
          <legend className="px-1 text-xs font-medium text-text-secondary">
            Reply {index + 1}
          </legend>
          <div>
            <Label htmlFor={`reply-arabic-${index}`}>Arabic reply</Label>
            <Input
              id={`reply-arabic-${index}`}
              dir="rtl"
              lang="ar"
              value={reply.arabicText}
              onChange={(event) =>
                update(index, "arabicText", event.target.value)
              }
              className="font-arabic text-lg"
              placeholder="الله يسلمك"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`reply-pron-bn-${index}`}>
                Pronunciation (Bangla)
              </Label>
              <Input
                id={`reply-pron-bn-${index}`}
                value={reply.pronunciationBn}
                onChange={(event) =>
                  update(index, "pronunciationBn", event.target.value)
                }
                className="font-bengali"
              />
            </div>
            <div>
              <Label htmlFor={`reply-pron-en-${index}`}>
                Pronunciation (English)
              </Label>
              <Input
                id={`reply-pron-en-${index}`}
                value={reply.pronunciationEn}
                onChange={(event) =>
                  update(index, "pronunciationEn", event.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor={`reply-meaning-bn-${index}`}>
                Meaning (Bangla)
              </Label>
              <Input
                id={`reply-meaning-bn-${index}`}
                value={reply.meaningBn}
                onChange={(event) =>
                  update(index, "meaningBn", event.target.value)
                }
                className="font-bengali"
              />
            </div>
            <div>
              <Label htmlFor={`reply-meaning-en-${index}`}>
                Meaning (English)
              </Label>
              <Input
                id={`reply-meaning-en-${index}`}
                value={reply.meaningEn}
                onChange={(event) =>
                  update(index, "meaningEn", event.target.value)
                }
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-end"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            Remove reply
          </Button>
        </fieldset>
      ))}
      {value.length < 3 ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => onChange([...value, { ...EMPTY_REPLY }])}
        >
          Add reply
        </Button>
      ) : null}
    </section>
  );
}

export function ReplyOptionsView({ options }: { options: ReplyOption[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <h2 className="font-heading text-sm font-semibold text-text">
        Common replies
      </h2>
      {options.length ? (
        <ul className="mt-3 flex flex-col gap-3">
          {options.map((reply, index) => (
            <li
              key={`${reply.arabicText}-${index}`}
              className="rounded-default border border-border/70 bg-neutral-bg/40 p-3"
            >
              <p
                dir="rtl"
                lang="ar"
                className="font-arabic text-xl text-text"
              >
                {reply.arabicText}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {reply.pronunciationBn} · {reply.pronunciationEn}
              </p>
              <p className="mt-2 text-sm text-text">{reply.meaningEn}</p>
              <p className="mt-1 font-bengali text-sm text-text-secondary">
                {reply.meaningBn}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-text-muted">
          No conversational reply applies.
        </p>
      )}
    </section>
  );
}
