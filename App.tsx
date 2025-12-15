import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage'; // Import Landing Page
import { Dashboard } from './components/Dashboard';
import { TasksPage } from './components/TasksPage';
import { GanttChart } from './components/GanttChart';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { ProjectSpecs } from './components/ProjectSpecs';
import { Reports } from './components/Reports';
import { AIChat } from './components/AIChat';
import { ResourcesPage } from './components/ResourcesPage';
import { UpgradePage } from './components/UpgradePage';
import { UserProfile } from './components/UserProfile';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ProjectProvider>
                <Router>
                    <Routes>
                        {/* Public Landing Page */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Protected App Routes */}
                        <Route path="/*" element={
                            <Layout>
                                <Routes>
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
                                </Routes>
                                <AIChat />
                            </Layout>
                        } />
                    </Routes>
                </Router>
            </ProjectProvider>
        </AuthProvider>
    );
};

export default App;