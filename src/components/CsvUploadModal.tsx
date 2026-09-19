import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  X, 
  AlertCircle, 
  Check, 
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { parseItineraryCSV, SAMPLE_CSV_TEMPLATE } from '../utils/csvParser';
import { ItineraryData } from '../types';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadItinerary: (itinerary: ItineraryData) => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onLoadItinerary,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'template'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [tripTitle, setTripTitle] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Please select a valid .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileName(file.name);
      setFileContent(content);
      setError(null);
      if (!tripTitle) {
        setTripTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    const rawCSV = activeTab === 'upload' ? fileContent : pastedText;
    if (!rawCSV || !rawCSV.trim()) {
      setError('Please provide CSV itinerary content');
      return;
    }

    try {
      const parsed = parseItineraryCSV(rawCSV, tripTitle.trim() || 'My Holiday Itinerary');
      if (parsed.items.length === 0) {
        setError('Could not identify any dated itinerary items. Please check that your CSV has a "Date" column with valid dates (e.g. YYYY-MM-DD or DD/MM/YYYY).');
        return;
      }

      onLoadItinerary(parsed);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to parse CSV file');
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'holiday_itinerary_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full border-t sm:border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Mobile drag handle */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2 sm:hidden" />
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Load Holiday Itinerary CSV
              </h3>
              <p className="text-xs text-slate-500">
                Upload your trip schedule or paste CSV text
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'paste'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Paste Text
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'template'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            CSV Format Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Trip Title input */}
          {activeTab !== 'template' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trip Name / Title (Optional)
              </label>
              <input
                type="text"
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                placeholder="e.g. Summer Holiday 2026: Japan Adventure"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-teal-500 bg-teal-50/50'
                    : fileName
                    ? 'border-emerald-400 bg-emerald-50/20'
                    : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                {fileName ? (
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      File Selected
                    </span>
                    <p className="text-sm font-semibold text-slate-800">{fileName}</p>
                    <p className="text-xs text-slate-500 mt-1">Click or drag another file to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Drop your itinerary CSV file here, or <span className="text-teal-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports comma-separated .csv files
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PASTE */}
          {activeTab === 'paste' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Paste raw CSV content
              </label>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => { setPastedText(e.target.value); setError(null); }}
                placeholder="Date,Time,Location,Activity,Category,Accommodation,Notes,Cost&#10;2026-09-18,09:00,Tokyo,Shibuya Sky,Sightseeing,Cerulean Tower,Booked ticket,$18"
                className="w-full font-mono text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          )}

          {/* TAB 3: TEMPLATE GUIDE */}
          {activeTab === 'template' && (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-teal-600" />
                  <span>Recognized CSV Columns</span>
                </div>
                <p className="text-slate-600 mb-2">
                  The parser is flexible and auto-detects common column headers:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li><strong>Date</strong> (required): YYYY-MM-DD or DD/MM/YYYY</li>
                  <li><strong>Time</strong> (optional): e.g. "09:30", "14:00 - 16:00"</li>
                  <li><strong>Location</strong> or <strong>City</strong>: e.g. "Tokyo (Shibuya)"</li>
                  <li><strong>Activity</strong> or <strong>Event</strong>: Name of the activity</li>
                  <li><strong>Category</strong>: Flight, Transport, Hotel, Sightseeing, Food, Activity</li>
                  <li><strong>Accommodation</strong> or <strong>Hotel</strong>: Tonight's lodging</li>
                  <li><strong>Notes</strong>: Booking confirmation codes, tips, details</li>
                  <li><strong>Cost</strong>: e.g. "$25", "¥3000", "€15"</li>
                </ul>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={downloadTemplate}
            className="text-xs text-slate-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample CSV</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            {activeTab !== 'template' && (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition"
              >
                Load Itinerary
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
