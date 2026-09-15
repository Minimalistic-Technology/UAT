function requireApiKey(req, res, next) {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected) {
    console.error('[AUTH] INTERNAL_API_KEY is not set — refusing all requests.');
    return res.status(500).json({ success: false, msg: 'Server misconfigured: INTERNAL_API_KEY not set.' });
  }

  const provided = req.header('x-api-key');
  if (provided !== expected) {
    return res.status(401).json({ success: false, msg: 'Invalid or missing API key.' });
  }

  next();
}

module.exports = { requireApiKey };
