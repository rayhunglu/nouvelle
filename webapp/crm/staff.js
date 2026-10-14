// Staff who take appointments. They head the staff filter and the staff suggestions; names already used on
// existing appointments are added after them, so older bookings stay filterable.
export const STAFF = ['Rina', 'Yingna', 'Dayu']

export const withStaff = (names) => [...STAFF, ...[...new Set(names.filter(Boolean))].filter((n) => !STAFF.includes(n)).sort((a, b) => a.localeCompare(b, 'zh'))]
