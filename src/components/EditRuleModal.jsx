import React, { useState, useEffect } from 'react';

export default function EditRuleModal({ isOpen, onClose, rule, onSave }) {
  const [formData, setFormData] = useState({
    score: 0,
    status: 'active',
    remedy: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (rule) {
      setFormData({
        score: rule.score || 0,
        status: rule.status || 'active',
        remedy: rule.remedy || ''
      });
    }
  }, [rule]);

  if (!isOpen || !rule) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'score' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(rule.id, formData);
      onClose();
    } catch (error) {
      console.error("Failed to save rule:", error);
      alert("Error saving rule. Please check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative w-full max-w-lg mx-auto my-6 z-50">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">
              Edit Vastu Rule
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-500 float-right text-3xl leading-none font-semibold outline-none focus:outline-none hover:text-gray-800"
              onClick={onClose}
            >
              <span className="block w-6 h-6 text-2xl outline-none focus:outline-none">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative flex-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-gray-600">{rule.room}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-gray-600">{rule.direction}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <input
                  type="number"
                  name="score"
                  value={formData.score}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remedy</label>
                <textarea
                  name="remedy"
                  value={formData.remedy}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter remedy if applicable..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-gray-200 space-x-3">
              <button
                className="px-6 py-2 text-sm font-bold text-gray-600 uppercase bg-transparent outline-none focus:outline-none hover:text-gray-800"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`px-6 py-2 text-sm font-bold text-white uppercase rounded shadow hover:shadow-lg outline-none focus:outline-none ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
