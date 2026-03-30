// const db = require('../db');

// const getSettings = (req, res) => {
//   db.query('SELECT * FROM restaurant_settings LIMIT 1', (err, results) => {
//     if (err) return res.status(500).json({ error: err.message });

//     const settings = results[0];

//     if (!settings)
//       return res.status(404).json({ error: 'Settings not found' });

//     // ✅ Get current NY time
//     const now = new Date();
//     const nyTime = now.toLocaleTimeString('en-GB', {
//       timeZone: 'America/New_York',
//       hour12: false
//     }).slice(0, 8); // HH:MM:SS

//     let liveStatus = 'Closed';

//     if (settings.is_holiday) {
//       liveStatus = 'On Holiday';
//     } else if (
//       settings.is_open &&
//       nyTime >= settings.opening_time &&
//       nyTime <= settings.closing_time
//     ) {
//       liveStatus = 'Open Now';
//     }

//     res.json({
//       ...settings,
//       liveStatus,
//       currentTimeNY: nyTime
//     });
//   });
// };

// module.exports = { getSettings };


const db = require('../db');

function toSeconds(timeStr) {
  // timeStr: "HH:MM:SS"
  const [h, m, s] = timeStr.split(':').map(Number);
  return (h * 3600) + (m * 60) + (s || 0);
}

function getNYTimeHHMMSS() {
  // "HH:MM:SS" بنظام 24 ساعة في توقيت نيويورك
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: 'America/New_York',
    hour12: false
  }).slice(0, 8);
}

const getSettings = (req, res) => {
  db.query('SELECT * FROM restaurant_settings LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const settings = results[0];
    if (!settings) return res.status(404).json({ error: 'Settings not found' });

    const nowNY = getNYTimeHHMMSS(); // "HH:MM:SS"

    let liveStatus = 'Closed';

    if (settings.is_holiday) {
      liveStatus = 'On Holiday';
    } else if (settings.is_open) {
      const nowSec = toSeconds(nowNY);
      const openSec = toSeconds(settings.opening_time);
      const closeSec = toSeconds(settings.closing_time);

      const isOvernight = openSec > closeSec;

      const isCurrentlyOpen = !isOvernight
        ? (nowSec >= openSec && nowSec <= closeSec)
        : (nowSec >= openSec || nowSec <= closeSec);

      liveStatus = isCurrentlyOpen ? 'Open Now' : 'Closed';
    }

    res.json({
      ...settings,
      liveStatus,
      currentTimeNY: nowNY
    });
  });
};

module.exports = { getSettings };