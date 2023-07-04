""" 

This file is used to convert a docx file to a pdf file. 
The paths for where the word docs are, and pdfs go are as follows:

data
├── word_reports
    ├── datetime_booth_printout.docx
├── pdf_reports
    ├── datetime_booth_printout.pdf

"""

import docx2pdf
import win32com.client

def convert_docx_to_pdf(docx_path, pdf_path):
    """ Converts a docx file to a pdf file.

    Args:
        docx_path (str): Path to the docx file.
        pdf_path (str): Path to the pdf file.
    """

    try:
        win32com.client.pythoncom.CoInitialize() # initialize com, seems to help with the conversion
        docx2pdf.convert(docx_path, pdf_path)

    except Exception as e:
        print("Error converting docx to pdf: ", e)

# Test code

# docx_path = 'backend/data/word_reports/20230531_1304_booth_printout.docx'
# pdf_path =  'backend/data/reports/20230531_1304_booth_printout.pdf'

# convertSuccess = convert_docx_to_pdf(docx_path, pdf_path)
# print(convertSuccess)