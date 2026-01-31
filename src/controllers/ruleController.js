const Rule = require('../models/Rule');

const DEFAULT_RULES = `Office Rules & Professional Conduct Policy
1. Work Discipline & Accountability

• End-of-Day (EOD) reports are mandatory for all employees without exception.
• Consistent underperformance, lack of ownership, or unprofessional behavior will not be tolerated.
• Employees are expected to be self-motivated, responsible, and result-oriented.
• Daily stand-up meetings are compulsory to track progress and blockers.
• Any delay, excuse, or non-participation without valid reason may lead to disciplinary action.

2. Working Hours & Time Management

• Official working hours: 11:00 AM – 8:00 PM
• Employees must be available and productive during office hours.
• Late arrivals, early departures, or extended breaks require prior approval.
• Lunch break: 2:00 PM – 3:00 PM (strictly one hour only).

3. Leave & Communication Policy

• All leaves must be informed and approved in advance.
• Uninformed or sudden absence will be marked as unprofessional conduct.
• Emergency leaves must be communicated as early as possible.

4. Professional Appearance

• Employees must maintain a clean, neat, and professional dress code at all times.
• Casual or inappropriate attire is not acceptable during working hours.

5. Team Activities & Engagement

• Recreational activities are a privilege, not a right.
• Planned team activities include:
  • Hiking sessions (once every two weeks)
  • Video games
  • Indoor games (cards, etc.)
• Participation depends on performance, discipline, and conduct.

6. Final Notice

Failure to comply with the above policies may result in:
• Verbal or written warnings
• Performance review
• Suspension or termination (in severe or repeated cases)
`;

const getRules = async (req, res) => {
  try {
    let doc = await Rule.findOne({ key: 'office_rules' }).populate('updatedBy', 'username');
    if (!doc) {
      doc = await Rule.create({ key: 'office_rules', content: DEFAULT_RULES, updatedBy: null });
      doc = await Rule.findById(doc._id).populate('updatedBy', 'username');
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRules = async (req, res) => {
  try {
    const { content } = req.body;
    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'content is required' });
    }
    const doc = await Rule.findOneAndUpdate(
      { key: 'office_rules' },
      { content, updatedBy: req.user._id },
      { new: true, upsert: true }
    ).populate('updatedBy', 'username');
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRules, updateRules };

