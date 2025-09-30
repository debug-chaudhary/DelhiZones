#!/usr/bin/env python3
"""
Setup Script for IGNOU BCA PDF Website
This script helps you set up the complete system step by step.
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 6):
        print("❌ Python 3.6 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_requirements():
    """Install required Python packages"""
    requirements = [
        'PyPDF2',
        'pdfplumber', 
        'PyMuPDF',
        'flask',
        'pathlib'
    ]
    
    print("\n📦 Installing required packages...")
    
    for package in requirements:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ {package} installed successfully")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")
            return False
    
    return True

def create_directory_structure():
    """Create necessary directories"""
    directories = [
        'templates',
        'static',
        'extracted_data',
        'pdfs'
    ]
    
    print("\n📁 Creating directory structure...")
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created {directory}/ directory")

def create_config_file():
    """Create configuration file"""
    config = {
        "pdf_directory": "D:/GIT demo/Delhizones",
        "server": {
            "host": "localhost",
            "port": 5000,
            "debug": True
        },
        "subjects": {
            "BCS-011": "Computer Basics and PC Software",
            "BCS-021": "C Language Programming", 
            "BCS-031": "Programming in C++",
            "BCS-041": "Fundamentals of Computer Networks"
        }
    }
    
    with open('config.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✅ Created config.json")

def create_run_script():
    """Create a simple run script"""
    
    run_script = '''#!/usr/bin/env python3
"""
Quick start script for IGNOU BCA PDF website
"""

import sys
import os
from pathlib import Path

# Add current directory to Python path
sys.path.append(os.path.dirname(__file__))

try:
    from pdf_extractor import IGNOUPDFExtractor
    
    def main():
        print("🚀 Starting IGNOU BCA PDF Website...")
        print("=" * 50)
        
        # Initialize extractor
        pdf_dir = input("Enter PDF directory path (or press Enter for default): ").strip()
        if not pdf_dir:
            pdf_dir = "D:/GIT demo/Delhizones"
        
        if not Path(pdf_dir).exists():
            print(f"❌ Directory {pdf_dir} does not exist!")
            print("Please create the directory and place your PDF files there.")
            return
        
        extractor = IGNOUPDFExtractor(pdf_dir)
        
        # Check if we have cached data
        if not extractor.load_extracted_data():
            print("🔄 Processing PDF files...")
            data = extractor.process_all_pdfs()
            
            if data:
                print(f"✅ Processed {len(data)} subjects")
                extractor.save_extracted_data()
            else:
                print("⚠️  No PDF files found")
        else:
            print(f"✅ Loaded {len(extractor.extracted_data)} subjects from cache")
        
        print("🌐 Starting web server...")
        print("Visit: http://localhost:5000")
        print("Press Ctrl+C to stop")
        
        try:
            extractor.run_server()
        except KeyboardInterrupt:
            print("\\n👋 Server stopped")
    
    if __name__ == "__main__":
        main()

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you have run the setup script first!")
'''
    
    with open('run.py', 'w') as f:
        f.write(run_script)
    
    print("✅ Created run.py")

def create_html_template():
    """Create the HTML template file"""
    
    # The HTML content is already in the artifact
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IGNOU BCA Study Materials</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <!-- HTML content from the artifact -->
    <div id="app">
        <h1>IGNOU BCA PDF Website</h1>
        <p>Please run the Python server to see the full interface.</p>
    </div>
    <script src="/static/app.js"></script>
</body>
</html>'''
    
    with open('templates/index.html', 'w') as f:
        f.write(html_content)
    
    print("✅ Created templates/index.html")

def check_pdf_directory():
    """Check if PDF directory exists and has files"""
    pdf_dir = Path("D:/GIT demo/Delhizones")
    
    print(f"\n📂 Checking PDF directory: {pdf_dir}")
    
    if not pdf_dir.exists():
        print("❌ PDF directory does not exist")
        print("Please create the directory and place your IGNOU BCA PDF files there")
        return False
    
    pdf_files = list(pdf_dir.glob("*.pdf"))
    
    if not pdf_files:
        print("⚠️  No PDF files found in directory")
        print("Please place your IGNOU BCA PDF files in the directory")
        return False
    
    print(f"✅ Found {len(pdf_files)} PDF files:")
    for pdf in pdf_files[:5]:  # Show first 5 files
        print(f"   - {pdf.name}")
    
    if len(pdf_files) > 5:
        print(f"   ... and {len(pdf_files) - 5} more files")
    
    return True

def main():
    """Main setup function"""
    
    print("🎓 IGNOU BCA PDF Website Setup")
    print("=" * 40)
    
    # Step 1: Check Python version
    check_python_version()
    
    # Step 2: Install requirements
    if not install_requirements():
        print("❌ Failed to install requirements")
        return
    
    # Step 3: Create directory structure
    create_directory_structure()
    
    # Step 4: Create configuration files
    create_config_file()
    create_run_script()
    create_html_template()
    
    # Step 5: Check PDF directory
    pdf_exists = check_pdf_directory()
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed!")
    print("=" * 50)
    
    print("\nNext steps:")
    print("1. Place your IGNOU BCA PDF files in: D:/GIT demo/Delhizones")
    print("2. Copy the pdf_extractor.py script to this directory")
    print("3. Run: python run.py")
    print("4. Visit: http://localhost:5000")
    
    if not pdf_exists:
        print("\n⚠️  Important: Make sure to add PDF files before running!")
    
    print("\n📝 Files created:")
    print("   - config.json (configuration)")
    print("   - run.py (startup script)")
    print("   - templates/index.html (web interface)")
    print("   - Directory structure for the project")

if __name__ == "__main__":
    main()