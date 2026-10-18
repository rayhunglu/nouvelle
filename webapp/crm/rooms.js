// Treatment rooms. Edit names here; ids are stored on each appointment. `beds: 2` marks a double room:
// the calendar splits it into two halves and two bookings may overlap there (src/routes/crm.js has the same list).
export const ROOMS = [
  { id: 'room1', name: '美容单人房', chip: 'bg-[#ead9c6] text-[#4e3220] hover:bg-[#e0c9b0]', dot: 'bg-[#c9a87c]' }, // light brown
  { id: 'room2', beds: 2, name: '医美双人房', chip: 'bg-[#e6dcf7] text-[#4b3a6b] hover:bg-[#dccdf2]', dot: 'bg-[#b9a2e6]' }, // light purple
  { id: 'room3', name: '美睫单人房', chip: 'bg-[#cfeccf] text-[#1f4d2b] hover:bg-[#c0e4c1]', dot: 'bg-[#7fcf8c]' }, // light green
  { id: 'room4', beds: 2, name: '头疗双人房', chip: 'bg-[#d6e8fa] text-[#1d3f66] hover:bg-[#c6def6]', dot: 'bg-[#8fbdee]' }, // light blue
]
export const NO_ROOM = { id: '', name: '未指定房间', chip: 'bg-stone-200 text-stone-700 hover:bg-stone-300', dot: 'bg-stone-400' }

// A booking is coloured by its staff member when that person has a colour (Rina brown, Yingna purple, the same as on the
// Google Calendar), otherwise by its room.
export const STAFF_COLOR = {
  Rina: { chip: 'bg-[#ead9c6] text-[#4e3220] hover:bg-[#e0c9b0]', dot: 'bg-[#c9a87c]' }, // the same light brown as 美容单人房
  Yingna: { chip: 'bg-[#e6dcf7] text-[#4b3a6b] hover:bg-[#dccdf2]', dot: 'bg-[#b9a2e6]' }, // the same light purple as 医美双人房
}
export const colorOf = (a) => STAFF_COLOR[a.staff] || roomOf(a.room)

export const roomOf = (id) => ROOMS.find((r) => r.id === id) || NO_ROOM
