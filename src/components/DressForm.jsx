
import { useState } from 'react'
import { X } from 'lucide-react'

const emptyDress = {
  reference: '',
  name: '',
  type: 'Princesse',
  size: '40',
  rentalPrice: '',
  status: 'Disponible',
}

const types = ['Princesse', 'Sirène', 'Évasée', 'Fourreau', 'Droite', 'Autre']

export default function DressForm({ dress, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    dress
      ? {
          ...dress,
          size: String(dress.size),
          rentalPrice: String(dress.rentalPrice),
        }
      : emptyDress,
  )

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    onSave({
      ...form,
      size: Number(form.size),
      rentalPrice: Number(form.rentalPrice),
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {dress ? 'Modifier la robe' : 'Ajouter une robe'}
            </h3>
            <p className="mt-1 text-sm text-[#8D8579]">
              Les champs marqués * sont obligatoires.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-xl p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span>Nom de la robe *</span>
            <input
              required
              autoFocus
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ex. Princesse dentelle"
              className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3 outline-none focus:border-[#A88959]"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span>Référence</span>
            <input
              value={form.reference}
              onChange={(e) => update('reference', e.target.value)}
              placeholder="Ex. WM-007"
              className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3 outline-none focus:border-[#A88959]"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span>Type *</span>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-3 py-3 outline-none focus:border-[#A88959]"
            >
              {types.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span>Taille *</span>
            <select
              required
              value={form.size}
              onChange={(e) => update('size', e.target.value)}
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-3 py-3 outline-none focus:border-[#A88959]"
            >
              {['34', '36', '38', '40', '42', '44', '46', '48', '50', '52'].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span>Prix de location (DA) *</span>
            <input
              required
              min="0"
              type="number"
              value={form.rentalPrice}
              onChange={(e) => update('rentalPrice', e.target.value)}
              placeholder="45000"
              className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3 outline-none focus:border-[#A88959]"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span>Statut *</span>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-3 py-3 outline-none focus:border-[#A88959]"
            >
              <option>Disponible</option>
              <option>En location</option>
              <option>Entretien</option>
            </select>
          </label>
        </div>

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#E8E3DA] px-4 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-[#302D29] px-4 py-3 text-sm font-medium text-white hover:bg-[#51483C]"
          >
            {dress ? 'Enregistrer' : 'Ajouter la robe'}
          </button>
        </div>
      </form>
    </div>
  )
}
