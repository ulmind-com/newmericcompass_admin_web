import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input, Button } from './ui';

/** Edits an array of short strings (used for a rule's effects / treatments). */
export default function ListInput({ value = [], onChange, placeholder = 'Add a point…' }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...(value || []), v]);
    setDraft('');
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {(value || []).map((item, i) => (
          <li key={i} className="flex items-start gap-2 rounded-lg bg-brand-50/70 px-3 py-2 text-sm">
            <span className="mt-0.5 text-brand-500">•</span>
            <span className="flex-1 text-ink/80">{item}</span>
            <button type="button" onClick={() => remove(i)} className="text-ink/30 hover:text-red-500">
              <X size={16} />
            </button>
          </li>
        ))}
        {(!value || value.length === 0) && (
          <li className="rounded-lg border border-dashed border-brand-200 px-3 py-2 text-sm text-ink/40">
            No items yet.
          </li>
        )}
      </ul>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <Button type="button" variant="subtle" onClick={add}><Plus size={16} /></Button>
      </div>
    </div>
  );
}
