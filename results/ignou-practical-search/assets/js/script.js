let examDatabase = [];
let bcaolDatabase = [];
let currentData = [];
let currentProgram = 'regular'; // 'regular', 'odl', 'ol'

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loadingMsg');
    if(loader) loader.classList.remove('hidden');

    // Load both data files - try different paths
    const dataPath1 = '/results/ignou-practical-search/data.json';
    const dataPath2 = './data.json';
    const bcaolPath1 = '/results/ignou-practical-search/BCAOL.json';
    const bcaolPath2 = './BCAOL.json';
    
    Promise.all([
        fetch(dataPath1)
            .then(res => {
                if (!res.ok) throw new Error(`Path 1 failed (${res.status}), trying fallback...`);
                return res.json();
            })
            .catch(err => {
                console.log('Trying fallback for data.json:', dataPath2);
                return fetch(dataPath2).then(res => {
                    if (!res.ok) throw new Error('Failed to load data.json from both paths: ' + res.status);
                    return res.json();
                });
            }),
        fetch(bcaolPath1)
            .then(res => {
                if (!res.ok) throw new Error(`Path 1 failed (${res.status}), trying fallback...`);
                return res.json();
            })
            .catch(err => {
                console.log('Trying fallback for BCAOL.json:', bcaolPath2);
                return fetch(bcaolPath2).then(res => {
                    if (!res.ok) throw new Error('Failed to load BCAOL.json from both paths: ' + res.status);
                    return res.json();
                });
            })
    ])
    .then(([regularData, bcaolData]) => {
        examDatabase = regularData;
        bcaolDatabase = bcaolData;
        console.log('Data loaded successfully');
        console.log('Regular data count:', examDatabase.length);
        console.log('BCAOL data count:', bcaolDatabase.length);
        if(loader) loader.classList.add('hidden');
    })
    .catch(err => {
        console.error('Error loading data:', err);
        if(loader) loader.innerText = "Error: " + err.message;
    });

    lucide.createIcons();
    
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') findSchedule();
    });
});

function switchProgram(program) {
    currentProgram = program;
    
    // Update tab styles - remove highlight from all tabs
    document.getElementById('tabRegular').classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
    document.getElementById('tabRegular').classList.add('border-b-2', 'border-transparent', 'text-gray-600');
    document.getElementById('tabOL').classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
    document.getElementById('tabOL').classList.add('border-b-2', 'border-transparent', 'text-gray-600');
    
    // Add highlight to selected tab
    if (program === 'regular') {
        document.getElementById('tabRegular').classList.remove('border-transparent', 'text-gray-600');
        document.getElementById('tabRegular').classList.add('border-blue-600', 'text-blue-600');
    } else if (program === 'ol') {
        document.getElementById('tabOL').classList.remove('border-transparent', 'text-gray-600');
        document.getElementById('tabOL').classList.add('border-blue-600', 'text-blue-600');
    }
    
    // Clear results when switching programs
    document.getElementById('webTableBody').innerHTML = '';
    document.getElementById('webResultContainer').classList.add('hidden');
    document.getElementById('noResultMsg').classList.add('hidden');
}

