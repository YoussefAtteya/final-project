const db = require('../db');

function toSeconds(timeStr) {
  const [h, m, s] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60 + (s || 0);
}

function getNYTimeHHMMSS() {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: 'America/New_York',
    hour12: false
  }).slice(0, 8);
}

const requireRestaurantOpen = (req, res, next) => {
  db.query('SELECT * FROM restaurant_settings LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const s = results[0];
    if (!s) return res.status(500).json({ error: 'Restaurant settings not found' });

    if (!s.is_open) {
      return res.status(403).json({ error: 'Restaurant is currently closed' });
    }

    // Holiday mode
    if (s.is_holiday) {
      return res.status(403).json({ error: 'Restaurant is on holiday' });
    }

    const nowNY = getNYTimeHHMMSS();
    const nowSec = toSeconds(nowNY);
    const openSec = toSeconds(s.opening_time);
    const closeSec = toSeconds(s.closing_time);

    const isOvernight = openSec > closeSec;

    const isOpenNow = !isOvernight
      ? (nowSec >= openSec && nowSec < closeSec)
      : (nowSec >= openSec || nowSec < closeSec);

    if (!isOpenNow) {
      return res.status(403).json({
        error: 'Restaurant is closed right now',
        currentTimeNY: nowNY,
        opening_time: s.opening_time,
        closing_time: s.closing_time
      });
    }

    next();
  });
};

module.exports = { requireRestaurantOpen };