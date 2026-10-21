// Loads the PDF library (pdf.js) so it also runs on an older Safari / iPad. Two things are needed:
//  - the "legacy" build of the library, and the few newer JavaScript features it still expects, added here when the browser lacks them;
//  - the library's background worker run inside the page itself (a "fake worker"): an older browser has no module workers, and a real
//    worker would be a separate script without these additions.
// Loaded only when a PDF has to be drawn by the library (a saved signed copy, or a form without prepared page pictures), so the rest of
// the CRM is not slowed down.
function addMissingFeatures() {
  // Older Safari versions cannot loop over a ReadableStream with "for await" (newer ones can). Keep this for pdf.js's internal paths;
  // readPageTextItems below does not need it.
  if (
    typeof ReadableStream !== 'undefined' &&
    !ReadableStream.prototype[Symbol.asyncIterator]
  ) {
    const values = async function* values(options = {}) {
      const reader = this.getReader()
      let complete = false

      try {
        for (;;) {
          const { done, value } = await reader.read()

          if (done) {
            complete = true
            return
          }

          yield value
        }
      } finally {
        try {
          if (!complete && !options.preventCancel) {
            await reader.cancel()
          }
        } finally {
          reader.releaseLock()
        }
      }
    }

    ReadableStream.prototype[Symbol.asyncIterator] = values

    if (!ReadableStream.prototype.values) {
      ReadableStream.prototype.values = values
    }
  }

  if (!Promise.withResolvers) {
    Promise.withResolvers = function withResolvers() {
      let resolve
      let reject

      const promise = new Promise((a, b) => {
        resolve = a
        reject = b
      })

      return { promise, resolve, reject }
    }
  }
}

// Read text with getReader/read, without going through PDFPageProxy.getTextContent's async-iterator path. Handles cancellation and
// always releases the stream lock.
export async function readPageTextItems(page, signal) {
  const reader = page.streamTextContent().getReader()
  const items = []

  const abortError = () => new DOMException('PDF 读取已取消', 'AbortError')

  const cancel = () => {
    reader.cancel().catch(() => {})
  }

  signal?.addEventListener('abort', cancel, { once: true })

  try {
    if (signal?.aborted) {
      cancel()
      throw abortError()
    }

    for (;;) {
      const { done, value } = await reader.read()

      if (signal?.aborted) {
        throw abortError()
      }

      if (done) {
        return items
      }

      for (const item of value.items || []) {
        if (typeof item.str === 'string' && item.str.trim()) {
          items.push(item)
        }
      }
    }
  } finally {
    signal?.removeEventListener('abort', cancel)
    reader.releaseLock()
  }
}

// The load is attempted once per page: if it fails, the same error comes back on later tries (until the page is reloaded). Trying again
// after a failed start gives a half-started library whose errors ("undefined is not an object ...") hide the real cause.
let loading = null

export function loadPdfjs() {
  if (!loading) {
    loading = (async () => {
      addMissingFeatures()

      const mod = await import('pdfjs-dist/legacy/build/pdf.mjs')

      const pdfjs =
        typeof mod.getDocument === 'function'
          ? mod
          : mod.default && typeof mod.default.getDocument === 'function'
            ? mod.default
            : globalThis.pdfjsLib

      if (!pdfjs || typeof pdfjs.getDocument !== 'function') {
        throw new Error(`PDF 组件没有加载完整（${Object.keys(mod).slice(0, 6).join(',') || '空'}）`)
      }

      // Makes pdf.js use the in-page worker.
      globalThis.pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.mjs')

      return pdfjs
    })()
  }

  return loading
}
