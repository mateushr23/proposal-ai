"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";

interface SectionEditorProps {
  title: string;
  content: string;
  onSave: (content: string) => void;
}

const SECTION_LABELS: Record<string, string> = {
  introduction: "Introducao",
  scope: "Escopo do projeto",
  investment: "Investimento",
  next_steps: "Proximos passos",
};

export function SectionEditor({ title, content, onSave }: SectionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditContent(content);
  }, [content]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editing]);

  const handleSave = useCallback(() => {
    onSave(editContent);
    setEditing(false);
  }, [editContent, onSave]);

  const handleCancel = useCallback(() => {
    setEditContent(content);
    setEditing(false);
  }, [content]);

  const label = SECTION_LABELS[title] ?? title;

  return (
    <GlassCard className={editing ? "" : "border-l-[3px] border-l-[var(--color-accent)]"}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
          {label}
        </h3>
        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" />
              </svg>
            }
          >
            Editar
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => {
              setEditContent(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            className="w-full px-3 py-2.5 text-sm bg-white/60 backdrop-blur-sm border border-[var(--color-border)] rounded-[var(--radius-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] resize-y min-h-[120px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-[var(--color-foreground)] whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      )}
    </GlassCard>
  );
}
