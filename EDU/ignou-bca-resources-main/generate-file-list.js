const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, 'ignou-bca-resources');
const outputFile = path.join(__dirname, 'file-list.json');

function getFilePaths(dir, filelist = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getFilePaths(filePath, filelist);
        } else if (file.endsWith('.pdf') || file.endsWith('.html')) {
            // Create a relative path from the project root
            const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
            filelist.push(relativePath);
        }
    });
    return filelist;
}

const filePaths = getFilePaths(resourcesDir);
fs.writeFileSync(outputFile, JSON.stringify(filePaths, null, 2));
console.log(`✅ File list generated successfully at ${outputFile}`);
