import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { FiX, FiCalendar, FiClock, FiUsers, FiBell } from 'react-icons/fi';

interface CreateEventModalProps {
    onClose: () => void;
    onEventCreated: () => void;
    initialStartDate?: Date;
    initialEndDate?: Date;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
    onClose,
    onEventCreated,
    initialStartDate,
    initialEndDate
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('10:00');
    const [eventType, setEventType] = useState<'meeting' | 'deadline' | 'milestone' | 'other'>('meeting');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderMinutes, setReminderMinutes] = useState(15);
    const [projects, setProjects] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProjectsAndTeam();

        // Set default dates
        if (initialStartDate) {
            setStartDate(initialStartDate.toISOString().split('T')[0]);
        } else {
            setStartDate(new Date().toISOString().split('T')[0]);
        }

        if (initialEndDate) {
            setEndDate(initialEndDate.toISOString().split('T')[0]);
        } else {
            setEndDate(new Date().toISOString().split('T')[0]);
        }
    }, [initialStartDate, initialEndDate]);

    const fetchProjectsAndTeam = async () => {
        try {
            const token = localStorage.getItem('token');

            const [projectsRes, usersRes] = await Promise.all([
                axios.get('/api/projects', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            setProjects(projectsRes.data);
            setTeamMembers(usersRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !startDate || !endDate) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(`${endDate}T${endTime}`);

            await axios.post(
                '/api/team-events',
                {
                    title,
                    description,
                    startDate: startDateTime.toISOString(),
                    endDate: endDateTime.toISOString(),
                    eventType,
                    project: selectedProject || undefined,
                    attendees: selectedAttendees,
                    reminder: {
                        enabled: reminderEnabled,
                        minutesBefore: reminderMinutes,
                    },
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onEventCreated();
            onClose();
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendee = (userId: string) => {
        setSelectedAttendees(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Event</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            placeholder="Team Meeting, Project Deadline, etc."
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            placeholder="Add details about this event..."
                        />
                    </div>

                    {/* Event Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Event Type
                        </label>
                        <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="meeting">Meeting</option>
                            <option value="deadline">Deadline</option>
                            <option value="milestone">Milestone</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <FiCalendar className="inline w-4 h-4 mr-1" />
                                Start Date *
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <FiClock className="inline w-4 h-4 mr-1" />
                                Start Time
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <FiCalendar className="inline w-4 h-4 mr-1" />
                                End Date *
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <FiClock className="inline w-4 h-4 mr-1" />
                                End Time
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Project */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Link to Project (Optional)
                        </label>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">No project</option>
                            {projects.map((project) => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Attendees */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FiUsers className="inline w-4 h-4 mr-1" />
                            Attendees
                        </label>
                        <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-1">
                            {teamMembers.map((member) => (
                                <label
                                    key={member._id}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedAttendees.includes(member._id)}
                                        onChange={() => toggleAttendee(member._id)}
                                        className="rounded text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{member.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Reminder */}
                    <div>
                        <label className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                checked={reminderEnabled}
                                onChange={(e) => setReminderEnabled(e.target.checked)}
                                className="rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FiBell className="inline w-4 h-4 mr-1" />
                                Set Reminder
                            </span>
                        </label>
                        {reminderEnabled && (
                            <select
                                value={reminderMinutes}
                                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            >
                                <option value={15}>15 minutes before</option>
                                <option value={30}>30 minutes before</option>
                                <option value={60}>1 hour before</option>
                                <option value={1440}>1 day before</option>
                            </select>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;
