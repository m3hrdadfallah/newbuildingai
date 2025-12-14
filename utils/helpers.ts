
export const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return '0';
    return amount.toLocaleString('fa-IR');
};

export const formatJalaliDate = (isoDateString: string | undefined): string => {
    if (!isoDateString) return '-';
    try {
        const date = new Date(isoDateString);
        if (isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' })
            .format(date)
            .replace(/\//g, '/');
    } catch (e) {
        return '-';
    }
};

export const addDays = (dateStr: string, days: number): string => {
    if (!dateStr || isNaN(days)) return dateStr;
    try {
        const result = new Date(dateStr);
        if (isNaN(result.getTime())) return dateStr;
        
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    } catch (e) {
        return dateStr;
    }
};

// Helper to convert Persian digits to English
const toEnglishDigits = (str: string): string => {
    return str.replace(/[۰-۹]/g, w => String.fromCharCode(w.charCodeAt(0) - 1728));
};

export const getCurrentJalaliDate = (): string => {
    const d = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .format(new Date());
    // Ensure English digits for logic compatibility
    return toEnglishDigits(d).replace(/\//g, '/');
};

// --- Advanced Jalali Utils for Calendar ---

export const getJalaliMonthName = (monthIndex: number): string => {
    const months = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    // Safety check for NaN or out of bounds
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return '';
    return months[monthIndex] || '';
};

export const getJalaliDaysInMonth = (year: number, month: number): number => {
    if (isNaN(year) || isNaN(month)) return 30; // Fallback
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    // Simple leap year check (sufficient for current era)
    const leapYears = [1399, 1403, 1408, 1412, 1416, 1420];
    return leapYears.includes(year) ? 30 : 29;
};

// Convert Jalali (yyyy/mm/dd) to Gregorian ISO (yyyy-mm-dd)
export const jalaliToGregorian = (jDate: string): string | null => {
    if (!jDate) return null;
    try {
        // Normalize to English digits
        const englishDigits = toEnglishDigits(jDate);
        const parts = englishDigits.split('/');
        if (parts.length !== 3) return null;

        const jy = parseInt(parts[0], 10);
        const jm = parseInt(parts[1], 10);
        const jd = parseInt(parts[2], 10);

        if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null;

        // Using Intl to find the date. 
        // We start from March 20 of that year and iterate to find matching Jalali.
        const gy = jy + 621; 
        const startSearch = new Date(gy, 2, 15); // March 15
        
        if (isNaN(startSearch.getTime())) return null;

        for(let i=0; i<400; i++) {
            const d = new Date(startSearch);
            d.setDate(d.getDate() + i);
            const jStr = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {year:'numeric', month:'numeric', day:'numeric'}).format(d);
            // Normalize Intl output
            const normalizedJStr = toEnglishDigits(jStr).replace(/\//g, '/');
            const [y, m, day] = normalizedJStr.split('/');
            
            if (parseInt(y) === jy && parseInt(m) === jm && parseInt(day) === jd) {
                return d.toISOString().split('T')[0];
            }
        }
        return null;
    } catch (e) {
        return null;
    }
};

// Convert Gregorian ISO to detailed Jalali Object
export const gregorianToJalaliObj = (isoDate: string) => {
    try {
        const d = new Date(isoDate);
        if (isNaN(d.getTime())) {
            // Fallback to a default date (1403/01/01) if invalid
            return { jy: 1403, jm: 1, jd: 1 };
        }
        const jStr = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {year:'numeric', month:'numeric', day:'numeric'}).format(d);
        const normalized = toEnglishDigits(jStr);
        const [jy, jm, jd] = normalized.split('/').map(Number);
        return { jy, jm, jd };
    } catch (e) {
        return { jy: 1403, jm: 1, jd: 1 };
    }
};

// --- Export Utils ---

export const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => {
            // @ts-ignore
            const val = row[fieldName] ? row[fieldName].toString().replace(/,/g, ' ') : '';
            return val;
        }).join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
