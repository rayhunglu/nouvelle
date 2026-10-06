// Treatment rooms. Edit names here; ids are stored on each appointment.
export const ROOMS = [
  { id: 'room1', name: '房间 1', chip: 'bg-sky-100 text-sky-900 hover:bg-sky-200', dot: 'bg-sky-500' },
  { id: 'room2', name: '房间 2', chip: 'bg-violet-100 text-violet-900 hover:bg-violet-200', dot: 'bg-violet-500' },
  { id: 'room3', name: '房间 3', chip: 'bg-amber-100 text-amber-900 hover:bg-amber-200', dot: 'bg-amber-500' },
  { id: 'room4', name: '房间 4', chip: 'bg-teal-100 text-teal-900 hover:bg-teal-200', dot: 'bg-teal-500' },
]
export const NO_ROOM = { id: '', name: '未指定房间', chip: 'bg-stone-200 text-stone-700 hover:bg-stone-300', dot: 'bg-stone-400' }

export const roomOf = (id) => ROOMS.find((r) => r.id === id) || NO_ROOM
