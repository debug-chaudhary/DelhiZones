import fitz  # PyMuPDF
import os
import json

def extract_toc_from_pdf(pdf_path):
    """
    Extracts the Table of Contents (bookmarks) from a PDF file.
    
    Args:
        pdf_path (str): The path to the PDF file.

    Returns:
        list: A list of dictionaries, where each dictionary represents a TOC item
              with 'title' and 'page' number. Returns an empty list if no TOC is found.
    """
    toc_list = []
    try:
        doc = fitz.open(pdf_path)
        toc = doc.get_toc()  # This extracts the document's bookmarks
        doc.close()

        if not toc:
            print(f"  - No TOC (bookmarks) found in {os.path.basename(pdf_path)}.")
            return []

        for level, title, page in toc:
            # We can ignore the 'level' for this use case
            toc_list.append({"title": title.strip(), "page": page})
        
        return toc_list

    except Exception as e:
        print(f"  - Error processing {os.path.basename(pdf_path)}: {e}")
        return []

def process_ebooks(root_dir='.', ebooks_subpath='downloads/ebooks'):
    """
    Scans for PDF ebooks in semester folders and creates corresponding toc.json files.

    Args:
        root_dir (str): The root directory of the project.
        ebooks_subpath (str): The relative path from the root to the ebooks directory.
    """
    ebooks_path = os.path.join(root_dir, ebooks_subpath)
    if not os.path.exists(ebooks_path):
        print(f"Error: Ebooks directory not found: {ebooks_path}")
        print(f"  - Current working directory: {os.getcwd()}")
        print(f"  - Please check the path or run from the project root.")
        return

    print("Starting PDF processing...")
    print(f"Scanning for PDFs in: {ebooks_path}")


    for semester_dir in os.listdir(ebooks_path):
        semester_path = os.path.join(ebooks_path, semester_dir)
        if os.path.isdir(semester_path) and semester_dir.lower().startswith('semester'):
            print(f"\nProcessing {semester_dir}...")
            
            # The output directory for the JSON files
            output_dir = os.path.join(root_dir, semester_dir, 'toc')
            try:
                os.makedirs(output_dir, exist_ok=True)
            except OSError as e:
                print(f"  - Error creating directory {output_dir}: {e}")
                continue

            for filename in os.listdir(semester_path):
                if filename.lower().endswith('.pdf'):
                    pdf_path = os.path.join(semester_path, filename)
                    try:
                        toc_data = extract_toc_from_pdf(pdf_path)
                        if toc_data:
                            subject_code = os.path.splitext(filename)[0]
                            json_path = os.path.join(output_dir, f"{subject_code.lower()}.json")
                            with open(json_path, 'w') as f:
                                json.dump(toc_data, f, indent=2)
                            print(f"  - Successfully created {os.path.relpath(json_path, root_dir)}")
                    except Exception as e:
                        print(f"  - Error processing file {filename}: {e}")

if __name__ == "__main__":
    process_ebooks()
    print("\nPDF processing complete.")