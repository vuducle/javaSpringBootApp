
import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from 'lucide-react';

type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className={cn('relative', className)}>
                <select
                    className={cn(
                        'flex h-10 w-full appearance-none rounded-md border border-input bg-transparent pl-3 pr-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        );
    }
);

NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
