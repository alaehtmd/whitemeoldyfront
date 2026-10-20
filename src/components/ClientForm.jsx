
import { useState } from 'react'
import { X } from 'lucide-react'

const emptyClient = {
  fullName: '',
  phone: '',
  notes: '',
}

export default function ClientForm({ client, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    client
      ? {
          fullName: client.fullName ?? '',
          phone: client.phone ?? '',
          notes: client.notes ?? '',
        }
      : emptyClient,
  )

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    onSave({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {client ? 'Modifier la cliente' : 'Nouvelle cliente'}
            </h3>
            <p className="mt-1 text-sm text-[#8D8579]">
              Coordonnées utiles pour les réservations.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-2 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <label className="block space-y-1.5 text-sm">
          <span>Nom complet *</span>
          <input
            required
            autoFocus
            maxLength={100}
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Nom et prénom"
            className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3 outline-none focus:border-[#A88959]"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span>Téléphone *</span>
          <input
            required
            type="tel"
            maxLength={30}
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="Ex. 0550 00 00 00"
            className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3 outline-none focus:border-[#A88959]"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span>Notes (facultatif)</span>
          <textarea
            rows={3}
            maxLength={1000}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Préférences ou informations utiles..."
            className="w-full resize-y rounded-xl border border-[#E8E3DA] px-3 py-3 outline-none focus:border-[#A88959]"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#E8E3DA] px-4 py-3 text-sm">
            Annuler
          </button>
          <button type="submit" className="flex-1 rounded-xl bg-[#302D29] px-4 py-3 text-sm font-medium text-white hover:bg-[#51483C]">
            {client ? 'Enregistrer' : 'Ajouter la cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}
