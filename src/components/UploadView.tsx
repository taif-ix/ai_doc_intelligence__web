import { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface UploadViewProps {
  onAnalyze: (fileName: string, textContent: string, file?: File) => Promise<void>;
  isAnalyzing: boolean;
}

export function UploadView({ onAnalyze, isAnalyzing }: UploadViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [errorText, setErrorText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Standard legal samples for delightful one-click testing
  const SAMPLES = {
    nda: {
      name: 'Mutual_NDA_Standard.txt',
      text: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of June 19, 2026 ("Effective Date"), by and between Alpha Technologies Inc. ("Alpha") and Beta Solutions Corp. ("Beta").

1. Purpose. The parties wish to explore a potential business relationship concerning joint cloud infrastructure configuration (the "Relationship"). In connection with this Relationship, each party may disclose to the other certain proprietary or confidential technical and business information.

2. Confidential Information. "Confidential Information" means any information disclosed by one party ("Disclosing Party") to the other ("Receiving Party") that is marked as "Confidential" or "Proprietary" at the time of disclosure, or which should reasonably be understood to be confidential given the circumstances. 

3. Exclusions. Confidential Information does not include information that: (a) is or becomes publicly known through no breach of this Agreement; (b) was already in the Receiving Party’s possession without restriction prior to disclosure; (c) is independently developed by the Receiving Party without reference to or reliance on the Disclosing Party’s Confidential Information; or (d) is approved for release in writing.

4. Confidentiality Survival. Survival terms for non-disclosure obligations shall bind both parties for a period of five (5) years from the date of disclosure. Trade secrets shall be maintained as confidential indefinitely under governing statutes.

5. Limitation of Liability. NEITHER PARTY SHALL BE LIABLE UNDER THIS ENGAGEMENT FOR ANY INDIRECT, CONSEQUENTIAL, OR SPECIAL CLAIMS ARISING FROM NEGLIGENCE, CAPPED STRICTLY AT REAL DIRECT INVOICED REVENUES.`
    },
    employment: {
      name: 'Executive_Employment_Agreement_Restrictive.txt',
      text: `EXECUTIVE EMPLOYMENT AGREEMENT

This Executive Employment Agreement ("Agreement") is dated as of June 15, 2026, by and between Premier Tech Holdings LLC ("Company") and Jane Doe, an individual ("Employee").

1. Position and Duties. Employee shall serve as VP of Engineering, reporting strictly to the Board. Employee agrees to devote their full working time and utmost attention to the business affairs of the Company.

2. Intellectual Property Assignment. Employee hereby assigns, transfers, and conveys to the Company all right, title, and interest in and to any and all inventions, source code, designs, documentation, and web portals conceived or developed by Employee during their term of employment, including those developed outside working hours, during weekends, on personal mobile devices, or using private computer networks, whether or not such creations relate to the core scope of Company business.

3. Restrictive Post-Employment Non-Compete. Employee agrees that during their employment and for a period of five (5) years following termination for any reason, Employee shall not, directly or indirectly, engage in, consult for, advise, or hold equity in any software development business, corporate agency, or startup operating anywhere in North America or Europe.

4. Unilateral Commission Alteration. The Company reserves the unilateral right, in its sole executive judgment, to modify, reduce, defer, or cancel calculated sales performance commissions or quarterly target bonuses at any point preceding physical deposit payout.

5. Governing Law. This Agreement shall be construed, interpreted, and governed by the laws of the State of Delaware, without regard to conflict of laws principles.`
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    setSelectedFiles(files);
    setFileName(files.length === 1 ? files[0].name : `${files.length} files selected`);
    setErrorText('');

    if (files.length === 1 && /\.(txt|md)$/i.test(files[0].name)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setTextContent(text || '');
      };
      reader.readAsText(files[0]);
    } else {
      setTextContent('');
    }
  };

  const loadSample = (type: 'nda' | 'employment') => {
    const sample = SAMPLES[type];
    setFileName(sample.name);
    setTextContent(sample.text);
    setSelectedFiles([]);
    setErrorText('');
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmitAnalysis = async () => {
    if (!fileName && selectedFiles.length === 0) {
      setErrorText('Please specify a file name, upload files, or select one of the testing samples.');
      return;
    }
    if (selectedFiles.length === 0 && !textContent.trim()) {
      setErrorText('Please provide or paste the contract text content before analyzing.');
      return;
    }

    setErrorText('');
    setActiveStep(1);

    // Simulate stepping milestones visually for premium feel
    const stepInterval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= 3) {
          clearInterval(stepInterval);
          return 3;
        }
        return prev + 1;
      });
    }, 1500);

    try {
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await onAnalyze(file.name, '', file);
        }
      } else {
        await onAnalyze(fileName, textContent);
      }
      clearInterval(stepInterval);
      setActiveStep(3);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setErrorText(err instanceof Error ? err.message : 'Server analysis failed. Please verify API configuration.');
    }
  };

  return (
    <div id="upload-view-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pb-12">
      {/* Upload & Form Block */}
      <div id="upload-form-column" className="lg:col-span-2 space-y-6">
        <div id="upload-main-card" className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] space-y-6">
          <div id="upload-card-header">
            <h2 className="text-xl font-bold text-[#191B23]">Upload New Agreement</h2>
            <p className="text-xs text-[#737686] mt-1 font-medium">
              Supports PDF, DOC, DOCX, TXT, or copying the clauses text directly.
            </p>
          </div>

          {/* Drag and Drop Zone */}
          <div
            id="drag-and-drop-container"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerUploadClick}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              dragActive 
                ? 'border-[#2563EB] bg-[#EBF2FE]/30' 
                : 'border-[#C3C6D7] hover:border-[#2563EB] bg-slate-50/60 hover:bg-[#F8FAFC]'
            }`}
          >
            <input
              id="file-hidden-input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".txt,.md,.pdf,.doc,.docx"
              multiple
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-[#EBF2FE] flex items-center justify-center text-[#004AC6] mb-3 shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#191B23]">
              Drag and drop file here, or <span className="text-[#2563EB] hover:underline">browse files</span>
            </p>
            <p className="text-[10px] text-[#737686] font-medium mt-1">
              Supports PDF, DOCX, DOC, TXT
            </p>

            {fileName && (
              <div id="attached-file-badge" className="mt-4 px-3 py-1.5 bg-[#EBF2FE] border border-[#004AC6]/15 rounded-lg flex items-center gap-2 text-[#004AC6] max-w-md text-xs font-semibold">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{fileName}</span>
              </div>
            )}

            {selectedFiles.length > 1 && (
              <div className="mt-3 w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-left">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#737686] mb-1">
                  Files queued
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar">
                  {selectedFiles.map((file) => (
                    <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center gap-2 text-xs text-[#434655]">
                      <FileText className="w-3.5 h-3.5 text-[#004AC6] flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* pasted textarea form */}
          <div id="paste-textarea-form" className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#191B23] uppercase tracking-wider">
                Or Paste Agreement Text
              </label>
              <span className="text-[10px] text-[#737686] font-semibold">{textContent.length} characters</span>
            </div>
            {!fileName && (
              <div className="flex gap-2 mb-2">
                <input
                  id="custom-filename-input"
                  type="text"
                  placeholder="E.g., NDA_Draft.txt"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-[#E2E8F0] rounded-lg tracking-normal placeholder-[#737686]/60 focus:outline-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            )}
            <textarea
              id="pasted-content-textarea"
              rows={8}
              placeholder="Paste details of the agreement clauses here for rigorous AI evaluation..."
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                setSelectedFiles([]);
              }}
              className="w-full text-xs p-3 font-mono leading-relaxed bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl placeholder-[#737686]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 bg-white"
            />
          </div>

          {errorText && (
            <div id="upload-error-indicator" className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Trigger Audit Actions */}
          <button
            id="trigger-audit-btn"
            disabled={isAnalyzing}
            onClick={handleSubmitAnalysis}
            className={`w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isAnalyzing 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[#2563EB]/10'
            }`}
          >
            <Sparkles className="w-4 h-4 cursor-pointer" />
            <span>
              {isAnalyzing
                ? 'Compliance Assessment Active...'
                : selectedFiles.length > 1
                  ? `Initiate Audit for ${selectedFiles.length} Files`
                  : 'Initiate Automated Compliance Audit'}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Helper/Tester Side info panel */}
      <div id="upload-advisory-column" className="space-y-6">
        {/* Sample Load Container */}
        <div id="sample-picker-card" className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#191B23] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              Instant Sandbox sandbox
            </h3>
            <p className="text-xs text-[#737686] mt-1 font-medium leading-relaxed">
              Don&apos;t have a contract document ready? Initialize our high-fidelity legal templates to review compliance immediately.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              id="btn-sample-employment"
              onClick={() => loadSample('employment')}
              className="w-full p-4 text-left border border-[#C3C6D7] hover:border-[#2563EB] bg-slate-50/60 hover:bg-[#EBF2FE]/20 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-extrabold text-[#191B23]">Predatory Employment Sample</h4>
                <p className="text-[10px] text-[#737686] mt-0.5">High-Risk (extreme non-compete, broad IP transfer)</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737686] group-hover:text-[#2563EB] transition-transform" />
            </button>

            <button
              id="btn-sample-nda"
              onClick={() => loadSample('nda')}
              className="w-full p-4 text-left border border-[#C3C6D7] hover:border-[#2563EB] bg-slate-50/60 hover:bg-[#EBF2FE]/20 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-extrabold text-[#191B23]">Bilateral Mutual NDA Sample</h4>
                <p className="text-[10px] text-[#737686] mt-0.5">Low-Risk (balanced confidential marking, mutual caps)</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737686] group-hover:text-[#2563EB] transition-transform" />
            </button>
          </div>
        </div>

        {/* Audit Progress Skeletons */}
        {isAnalyzing && (
          <div id="scanning-tracker-card" className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB] animate-spin" />
              <h3 className="text-xs font-extrabold text-[#191B23] uppercase tracking-wider">
                Auditing Pipeline
              </h3>
            </div>

            <div className="space-y-4 pt-1">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-green-150 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                  {activeStep > 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${activeStep >= 1 ? 'text-[#191B23]' : 'text-slate-400'}`}>
                    Segmenting Clauses Text
                  </h4>
                  <p className="text-[10px] text-[#737686] mt-0.5">Paraphrasing clauses and matching structural identifiers.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${activeStep >= 2 ? 'bg-green-150 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                  {activeStep > 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${activeStep >= 2 ? 'text-[#191B23]' : 'text-slate-400'}`}>
                    Backend AI Assessment
                  </h4>
                  <p className="text-[10px] text-[#737686] mt-0.5">Calculating risk parameters and writing redline alternatives.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${activeStep >= 3 ? 'bg-green-150 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                  {activeStep >= 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${activeStep >= 3 ? 'text-[#191B23]' : 'text-slate-400'}`}>
                    Assembling Risk Index
                  </h4>
                  <p className="text-[10px] text-[#737686] mt-0.5">Completing metadata tags and formatting statistics.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
