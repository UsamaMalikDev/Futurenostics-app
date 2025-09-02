import { useState } from 'react';
import { Check, X } from 'lucide-react';

const BulkActions = ({ selectedCount, onBulkUpdate, onClearSelection }) => {
  const [showActions, setShowActions] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState({
    status: '',
    priority: '',
    tags: '',
  });

  const handleBulkUpdate = () => {
    const updates = {};
    Object.entries(bulkUpdates).forEach(([key, value]) => {
      if (value && value !== '') {
        if (key === 'tags') {
          updates[key] = value.split(',').map(tag => tag.trim()).filter(Boolean);
        } else {
          updates[key] = value;
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      onBulkUpdate(updates);
      setBulkUpdates({ status: '', priority: '', tags: '' });
      setShowActions(false);
    }
  };

  const handleClearUpdates = () => {
    setBulkUpdates({ status: '', priority: '', tags: '' });
  };

  return (
    <div className="mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showActions ? 'Hide' : 'Show'} bulk actions
            </button>
          </div>
          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear selection
          </button>
        </div>

        {showActions && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">
                  Status
                </label>
                <select
                  value={bulkUpdates.status}
                  onChange={(e) => setBulkUpdates(prev => ({ ...prev, status: e.target.value }))}
                  className="input text-sm"
                >
                  <option value="">No change</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">
                  Priority
                </label>
                <select
                  value={bulkUpdates.priority}
                  onChange={(e) => setBulkUpdates(prev => ({ ...prev, priority: e.target.value }))}
                  className="input text-sm"
                >
                  <option value="">No change</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={bulkUpdates.tags}
                  onChange={(e) => setBulkUpdates(prev => ({ ...prev, tags: e.target.value }))}
                  className="input text-sm"
                  placeholder="Add tags (comma separated)"
                />
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={handleBulkUpdate}
                  className="btn btn-primary text-sm px-3 py-2 flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Apply
                </button>
                <button
                  onClick={handleClearUpdates}
                  className="btn btn-secondary text-sm px-3 py-2 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActions; 