import { Pencil, X, Phone, Receipt, CalendarDays } from 'lucide-react'
import { getPaidAmount, getRemainingAmount } from '../utils/finance'

const money = (amount) =>
  `${Number(amount || 0).toLocaleString('fr-FR')} DA`

const formatDate = (date) =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR')
    : '—'

export default function ClientDetails({
  client,
  rentals = [],
  dresses = [],
  onClose,
  onEdit,
}) {
  const clientRentals = rentals
    .filter((rental) => rental.clientId === client.id)
    .slice()
    .sort((a, b) =>
      String(b.startDate || '').localeCompare(String(a.startDate || '')),
    )

  const financialRentals = clientRentals.filter(
    (rental) => rental.status !== 'Annulée',
  )

  const totalRentals = financialRentals.reduce(
    (total, rental) => total + Number(rental.rentalPrice || 0),
    0,
  )

  const totalPaid = financialRentals.reduce(
    (total, rental) => total + getPaidAmount(rental),
    0,
  )

  const totalRemaining = financialRentals.reduce(
    (total, rental) => total + getRemainingAmount(rental),
    0,
  )

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <section className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#ECE8E0] bg-white p-5 sm:p-6">
          <div>
            <p className="text-xs tracking-[0.16em] text-[#A0927E]">
              FICHE CLIENTE
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              {client.fullName}
            </h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-[#77736C]">
              <Phone size={15} />
              {client.phone || 'Aucun numéro renseigné'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-[#ECE8E0] p-2 hover:bg-[#F8F5EF]"
            aria-label="Fermer la fiche cliente"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold">Informations de la cliente</h4>
              <p className="mt-1 text-sm text-[#89847B]">
                Coordonnées et historique de ses locations.
              </p>
            </div>

            <button
              onClick={() => onEdit(client)}
              className="flex items-center gap-2 rounded-xl border border-[#E8E3DA] px-3 py-2 text-sm hover:bg-[#F8F5EF]"
            >
              <Pencil size={15} />
              Modifier
            </button>
          </div>

          {client.notes && (
            <div className="rounded-xl bg-[#F8F5EF] p-4">
              <p className="text-xs font-medium text-[#89847B]">Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">
                {client.notes}
              </p>
            </div>
          )}

          <div>
            <h4 className="mb-3 font-semibold">Résumé financier</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-[#ECE8E0] p-4">
                <p className="text-xs text-[#89847B]">Locations</p>
                <p className="mt-2 text-xl font-semibold">
                  {money(totalRentals)}
                </p>
              </article>

              <article className="rounded-xl border border-[#ECE8E0] p-4">
                <p className="text-xs text-[#89847B]">Total payé</p>
                <p className="mt-2 text-xl font-semibold text-emerald-700">
                  {money(totalPaid)}
                </p>
              </article>

              <article className="rounded-xl border border-[#ECE8E0] p-4">
                <p className="text-xs text-[#89847B]">Reste à payer</p>
                <p className="mt-2 text-xl font-semibold">
                  {money(totalRemaining)}
                </p>
              </article>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Receipt size={18} className="text-[#9B7B4D]" />
              <h4 className="font-semibold">
                Historique des locations ({clientRentals.length})
              </h4>
            </div>

            {clientRentals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#DCD5C9] p-8 text-center">
                <CalendarDays
                  size={28}
                  className="mx-auto text-[#A0927E]"
                />
                <p className="mt-3 font-medium">
                  Aucune location enregistrée
                </p>
                <p className="mt-1 text-sm text-[#89847B]">
                  Les locations de cette cliente apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientRentals.map((rental) => {
                  const dress = dresses.find(
                    (item) => item.id === rental.dressId,
                  )

                  const cancelled = rental.status === 'Annulée'
                  const returned = Boolean(rental.actualReturnDate)
                  const paid = getPaidAmount(rental)
                  const remaining = getRemainingAmount(rental)

                  return (
                    <article
                      key={rental.id}
                      className="rounded-xl border border-[#ECE8E0] p-4"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <h5 className="font-semibold">
                            {dress?.reference || dress?.ref || 'Robe'} —{' '}
                            {dress?.name || 'Robe introuvable'}
                          </h5>
                          <p className="mt-1 text-sm text-[#89847B]">
                            Taille {dress?.size || '—'}
                          </p>
                        </div>

                        <span
                          className={`h-fit w-fit rounded-full px-3 py-1 text-xs ${
                            cancelled
                              ? 'bg-gray-100 text-gray-600'
                              : returned
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {cancelled
                            ? 'Annulée'
                            : returned
                              ? 'Terminée'
                              : 'À retourner'}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-[#89847B]">
                            Date de sortie
                          </p>
                          <p className="mt-1 font-medium">
                            {formatDate(rental.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#89847B]">
                            Retour prévu
                          </p>
                          <p className="mt-1 font-medium">
                            {formatDate(rental.dueDate)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#FAF9F6] p-3 text-sm">
                        <div>
                          <p className="text-[11px] text-[#89847B]">Prix</p>
                          <p className="mt-1 font-semibold">
                            {money(rental.rentalPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#89847B]">Payé</p>
                          <p className="mt-1 font-semibold text-emerald-700">
                            {money(paid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#89847B]">Reste</p>
                          <p className="mt-1 font-semibold">
                            {money(remaining)}
                          </p>
                        </div>
                      </div>

                      {(rental.payments || []).length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-semibold text-[#89847B]">
                            Paiements complémentaires
                          </p>
                          <div className="space-y-2">
                            {rental.payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex flex-wrap justify-between gap-2 text-xs"
                              >
                                <span className="text-[#77736C]">
                                  {formatDate(payment.date)}
                                  {payment.note ? ` · ${payment.note}` : ''}
                                </span>
                                <strong>{money(payment.amount)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {rental.notes && (
                        <p className="mt-3 text-sm text-[#77736C]">
                          Note : {rental.notes}
                        </p>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-[#ECE8E0] pt-4">
            <button
              onClick={onClose}
              className="rounded-xl bg-[#302D29] px-5 py-3 text-sm text-white"
            >
              Fermer
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}