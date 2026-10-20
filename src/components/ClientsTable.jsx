
import { Search, Plus, Pencil, Trash2, Users, Eye } from 'lucide-react'

export default function ClientsTable({
  clients,
  search,
  setSearch,
  onAdd,
  onEdit,
  onDelete,
  onView,
}) {
  const filteredClients = clients.filter((client) =>
    `${client.fullName || ''} ${client.phone || ''}`
      .toLowerCase()
      .includes(search.toLowerCase().trim()),
  )

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#E8E3DA] bg-white px-3">
          <Search size={18} className="shrink-0 text-[#9B8F7E]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou téléphone..."
            className="w-full bg-transparent py-3 text-sm outline-none"
          />
        </div>

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#302D29] px-4 py-3 text-sm font-medium text-white hover:bg-[#51483C]"
        >
          <Plus size={17} />
          Ajouter une cliente
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E8E3DA] bg-white">
        <div className="flex items-center justify-between border-b border-[#EEEAE3] px-4 py-3">
          <span className="text-sm font-semibold">Fichier clientes</span>
          <span className="text-xs text-[#8D8579]">
            {filteredClients.length} cliente(s)
          </span>
        </div>

        {/* Tableau ordinateur */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9F6] text-xs text-[#8D8579]">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Téléphone</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F0EDE7]">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#FCFBF9]">
                  <td className="px-4 py-4 font-medium">
                    {client.fullName}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    {client.phone || '—'}
                  </td>

                  <td className="max-w-xs truncate px-4 py-4 text-[#8D8579]">
                    {client.notes || '—'}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onView(client)}
                        aria-label={`Voir la fiche de ${client.fullName}`}
                        title="Voir la fiche cliente"
                        className="rounded-lg p-2 text-[#9B7B4D] hover:bg-[#F4EEE3]"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => onEdit(client)}
                        aria-label={`Modifier ${client.fullName}`}
                        title="Modifier"
                        className="rounded-lg p-2 text-[#85765F] hover:bg-[#F4EEE3]"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(client)}
                        aria-label={`Supprimer ${client.fullName}`}
                        title="Supprimer"
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cartes téléphone */}
        <div className="divide-y divide-[#F0EDE7] md:hidden">
          {filteredClients.map((client) => (
            <article
              key={client.id}
              className="flex items-start gap-3 p-4"
            >
              <div className="rounded-xl bg-[#F7F2E9] p-3 text-[#9B7B4D]">
                <Users size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium">{client.fullName}</p>

                <p className="mt-1 text-sm text-[#77736C]">
                  {client.phone || 'Téléphone non renseigné'}
                </p>

                {client.notes && (
                  <p className="mt-2 break-words text-xs text-[#8D8579]">
                    {client.notes}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => onView(client)}
                    className="rounded-lg border border-[#DCCBB0] bg-[#FAF6EF] px-3 py-2 text-xs font-medium text-[#806440]"
                  >
                    <span className="flex items-center gap-1.5">
                      <Eye size={14} />
                      Voir la fiche
                    </span>
                  </button>

                  <button
                    onClick={() => onEdit(client)}
                    className="rounded-lg border border-[#E8E3DA] px-3 py-2 text-xs"
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => onDelete(client)}
                    className="rounded-lg border border-red-100 px-3 py-2 text-xs text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="px-4 py-10 text-center">
            <Users size={25} className="mx-auto text-[#B3A58F]" />

            <p className="mt-3 text-sm font-medium">
              {search
                ? 'Aucune cliente trouvée'
                : 'Aucune cliente enregistrée'}
            </p>

            <p className="mt-1 text-xs text-[#8D8579]">
              {search
                ? 'Essaie un autre nom ou numéro.'
                : 'Ajoute ta première fiche pour commencer.'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