function findSchedule() {
    const val = document.getElementById('searchInput').value.trim();
    const table = document.getElementById('webTableBody');
    const resultDiv = document.getElementById('webResultContainer');
    const noResult = document.getElementById('noResultMsg');
    const tableHeader = document.getElementById('tableHeader');
    
    table.innerHTML = '';
    resultDiv.classList.add('hidden');
    noResult.classList.add('hidden');

    if (!val) { alert("Please enter Enrollment No."); return; }

    // Select data source based on current program
    let dataSource = examDatabase;
    if (currentProgram === 'odl' || currentProgram === 'ol') {
        dataSource = bcaolDatabase;
    }

    // Filter data based on enrollment number
    if (currentProgram === 'regular') {
        currentData = dataSource
            .filter(s => s.ENRNO && typeof s.ENRNO === 'number')
            .filter(s => String(s.ENRNO).trim() == val);
    } else {
        // For BCAOL data, match Column2 (enrollment number) - skip header row
        currentData = dataSource
            .filter(s => s && s.Column2 && typeof s.Column2 === 'number')
            .filter(s => String(s.Column2).trim() == val);
    }

    if (currentData.length > 0) {
        // Get name from appropriate field
        const nameField = currentProgram === 'regular' ? 'NAME' : 'Column3';
        const enrollField = currentProgram === 'regular' ? 'ENRNO' : 'Column2';
        
        document.getElementById('webStudentName').innerText = currentData[0][nameField];
        document.getElementById('webStudentEnr').innerText = currentData[0][enrollField];

        // Update table header for BCAOL programs
        if (currentProgram !== 'regular') {
            tableHeader.innerHTML = `
                <tr class="bg-gray-100 text-sm uppercase text-gray-600">
                    <th class="p-4 border-b">Course</th>
                    <th class="p-4 border-b">Date</th>
                    <th class="p-4 border-b">Time</th>
                    <th class="p-4 border-b">Zoom Meeting</th>
                </tr>`;
        } else {
            tableHeader.innerHTML = `
                <tr class="bg-gray-100 text-sm uppercase text-gray-600">
                    <th class="p-4 border-b">Course</th>
                    <th class="p-4 border-b">Date</th>
                    <th class="p-4 border-b">Batch</th>
                    <th class="p-4 border-b">Time</th>
                </tr>`;
        }

        currentData.forEach(row => {
            if (currentProgram === 'regular') {
                table.innerHTML += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-4 font-bold text-blue-600">${row.COURSE}</td>
                        <td class="p-4">${row.EXDATE}</td>
                        <td class="p-4"><span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">${row.BATCH}</span></td>
                        <td class="p-4">${row.TIME}</td>
                    </tr>`;
            } else {
                // BCAOL format
                const zoomLink = row.Column7 ? `<a href="${row.Column7}" target="_blank" class="text-blue-600 hover:underline text-xs">Join Meeting</a>` : 'N/A';
                const meetingId = row.Column8 || 'N/A';
                table.innerHTML += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-4 font-bold text-blue-600">${row.Column4}</td>
                        <td class="p-4">${row.Column5}</td>
                        <td class="p-4">${row.Column6}</td>
                        <td class="p-4">
                            <div class="text-xs">
                                ${zoomLink}
                                <div class="text-gray-600 mt-1">ID: ${meetingId}</div>
                            </div>
                        </td>
                    </tr>`;
            }
        });
        resultDiv.classList.remove('hidden');
        lucide.createIcons();
    } else {
        noResult.classList.remove('hidden');
    }
}

