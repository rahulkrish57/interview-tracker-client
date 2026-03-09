import { useState, useEffect } from 'react';
import { interviewService } from '../services/interviewService';
import '../styles/form.css';

const EMPTY = {
  company:      '',
  hr_name:      '',
  contact:      '',
  location:     '',
  mode_of_work: 'onsite',
  expected_ctc: '',
  status:       'phone',
  notes:        '',
  applied_date: new Date().toISOString().split('T')[0],
};

function InterviewForm({ interview, onClose, onSaved }) {
  const isEdit = Boolean(interview);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // ── Pre-fill form when editing ──
  useEffect(() => {
    if (interview) {
      setForm({
        company:      interview.company      || '',
        hr_name:      interview.hr_name      || '',
        contact:      interview.contact      || '',
        location:     interview.location     || '',
        mode_of_work: interview.mode_of_work || 'onsite',
        expected_ctc: interview.expected_ctc || '',
        status:       interview.status       || 'phone',
        notes:        interview.notes        || '',
        applied_date: interview.applied_date
          ? interview.applied_date.split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    }
  }, [interview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ── Validate required fields ──
  const validate = () => {
    const errs = {};
    if (!form.company.trim())    errs.company      = 'Company is required';
    if (!form.location.trim())   errs.location     = 'Location is required';
    if (!form.applied_date)      errs.applied_date = 'Date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      let saved;
      if (isEdit) {
        saved = await interviewService.update(interview.id, form);
      } else {
        saved = await interviewService.create(form);
      }
      onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div
        className="form-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="form-modal-header">
          <h3>{isEdit ? '✏️ Edit Interview' : '➕ Add Interview'}</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="form-body">

            {apiError && (
              <div style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
              }}>
                {apiError}
              </div>
            )}

            {/* Row 1 */}
            <div className="form-row">
              <div className="form-group">
                <label>Company *</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Google"
                  className={errors.company ? 'error' : ''}
                />
                {errors.company && (
                  <span className="field-error">{errors.company}</span>
                )}
              </div>

              <div className="form-group">
                <label>HR Name</label>
                <input
                  name="hr_name"
                  value={form.hr_name}
                  onChange={handleChange}
                  placeholder="e.g. Priya"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="form-row">
              <div className="form-group">
                <label>Location *</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  className={errors.location ? 'error' : ''}
                />
                {errors.location && (
                  <span className="field-error">{errors.location}</span>
                )}
              </div>

              <div className="form-group">
                <label>Contact</label>
                <input
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="form-row">
              <div className="form-group">
                <label>Mode of Work</label>
                <select
                  name="mode_of_work"
                  value={form.mode_of_work}
                  onChange={handleChange}
                >
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expected CTC</label>
                <input
                  name="expected_ctc"
                  value={form.expected_ctc}
                  onChange={handleChange}
                  placeholder="e.g. 16 LPA"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="phone">Phone</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="ghosted">Ghosted</option>
                  <option value="uninteresting">Uninteresting</option>
                </select>
              </div>

              <div className="form-group">
                <label>Applied Date *</label>
                <input
                  type="date"
                  name="applied_date"
                  value={form.applied_date}
                  onChange={handleChange}
                  className={errors.applied_date ? 'error' : ''}
                />
                {errors.applied_date && (
                  <span className="field-error">{errors.applied_date}</span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any notes about this interview..."
              />
            </div>

          </div>

          {/* Footer */}
          <div className="form-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : isEdit ? 'Save Changes' : 'Add Interview'
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default InterviewForm;