import * as React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M23 25.3333H9C7.16433 25.3333 6 25.3333 6 23V9C6 7.16433 6 6 9 6H23C24.8357 6 26 6 26 9V23C26 24.8357 26 25.3333 23 25.3333Z"
        className="fill-primary"
      />
      <path
        d="M12.5 19.5L16 16L19.5 12.5"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 19.5L16 16L12.5 12.5"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
