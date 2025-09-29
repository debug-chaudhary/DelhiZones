import os
import json
import re
from pathlib import Path
import PyPDF2
import pdfplumber
import fitz  # PyMuPDF, imported as fitz
from flask import Flask, jsonify, render_template_string
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IGNOUPDFExtractor:
    def __init__(self, pdf_directory="D:/GIT demo/Delhizones"):
        self.pdf_directory = Path(pdf_directory)
        self.extracted_data = {} # This will be a cache for TOC and metadata
        self.app = Flask(__name__)
        self.setup_routes()
        
    def extract_table_of_contents(self, pdf_path):
        """Extract table of contents from PDF"""
        toc_items = []
        
        try:
            # PyMuPDF is generally best for reliable TOC extraction
            pdf_doc = fitz.open(pdf_path)
            toc = pdf_doc.get_toc()
            
            if toc:
                for item in toc:
                    level, title, page = item
                    if level == 1:  # Main chapters/units
                        toc_items.append({
                            'title': title.strip(),
                            'page': page,
                            'level': level
                        })
            
            pdf_doc.close()
            
        except Exception as e:
            logger.warning(f"PyMuPDF TOC extraction failed: {e}")
            
        # Fallback: Extract from text using patterns
        if not toc_items:
            toc_items = self.extract_toc_from_text(pdf_path)
            
        return toc_items
    
    def extract_toc_from_text(self, pdf_path):
        """Extract TOC by searching for patterns in text"""
        toc_items = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Check first 10 pages for TOC
                for page_num in range(min(10, len(pdf.pages))):
                    page = pdf.pages[page_num]
                    text = page.extract_text()
                    
                    if text:
                        # Look for patterns like "Unit 1", "Chapter 1", etc.
                        patterns = [
                            r'Unit\s+(\d+)[:\-\s]+(.+?)(?:\s+(\d+))?$',
                            r'Chapter\s+(\d+)[:\-\s]+(.+?)(?:\s+(\d+))?$',
                            r'(\d+\.)\s+(.+?)(?:\s+(\d+))?$'
                        ]
                        
                        for line in text.split('\n'):
                            line = line.strip()
                            if not line:
                                continue
                                
                            for pattern in patterns:
                                match = re.match(pattern, line, re.IGNORECASE)
                                if match:
                                    unit_num = match.group(1)
                                    title = match.group(2).strip()
                                    page_num_match = match.group(3) if len(match.groups()) > 2 else None
                                    
                                    if len(title) > 10:  # Filter out short matches
                                        toc_items.append({
                                            'title': f"Unit {unit_num}: {title}",
                                            'page': int(page_num_match) if page_num_match else page_num + 1,
                                            'level': 1
                                        })
                                        
        except Exception as e:
            logger.error(f"Text-based TOC extraction failed: {e}")
            
        return toc_items
    
    def extract_content_by_page_range(self, pdf_path, start_page, end_page=None):
        """Extract content from specific page range"""
        content = ""
        
        try:
            with fitz.open(pdf_path) as pdf_doc:
                if end_page is None:
                    end_page = min(start_page + 10, pdf_doc.page_count)
                
                for page_num in range(start_page - 1, min(end_page, pdf_doc.page_count)):
                    if page_num < len(pdf.pages):
                        page = pdf.pages[page_num]
                        page_text = page.extract_text()
                        if page_text:
                            content += f"\n--- Page {page_num + 1} ---\n"
                            content += page_text + "\n"
                            
        except Exception as e:
            logger.error(f"Content extraction failed: {e}")
            
        return content
    
    def process_pdf_file(self, pdf_path, subject_code):
        """Process a single PDF file"""
        logger.info(f"Processing {subject_code}: {pdf_path}")
        
        # Extract metadata
        metadata = self.extract_pdf_metadata(pdf_path)
        
        # Extract table of contents
        toc = self.extract_table_of_contents(pdf_path)
        
        # Store extracted data
        self.extracted_data[subject_code] = {
            'metadata': metadata,
            'toc': toc,
            'pdf_path': str(pdf_path),
            'total_pages': metadata.get('pages', 0)
        }
        
        return self.extracted_data[subject_code]
    
    def extract_pdf_metadata(self, pdf_path):
        """Extract basic metadata from PDF"""
        metadata = {}
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                metadata = {
                    'pages': len(pdf_reader.pages),
                    'title': pdf_reader.metadata.get('/Title', ''),
                    'author': pdf_reader.metadata.get('/Author', ''),
                    'creator': pdf_reader.metadata.get('/Creator', ''),
                }
                
        except Exception as e:
            logger.error(f"Metadata extraction failed: {e}")
            
        return metadata
    
    def scan_directory_for_pdfs(self):
        """Scan directory for IGNOU BCA PDF files"""
        pdf_files = {}
        
        if not self.pdf_directory.exists():
            logger.error(f"Directory {self.pdf_directory} does not exist")
            return pdf_files
            
        # Look for PDF files
        for pdf_file in self.pdf_directory.glob("*.pdf"):
            # Try to extract subject code from filename
            filename = pdf_file.stem
            
            # Common IGNOU patterns
            patterns = [
                r'(BCS-\d{3})',
                r'(MTE-\d{3})',
                r'(MCSL-\d{3})',
                r'(BCSL-\d{3})',
                r'(BEGAE-\d{3})',
            ]
            
            subject_code = None
            for pattern in patterns:
                match = re.search(pattern, filename.upper())
                if match:
                    subject_code = match.group(1)
                    break
            
            if not subject_code:
                # Use filename as subject code
                subject_code = filename.upper()[:10]
                
            pdf_files[subject_code] = pdf_file
            
        return pdf_files
    
    def process_all_pdfs(self):
        """Process all PDF files in the directory"""
        pdf_files = self.scan_directory_for_pdfs()
        
        logger.info(f"Found {len(pdf_files)} PDF files")
        
        for subject_code, pdf_path in pdf_files.items():
            try:
                self.process_pdf_file(pdf_path, subject_code)
                logger.info(f"Successfully processed {subject_code}")
            except Exception as e:
                logger.error(f"Failed to process {subject_code}: {e}")
                
        return self.extracted_data
    
    def setup_routes(self):
        """Setup Flask routes for API"""
        
        @self.app.route('/api/subjects')
        def get_subjects():
            """Get list of available subjects from the processed PDFs."""
            return jsonify(list(self.extracted_data.keys()))
        
        @self.app.route('/api/toc/<subject_code>')
        def get_toc(subject_code):
            """Get table of contents for a subject. Processes the PDF if not already cached."""
            if subject_code in self.extracted_data and 'toc' in self.extracted_data[subject_code]:
                return jsonify(self.extracted_data[subject_code]['toc'])
            return jsonify({'error': 'Subject not found'}), 404
        
        @self.app.route('/api/content/<subject_code>/<int:page>')
        def get_content(subject_code, page):
            """Get content for a specific page range"""
            if subject_code in self.extracted_data:
                pdf_path = Path(self.extracted_data[subject_code]['pdf_path'])
                content = self.extract_content_by_page_range(pdf_path, page, page + 5)
                
                return jsonify({
                    'content': content,
                    'page': page,
                    'subject': subject_code
                })
            return jsonify({'error': 'Subject not found'}), 404
        
        @self.app.route('/api/search/<subject_code>/<query>')
        def search_content(subject_code, query):
            """Search for content in a specific subject"""
            if subject_code in self.extracted_data:
                # This is a basic implementation
                # You can enhance this with better search algorithms
                results = []
                pdf_path = self.extracted_data[subject_code]['pdf_path']
                
                try:
                    with pdfplumber.open(pdf_path) as pdf:
                        for page_num, page in enumerate(pdf.pages):
                            text = page.extract_text()
                            if text and query.lower() in text.lower():
                                # Extract context around the search term
                                lines = text.split('\n')
                                for line_num, line in enumerate(lines):
                                    if query.lower() in line.lower():
                                        context_start = max(0, line_num - 2)
                                        context_end = min(len(lines), line_num + 3)
                                        context = '\n'.join(lines[context_start:context_end])
                                        
                                        results.append({
                                            'page': page_num + 1,
                                            'context': context,
                                            'line': line.strip()
                                        })
                                        
                except Exception as e:
                    logger.error(f"Search failed: {e}")
                
                return jsonify({'results': results, 'query': query})
            return jsonify({'error': 'Subject not found'}), 404
        
        @self.app.route('/')
        def index():
            """Serve the main library portal webpage."""
            portal_path = 'ignou-bca-resources/index.html'
            return render_template_string(open(portal_path).read() if os.path.exists(portal_path) else 
                                        '<h1>Error: Main portal file not found at ignou-bca-resources/index.html</h1>')
    
    def save_extracted_data(self, filename='extracted_data.json'):
        """Save extracted data to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                # Convert Path objects to strings for JSON serialization
                data_to_save = {}
                for subject, info in self.extracted_data.items():
                    data_to_save[subject] = {
                        'metadata': info['metadata'],
                        'toc': info['toc'],
                        'pdf_path': info['pdf_path'],
                        'total_pages': info['total_pages']
                    }
                json.dump(data_to_save, f, indent=2, ensure_ascii=False)
                logger.info(f"Data saved to {filename}")
        except Exception as e:
            logger.error(f"Failed to save data: {e}")
    
    def load_extracted_data(self, filename='extracted_data.json'):
        """Load previously extracted data"""
        try:
            if os.path.exists(filename):
                with open(filename, 'r', encoding='utf-8') as f:
                    self.extracted_data = json.load(f)
                logger.info(f"Data loaded from {filename}")
                return True
        except Exception as e:
            logger.error(f"Failed to load data: {e}")
        return False
    
    def run_server(self, host='localhost', port=5000, debug=True):
        """Run the Flask server"""
        self.app.run(host=host, port=port, debug=debug)


def main():
    """Main function to run the extractor"""
    
    # Initialize extractor with your PDF directory
    extractor = IGNOUPDFExtractor("D:/GIT demo/Delhizones")
    
    # Try to load previously extracted data
    if not extractor.load_extracted_data():
        print("No previous data found. Processing PDFs...")
        
        # Process all PDFs in the directory
        extracted_data = extractor.process_all_pdfs()
        
        if extracted_data:
            print(f"Successfully processed {len(extracted_data)} subjects:")
            for subject_code, data in extracted_data.items():
                print(f"  - {subject_code}: {len(data['toc'])} units, {data['total_pages']} pages")
            
            # Save extracted data for future use
            extractor.save_extracted_data()
        else:
            print("No PDF files found or processed successfully.")
            return
    else:
        print(f"Loaded data for {len(extractor.extracted_data)} subjects")
    
    # Start the web server
    print("\nStarting web server...")
    print("Visit http://localhost:5000 to access the website")
    print("\nAPI Endpoints:")
    print("  GET /api/subjects - List all subjects")
    print("  GET /api/toc/<subject_code> - Get table of contents")
    print("  GET /api/content/<subject_code>/<page> - Get content for page")
    print("  GET /api/search/<subject_code>/<query> - Search in subject")
    
    extractor.run_server()


if __name__ == "__main__":
    main()


# Additional utility functions

def batch_extract_specific_subjects(pdf_directory, subject_list):
    """Extract data for specific subjects only"""
    extractor = IGNOUPDFExtractor(pdf_directory)
    
    for subject_code in subject_list:
        pdf_files = list(Path(pdf_directory).glob(f"*{subject_code}*.pdf"))
        
        if pdf_files:
            extractor.process_pdf_file(pdf_files[0], subject_code)
            print(f"Processed {subject_code}")
        else:
            print(f"No PDF found for {subject_code}")
    
    return extractor.extracted_data


def extract_images_from_pdf(pdf_path, output_dir="extracted_images"):
    """Extract images from PDF (useful for diagrams in technical subjects)"""
    
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        pdf_doc = fitz.open(pdf_path)
        
        for page_num in range(pdf_doc.page_count):
            page = pdf_doc[page_num]
            image_list = page.get_images()
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                pix = fitz.Pixmap(pdf_doc, xref)
                
                if pix.n - pix.alpha < 4:  # GRAY or RGB
                    image_filename = f"{output_dir}/page_{page_num+1}_img_{img_index}.png"
                    pix.save(image_filename)
                    print(f"Saved image: {image_filename}")
                
                pix = None
        
        pdf_doc.close()
        print(f"Image extraction completed for {pdf_path}")
        
    except Exception as e:
        print(f"Image extraction failed: {e}")


def create_subject_mapping():
    """Create a mapping of IGNOU BCA subjects"""
    
    return {
        # Semester 1
        "BCS-011": "Computer Basics and PC Software",
        "BCS-012": "Basic Mathematics", 
        "BEGAE-182": "English Communication",
        
        # Semester 2
        "BCS-021": "C Language Programming",
        "BCS-022": "Assembly Language Programming", 
        "BCS-023": "Introduction to Database Management Systems",
        "MTE-001": "Calculus",
        "MTE-002": "Linear Algebra",
        "BCS-024": "Discrete Mathematics",
        
        # Semester 3
        "BCS-031": "Programming in C++",
        "BCS-032": "Object Oriented Programming using C++",
        "BCS-040": "Statistical Techniques",
        "BCS-041": "Fundamentals of Computer Networks", 
        "BCS-042": "Introduction to Algorithm Design",
        "MCSL-016": "Internet Concepts and Web Design",
        
        # Semester 4
        "BCS-051": "Introduction to Software Engineering",
        "BCS-052": "Network Programming and Administration",
        "BCS-053": "Web Programming",
        "BCS-054": "Computer Oriented Numerical Techniques",
        "BCS-055": "Business Communication",
        "MCSL-017": "C and Assembly Language Programming",
        
        # Semester 5
        "BCS-061": "TCP/IP Programming",
        "BCS-062": "E-Commerce",
        "MCSL-045": "UNIX and DBMS Programming",
        "BCSL-043": "Java Programming",
        "BCSL-044": "Statistical Computing",
        "BCSL-045": "Algorithm Design and Analysis",
        
        # Semester 6
        "BCSP-064": "Project",
        "BCS-063": "Introduction to System Software",
        "BCSL-063": "System Software Lab",
        "MCSL-054": "Advanced Internet Technologies"
    }


# Installation requirements
"""
To run this script, you need to install the following packages:

pip install PyPDF2 pdfplumber PyMuPDF flask pathlib

For better OCR support (if you have scanned PDFs):
pip install pytesseract pdf2image pillow

Usage:
1. Place your IGNOU BCA PDF files in the specified directory
2. Run: python pdf_extractor.py
3. Visit http://localhost:5000 to access the web interface
4. The script will automatically extract table of contents and content from PDFs
"""