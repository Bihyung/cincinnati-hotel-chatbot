import { useState, useRef, useCallback } from 'react';
import { uploadDocument, getDocumentStatus } from '../services/api';

const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf'];
const ALLOWED_EXT = '.pdf';

function FileUploadSection({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [documentInfo, setDocumentInfo] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const inputRef = useRef(null);

  // ── File validation ───────────────────────────────────────────────────────

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only PDF files are accepted.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File size must not exceed ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  // ── Drag & drop handlers ─────────────────────────────────────────────────

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const processFile = (file) => {
    const err = validateFile(file);
    if (err) {
      setErrorMessage(err);
      setSelectedFile(null);
      setUploadStatus('error');
      return;
    }
    setSelectedFile(file);
    setErrorMessage('');
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const result = await uploadDocument(selectedFile, (pct) => {
        setUploadProgress(pct);
      });
      setUploadStatus('success');
      setDocumentInfo(result?.document || { name: selectedFile.name });
      onUploadSuccess?.(result);
    } catch (err) {
      setUploadStatus('error');
      setErrorMessage(err.message || 'Upload failed. Please try again.');
    }
  };

  // ── Fetch current document status ─────────────────────────────────────────

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await getDocumentStatus();
      setDocumentInfo(data?.document || null);
    } catch {
      // Non-critical – silently ignore
    } finally {
      setLoadingStatus(false);
    }
  };

  // Fetch once on first render
  useState(() => { fetchStatus(); });

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Click or drag and drop to upload a PDF"
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-primary-500 bg-primary-50 scale-[1.01]'
            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_EXT}
          onChange={handleInputChange}
          className="sr-only"
          aria-hidden="true"
        />

        {dragging ? (
          <>
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <p className="text-primary-600 font-semibold">Drop the PDF here</p>
          </>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">
              Drag & drop your PDF here, or{' '}
              <span className="text-primary-600 underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF only · max {MAX_SIZE_MB} MB</p>
          </>
        )}
      </div>

      {/* Selected file preview */}
      {selectedFile && uploadStatus !== 'success' && (
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex-shrink-0 w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-400">{formatSize(selectedFile.size)}</p>
          </div>
          <button onClick={resetUpload} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Remove file">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload progress bar */}
      {uploadStatus === 'uploading' && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Uploading…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {uploadStatus === 'error' && errorMessage && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success message */}
      {uploadStatus === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Document uploaded and processed successfully.</span>
          <button
            onClick={resetUpload}
            className="ml-auto text-green-600 hover:text-green-800 underline text-xs"
          >
            Upload another
          </button>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && uploadStatus === 'idle' && (
        <button
          onClick={handleUpload}
          className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Upload Document
        </button>
      )}

      {/* Current document info */}
      {documentInfo && (
        <div className="mt-2 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Current Document</p>
            <button
              onClick={fetchStatus}
              disabled={loadingStatus}
              className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors disabled:opacity-50"
              aria-label="Refresh document status"
            >
              {loadingStatus ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </div>
          <p className="text-sm font-medium text-indigo-900 truncate">{documentInfo.name || documentInfo.filename || 'Hotel document'}</p>
          {documentInfo.uploadedAt && (
            <p className="text-xs text-indigo-500 mt-0.5">
              Uploaded: {new Date(documentInfo.uploadedAt).toLocaleString()}
            </p>
          )}
          {documentInfo.status && (
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              documentInfo.status === 'ready' ? 'bg-green-100 text-green-700' :
              documentInfo.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {documentInfo.status}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUploadSection;
