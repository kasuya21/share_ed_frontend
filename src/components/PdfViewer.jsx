import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// กำหนด Worker สำหรับ Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);

  // ปรับขนาดความกว้างตามหน้าจอ
  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(Math.min(window.innerWidth * 0.85, 800));
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
      <div className="w-full overflow-auto flex justify-center bg-white rounded-xl shadow-sm p-4 min-h-[400px] items-center">
        {fileUrl ? (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-slate-500 flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              กำลังโหลดเอกสาร PDF...
            </div>}
            error={<div className="text-red-500 bg-red-50 px-4 py-3 rounded-lg text-sm border border-red-100">ไม่สามารถโหลดไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง</div>}
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg rounded-md overflow-hidden"
              width={containerWidth} 
            />
          </Document>
        ) : (
          <div className="text-slate-400">ยังไม่มีไฟล์เอกสาร</div>
        )}
      </div>

      {numPages && (
        <div className="flex items-center gap-6 mt-6 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200">
          <button
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <p className="text-sm font-semibold text-slate-700 min-w-[80px] text-center">
            {pageNumber} <span className="text-slate-400 font-normal mx-1">/</span> {numPages}
          </p>
          
          <button
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
            disabled={pageNumber >= numPages}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
