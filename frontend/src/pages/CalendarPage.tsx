import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import axios from 'axios';
import { FiCalendar, FiPlus, FiFilter } from 'react-icons/fi';
import CreateEventModal from '../components/CreateEventModal';
import EventDetailsModal from '../components/EventDetailsModal';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

// Setup the localizer for react-big-calendar
const locales = {
    'en-US': enUS
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar as any) as any;

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

interface CalendarPageProps {
    toggleDarkMode: () => void;
    darkMode: boolean;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ toggleDarkMode, darkMode }) => {
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'task' | 'milestone' | 'team-event'>('all');
    const [newEventDates, setNewEventDates] = useState<{ start: Date; end: Date } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);

    // Fetch team members from projects
    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const token = localStorage.getItem('token');
                const projectsResponse = await fetch('/api/projects', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (projectsResponse.ok) {
                    const projectsData = await projectsResponse.json();
                    const allTeamMembersMap = new Map<string, any>();

                    projectsData.forEach((project: any) => {
                        if (project.owner && project.owner._id) {
                            if (!allTeamMembersMap.has(project.owner._id)) {
                                allTeamMembersMap.set(project.owner._id, {
                                    _id: project.owner._id,
                                    name: project.owner.name || 'Unknown',
                                    email: project.owner.email || '',
                                    isOnline: false
                                });
                            }
                        }

                        if (project.members && Array.isArray(project.members)) {
                            project.members.forEach((member: any) => {
                                if (member._id && !allTeamMembersMap.has(member._id)) {
                                    allTeamMembersMap.set(member._id, {
                                        _id: member._id,
                                        name: member.name || 'Unknown',
                                        email: member.email || '',
                                        isOnline: false
                                    });
                                }
                            });
                        }
                    });

                    setTeamMembers(Array.from(allTeamMembersMap.values()));
                }
            } catch (error) {
                console.error('Error fetching team members:', error);
            }
        };

        fetchTeamMembers();
    }, []);

    // Fetch all calendar events
    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Calculate date range based on current view
            const start = startOfMonth(date);
            const end = endOfMonth(addDays(date, 42)); // Cover full calendar view

            // Fetch tasks with deadlines
            const tasksResponse = await axios.get('/api/tasks', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Fetch team events
            const eventsResponse = await axios.get('/api/team-events', {
                params: {
                    start: start.toISOString(),
                    end: end.toISOString(),
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            //  Transform tasks to calendar events
            const taskEvents: CalendarEvent[] = tasksResponse.data
                .filter((task: any) => task.dueDate)
                .map((task: any) => ({
                    id: task._id,
                    title: task.title,
                    start: new Date(task.dueDate),
                    end: new Date(task.dueDate),
                    type: 'task' as const,
                    description: task.description,
                    project: task.project,
                }));

            // Transform team events to calendar events
            const teamEvents: CalendarEvent[] = eventsResponse.data.map((event: any) => ({
                id: event._id,
                title: event.title,
                start: new Date(event.startDate),
                end: new Date(event.endDate),
                type: event.eventType === 'milestone' ? 'milestone' : 'team-event',
                description: event.description,
                project: event.project,
                createdBy: event.createdBy,
                attendees: event.attendees,
                reminder: event.reminder,
            }));

            setEvents([...taskEvents, ...teamEvents]);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Event style getter for color coding
    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = '#3174ad';

        switch (event.type) {
            case 'task':
                backgroundColor = '#3b82f6'; // Blue
                break;
            case 'milestone':
                backgroundColor = '#10b981'; // Green
                break;
            case 'team-event':
                backgroundColor = '#f59e0b'; // Orange
                break;
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
            },
        };
    };

    // Handle event selection
    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    // Handle slot selection (for creating new events)
    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        setSelectedEvent(null);
        setNewEventDates({ start, end });
        setShowCreateModal(true);
    };

    // Handle event drag and drop
    const handleEventDrop = async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
        try {
            const token = localStorage.getItem('token');

            if (event.type === 'task') {
                // Update task deadline
                await axios.patch(
                    `/api/tasks/${event.id}`,
                    { dueDate: start },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // Update team event
                await axios.put(
                    `/api/team-events/${event.id}`,
                    { startDate: start, endDate: end },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // Refresh events
            fetchEvents();
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    // Filter events based on type
    const filteredEvents = filterType === 'all'
        ? events
        : events.filter(event => event.type === filterType);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Sidebar Component */}
            <Sidebar
                activeSection="calendar"
                teamMembers={teamMembers}
                onlineUsers={teamMembers.filter((m: any) => m.isOnline).map((m: any) => ({ userId: m._id, name: m.name }))}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 md:ml-[280px] w-full md:w-[calc(100%-280px)] overflow-auto">
                {/* TopBar Component */}
                <TopBar
                    title="Calendar"
                    toggleDarkMode={toggleDarkMode}
                    darkMode={darkMode}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <div className="mt-8 pb-8 px-6 w-full max-w-full">
                    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                        {/* Header */}
                        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FiCalendar className="w-6 h-6 text-primary-600" />
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Filter Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value as any)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="all">All Events</option>
                                            <option value="task">Tasks</option>
                                            <option value="milestone">Milestones</option>
                                            <option value="team-event">Team Events</option>
                                        </select>
                                        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>

                                    {/* Create Event Button */}
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        <FiPlus className="w-5 h-5" />
                                        <span>New Event</span>
                                    </button>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Tasks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-green-500"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Milestones</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Team Events</span>
                                </div>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="flex-1 p-6 overflow-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full">
                                    <DnDCalendar
                                        localizer={localizer}
                                        events={filteredEvents}
                                        startAccessor="start"
                                        endAccessor="end"
                                        style={{ height: '100%' }}
                                        view={view}
                                        onView={setView}
                                        date={date}
                                        onNavigate={setDate}
                                        onSelectEvent={handleSelectEvent}
                                        onSelectSlot={handleSelectSlot}
                                        onEventDrop={handleEventDrop}
                                        eventPropGetter={eventStyleGetter}
                                        selectable
                                        resizable
                                        popup
                                        views={['month', 'week', 'day', 'agenda']}
                                        className="custom-calendar"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modals */}
                        {showCreateModal && (
                            <CreateEventModal
                                onClose={() => {
                                    setShowCreateModal(false);
                                    setNewEventDates(null);
                                }}
                                onEventCreated={fetchEvents}
                                initialStartDate={newEventDates?.start}
                                initialEndDate={newEventDates?.end}
                            />
                        )}

                        {showDetailsModal && selectedEvent && (
                            <EventDetailsModal
                                event={selectedEvent}
                                onClose={() => {
                                    setShowDetailsModal(false);
                                    setSelectedEvent(null);
                                }}
                                onEventDeleted={fetchEvents}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
