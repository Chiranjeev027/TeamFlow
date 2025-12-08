import React, { useState } from 'react';
import axios from '../config/axios';
import { FiX, FiTrash2, FiCalendar, FiClock, FiUsers, FiLink, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'task' | 'milestone' | 'team-event';
    description?: string;
    project?: {
        _id: string;
        name: string;
    };
    createdBy?: {
        name: string;
        email: string;
    };
    attendees?: Array<{
        name: string;
        email: string;
    }>;
    reminder?: {
        enabled: boolean;
        minutesBefore: number;
    };
}

interface EventDetailsModalProps {
    event: CalendarEvent;
    onClose: () => void;
    onEventDeleted: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
    event,
    onClose,
    onEventDeleted,
}) => {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            setIsDeleting(true);
            const token = localStorage.getItem('token');

            if (event.type === 'team-event') {
                await axios.delete(`/api/team-events/${event.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // For tasks, we don't delete them, just remove the deadline
                await axios.patch(
                    `/api/tasks/${event.id}`,
                    { dueDate: null },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            onEventDeleted();
            onClose();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleGoToProject = () => {
        if (event.project) {
            navigate(`/project/${event.project._id}`);
            onClose();
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    const getEventTypeColor = () => {
        switch (event.type) {
            case 'task':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'milestone':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'team-event':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getEventTypeLabel = () => {
        switch (event.type) {
            case 'task':
                return 'Task';
            case 'milestone':
                return 'Milestone';
            case 'team-event':
                return 'Team Event';
            default:
                return 'Event';
        }
    };

    const getReminderText = () => {
        if (!event.reminder?.enabled) return null;

        const minutes = event.reminder.minutesBefore;
        if (minutes < 60) return `${minutes} minutes before`;
        if (minutes < 1440) return `${minutes / 60} hour${minutes / 60 > 1 ? 's' : ''} before`;
        return `${minutes / 1440} day${minutes / 1440 > 1 ? 's' : ''} before`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor()}`}>
                                {getEventTypeLabel()}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Date and Time */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <FiCalendar className="w-5 h-5 text-gray-400" />
                            <span className="font-medium">Date:</span>
                            <span>{formatDate(event.start)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <FiClock className="w-5 h-5 text-gray-400" />
                            <span className="font-medium">Time:</span>
                            <span>
                                {formatTime(event.start)} - {formatTime(event.end)}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </div>
                    )}

                    {/* Project */}
                    {event.project && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <FiLink className="inline w-4 h-4 mr-1" />
                                Linked Project
                            </h3>
                            <button
                                onClick={handleGoToProject}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                            >
                                {event.project.name} →
                            </button>
                        </div>
                    )}

                    {/* Created By */}
                    {event.createdBy && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Created By
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                                    {event.createdBy.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {event.createdBy.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {event.createdBy.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attendees */}
                    {event.attendees && event.attendees.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <FiUsers className="inline w-4 h-4 mr-1" />
                                Attendees ({event.attendees.length})
                            </h3>
                            <div className="space-y-2">
                                {event.attendees.map((attendee, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium">
                                            {attendee.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {attendee.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reminder */}
                    {event.reminder?.enabled && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <FiBell className="w-5 h-5 text-gray-400" />
                            <span className="font-medium">Reminder:</span>
                            <span>{getReminderText()}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        {event.type === 'team-event' && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <FiTrash2 className="w-4 h-4" />
                                <span>{isDeleting ? 'Deleting...' : 'Delete Event'}</span>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
