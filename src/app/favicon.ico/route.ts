const svg = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="#0f1115" />
  <circle cx="32" cy="32" r="18" fill="#f5c542" />
  <circle cx="32" cy="32" r="10" fill="#0f1115" />
  <circle cx="32" cy="32" r="4" fill="#f5c542" />
</svg>
`;

export function GET() {
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml"
    }
  });
}
