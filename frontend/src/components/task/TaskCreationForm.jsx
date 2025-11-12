import { useState } from 'react';
import { PlusCircle, Calendar, DollarSign, FileText } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';
import { createTask } from '../../lib/thirdweb';

/**
 * Task Creation Form
 * Form for creating new tasks with escrow
 *
 * @param {function} onSuccess - Success callback with task ID
 * @param {function} onCancel - Cancel callback
 */
export default function TaskCreationForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert deadline to timestamp
      const deadlineTimestamp = new Date(formData.deadline).getTime();

      // Create task via smart contract
      const taskId = await createTask({
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        deadline: deadlineTimestamp
      });

      // Success callback
      if (onSuccess) {
        onSuccess(taskId);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        budget: '',
        deadline: ''
      });
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title && formData.description && formData.budget && formData.deadline;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-6">
        <PlusCircle className="w-6 h-6 text-brand-black dark:text-white" />
        <h2 className="text-2xl font-bold text-brand-black dark:text-white">
          Create New Task
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Write blog post about AI agents"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the task requirements..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
            required
          />
        </div>

        {/* Budget and Deadline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget (ETH) *
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="0.05"
              step="0.001"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
              required
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Deadline *
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!isFormValid || loading}
            className="flex-1"
          >
            {loading ? 'Creating Task...' : 'Create Task'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
