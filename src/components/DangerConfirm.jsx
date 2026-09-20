import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import Modal from './Modal';
import { Button, Input } from './ui';

/**
 * The gate in front of anything that deletes for good.
 *
 * One row deleted by mistake is an annoyance; a whole table is not, so wiping
 * everything asks for the word to be typed. `phrase` turns that on — leave it
 * off for a single row, where the modal alone is enough.
 */
export default function DangerConfirm({
  open, onClose, onConfirm, title, body, confirmLabel = 'Delete', phrase = null,
}) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setTyped(''); setBusy(false); } }, [open]);

  const ready = !phrase || typed.trim().toUpperCase() === phrase.toUpperCase();

  const go = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Could not delete');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={go} disabled={!ready || busy}>
          {busy ? 'Deleting…' : confirmLabel}
        </Button>
      </>}
    >
      <div className="flex gap-3">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-500" />
        <div className="space-y-3 text-sm text-ink/75">
          <div>{body}</div>
          <p className="font-semibold text-red-600">This cannot be undone.</p>
          {phrase && (
            <div>
              <p className="mb-1">Type <b>{phrase}</b> to confirm:</p>
              <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={phrase} />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
