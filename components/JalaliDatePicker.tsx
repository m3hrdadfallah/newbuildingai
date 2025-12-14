
import React, { useState, useEffect } from 'react';
import { getJalaliDaysInMonth, getJalaliMonthName, gregorianToJalaliObj, jalaliToGregorian } from '../utils/helpers';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';

interface JalaliDatePickerProps {
    label: string;
    value: string; // jalali string yyyy/mm/dd
    onChange: (jalaliDate: string, isoDate: string) => void;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({ label, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentYear, setCurrentYear] = useState(1403);
    const [currentMonth, setCurrentMonth] = useState(1); // 1-12

    // Helper to normalize digits locally
    const normalizeDigits = (str: string) => str.replace(/[۰-۹]/g, w => String.fromCharCode(w.charCodeAt(0) - 1728));

    // Initialize calendar based on passed value or today
    useEffect(() => {
        if (value) {
            const normalized = normalizeDigits(value);
            const parts = normalized.split('/');
            if (parts.length === 3) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10);
                if (!isNaN(y) && !isNaN(m)) {
                    setCurrentYear(y);
                    setCurrentMonth(m);
                }
            }
        } else {
            const todayObj = gregorianToJalaliObj(new Date().toISOString());
            setCurrentYear(todayObj.jy);
            setCurrentMonth(todayObj.jm);
        }
    }, [value]);

    const handleDayClick = (day: number) => {
        const formattedMonth = currentMonth.toString().padStart(2, '0');
        const formattedDay = day.toString().padStart(2, '0');
        const jalaliStr = `${currentYear}/${formattedMonth}/${formattedDay}`;
        
        const iso = jalaliToGregorian(jalaliStr);
        if (iso) {
            onChange(jalaliStr, iso);
            setIsOpen(false);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const prevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    // Find start day of the week (0=Saturday in Persian calendar context usually, but Date object 0=Sunday)
    const getFirstDayOfWeek = () => {
        const formattedMonth = currentMonth.toString().padStart(2, '0');
        const jalaliFirstDay = `${currentYear}/${formattedMonth}/01`;
        const firstDayIso = jalaliToGregorian(jalaliFirstDay);
        
        if (!firstDayIso) return 0;
        
        const day = new Date(firstDayIso).getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        // Convert to Persian week: Sat=0, Sun=1, ... Fri=6
        const persianMap = [1, 2, 3, 4, 5, 6, 0];
        return persianMap[day];
    };

    const daysInMonth = getJalaliDaysInMonth(currentYear, currentMonth);
    const startDay = getFirstDayOfWeek();

    return (
        <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <div 
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-gray-300 bg-white cursor-pointer hover:border-blue-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm font-mono" dir="ltr">{value || 'انتخاب تاریخ'}</span>
                <Calendar className="w-4 h-4 text-gray-400" />
            </div>

            {isOpen && (
                <div className="absolute top-full mt-1 right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <button onClick={prevMonth} type="button" className="p-1 hover:bg-gray-100 rounded">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-700 text-sm">
                            {getJalaliMonthName(currentMonth - 1)} <span className="font-mono">{currentYear}</span>
                        </span>
                        <button onClick={nextMonth} type="button" className="p-1 hover:bg-gray-100 rounded">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(d => (
                            <span key={d} className="text-xs text-gray-400 font-medium">{d}</span>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dStr = day.toString().padStart(2, '0');
                            const mStr = currentMonth.toString().padStart(2, '0');
                            const checkVal = `${currentYear}/${mStr}/${dStr}`;
                            
                            // Normalize comparison
                            const isSelected = normalizeDigits(value) === checkVal;
                            
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDayClick(day)}
                                    className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors font-mono ${
                                        isSelected 
                                            ? 'bg-blue-600 text-white shadow-md' 
                                            : 'hover:bg-blue-50 text-gray-700'
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    
                    <button 
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full mt-4 bg-gray-100 text-gray-600 text-xs py-2 rounded hover:bg-gray-200"
                    >
                        بستن
                    </button>
                </div>
            )}
            {/* Backdrop to close */}
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
};
