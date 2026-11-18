import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { FileText, Loader2 } from 'lucide-react';
import type { TrackModuleTopic } from '../../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

interface EmbeddedPdfPresentationProps {
  pdfUrl: string;
  topics: TrackModuleTopic[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  startPage?: number;
  endPage?: number;
  onSlidesReady?: (pageCount: number) => void;
  onLoadError?: () => void;
  isLight?: boolean;
}

interface PdfSlideCanvasProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  displayIndex: number;
  totalPages: number;
  defaultAspectRatio: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  isLight?: boolean;
}

const PdfSlideCanvas: React.FC<PdfSlideCanvasProps> = ({
  pdfDoc,
  pageNumber,
  displayIndex,
  totalPages,
  defaultAspectRatio,
  scrollContainerRef,
  isLight = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(displayIndex <= 4);
  const [rendered, setRendered] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pageAspectRatio, setPageAspectRatio] = useState(defaultAspectRatio);

  // Lazy-activate slides near the viewport so multi-slide decks stay fast
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '900px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollContainerRef]);

  // Re-render sharply if pane width changes (e.g., entering/exiting fullscreen)
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    setContainerWidth(el.clientWidth);
    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = Math.round(entries[0]?.contentRect.width || 0);
      if (nextWidth > 0) {
        setContainerWidth((prev) => (Math.abs(prev - nextWidth) > 24 ? nextWidth : prev));
      }
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let cancelled = false;
    let renderTask: pdfjsLib.RenderTask | null = null;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const canvas = canvasRef.current;
        const container = wrapperRef.current;
        if (!canvas || !container) return;

        const baseViewport = page.getViewport({ scale: 1 });
        if (baseViewport.width > 0 && baseViewport.height > 0) {
          setPageAspectRatio(baseViewport.width / baseViewport.height);
        }
        const widthToUse = containerWidth || container.clientWidth || 1080;
        const cssScale = widthToUse / baseViewport.width;
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);

        const viewport = page.getViewport({ scale: cssScale * outputScale });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({
          canvas,
          canvasContext: ctx,
          viewport,
        });
        await renderTask.promise;
        if (!cancelled) {
          setRendered(true);
        }
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'name' in err &&
          err.name === 'RenderingCancelledException'
        ) {
          return;
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [isVisible, pdfDoc, pageNumber, containerWidth]);

  const isPortrait = pageAspectRatio < 1;

  return (
    <div
      ref={wrapperRef}
      style={{ aspectRatio: String(pageAspectRatio) }}
      className={`relative w-full ${isPortrait ? 'max-w-4xl mx-auto' : ''} rounded-lg overflow-hidden border ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-md'
          : 'bg-[#070b14] border-slate-800/80 shadow-lg'
      }`}
    >
      {!rendered && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs ${
            isLight ? 'text-slate-500' : 'text-slate-500'
          }`}
        >
          <Loader2 className={`w-5 h-5 animate-spin ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
          <span>Loading Slide {displayIndex} of {totalPages}...</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block ${rendered ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

export const EmbeddedPdfPresentation: React.FC<EmbeddedPdfPresentationProps> = ({
  pdfUrl,
  topics,
  scrollContainerRef,
  startPage,
  endPage,
  onSlidesReady,
  onLoadError,
  isLight = false,
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [defaultAspectRatio, setDefaultAspectRatio] = useState(16 / 9);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPdfDoc(null);
    setNumPages(0);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
    loadingTask.promise
      .then(async (doc) => {
        if (cancelled) {
          return;
        }
        const effectiveStart = Math.max(1, startPage ?? 1);
        const effectiveEnd = Math.min(doc.numPages, endPage ?? doc.numPages);
        const visibleCount = Math.max(0, effectiveEnd - effectiveStart + 1);
        try {
          const samplePage = await doc.getPage(effectiveStart);
          const vp = samplePage.getViewport({ scale: 1 });
          if (!cancelled && vp.width > 0 && vp.height > 0) {
            setDefaultAspectRatio(vp.width / vp.height);
          }
        } catch {
          // Keep fallback aspect ratio if sample page inspection fails
        }
        if (cancelled) {
          return;
        }
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        onSlidesReady?.(visibleCount);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load the presentation slides.');
          onLoadError?.();
        }
      });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, [pdfUrl, startPage, endPage]);

  const sortedTopicsWithPages = [...topics]
    .filter((t) => typeof t.startSlidePage === 'number')
    .sort((a, b) => (a.startSlidePage || 0) - (b.startSlidePage || 0));

  const getTopicForPage = (pageNum: number): TrackModuleTopic | undefined => {
    let matched: TrackModuleTopic | undefined;
    for (const topic of sortedTopicsWithPages) {
      if ((topic.startSlidePage || 0) <= pageNum) {
        matched = topic;
      }
    }
    return matched;
  };

  if (error) {
    return (
      <div
        className={`p-8 rounded-xl border text-center space-y-2 ${
          isLight ? 'bg-white border-red-200' : 'bg-[#0d1424] border-red-900/50'
        }`}
      >
        <FileText className={`w-8 h-8 mx-auto ${isLight ? 'text-red-500' : 'text-red-400'}`} />
        <p className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{error}</p>
      </div>
    );
  }

  if (!pdfDoc || numPages === 0) {
    return (
      <div
        className={`w-full min-h-[420px] rounded-xl border flex flex-col items-center justify-center gap-3 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-600 shadow-xs'
            : 'bg-[#0d1424] border-slate-800 text-slate-400'
        }`}
      >
        <Loader2 className={`w-6 h-6 animate-spin ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
        <span className="text-xs font-semibold">Loading presentation slides...</span>
      </div>
    );
  }

  const effectiveStart = Math.max(1, startPage ?? 1);
  const effectiveEnd = Math.min(numPages, endPage ?? numPages);
  const visibleCount = Math.max(0, effectiveEnd - effectiveStart + 1);
  const pages = Array.from({ length: visibleCount }, (_, idx) => effectiveStart + idx);

  return (
    <section className="w-full space-y-3 sm:space-y-4 [overflow-anchor:none]">
      {pages.map((pageNum, idx) => {
        const owningTopic = getTopicForPage(pageNum);
        const isTopicStart = owningTopic && owningTopic.startSlidePage === pageNum;

        return (
          <div
            key={pageNum}
            data-pdf-slide={pageNum}
            data-topic-id={owningTopic?.id}
            id={isTopicStart && owningTopic ? `topic-${owningTopic.id}` : undefined}
            className="w-full"
          >
            <PdfSlideCanvas
              pdfDoc={pdfDoc}
              pageNumber={pageNum}
              displayIndex={idx + 1}
              totalPages={visibleCount}
              defaultAspectRatio={defaultAspectRatio}
              scrollContainerRef={scrollContainerRef}
              isLight={isLight}
            />
          </div>
        );
      })}
    </section>
  );
};
