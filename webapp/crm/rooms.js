// Treatment rooms. Edit names here; ids are stored on each appointment. `beds: 2` marks a double room:
// the calendar splits it into two halves and two bookings may overlap there (src/routes/crm.js has the same list).
export const ROOMS = [
  { id: 'room1', name: '美容单人房', chip: 'bg-[#ead9c6] text-[#4e3220] hover:bg-[#e0c9b0]', dot: 'bg-[#8b5a2b]' },
  { id: 'room2', beds: 2, name: '医美双人房', chip: 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200', dot: 'bg-yellow-500' },
  { id: 'room3', name: '美睫单人房', chip: 'bg-green-700 text-white hover:bg-green-800', dot: 'bg-green-800' },
  { id: 'room4', beds: 2, name: '头疗双人房', chip: 'bg-blue-100 text-blue-900 hover:bg-blue-200', dot: 'bg-blue-500' },
]
export const NO_ROOM = { id: '', name: '未指定房间', chip: 'bg-stone-200 text-stone-700 hover:bg-stone-300', dot: 'bg-stone-400' }

export const roomOf = (id) => ROOMS.find((r) => r.id === id) || NO_ROOM
