function postMessage(req, res) {
  const { name, phone, email, interest, message } = req.body;
  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'name, phone and email are required' });
  }

  console.log('New contact message:', { name, phone, email, interest, message });
  res.status(200).json({ ok: true });
}

function postApplication(req, res) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  console.log('New job application:', { name, email });
  res.status(200).json({ ok: true });
}

module.exports = {
  postMessage,
  postApplication,
};
