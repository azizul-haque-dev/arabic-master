"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  Conversation,
  ConversationMetaFormValues,
} from "@/lib/types/content";
import { useState } from "react";

const emptyValues: ConversationMetaFormValues = {
  title: "",
  topic: "",
  category: "",
};

export function ConversationMetaDialog({
  open,
  onOpenChange,
  initialConversation,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConversation?: Conversation;
  onSave: (values: ConversationMetaFormValues) => void;
}) {
  const isEditing = Boolean(initialConversation);
  const [values, setValues] = useState<ConversationMetaFormValues>(
    initialConversation
      ? {
          title: initialConversation.title,
          topic: initialConversation.topic,
          category: initialConversation.category,
        }
      : emptyValues,
  );

  function update<K extends keyof ConversationMetaFormValues>(
    key: K,
    value: string,
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setValues(
        initialConversation
          ? {
              title: initialConversation.title,
              topic: initialConversation.topic,
              category: initialConversation.category,
            }
          : emptyValues,
      );
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit conversation details" : "Create conversation"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the title, topic, and category."
              : "Start with the basics — you'll add sentence turns on the next screen."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="c-title">Title</Label>
            <Input
              id="c-title"
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Buying Something at a Shop"
            />
          </div>
          <div>
            <Label htmlFor="c-topic">Topic</Label>
            <Input
              id="c-topic"
              value={values.topic}
              onChange={(e) => update("topic", e.target.value)}
              placeholder="Shopping"
            />
          </div>
          <div>
            <Label htmlFor="c-category">Category</Label>
            <Input
              id="c-category"
              value={values.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="Shopping"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!values.title.trim() || !values.category.trim()}
              onClick={() => {
                onSave(values);
                handleClose(false);
              }}
            >
              {isEditing ? "Save changes" : "Create & add sentences"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
