
export function getLocalDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function addDays(date, amount) {
  const result = new Date(`${date}T12:00:00`)
  result.setDate(result.getDate() + amount)

  const year = result.getFullYear()
  const month = String(result.getMonth() + 1).padStart(2, '0')
  const day = String(result.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function rentalEnd(rental) {
  return rental.actualReturnDate || rental.dueDate
}

export function hasRentalConflict(
  dressId,
  startDate,
  dueDate,
  rentals,
  excludeRentalId = null,
) {
  return rentals.some((rental) => {
    if (
      rental.dressId !== dressId ||
      rental.id === excludeRentalId ||
      rental.status === 'Annulée'
    ) {
      return false
    }

    const existingEnd = rentalEnd(rental)

    return startDate <= existingEnd && dueDate >= rental.startDate
  })
}

export function getDressStatus(dressId, rentals, today = getLocalDate()) {
  const bookings = rentals
    .filter(
      (rental) =>
        rental.dressId === dressId &&
        rental.status !== 'Annulée' &&
        !rental.actualReturnDate,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  const current = bookings.find(
    (rental) => rental.startDate <= today && rental.dueDate >= today,
  )

  if (current) return 'En location'

  const upcoming = bookings.find((rental) => rental.startDate > today)

  if (upcoming) return 'Réservée'

  const overdue = bookings.find(
    (rental) => rental.startDate <= today && rental.dueDate < today,
  )

  if (overdue) return 'En location'

  return 'Disponible'
}


export function getNextAvailability(dressId, rentals, today = getLocalDate()) {
  const bookings = rentals
    .filter(
      (rental) =>
        rental.dressId === dressId &&
        rental.status !== 'Annulée' &&
        !rental.actualReturnDate &&
        rental.dueDate >= today,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  let candidate = today

  for (const booking of bookings) {
    if (booking.startDate <= candidate) {
      candidate = addDays(
        booking.dueDate > candidate ? booking.dueDate : candidate,
        1,
      )
    } else {
      break
    }
  }

  return candidate
}

