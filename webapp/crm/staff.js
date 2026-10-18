// Staff who take appointments (the roster the manager keeps; this is only the starting list). They head the staff filter and the staff suggestions; names already used on
// existing appointments are added after them, so older bookings stay filterable.
export const DEFAULT_STAFF = ['Rina', 'Yingna', 'Dayu']

export const withStaff = (names, roster = DEFAULT_STAFF) => [...roster, ...[...new Set(names.filter(Boolean))].filter((n) => !roster.includes(n)).sort((a, b) => a.localeCompare(b, 'zh'))]

// Which room each person looks after unless the manager says otherwise: while they work, that room is open.
export const DEFAULT_ROOM_STAFF = { Rina: ['room1'], Yingna: ['room2'], Dayu: ['room3'] }

// A booking is related to a staff member when they serve it or when it is their referral (the booking's 客户来源 is that person).
// With no name picked, every booking is related.
export const relatedTo = (a, name) => !name || a.staff === name || a.source === name
