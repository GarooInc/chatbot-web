"use client";
import React, { useEffect, useState } from 'react';
import {fetchDashboard} from '@/lib/api';

const Dashboard = () => {
    const [dashboardUrl, setDashboardUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);
            try {
                const data = await fetchDashboard(localStorage.getItem('selectedAgentId'));
                setDashboardUrl(data.dashboard_link);
            } catch (error) {
                console.error('Error fetching dashboard URL:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboard();
    }, []);

  return (
    isLoading ? (
        <div className="flex justify-center items-center h-full">
            <span className="loading loading-ring loading-xl text-black"></span>
        </div>
    ) : dashboardUrl ? (
         <iframe width="100%" 
            height="100%" 
            src={dashboardUrl}
            frameBorder="0" 
            style={{ border: 0 }} allowFullScreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
        </iframe>
    ) : (
    <div className="flex flex-col gap-2 justify-center items-center h-full">
        <span className="text-gray-500 text-sm">
            Select an agent in the homepage to view its dashboard.
        </span>
    </div>
    )
  );
}

export default Dashboard