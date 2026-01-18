let examDatabase = [];
let currentData = [];

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loadingMsg');
    if(loader) loader.classList.remove('hidden');

    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            examDatabase = data;
            if(loader) loader.classList.add('hidden');
        })
        .catch(err => {
            console.error(err);
            if(loader) loader.innerText = "Error loading database.";
        });

    lucide.createIcons();
    
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') findSchedule();
    });
});

function findSchedule() {
    const val = document.getElementById('searchInput').value.trim();
    const table = document.getElementById('webTableBody');
    const resultDiv = document.getElementById('webResultContainer');
    const noResult = document.getElementById('noResultMsg');
    
    table.innerHTML = '';
    resultDiv.classList.add('hidden');
    noResult.classList.add('hidden');

    if (!val) { alert("Please enter Enrollment No."); return; }

    currentData = examDatabase.filter(s => String(s.ENRNO).trim() == val);

    if (currentData.length > 0) {
        document.getElementById('webStudentName').innerText = currentData[0].NAME;
        document.getElementById('webStudentEnr').innerText = currentData[0].ENRNO;

        currentData.forEach(row => {
            table.innerHTML += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-4 font-bold text-blue-600">${row.COURSE}</td>
                    <td class="p-4">${row.EXDATE}</td>
                    <td class="p-4"><span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">${row.BATCH}</span></td>
                    <td class="p-4">${row.TIME}</td>
                </tr>`;
        });
        resultDiv.classList.remove('hidden');
        lucide.createIcons();
    } else {
        noResult.classList.remove('hidden');
    }
}

function shareResult() {
    const shareData = {
        title: 'IGNOU Practical Date Sheet',
        text: 'Check your IGNOU Practical Exam Schedule for DPG College (38044) here:',
        url: 'https://delhizones.com/results/ignou-practical-search.html'
    };

    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard! Share it with your friends.");
    }
}

function downloadPDF() {
    if (currentData.length === 0) return;

    let rowsHtml = '';
    currentData.forEach((row, index) => {
        // Alternating row colors for better readability
        const bg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        rowsHtml += `
            <tr style="background-color: ${bg};">
                <td style="padding: 10px; border: 1px solid #ccc; width: 20%;">${row.COURSE}</td>
                <td style="padding: 10px; border: 1px solid #ccc; width: 25%;">${row.EXDATE}</td>
                <td style="padding: 10px; border: 1px solid #ccc; width: 20%;">${row.BATCH}</td>
                <td style="padding: 10px; border: 1px solid #ccc; width: 35%;">${row.TIME}</td>
            </tr>`;
    });

    const pdfContent = document.createElement('div');
    pdfContent.style.width = '750px';
    pdfContent.style.background = '#ffffff';
    pdfContent.style.padding = '30px';
    pdfContent.style.fontFamily = 'Arial, sans-serif'; // Cleaner font
    pdfContent.style.color = '#000000';
    
    pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://delhizones.com/results/ignou-practical-search.html" style="font-size: 12px; font-weight: bold; color: #2563EB; text-decoration: underline;">
                www.delhizones.com/results/ignou-practical-search.html
            </a>
        </div>

        <div style="text-align: center; border-bottom: 2px solid #2563EB; padding-bottom: 15px; margin-bottom: 25px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: bold; margin: 0;">Free Student Utilities</p>
            <h1 style="font-size: 26px; font-weight: 900; color: #1e3a8a; margin: 5px 0;">IGNOU Practical Date Sheet</h1>
            <p style="font-size: 14px; color: #444;">Centre: 38044 (DPG Degree College) | Dec 2025</p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
            <p style="font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; margin: 0;">Student Details</p>
            <h2 style="font-size: 24px; font-weight: bold; color: #000; margin: 5px 0;">${currentData[0].NAME}</h2>
            <p style="font-size: 20px; font-weight: bold; color: #2563EB; font-family: monospace; margin: 0;">${currentData[0].ENRNO}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc; margin-bottom: 20px; table-layout: fixed;">
            <thead>
                <tr style="background-color: #f3f4f6; text-align: left;">
                    <th style="padding: 10px; border: 1px solid #ccc; width: 20%; font-size: 12px; font-weight: bold; color: #333;">COURSE</th>
                    <th style="padding: 10px; border: 1px solid #ccc; width: 25%; font-size: 12px; font-weight: bold; color: #333;">DATE</th>
                    <th style="padding: 10px; border: 1px solid #ccc; width: 20%; font-size: 12px; font-weight: bold; color: #333;">BATCH</th>
                    <th style="padding: 10px; border: 1px solid #ccc; width: 35%; font-size: 12px; font-weight: bold; color: #333;">TIME</th>
                </tr>
            </thead>
            <tbody style="font-size: 14px;">
                ${rowsHtml}
            </tbody>
        </table>
    `;

    const opt = {
        margin: [10, 10], // Top/Bottom margin
        filename: `DateSheet_${currentData[0].ENRNO}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfContent).save();
}