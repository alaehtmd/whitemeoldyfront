
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'

export default function DressesTable({
  dresses,
  search,
  setSearch,
  onAdd,
  onEdit,
  onDelete,
}) {
  const filteredDresses = dresses.filter((dress) =>
    `${dress.reference} ${dress.name} ${dress.type} ${dress.size}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR').format(price) + ' DA'

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#E8E3DA] bg-white px-3">
          <Search size={18} className="shrink-0 text-[#9B8F7E]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par nom, référence, taille..."
            className="w-full bg-transparent py-3 text-sm outline-none"
          />
        </div>

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#302D29] px-4 py-3 text-sm font-medium text-white hover:bg-[#51483C]"
        >
          <Plus size={17} />
          Ajouter une robe
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E8E3DA] bg-white">
        <div className="flex items-center justify-between border-b border-[#EEEAE3] px-4 py-3">
          <span className="text-sm font-semibold">Catalogue des robes</span>
          <span className="text-xs text-[#8D8579]">
            {filteredDresses.length} résultat(s)
          </span>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9F6] text-xs text-[#8D8579]">
              <tr>
                <th className="px-4 py-3 font-medium">Référence / Robe</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Taille</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F0EDE7]">
              {filteredDresses.map((dress) => (
                <tr key={dress.id} className="hover:bg-[#FCFBF9]">
                  <td className="px-4 py-4">
                    <p className="font-medium">{dress.name}</p>
                    <p className="mt-1 text-xs text-[#9B9387]">
                      {dress.reference}
                    </p>
                  </td>
                  <td className="px-4 py-4">{dress.type}</td>
                  <td className="px-4 py-4">{dress.size}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium">
                    {formatPrice(dress.rentalPrice)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        dress.status === 'Disponible'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {dress.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        title="Modifier"
                        onClick={() => onEdit(dress)}
                        className="rounded-lg p-2 text-[#85765F] hover:bg-[#F4EEE3]"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        title="Supprimer"
                        onClick={() => onDelete(dress)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDresses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#8D8579]">
                    Aucune robe trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-[#F0EDE7] md:hidden">
          {filteredDresses.map((dress) => (
            <article key={dress.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{dress.name}</p>
                  <p className="mt-1 text-xs text-[#9B9387]">
                    {dress.reference} · Taille {dress.size}
                  </p>
                </div>
                <span className="whitespace-nowrap text-sm font-semibold">
                  {formatPrice(dress.rentalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#8D8579]">{dress.type}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(dress)}
                    className="rounded-lg border border-[#E8E3DA] p-2"
                    aria-label="Modifier"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(dress)}
                    className="rounded-lg border border-[#E8E3DA] p-2 text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <span className={`inline-block rounded-full px-2.5 py-1 text-xs ${
                dress.status === 'Disponible'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {dress.status}
              </span>
            </article>
          ))}
          {filteredDresses.length === 0 && (
            <p className="p-8 text-center text-sm text-[#8D8579]">
              Aucune robe trouvée.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
