// Small helpers shared by the web app.

// Is this a touch screen (phone or iPad)? A touch screen has no double click or right click, so screens that offer those on a
// computer show a tap menu there instead. The width alone is not enough (an iPad is wide but still touch), so a narrow window
// or a primary input of "finger" both count. Call it when needed (not once at load): it follows the current window and input.
export const touchLike = () => window.innerWidth < 640 || window.matchMedia('(pointer: coarse)').matches

// Date boxes open their calendar wherever they are tapped or focused, not only on the little calendar icon. Use it as
// onClick={openPicker} onFocus={openPicker}. Browsers that do not allow it (or old ones) keep the plain typed box.
export const openPicker = (e) => { try { e.target.showPicker() } catch { /* not allowed here: the box still works by typing */ } }
