import { useMemo, useState } from 'react'
import {
  Wallet,
  Receipt,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from 'lucide-react'

import {
  getPaidAmount,
  getRemainingAmount,
  getFinancialSummary,
} from '../utils/finance'

const money = (amount) =>
  `${Number(amount || 0).toLocaleString('fr-FR')} DA`

const formatDate = (date) =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR')
    : '—'

const today = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const expenseCategories = [
  'Loyer',
  'Salaire',
  'Achat de robes',
  'Entretien',
  'Accessoires',
  'Publicité',
  'Transport',
  'Électricité / Internet',
  'Autre',
]

const emptyExpense = () => ({
  title: '',
  category: 'Autre',
  amount: '',
  date: today(),
  notes: '',
})

function SummaryCard({ label, value, icon: Icon, description }) {
  return (
    <article className="rounded-2xl border border-[#ECE8E0] bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EEE3] text-[#9B7B4D]">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-4 text-sm text-[#89847B]">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold">{value}</p>
      {description && (
        <p className="mt-2 text-xs text-[#89847B]">{description}</p>
      )}
    </article>
  )
}

function PaymentForm({ rentals, clients, dresses, onClose, onSave }) {
  const eligibleRentals = rentals.filter(
    (rental) =>
      rental.status !== 'Annulée' && getRemainingAmount(rental) > 0,
  )

  const [rentalId, setRentalId] = useState(
    eligibleRentals[0] ? String(eligibleRentals[0].id) : '',
  )
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')

  const selectedRental = eligibleRentals.find(
    (rental) => String(rental.id) === rentalId,
  )

  function submit(event) {
    event.preventDefault()

    const numericAmount = Number(amount)

    if (!selectedRental) {
      window.alert('Sélectionne une location avec un solde restant.')
      return
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      window.alert('Le montant doit être supérieur à zéro.')
      return
    }

    if (numericAmount > getRemainingAmount(selectedRental)) {
      window.alert('Le montant dépasse le solde restant de cette location.')
      return
    }

    if (!date) {
      window.alert('Choisis la date du paiement.')
      return
    }

    onSave(selectedRental.id, {
      amount: numericAmount,
      date,
      note: note.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={submit}
        className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Enregistrer un paiement</h3>
            <p className="mt-1 text-sm text-[#89847B]">
              Ajoute un encaissement à une location existante.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Fermer"
          >
            <X size={19} />
          </button>
        </div>

        {eligibleRentals.length === 0 ? (
          <div className="rounded-xl bg-[#F8F5EF] p-4 text-sm text-[#77736C]">
            Aucune location avec un solde restant. Tu peux fermer cette fenêtre.
          </div>
        ) : (
          <>
            <label className="mb-2 block text-sm font-medium">
              Cliente et location
            </label>
            <select
              value={rentalId}
              onChange={(event) => setRentalId(event.target.value)}
              className="mb-4 w-full rounded-xl border border-[#E8E3DA] bg-white px-3 py-3 text-sm"
              required
            >
              {eligibleRentals.map((rental) => {
                const client = clients.find(
                  (item) => item.id === rental.clientId,
                )
                const dress = dresses.find(
                  (item) => item.id === rental.dressId,
                )

                return (
                  <option key={rental.id} value={String(rental.id)}>
                    {client?.fullName || 'Cliente inconnue'} —{' '}
                    {dress?.reference || dress?.name || 'Robe'} — reste{' '}
                    {money(getRemainingAmount(rental))}
                  </option>
                )
              })}
            </select>

            {selectedRental && (
              <div className="mb-4 rounded-xl bg-[#F8F5EF] p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#89847B]">Prix de location</span>
                  <strong>{money(selectedRental.rentalPrice)}</strong>
                </div>
                <div className="mt-2 flex justify-between gap-3">
                  <span className="text-[#89847B]">Déjà encaissé</span>
                  <strong>{money(getPaidAmount(selectedRental))}</strong>
                </div>
                <div className="mt-2 flex justify-between gap-3">
                  <span className="text-[#89847B]">Reste à encaisser</span>
                  <strong>{money(getRemainingAmount(selectedRental))}</strong>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Montant (DA)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3 text-sm"
                  placeholder="Ex. 10000"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date du paiement
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3 text-sm"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                Note (facultatif)
              </label>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3 text-sm"
                placeholder="Ex. Paiement à la récupération de la robe"
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E8E3DA] px-4 py-3 text-sm"
              >
                Fermer
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#302D29] px-4 py-3 text-sm text-white"
              >
                Enregistrer le paiement
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}

function ExpenseForm({ expense, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...emptyExpense(),
    ...(expense || {}),
    amount:
      expense?.amount === undefined ? '' : String(expense.amount),
  }))

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()

    const amount = Number(form.amount)

    if (!form.title.trim()) {
      window.alert('Donne un nom à cette dépense.')
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert('Le montant doit être supérieur à zéro.')
      return
    }

    if (!form.date) {
      window.alert('Choisis la date de la dépense.')
      return
    }

    onSave({
      ...form,
      title: form.title.trim(),
      amount,
      notes: form.notes.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={submit}
        className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">
              {expense ? 'Modifier la dépense' : 'Nouvelle dépense'}
            </h3>
            <p className="mt-1 text-sm text-[#89847B]">
              Enregistre les charges de White Melody.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Fermer"
          >
            <X size={19} />
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium">
          Nom de la dépense
        </label>
        <input
          value={form.title}
          onChange={(event) => update('title', event.target.value)}
          className="mb-4 w-full rounded-xl border border-[#E8E3DA] px-3 py-3 text-sm"
          placeholder="Ex. Loyer du magasin"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Catégorie
            </label>
            <select
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-3 py-3 text-sm"
            >
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Montant (DA)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={form.amount}
              onChange={(event) => update('amount', event.target.value)}
              className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3 text-sm"
              placeholder="Ex. 30000"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(event) => update('date', event.target.value)}
            className="w-full rounded-xl border border-[#E8E3DA] px-3 py-3 text-sm"
            required
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">
            Description (facultatif)
          </label>
          <textarea
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            className="min-h-24 w-full rounded-xl border border-[#E8E3DA] px-3 py-3 text-sm"
            placeholder="Détails ou justificatif à retrouver plus tard"
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#E8E3DA] px-4 py-3 text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-xl bg-[#302D29] px-4 py-3 text-sm text-white"
          >
            {expense ? 'Enregistrer les changements' : 'Ajouter la dépense'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function FinanceManager({
  page,
  rentals,
  clients,
  dresses,
  expenses,
  onAddPayment,
  onSaveExpense,
  onDeleteExpense,
}) {
  const [paymentFormOpen, setPaymentFormOpen] = useState(false)
  const [expenseFormOpen, setExpenseFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [expenseSearch, setExpenseSearch] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('Toutes')

  const summary = useMemo(
    () => getFinancialSummary(rentals, expenses),
    [rentals, expenses],
  )

  const transactions = useMemo(() => {
    const result = []

    rentals
      .filter((rental) => rental.status !== 'Annulée')
      .forEach((rental) => {
        const client = clients.find(
          (item) => item.id === rental.clientId,
        )
        const dress = dresses.find(
          (item) => item.id === rental.dressId,
        )

        if (Number(rental.advance || 0) > 0) {
          result.push({
            id: `advance-${rental.id}`,
            date: rental.createdAt || rental.startDate,
            client: client?.fullName || 'Cliente inconnue',
            dress: dress?.reference || dress?.name || 'Robe',
            amount: Number(rental.advance),
            note: 'Avance initiale',
          })
        }

        ;(rental.payments || []).forEach((payment) => {
          result.push({
            id: payment.id,
            date: payment.date,
            client: client?.fullName || 'Cliente inconnue',
            dress: dress?.reference || dress?.name || 'Robe',
            amount: Number(payment.amount || 0),
            note: payment.note || 'Paiement complémentaire',
          })
        })
      })

    return result.sort((a, b) =>
      String(b.date || '').localeCompare(String(a.date || '')),
    )
  }, [rentals, clients, dresses])

  const filteredExpenses = useMemo(() => {
    const query = expenseSearch.trim().toLowerCase()

    return expenses
      .filter((expense) =>
        expenseCategory === 'Toutes'
          ? true
          : expense.category === expenseCategory,
      )
      .filter((expense) =>
        `${expense.title} ${expense.category} ${expense.notes || ''}`
          .toLowerCase()
          .includes(query),
      )
      .sort((a, b) =>
        String(b.date || '').localeCompare(String(a.date || '')),
      )
  }, [expenses, expenseSearch, expenseCategory])

  if (page === 'Trésorerie') {
    return (
      <div>
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h3 className="text-2xl font-semibold">Trésorerie</h3>
            <p className="mt-2 text-sm text-[#89847B]">
              Suis les encaissements et les sommes encore dues.
            </p>
          </div>
          <button
            onClick={() => setPaymentFormOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#302D29] px-4 py-3 text-sm text-white"
          >
            <Plus size={17} />
            Enregistrer un paiement
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Chiffre d'affaires prévu"
            value={money(summary.revenue)}
            icon={Receipt}
            description="Locations non annulées"
          />
          <SummaryCard
            label="Argent encaissé"
            value={money(summary.collected)}
            icon={ArrowDownLeft}
            description="Avances et paiements"
          />
          <SummaryCard
            label="Reste à encaisser"
            value={money(summary.remaining)}
            icon={Wallet}
            description="Sur les locations non annulées"
          />
          <SummaryCard
            label="Solde après dépenses"
            value={money(summary.cashBalance)}
            icon={ArrowUpRight}
            description="Encaissements moins dépenses enregistrées"
          />
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#ECE8E0] bg-white">
          <div className="border-b border-[#F0EDE7] p-5">
            <h4 className="font-semibold">Historique des encaissements</h4>
            <p className="mt-1 text-sm text-[#89847B]">
              Les avances saisies lors de la création d’une location sont
              incluses automatiquement.
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="p-10 text-center">
              <Wallet size={30} className="mx-auto text-[#A0927E]" />
              <p className="mt-3 font-medium">Aucun encaissement enregistré</p>
              <p className="mt-2 text-sm text-[#89847B]">
                Les avances apparaîtront ici dès qu’une location en contiendra.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-[#FAF9F6] text-xs text-[#89847B]">
                  <tr>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Cliente</th>
                    <th className="px-5 py-4 font-medium">Robe</th>
                    <th className="px-5 py-4 font-medium">Note</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE7]">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-5 py-4">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-5 py-4 font-medium">
                        {transaction.client}
                      </td>
                      <td className="px-5 py-4">{transaction.dress}</td>
                      <td className="px-5 py-4 text-[#89847B]">
                        {transaction.note}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                        + {money(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-[#ECE8E0] bg-white p-5">
          <h4 className="font-semibold">À retenir</h4>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <p className="rounded-xl bg-[#F8F5EF] p-4">
              <span className="block text-[#89847B]">Dépenses enregistrées</span>
              <strong className="mt-1 block">{money(summary.expenses)}</strong>
            </p>
            <p className="rounded-xl bg-[#F8F5EF] p-4">
              <span className="block text-[#89847B]">Solde après dépenses</span>
              <strong className="mt-1 block">
                {money(summary.cashBalance)}
              </strong>
            </p>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#89847B]">
            Ce solde est un calcul de trésorerie basé sur les données saisies
            dans l’application. Il ne comprend pas les mouvements non enregistrés,
            les remboursements ou les autres apports personnels.
          </p>
        </section>

        {paymentFormOpen && (
          <PaymentForm
            rentals={rentals}
            clients={clients}
            dresses={dresses}
            onClose={() => setPaymentFormOpen(false)}
            onSave={(rentalId, payment) => {
              onAddPayment(rentalId, payment)
              setPaymentFormOpen(false)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-2xl font-semibold">Dépenses</h3>
          <p className="mt-2 text-sm text-[#89847B]">
            Enregistre et retrouve toutes les charges de la boutique.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null)
            setExpenseFormOpen(true)
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#302D29] px-4 py-3 text-sm text-white"
        >
          <Plus size={17} />
          Ajouter une dépense
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <SummaryCard
          label="Total des dépenses"
          value={money(summary.expenses)}
          icon={Receipt}
          description="Toutes les dépenses enregistrées"
        />
        <SummaryCard
          label="Nombre de dépenses"
          value={expenses.length}
          icon={CheckCircle2}
          description="Éléments enregistrés"
        />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <div className="flex items-center gap-3 rounded-xl border border-[#ECE8E0] bg-white px-3">
          <Search size={18} className="shrink-0 text-[#A0927E]" />
          <input
            value={expenseSearch}
            onChange={(event) => setExpenseSearch(event.target.value)}
            className="w-full bg-transparent py-3 text-sm outline-none"
            placeholder="Rechercher une dépense..."
          />
        </div>
        <select
          value={expenseCategory}
          onChange={(event) => setExpenseCategory(event.target.value)}
          className="rounded-xl border border-[#ECE8E0] bg-white px-3 py-3 text-sm"
        >
          <option value="Toutes">Toutes les catégories</option>
          {expenseCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#ECE8E0] bg-white">
        {filteredExpenses.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt size={32} className="mx-auto text-[#A0927E]" />
            <h4 className="mt-3 font-semibold">Aucune dépense trouvée</h4>
            <p className="mt-2 text-sm text-[#89847B]">
              Ajoute ta première dépense ou modifie ta recherche.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EDE7]">
            {filteredExpenses.map((expense) => (
              <article
                key={expense.id}
                className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{expense.title}</h4>
                    <span className="rounded-full bg-[#F4EEE3] px-3 py-1 text-xs text-[#85663C]">
                      {expense.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#89847B]">
                    {formatDate(expense.date)}
                  </p>
                  {expense.notes && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#77736C]">
                      {expense.notes}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                  <p className="font-semibold text-red-700">
                    − {money(expense.amount)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingExpense(expense)
                        setExpenseFormOpen(true)
                      }}
                      className="rounded-lg border border-[#E8E3DA] p-2 hover:bg-[#F8F5EF]"
                      aria-label="Modifier la dépense"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Supprimer la dépense « ${expense.title} » ?`,
                          )
                        ) {
                          onDeleteExpense(expense)
                        }
                      }}
                      className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                      aria-label="Supprimer la dépense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {expenseFormOpen && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => {
            setExpenseFormOpen(false)
            setEditingExpense(null)
          }}
          onSave={(expense) => {
            onSaveExpense(expense)
            setExpenseFormOpen(false)
            setEditingExpense(null)
          }}
        />
      )}
    </div>
  )
}