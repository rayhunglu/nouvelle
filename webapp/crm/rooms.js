// Treatment rooms. Edit names here; ids are stored on each appointment. `beds: 2` marks a double room:
// the calendar splits it into two halves and two bookings may overlap there (src/routes/crm.js has the same list).
export const ROOMS = [
  { id: 'room1', name: '美容单人房', chip: 'bg-sky-100 text-sky-900 hover:bg-sky-200', dot: 'bg-sky-500' },
  { id: 'room2', beds: 2, name: '医美双人房', chip: 'bg-violet-100 text-violet-900 hover:bg-violet-200', dot: 'bg-violet-500' },
  { id: 'room3', name: '美睫单人房', chip: 'bg-amber-100 text-amber-900 hover:bg-amber-200', dot: 'bg-amber-500' },
  { id: 'room4', beds: 2, name: '头疗双人房', chip: 'bg-teal-100 text-teal-900 hover:bg-teal-200', dot: 'bg-teal-500' },
]
export const NO_ROOM = { id: '', name: '未指定房间', chip: 'bg-stone-200 text-stone-700 hover:bg-stone-300', dot: 'bg-stone-400' }

export const roomOf = (id) => ROOMS.find((r) => r.id === id) || NO_ROOM
