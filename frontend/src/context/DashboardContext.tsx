// teamflow/frontend/src/context/DashboardContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface DashboardStats {
    totalProjects: number;
    totalTeamMembers: number;
    activeProjects: number;
    completedTasks: number;
    completionRate: number;
}

interface TeamMember {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    isOnline?: boolean;
}

interface DashboardContextType {
    stats: DashboardStats;
    setStats: (stats: DashboardStats) => void;
    teamMembers: TeamMember[];
    setTeamMembers: (members: TeamMember[]) => void;
    hasData: boolean;
    setHasData: (has: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 0,
        totalTeamMembers: 0,
        activeProjects: 0,
        completedTasks: 0,
        completionRate: 0
    });
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [hasData, setHasData] = useState(false);

    return (
        <DashboardContext.Provider
            value={{
                stats,
                setStats,
                teamMembers,
                setTeamMembers,
                hasData,
                setHasData
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboardContext = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboardContext must be used within DashboardProvider');
    }
    return context;
};