function shareStudentResult() {
    const eno = document.getElementById('webStudentEnr').innerText;
    const name = document.getElementById('webStudentName').innerText;
    
    if (!eno || eno === '-') {
        alert("Please search for a student first.");
        return;
    }

    const shareUrl = window.location.origin + window.location.pathname + '?eno=' + eno;
    const programType = currentProgram === 'regular' ? 'Regular' : 'Online (BCAOL)';
    const shareText = `IGNOU Practical Date Sheet (${programType}) Dec 2025\nName: ${name}\nEnrollment: ${eno}\nCheck here: ${shareUrl}`;

    if (navigator.share) {
        navigator.share({
            title: 'IGNOU Practical Date Sheet',
            text: shareText,
            url: shareUrl
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareText)
            .then(() => alert('Result link copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    }
}

function downloadPDF() {
    if (currentData.length === 0) return;

    let rowsHtml = '';
    let tableHeader = '';
    let fileName = '';
    let studentName = '';
    let studentEnr = '';

    if (currentProgram === 'regular') {
        tableHeader = `
            <th style="padding: 10px; border: 1px solid #ccc; width: 20%; font-size: 12px; font-weight: bold; color: #333;">COURSE</th>
            <th style="padding: 10px; border: 1px solid #ccc; width: 25%; font-size: 12px; font-weight: bold; color: #333;">DATE</th>
            <th style="padding: 10px; border: 1px solid #ccc; width: 20%; font-size: 12px; font-weight: bold; color: #333;">BATCH</th>
            <th style="padding: 10px; border: 1px solid #ccc; width: 35%; font-size: 12px; font-weight: bold; color: #333;">TIME</th>`;
        
        studentName = currentData[0].NAME;
        studentEnr = currentData[0].ENRNO;
        
        currentData.forEach((row, index) => {
            const bg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
            rowsHtml += `
                <tr style="background-color: ${bg};">
                    <td style="padding: 10px; border: 1px solid #ccc; width: 20%;">${row.COURSE}</td>
                    <td style="padding: 10px; border: 1px solid #ccc; width: 25%;">${row.EXDATE}</td>
                    <td style="padding: 10px; border: 1px solid #ccc; width: 20%;">${row.BATCH}</td>
                    <td style="padding: 10px; border: 1px solid #ccc; width: 35%;">${row.TIME}</td>
                </tr>`;
        });
    } else {
        tableHeader = `
            <th style="padding: 10px; border: 1px solid #ccc; width: 25%; font-size: 12px; font-weight: bold; color: #333;">COURSE</th>
            <th style="padding: 10px; border: 1px solid #ccc; width: 25%; font-size: 12px; font-weight: bold; color: #333;">DATE</th>
            <th style="padding: 10px; border: 1px solid #ccc; width: 20%; font-size: 12px; font-weight: bold; color: #333;">TIME</th>
            <th style="padding: 10px; border: 1px solid #ccc; width: 30%; font-size: 12px; font-weight: bold; color: #333;">ZOOM ID</th>`;
        
        studentName = currentData[0].Column3;
        studentEnr = currentData[0].Column2;
        
        currentData.forEach((row, index) => {
            const bg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
            rowsHtml += `
                <tr style="background-color: ${bg};">
                    <td style="padding: 10px; border: 1px solid #ccc; width: 25%;">${row.Column4}</td>
                    <td style="padding: 10px; border: 1px solid #ccc; width: 25%;">${row.Column5}</td>
                    <td style="padding: 10px; border: 1px solid #ccc; width: 20%;">${row.Column6}</td>
                    <td style="padding: 10px; border: 1px solid #ccc; width: 30%;">${row.Column8 || 'N/A'}</td>
                </tr>`;
        });
    }

    const pdfContent = document.createElement('div');
    pdfContent.style.width = '750px';
    pdfContent.style.background = '#ffffff';
    pdfContent.style.padding = '30px';
    pdfContent.style.fontFamily = 'Arial, sans-serif';
    pdfContent.style.color = '#000000';
    
    const programType = currentProgram === 'regular' ? 'Regular Programme' : 'BCAOL - Online Programme';
    
    pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://delhizones.com/results/ignou-practical-search.html" style="font-size: 12px; font-weight: bold; color: #2563EB; text-decoration: underline;">
                www.delhizones.com/results/ignou-practical-search.html
            </a>
        </div>

        <div style="text-align: center; border-bottom: 2px solid #2563EB; padding-bottom: 15px; margin-bottom: 25px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: bold; margin: 0;">Free Student Utilities</p>
            <h1 style="font-size: 26px; font-weight: 900; color: #1e3a8a; margin: 5px 0;">IGNOU Practical Date Sheet</h1>
            <p style="font-size: 14px; color: #444;">Programme: ${programType} | Dec 2025</p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
            <p style="font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; margin: 0;">Student Details</p>
            <h2 style="font-size: 24px; font-weight: bold; color: #000; margin: 5px 0;">${studentName}</h2>
            <p style="font-size: 20px; font-weight: bold; color: #2563EB; font-family: monospace; margin: 0;">${studentEnr}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc; margin-bottom: 20px; table-layout: fixed;">
            <thead>
                <tr style="background-color: #f3f4f6; text-align: left;">
                    ${tableHeader}
                </tr>
            </thead>
            <tbody style="font-size: 14px;">
                ${rowsHtml}
            </tbody>
        </table>
    `;

    const opt = {
        margin: [10, 10],
        filename: `DateSheet_${studentEnr}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfContent).save();
}