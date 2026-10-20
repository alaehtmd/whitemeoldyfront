export function getPaidAmount(rental) {
  const advance = Number(rental.advance || 0)

  const additionalPayments = (rental.payments || []).reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  )

  return advance + additionalPayments
}

export function getRemainingAmount(rental) {
  return Math.max(
    0,
    Number(rental.rentalPrice || 0) - getPaidAmount(rental),
  )
}

export function getFinancialSummary(rentals, expenses) {
  const validRentals = rentals.filter(
    (rental) => rental.status !== 'Annulée',
  )

  const revenue = validRentals.reduce(
    (total, rental) => total + Number(rental.rentalPrice || 0),
    0,
  )

  const collected = validRentals.reduce(
    (total, rental) => total + getPaidAmount(rental),
    0,
  )

  const remaining = validRentals.reduce(
    (total, rental) => total + getRemainingAmount(rental),
    0,
  )

  const expensesTotal = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  )

  return {
    revenue,
    collected,
    remaining,
    expenses: expensesTotal,
    cashBalance: collected - expensesTotal,
  }
}