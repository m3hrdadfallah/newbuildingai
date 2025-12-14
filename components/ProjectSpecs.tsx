
import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ProjectDetails } from '../types';
import { 
    MapPin, Ruler, Layers, FileSignature, 
    Briefcase, DollarSign, AlertTriangle, Truck, Save, Building
} from 'lucide-react';

export const ProjectSpecs: React.FC = () => {
    const { currentProject, updateProjectDetails } = useProject();
    const [details, setDetails] = useState<ProjectDetails>(currentProject.details);
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (section: keyof ProjectDetails, key: string, value: any) => {
        setDetails(prev => ({
            ...prev,
            [section]: {
                // @ts-ignore
                ...prev[section],
                [key]: value
            }
        }));
        setIsDirty(true);
    };

    const handleConstraintChange = (index: number, value: string) => {
        const newConstraints = [...details.constraints];
        newConstraints[index] = value;
        setDetails(prev => ({ ...prev, constraints: newConstraints }));
        setIsDirty(true);
    };

    const handleSave = () => {
        updateProjectDetails(details);
        setIsDirty(false);
        // Optional: Show success toast
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">مشخصات جامع پروژه</h2>
                    <p className="text-sm text-gray-500">اطلاعات فنی، حقوقی و مالی</p>
                </div>
                {isDirty && (
                    <button 
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg animate-pulse"
                    >
                        <Save className="w-4 h-4" />
                        ذخیره تغییرات
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* 1. Dimensions */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b">
                        <Ruler className="w-5 h-5 text-blue-500" />
                        ابعاد و احجام پروژه
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">مساحت زمین (m²)</label>
                            <input 
                                type="number" 
                                value={details.dimensions.landArea}
                                onChange={e => handleChange('dimensions', 'landArea', Number(e.target.value))}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">زیربنا کل (m²)</label>
                            <input 
                                type="number" 
                                value={details.dimensions.infrastructureArea}
                                onChange={e => handleChange('dimensions', 'infrastructureArea', Number(e.target.value))}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                         <div>
                            <label className="text-xs text-gray-500 block mb-1">سطح اشغال (%)</label>
                            <input 
                                type="number" 
                                value={details.dimensions.occupationArea}
                                onChange={e => handleChange('dimensions', 'occupationArea', Number(e.target.value))}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">تعداد طبقات</label>
                            <input 
                                type="number" 
                                value={details.dimensions.floors}
                                onChange={e => handleChange('dimensions', 'floors', Number(e.target.value))}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">تعداد واحد</label>
                            <input 
                                type="number" 
                                value={details.dimensions.units}
                                onChange={e => handleChange('dimensions', 'units', Number(e.target.value))}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                         <div>
                            <label className="text-xs text-gray-500 block mb-1">نوع سازه</label>
                            <select 
                                value={details.dimensions.structureType}
                                onChange={e => handleChange('dimensions', 'structureType', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            >
                                <option value="Concrete">بتنی</option>
                                <option value="Metal">فلزی</option>
                                <option value="Mixed">ترکیبی</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Location */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b">
                        <MapPin className="w-5 h-5 text-red-500" />
                        موقعیت و دسترسی
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">آدرس دقیق</label>
                            <textarea 
                                value={details.location.address}
                                onChange={e => handleChange('location', 'address', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50 h-20"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">منطقه</label>
                                <select 
                                    value={details.location.zoneType}
                                    onChange={e => handleChange('location', 'zoneType', e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-gray-50"
                                >
                                    <option value="Urban">شهری متراکم</option>
                                    <option value="Industrial">صنعتی</option>
                                    <option value="Residential">مسکونی</option>
                                    <option value="Commercial">تجاری</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">محدودیت‌های دسترسی (لجستیک)</label>
                            <input 
                                type="text" 
                                value={details.location.accessRestrictions}
                                onChange={e => handleChange('location', 'accessRestrictions', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                 {/* 3. Design & Specs */}
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b">
                        <Layers className="w-5 h-5 text-purple-500" />
                        مشخصات فنی و طراحی
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">سیستم مکانیکی</label>
                            <input 
                                type="text" 
                                value={details.design.mechanicalSystem}
                                onChange={e => handleChange('design', 'mechanicalSystem', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">سیستم برق</label>
                            <input 
                                type="text" 
                                value={details.design.electricalSystem}
                                onChange={e => handleChange('design', 'electricalSystem', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">نوع نما</label>
                                <input 
                                    type="text" 
                                    value={details.design.facadeType}
                                    onChange={e => handleChange('design', 'facadeType', e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">نوع سقف</label>
                                <input 
                                    type="text" 
                                    value={details.design.roofType}
                                    onChange={e => handleChange('design', 'roofType', e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Contract */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b">
                        <FileSignature className="w-5 h-5 text-orange-500" />
                        قرارداد و برنامه زمانی
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">شماره قرارداد</label>
                            <input 
                                type="text" 
                                value={details.contract.contractNumber}
                                onChange={e => handleChange('contract', 'contractNumber', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                         <div>
                            <label className="text-xs text-gray-500 block mb-1">مدت پیمان (ماه)</label>
                            <input 
                                type="number" 
                                value={details.contract.durationMonths}
                                onChange={e => handleChange('contract', 'durationMonths', Number(e.target.value))}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">تاریخ شروع</label>
                            <input 
                                type="text" 
                                value={details.contract.startDate}
                                onChange={e => handleChange('contract', 'startDate', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                                placeholder="1403/01/01"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">تاریخ پایان</label>
                            <input 
                                type="text" 
                                value={details.contract.endDate}
                                onChange={e => handleChange('contract', 'endDate', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                                placeholder="1404/01/01"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">شرایط جریمه / پاداش</label>
                        <input 
                            type="text" 
                            value={details.contract.penaltyPolicy}
                            onChange={e => handleChange('contract', 'penaltyPolicy', e.target.value)}
                            className="w-full p-2 border rounded-lg bg-gray-50"
                        />
                    </div>
                </div>

                {/* 5. Financials & Team */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        مالی و ارکان پروژه
                    </h3>
                    <div className="space-y-4">
                         <div>
                            <label className="text-xs text-gray-500 block mb-1">نام پیمانکار اصلی</label>
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={details.contractor}
                                    onChange={e => {
                                        setDetails(prev => ({ ...prev, contractor: e.target.value }));
                                        setIsDirty(true);
                                    }}
                                    className="w-full p-2 border rounded-lg bg-gray-50"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">بودجه کل (ریال/تومان)</label>
                                <input 
                                    type="number" 
                                    value={details.financials.totalBudget}
                                    onChange={e => handleChange('financials', 'totalBudget', Number(e.target.value))}
                                    className="w-full p-2 border rounded-lg bg-gray-50"
                                />
                            </div>
                             <div>
                                <label className="text-xs text-gray-500 block mb-1">هزینه تجهیز کارگاه</label>
                                <input 
                                    type="number" 
                                    value={details.financials.workshopEquipCost}
                                    onChange={e => handleChange('financials', 'workshopEquipCost', Number(e.target.value))}
                                    className="w-full p-2 border rounded-lg bg-gray-50"
                                />
                            </div>
                        </div>
                         <div>
                            <label className="text-xs text-gray-500 block mb-1">نحوه پرداخت</label>
                            <input 
                                type="text" 
                                value={details.financials.paymentMethod}
                                onChange={e => handleChange('financials', 'paymentMethod', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                {/* 6. Constraints & Materials */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ریسک‌ها و تدارکات
                    </h3>
                    <div className="space-y-4">
                         <div>
                            <label className="text-xs text-gray-500 block mb-1">استراتژی تامین مصالح</label>
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={details.materialStrategy}
                                    onChange={e => {
                                        setDetails(prev => ({ ...prev, materialStrategy: e.target.value }));
                                        setIsDirty(true);
                                    }}
                                    className="w-full p-2 border rounded-lg bg-gray-50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-2">محدودیت‌ها و ریسک‌های کلان</label>
                            {details.constraints.map((c, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <span className="text-gray-400 mt-2">•</span>
                                    <input 
                                        type="text" 
                                        value={c}
                                        onChange={e => handleConstraintChange(idx, e.target.value)}
                                        className="w-full p-2 border rounded-lg bg-gray-50 text-sm"
                                    />
                                </div>
                            ))}
                            <button 
                                onClick={() => {
                                    setDetails(prev => ({ ...prev, constraints: [...prev.constraints, ''] }));
                                    setIsDirty(true);
                                }}
                                className="text-xs text-blue-600 hover:underline mt-2"
                            >
                                + افزودن محدودیت جدید
                            </button>
                        </div>
                    </div>
                </div>

                {/* 7. Default WBS Guide */}
                <div className="md:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200 dashed">
                     <h3 className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                        <Building className="w-5 h-5" />
                        ساختار پیشنهادی پروژه (فازبندی)
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">بر اساس نوع سازه ({details.dimensions.structureType}) و تعداد طبقات ({details.dimensions.floors})، فازبندی زیر توصیه می‌شود:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {['1. تجهیز کارگاه', '2. گودبرداری و سازه نگهبان', '3. فونداسیون', '4. اسکلت و سقف', '5. سفت‌کاری و تاسیسات', '6. نازک‌کاری و نما'].map((phase, i) => (
                            <div key={i} className="bg-white px-3 py-2 rounded shadow-sm text-xs font-mono text-center text-slate-600 border border-slate-200">
                                {phase}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
