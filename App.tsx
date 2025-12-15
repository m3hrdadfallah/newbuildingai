import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TasksPage } from './components/TasksPage';
import { GanttChart } from './components/GanttChart';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { ProjectSpecs } from './components/ProjectSpecs';
import { Reports } from './components/Reports';
import { ResourcesPage } from './components/ResourcesPage';
import { UpgradePage } from './components/UpgradePage';
import { UserProfile } from './components/UserProfile';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ProjectProvider>
                <Router>
                    <Routes>
                        {/* Public Route: Landing Page at root */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Protected Routes: Wrapped in Layout */}
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/specs" element={<ProjectSpecs />} />
                            <Route path="/tasks" element={<TasksPage />} />
                            <Route path="/resources" element={<ResourcesPage />} />
                            <Route path="/gantt" element={<GanttChart />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/simulation" element={<ScenarioSimulator />} />
                            <Route path="/upgrade" element={<UpgradePage />} />
                            <Route path="/profile" element={<UserProfile />} />
                            <Route path="/payment/callback" element={<div className="p-10 text-center text-green-600 font-bold">پرداخت با موفقیت انجام شد. در حال بازگشت...</div>} />
                        </Route>

                        {/* Catch-all: Redirect unknown routes to Landing Page */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </ProjectProvider>
        </AuthProvider>
    );
};

export default App;