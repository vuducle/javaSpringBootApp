'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PATCHNOTES } from '@/lib/patchnotes';
import { Badge } from '@/components/ui/badge';

export function PatchnotesModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer hover:underline hover:text-primary transition-colors"
        title="Klick für Patchnotes"
      >
        v{PATCHNOTES[0].version}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              📋 Patchnotes
            </DialogTitle>
            <DialogDescription>
              Version History von NachweiseWelt
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {PATCHNOTES.map((patch, index) => (
              <div
                key={patch.version}
                className="border-l-2 border-primary pl-4 pb-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">
                    v{patch.version}
                  </h3>
                  {index === 0 && (
                    <Badge variant="default" className="text-xs">
                      Latest
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {new Date(patch.releaseDate).toLocaleDateString(
                      'de-DE'
                    )}
                  </span>
                </div>

                {patch.features && patch.features.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">
                      ✨ Features
                    </h4>
                    <ul className="space-y-1">
                      {patch.features.map((feature) => (
                        <li
                          key={feature}
                          className="text-sm text-foreground ml-4"
                        >
                          • {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {patch.improvements &&
                  patch.improvements.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                        ⚡ Improvements
                      </h4>
                      <ul className="space-y-1">
                        {patch.improvements.map((improvement) => (
                          <li
                            key={improvement}
                            className="text-sm text-foreground ml-4"
                          >
                            • {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {patch.bugfixes && patch.bugfixes.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-1">
                      🐛 Bugfixes
                    </h4>
                    <ul className="space-y-1">
                      {patch.bugfixes.map((bugfix) => (
                        <li
                          key={bugfix}
                          className="text-sm text-foreground ml-4"
                        >
                          • {bugfix}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
