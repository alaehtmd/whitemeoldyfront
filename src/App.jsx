import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Shirt,
  CalendarDays,
  Users,
  Wallet,
  Receipt,
  Settings,
  Bell,
  Plus,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  Ban,
} from 'lucide-react'

import { api } from './api'

import DressesTable from './components/DressesTable'
import DressForm from './components/DressForm'
import ClientsTable from './components/ClientsTable'
import ClientForm from './components/ClientForm'
import ClientDetails from './components/ClientDetails'
import RentalForm from './components/RentalForm'
import RentalCalendar from './components/RentalCalendar'
import FinanceManager from './components/FinanceManager'

import {
  getDressStatus,
  getNextAvailability,
  getLocalDate,
  hasRentalConflict,
} from './utils/rentals'

import {
  getPaidAmount,
  getRemainingAmount,
  getFinancialSummary,
} from './utils/finance'

const navigation = [
  { label: 'Vue générale', icon: LayoutDashboard },
  { label: 'Mes robes', icon: Shirt },
  { label: 'Locations', icon: CalendarDays },
  { label: 'Calendrier', icon: CalendarDays },
  { label: 'Clientes', icon: Users },
  { label: 'Trésorerie', icon: Wallet },
  { label: 'Dépenses', icon: Receipt },
]

const money = (amount) =>
  `${Number(amount || 0).toLocaleString('fr-FR')} DA`

const formatDate = (date) =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR')
    : '—'



