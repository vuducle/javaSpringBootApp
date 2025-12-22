'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NachweisPDFPreviewProps {
  pdfUrl: string | null;
  loading: boolean;
  onDownload: () => void;
  onCreateNew: () => void;
}

export default function NachweisPDFPreview({
  pdfUrl,
  loading,
  onDownload,
  onCreateNew,
}: NachweisPDFPreviewProps) {
  return (
    <div className="lg:sticky lg:top-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">PDF Vorschau</CardTitle>
            <div className="flex gap-2">
              {pdfUrl && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onDownload}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    PDF herunterladen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCreateNew}
                  >
                    Neuer Nachweis
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pdfUrl ? (
            <div className="space-y-4">
              <iframe
                src={pdfUrl}
                className="w-full h-[calc(100vh-16rem)] border rounded-lg shadow-sm"
                title="PDF Preview"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="_0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500 text-center font-medium">
                Kein PDF vorhanden
              </p>
              <p className="text-gray-400 text-sm text-center mt-2">
                Erstellen Sie einen Nachweis,
                <br />
                um die Vorschau zu sehen
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
