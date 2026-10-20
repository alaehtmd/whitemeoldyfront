
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { rentalEnd } from '../utils/rentals'

const pad = (value) => String(value).padStart(2, '0')

const toDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const formatDate = (value) =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR')
    : '—'

export default function RentalCalendar({ dresses, clients, rentals }) {
  const [month, setMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}`
  })

  const [selectedRental, setSelectedRental] = useState(null)

  const { year, monthIndex, daysInMonth, days, monthLabel } =
    useMemo(() => {
      const [y, m] = month.split('-').map(Number)
      const index = m - 1
      const count = new Date(y, m, 0).getDate()

      return {
        year: y,
        monthIndex: index,
        daysInMonth: count,
        days: Array.from({ length: count }, (_, i) => i + 1),
        monthLabel: new Date(y, index, 1).toLocaleDateString(
          'fr-FR',
          { month: 'long', year: 'numeric' },
        ),
      }
    }, [month])

  function changeMonth(amount) {
    const date = new Date(year, monthIndex + amount, 1)
    setMonth(`${date.getFullYear()}-${pad(date.getMonth() + 1)}`)
  }

  const today = toDateString(new Date())
  const monthStart = `${month}-01`
  const monthEnd = `${month}-${pad(daysInMonth)}`

  const visibleRentals = rentals.filter((rental) => {
    if (rental.status === 'Annulée') return false

    const end = rentalEnd(rental)
    return rental.startDate <= monthEnd && end >= monthStart
  })

  function showRental(rental) {
    setSelectedRental(rental)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-2xl font-semibold">
            Calendrier des réservations
          </h3>
          <p className="mt-2 text-sm text-[#89847B]">
            Visualise les périodes occupées robe par robe.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ECE8E0] bg-white p-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Mois précédent"
            className="rounded-lg p-2 hover:bg-[#F8F5EF]"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="min-w-36 text-center font-medium capitalize">
            {monthLabel}
          </span>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Mois suivant"
            className="rounded-lg p-2 hover:bg-[#F8F5EF]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-xs text-[#77736C]">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#C9B18A]" />
          Réservation / location
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#DCEBDD]" />
          Aujourd’hui
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#ECE8E0] bg-white">
        {dresses.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto text-[#A0927E]" size={32} />
            <p className="mt-3 font-medium">Aucune robe au catalogue</p>
            <p className="mt-1 text-sm text-[#89847B]">
              Ajoute des robes pour commencer à utiliser le calendrier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div
                className="grid border-b border-[#ECE8E0] bg-[#FAF9F6]"
                style={{
                  gridTemplateColumns: `190px repeat(${daysInMonth}, 36px)`,
                }}
              >
                <div className="sticky left-0 z-20 border-r border-[#ECE8E0] bg-[#FAF9F6] px-4 py-3 text-xs font-semibold">
                  ROBE
                </div>

                {days.map((day) => {
                  const date = `${month}-${pad(day)}`
                  const isToday = date === today

                  return (
                    <div
                      key={day}
                      className={`border-r border-[#F0EDE7] py-3 text-center text-xs ${
                        isToday
                          ? 'bg-[#DCEBDD] font-bold text-green-800'
                          : 'text-[#77736C]'
                      }`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>

              {dresses.map((dress) => {
                const dressRentals = visibleRentals.filter(
                  (rental) => rental.dressId === dress.id,
                )

                return (
                  <div
                    key={dress.id}
                    className="grid min-h-[76px] border-b border-[#F0EDE7] last:border-b-0"
                    style={{
                      gridTemplateColumns: `190px repeat(${daysInMonth}, 36px)`,
                    }}
                  >
                    <div className="sticky left-0 z-10 flex flex-col justify-center border-r border-[#ECE8E0] bg-white px-4 py-3">
                      <span className="text-sm font-medium">
                        {dress.name}
                      </span>
                      <span className="mt-1 text-xs text-[#89847B]">
                        {dress.reference} · Taille {dress.size}
                      </span>
                      {dress.status === 'Entretien' && (
                        <span className="mt-1 text-xs text-amber-700">
                          En entretien
                        </span>
                      )}
                    </div>

                    <div
                      className="col-start-2 grid items-center gap-y-1 py-2"
                      style={{
                        gridColumn: `2 / span ${daysInMonth}`,
                        gridTemplateColumns: `repeat(${daysInMonth}, 36px)`,
                        gridTemplateRows: 'repeat(auto-fit, 24px)',
                        backgroundImage:
                          'repeating-linear-gradient(to right, transparent 0, transparent 35px, #F0EDE7 35px, #F0EDE7 36px)',
                      }}
                    >
                      {dressRentals.map((rental) => {
                        const end = rentalEnd(rental)

                        const visibleStart =
                          rental.startDate < monthStart
                            ? monthStart
                            : rental.startDate

                        const visibleEnd =
                          end > monthEnd ? monthEnd : end

                        const startDay = Number(
                          visibleStart.slice(8, 10),
                        )
                        const endDay = Number(
                          visibleEnd.slice(8, 10),
                        )

                        const client = clients.find(
                          (item) => item.id === rental.clientId,
                        )

                        const row = dressRentals
                          .filter((item) => item.id === rental.id)
                          .length

                        return (
                          <button
                            key={rental.id}
                            type="button"
                            onClick={() => showRental(rental)}
                            title={`${client?.fullName || 'Cliente'} · ${formatDate(rental.startDate)} - ${formatDate(end)}`}
                            className="mx-0.5 truncate rounded-md bg-[#C9B18A] px-1 text-left text-[10px] font-medium text-white hover:bg-[#A98A5D]"
                            style={{
                              gridColumn: `${startDay} / ${endDay + 1}`,
                              gridRow: Math.max(1, row),
                            }}
                          >
                            {client?.fullName || 'Réservation'}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-[#89847B]">
        Fais défiler horizontalement pour consulter tous les jours du mois.
        Clique sur une réservation pour voir les détails.
      </p>

      {selectedRental && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedRental(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rental-detail-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="rental-detail-title"
                  className="text-lg font-semibold"
                >
                  Détails de la réservation
                </h3>
                <p className="mt-1 text-sm text-[#89847B]">
                  {clients.find(
                    (item) => item.id === selectedRental.clientId,
                  )?.fullName || 'Cliente introuvable'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRental(null)}
                className="rounded-lg p-2 hover:bg-[#F8F5EF]"
                aria-label="Fermer les détails"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="text-[#89847B]">Robe :</span>{' '}
                {dresses.find(
                  (item) => item.id === selectedRental.dressId,
                )?.name || 'Robe introuvable'}
              </p>
              <p>
                <span className="text-[#89847B]">Sortie :</span>{' '}
                {formatDate(selectedRental.startDate)}
              </p>
              <p>
                <span className="text-[#89847B]">Retour prévu :</span>{' '}
                {formatDate(selectedRental.dueDate)}
              </p>
              {selectedRental.actualReturnDate && (
                <p>
                  <span className="text-[#89847B]">Retour réel :</span>{' '}
                  {formatDate(selectedRental.actualReturnDate)}
                </p>
              )}
              <p>
                <span className="text-[#89847B]">Prix :</span>{' '}
                {Number(selectedRental.rentalPrice || 0).toLocaleString(
                  'fr-FR',
                )}{' '}
                DA
              </p>
              <p>
                <span className="text-[#89847B]">Avance :</span>{' '}
                {Number(selectedRental.advance || 0).toLocaleString(
                  'fr-FR',
                )}{' '}
                DA
              </p>
              <p>
                <span className="text-[#89847B]">Statut :</span>{' '}
                {selectedRental.status}
              </p>
              {selectedRental.notes && (
                <p>
                  <span className="text-[#89847B]">Notes :</span>{' '}
                  {selectedRental.notes}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedRental(null)}
              className="mt-6 w-full rounded-xl bg-[#302D29] px-4 py-3 text-sm text-white"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
