import React, { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [highlights, setHighlights] = useState([]);
  const containerRef = useRef(null);

  useEffect(()=>{
    // load file url (we'll request backend route which streams file)
    setFileUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/pdfs/file/${uuid}`);
    loadHighlights();
  }, [uuid]);

  const loadHighlights = async () => {
    try {
      const res = await API.get('/highlights/' + uuid);
      setHighlights(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const nextPage = () => setPageNumber(p => Math.min(p+1, numPages));
  const prevPage = () => setPageNumber(p => Math.max(1, p-1));

  const onMouseUpOnPage = async (e, pageno) => {
    try {
      const sel = window.getSelection();
      const text = sel.toString().trim();
      if (!text) return;
      const range = sel.getRangeAt(0);
      const rects = Array.from(range.getClientRects()).map(r => {
        const pageNode = document.getElementById('page-container-' + pageno);
        const pageRect = pageNode.getBoundingClientRect();
        return {
          x: (r.left - pageRect.left) / pageRect.width,
          y: (r.top - pageRect.top) / pageRect.height,
          w: r.width / pageRect.width,
          h: r.height / pageRect.height
        };
      });
      // clear selection
      sel.removeAllRanges();
      // save to backend
      const payload = { page: pageno, text, rects };
      const res = await API.post('/highlights/' + uuid, payload);
      setHighlights(h => [...h, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const renderHighlightsForPage = (pageno, pageWidth, pageHeight) => {
    const pageH = highlights.filter(h => h.page === pageno);
    return pageH.map(h => (
      h.rects.map((r, idx) => (
        <div key={h._id + '-' + idx}
          className="highlight-overlay"
          style={{
            left: (r.x * 100) + '%',
            top: (r.y * 100) + '%',
            width: (r.w * 100) + '%',
            height: (r.h * 100) + '%'
          }}
        />
      ))
    ));
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <button className="btn" onClick={()=>navigate('/dashboard')}>Back</button>
        </div>
        <h3>PDF Viewer</h3>
        <div>
          <button className="btn" onClick={()=>setScale(s => s - 0.1)}>−</button>
          <button className="btn" onClick={()=>setScale(s => s + 0.1)} style={{marginLeft:6}}>+</button>
        </div>
      </div>

      <div style={{marginTop:10}}>
        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} width={800 * scale} renderTextLayer={true} renderAnnotationLayer={false}
            onLoadSuccess={(page) => { /* noop */ }}
            renderMode="canvas"
          >
            {/* nothing inside - we will overlay highlights using container */}
          </Page>
        </Document>
        <div style={{marginTop:8}}>
          <button className="btn" onClick={prevPage}>Previous</button>
          <span style={{margin:'0 10px'}}>Page {pageNumber} / {numPages || '?'}</span>
          <button className="btn" onClick={nextPage}>Next</button>
        </div>
      </div>

      {/* We'll render a hidden series of page containers to capture selection and overlays */}
      <div ref={containerRef}>
        {Array.from({length: numPages || 0}).map((_, idx) => {
          const p = idx + 1;
          return (
            <div key={p} id={'page-container-' + p} className="pdf-page"
              onMouseUp={(e) => onMouseUpOnPage(e, p)}
              style={{ height: 0, overflow: 'visible' }}>
              {/* overlay highlights positioned relative to container */}
              <div style={{ position: 'relative', width: '800px', height: '1px' }}>
                {renderHighlightsForPage(p)}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
