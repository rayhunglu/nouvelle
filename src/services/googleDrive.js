// Customer documents live in one Google Drive folder that this app creates itself (named GOOGLE_DRIVE_FOLDER_NAME, default
// "Nouvelle"; made on the first upload if it is not there). The browser never talks to Google: the server uploads / streams /
// deletes with an OAuth refresh token (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN; make the token with
// scripts/google-drive-auth.cjs). The token only has the drive.file scope: it can touch files and folders this app created,
// nothing else in the Drive. A service account cannot do this: it has no Drive storage quota of its own.
const { Readable } = require('stream');
const { google } = require('googleapis');

const enabled = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);

let drive = null;
function client() {
  if (!enabled()) throw new Error('Google Drive 还没有配置（GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN）');
  if (!drive) {
    const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    drive = google.drive({ version: 'v3', auth });
  }
  return drive;
}

// The app's folder: found by name (with drive.file only folders this app made are visible), made when missing. Remembered per
// process; a pending lookup is shared so two uploads at once do not make two folders.
let folder = null;
function folderId() {
  if (!folder) {
    const name = process.env.GOOGLE_DRIVE_FOLDER_NAME || 'Nouvelle';
    folder = (async () => {
      const d = client();
      const found = await d.files.list({ q: `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`, fields: 'files(id)', pageSize: 1 });
      if (found.data.files.length) return found.data.files[0].id;
      return (await d.files.create({ requestBody: { name, mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' })).data.id;
    })().catch((err) => { folder = null; throw err; });
  }
  return folder;
}

// Uploads a Buffer into the folder; returns the Drive file id.
async function upload({ name, mimeType, buffer }) {
  const res = await client().files.create({
    requestBody: { name, parents: [await folderId()] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: 'id',
  });
  return res.data.id;
}

// A readable stream of the file's bytes.
async function download(fileId) {
  const res = await client().files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  return res.data;
}

// Deletes the file; a file that is already gone counts as deleted.
async function remove(fileId) {
  try {
    await client().files.delete({ fileId });
  } catch (err) {
    if (err.code !== 404) throw err;
  }
}

module.exports = { enabled, upload, download, remove };
