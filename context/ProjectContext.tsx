
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Task, Resource, AIAlert, ProjectDetails } from '../types';
import { useAuth } from './AuthContext';
// Removed invalid auth import from firebase as it's no longer exported or used
import { saveProjectData, getProjectData } from '../services/firestoreService';

interface ProjectContextType {
    currentProject: Project;
    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;
    addResource: (res: Resource) => void;
    updateResource: (res: Resource) => void;
    deleteResource: (resId: string) => void;
    updateProjectDetails: (details: ProjectDetails) => void;
    updateProjectAnalysis: (riskScore: number, alerts: AIAlert[]) => void;
    saveProject: () => void;
    importProject: (data: any) => void;
    exportProjectJSON: () => void;
    isLoadingData: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Initial Data Constants
const INITIAL_RESOURCES: Resource[] = [
    { id: 'r1', name: 'سیمان تیپ 2', type: 'Material', unit: 'پاکت', costRate: 75000, currency: 'تومان', availabilityScore: 90 },
    { id: 'r2', name: 'کارگر ساده', type: 'Work', unit: 'ساعت', costRate: 180000, currency: 'تومان', availabilityScore: 80 },
];
const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};
const INITIAL_TASKS: Task[] = [
    { 
        id: 't1', 
        wbs: '1.0',
        title: 'تجهیز کارگاه نمونه', 
        description: 'این یک پروژه نمونه است. می‌توانید آن را ویرایش کنید.',
        taskType: 'Task',
        phase: 'تجهیز کارگاه',
        startDate: getPastDate(5), 
        finishDate: getPastDate(0),
        duration: 5, 
        status: 'COMPLETED', 
        percentComplete: 100,
        predecessors: [],
        resources: [],
        priority: 'Medium',
        isCritical: false
    }
];

const DEFAULT_PROJECT: Project = {
    id: 'p1',
    name: 'پروژه نمونه سازیار',
    description: 'این یک پروژه پیش‌فرض است. با دکمه ذخیره، اطلاعات در دیتابیس شما ثبت می‌شود.',
    details: {
        dimensions: { landArea: 300, infrastructureArea: 1500, occupationArea: 60, floors: 5, structureType: 'Concrete', units: 10 },
        location: { address: 'تهران', zoneType: 'Urban' },
        design: { mechanicalSystem: 'کولر آبی', electricalSystem: 'سنتی', facadeType: 'سنگ', roofType: 'ایزوگام' },
        contract: { contractNumber: '001', startDate: '1403/01/01', endDate: '1404/01/01', durationMonths: 12 },
        contractor: 'خودم',
        financials: { totalBudget: 10000000000, paymentMethod: 'نقد', workshopEquipCost: 0 },
        constraints: [],
        materialStrategy: 'خرید خرد'
    },
    tasks: INITIAL_TASKS,
    resources: INITIAL_RESOURCES,
    projectRiskScore: 100,
    aiAlerts: []
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [currentProject, setCurrentProject] = useState<Project>(DEFAULT_PROJECT);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Load Project from Firestore when user logs in
    useEffect(() => {
        let isMounted = true;
        
        const loadProject = async () => {
            // Updated to use user from useAuth() hook instead of Firebase Auth directly
            if (user) {
                setIsLoadingData(true);
                try {
                    const savedProject = await getProjectData(user.uid);
                    if (isMounted) {
                        if (savedProject && savedProject.tasks) {
                            setCurrentProject(savedProject);
                        } else {
                            // First time or empty
                            await saveProjectData(user.uid, DEFAULT_PROJECT);
                            setCurrentProject(DEFAULT_PROJECT);
                        }
                    }
                } catch (error) {
                    console.error("Error loading project:", error);
                    // On error, keep default project so app doesn't crash
                    if (isMounted) setCurrentProject(DEFAULT_PROJECT);
                } finally {
                    if (isMounted) setIsLoadingData(false);
                }
            }
        };

        loadProject();
        return () => { isMounted = false; };
    }, [user]);

    // Helper to update state
    const updateProjectState = (updater: (prev: Project) => Project) => {
        setCurrentProject(prev => {
             try {
                 return updater(prev);
             } catch (e) {
                 console.error("Error updating project state", e);
                 return prev;
             }
        });
    };

    const addTask = (task: Task) => updateProjectState(prev => ({ ...prev, tasks: [...(prev.tasks || []), task] }));
    const updateTask = (updatedTask: Task) => updateProjectState(prev => ({ ...prev, tasks: (prev.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t) }));
    const deleteTask = (taskId: string) => updateProjectState(prev => ({ ...prev, tasks: (prev.tasks || []).filter(t => t.id !== taskId) }));
    
    const addResource = (res: Resource) => updateProjectState(prev => ({ ...prev, resources: [...(prev.resources || []), res] }));
    const updateResource = (updatedRes: Resource) => updateProjectState(prev => ({ ...prev, resources: (prev.resources || []).map(r => r.id === updatedRes.id ? updatedRes : r) }));
    const deleteResource = (resId: string) => updateProjectState(prev => ({ ...prev, resources: (prev.resources || []).filter(r => r.id !== resId) }));
    
    const updateProjectDetails = (details: ProjectDetails) => updateProjectState(prev => ({ ...prev, details: details }));
    const updateProjectAnalysis = (riskScore: number, alerts: AIAlert[]) => updateProjectState(prev => ({ ...prev, projectRiskScore: riskScore, aiAlerts: alerts }));

    const saveProject = async () => {
        // Updated to use user from AuthContext
        if (user) {
            try {
                await saveProjectData(user.uid, currentProject);
                console.log("Project saved to Firebase!");
            } catch (error) {
                console.error("Error saving project:", error);
                alert("خطا در ذخیره‌سازی اطلاعات. لطفا اتصال اینترنت را بررسی کنید.");
            }
        }
    };

    const importProject = async (data: any) => {
        try {
            if (!data || !data.tasks || !data.details) {
                alert("فایل انتخاب شده نامعتبر است.");
                return;
            }
            setCurrentProject(data);
            // Updated to use user from AuthContext
            if (user) {
                await saveProjectData(user.uid, data);
            }
            alert("پروژه با موفقیت بارگذاری شد.");
        } catch (error) {
            console.error("Import failed", error);
            alert("خطا در بارگذاری فایل.");
        }
    };

    const exportProjectJSON = () => {
        const dataStr = JSON.stringify(currentProject, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `sazyar-project-${new Date().toISOString().split('T')[0]}.json`;
        link.href = url;
        link.click();
    };

    return (
        <ProjectContext.Provider value={{ 
            currentProject, 
            addTask, 
            updateTask, 
            deleteTask, 
            addResource, 
            updateResource, 
            deleteResource, 
            updateProjectDetails, 
            updateProjectAnalysis, 
            saveProject, 
            importProject,
            exportProjectJSON,
            isLoadingData 
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
