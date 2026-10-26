
import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import {
  hasRentalConflict,
  getLocalDate,
} from '../utils/rentals'

export default function RentalForm({
  clients,
  dresses,
  rentals,
  onSave,
  onCreateClient,
  onClose,
}) {
  const [showNewClient, setShowNewClient] = useState(false)
  const [newClient, setNewClient] = useState({
    fullName: '',
    phone: '',
    notes: '',
  })
  const [savingNewClient, setSavingNewClient] = useState(false)
  const [form, setForm] = useState({
    clientId: '',
    dressId: '',
    startDate: getLocalDate(),
    dueDate: '',
    rentalPrice: '',
    advance: '0',
    notes: '',
  })

  // Afficher uniquement les robes qui ne sont pas en entretien
  // et qui sont libres pendant toute la période choisie.
  const availableDresses = useMemo(() => {
    const dressesNotInMaintenance = dresses.filter(
      (dress) => dress.status !== 'Entretien',
    )

    if (!form.startDate || !form.dueDate) {
      return dressesNotInMaintenance
    }

    if (form.dueDate < form.startDate) {
      return []
    }

    return dressesNotInMaintenance.filter(
      (dress) =>
        !hasRentalConflict(
          dress.id,
          form.startDate,
          form.dueDate,
          rentals,
        ),
    )
  }, [dresses, rentals, form.startDate, form.dueDate])

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'dressId' ? { rentalPrice: '' } : {}),
    }))
  }

  const selectedDress = dresses.find(
    (dress) => String(dress.id) === form.dressId,
  )

  const price = Number(form.rentalPrice)
  const advance = Number(form.advance)
  const remaining = Math.max(0, price - advance)

  async function handleCreateClient(event) {
    event.preventDefault()

    const fullName = newClient.fullName.trim()
    const phone = newClient.phone.trim()

    if (!fullName || !phone) {
      window.alert('Renseigne le nom et le téléphone de la cliente.')
      return
    }

    setSavingNewClient(true)

    const created = await onCreateClient({
      fullName,
      phone,
      notes: newClient.notes.trim(),
    })

    setSavingNewClient(false)

    if (created) {
      setForm((current) => ({ ...current, clientId: created.id }))
      setShowNewClient(false)
      setNewClient({ fullName: '', phone: '', notes: '' })
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.clientId) {
      window.alert('Choisis une cliente.')
      return
    }

    if (!form.dressId || !selectedDress) {
      window.alert('Choisis une robe.')
      return
    }

    if (selectedDress.status === 'Entretien') {
      window.alert('Cette robe est en entretien.')
      return
    }

    if (!form.startDate || !form.dueDate) {
      window.alert('Renseigne les dates de sortie et de retour.')
      return
    }

    if (form.dueDate < form.startDate) {
      window.alert(
        'La date de retour doit être le même jour ou après la date de sortie.',
      )
      return
    }

    if (!Number.isFinite(price) || price < 0) {
      window.alert('Le prix de location est invalide.')
      return
    }

    if (!Number.isFinite(advance) || advance < 0) {
      window.alert('Le montant de l’avance est invalide.')
      return
    }

    if (advance > price) {
      window.alert(
        'L’avance ne peut pas dépasser le prix de location.',
      )
      return
    }

    if (
      hasRentalConflict(
        selectedDress.id,
        form.startDate,
        form.dueDate,
        rentals,
      )
    ) {
      window.alert(
        'Cette robe est déjà réservée sur ces dates. Choisis une autre période ou une autre robe.',
      )
      return
    }

    onSave({
      ...form,
      // Les IDs sont des strings (UUID côté backend)
      clientId: form.clientId,
      dressId: form.dressId,
      rentalPrice: price,
      advance,
      notes: form.notes.trim(),
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
              Nouvelle location
            </h3>
            <p className="mt-1 text-sm text-[#8D8579]">
              Associer une cliente à une robe.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-2 hover:bg-[#F8F5EF]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span>Cliente *</span>
              <button
                type="button"
                onClick={() => setShowNewClient(true)}
                className="rounded-lg bg-[#F8F5EF] px-2.5 py-1 text-xs font-medium hover:bg-[#EDE7DC]"
              >
                + Nouvelle cliente
              </button>
            </div>
            <select
              required
              value={form.clientId}
              onChange={(e) =>
                update('clientId', e.target.value)
              }
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-3 py-3"
            >
              <option value="">Choisir une cliente</option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName} — {client.phone}
                </option>
              ))}
            </select>
          </div>

          <label className="space-y-1.5 text-sm">
            Robe *
            <select
              required
              value={form.dressId}
              onChange={(e) => {
                const value = e.target.value

                const dress = dresses.find(
                  (item) => String(item.id) === value,
                )

                setForm((current) => ({
                  ...current,
                  dressId: value,
                  rentalPrice: dress
                    ? String(dress.rentalPrice)
                    : '',
                }))
              }}
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-3 py-3"
            >
              <option value="">Choisir une robe</option>

              {availableDresses.map((dress) => (
                <option key={dress.id} value={dress.id}>
                  {dress.reference} — {dress.name} (taille{' '}
                  {dress.size})
                </option>
              ))}
            </select>

            {form.startDate && form.dueDate && (
              <span className="block text-xs text-[#8D8579]">
                {availableDresses.length} robe(s) disponible(s)
                sur cette période.
              </span>
            )}

            {availableDresses.length === 0 && (
              <span className="block text-xs text-amber-700">
                Aucune robe disponible sur cette période.
              </span>
            )}
          </label>

          <label className="space-y-1.5 text-sm">
            Date de sortie *
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) =>
                update('startDate', e.target.value)
              }
              className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            Retour prévu *
            <input
              type="date"
              required
              min={form.startDate}
              value={form.dueDate}
              onChange={(e) =>
                update('dueDate', e.target.value)
              }
              className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            Prix de location (DA) *
            <input
              type="number"
              min="0"
              step="any"
              required
              value={form.rentalPrice}
              onChange={(e) =>
                update('rentalPrice', e.target.value)
              }
              className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            Avance versée (DA)
            <input
              type="number"
              min="0"
              step="any"
              required
              value={form.advance}
              onChange={(e) =>
                update('advance', e.target.value)
              }
              className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3"
            />
          </label>

          <div className="rounded-xl bg-[#F8F5EF] p-3 sm:col-span-2">
            <p className="text-sm text-[#89847B]">
              Reste à payer
            </p>
            <p className="mt-1 text-xl font-semibold">
              {remaining.toLocaleString('fr-FR')} DA
            </p>
          </div>

          <label className="space-y-1.5 text-sm sm:col-span-2">
            Notes (facultatif)
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) =>
                update('notes', e.target.value)
              }
              className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3"
              placeholder="Informations complémentaires..."
            />
          </label>
        </div>

        {showNewClient && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
            <form
              onSubmit={handleCreateClient}
              className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Nouvelle cliente</h4>
                <button
                  type="button"
                  onClick={() => setShowNewClient(false)}
                  aria-label="Fermer"
                  className="rounded-lg p-2 hover:bg-[#F8F5EF]"
                >
                  <X size={20} />
                </button>
              </div>

              <label className="block space-y-1.5 text-sm">
                <span>Nom complet *</span>
                <input
                  required
                  autoFocus
                  value={newClient.fullName}
                  onChange={(e) => setNewClient((c) => ({ ...c, fullName: e.target.value }))}
                  className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3"
                  placeholder="Ex. Sarah Amrani"
                />
              </label>

              <label className="block space-y-1.5 text-sm">
                <span>Téléphone *</span>
                <input
                  required
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient((c) => ({ ...c, phone: e.target.value }))}
                  className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3"
                  placeholder="Ex. 0770 12 34 56"
                />
              </label>

              <label className="block space-y-1.5 text-sm">
                <span>Notes</span>
                <textarea
                  rows={2}
                  value={newClient.notes}
                  onChange={(e) => setNewClient((c) => ({ ...c, notes: e.target.value }))}
                  className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3"
                />
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewClient(false)}
                  className="flex-1 rounded-xl border border-[#E8E3DA] px-4 py-3 text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingNewClient}
                  className="flex-1 rounded-xl bg-[#302D29] px-4 py-3 text-sm text-white disabled:opacity-40"
                >
                  {savingNewClient ? 'Enregistrement…' : 'Enregistrer et sélectionner'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#E8E3DA] px-4 py-3 text-sm"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={!availableDresses.length}
            className="flex-1 rounded-xl bg-[#302D29] px-4 py-3 text-sm text-white disabled:opacity-40"
          >
            Enregistrer la location
          </button>
        </div>
      </form>
    </div>
  )
}