export default function App() {
  const [activePage, setActivePage] = useState('Vue générale')
  const [menuOpen, setMenuOpen] = useState(false)

  const [dresses, setDresses] = useState([])
  const [clients, setClients] = useState([])
  const [rentals, setRentals] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const [search, setSearch] = useState('')
  const [clientSearch, setClientSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [clientFormOpen, setClientFormOpen] = useState(false)
  const [rentalFormOpen, setRentalFormOpen] = useState(false)

  const [editingDress, setEditingDress] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [viewingClient, setViewingClient] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        const [dressesData, clientsData, rentalsData, expensesData] =
          await Promise.all([
            api.get('/dresses'),
            api.get('/clients'),
            api.get('/rentals'),
            api.get('/expenses'),
          ])

        if (cancelled) return

        setDresses(dressesData)
        setClients(clientsData)
        setRentals(rentalsData)
        setExpenses(expensesData)
      } catch (error) {
        if (cancelled) return
        setLoadError(error.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [retryCount])

  const catalogueDresses = dresses.map((dress) => ({
    ...dress,
    status:
      dress.status === 'Entretien'
        ? 'Entretien'
        : getDressStatus(dress.id, rentals),
  }))

  const activeRentals = rentals.filter(
    (rental) => rental.status !== 'Annulée',
  )

  const financialSummary = getFinancialSummary(rentals, expenses)

  // ROBES
  function openAddForm() {
    setEditingDress(null)
    setFormOpen(true)
  }

  function openEditForm(dress) {
    const original = dresses.find((item) => item.id === dress.id)
    setEditingDress(original || dress)
    setFormOpen(true)
  }

  async function saveDress(form) {
    try {
      if (editingDress) {
        const updated = await api.put(`/dresses/${editingDress.id}`, form)
        setDresses((current) =>
          current.map((dress) =>
            dress.id === editingDress.id ? updated : dress,
          ),
        )
      } else {
        const created = await api.post('/dresses', form)
        setDresses((current) => [...current, created])
      }

      setFormOpen(false)
      setEditingDress(null)
    } catch (error) {
      window.alert(error.message)
    }
  }

  async function deleteDress(dress) {
    const hasHistory = rentals.some(
      (rental) => rental.dressId === dress.id,
    )

    if (hasHistory) {
      window.alert(
        'Cette robe possède un historique de location. Conserve sa fiche pour préserver cet historique.',
      )
      return
    }

    if (!window.confirm(`Supprimer la robe « ${dress.name} » ?`)) return

    try {
      await api.delete(`/dresses/${dress.id}`)
      setDresses((current) =>
        current.filter((item) => item.id !== dress.id),
      )
    } catch (error) {
      window.alert(error.message)
    }
  }

  // CLIENTES
  function openAddClient() {
    setEditingClient(null)
    setClientFormOpen(true)
  }

  function openEditClient(client) {
    setEditingClient(client)
    setClientFormOpen(true)
  }

  async function saveClient(form) {
    const phone = form.phone.replace(/\s/g, '')

    const duplicate = clients.find(
      (client) =>
        client.phone.replace(/\s/g, '') === phone &&
        client.id !== editingClient?.id,
    )

    if (duplicate) {
      window.alert('Ce numéro existe déjà dans le fichier clientes.')
      return
    }

    if (editingClient) {
      try {
        const updated = await api.put(`/clients/${editingClient.id}`, form)
        setClients((current) =>
          current.map((client) =>
            client.id === editingClient.id ? updated : client,
          ),
        )
      } catch (error) {
        window.alert(error.message)
        return
      }
    } else {
      try {
        const created = await api.post('/clients', form)
        setClients((current) => [...current, created])
      } catch (error) {
        window.alert(error.message)
        return
      }
    }

    setClientFormOpen(false)
    setEditingClient(null)
  }

  async function deleteClient(client) {
    if (rentals.some((rental) => rental.clientId === client.id)) {
      window.alert(
        'Cette cliente possède un historique de location. Conserve sa fiche.',
      )
      return
    }

    if (!window.confirm(`Supprimer la fiche de ${client.fullName} ?`)) {
      return
    }

    try {
      await api.delete(`/clients/${client.id}`)
      setClients((current) =>
        current.filter((item) => item.id !== client.id),
      )
    } catch (error) {
      window.alert(error.message)
      return
    }

    if (viewingClient?.id === client.id) {
      setViewingClient(null)
    }
  }

  // LOCATIONS
  async function saveRental(form) {
    const clientExists = clients.some(
      (client) => client.id === form.clientId,
    )

    const dressExists = dresses.some(
      (dress) => dress.id === form.dressId,
    )

    if (!clientExists || !dressExists) {
      window.alert('La cliente ou la robe sélectionnée est introuvable.')
      return
    }

    const selectedDress = dresses.find(
      (dress) => dress.id === form.dressId,
    )

    if (selectedDress.status === 'Entretien') {
      window.alert('Cette robe est en entretien et ne peut pas être louée.')
      return
    }

    if (
      hasRentalConflict(
        form.dressId,
        form.startDate,
        form.dueDate,
        rentals,
      )
    ) {
      window.alert('Cette robe est déjà réservée sur cette période.')
      return
    }

    try {
      const created = await api.post('/rentals', form)
      setRentals((current) => [...current, created])
    } catch (error) {
      window.alert(error.message)
      return
    }

    setRentalFormOpen(false)
  }

  async function markReturned(rental) {
    if (
      !window.confirm(
        'Confirmer le retour de cette robe aujourd’hui ?',
      )
    ) {
      return
    }

    try {
      const updated = await api.put(`/rentals/${rental.id}`, {
        actualReturnDate: getLocalDate(),
        status: 'Terminée',
      })

      setRentals((current) =>
        current.map((item) =>
          item.id === rental.id ? updated : item,
        ),
      )
    } catch (error) {
      window.alert(error.message)
    }
  }

  async function cancelRental(rental) {
    if (
      !window.confirm(
        'Annuler cette location ? Elle sera exclue des totaux financiers. Vérifie séparément tout remboursement éventuel.',
      )
    ) {
      return
    }

    try {
      const updated = await api.put(`/rentals/${rental.id}`, {
        status: 'Annulée',
      })

      setRentals((current) =>
        current.map((item) =>
          item.id === rental.id ? updated : item,
        ),
      )
    } catch (error) {
      window.alert(error.message)
    }
  }

  // TRÉSORERIE : paiements supplémentaires
  async function addPayment(rentalId, payment) {
    const rental = rentals.find(
      (item) => item.id === rentalId,
    )

    if (!rental || rental.status === 'Annulée') {
      window.alert('Cette location est introuvable ou a été annulée.')
      return
    }

    const amount = Number(payment.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert('Le montant du paiement est invalide.')
      return
    }

    if (amount > getRemainingAmount(rental)) {
      window.alert('Le paiement dépasse le solde restant.')
      return
    }

    try {
      const updated = await api.post(`/payments/${rentalId}`, payment)
      setRentals((current) =>
        current.map((item) =>
          item.id === rentalId ? updated : item,
        ),
      )
    } catch (error) {
      window.alert(error.message)
    }
  }

  // DÉPENSES
  async function saveExpense(expense) {
    try {
      if (expense.id) {
        const updated = await api.put(`/expenses/${expense.id}`, expense)
        setExpenses((current) =>
          current.map((item) =>
            item.id === expense.id ? updated : item,
          ),
        )
      } else {
        const created = await api.post('/expenses', expense)
        setExpenses((current) => [...current, created])
      }
    } catch (error) {
      window.alert(error.message)
    }
  }

  async function deleteExpense(expense) {
    try {
      await api.delete(`/expenses/${expense.id}`)
      setExpenses((current) =>
        current.filter((item) => item.id !== expense.id),
      )
    } catch (error) {
      window.alert(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#302D29]">
      {menuOpen && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#ECE8E0] bg-white transition-transform lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-24 items-center gap-3 border-b border-[#F0EDE7] px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4EEE3] text-[#9B7B4D]">
            <Sparkles size={23} />
          </div>

          <div>
            <h1 className="text-lg font-semibold">White Melody</h1>
            <p className="mt-1 text-[10px] tracking-[0.24em] text-[#A0927E]">
              MANAGER
            </p>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            className="ml-auto p-2 lg:hidden"
            aria-label="Fermer"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="space-y-1 px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.18em] text-[#B0A697]">
            ESPACE DE GESTION
          </p>

          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                setActivePage(label)
                setMenuOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${
                activePage === label
                  ? 'bg-[#F4EEE3] font-medium text-[#85663C]'
                  : 'text-[#77736C] hover:bg-[#F8F7F4]'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-[#F8F5EF] p-4">
            <Sparkles size={20} className="mb-2 text-[#9B7B4D]" />
            <p className="text-sm font-medium">White Melody</p>
            <p className="mt-1 text-xs leading-5 text-[#898174]">
              La gestion de votre boutique, simplement.
            </p>
          </div>

          <button
            onClick={() => {
              setActivePage('Paramètres')
              setMenuOpen(false)
            }}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#77736C] hover:bg-gray-50"
          >
            <Settings size={18} />
            Paramètres
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#ECE8E0] bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-xl border border-[#ECE8E0] p-2 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-xs text-[#A0927E]">
                WHITE MELODY / GESTION
              </p>
              <h2 className="mt-1 font-semibold">{activePage}</h2>
            </div>
          </div>

          <button
            aria-label="Notifications"
            className="rounded-xl border border-[#ECE8E0] p-2.5 text-[#77736C]"
          >
            <Bell size={18} />
          </button>
        </header>

        <div className="mx-auto max-w-[1440px] p-4 sm:p-8">
          {loading ? (
            <div className="rounded-2xl border border-[#ECE8E0] bg-white p-10 text-center text-sm text-[#77736C]">
              Chargement des données…
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-medium text-red-700">
                Impossible de charger les données.
              </p>
              <p className="mt-1 text-sm text-red-600">{loadError}</p>
              <button
                onClick={() => {
                  setLoadError(null)
                  setLoading(true)
                  setRetryCount((count) => count + 1)
                }}
                className="mt-4 rounded-xl bg-[#302D29] px-4 py-2 text-sm text-white"
              >
                Réessayer
              </button>
            </div>
          ) : (
          <>
          {activePage === 'Mes robes' ? (
            <>
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-2xl font-semibold">
                    Catalogue des robes
                  </h3>
                  <p className="mt-2 text-sm text-[#89847B]">
                    Inventaire et disponibilités calculées automatiquement.
                  </p>
                </div>

                <button
                  onClick={openAddForm}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#302D29] px-4 py-3 text-sm text-white"
                >
                  <Plus size={17} />
                  Ajouter une robe
                </button>
              </div>

              <DressesTable
                dresses={catalogueDresses}
                search={search}
                setSearch={setSearch}
                onAdd={openAddForm}
                onEdit={openEditForm}
                onDelete={deleteDress}
              />

              <div className="mt-4 rounded-xl border border-[#ECE8E0] bg-white p-4 text-sm text-[#77736C]">
                <p>
                  <strong>Prochaine disponibilité :</strong> la date est
                  calculée à partir des locations enregistrées.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {catalogueDresses.map((dress) => (
                    <span
                      key={dress.id}
                      className="rounded-lg bg-[#F8F5EF] px-3 py-2"
                    >
                      {dress.reference}:{' '}
                      {formatDate(getNextAvailability(dress.id, rentals))}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : activePage === 'Clientes' ? (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold">Clientes</h3>
                <p className="mt-2 text-sm text-[#89847B]">
                  Coordonnées et historique des clientes.
                </p>
              </div>

              <ClientsTable
                clients={clients}
                search={clientSearch}
                setSearch={setClientSearch}
                onAdd={openAddClient}
                onEdit={openEditClient}
                onDelete={deleteClient}
                onView={(client) => setViewingClient(client)}
              />
            </>
          ) : activePage === 'Calendrier' ? (
            <RentalCalendar
              dresses={catalogueDresses}
              clients={clients}
              rentals={rentals}
            />
          ) : activePage === 'Locations' ? (
            <>
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-2xl font-semibold">
                    Gestion des locations
                  </h3>
                  <p className="mt-2 text-sm text-[#89847B]">
                    Chaque location relie une cliente, une robe et des dates.
                  </p>
                </div>

                <button
                  onClick={() => setRentalFormOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#302D29] px-4 py-3 text-sm text-white"
                >
                  <Plus size={17} />
                  Nouvelle location
                </button>
              </div>

              <div className="mb-5 grid gap-4 sm:grid-cols-3">
                <article className="rounded-2xl border border-[#ECE8E0] bg-white p-5">
                  <p className="text-sm text-[#89847B]">
                    Locations non annulées
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {activeRentals.length}
                  </p>
                </article>

                <article className="rounded-2xl border border-[#ECE8E0] bg-white p-5">
                  <p className="text-sm text-[#89847B]">
                    Total encaissé
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {money(financialSummary.collected)}
                  </p>
                </article>

                <article className="rounded-2xl border border-[#ECE8E0] bg-white p-5">
                  <p className="text-sm text-[#89847B]">
                    Reste à encaisser
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {money(financialSummary.remaining)}
                  </p>
                </article>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#ECE8E0] bg-white">
                {rentals.length === 0 ? (
                  <div className="p-10 text-center">
                    <CalendarDays
                      size={32}
                      className="mx-auto text-[#A0927E]"
                    />
                    <h4 className="mt-3 font-semibold">
                      Aucune location pour le moment
                    </h4>
                    <p className="mt-2 text-sm text-[#89847B]">
                      Crée une location pour relier une cliente à une robe.
                    </p>
                    <button
                      onClick={() => setRentalFormOpen(true)}
                      className="mt-5 rounded-xl bg-[#302D29] px-4 py-3 text-sm text-white"
                    >
                      Créer une location
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F0EDE7]">
                    {rentals
                      .slice()
                      .sort((a, b) =>
                        b.startDate.localeCompare(a.startDate),
                      )
                      .map((rental) => {
                        const client = clients.find(
                          (item) => item.id === rental.clientId,
                        )
                        const dress = dresses.find(
                          (item) => item.id === rental.dressId,
                        )
                        const cancelled = rental.status === 'Annulée'
                        const returned = Boolean(rental.actualReturnDate)
                        const overdue =
                          !cancelled &&
                          !returned &&
                          rental.dueDate < getLocalDate()

                        return (
                          <article
                            key={rental.id}
                            className="space-y-4 p-4 sm:p-5"
                          >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row">
                              <div>
                                <h4 className="font-semibold">
                                  {client?.fullName || 'Cliente introuvable'}
                                </h4>
                                <p className="mt-1 text-sm text-[#89847B]">
                                  {client?.phone || '—'}
                                </p>
                                <p className="mt-2 text-sm">
                                  {dress?.reference || '—'} ·{' '}
                                  {dress?.name || 'Robe introuvable'}
                                  {dress ? ` · Taille ${dress.size}` : ''}
                                </p>
                              </div>

                              <div className="sm:text-right">
                                <p className="font-semibold">
                                  {money(rental.rentalPrice)}
                                </p>
                                <p className="mt-1 text-xs text-[#89847B]">
                                  Total payé : {money(getPaidAmount(rental))}
                                </p>
                                <p className="mt-1 text-xs text-[#89847B]">
                                  Reste : {money(getRemainingAmount(rental))}
                                </p>
                              </div>
                            </div>

                            <div className="grid gap-3 rounded-xl bg-[#FAF9F6] p-3 text-sm sm:grid-cols-3">
                              <div>
                                <p className="text-xs text-[#89847B]">
                                  Sortie prévue
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
                              <div>
                                <p className="text-xs text-[#89847B]">
                                  Retour réel
                                </p>
                                <p className="mt-1 font-medium">
                                  {formatDate(rental.actualReturnDate)}
                                </p>
                              </div>
                            </div>

                            {rental.notes && (
                              <p className="text-sm text-[#77736C]">
                                Note : {rental.notes}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs ${
                                  cancelled
                                    ? 'bg-gray-100 text-gray-600'
                                    : returned
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : overdue
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {cancelled
                                  ? 'Annulée'
                                  : returned
                                    ? 'Terminée'
                                    : overdue
                                      ? 'Retour en retard'
                                      : 'Active'}
                              </span>

                              {!cancelled && !returned && (
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => markReturned(rental)}
                                    className="flex items-center gap-2 rounded-xl border border-[#E8E3DA] px-3 py-2 text-xs hover:bg-[#F8F5EF]"
                                  >
                                    <CheckCircle2 size={15} />
                                    Marquer retournée
                                  </button>
                                  <button
                                    onClick={() => cancelRental(rental)}
                                    className="flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                                  >
                                    <Ban size={15} />
                                    Annuler
                                  </button>
                                </div>
                              )}
                            </div>
                          </article>
                        )
                      })}
                  </div>
                )}
              </div>
            </>
          ) : activePage === 'Trésorerie' || activePage === 'Dépenses' ? (
            <FinanceManager
              page={activePage}
              rentals={rentals}
              clients={clients}
              dresses={dresses}
              expenses={expenses}
              onAddPayment={addPayment}
              onSaveExpense={saveExpense}
              onDeleteExpense={deleteExpense}
            />
          ) : activePage === 'Vue générale' ? (
            <>
              <div className="mb-8">
                <p className="text-sm text-[#A0927E]">
                  Bienvenue chez vous ✨
                </p>
                <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">
                  Votre activité, en un coup d’œil.
                </h3>
                <p className="mt-2 text-sm text-[#89847B]">
                  Retrouvez ici l’essentiel de White Melody.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: 'Robes au catalogue',
                    value: dresses.length,
                    icon: Shirt,
                  },
                  {
                    label: 'Disponibles',
                    value: catalogueDresses.filter(
                      (dress) => dress.status === 'Disponible',
                    ).length,
                    icon: Sparkles,
                  },
                  {
                    label: 'En location',
                    value: catalogueDresses.filter(
                      (dress) => dress.status === 'En location',
                    ).length,
                    icon: CalendarDays,
                  },
                  {
                    label: 'Réservées',
                    value: catalogueDresses.filter(
                      (dress) => dress.status === 'Réservée',
                    ).length,
                    icon: Receipt,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-[#ECE8E0] bg-white p-5"
                  >
                    <Icon size={20} className="text-[#9B7B4D]" />
                    <p className="mt-5 text-sm text-[#89847B]">{label}</p>
                    <p className="mt-2 text-3xl font-semibold">{value}</p>
                  </article>
                ))}
              </div>

              <h4 className="mb-4 mt-8 text-lg font-semibold">
                Situation financière
              </h4>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: 'Chiffre d’affaires prévu',
                    value: money(financialSummary.revenue),
                  },
                  {
                    label: 'Argent encaissé',
                    value: money(financialSummary.collected),
                  },
                  {
                    label: 'Reste à encaisser',
                    value: money(financialSummary.remaining),
                  },
                  {
                    label: 'Solde après dépenses',
                    value: money(financialSummary.cashBalance),
                  },
                ].map(({ label, value }) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-[#ECE8E0] bg-white p-5"
                  >
                    <p className="text-sm text-[#89847B]">{label}</p>
                    <p className="mt-3 break-words text-xl font-semibold">
                      {value}
                    </p>
                  </article>
                ))}
              </div>

              <p className="mt-4 text-xs leading-5 text-[#89847B]">
                Le solde affiché correspond aux encaissements enregistrés moins
                les dépenses saisies. Il ne représente pas nécessairement le
                bénéfice comptable.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setActivePage('Locations')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#302D29] px-4 py-3 text-sm font-medium text-white"
                >
                  <CalendarDays size={17} />
                  Gérer les locations
                </button>
                <button
                  onClick={() => setActivePage('Trésorerie')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#E8E3DA] bg-white px-4 py-3 text-sm font-medium"
                >
                  <Wallet size={17} />
                  Ouvrir la trésorerie
                </button>
                <button
                  onClick={() => setActivePage('Dépenses')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#E8E3DA] bg-white px-4 py-3 text-sm font-medium"
                >
                  <Receipt size={17} />
                  Gérer les dépenses
                </button>
              </div>
            </>
          ) : null}
          </>
          )}
        </div>
      </main>

      {viewingClient && (
        <ClientDetails
          client={
            clients.find((client) => client.id === viewingClient.id) ||
            viewingClient
          }
          rentals={rentals}
          dresses={dresses}
          onClose={() => setViewingClient(null)}
          onEdit={(client) => {
            setViewingClient(null)
            openEditClient(client)
          }}
        />
      )}

      {formOpen && (
        <DressForm
          dress={editingDress}
          onSave={saveDress}
          onClose={() => {
            setFormOpen(false)
            setEditingDress(null)
          }}
        />
      )}

      {clientFormOpen && (
        <ClientForm
          client={editingClient}
          onSave={saveClient}
          onClose={() => {
            setClientFormOpen(false)
            setEditingClient(null)
          }}
        />
      )}

      {rentalFormOpen && (
        <RentalForm
          clients={clients}
          dresses={catalogueDresses}
          rentals={rentals}
          onSave={saveRental}
          onClose={() => setRentalFormOpen(false)}
        />
      )}
    </div>
  )
}