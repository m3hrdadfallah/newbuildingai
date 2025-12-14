
import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { Resource, ResourceType } from '../types';
import { formatCurrency } from '../utils/helpers';
import { suggestProjectResources } from '../services/geminiService';
import { Package, Truck, Users, DollarSign, Plus, Sparkles, Loader2, Save, X, Search, Edit2, Trash2, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const ResourcesPage: React.FC = () => {
    const { currentProject, addResource, updateResource, deleteResource } = useProject();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL');
    
    // AI State
    const [isThinking, setIsThinking] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
    const [showAiModal, setShowAiModal] = useState(false);

    // Edit/New Resource State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newResource, setNewResource] = useState<Partial<Resource>>({
        type: 'Material',
        currency: 'تومان'
    });

    const isPro = user?.plan === 'Pro';

    // Calculate Costs based on Task Assignments
    const costStats = useMemo(() => {
        return currentProject.tasks.reduce((acc, task) => {
            task.resources.forEach(res => {
                const r = currentProject.resources.find(i => i.id === res.resourceId);
                if (r) {
                    const val = r.costRate * res.quantity;
                    acc.total += val;
                    if (r.type === 'Material') acc.material += val;
                    if (r.type === 'Work') acc.work += val;
                    if (r.type === 'Equipment') acc.equipment += val;
                }
            });
            return acc;
        }, { total: 0, material: 0, work: 0, equipment: 0 });
    }, [currentProject.tasks, currentProject.resources]);

    const handleStartEdit = (res: Resource) => {
        setNewResource(res);
        setEditingId(res.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setNewResource({ type: 'Material', currency: 'تومان', name: '', costRate: 0, unit: '' });
        setEditingId(null);
    };

    const handleSaveResource = () => {
        const resToSave: Resource = {
            id: editingId || Date.now().toString(),
            name: newResource.name!,
            type: newResource.type as ResourceType,
            unit: newResource.unit || '',
            costRate: newResource.costRate || 0,
            currency: 'تومان',
            availabilityScore: editingId ? (currentProject.resources.find(r => r.id === editingId)?.availabilityScore) : 100
        };

        if (editingId) {
            updateResource(resToSave);
        } else {
            addResource(resToSave);
        }
        handleCancelEdit();
    };

    const runAiAnalysis = async () => {
        setIsThinking(true);
        setShowAiModal(true);
        try {
            const result = await suggestProjectResources(currentProject);
            setAiSuggestions(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsThinking(false);
        }
    };

    const acceptSuggestion = (item: any) => {
        const res: Resource = {
            id: `ai-${Date.now()}-${Math.random()}`,
            name: item.name,
            type: item.type,
            unit: item.unit,
            costRate: item.estimatedRate,
            currency: 'تومان',
            availabilityScore: 80
        };
        addResource(res);
        // Remove from list
        setAiSuggestions(prev => prev.filter(p => p.name !== item.name));
    };

    const filteredResources = currentProject.resources.filter(r => {
        const matchesSearch = r.name.includes(searchTerm);
        const matchesType = filterType === 'ALL' || r.type === filterType;
        return matchesSearch && matchesType;
    });

    const getTypeIcon = (type: ResourceType) => {
        switch (type) {
            case 'Material': return <Package className="w-4 h-4" />;
            case 'Equipment': return <Truck className="w-4 h-4" />;
            case 'Work': return <Users className="w-4 h-4" />;
            default: return <DollarSign className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6 relative pb-20">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-gray-500 text-sm">تعداد کل منابع تعریف شده</span>
                        <h3 className="text-3xl font-bold text-slate-800 mt-2">{currentProject.resources.length}</h3>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-full text-gray-400">
                        <Package className="w-8 h-8" />
                    </div>
                </div>

                {/* Cost Analysis Card */}
                 <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-gray-500 text-sm">هزینه برآورد شده منابع</span>
                            <h3 className="text-xl font-bold text-slate-800 mt-1">
                                {formatCurrency(costStats.total)} <span className="text-xs font-normal text-gray-400">تومان</span>
                            </h3>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                            <PieChart className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1 text-gray-600"><Package className="w-3 h-3 text-blue-500"/> مصالح:</span>
                            <span className="font-mono">{formatCurrency(costStats.material)}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${(costStats.material / (costStats.total || 1)) * 100}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs pt-1">
                            <span className="flex items-center gap-1 text-gray-600"><Users className="w-3 h-3 text-orange-500"/> نیرو:</span>
                            <span className="font-mono">{formatCurrency(costStats.work)}</span>
                        </div>
                         <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full" style={{ width: `${(costStats.work / (costStats.total || 1)) * 100}%` }}></div>
                        </div>

                         <div className="flex justify-between items-center text-xs pt-1">
                            <span className="flex items-center gap-1 text-gray-600"><Truck className="w-3 h-3 text-purple-500"/> ماشین:</span>
                            <span className="font-mono">{formatCurrency(costStats.equipment)}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full" style={{ width: `${(costStats.equipment / (costStats.total || 1)) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
                
                {/* AI Action Card */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        هوش مصنوعی (Gemini)
                    </h3>
                    <p className="text-indigo-100 text-sm mb-4">
                        بر اساس ابعاد و فعالیت‌های پروژه، لیست منابع و مصالح مورد نیاز را پیشنهاد می‌دهد.
                    </p>
                    {isPro ? (
                        <button 
                            onClick={runAiAnalysis}
                            className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-indigo-50 transition-colors w-full flex justify-center items-center gap-2"
                        >
                            برآورد هوشمند منابع
                        </button>
                    ) : (
                         <Link 
                            to="/upgrade"
                            className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-white/30 transition-colors w-full flex justify-center items-center gap-2 backdrop-blur-sm"
                        >
                           <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            ارتقا جهت استفاده
                        </Link>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Add/Edit Resource Form */}
                <div className={`bg-white p-6 rounded-xl shadow-sm border h-fit sticky top-6 transition-colors ${editingId ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        {editingId ? <Edit2 className="w-5 h-5 text-orange-600" /> : <Plus className="w-5 h-5 text-green-600" />}
                        {editingId ? 'ویرایش منبع' : 'تعریف منبع جدید'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">نام منبع</label>
                            <input 
                                type="text" 
                                value={newResource.name || ''}
                                onChange={e => setNewResource({...newResource, name: e.target.value})}
                                placeholder="مثال: سیمان، جوشکار..."
                                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">نوع</label>
                                <select 
                                    value={newResource.type}
                                    onChange={e => setNewResource({...newResource, type: e.target.value as ResourceType})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="Material">مصالح</option>
                                    <option value="Work">نیروی انسانی</option>
                                    <option value="Equipment">ماشین‌آلات</option>
                                    <option value="Cost">هزینه سربار</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">واحد</label>
                                <input 
                                    type="text" 
                                    value={newResource.unit || ''}
                                    onChange={e => setNewResource({...newResource, unit: e.target.value})}
                                    placeholder="کیلوگرم، ساعت..."
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">هزینه واحد (تومان)</label>
                            <input 
                                type="number" 
                                value={newResource.costRate || ''}
                                onChange={e => setNewResource({...newResource, costRate: Number(e.target.value)})}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                            {newResource.costRate ? (
                                <span className="text-[10px] text-gray-500 mt-1 block">{formatCurrency(newResource.costRate)} تومان</span>
                            ) : null}
                        </div>
                        
                        <div className="flex gap-2">
                             {editingId && (
                                <button 
                                    onClick={handleCancelEdit}
                                    className="flex-1 bg-white border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    انصراف
                                </button>
                            )}
                            <button 
                                disabled={!newResource.name || !newResource.costRate}
                                onClick={handleSaveResource}
                                className={`flex-[2] text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                            >
                                {editingId ? 'بروزرسانی' : 'افزودن به لیست'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Resource List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                         <div className="relative w-full sm:flex-1">
                            <input 
                                type="text" 
                                placeholder="جستجو در منابع..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-3 pr-9 py-2 rounded-lg border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                             {(['ALL', 'Material', 'Work', 'Equipment'] as const).map(t => (
                                 <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors border whitespace-nowrap ${
                                        filterType === t 
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' 
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                 >
                                    {t === 'ALL' ? 'همه' : t === 'Material' ? 'مصالح' : t === 'Work' ? 'نیرو' : 'ماشین'}
                                 </button>
                             ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right min-w-[600px]">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                    <tr>
                                        <th className="p-4 w-10">#</th>
                                        <th className="p-4">نام منبع</th>
                                        <th className="p-4">نوع</th>
                                        <th className="p-4">واحد</th>
                                        <th className="p-4">نرخ واحد (تومان)</th>
                                        <th className="p-4 w-24">عملیات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredResources.map((res, idx) => (
                                        <tr key={res.id} className={`hover:bg-gray-50 group ${editingId === res.id ? 'bg-orange-50' : ''}`}>
                                            <td className="p-4 text-gray-400 text-xs">{idx + 1}</td>
                                            <td className="p-4 font-medium text-gray-800">{res.name}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                                    res.type === 'Material' ? 'bg-blue-100 text-blue-700' :
                                                    res.type === 'Work' ? 'bg-orange-100 text-orange-700' :
                                                    res.type === 'Equipment' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'
                                                }`}>
                                                    {getTypeIcon(res.type)}
                                                    {res.type === 'Material' ? 'مصالح' : res.type === 'Work' ? 'نیرو' : res.type === 'Equipment' ? 'ماشین' : 'هزینه'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500">{res.unit}</td>
                                            <td className="p-4 font-mono text-gray-700">{formatCurrency(res.costRate)}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleStartEdit(res)}
                                                        className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                                                        title="ویرایش"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteResource(res.id)}
                                                        className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredResources.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-400">موردی یافت نشد</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Suggestion Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                            <div>
                                <h3 className="font-bold text-xl text-purple-900 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-purple-600" />
                                    پیشنهاد هوشمند منابع
                                </h3>
                                <p className="text-sm text-purple-700 mt-1">
                                    بر اساس متراژ ({currentProject.details.dimensions.infrastructureArea}m²) و نوع سازه ({currentProject.details.dimensions.structureType})
                                </p>
                            </div>
                            <button onClick={() => setShowAiModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            {isThinking ? (
                                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                                    <p className="text-gray-500">در حال تحلیل نقشه‌ها و استعلام قیمت بازار...</p>
                                </div>
                            ) : aiSuggestions.length > 0 ? (
                                <div className="space-y-3">
                                    {aiSuggestions.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                                                    <span className="text-xs bg-white border px-2 py-0.5 rounded text-gray-500">{item.type}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    پیشنهاد برای: {item.reason}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-700">{formatCurrency(item.estimatedRate)}</div>
                                                    <div className="text-xs text-gray-400">تومان / {item.unit}</div>
                                                </div>
                                                <button 
                                                    onClick={() => acceptSuggestion(item)}
                                                    className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 shadow-md"
                                                    title="افزودن به پروژه"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    لیست پیشنهادی خالی است. مجددا تلاش کنید.
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 rounded-b-2xl">
                            * قیمت‌ها تخمینی هستند و باید قبل از خرید استعلام نهایی شوند.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
